import { useState, useEffect } from 'react';
import type { Movie, WatchlistItem } from '../types/movie';

const WATCHLIST_STORAGE_KEY = 'acm_movie_explorer_watchlist_v1';

/**
 * Validates whether an unknown value parsed from JSON matches the WatchlistItem structure.
 */
function isValidWatchlistItem(item: unknown): item is WatchlistItem {
  if (!item || typeof item !== 'object') return false;
  const candidate = item as Partial<WatchlistItem>;
  if (!candidate.movie || typeof candidate.movie !== 'object') return false;
  const movie = candidate.movie as Partial<Movie>;
  if (typeof movie.id !== 'string' || !movie.id) return false;
  if (typeof movie.title !== 'string') return false;
  if (typeof movie.year !== 'number') return false;
  if (typeof movie.posterUrl !== 'string') return false;
  if (candidate.status !== 'plan_to_watch' && candidate.status !== 'watched') return false;
  if (typeof candidate.addedAt !== 'number') return false;
  return true;
}

export function useWatchlist() {
  const [watchlist, setWatchlist] = useState<WatchlistItem[]>(() => {
    try {
      if (typeof window === 'undefined' || !window.localStorage) {
        return [];
      }
      const stored = localStorage.getItem(WATCHLIST_STORAGE_KEY);
      if (stored) {
        const parsed: unknown = JSON.parse(stored);
        if (Array.isArray(parsed)) {
          // Filter out malformed entries and deduplicate by movie.id
          const validItems = parsed.filter(isValidWatchlistItem);
          const seen = new Set<string>();
          return validItems.filter((item) => {
            if (seen.has(item.movie.id)) {
              return false;
            }
            seen.add(item.movie.id);
            return true;
          });
        }
      }
    } catch (err) {
      // Gracefully handle Storage quota exceeded, SecurityError, or JSON syntax errors
      console.warn('Unable to retrieve watchlist from localStorage; starting with an empty session watchlist.', err);
    }
    return [];
  });

  // Sync to localStorage on every change
  useEffect(() => {
    try {
      if (typeof window !== 'undefined' && window.localStorage) {
        localStorage.setItem(WATCHLIST_STORAGE_KEY, JSON.stringify(watchlist));
      }
    } catch (err) {
      // Allow app to continue functioning in-memory even if storage write fails
      console.warn('Unable to persist watchlist to localStorage. Changes will remain for current session only.', err);
    }
  }, [watchlist]);

  const addToWatchlist = (movie: Movie) => {
    setWatchlist((prev) => {
      // Prevent duplicates by checking movie id
      const exists = prev.some((item) => item.movie.id === movie.id);
      if (exists) {
        return prev;
      }
      const newItem: WatchlistItem = {
        movie,
        status: 'plan_to_watch',
        addedAt: Date.now()
      };
      return [newItem, ...prev];
    });
  };

  const removeFromWatchlist = (movieId: string) => {
    setWatchlist((prev) => prev.filter((item) => item.movie.id !== movieId));
  };

  const toggleWatchlistStatus = (movieId: string) => {
    setWatchlist((prev) =>
      prev.map((item) => {
        if (item.movie.id === movieId) {
          const nextStatus = item.status === 'plan_to_watch' ? 'watched' : 'plan_to_watch';
          return { ...item, status: nextStatus };
        }
        return item;
      })
    );
  };

  const clearWatchlist = () => {
    setWatchlist([]);
  };

  const isInWatchlist = (movieId: string) => {
    return watchlist.some((item) => item.movie.id === movieId);
  };

  return {
    watchlist,
    addToWatchlist,
    removeFromWatchlist,
    toggleWatchlistStatus,
    clearWatchlist,
    isInWatchlist
  };
}

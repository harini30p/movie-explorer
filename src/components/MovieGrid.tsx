import React from 'react';
import type { Movie } from '../types/movie';
import { MovieCard } from './MovieCard';

interface MovieGridProps {
  movies: Movie[];
  watchlistMovieIds: Set<string>;
  onAddToWatchlist: (movie: Movie) => void;
  onSelectMovie?: (movie: Movie) => void;
  searchQuery: string;
  isLoading: boolean;
  errorMessage: string | null;
  onRetry?: () => void;
  hasMore?: boolean;
  isLoadingMore?: boolean;
  onLoadMore?: () => void;
  loadMoreError?: string | null;
  isSearchActive?: boolean;
}

export const MovieGrid: React.FC<MovieGridProps> = ({
  movies,
  watchlistMovieIds,
  onAddToWatchlist,
  onSelectMovie,
  searchQuery,
  isLoading,
  errorMessage,
  onRetry,
  hasMore = false,
  isLoadingMore = false,
  onLoadMore,
  loadMoreError = null,
  isSearchActive = false
}) => {
  const sentinelRef = React.useRef<HTMLDivElement>(null);

  // Attach IntersectionObserver to sentinel element when there are more results to load
  React.useEffect(() => {
    // Only observe when there's more to load, not currently loading more, no active load-more error, and a callback is provided
    if (!hasMore || isLoadingMore || !onLoadMore || loadMoreError) {
      return;
    }

    const sentinelNode = sentinelRef.current;
    if (!sentinelNode) return;

    const observer = new IntersectionObserver(
      (entries) => {
        const [entry] = entries;
        if (entry.isIntersecting) {
          onLoadMore();
        }
      },
      {
        root: null,
        rootMargin: '200px', // Pre-fetch slightly before the user hits the exact bottom
        threshold: 0.1
      }
    );

    observer.observe(sentinelNode);

    return () => {
      observer.disconnect();
    };
  }, [hasMore, isLoadingMore, onLoadMore, loadMoreError]);

  // 1. Loading state
  if (isLoading) {
    return (
      <div className="state-container" role="status" aria-live="polite">
        <div className="spinner" aria-hidden="true"></div>
        <h3 className="state-title">Searching movies...</h3>
        <p className="state-description">
          Fetching results for &ldquo;<strong>{searchQuery}</strong>&rdquo; from OMDb.
        </p>
      </div>
    );
  }

  // 2. Error state (API key missing, network error, or OMDb specific error)
  if (errorMessage) {
    return (
      <div className="state-container state-container--error" role="alert">
        <div className="state-icon" aria-hidden="true">
          ⚠️
        </div>
        <h3 className="state-title">Unable to load movies</h3>
        <p className="state-description">{errorMessage}</p>
        {onRetry && (
          <button type="button" className="btn btn-primary btn-retry" onClick={onRetry}>
            🔄 Try Again
          </button>
        )}
      </div>
    );
  }

  // 3. Empty state (No movies returned for the search term)
  if (movies.length === 0) {
    return (
      <div className="state-container empty-state" role="status">
        <div className="empty-icon" aria-hidden="true">
          🔍
        </div>
        <h3 className="empty-title">No movies found</h3>
        <p className="empty-description">
          We couldn&apos;t find any movie matching &ldquo;<strong>{searchQuery}</strong>&rdquo;. Try searching for another keyword (e.g. Batman, Star Wars, Matrix) or clear the search.
        </p>
      </div>
    );
  }

  // 4. Results grid + infinite scroll sentinel & footer
  return (
    <div className="discovery-results-wrapper">
      <div className="movies-grid" role="region" aria-label="Movie search results">
        {movies.map((movie) => (
          <MovieCard
            key={movie.id}
            movie={movie}
            isInWatchlist={watchlistMovieIds.has(movie.id)}
            onAddToWatchlist={onAddToWatchlist}
            onSelectMovie={onSelectMovie}
          />
        ))}
      </div>

      {/* Infinite scrolling sentinel & status container */}
      {isSearchActive && (
        <div className="scroll-sentinel-container">
          {/* Target element observed by IntersectionObserver */}
          {hasMore && !loadMoreError && (
            <div ref={sentinelRef} className="scroll-sentinel" aria-hidden="true" />
          )}

          {/* Loading more indicator */}
          {isLoadingMore && (
            <div className="loading-more-indicator" role="status" aria-live="polite">
              <span className="spinner spinner-sm" aria-hidden="true"></span>
              <span>Loading more movies from OMDb...</span>
            </div>
          )}

          {/* Load-more error banner with retry */}
          {loadMoreError && (
            <div className="load-more-error-banner" role="alert">
              <span>⚠️ {loadMoreError}</span>
              {onLoadMore && (
                <button type="button" className="btn btn-sm btn-secondary" onClick={onLoadMore}>
                  🔄 Retry Loading More
                </button>
              )}
            </div>
          )}

          {/* End of results banner when all pages have loaded */}
          {!hasMore && movies.length > 0 && !isLoadingMore && (
            <div className="end-of-results-banner">
              <span>✨ You&apos;ve reached the end of the results.</span>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

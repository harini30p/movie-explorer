import { useState, useEffect, useMemo, useCallback } from 'react';
import { movieService } from './services/movieService';
import { useWatchlist } from './hooks/useWatchlist';
import { Header } from './components/Header';
import { SearchBar } from './components/SearchBar';
import { MovieGrid } from './components/MovieGrid';
import { Watchlist } from './components/Watchlist';
import { MovieDetailsModal } from './components/MovieDetailsModal';
import type { Movie } from './types/movie';
import './App.css';

export function App() {
  const [searchQuery, setSearchQuery] = useState('');
  const [movies, setMovies] = useState<Movie[]>(() => movieService.getAllMovies());
  const [isLoading, setIsLoading] = useState(false);
  const [isDebouncing, setIsDebouncing] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [selectedMovie, setSelectedMovie] = useState<Movie | null>(null);

  // Pagination & infinite scroll states
  const [currentPage, setCurrentPage] = useState(1);
  const [totalResults, setTotalResults] = useState(0);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [loadMoreError, setLoadMoreError] = useState<string | null>(null);

  const {
    watchlist,
    addToWatchlist,
    removeFromWatchlist,
    toggleWatchlistStatus,
    clearWatchlist
  } = useWatchlist();

  // Active search check
  const isSearchActive = Boolean(searchQuery.trim());

  // Check if more movies can be loaded:
  // Infinite scroll only applies when a search query is active and loaded movies < totalResults
  const hasMore = isSearchActive && movies.length > 0 && movies.length < totalResults;

  // Asynchronous search effect: debounces 300ms and cancels stale in-flight requests
  useEffect(() => {
    const trimmed = searchQuery.trim();
    const abortController = new AbortController();

    const timerId = window.setTimeout(async () => {
      // Debounce delay has concluded
      setIsDebouncing(false);

      // Reset pagination state when the search executes
      setCurrentPage(1);
      setIsLoadingMore(false);
      setLoadMoreError(null);

      if (!trimmed) {
        setMovies(movieService.getAllMovies());
        setTotalResults(movieService.getAllMovies().length);
        setErrorMessage(null);
        setIsLoading(false);
        return;
      }

      setIsLoading(true);
      setErrorMessage(null);

      try {
        const result = await movieService.searchMovies(trimmed, 1, abortController.signal);
        setMovies(result.movies);
        setTotalResults(result.totalResults);
      } catch (err: unknown) {
        if (
          (err instanceof DOMException && err.name === 'AbortError') ||
          (err instanceof Error && err.name === 'AbortError')
        ) {
          // Request was aborted by a newer query or unmount; do nothing
          return;
        }

        if (err instanceof Error) {
          setErrorMessage(err.message);
        } else {
          setErrorMessage('An unexpected error occurred while fetching movies.');
        }
        setMovies([]);
        setTotalResults(0);
      } finally {
        if (!abortController.signal.aborted) {
          setIsLoading(false);
        }
      }
    }, trimmed ? 300 : 0);

    return () => {
      // 1. Reset/cancel pending debounce timer
      window.clearTimeout(timerId);
      // 2. Abort any active in-flight network request
      abortController.abort();
    };
  }, [searchQuery]);

  // Handler to load the next page of results
  const handleLoadMore = useCallback(async () => {
    const trimmed = searchQuery.trim();
    if (!trimmed || isLoading || isLoadingMore || !hasMore) {
      return;
    }

    const nextPage = currentPage + 1;
    setIsLoadingMore(true);
    setLoadMoreError(null);

    try {
      const result = await movieService.searchMovies(trimmed, nextPage);
      // Append results preventing duplicates by imdbID
      setMovies((prevMovies) => {
        const existingIds = new Set(prevMovies.map((m) => m.id));
        const newUniqueMovies = result.movies.filter((m) => !existingIds.has(m.id));
        return [...prevMovies, ...newUniqueMovies];
      });
      setCurrentPage(nextPage);
      if (result.totalResults > 0) {
        setTotalResults(result.totalResults);
      }
    } catch (err: unknown) {
      if (
        (err instanceof DOMException && err.name === 'AbortError') ||
        (err instanceof Error && err.name === 'AbortError')
      ) {
        return;
      }
      if (err instanceof Error) {
        setLoadMoreError(err.message);
      } else {
        setLoadMoreError('Failed to load more movies. Please try again.');
      }
    } finally {
      setIsLoadingMore(false);
    }
  }, [searchQuery, isLoading, isLoadingMore, hasMore, currentPage]);

  const handleRetry = useCallback(() => {
    const trimmed = searchQuery.trim();
    if (!trimmed) {
      setMovies(movieService.getAllMovies());
      setTotalResults(movieService.getAllMovies().length);
      setErrorMessage(null);
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    setErrorMessage(null);
    movieService
      .searchMovies(trimmed, 1)
      .then((result) => {
        setMovies(result.movies);
        setTotalResults(result.totalResults);
        setCurrentPage(1);
      })
      .catch((err: unknown) => {
        if (
          (err instanceof DOMException && err.name === 'AbortError') ||
          (err instanceof Error && err.name === 'AbortError')
        ) {
          return;
        }
        if (err instanceof Error) {
          setErrorMessage(err.message);
        } else {
          setErrorMessage('An unexpected error occurred while fetching movies.');
        }
        setMovies([]);
        setTotalResults(0);
      })
      .finally(() => {
        setIsLoading(false);
      });
  }, [searchQuery]);

  const totalMovies = useMemo(() => {
    return movieService.getAllMovies().length;
  }, []);

  // Quick lookup set for movie IDs currently in watchlist
  const watchlistMovieIds = useMemo(() => {
    return new Set(watchlist.map((item) => item.movie.id));
  }, [watchlist]);

  const handleSearchChange = useCallback((newQuery: string) => {
    setSearchQuery(newQuery);
    setIsDebouncing(Boolean(newQuery.trim()));
  }, []);

  return (
    <div className="app-layout">
      <Header
        watchlistCount={watchlist.length}
        totalMoviesCount={totalMovies}
      />

      <main className="main-content">
        {/* Search & Discovery Controls */}
        <section className="discovery-header" aria-labelledby="discovery-heading">
          <div className="section-title-row">
            <h2 id="discovery-heading" className="section-title">
              Explore Movies
            </h2>
            <span className="section-tagline">
              {searchQuery ? 'Live search results from OMDb' : 'Browse collection or search by title'}
            </span>
          </div>

          <SearchBar
            searchQuery={searchQuery}
            onSearchChange={handleSearchChange}
            resultCount={movies.length}
            totalResults={totalResults}
            isSearchActive={isSearchActive}
            isDebouncing={isDebouncing}
            isLoading={isLoading}
          />
        </section>

        {/* Movie Results Grid */}
        <section className="discovery-section">
          <MovieGrid
            movies={movies}
            watchlistMovieIds={watchlistMovieIds}
            onAddToWatchlist={addToWatchlist}
            onSelectMovie={setSelectedMovie}
            searchQuery={searchQuery}
            isLoading={isLoading}
            errorMessage={errorMessage}
            onRetry={handleRetry}
            hasMore={hasMore}
            isLoadingMore={isLoadingMore}
            onLoadMore={handleLoadMore}
            loadMoreError={loadMoreError}
            isSearchActive={isSearchActive}
          />
        </section>

        {/* Watchlist Section */}
        <Watchlist
          items={watchlist}
          onRemove={removeFromWatchlist}
          onToggleStatus={toggleWatchlistStatus}
          onClearWatchlist={clearWatchlist}
          onSelectMovie={setSelectedMovie}
        />
      </main>

      {/* Movie Details Modal */}
      <MovieDetailsModal
        movie={selectedMovie}
        isOpen={Boolean(selectedMovie)}
        isInWatchlist={Boolean(selectedMovie && watchlistMovieIds.has(selectedMovie.id))}
        onClose={() => setSelectedMovie(null)}
        onAddToWatchlist={addToWatchlist}
        onRemoveFromWatchlist={removeFromWatchlist}
      />

      <footer className="app-footer">
        <p>CineScope • Powered by OMDb API</p>
      </footer>
    </div>
  );
}

export default App;

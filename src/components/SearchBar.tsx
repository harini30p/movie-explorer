import React from 'react';

interface SearchBarProps {
  searchQuery: string;
  onSearchChange: (query: string) => void;
  resultCount: number;
  totalResults?: number;
  isSearchActive?: boolean;
  isDebouncing?: boolean;
  isLoading?: boolean;
}

export const SearchBar: React.FC<SearchBarProps> = ({
  searchQuery,
  onSearchChange,
  resultCount,
  totalResults = 0,
  isSearchActive = false,
  isDebouncing = false,
  isLoading = false
}) => {
  const renderResultText = () => {
    // 1. Actively fetching from OMDb API
    if (isLoading) {
      return 'Searching OMDb...';
    }

    // 2. User is typing within the 300ms debounce delay
    if (isDebouncing) {
      return (
        <span className="debouncing-status">
          Preparing search...
        </span>
      );
    }

    // Home / idle browsing view (sample movies collection)
    if (!isSearchActive) {
      return (
        <>
          Showing <strong>{resultCount}</strong> curated {resultCount === 1 ? 'movie' : 'movies'}
        </>
      );
    }

    // Active search with 0 matches
    if (resultCount === 0) {
      return 'No movies found';
    }

    // Active search where total OMDb matches exceed currently loaded movies
    if (totalResults > resultCount) {
      return (
        <>
          Showing <strong>{resultCount}</strong> of <strong>{totalResults}</strong> movies
        </>
      );
    }

    // Active search with all results loaded
    return (
      <>
        Showing <strong>{resultCount}</strong> {resultCount === 1 ? 'movie' : 'movies'}
      </>
    );
  };

  return (
    <div className="search-section">
      <div className="search-wrapper">
        <label htmlFor="movie-search-input" className="sr-only">
          Search movies by title
        </label>
        <span className="search-icon" aria-hidden="true">
          {isLoading || isDebouncing ? '⏳' : '🔍'}
        </span>
        <input
          id="movie-search-input"
          type="search"
          className="search-input"
          placeholder="Search movies by title (e.g. Batman, Inception, Dune, Avatar)..."
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
          autoComplete="off"
        />
        {searchQuery && (
          <button
            type="button"
            className="clear-search-btn"
            onClick={() => onSearchChange('')}
            aria-label="Clear search input"
          >
            ✕
          </button>
        )}
      </div>
      <div className="search-meta">
        <span className="result-count" aria-live="polite">
          {renderResultText()}
        </span>
      </div>
    </div>
  );
};

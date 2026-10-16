import React from 'react';

interface SearchBarProps {
  searchQuery: string;
  onSearchChange: (query: string) => void;
  resultCount: number;
  isLoading?: boolean;
}

export const SearchBar: React.FC<SearchBarProps> = ({
  searchQuery,
  onSearchChange,
  resultCount,
  isLoading = false
}) => {
  return (
    <div className="search-section">
      <div className="search-wrapper">
        <label htmlFor="movie-search-input" className="sr-only">
          Search movies by title
        </label>
        <span className="search-icon" aria-hidden="true">
          {isLoading ? '⏳' : '🔍'}
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
          {isLoading ? (
            'Searching OMDb...'
          ) : (
            <>
              Showing <strong>{resultCount}</strong> {resultCount === 1 ? 'movie' : 'movies'}
            </>
          )}
        </span>
      </div>
    </div>
  );
};

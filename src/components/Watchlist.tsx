import React, { useState } from 'react';
import type { Movie, WatchlistItem, WatchlistStatus } from '../types/movie';

interface WatchlistProps {
  items: WatchlistItem[];
  onRemove: (movieId: string) => void;
  onToggleStatus: (movieId: string) => void;
  onClearWatchlist: () => void;
  onSelectMovie?: (movie: Movie) => void;
}

export const Watchlist: React.FC<WatchlistProps> = ({
  items,
  onRemove,
  onToggleStatus,
  onClearWatchlist,
  onSelectMovie
}) => {
  const [filter, setFilter] = useState<'all' | WatchlistStatus>('all');
  const [imgErrors, setImgErrors] = useState<Record<string, boolean>>({});

  const handleImageError = (movieId: string) => {
    setImgErrors((prev) => ({ ...prev, [movieId]: true }));
  };

  const filteredItems = items.filter((item) => {
    if (filter === 'all') return true;
    return item.status === filter;
  });

  const planCount = items.filter((i) => i.status === 'plan_to_watch').length;
  const watchedCount = items.filter((i) => i.status === 'watched').length;

  return (
    <section id="watchlist-section" className="watchlist-section" aria-labelledby="watchlist-heading">
      <div className="watchlist-header">
        <div className="watchlist-title-wrapper">
          <h2 id="watchlist-heading" className="section-title">
            Your Watchlist
          </h2>
          <span className="watchlist-badge">{items.length}</span>
        </div>

        {items.length > 0 && (
          <div className="watchlist-controls">
            <div className="filter-button-group" role="group" aria-label="Filter watchlist by status">
              <button
                type="button"
                className={`filter-btn ${filter === 'all' ? 'active' : ''}`}
                onClick={() => setFilter('all')}
              >
                All ({items.length})
              </button>
              <button
                type="button"
                className={`filter-btn ${filter === 'plan_to_watch' ? 'active' : ''}`}
                onClick={() => setFilter('plan_to_watch')}
              >
                Plan to Watch ({planCount})
              </button>
              <button
                type="button"
                className={`filter-btn ${filter === 'watched' ? 'active' : ''}`}
                onClick={() => setFilter('watched')}
              >
                Watched ({watchedCount})
              </button>
            </div>

            <button
              type="button"
              className="btn btn-outline-danger btn-sm"
              onClick={onClearWatchlist}
              title="Remove all movies from watchlist"
              aria-label="Clear all items from watchlist"
            >
              Clear All
            </button>
          </div>
        )}
      </div>

      {items.length === 0 ? (
        <div className="empty-state empty-state--watchlist" role="status">
          <div className="empty-icon" aria-hidden="true">
            🍿
          </div>
          <h3 className="empty-title">Your watchlist is empty</h3>
          <p className="empty-description">
            Explore the movies above and click <strong>&ldquo;+ Add to Watchlist&rdquo;</strong> to start curating your must-watch collection!
          </p>
        </div>
      ) : filteredItems.length === 0 ? (
        <div className="empty-state empty-state--compact" role="status">
          <p className="empty-description">
            No movies in this category ({filter === 'watched' ? 'Watched' : 'Plan to Watch'}).
          </p>
        </div>
      ) : (
        <div className="watchlist-grid" role="list">
          {filteredItems.map(({ movie, status }) => (
            <div
              key={movie.id}
              className={`watchlist-item-card ${status === 'watched' ? 'watchlist-item--watched' : ''}`}
              role="listitem"
            >
              <div
                className={`watchlist-item-poster ${onSelectMovie ? 'clickable-poster' : ''}`}
                onClick={() => onSelectMovie?.(movie)}
                role={onSelectMovie ? 'button' : undefined}
                tabIndex={onSelectMovie ? 0 : undefined}
                onKeyDown={(e) => {
                  if ((e.key === 'Enter' || e.key === ' ') && onSelectMovie) {
                    e.preventDefault();
                    onSelectMovie(movie);
                  }
                }}
                aria-label={onSelectMovie ? `View details for ${movie.title}` : undefined}
              >
                {movie.posterUrl && movie.posterUrl !== 'N/A' && !imgErrors[movie.id] ? (
                  <img
                    src={movie.posterUrl}
                    alt={movie.title}
                    onError={() => handleImageError(movie.id)}
                  />
                ) : (
                  <div className="poster-fallback-small">🎬</div>
                )}
              </div>

              <div className="watchlist-item-details">
                <div className="watchlist-item-top">
                  <div>
                    <h4
                      className={`watchlist-item-title ${onSelectMovie ? 'clickable-title' : ''}`}
                      onClick={() => onSelectMovie?.(movie)}
                      role={onSelectMovie ? 'button' : undefined}
                      tabIndex={onSelectMovie ? 0 : undefined}
                      onKeyDown={(e) => {
                        if ((e.key === 'Enter' || e.key === ' ') && onSelectMovie) {
                          e.preventDefault();
                          onSelectMovie(movie);
                        }
                      }}
                      title={movie.title}
                    >
                      {movie.title}
                    </h4>
                    <span className="watchlist-item-year">{movie.year}</span>
                  </div>
                  <span className={`status-tag status-tag--${status}`}>
                    {status === 'watched' ? '✓ Watched' : '⏳ Plan to Watch'}
                  </span>
                </div>

                <div className="watchlist-item-actions">
                  <button
                    type="button"
                    className={`btn btn-sm ${status === 'watched' ? 'btn-outline-status' : 'btn-success-status'}`}
                    onClick={() => onToggleStatus(movie.id)}
                    aria-label={`Mark ${movie.title} as ${status === 'watched' ? 'Plan to Watch' : 'Watched'}`}
                  >
                    {status === 'watched' ? '↺ Mark as Plan to Watch' : '✓ Mark as Watched'}
                  </button>

                  <button
                    type="button"
                    className="btn btn-sm btn-danger"
                    onClick={() => onRemove(movie.id)}
                    aria-label={`Remove ${movie.title} from watchlist`}
                  >
                    ✕ Remove
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </section>
  );
};

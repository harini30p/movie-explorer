import React, { useState } from 'react';
import type { Movie } from '../types/movie';

interface MovieCardProps {
  movie: Movie;
  isInWatchlist: boolean;
  onAddToWatchlist: (movie: Movie) => void;
  onSelectMovie?: (movie: Movie) => void;
}

export const MovieCard: React.FC<MovieCardProps> = ({
  movie,
  isInWatchlist,
  onAddToWatchlist,
  onSelectMovie
}) => {
  const [imgError, setImgError] = useState(false);

  // If posterUrl is missing, empty string, or "N/A", show fallback
  const hasValidPoster = Boolean(movie.posterUrl && movie.posterUrl.trim() !== '' && movie.posterUrl !== 'N/A' && !imgError);

  const handleCardClick = () => {
    if (onSelectMovie) {
      onSelectMovie(movie);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if ((e.key === 'Enter' || e.key === ' ') && onSelectMovie) {
      // Avoid triggering when space is pressed on a child button
      if ((e.target as HTMLElement).tagName !== 'BUTTON') {
        e.preventDefault();
        onSelectMovie(movie);
      }
    }
  };

  return (
    <article
      className="movie-card"
      data-movie-id={movie.id}
      onClick={handleCardClick}
      onKeyDown={handleKeyDown}
      tabIndex={onSelectMovie ? 0 : undefined}
      role={onSelectMovie ? 'button' : undefined}
      aria-label={onSelectMovie ? `View details for ${movie.title}` : undefined}
    >
      <div className="poster-wrapper">
        {hasValidPoster ? (
          <img
            src={movie.posterUrl}
            alt={`Poster for ${movie.title}`}
            className="movie-poster"
            loading="lazy"
            onError={() => setImgError(true)}
          />
        ) : (
          <div className="poster-fallback" role="img" aria-label={`Poster placeholder for ${movie.title}`}>
            <span className="fallback-icon">🎬</span>
            <span className="fallback-text">{movie.title}</span>
          </div>
        )}

        {typeof movie.rating === 'number' && (
          <div className="rating-badge" title={`Rating: ${movie.rating}/10`}>
            ⭐ {movie.rating.toFixed(1)}
          </div>
        )}
      </div>

      <div className="movie-card-content">
        <div className="movie-header-info">
          <h3 className="movie-title" title={movie.title}>
            {movie.title}
          </h3>
          {movie.year > 0 && <span className="movie-year">{movie.year}</span>}
        </div>

        {movie.genre && movie.genre.length > 0 && (
          <div className="movie-genres">
            {movie.genre.map((g) => (
              <span key={g} className="genre-tag">
                {g}
              </span>
            ))}
          </div>
        )}

        {movie.overview && (
          <p className="movie-overview">
            {movie.overview}
          </p>
        )}

        <div className="movie-card-actions">
          <button
            type="button"
            className={`btn ${isInWatchlist ? 'btn-secondary btn-disabled' : 'btn-primary'}`}
            onClick={(e) => {
              e.stopPropagation();
              onAddToWatchlist(movie);
            }}
            disabled={isInWatchlist}
            aria-label={
              isInWatchlist
                ? `${movie.title} is already in your watchlist`
                : `Add ${movie.title} to watchlist`
            }
          >
            {isInWatchlist ? '✓ In Watchlist' : '+ Add to Watchlist'}
          </button>
        </div>
      </div>
    </article>
  );
};

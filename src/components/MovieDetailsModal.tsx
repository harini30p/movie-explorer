import React, { useEffect, useRef, useState } from 'react';
import type { Movie, MovieDetail } from '../types/movie';
import { movieService } from '../services/movieService';

interface MovieDetailsModalProps {
  movie: Movie | null;
  isOpen: boolean;
  isInWatchlist: boolean;
  onClose: () => void;
  onAddToWatchlist: (movie: Movie) => void;
  onRemoveFromWatchlist?: (movieId: string) => void;
}

export const MovieDetailsModal: React.FC<MovieDetailsModalProps> = ({
  movie,
  isOpen,
  isInWatchlist,
  onClose,
  onAddToWatchlist,
  onRemoveFromWatchlist
}) => {
  const [fetchedDetail, setFetchedDetail] = useState<MovieDetail | null>(null);
  const [isFetching, setIsFetching] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [imgError, setImgError] = useState(false);

  const closeButtonRef = useRef<HTMLButtonElement>(null);
  const modalContentRef = useRef<HTMLDivElement>(null);

  // Fetch full details whenever the selected movie changes
  useEffect(() => {
    if (!isOpen || !movie) {
      return;
    }

    const abortController = new AbortController();

    // Kick off async detail fetch
    movieService
      .getMovieDetails(movie.id, abortController.signal)
      .then((fullDetail) => {
        setFetchedDetail(fullDetail);
        setIsFetching(false);
      })
      .catch((err: unknown) => {
        if (
          (err instanceof DOMException && err.name === 'AbortError') ||
          (err instanceof Error && err.name === 'AbortError')
        ) {
          // Ignore cancellation
          return;
        }

        if (err instanceof Error) {
          setErrorMessage(err.message);
        } else {
          setErrorMessage('Failed to load movie details. Please try again.');
        }
        setIsFetching(false);
      });

    return () => {
      // Abort in-flight request when movie changes or modal closes
      abortController.abort();
    };
  }, [isOpen, movie]);

  const previousActiveElementRef = useRef<HTMLElement | null>(null);

  // Focus management: capture previous element, lock body scroll, focus close button, and restore focus on close
  useEffect(() => {
    if (isOpen) {
      // Record currently focused element before opening modal
      previousActiveElementRef.current = document.activeElement as HTMLElement | null;

      // Prevent body scrolling while modal is open
      const originalOverflow = document.body.style.overflow;
      document.body.style.overflow = 'hidden';

      const focusTimer = setTimeout(() => {
        closeButtonRef.current?.focus();
      }, 50);

      return () => {
        document.body.style.overflow = originalOverflow;
        clearTimeout(focusTimer);
        // Safely restore focus to previous trigger element on close
        previousActiveElementRef.current?.focus();
      };
    }
  }, [isOpen]);

  // Keyboard navigation: Escape key closes modal & Tab/Shift+Tab focus trap
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.preventDefault();
        onClose();
        return;
      }

      if (e.key === 'Tab') {
        const dialogNode = modalContentRef.current;
        if (!dialogNode) return;

        // Query all focusable interactive elements within the dialog
        const focusableElements = Array.from(
          dialogNode.querySelectorAll<HTMLElement>(
            'button:not([disabled]), [href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])'
          )
        ).filter((el) => el.offsetParent !== null); // Ensure element is visible

        if (focusableElements.length === 0) {
          e.preventDefault();
          return;
        }

        const firstElement = focusableElements[0];
        const lastElement = focusableElements[focusableElements.length - 1];

        // Shift + Tab: wrapping from first to last
        if (e.shiftKey) {
          if (document.activeElement === firstElement || !dialogNode.contains(document.activeElement)) {
            e.preventDefault();
            lastElement.focus();
          }
        } else {
          // Tab: wrapping from last to first
          if (document.activeElement === lastElement || !dialogNode.contains(document.activeElement)) {
            e.preventDefault();
            firstElement.focus();
          }
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, onClose]);

  if (!isOpen || !movie) {
    return null;
  }

  // Active data to display: prefer fetched full details if matching current movie, fall back to initial movie object
  const detailData: MovieDetail = (fetchedDetail && fetchedDetail.id === movie.id)
    ? fetchedDetail
    : { ...movie };
  const isLoading = isFetching || (detailData.id !== fetchedDetail?.id);
  const posterUrl = detailData.posterUrl;
  const hasValidPoster = Boolean(posterUrl && posterUrl.trim() !== '' && posterUrl !== 'N/A' && !imgError);

  const displayRating = detailData.imdbRating || (typeof detailData.rating === 'number' ? detailData.rating.toFixed(1) : null);
  const displayPlot = detailData.plot || detailData.overview;

  const handleRetry = () => {
    if (!movie) return;
    setIsFetching(true);
    setErrorMessage(null);
    movieService
      .getMovieDetails(movie.id)
      .then((res) => {
        setFetchedDetail(res);
        setIsFetching(false);
      })
      .catch((err: unknown) => {
        if (err instanceof Error) {
          setErrorMessage(err.message);
        } else {
          setErrorMessage('Failed to load movie details.');
        }
        setIsFetching(false);
      });
  };

  return (
    <div
      className="modal-backdrop"
      onClick={onClose}
      role="presentation"
    >
      <div
        ref={modalContentRef}
        className="modal-dialog"
        role="dialog"
        aria-modal="true"
        aria-labelledby="modal-movie-title"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header & Close Button */}
        <div className="modal-header">
          <div className="modal-header-meta">
            <span className="modal-badge">Movie Details</span>
            {detailData.rated && <span className="modal-tag">{detailData.rated}</span>}
          </div>
          <button
            ref={closeButtonRef}
            type="button"
            className="modal-close-btn"
            onClick={onClose}
            aria-label="Close details dialog"
          >
            ✕
          </button>
        </div>

        {/* Modal Content Body */}
        <div className="modal-body">
          {isLoading && !detailData.plot && (
            <div className="modal-loading-banner" role="status" aria-live="polite">
              <span className="spinner spinner-sm" aria-hidden="true"></span>
              <span>Loading complete information from OMDb...</span>
            </div>
          )}

          {errorMessage && (
            <div className="modal-error-banner" role="alert">
              <span>⚠️ {errorMessage}</span>
              <button type="button" className="btn btn-sm btn-secondary" onClick={handleRetry}>
                🔄 Retry
              </button>
            </div>
          )}

          <div className="modal-grid">
            {/* Left: Poster Column */}
            <div className="modal-poster-col">
              <div className="modal-poster-wrapper">
                {hasValidPoster ? (
                  <img
                    src={posterUrl}
                    alt={`Full poster for ${detailData.title}`}
                    className="modal-poster-img"
                    onError={() => setImgError(true)}
                  />
                ) : (
                  <div className="modal-poster-fallback" role="img" aria-label={`Poster placeholder for ${detailData.title}`}>
                    <span className="modal-fallback-icon">🎬</span>
                    <span className="modal-fallback-title">{detailData.title}</span>
                  </div>
                )}

                {displayRating && (
                  <div className="modal-rating-badge" title={`IMDb Rating: ${displayRating}/10`}>
                    ⭐ <strong>{displayRating}</strong> <span className="rating-sub">/10</span>
                  </div>
                )}
              </div>

              {/* Watchlist Action */}
              <div className="modal-actions">
                {isInWatchlist ? (
                  <div className="modal-watchlist-btn-group">
                    <button
                      type="button"
                      className="btn modal-watchlist-btn btn-secondary btn-disabled"
                      disabled
                      aria-label={`${detailData.title} is already in your watchlist`}
                    >
                      ✓ In Watchlist
                    </button>
                    {onRemoveFromWatchlist && (
                      <button
                        type="button"
                        className="btn btn-sm btn-outline-danger modal-remove-btn"
                        onClick={() => onRemoveFromWatchlist(movie.id)}
                        aria-label={`Remove ${detailData.title} from watchlist`}
                      >
                        ✕ Remove from Watchlist
                      </button>
                    )}
                  </div>
                ) : (
                  <button
                    type="button"
                    className="btn modal-watchlist-btn btn-primary"
                    onClick={() => onAddToWatchlist(movie)}
                    aria-label={`Add ${detailData.title} to watchlist`}
                  >
                    + Add to Watchlist
                  </button>
                )}
              </div>
            </div>

            {/* Right: Info Column */}
            <div className="modal-info-col">
              <div className="modal-title-group">
                <h2 id="modal-movie-title" className="modal-title">
                  {detailData.title}
                </h2>
                <div className="modal-key-meta">
                  {detailData.year > 0 && <span className="meta-pill">{detailData.year}</span>}
                  {detailData.runtime && <span className="meta-pill">⏱️ {detailData.runtime}</span>}
                  {detailData.released && <span className="meta-pill">📅 {detailData.released}</span>}
                </div>
              </div>

              {/* Genre Pills */}
              {detailData.genre && detailData.genre.length > 0 && (
                <div className="modal-genres">
                  {detailData.genre.map((g) => (
                    <span key={g} className="genre-tag modal-genre-tag">
                      {g}
                    </span>
                  ))}
                </div>
              )}

              {/* Plot Synopsis */}
              <div className="modal-section">
                <h3 className="modal-section-heading">Synopsis</h3>
                <p className="modal-plot">
                  {displayPlot || 'Full plot synopsis is not currently available for this title.'}
                </p>
              </div>

              {/* Cast & Crew Details */}
              <div className="modal-section modal-credits">
                {detailData.director && (
                  <div className="credit-row">
                    <span className="credit-label">Director:</span>
                    <span className="credit-value">{detailData.director}</span>
                  </div>
                )}

                {detailData.writer && (
                  <div className="credit-row">
                    <span className="credit-label">Writers:</span>
                    <span className="credit-value">{detailData.writer}</span>
                  </div>
                )}

                {detailData.actors && (
                  <div className="credit-row">
                    <span className="credit-label">Cast:</span>
                    <span className="credit-value">{detailData.actors}</span>
                  </div>
                )}

                {detailData.awards && (
                  <div className="credit-row">
                    <span className="credit-label">Awards:</span>
                    <span className="credit-value">{detailData.awards}</span>
                  </div>
                )}

                {detailData.boxOffice && (
                  <div className="credit-row">
                    <span className="credit-label">Box Office:</span>
                    <span className="credit-value">{detailData.boxOffice}</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

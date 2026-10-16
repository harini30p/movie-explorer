import React from 'react';

interface HeaderProps {
  watchlistCount: number;
  totalMoviesCount: number;
}

export const Header: React.FC<HeaderProps> = ({ watchlistCount, totalMoviesCount }) => {
  return (
    <header className="app-header">
      <div className="header-container">
        <div className="brand-group">
          <div className="brand-icon" aria-hidden="true">
            🎬
          </div>
          <div>
            <h1 className="app-title">CineScope</h1>
            <p className="app-subtitle">Discover movies and curate your personalized watchlist</p>
          </div>
        </div>

        <div className="header-stats" aria-label="Overview statistics">
          <div className="stat-pill">
            <span className="stat-label">Available:</span>
            <span className="stat-value">{totalMoviesCount}</span>
          </div>
          <a href="#watchlist-section" className="stat-pill stat-pill--highlight" aria-label="Jump to Watchlist">
            <span className="stat-label">In Watchlist:</span>
            <span className="stat-value">{watchlistCount}</span>
          </a>
        </div>
      </div>
    </header>
  );
};

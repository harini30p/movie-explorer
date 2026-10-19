# CineScope — Movie Explorer & Watchlist

CineScope is a modern, responsive web application designed for discovering movies and curating a personalized watchlist. Powered by the OMDb API, CineScope allows film enthusiasts to search across thousands of titles, browse comprehensive movie metadata in an accessible modal dialog, and organize their watchlists with persistent session tracking.

**Live Demo:** [https://movie-explorer-murex-two.vercel.app/](https://movie-explorer-murex-two.vercel.app/)

---

## Features

- **Curated Home Movie Collection**: Immediately showcases eight curated titles on load with ratings, genres, and overviews without requiring an upfront search.
- **Live Movie Search via OMDb API**: Search by movie title across the extensive OMDb database with debouncing (300 ms) and request cancellation (`AbortController`).
- **Loaded-vs-Total Result Metrics**: Distinguishes currently loaded movies from total matching records returned by OMDb (e.g. *"Showing 10 of 482 movies"*).
- **Infinite Scrolling with Duplicate Guards**: Automatically fetches and appends subsequent pages of search results as the user scrolls near the bottom, strictly scoped to active search queries and deduplicated by IMDb ID.
- **Comprehensive Movie Details Modal**: Deep-dive into plot synopses, director, writers, ensemble cast, genre badges, runtime, release date, and IMDb ratings with full keyboard focus trapping, `Escape` key close, and focus restoration to the opening trigger.
- **Interactive Watchlist Management**: Add or remove movies directly from cards or inside the details modal with instant cross-view synchronization.
- **Watchlist Status Tracking**: Organize saved movies with **Plan to Watch** and **Watched** status toggles.
- **Category Filters**: Filter watchlist items by **All Movies**, **Plan to Watch**, and **Watched**, complete with real-time count badges and category-specific empty states.
- **Watchlist Progress Dashboard**: Live progress summary displaying Total Movies, Plan to Watch, Watched, and Completion Percentage with a visual progress bar and safe zero-division handling.
- **Duplicate Entry Prevention**: Guaranteed single-entry uniqueness across all watchlist addition points using stable IMDb IDs.
- **Resilient Persistence**: Saves watchlist data to browser `localStorage` with runtime type-guard validation, corrupt-JSON recovery, and graceful fallback to an in-memory session if storage is unavailable.
- **State Handling & Fallbacks**: Dedicated feedback states for initial loading, load-more pagination, empty search results, service errors with retry buttons, and poster image placeholders.
- **Responsive Dark Design**: Tailored visual hierarchy with CSS custom properties, glassmorphism accents, and mobile-friendly layouts.

---

## Technology Stack

- **Framework**: [React](https://react.dev/) (v19)
- **Language**: [TypeScript](https://www.typescriptlang.org/) (Strict typing, zero `any`)
- **Build Tool & Dev Server**: [Vite](https://vitejs.dev/)
- **Styling**: Vanilla CSS with modern custom properties and fluid layouts
- **Data Source**: [OMDb API](https://www.omdbapi.com/)

---

## Prerequisites

Ensure you have the following installed on your machine:

- **Node.js**: `v18.0.0` or higher
- **npm**: `v9.0.0` or higher (bundled with Node.js)
- A free or patron API key from the [OMDb API](https://www.omdbapi.com/apikey.aspx)

---

## Getting Started

1. **Clone the repository**:
   ```bash
   git clone https://github.com/harini30p/movie-explorer.git
   cd movie-explorer
   ```

2. **Install project dependencies**:
   ```bash
   npm install
   ```

3. **Obtain an OMDb API Key**:
   - Visit [omdbapi.com/apikey.aspx](https://www.omdbapi.com/apikey.aspx).
   - Select the **FREE (1,000 daily requests)** option.
   - Enter your email address and verify the verification link sent to your inbox to activate your personal key.

4. **Configure your environment variables**:
   - Copy the provided template:
     ```bash
     cp .env.example .env.local
     ```
   - Open `.env.local` and paste your key:
     ```env
     VITE_OMDB_API_KEY=your_api_key_here
     ```

5. **Start the local development server**:
   ```bash
   npm run dev
   ```
   Open your browser and navigate to the local URL displayed in the terminal (typically `http://localhost:5173`).

---

## Available Scripts

In the project directory, you can run:

- **`npm run dev`**: Starts the Vite development server with hot module replacement (HMR).
- **`npm run build`**: Runs TypeScript compilation (`tsc -b`) followed by the production Vite build (`vite build`), outputting optimized static assets to `dist/`.
- **`npm run lint`**: Executes ESLint across all TypeScript and React files.
- **`npm run preview`**: Locally serves the production bundle generated in `dist/`.

---

## Project Architecture

```
movie-explorer/
├── public/                     # Static assets (favicons, etc.)
├── src/
│   ├── components/             # Reusable presentation and container components
│   │   ├── Header.tsx          # App branding, overview stats, and quick navigation links
│   │   ├── SearchBar.tsx       # Search input with live status indicator, result count, and clear button
│   │   ├── MovieGrid.tsx       # Results grid, loading states, and infinite-scroll sentinel
│   │   ├── MovieCard.tsx       # Movie card item with poster fallbacks and modal trigger
│   │   ├── MovieDetailsModal.tsx # Accessible dialog with focus trap, OMDb plot, cast, and crew
│   │   └── Watchlist.tsx       # Watchlist section, status filters, progress dashboard, and item cards
│   ├── data/
│   │   └── sampleMovies.ts     # Initial curated movie collection shown on home screen
│   ├── hooks/
│   │   └── useWatchlist.ts     # Encapsulated state, duplicate guards, and localStorage sync
│   ├── services/
│   │   └── movieService.ts     # OMDb API integration, pagination, data mapping, and cancellation
│   ├── types/
│   │   └── movie.ts            # Strongly typed interfaces for Movie, MovieDetail, and API payloads
│   ├── App.tsx                 # Root coordinator managing query state, debounce, and modal selection
│   ├── App.css                 # Component and layout stylesheets
│   ├── index.css               # Design system tokens, color palettes, and base resets
│   └── main.tsx                # React application entry point
├── .env.example                # Sample environment configuration template
├── .env.local                  # Local environment configuration (git-ignored)
├── index.html                  # HTML entry point and document metadata
├── package.json                # Project dependencies and npm scripts
└── tsconfig.json               # TypeScript configuration
```

---

## State Management and Data Flow

1. **Search & Debouncing**:
   - As the user types into `<SearchBar>`, `searchQuery` updates immediately in `<App>`.
   - A `useEffect` hook sets a `300ms` debounce timer via `window.setTimeout`.
   - If the user types another character before 300 ms elapse, the effect's cleanup clears the pending timeout.
   - When the user stops typing for 300 ms, the timer expires and calls `movieService.searchMovies`.

2. **Request Cancellation & Race Prevention**:
   - Each search run instantiates an `AbortController`.
   - Its `AbortSignal` is passed to the native `fetch` request in `movieService.ts`.
   - If the query changes or the component unmounts while a request is in flight, the previous controller is aborted.
   - Any `AbortError` is caught and ignored gracefully so cancellation never produces flash errors.

3. **Infinite Scrolling (Pagination)**:
   - Initial search loads `page 1` and records `totalResults`.
   - A sentinel `<div ref={sentinelRef} />` at the base of the grid is observed by an `IntersectionObserver`.
   - When scrolled into view, `onLoadMore` triggers `page + 1`, appending new titles to `movies` without duplicates.
   - Infinite scrolling is strictly active only for non-empty search queries. When the search is cleared, the home collection of eight sample movies is restored.

4. **Watchlist State & Persistence**:
   - The custom hook `useWatchlist` maintains `watchlist` state as the single source of truth.
   - A synchronization effect saves changes to `localStorage` on every add, remove, or toggle.
   - A memoized `Set` of IDs (`watchlistMovieIds`) enables $O(1)$ lookups for in-watchlist badges across all views.
   - Filter views (**All Movies**, **Plan to Watch**, **Watched**) and the **Progress Summary Dashboard** are derived dynamically on render without duplicating state.

---

## Technical Challenges and Solutions

### 1. Stale Search Race Conditions
- **Challenge**: In fast networks or slow typing sequences, older search requests could complete after newer ones, overwriting newer results with stale data.
- **Solution**: Coupled React's `useEffect` cleanup with `AbortController`. Superseded requests are terminated immediately at the browser network layer, and aborted responses are dropped before updating component state.

### 2. Infinite-Scroll Duplicate Prevention
- **Challenge**: OMDb pagination occasionally shifts item boundaries between pages if database indices change, or fast scrolling could trigger multiple simultaneous page fetches.
- **Solution**: The pagination flow maintains `isLoadingMore` guards against duplicate simultaneous calls for the same page. When appending new results, incoming movies are filtered through a `Set` of existing IDs (`existingIds.has(m.id)`).

### 3. Accessible Dialog Focus Trapping
- **Challenge**: Keyboard navigation in modal dialogs can leak focus to background elements, violating accessibility standards.
- **Solution**: Implemented a bidirectional Tab key trap in `MovieDetailsModal.tsx` that wraps focus between the first and last focusable elements while recording and restoring previous focus to the trigger card upon closing.

### 4. Corrupt or Unavailable `localStorage`
- **Challenge**: In private browsing modes or locked-down browser environments, accessing `localStorage` throws runtime security or quota exceptions. Additionally, malformed JSON can break app initialization.
- **Solution**: `useWatchlist` implements defensive `try...catch` wrappers around all storage interactions, paired with a runtime type guard (`isValidWatchlistItem`). If saved data is corrupt or storage is unavailable, CineScope logs a warning and falls back to an in-memory session watchlist without interrupting the user.

---

## Deployment

CineScope can be deployed to any modern static hosting platform (Vercel, Netlify, Cloudflare Pages, etc.):

### Deploying to Vercel

1. Push your repository to GitHub.
2. Log in to [Vercel](https://vercel.com/) and click **"Add New Project"**.
3. Import your `movie-explorer` repository.
4. Under **Environment Variables**, add:
   - **Key**: `VITE_OMDB_API_KEY`
   - **Value**: `your_omdb_api_key`
5. Click **Deploy**. Vercel will run `npm run build` and publish your site.

### Deploying to Netlify

1. Log in to [Netlify](https://www.netlify.com/) and select **"Add new site" > "Import an existing project"**.
2. Select your GitHub repository.
3. Verify build settings:
   - **Build command**: `npm run build`
   - **Publish directory**: `dist`
4. Under **Site configuration > Environment variables**, add `VITE_OMDB_API_KEY`.
5. Click **Deploy CineScope** (or trigger a new deploy if added after creation).

---

## Security Note

In Vite applications, any environment variable prefixed with `VITE_` (such as `VITE_OMDB_API_KEY`) is embedded directly into the client-side JavaScript bundle during the build.

> **Important**: This means `VITE_OMDB_API_KEY` is readable in the browser's Network tab by anyone inspecting network requests. For client-side demo and assessment applications using free OMDb keys, this is expected behavior. Never reuse personal, sensitive, or billable API keys in client-side Vite variables. Never commit `.env.local` or raw API keys to public repositories.

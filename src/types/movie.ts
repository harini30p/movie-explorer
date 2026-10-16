export type WatchlistStatus = 'plan_to_watch' | 'watched';

export interface Movie {
  id: string;          // Maps to imdbID for OMDb results
  title: string;       // Maps to Title
  year: number;        // Parsed from Year (e.g., "2010" or "2010–2015")
  posterUrl: string;   // Maps to Poster ("N/A" mapped to empty string or fallback)
  genre?: string[];
  rating?: number;
  overview?: string;
}

export interface WatchlistItem {
  movie: Movie;
  status: WatchlistStatus;
  addedAt: number;
}

/**
 * Raw item returned by OMDb API in Search array
 */
export interface OmdbMovieItem {
  Title: string;
  Year: string;
  imdbID: string;
  Type: string;
  Poster: string;
}

/**
 * Successful OMDb title search response
 */
export interface OmdbSearchSuccessResponse {
  Response: 'True';
  Search: OmdbMovieItem[];
  totalResults: string;
}

/**
 * Error OMDb response (e.g., Movie not found, invalid API key)
 */
export interface OmdbSearchErrorResponse {
  Response: 'False';
  Error: string;
}

export interface MovieSearchResult {
  movies: Movie[];
  totalResults: number;
}

export type OmdbSearchResponse = OmdbSearchSuccessResponse | OmdbSearchErrorResponse;

/**
 * Raw detail response from OMDb API: ?i=<imdbID>&plot=full
 */
export interface OmdbMovieDetailResponse {
  Response: 'True' | 'False';
  Error?: string;
  Title?: string;
  Year?: string;
  Rated?: string;
  Released?: string;
  Runtime?: string;
  Genre?: string;
  Director?: string;
  Writer?: string;
  Actors?: string;
  Plot?: string;
  Language?: string;
  Country?: string;
  Awards?: string;
  Poster?: string;
  imdbRating?: string;
  imdbVotes?: string;
  imdbID?: string;
  Type?: string;
  BoxOffice?: string;
}

/**
 * Rich domain model for detailed movie view in modal
 */
export interface MovieDetail extends Movie {
  runtime?: string;
  director?: string;
  writer?: string;
  actors?: string;
  released?: string;
  imdbRating?: string;
  plot?: string;
  rated?: string;
  awards?: string;
  boxOffice?: string;
}

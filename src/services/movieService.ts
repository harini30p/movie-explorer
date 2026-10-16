import type {
  Movie,
  MovieDetail,
  MovieSearchResult,
  OmdbMovieItem,
  OmdbSearchResponse,
  OmdbMovieDetailResponse
} from '../types/movie';
import { SAMPLE_MOVIES } from '../data/sampleMovies';

const OMDB_BASE_URL = 'https://www.omdbapi.com/';

/**
 * Safely parses the OMDb Year field (e.g. "2010" or "2010–2015") into a number.
 */
function parseYear(yearStr: string): number {
  const match = yearStr.match(/\d{4}/);
  if (match) {
    const parsed = parseInt(match[0], 10);
    if (!isNaN(parsed)) return parsed;
  }
  return 0;
}

/**
 * Maps a single OMDb item to the application's Movie interface.
 * Handles "N/A" posters and missing properties safely.
 */
export function mapOmdbItemToMovie(item: OmdbMovieItem): Movie {
  return {
    id: item.imdbID,
    title: item.Title,
    year: parseYear(item.Year),
    posterUrl: item.Poster && item.Poster !== 'N/A' ? item.Poster : '',
    genre: undefined,
    rating: undefined,
    overview: undefined
  };
}

/**
 * Service to fetch movies from OMDb API or fallback to sample movies when idle.
 * Keeping API/network logic inside this service isolates components from raw endpoint details.
 */
export const movieService = {
  /**
   * Returns all available initial sample movies (used for discovery before searching).
   */
  getAllMovies: (): Movie[] => {
    return [...SAMPLE_MOVIES];
  },

  /**
   * Fetches movies from OMDb using title search with pagination:
   * ?apikey=<KEY>&s=<search term>&type=movie&page=<page>
   *
   * Handles empty query, missing API key, network errors, and OMDb API error messages.
   * Supports request cancellation via an optional AbortSignal.
   * Returns mapped movies and the totalResults count.
   */
  searchMovies: async (
    query: string,
    page: number = 1,
    signal?: AbortSignal
  ): Promise<MovieSearchResult> => {
    const trimmed = query.trim();

    // If query is empty, return the initial sample collection
    if (!trimmed) {
      return {
        movies: [...SAMPLE_MOVIES],
        totalResults: SAMPLE_MOVIES.length
      };
    }

    const apiKey = import.meta.env.VITE_OMDB_API_KEY;
    if (!apiKey) {
      throw new Error(
        'OMDb API key is missing. Please make sure VITE_OMDB_API_KEY is defined in your .env.local file.'
      );
    }

    const validPage = Math.max(1, Math.floor(page));
    const searchUrl = `${OMDB_BASE_URL}?apikey=${encodeURIComponent(
      apiKey
    )}&s=${encodeURIComponent(trimmed)}&type=movie&page=${validPage}`;

    let response: Response;
    try {
      response = await fetch(searchUrl, { signal });
    } catch (err: unknown) {
      if (err instanceof DOMException && err.name === 'AbortError') {
        throw err;
      }
      if (err instanceof Error && err.name === 'AbortError') {
        throw err;
      }
      throw new Error('Network error: Unable to reach the OMDb movie service. Please check your internet connection.', {
        cause: err
      });
    }

    if (!response.ok) {
      throw new Error(`OMDb service responded with status HTTP ${response.status}. Please try again later.`);
    }

    let data: OmdbSearchResponse;
    try {
      data = (await response.json()) as OmdbSearchResponse;
    } catch (err: unknown) {
      throw new Error('Failed to parse response from OMDb service.', { cause: err });
    }

    if (data.Response === 'False') {
      // OMDb returns Error: "Movie not found!" or "Too many results." etc.
      if (data.Error && data.Error.toLowerCase().includes('not found')) {
        return { movies: [], totalResults: 0 };
      }
      throw new Error(data.Error || 'Failed to fetch movies from OMDb.');
    }

    const totalResults = parseInt(data.totalResults, 10) || 0;

    // Map results safely to Movie type
    if (data.Search && Array.isArray(data.Search)) {
      return {
        movies: data.Search.map(mapOmdbItemToMovie),
        totalResults
      };
    }

    return { movies: [], totalResults: 0 };
  },

  /**
   * Fetches full movie details using IMDb ID:
   * ?apikey=<KEY>&i=<imdbID>&plot=full
   *
   * Handles sample movie IDs gracefully by falling back to local sample details,
   * supports request cancellation via optional AbortSignal, and normalizes "N/A" values.
   */
  getMovieDetails: async (movieId: string, signal?: AbortSignal): Promise<MovieDetail> => {
    // Check if the movie is one of our sample movies (e.g. m-1, m-2, etc.)
    const sampleMatch = SAMPLE_MOVIES.find((m) => m.id === movieId);
    if (sampleMatch && movieId.startsWith('m-')) {
      return {
        ...sampleMatch,
        plot: sampleMatch.overview,
        runtime: '148 min',
        director: sampleMatch.title === 'Inception' || sampleMatch.title === 'Interstellar' || sampleMatch.title === 'The Dark Knight'
          ? 'Christopher Nolan'
          : sampleMatch.title === 'Spirited Away'
          ? 'Hayao Miyazaki'
          : sampleMatch.title === 'Parasite'
          ? 'Bong Joon Ho'
          : sampleMatch.title === 'La La Land'
          ? 'Damien Chazelle'
          : 'Acclaimed Director',
        writer: 'Original Screenplay',
        actors: 'Ensemble Cast',
        released: `${sampleMatch.year}`,
        imdbRating: sampleMatch.rating ? `${sampleMatch.rating}` : undefined,
        rated: 'PG-13'
      };
    }

    const apiKey = import.meta.env.VITE_OMDB_API_KEY;
    if (!apiKey) {
      throw new Error(
        'OMDb API key is missing. Please make sure VITE_OMDB_API_KEY is defined in your .env.local file.'
      );
    }

    const detailUrl = `${OMDB_BASE_URL}?apikey=${encodeURIComponent(
      apiKey
    )}&i=${encodeURIComponent(movieId)}&plot=full`;

    let response: Response;
    try {
      response = await fetch(detailUrl, { signal });
    } catch (err: unknown) {
      if (err instanceof DOMException && err.name === 'AbortError') {
        throw err;
      }
      if (err instanceof Error && err.name === 'AbortError') {
        throw err;
      }
      throw new Error('Network error: Unable to load movie details. Please check your internet connection.', {
        cause: err
      });
    }

    if (!response.ok) {
      throw new Error(`OMDb service responded with status HTTP ${response.status}. Please try again later.`);
    }

    let data: OmdbMovieDetailResponse;
    try {
      data = (await response.json()) as OmdbMovieDetailResponse;
    } catch (err: unknown) {
      throw new Error('Failed to parse movie details from OMDb service.', { cause: err });
    }

    if (data.Response === 'False') {
      throw new Error(data.Error || 'Movie details not found.');
    }

    // Helper to sanitize "N/A" and empty strings to undefined
    const cleanValue = (val?: string): string | undefined => {
      if (!val || val.trim() === '' || val.trim().toUpperCase() === 'N/A') {
        return undefined;
      }
      return val.trim();
    };

    const ratingNum = data.imdbRating && data.imdbRating !== 'N/A' ? parseFloat(data.imdbRating) : undefined;
    const genres = cleanValue(data.Genre)
      ? cleanValue(data.Genre)!
          .split(',')
          .map((g) => g.trim())
          .filter(Boolean)
      : undefined;

    return {
      id: data.imdbID || movieId,
      title: data.Title || 'Unknown Title',
      year: data.Year ? parseYear(data.Year) : 0,
      posterUrl: data.Poster && data.Poster !== 'N/A' ? data.Poster : '',
      genre: genres,
      rating: typeof ratingNum === 'number' && !isNaN(ratingNum) ? ratingNum : undefined,
      overview: cleanValue(data.Plot),
      plot: cleanValue(data.Plot),
      runtime: cleanValue(data.Runtime),
      director: cleanValue(data.Director),
      writer: cleanValue(data.Writer),
      actors: cleanValue(data.Actors),
      released: cleanValue(data.Released),
      imdbRating: cleanValue(data.imdbRating),
      rated: cleanValue(data.Rated),
      awards: cleanValue(data.Awards),
      boxOffice: cleanValue(data.BoxOffice)
    };
  }
};

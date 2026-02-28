import { api } from '../shared/hooks/api';
import {
  ApiResponse,
  Movie,
  MovieDetail,
} from '../types/search';
import { WatchHistoryItem } from '../types/history';

type MovieListResponse = ApiResponse<Movie[]>;
type MovieDetailResponse = ApiResponse<MovieDetail>;
type HistoryListResponse = ApiResponse<WatchHistoryItem[]>;
type FavoriteCheckResponse = ApiResponse<{ is_favorite: boolean }>;
type FavoriteMovieItem = {
  id: string;
  movie_id: string;
  movie: Movie;
  created_at: string;
};
type FavoriteMovieListResponse = ApiResponse<{
  items: FavoriteMovieItem[];
  total: number;
  page: number;
  page_size: number;
  has_next: boolean;
}>;

export const movieService = {
  getPopular(page = 1, per_page = 20, lang = 'uz') {
    return api<MovieListResponse>(`/movies/popular?page=${page}&per_page=${per_page}`, {
      headers: { 'Accept-Language': lang },
    });
  },

  getLatest(page = 1, per_page = 20, lang = 'uz') {
    return api<MovieListResponse>(`/movies/latest?page=${page}&per_page=${per_page}`, {
      headers: { 'Accept-Language': lang },
    });
  },

  getHistory(limit = 20, lang = 'uz') {
    return api<HistoryListResponse>(`/history/continue-watching?limit=${limit}`, {
      headers: { 'Accept-Language': lang },
    });
  },

  getMoviesByCountry(
    countryId: string,
    page = 1,
    per_page = 20,
    lang = 'uz',
  ) {
    return api<MovieListResponse>(
      `/movies/by-country/${countryId}?page=${page}&per_page=${per_page}`,
      {
        headers: { 'Accept-Language': lang },
      },
    );
  },

  searchMovies(query: string, page = 1, per_page = 20, lang = 'uz') {
    return api(
      `/movies/search?q=${query}&page=${page}&per_page=${per_page}`,
      {
        headers: { 'Accept-Language': lang },
      }
    );
  },

  getMovieById(movieId: string, lang = 'uz') {
    return api<MovieDetailResponse>(`/movies/${movieId}`, {
      headers: { 'Accept-Language': lang },
    });
  },

  addMovieToFavorites(movieId: string, lang = 'uz') {
    return api<ApiResponse<FavoriteMovieItem>>(
      `/favorites/movies/${movieId}`,
      {
        method: 'POST',
        headers: { 'Accept-Language': lang },
      },
    );
  },

  removeMovieFromFavorites(movieId: string, lang = 'uz') {
    return api(`/favorites/movies/${movieId}`, {
      method: 'DELETE',
      headers: { 'Accept-Language': lang },
    });
  },

  checkMovieFavorite(movieId: string, lang = 'uz') {
    return api<FavoriteCheckResponse>(
      `/favorites/movies/${movieId}/check`,
      {
        headers: { 'Accept-Language': lang },
      },
    );
  },

  getFavoriteMovies(page = 1, page_size = 20, lang = 'uz') {
    return api<FavoriteMovieListResponse>(
      `/favorites/movies?page=${page}&page_size=${page_size}`,
      {
        headers: { 'Accept-Language': lang },
      },
    );
  },
};

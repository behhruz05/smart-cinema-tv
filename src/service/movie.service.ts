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

  getHistory(page = 1, per_page = 20, lang = 'uz') {
    return api<HistoryListResponse>(`/history/continue-watching?page=${page}&per_page=${per_page}`, {
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
};

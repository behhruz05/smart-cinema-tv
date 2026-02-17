import { api } from '../shared/hooks/api';
import { ApiResponse, Movie } from '../types/search';

type MovieListResponse = ApiResponse<Movie[]>;

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
    return api<MovieListResponse>(`/history/continue-watching?page=${page}&per_page=${per_page}`, {
      headers: { 'Accept-Language': lang },
    });
  },

  searchMovies(query: string, page = 1, per_page = 20, lang = 'uz') {
    return api(
      `/movies/search?q=${query}&page=${page}&per_page=${per_page}`,
      {
        headers: { 'Accept-Language': lang },
      }
    );
  },
};

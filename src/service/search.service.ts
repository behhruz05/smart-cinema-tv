import { api } from '../shared/hooks/api';
import { ApiResponse, Movie } from '../types/search';

interface MovieQueryParams {
  endpoint: 'search' | 'popular';
  page?: number;
  per_page?: number;
  lang?: 'uz' | 'ru' | 'en';
  q?: string;
}

export const searchService = {
  getMovies(
    {
      endpoint,
      page = 1,
      per_page = 20,
      lang = 'uz',
      q,
    }: MovieQueryParams,
    signal?: AbortSignal
  ) {
    const query = new URLSearchParams({
      page: String(page),
      per_page: String(per_page),
      ...(q ? { q } : {}),
    }).toString();

    return api<ApiResponse<Movie[]>>(
      `/movies/${endpoint}?${query}`,
      {
        headers: { 'Accept-Language': lang },
        signal, 
      }
    );
  },

  getGenres(lang: 'uz' | 'ru' | 'en' = 'uz') {
    return api(`/movies/genres`, {
      headers: { 'Accept-Language': lang },
    });
  },

getMoviesByGenre(
  genre_id: string,
  page: number = 1,
  per_page: number = 20,
  lang: 'uz' | 'ru' | 'en' = 'uz'
) {
  const query = new URLSearchParams({
    page: String(page),
    per_page: String(per_page),
  }).toString();

  return api(
    `/movies/by-genre/${genre_id}?${query}`,
    {
      headers: { 'Accept-Language': lang },
    }
  );
},
};

import { api } from '../shared/hooks/api';
import {
  SeriesDetailResponse,
  SeriesEpisodeDetailResponse,
  SeriesEpisodesResponse,
  SeriesListResponse,
  SeriesSeasonDetailResponse,
  SeriesSeasonsResponse,
} from '../types/series';

const jsonHeaders = (lang: 'uz' | 'ru' | 'en') => ({
  accept: 'application/json',
  'Accept-Language': lang,
});

export const seriesService = {
  getSeries(
    page = 1,
    per_page = 20,
    lang: 'uz' | 'ru' | 'en' = 'uz',
    params?: {
      status?: 'draft' | 'available' | 'unavailable';
      country_id?: string;
    },
  ) {
    const query = new URLSearchParams({
      page: String(page),
      per_page: String(per_page),
      ...(params?.status ? { status: params.status } : {}),
      ...(params?.country_id ? { country_id: params.country_id } : {}),
    }).toString();

    return api<SeriesListResponse>(`/series?${query}`, {
      headers: jsonHeaders(lang),
    });
  },

  searchSeries(
    q: string,
    page = 1,
    per_page = 20,
    lang: 'uz' | 'ru' | 'en' = 'uz',
  ) {
    const query = new URLSearchParams({
      q,
      page: String(page),
      per_page: String(per_page),
    }).toString();

    return api<SeriesListResponse>(`/series/search?${query}`, {
      headers: jsonHeaders(lang),
    });
  },

  getPopular(page = 1, per_page = 20, lang: 'uz' | 'ru' | 'en' = 'uz') {
    return api<SeriesListResponse>(`/series/popular?page=${page}&per_page=${per_page}`, {
      headers: jsonHeaders(lang),
    });
  },

  getLatest(page = 1, per_page = 20, lang: 'uz' | 'ru' | 'en' = 'uz') {
    return api<SeriesListResponse>(`/series/latest?page=${page}&per_page=${per_page}`, {
      headers: jsonHeaders(lang),
    });
  },

  getSeriesByGenre(
    genreId: string,
    page = 1,
    per_page = 20,
    lang: 'uz' | 'ru' | 'en' = 'uz',
  ) {
    return api<SeriesListResponse>(
      `/series/by-genre/${genreId}?page=${page}&per_page=${per_page}`,
      {
        headers: jsonHeaders(lang),
      },
    );
  },

  getSeriesByCountry(
    countryId: string,
    page = 1,
    per_page = 20,
    lang: 'uz' | 'ru' | 'en' = 'uz',
  ) {
    return api<SeriesListResponse>(
      `/series/by-country/${countryId}?page=${page}&per_page=${per_page}`,
      {
        headers: jsonHeaders(lang),
      },
    );
  },

  getSeriesById(seriesId: string, lang: 'uz' | 'ru' | 'en' = 'uz') {
    return api<SeriesDetailResponse>(`/series/${seriesId}`, {
      headers: jsonHeaders(lang),
    });
  },

  getSeasonsBySeries(
    seriesId: string,
    page = 1,
    per_page = 50,
    lang: 'uz' | 'ru' | 'en' = 'uz',
  ) {
    return api<SeriesSeasonsResponse>(
      `/series/${seriesId}/seasons?page=${page}&per_page=${per_page}`,
      {
        headers: jsonHeaders(lang),
      },
    );
  },

  getSeasonById(seasonId: string, lang: 'uz' | 'ru' | 'en' = 'uz') {
    return api<SeriesSeasonDetailResponse>(`/series/seasons/${seasonId}`, {
      headers: jsonHeaders(lang),
    });
  },

  getEpisodesBySeason(
    seasonId: string,
    page = 1,
    per_page = 100,
    lang: 'uz' | 'ru' | 'en' = 'uz',
  ) {
    return api<SeriesEpisodesResponse>(
      `/series/seasons/${seasonId}/episodes?page=${page}&per_page=${per_page}`,
      {
        headers: jsonHeaders(lang),
      },
    );
  },

  getEpisodeById(episodeId: string, lang: 'uz' | 'ru' | 'en' = 'uz') {
    return api<SeriesEpisodeDetailResponse>(`/series/episodes/${episodeId}`, {
      headers: jsonHeaders(lang),
    });
  },
};

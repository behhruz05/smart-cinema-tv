import { ApiResponse } from './search';

export type SeriesListResponse = ApiResponse<Series[]>;
export type SeriesDetailResponse = ApiResponse<SeriesDetail>;
export type SeriesSeasonsResponse = ApiResponse<SeriesSeason[] | { items?: SeriesSeason[] }>;
export type SeriesSeasonDetailResponse = ApiResponse<SeriesSeasonDetail>;
export type SeriesEpisodesResponse = ApiResponse<SeriesEpisode[] | { items?: SeriesEpisode[] }>;
export type SeriesEpisodeDetailResponse = ApiResponse<SeriesEpisodeDetail>;

export interface Series {
  id: string;
  title_uz: string;
  title_ru?: string;
  title_en?: string;
  poster_url: string;
  imdb_rating?: number | string;
  age_rating?: number;
  seasons_count?: number;
  description_uz?: string;
  description_ru?: string;
  description_en?: string;
  country_id?: string;
}

export interface SeriesGenre {
  id: string;
  name: string;
  slug: string;
}

export interface SeriesSeason {
  id: string;
  order_number: number;
  episodes_count?: number;
  title_uz?: string;
  title_ru?: string;
  title_en?: string;
}

export interface SeriesEpisode {
  id: string;
  order_number: number;
  title_uz: string;
  title_ru?: string;
  title_en?: string;
  poster_url?: string;
  duration_seconds: number;
}

export interface SeriesSeasonDetail extends SeriesSeason {
  episodes: SeriesEpisode[];
}

export interface SeriesDetail extends Series {
  genres?: SeriesGenre[];
  cast?: unknown[];
  seasons?: SeriesSeason[];
  is_favorite?: boolean;
  last_episode_id?: string | null;
  last_position?: number | null;
}

export interface SeriesFile {
  id: string;
  quality: string;
  flussonic_vod_path: string;
}

export interface SeriesSubtitle {
  id: string;
  language: string;
  file_url: string;
}

export interface SeriesEpisodeDetail extends SeriesEpisode {
  files?: SeriesFile[];
  subtitles?: SeriesSubtitle[];
  is_favorite?: boolean;
  last_position?: number | null;
}

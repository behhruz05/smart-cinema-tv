export interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string | null;
}

export interface Movie {
  id: string;
  title_uz: string;
  title_ru?: string;
  title_en?: string;
  year: number;
  duration_seconds: number;
  age_rating: number;
  poster_url: string;
  imdb_rating: string;
  views_count: number;
}

export interface MovieGenre {
  id: string;
  name: string;
  slug: string;
}

export interface MovieFile {
  id: string;
  quality: string;
  flussonic_vod_path: string;
}

export interface MovieSubtitle {
  id: string;
  language: string;
  file_url: string;
}

export interface MovieCountry {
  id: string;
  name: string;
  code: string;
}

export interface MovieDetail extends Movie {
  description_uz: string;
  description_ru?: string;
  description_en?: string;
  country_id: string;
  created_at: string;
  updated_at: string;
  genres: MovieGenre[];
  cast: unknown[];
  files: MovieFile[];
  subtitles: MovieSubtitle[];
  voice_languages: unknown[];
  country: MovieCountry | null;
  is_favorite: boolean;
  last_position: number | null;
}

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

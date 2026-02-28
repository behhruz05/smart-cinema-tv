export interface WatchHistoryItem {
  type: 'movie' | 'episode' | 'series';
  id: string;
  content_id?: string;
  movie_id?: string;
  episode_id?: string;
  title_uz?: string;
  title_ru?: string;
  title_en?: string;
  poster_url: string;
  last_position_seconds: number;
  total_duration_seconds: number;
  progress_percent?: number;
  season_number?: number | null;
  episode_number?: number | null;
  updated_at?: string;
  series_id?: string;
  series_title_uz?: string;
  series_title_ru?: string;
  series_title_en?: string;
}

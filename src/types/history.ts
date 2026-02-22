export interface WatchHistoryItem {
  type: 'movie' | 'series';
  id: string;
  title_uz?: string;
  title_ru?: string;
  poster_url: string;
  last_position_seconds: number;
  total_duration_seconds: number;
  progress_percent?: number;
  season_number?: number | null;
  episode_number?: number | null;
}

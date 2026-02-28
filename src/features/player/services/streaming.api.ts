import { getAppLanguage } from '../../../i18n';
import { api } from '../../../shared/hooks/api';

type StreamTrack = {
  id: string;
  language: string;
  file_url: string;
};

export type StreamPayload = {
  movie_id?: string;
  episode_id?: string;
  title?: string;
  stream_url: string;
  expires_at?: number;
  duration_seconds?: number;
  resume_position_seconds?: number;
  subtitles?: StreamTrack[];
  audio_tracks?: StreamTrack[];
};

type WrappedStreamPayload = {
  success?: boolean;
  data?: StreamPayload | null;
  error?: {
    message?: string;
  } | null;
} & StreamPayload;

type ProgressResponse = {
  success: boolean;
  position_seconds: number;
};

const STREAM_ASSET_HOST = 'https://stream.alloplay.uz';

export function resolveStreamAssetUrl(fileUrl?: string | null): string | null {
  if (!fileUrl) return null;
  const trimmed = fileUrl.trim();
  if (!trimmed) return null;
  if (/^https?:\/\//i.test(trimmed)) return trimmed;
  return `${STREAM_ASSET_HOST}/${trimmed.replace(/^\/+/, '')}`;
}

export const streamingApi = {
  async getMovieStream(movieId: string): Promise<StreamPayload> {
    const response = await api<WrappedStreamPayload>(`/streaming/movie/${movieId}`, {
      headers: { 'Accept-Language': getAppLanguage() },
      skipAuth: false,
    });
    return response?.data && typeof response.data === 'object'
      ? response.data
      : (response as StreamPayload);
  },

  async getEpisodeStream(episodeId: string): Promise<StreamPayload> {
    const response = await api<WrappedStreamPayload>(`/streaming/series/${episodeId}`, {
      headers: { 'Accept-Language': getAppLanguage() },
      skipAuth: false,
    });
    return response?.data && typeof response.data === 'object'
      ? response.data
      : (response as StreamPayload);
  },

  async updateMovieProgress(movieId: string, positionSeconds: number) {
    return api<ProgressResponse>(
      `/streaming/movie/${movieId}/progress?position_seconds=${Math.max(
        0,
        Math.floor(positionSeconds),
      )}`,
      {
        method: 'POST',
        skipAuth: false,
      },
    );
  },

  async updateEpisodeProgress(episodeId: string, positionSeconds: number) {
    return api<ProgressResponse>(
      `/streaming/series/${episodeId}/progress?position_seconds=${Math.max(
        0,
        Math.floor(positionSeconds),
      )}`,
      {
        method: 'POST',
        skipAuth: false,
      },
    );
  },
};

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
  data?: StreamPayload | string | null;
  error?: {
    message?: string;
  } | null;
} & Partial<StreamPayload> & {
    stream_url?: string;
    hls_url?: string;
    url?: string;
  };

type ProgressResponse = {
  success: boolean;
  position_seconds: number;
};

const STREAM_ASSET_HOST = 'https://stream.alloplay.uz';
const streamHeaders = () => ({
  accept: 'application/json',
  'Accept-Language': getAppLanguage(),
});

export function resolveStreamAssetUrl(fileUrl?: string | null): string | null {
  if (!fileUrl) return null;
  const trimmed = fileUrl.trim();
  if (!trimmed) return null;
  if (/^https?:\/\//i.test(trimmed)) return trimmed;
  return `${STREAM_ASSET_HOST}/${trimmed.replace(/^\/+/, '')}`;
}

const isObject = (value: unknown): value is Record<string, unknown> =>
  Boolean(value) && typeof value === 'object' && !Array.isArray(value);

function normalizeTracks(input: unknown): StreamTrack[] {
  if (!Array.isArray(input)) return [];

  return input
    .map((item) => {
      if (!isObject(item)) return null;

      const id = String(item.id || '');
      const language = String(item.language || '');
      const rawUrl =
        typeof item.file_url === 'string'
          ? item.file_url
          : typeof item.url === 'string'
            ? item.url
            : '';
      const file_url = resolveStreamAssetUrl(rawUrl) || '';

      if (!id || !language || !file_url) return null;

      return { id, language, file_url };
    })
    .filter((item): item is StreamTrack => Boolean(item));
}

function normalizeStreamPayload(raw: unknown): StreamPayload {
  if (typeof raw === 'string') {
    const streamUrl = resolveStreamAssetUrl(raw);
    if (!streamUrl) throw new Error('Invalid stream URL');
    return { stream_url: streamUrl };
  }

  const wrapped = isObject(raw) ? raw : {};
  const data = isObject(wrapped.data) || typeof wrapped.data === 'string' ? wrapped.data : null;
  const candidate = isObject(data) ? data : wrapped;

  const rawStreamUrl =
    typeof data === 'string'
      ? data
      : (typeof candidate.stream_url === 'string'
        ? candidate.stream_url
        : typeof candidate.hls_url === 'string'
          ? candidate.hls_url
          : typeof candidate.url === 'string'
            ? candidate.url
            : '');

  const stream_url = resolveStreamAssetUrl(rawStreamUrl) || '';
  if (!stream_url) {
    throw new Error('Stream URL not found');
  }

  return {
    stream_url,
    title: typeof candidate.title === 'string' ? candidate.title : undefined,
    movie_id: typeof candidate.movie_id === 'string' ? candidate.movie_id : undefined,
    episode_id: typeof candidate.episode_id === 'string' ? candidate.episode_id : undefined,
    expires_at:
      typeof candidate.expires_at === 'number' ? candidate.expires_at : undefined,
    duration_seconds:
      typeof candidate.duration_seconds === 'number'
        ? candidate.duration_seconds
        : undefined,
    resume_position_seconds:
      typeof candidate.resume_position_seconds === 'number'
        ? candidate.resume_position_seconds
        : undefined,
    subtitles: normalizeTracks(candidate.subtitles),
    audio_tracks: normalizeTracks(candidate.audio_tracks),
  };
}

export const streamingApi = {
  async getMovieStream(movieId: string): Promise<StreamPayload> {
    const safeMovieId = encodeURIComponent(String(movieId).trim());
    const response = await api<WrappedStreamPayload | string>(`/streaming/movie/${safeMovieId}`, {
      headers: streamHeaders(),
      skipAuth: false,
      timeoutMs: 25000,
      retry: 1,
    });
    return normalizeStreamPayload(response);
  },

  async getEpisodeStream(episodeId: string): Promise<StreamPayload> {
    const safeEpisodeId = encodeURIComponent(String(episodeId).trim());
    const response = await api<WrappedStreamPayload | string>(`/streaming/series/${safeEpisodeId}`, {
      headers: streamHeaders(),
      skipAuth: false,
      timeoutMs: 25000,
      retry: 1,
    });
    return normalizeStreamPayload(response);
  },

  async updateMovieProgress(movieId: string, positionSeconds: number) {
    const safeMovieId = encodeURIComponent(String(movieId).trim());
    return api<ProgressResponse>(
      `/streaming/movie/${safeMovieId}/progress?position_seconds=${Math.max(
        0,
        Math.floor(positionSeconds),
      )}`,
      {
        method: 'POST',
        headers: streamHeaders(),
        skipAuth: false,
        timeoutMs: 15000,
        retry: 1,
      },
    );
  },

  async updateEpisodeProgress(episodeId: string, positionSeconds: number) {
    const safeEpisodeId = encodeURIComponent(String(episodeId).trim());
    return api<ProgressResponse>(
      `/streaming/series/${safeEpisodeId}/progress?position_seconds=${Math.max(
        0,
        Math.floor(positionSeconds),
      )}`,
      {
        method: 'POST',
        headers: streamHeaders(),
        skipAuth: false,
        timeoutMs: 15000,
        retry: 1,
      },
    );
  },
};

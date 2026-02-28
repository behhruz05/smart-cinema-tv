import { api, BASE_URL } from '../shared/hooks/api';
import { getAppLanguage } from '../i18n';
import { tokenStorage } from '../shared/lib/tokenStorage';

export interface Reel {
  id: string;
  title_uz?: string;
  title_ru?: string;
  title_en?: string;
  description_uz?: string;
  description_ru?: string;
  description_en?: string;
  status?: 'draft' | 'available' | 'unavailable';
  poster_url: string;
  flussonic_vod_path?: string;
  stream_url?: string;
  m3u8_url?: string;
  video_url?: string;
  video_path?: string;
  duration_seconds: number;
  views_count: number;
  likes_count: number;
  is_liked: boolean;
  created_at?: string;
  linked_movies: Array<{ id?: string; poster_url?: string; [k: string]: any }>;
  linked_episodes: Array<{ id?: string; poster_url?: string; [k: string]: any }>;
}

type ReelApiItem = Partial<Reel> & {
  id?: string;
  poster_url?: string;
  status?: 'draft' | 'available' | 'unavailable';
};

interface ReelsResponse {
  success: boolean;
  data: {
    items?: ReelApiItem[];
    page: number;
    per_page: number;
    total: number;
    total_pages: number;
  } | ReelApiItem[];
}

interface ReelDetailResponse {
  success: boolean;
  data: ReelApiItem;
}

interface ReelStreamingResponse {
  reel_id: string;
  stream_url: string;
  expires_at?: number;
  duration_seconds?: number;
}

const normalizeReel = (item: ReelApiItem): Reel | null => {
  if (!item.id) return null;
  const poster = item.poster_url ?? item.linked_movies?.[0]?.poster_url;
  if (!poster) return null;

  return {
    id: item.id,
    title_uz: item.title_uz,
    title_ru: item.title_ru,
    title_en: item.title_en,
    description_uz: item.description_uz,
    description_ru: item.description_ru,
    description_en: item.description_en,
    status: item.status,
    poster_url: poster,
    flussonic_vod_path: item.flussonic_vod_path,
    stream_url: item.stream_url,
    m3u8_url: item.m3u8_url,
    video_url: item.video_url,
    video_path: item.video_path,
    duration_seconds: Number(item.duration_seconds ?? 0),
    views_count: Number(item.views_count ?? 0),
    likes_count: Number(item.likes_count ?? 0),
    is_liked: Boolean(item.is_liked),
    created_at: item.created_at,
    linked_movies: Array.isArray(item.linked_movies) ? item.linked_movies : [],
    linked_episodes: Array.isArray(item.linked_episodes) ? item.linked_episodes : [],
  };
};

const normalizeReels = (payload: unknown): Reel[] => {
  if (!Array.isArray(payload)) return [];

  return payload
    .map((item) => normalizeReel(item as ReelApiItem))
    .filter((item): item is Reel => item !== null)
    .filter((item) => !item.status || item.status === 'available');
};

const extractReelArray = (data: ReelsResponse['data']) => {
  return Array.isArray(data) ? data : data?.items;
};

async function sendLikeRequest(path: string, method: 'POST' | 'DELETE') {
  const token = await tokenStorage.get();
  if (!token) return false;

  try {
    const response = await fetch(`${BASE_URL}${path}`, {
      method,
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
    });

    if (response.status >= 200 && response.status < 300) return true;
    if (response.status === 400) return true;
    return false;
  } catch {
    return false;
  }
}

export const reelService = {
  async getReels(page = 1, per_page = 20, lang = getAppLanguage()): Promise<Reel[]> {
    const response = await api<ReelsResponse>(
      `/reels?page=${page}&per_page=${per_page}`,
      {
        headers: { 'Accept-Language': lang },
      },
    );

    if (!response?.success) return [];
    return normalizeReels(extractReelArray(response.data));
  },

  async getTrending(limit = 20, lang = getAppLanguage()): Promise<Reel[]> {
    const response = await api<ReelsResponse>(
      `/reels/trending?limit=${limit}`,
      {
        headers: { 'Accept-Language': lang },
      },
    );

    if (!response?.success) return [];
    return normalizeReels(extractReelArray(response.data));
  },

  async getByMovie(movieId: string, page = 1, per_page = 10, lang = getAppLanguage()): Promise<Reel[]> {
    if (!movieId) return [];

    const response = await api<ReelsResponse>(
      `/reels/by-movie/${movieId}?page=${page}&per_page=${per_page}`,
      {
        headers: { 'Accept-Language': lang },
      },
    );

    if (!response?.success) return [];
    return normalizeReels(extractReelArray(response.data));
  },

  async getReelDetail(reelId: string, lang = getAppLanguage()): Promise<Reel | null> {
    const response = await api<ReelDetailResponse>(`/reels/${reelId}`, {
      headers: { 'Accept-Language': lang },
    });

    if (!response?.success) return null;
    return normalizeReel(response.data);
  },

  async getReelStreamingUrl(reelId: string): Promise<string | null> {
    const lang = getAppLanguage();

    try {
      const response = await api<ReelStreamingResponse>(`/streaming/reel/${reelId}`, {
        headers: { 'Accept-Language': lang },
      });
      return response?.stream_url ?? null;
    } catch {
      try {
        const response = await api<ReelStreamingResponse>(`/streaming/reel/${reelId}`, {
          headers: { 'Accept-Language': lang },
          skipAuth: true,
        });
        return response?.stream_url ?? null;
      } catch {
        return null;
      }
    }
  },

  async likeReel(id: string): Promise<boolean> {
    return sendLikeRequest(`/reels/${id}/like`, 'POST');
  },

  async unlikeReel(id: string): Promise<boolean> {
    return sendLikeRequest(`/reels/${id}/like`, 'DELETE');
  },
};

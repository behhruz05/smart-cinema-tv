import { api } from '../shared/hooks/api';
import { getAppLanguage } from '../i18n';

interface ReelsResponse {
  success: boolean;
  data: {
    items: Reel[];
  };
}

interface TrendingResponse {
  success: boolean;
  data: Reel[];
}

export interface Reel {
  id: string;
  title_uz: string;
  title_ru: string;
  title_en: string;
  description_uz: string;
  description_ru: string;
  description_en: string;
  poster_url: string;
  flussonic_vod_path: string;
  duration_seconds: number;
  views_count: number;
  likes_count: number;
  is_liked: boolean;
  created_at: string;
  linked_movies: any[];
  linked_episodes: any[];
}

export const reelService = {
  async getReels(page = 1, per_page = 20, lang = getAppLanguage()) {
    return api<ReelsResponse>(
      `/reels?page=${page}&per_page=${per_page}`,
      {
        headers: { 'Accept-Language': lang },
        skipAuth: true,
      }
    );
  },

  async getTrending(limit = 20, lang = getAppLanguage()) {
    return api<TrendingResponse>(
      `/reels/trending?limit=${limit}`,
      {
        headers: { 'Accept-Language': lang },
        skipAuth: true,
      }
    );
  },

  async likeReel(id: string) {
    return api(
      `/reels/${id}/like`,
      {
        method: 'POST',
      }
    );
  },
};

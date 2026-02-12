import { api } from '../shared/hooks/api';

export const reelService = {
  getReels(page = 1, per_page = 20, lang = 'uz') {
    return api(`/reels?page=${page}&per_page=${per_page}`, {
      headers: { 'Accept-Language': lang },
    });
  },
};

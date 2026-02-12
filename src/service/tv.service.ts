import { api } from '../shared/hooks/api';

export const tvService = {
  getChannels(page = 1, per_page = 20, lang = 'uz') {
    return api(`/tv/channels?page=${page}&per_page=${per_page}`, {
      headers: { 'Accept-Language': lang },
    });
  },
};

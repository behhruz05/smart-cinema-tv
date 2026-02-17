import { api } from '../shared/hooks/api';
import { ApiResponse } from '../types/search';

interface TvChannel {
  id: string;
  name_uz?: string;
  name_ru?: string;
  name_en?: string;
}

interface TvChannelsPayload {
  items: TvChannel[];
}

export const tvService = {
  getChannels(page = 1, per_page = 20, lang = 'uz') {
    return api<ApiResponse<TvChannelsPayload>>(`/tv/channels?page=${page}&per_page=${per_page}`, {
      headers: { 'Accept-Language': lang },
    });
  },
};

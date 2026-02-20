import { api } from '../shared/hooks/api';
import {
  TvCategoriesResponse,
  TvChannelDetailResponse,
  TvChannelsResponse,
  TvProgramsResponse,
  TvProgramResponse,
} from '../types/tv';

export const tvService = {
  getCategories(lang = 'uz') {
    return api<TvCategoriesResponse>('/tv/categories', {
      headers: { 'Accept-Language': lang },
    });
  },

  getChannels(
    page = 1,
    per_page = 20,
    lang = 'uz',
    category_id?: string,
    status?: string,
    search?: string,
  ) {
    const query = new URLSearchParams({
      page: String(page),
      per_page: String(per_page),
      ...(category_id ? { category_id } : {}),
      ...(status ? { status } : {}),
      ...(search ? { search } : {}),
    }).toString();

    return api<TvChannelsResponse>(`/tv/channels?${query}`, {
      headers: { 'Accept-Language': lang },
    });
  },

  getChannelById(channelId: string, lang = 'uz') {
    return api<TvChannelDetailResponse>(`/tv/channels/${channelId}`, {
      headers: { 'Accept-Language': lang },
    });
  },

  getChannelCurrentProgram(channelId: string, lang = 'uz') {
    return api<TvProgramResponse>(`/tv/channels/${channelId}/epg/current`, {
      headers: { 'Accept-Language': lang },
    });
  },

  getChannelUpcomingPrograms(
    channelId: string,
    lang = 'uz',
    limit = 10,
  ) {
    return api<TvProgramsResponse>(
      `/tv/channels/${channelId}/epg/upcoming?limit=${limit}`,
      {
        headers: { 'Accept-Language': lang },
      },
    );
  },
};

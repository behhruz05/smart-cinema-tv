import { api } from '../shared/hooks/api';
import { CarouselResponse } from '../types/home';

export const homeService = {
  async getCarousels(limit = 10, lang = 'uz') {
    return api<CarouselResponse>(
      `/carousels?limit=${limit}`,
      {
        headers: {
          'Accept-Language': lang,
        },
      }
    );
  },
};

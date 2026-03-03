import { createAsyncThunk, createSlice, PayloadAction } from '@reduxjs/toolkit';
import { seriesService } from '../../service/series.service';
import {
  Series,
  SeriesDetail,
  SeriesEpisode,
  SeriesSeason,
} from '../../types/series';

type Status = 'idle' | 'loading' | 'success' | 'error';

interface SeriesState {
  popular: Series[];
  latest: Series[];
  searchResults: Series[];
  related: Series[];
  selectedSeries: SeriesDetail | null;
  seasons: SeriesSeason[];
  selectedSeasonId: string | null;
  seasonEpisodes: SeriesEpisode[];

  popularStatus: Status;
  latestStatus: Status;
  searchStatus: Status;
  detailStatus: Status;
  relatedStatus: Status;
  seasonsStatus: Status;
  episodesStatus: Status;

  error: string | null;
}

const initialState: SeriesState = {
  popular: [],
  latest: [],
  searchResults: [],
  related: [],
  selectedSeries: null,
  seasons: [],
  selectedSeasonId: null,
  seasonEpisodes: [],

  popularStatus: 'idle',
  latestStatus: 'idle',
  searchStatus: 'idle',
  detailStatus: 'idle',
  relatedStatus: 'idle',
  seasonsStatus: 'idle',
  episodesStatus: 'idle',

  error: null,
};

const extractArray = <T>(payload: unknown): T[] => {
  if (Array.isArray(payload)) {
    return payload as T[];
  }
  if (
    payload &&
    typeof payload === 'object' &&
    'items' in payload &&
    Array.isArray((payload as { items?: unknown }).items)
  ) {
    return (payload as { items: T[] }).items;
  }
  return [];
};

export const fetchPopularSeries = createAsyncThunk(
  'series/popular',
  async (
    args:
      | {
          page?: number;
          per_page?: number;
          lang?: 'uz' | 'ru' | 'en';
        }
      | undefined,
  ) => {
    const { page = 1, per_page = 20, lang = 'uz' } = args || {};
    const response = await seriesService.getPopular(page, per_page, lang);
    return response.data;
  },
);

export const fetchLatestSeries = createAsyncThunk(
  'series/latest',
  async (
    args:
      | {
          page?: number;
          per_page?: number;
          lang?: 'uz' | 'ru' | 'en';
        }
      | undefined,
  ) => {
    const { page = 1, per_page = 20, lang = 'uz' } = args || {};
    const response = await seriesService.getLatest(page, per_page, lang);
    return response.data;
  },
);

export const fetchSeriesById = createAsyncThunk(
  'series/detail',
  async ({ seriesId, lang }: { seriesId: string; lang: 'uz' | 'ru' | 'en' }) => {
    // Temporary fallback: avoid /series/{id} and resolve from /series list.
    // const response = await seriesService.getSeriesById(seriesId, lang);
    // return response.data;
    const response = await seriesService.getSeries(1, 100, lang);
    const matched = response.data.find(item => item.id === seriesId);
    if (!matched) {
      throw new Error('SERIES_NOT_FOUND');
    }

    return {
      ...matched,
      cast: [],
      genres: [],
      seasons: [],
      is_favorite: false,
      last_episode_id: null,
      last_position: null,
    } as SeriesDetail;
  },
);

export const fetchSeriesByCountry = createAsyncThunk(
  'series/byCountry',
  async ({
    countryId,
    page = 1,
    per_page = 20,
    lang,
  }: {
    countryId: string;
    page?: number;
    per_page?: number;
    lang: 'uz' | 'ru' | 'en';
  }) => {
    const response = await seriesService.getSeriesByCountry(
      countryId,
      page,
      per_page,
      lang,
    );
    return response.data;
  },
);

export const fetchSeriesSeasons = createAsyncThunk(
  'series/seasons',
  async ({
    seriesId,
    page = 1,
    per_page = 50,
    lang,
  }: {
    seriesId: string;
    page?: number;
    per_page?: number;
    lang: 'uz' | 'ru' | 'en';
  }) => {
    const response = await seriesService.getSeasonsBySeries(
      seriesId,
      page,
      per_page,
      lang,
    );
    return extractArray<SeriesSeason>(response.data);
  },
);

export const fetchSeasonEpisodes = createAsyncThunk(
  'series/seasonEpisodes',
  async ({
    seasonId,
    lang,
  }: {
    seasonId: string;
    lang: 'uz' | 'ru' | 'en';
  }) => {
    const seasonResponse = await seriesService.getSeasonById(
      seasonId,
      lang,
    );
    const episodes = Array.isArray(seasonResponse.data.episodes)
      ? seasonResponse.data.episodes
      : [];

    return {
      seasonId,
      episodes,
    };
  },
);

const seriesSlice = createSlice({
  name: 'series',
  initialState,
  reducers: {
    setSelectedSeasonId(state, action: PayloadAction<string | null>) {
      state.selectedSeasonId = action.payload;
    },
    clearSelectedSeries(state) {
      state.selectedSeries = null;
      state.seasons = [];
      state.selectedSeasonId = null;
      state.seasonEpisodes = [];
      state.related = [];
      state.detailStatus = 'idle';
      state.seasonsStatus = 'idle';
      state.episodesStatus = 'idle';
      state.relatedStatus = 'idle';
    },
  },
  extraReducers: builder => {
    builder
      .addCase(fetchPopularSeries.pending, state => {
        state.popularStatus = 'loading';
      })
      .addCase(fetchPopularSeries.fulfilled, (state, action) => {
        state.popularStatus = 'success';
        state.popular = action.payload;
      })
      .addCase(fetchPopularSeries.rejected, state => {
        state.popularStatus = 'error';
      })

      .addCase(fetchLatestSeries.pending, state => {
        state.latestStatus = 'loading';
      })
      .addCase(fetchLatestSeries.fulfilled, (state, action) => {
        state.latestStatus = 'success';
        state.latest = action.payload;
      })
      .addCase(fetchLatestSeries.rejected, state => {
        state.latestStatus = 'error';
      })

      .addCase(fetchSeriesById.pending, state => {
        state.detailStatus = 'loading';
      })
      .addCase(fetchSeriesById.fulfilled, (state, action) => {
        state.detailStatus = 'success';
        state.selectedSeries = action.payload;
      })
      .addCase(fetchSeriesById.rejected, (state, action) => {
        state.detailStatus = 'error';
        state.error = action.error.message || null;
      })

      .addCase(fetchSeriesByCountry.pending, state => {
        state.relatedStatus = 'loading';
      })
      .addCase(fetchSeriesByCountry.fulfilled, (state, action) => {
        state.relatedStatus = 'success';
        state.related = action.payload;
      })
      .addCase(fetchSeriesByCountry.rejected, state => {
        state.relatedStatus = 'error';
      })

      .addCase(fetchSeriesSeasons.pending, state => {
        state.seasonsStatus = 'loading';
      })
      .addCase(fetchSeriesSeasons.fulfilled, (state, action) => {
        state.seasonsStatus = 'success';
        state.seasons = action.payload;

        if (!state.selectedSeasonId && action.payload.length > 0) {
          state.selectedSeasonId = action.payload[0].id;
        }
      })
      .addCase(fetchSeriesSeasons.rejected, state => {
        state.seasonsStatus = 'error';
      })

      .addCase(fetchSeasonEpisodes.pending, state => {
        state.episodesStatus = 'loading';
      })
      .addCase(fetchSeasonEpisodes.fulfilled, (state, action) => {
        state.episodesStatus = 'success';
        state.selectedSeasonId = action.payload.seasonId;
        state.seasonEpisodes = action.payload.episodes;
      })
      .addCase(fetchSeasonEpisodes.rejected, state => {
        state.episodesStatus = 'error';
      });
  },
});

export const { setSelectedSeasonId, clearSelectedSeries } = seriesSlice.actions;

export default seriesSlice.reducer;

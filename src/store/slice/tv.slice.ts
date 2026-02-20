import {
  createAsyncThunk,
  createSlice,
  PayloadAction,
} from '@reduxjs/toolkit';
import { tvService } from '../../service/tv.service';
import {
  TvCategory,
  TvChannel,
  TvChannelDetail,
  TvProgram,
} from '../../types/tv';

type Status = 'idle' | 'loading' | 'success' | 'error';

interface TvState {
  categories: TvCategory[];
  channels: TvChannel[];
  selectedCategoryId: string | null;
  selectedChannelId: string | null;
  channelDetail: TvChannelDetail | null;
  currentProgram: TvProgram | null;
  upcomingPrograms: TvProgram[];
  categoriesStatus: Status;
  channelsStatus: Status;
  detailStatus: Status;
  epgStatus: Status;
}

const initialState: TvState = {
  categories: [],
  channels: [],
  selectedCategoryId: null,
  selectedChannelId: null,
  channelDetail: null,
  currentProgram: null,
  upcomingPrograms: [],
  categoriesStatus: 'idle',
  channelsStatus: 'idle',
  detailStatus: 'idle',
  epgStatus: 'idle',
};

export const fetchTvCategories = createAsyncThunk(
  'tv/categories',
  async (lang: 'uz' | 'ru' | 'en') => {
    const res = await tvService.getCategories(lang);
    return res.data;
  },
);

export const fetchTvChannels = createAsyncThunk(
  'tv/channels',
  async ({
    lang,
    page = 1,
    per_page = 20,
    categoryId,
  }: {
    lang: 'uz' | 'ru' | 'en';
    page?: number;
    per_page?: number;
    categoryId?: string | null;
  }) => {
    const res = await tvService.getChannels(
      page,
      per_page,
      lang,
      categoryId || undefined,
    );
    return res.data.items;
  },
);

export const fetchTvChannelDetail = createAsyncThunk(
  'tv/channelDetail',
  async ({
    lang,
    channelId,
  }: {
    lang: 'uz' | 'ru' | 'en';
    channelId: string;
  }) => {
    const res = await tvService.getChannelById(channelId, lang);
    return res.data;
  },
);

export const fetchTvCurrentProgram = createAsyncThunk(
  'tv/currentProgram',
  async ({
    lang,
    channelId,
  }: {
    lang: 'uz' | 'ru' | 'en';
    channelId: string;
  }) => {
    const res = await tvService.getChannelCurrentProgram(
      channelId,
      lang,
    );
    return res.data;
  },
);

export const fetchTvUpcomingPrograms = createAsyncThunk(
  'tv/upcomingPrograms',
  async ({
    lang,
    channelId,
    limit = 10,
  }: {
    lang: 'uz' | 'ru' | 'en';
    channelId: string;
    limit?: number;
  }) => {
    const res = await tvService.getChannelUpcomingPrograms(
      channelId,
      lang,
      limit,
    );
    return res.data;
  },
);

const tvSlice = createSlice({
  name: 'tv',
  initialState,
  reducers: {
    setSelectedCategoryId(
      state,
      action: PayloadAction<string | null>,
    ) {
      state.selectedCategoryId = action.payload;
    },
    setSelectedChannelId(
      state,
      action: PayloadAction<string | null>,
    ) {
      state.selectedChannelId = action.payload;
    },
  },
  extraReducers: builder => {
    builder
      .addCase(fetchTvCategories.pending, state => {
        state.categoriesStatus = 'loading';
      })
      .addCase(fetchTvCategories.fulfilled, (state, action) => {
        state.categories = action.payload;
        state.categoriesStatus = 'success';
      })
      .addCase(fetchTvCategories.rejected, state => {
        state.categoriesStatus = 'error';
      })
      .addCase(fetchTvChannels.pending, state => {
        state.channelsStatus = 'loading';
      })
      .addCase(fetchTvChannels.fulfilled, (state, action) => {
        state.channels = action.payload;
        state.channelsStatus = 'success';
      })
      .addCase(fetchTvChannels.rejected, state => {
        state.channelsStatus = 'error';
      })
      .addCase(fetchTvChannelDetail.pending, state => {
        state.detailStatus = 'loading';
      })
      .addCase(fetchTvChannelDetail.fulfilled, (state, action) => {
        state.channelDetail = action.payload;
        state.detailStatus = 'success';
      })
      .addCase(fetchTvChannelDetail.rejected, state => {
        state.detailStatus = 'error';
      })
      .addCase(fetchTvCurrentProgram.pending, state => {
        state.epgStatus = 'loading';
      })
      .addCase(fetchTvCurrentProgram.fulfilled, (state, action) => {
        state.currentProgram = action.payload;
        state.epgStatus = 'success';
      })
      .addCase(fetchTvCurrentProgram.rejected, state => {
        state.currentProgram = null;
      })
      .addCase(fetchTvUpcomingPrograms.pending, state => {
        state.epgStatus = 'loading';
      })
      .addCase(fetchTvUpcomingPrograms.fulfilled, (state, action) => {
        state.upcomingPrograms = action.payload;
        state.epgStatus = 'success';
      })
      .addCase(fetchTvUpcomingPrograms.rejected, state => {
        state.upcomingPrograms = [];
        state.epgStatus = 'error';
      });
  },
});

export const { setSelectedCategoryId, setSelectedChannelId } =
  tvSlice.actions;

export default tvSlice.reducer;

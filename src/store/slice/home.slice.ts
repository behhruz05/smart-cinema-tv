import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import { homeService } from '../../service/home.service';
import { movieService } from '../../service/movie.service';
import { Reel } from '../../service/reel.service';
import { tvService } from '../../service/tv.service';
import { Carousel } from '../../types/home';
import { WatchHistoryItem } from '../../types/history';
import { Movie } from '../../types/search';
import { TvChannel } from '../../types/tv';

interface HomeState {
  carousels: Carousel[];
  popular: Movie[];
  latest: Movie[];
  history: WatchHistoryItem[];
  reels: Reel[];
  channels: TvChannel[];
  loading: boolean;
  error: string | null;
}

const initialState: HomeState = {
  carousels: [],
  popular: [],
  latest: [],
  history: [],
  reels: [],
  channels: [],
  loading: false,
  error: null,
};

export const fetchCarousels = createAsyncThunk('home/carousels', async () => {
  const res = await homeService.getCarousels();
  return res.data;
});

export const fetchPopular = createAsyncThunk('home/popular', async () => {
  const res = await movieService.getPopular();
  return res.data;
});

export const fetchLatest = createAsyncThunk('home/latest', async () => {
  const res = await movieService.getLatest();
  return res.data;
});

export const fetchHistory = createAsyncThunk('home/history', async () => {
  const res = await movieService.getHistory();
  return res.data;
});

export const fetchChannels = createAsyncThunk('home/channels', async () => {
  const res = await tvService.getChannels();
  return res.data.items;
});

const homeSlice = createSlice({
  name: 'home',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchCarousels.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchCarousels.fulfilled, (state, action) => {
        state.carousels = action.payload;
        state.loading = false;
      })
      .addCase(fetchCarousels.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Carousels error';
      })
      .addCase(fetchPopular.fulfilled, (state, action) => {
        state.popular = action.payload;
      })
      .addCase(fetchLatest.fulfilled, (state, action) => {
        state.latest = action.payload;
      })
      .addCase(fetchHistory.fulfilled, (state, action) => {
        state.history = action.payload;
      })
      .addCase(fetchChannels.fulfilled, (state, action) => {
        state.channels = action.payload;
      });
  },
});

export default homeSlice.reducer;

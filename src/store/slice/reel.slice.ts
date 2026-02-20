import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { reelService, Reel } from '../../service/reel.service';

interface ReelState {
  reels: Reel[];
  trending: Reel[];
  loading: boolean;
  loadingMore: boolean;
  hasMore: boolean;
  page: number;
  error: string | null;
}

const initialState: ReelState = {
  reels: [],
  trending: [],
  loading: false,
  loadingMore: false,
  hasMore: true,
  page: 1,
  error: null,
};

export const fetchReels = createAsyncThunk(
  'reel/fetchAll',
  async ({ page = 1, per_page = 10 }: { page?: number; per_page?: number }) => {
    const res = await reelService.getReels(page, per_page);
    return res.data.items;
  }
);

export const fetchTrendingReels = createAsyncThunk(
  'reel/fetchTrending',
  async (limit: number = 20) => {
    const res = await reelService.getTrending(limit);
    return res.data;
  }
);

export const toggleLikeReel = createAsyncThunk(
  'reel/toggleLike',
  async (id: string) => {
    await reelService.likeReel(id);
    return id;
  }
);

const reelSlice = createSlice({
  name: 'reel',
  initialState,
  reducers: {
    resetReels(state) {
      state.reels = [];
      state.page = 1;
      state.hasMore = true;
      state.loadingMore = false;
      state.error = null;
    },
  },
  extraReducers: builder => {
    builder

      // FETCH REELS
      .addCase(fetchReels.pending, state => {
        if (state.page > 1) {
          state.loadingMore = true;
        } else {
          state.loading = true;
        }
      })
      .addCase(fetchReels.fulfilled, (state, action) => {
        const page = action.meta.arg.page ?? 1;
        const perPage = action.meta.arg.per_page ?? 10;

        if (page > 1) {
          const nextItems = action.payload.filter(
            incoming =>
              !state.reels.some(existing => existing.id === incoming.id),
          );
          state.reels = [...state.reels, ...nextItems];
        } else {
          state.reels = action.payload;
        }

        state.page = page;
        state.hasMore = action.payload.length >= perPage;
        state.loading = false;
        state.loadingMore = false;
      })
      .addCase(fetchReels.rejected, (state, action) => {
        state.loading = false;
        state.loadingMore = false;
        state.error = action.error.message || 'Reels error';
      })

      // TRENDING
      .addCase(fetchTrendingReels.fulfilled, (state, action) => {
        state.trending = action.payload;
      })

      // LIKE (optimistic update)
      .addCase(toggleLikeReel.fulfilled, (state, action) => {
        const reel = state.reels.find(r => r.id === action.payload);
        const trending = state.trending.find(r => r.id === action.payload);

        if (reel) {
          reel.is_liked = !reel.is_liked;
          reel.likes_count += reel.is_liked ? 1 : -1;
        }

        if (trending) {
          trending.is_liked = !trending.is_liked;
          trending.likes_count += trending.is_liked ? 1 : -1;
        }
      });
  },
});

export const { resetReels } = reelSlice.actions;
export default reelSlice.reducer;

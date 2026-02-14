import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { reelService, Reel } from '../../service/reel.service';

interface ReelState {
  reels: Reel[];
  trending: Reel[];
  loading: boolean;
  error: string | null;
}

const initialState: ReelState = {
  reels: [],
  trending: [],
  loading: false,
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
  reducers: {},
  extraReducers: builder => {
    builder

      // FETCH REELS
      .addCase(fetchReels.pending, state => {
        state.loading = true;
      })
      .addCase(fetchReels.fulfilled, (state, action) => {
        state.reels = action.payload;
        state.loading = false;
      })
      .addCase(fetchReels.rejected, (state, action) => {
        state.loading = false;
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

export default reelSlice.reducer;

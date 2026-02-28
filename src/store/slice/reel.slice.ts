import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import { reelService, Reel } from '../../service/reel.service';
import { RootState } from '..';

interface ReelState {
  reels: Reel[];
  trending: Reel[];
  loading: boolean;
  loadingMore: boolean;
  hasMore: boolean;
  page: number;
  error: string | null;
  currentIndex: number;
  isTrending: boolean;
  streamUrlMap: Record<string, string>;
  streamLoadingMap: Record<string, boolean>;
  likePending: Record<string, boolean>;
}

const initialState: ReelState = {
  reels: [],
  trending: [],
  loading: false,
  loadingMore: false,
  hasMore: true,
  page: 1,
  error: null,
  currentIndex: 0,
  isTrending: false,
  streamUrlMap: {},
  streamLoadingMap: {},
  likePending: {},
};

const mergeUniqueReels = (current: Reel[], incoming: Reel[]) => {
  if (incoming.length === 0) return current;

  const seen = new Set(current.map((item) => item.id));
  const uniqueIncoming = incoming.filter((item) => !seen.has(item.id));

  return uniqueIncoming.length > 0 ? [...current, ...uniqueIncoming] : current;
};

export const fetchReels = createAsyncThunk(
  'reel/fetchAll',
  async ({ page = 1, per_page = 10 }: { page?: number; per_page?: number }) => {
    return reelService.getReels(page, per_page);
  },
);

export const fetchTrendingReels = createAsyncThunk(
  'reel/fetchTrending',
  async (limit: number = 20) => {
    return reelService.getTrending(limit);
  },
);

export const fetchInitialReels = createAsyncThunk(
  'reel/fetchInitial',
  async () => {
    const [trending, feed] = await Promise.all([
      reelService.getTrending(10),
      reelService.getReels(1, 15),
    ]);

    return { trending, feed };
  },
);

export const fetchMoreReels = createAsyncThunk(
  'reel/fetchMore',
  async (_, { getState }) => {
    const state = getState() as RootState;
    const { page } = state.reel;
    const data = await reelService.getReels(page, 15);
    return data;
  },
  {
    condition: (_, { getState }) => {
      const state = getState() as RootState;
      const { loading, loadingMore, hasMore, isTrending } = state.reel;
      if (loading || loadingMore || !hasMore || isTrending) return false;
      return true;
    },
  },
);

export const fetchStreamUrl = createAsyncThunk(
  'reel/fetchStreamUrl',
  async (reelId: string, { getState }) => {
    const state = getState() as RootState;
    const existing = state.reel.streamUrlMap[reelId];
    if (existing) {
      return { reelId, url: existing, fromCache: true };
    }

    const url = await reelService.getReelStreamingUrl(reelId);
    return { reelId, url, fromCache: false };
  },
  {
    condition: (reelId, { getState }) => {
      const state = getState() as RootState;
      if (state.reel.streamUrlMap[reelId]) return false;
      if (state.reel.streamLoadingMap[reelId]) return false;
      return true;
    },
  },
);

export const toggleLikeReel = createAsyncThunk(
  'reel/toggleLike',
  async ({ reelId, isLiked }: { reelId: string; isLiked: boolean }) => {
    const success = isLiked
      ? await reelService.unlikeReel(reelId)
      : await reelService.likeReel(reelId);

    return { reelId, isLiked, success };
  },
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
      state.currentIndex = 0;
      state.isTrending = false;
      state.error = null;
    },
    setCurrentIndex(state, action: { payload: number }) {
      state.currentIndex = Math.max(0, action.payload || 0);
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchReels.pending, (state, action) => {
        const page = action.meta.arg.page ?? 1;
        if (page > 1) {
          state.loadingMore = true;
        } else {
          state.loading = true;
        }
      })
      .addCase(fetchReels.fulfilled, (state, action) => {
        const page = action.meta.arg.page ?? 1;
        const perPage = action.meta.arg.per_page ?? 10;

        if (page > 1) {
          state.reels = mergeUniqueReels(state.reels, action.payload);
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
      .addCase(fetchTrendingReels.fulfilled, (state, action) => {
        state.trending = action.payload;
      })
      .addCase(fetchInitialReels.pending, (state) => {
        state.loading = true;
        state.loadingMore = false;
        state.currentIndex = 0;
        state.page = 1;
        state.hasMore = true;
      })
      .addCase(fetchInitialReels.fulfilled, (state, action) => {
        const { feed, trending } = action.payload;
        state.trending = trending;

        if (feed.length === 0 && trending.length > 0) {
          state.reels = trending;
          state.isTrending = true;
          state.hasMore = false;
          state.page = 1;
          state.loading = false;
          return;
        }

        state.reels = mergeUniqueReels(feed, trending);
        state.isTrending = false;
        state.page = 2;
        state.hasMore = feed.length === 15;
        state.loading = false;
      })
      .addCase(fetchInitialReels.rejected, (state, action) => {
        state.loading = false;
        state.loadingMore = false;
        state.error = action.error.message || 'Reels error';
      })
      .addCase(fetchMoreReels.pending, (state) => {
        state.loadingMore = true;
      })
      .addCase(fetchMoreReels.fulfilled, (state, action) => {
        state.reels = mergeUniqueReels(state.reels, action.payload);
        state.page += 1;
        state.hasMore = action.payload.length === 15;
        state.loadingMore = false;
      })
      .addCase(fetchMoreReels.rejected, (state, action) => {
        state.loadingMore = false;
        state.error = action.error.message || 'Reels error';
      })
      .addCase(fetchStreamUrl.pending, (state, action) => {
        const reelId = action.meta.arg;
        state.streamLoadingMap[reelId] = true;
      })
      .addCase(fetchStreamUrl.fulfilled, (state, action) => {
        const { reelId, url } = action.payload;
        state.streamLoadingMap[reelId] = false;
        if (url) {
          state.streamUrlMap[reelId] = url;
        }
      })
      .addCase(fetchStreamUrl.rejected, (state, action) => {
        const reelId = action.meta.arg;
        state.streamLoadingMap[reelId] = false;
      })
      .addCase(toggleLikeReel.pending, (state, action) => {
        const { reelId, isLiked } = action.meta.arg;
        const willBeLiked = !isLiked;
        state.likePending[reelId] = true;

        const applyOptimistic = (items: Reel[]) => {
          const reel = items.find((r) => r.id === reelId);
          if (!reel) return;
          reel.is_liked = willBeLiked;
          reel.likes_count = Math.max(0, reel.likes_count + (willBeLiked ? 1 : -1));
        };

        applyOptimistic(state.reels);
        applyOptimistic(state.trending);
      })
      .addCase(toggleLikeReel.fulfilled, (state, action) => {
        const { reelId, isLiked, success } = action.payload;
        state.likePending[reelId] = false;

        if (!success) {
          const rollback = (items: Reel[]) => {
            const reel = items.find((r) => r.id === reelId);
            if (!reel) return;
            reel.is_liked = isLiked;
            reel.likes_count = Math.max(0, reel.likes_count + (isLiked ? 1 : -1));
          };

          rollback(state.reels);
          rollback(state.trending);
        }
      })
      .addCase(toggleLikeReel.rejected, (state, action) => {
        const { reelId, isLiked } = action.meta.arg;
        state.likePending[reelId] = false;

        const rollback = (items: Reel[]) => {
          const reel = items.find((r) => r.id === reelId);
          if (!reel) return;
          reel.is_liked = isLiked;
          reel.likes_count = Math.max(0, reel.likes_count + (isLiked ? 1 : -1));
        };

        rollback(state.reels);
        rollback(state.trending);
      });
  },
});

export const { resetReels, setCurrentIndex } = reelSlice.actions;
export default reelSlice.reducer;

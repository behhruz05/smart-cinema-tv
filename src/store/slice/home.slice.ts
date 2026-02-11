import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { homeService } from '../../service/home.service';
import { Carousel } from '../../types/home';

interface HomeState {
  carousels: Carousel[];
  loading: boolean;
  error: string | null;
}

const initialState: HomeState = {
  carousels: [],
  loading: false,
  error: null,
};

export const fetchCarousels = createAsyncThunk(
  'home/fetchCarousels',
  async (_, { rejectWithValue }) => {
    try {
      const res = await homeService.getCarousels();
      return res.data;
    } catch (e: any) {
      return rejectWithValue(e.message);
    }
  }
);

const homeSlice = createSlice({
  name: 'home',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchCarousels.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchCarousels.fulfilled, (state, action) => {
        state.loading = false;
        state.carousels = action.payload;
      })
      .addCase(fetchCarousels.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });
  },
});

export default homeSlice.reducer;

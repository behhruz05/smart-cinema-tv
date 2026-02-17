import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { api } from '../../shared/hooks/api';

export interface User {
  id: string;
  full_name: string;
  phone: string;
  avatar_url: string;
  birth_date: string;
  gender: string;
  language: string;
}

type Status = 'idle' | 'loading' | 'authenticated' | 'unauthenticated';

interface AuthState {
  user: User | null;
  status: Status;
}

const initialState: AuthState = {
  user: null,
  status: 'idle',
};

export const fetchMe = createAsyncThunk(
  'auth/fetchMe',
  async (_, { rejectWithValue }) => {
    try {
      const res = await api<{ data: User }>('/auth/me', {
        headers: { 'Accept-Language': 'uz' },
      });
      return res.data;
    } catch (e: any) {
      return rejectWithValue(e.message);
    }
  }
);

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    logoutState(state) {
      state.user = null;
      state.status = 'unauthenticated';
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchMe.pending, (state) => {
        state.status = 'loading';
      })
      .addCase(fetchMe.fulfilled, (state, action) => {
        state.user = action.payload;
        state.status = 'authenticated';
      })
      .addCase(fetchMe.rejected, (state) => {
        state.user = null;
        state.status = 'unauthenticated';
      });
  },
});

export const { logoutState } = authSlice.actions;
export default authSlice.reducer;

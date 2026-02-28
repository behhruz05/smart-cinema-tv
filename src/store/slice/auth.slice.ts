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

type ApiResponse<T> = {
  success: boolean;
  data: T;
  message?: string;
};

const initialState: AuthState = {
  user: null,
  status: 'idle',
};

export const fetchMe = createAsyncThunk(
  'auth/fetchMe',
  async (_, { rejectWithValue }) => {
    try {
      const meRes = await api<ApiResponse<User>>('/auth/me');
      return meRes.data;
    } catch (e: any) {
      try {
        const profileRes = await api<ApiResponse<User>>('/auth/profile');
        return profileRes.data;
      } catch {
        return rejectWithValue(e.message);
      }
    }
  }
);

export const updateProfileLanguage = createAsyncThunk(
  'auth/updateProfileLanguage',
  async (language: 'uz' | 'ru' | 'en', { rejectWithValue }) => {
    try {
      const res = await api<ApiResponse<User>>('/auth/profile', {
        method: 'PATCH',
        body: { language },
      });
      return res.data;
    } catch (e: any) {
      return rejectWithValue(e.message);
    }
  },
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
      })
      .addCase(updateProfileLanguage.fulfilled, (state, action) => {
        state.user = action.payload;
        state.status = 'authenticated';
      });
  },
});

export const { logoutState } = authSlice.actions;
export default authSlice.reducer;

import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { searchService } from '../../service/search.service';

interface Genre {
  id: string;
  name: string;
  slug: string;
}

type Status = 'idle' | 'loading' | 'success' | 'error';

interface SearchState {
  searchResults: any[];
  popular: any[];
  genreMovies: any[];
  genres: Genre[];
  selectedGenre: string | null;

  popularStatus: Status;
  searchStatus: Status;
  genreStatus: Status;

  query: string;
  error: string | null;
}

const initialState: SearchState = {
  searchResults: [],
  popular: [],
  genreMovies: [],
  genres: [],
  selectedGenre: null,

  popularStatus: 'idle',
  searchStatus: 'idle',
  genreStatus: 'idle',

  query: '',
  error: null,
};

export const fetchPopularMovies = createAsyncThunk(
  'search/popular',
  async () => {
    const res = await searchService.getMovies({
      endpoint: 'popular',
      page: 1,
    });
    return res.data;
  }
);

export const fetchSearchMovies = createAsyncThunk(
  'search/searchMovies',
  async (query: string) => {
    const res = await searchService.getMovies({
      endpoint: 'search',
      page: 1,
      q: query,
    });
    return res.data;
  }
);

export const fetchGenres = createAsyncThunk(
  'search/genres',
  async () => {
    const res = await searchService.getGenres('uz');
    return res.data.items;
  }
);

export const fetchGenreMovies = createAsyncThunk(
  'search/genreMovies',
  async (genre_id: string) => {
    const res = await searchService.getMoviesByGenre(
      genre_id,
      1,
      20,
      'uz'
    );
    return res.data;
  }
);

const searchSlice = createSlice({
  name: 'search',
  initialState,
  reducers: {
    setQuery(state, action: PayloadAction<string>) {
      state.query = action.payload;
    },
    clearSearch(state) {
      state.searchResults = [];
      state.query = '';
      state.searchStatus = 'idle';
    },
    setSelectedGenre(state, action: PayloadAction<string | null>) {
      state.selectedGenre = action.payload;
      if (action.payload === null) {
        state.genreMovies = [];
        state.genreStatus = 'idle';
      }
    },
  },
  extraReducers: (builder) => {
    builder

      // POPULAR
      .addCase(fetchPopularMovies.pending, (state) => {
        state.popularStatus = 'loading';
      })
      .addCase(fetchPopularMovies.fulfilled, (state, action) => {
        state.popular = action.payload;
        state.popularStatus = 'success';
      })
      .addCase(fetchPopularMovies.rejected, (state) => {
        state.popularStatus = 'error';
      })

      // SEARCH
      .addCase(fetchSearchMovies.pending, (state) => {
        state.searchStatus = 'loading';
      })
      .addCase(fetchSearchMovies.fulfilled, (state, action) => {
        state.searchResults = action.payload;
        state.searchStatus = 'success';
      })
      .addCase(fetchSearchMovies.rejected, (state) => {
        state.searchStatus = 'error';
      })

      // GENRES
      .addCase(fetchGenres.pending, (state) => {
        state.genreStatus = 'loading';
      })
      .addCase(fetchGenres.fulfilled, (state, action) => {
        state.genres = action.payload;
        state.genreStatus = 'success';
      })
      .addCase(fetchGenres.rejected, (state) => {
        state.genreStatus = 'error';
      })

      // GENRE MOVIES
      .addCase(fetchGenreMovies.pending, (state) => {
        state.genreStatus = 'loading';
      })
      .addCase(fetchGenreMovies.fulfilled, (state, action) => {
        state.genreMovies = action.payload;
        state.genreStatus = 'success';
      })
      .addCase(fetchGenreMovies.rejected, (state) => {
        state.genreStatus = 'error';
      });
  },
});

export const { setQuery, clearSearch, setSelectedGenre } =
  searchSlice.actions;

export default searchSlice.reducer;

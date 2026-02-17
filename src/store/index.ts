import { configureStore } from '@reduxjs/toolkit';
import homeReducer from './slice/home.slice';
import uiReducer from './slice/ui.slice';
import authReducer from './slice/atuh.slice'
import movieReducer from './slice/movie.slice';
import reelReducer from './slice/reel.slice';

export const store = configureStore({
  reducer: {
    home: homeReducer,
    ui: uiReducer,
    movie: movieReducer,
    auth: authReducer,
    reel: reelReducer,
  },
  devTools: __DEV__,
  middleware: getDefaultMiddleware =>
    getDefaultMiddleware({
      serializableCheck: false,
    }),
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

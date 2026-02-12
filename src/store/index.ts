import { configureStore } from '@reduxjs/toolkit';
import homeReducer from './slice/home.slice';
import uiReducer from './slice/ui.slice';
import searchReducer from './slice/search.slice';

export const store = configureStore({
  reducer: {
    home: homeReducer,
    ui: uiReducer,
    search: searchReducer,
  },
  devTools: __DEV__,
  middleware: getDefaultMiddleware =>
    getDefaultMiddleware({
      serializableCheck: false,
    }),
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

import { configureStore } from '@reduxjs/toolkit';
import homeReducer from './slice/home.slice';
import uiReducer from './slice/ui.slice';

export const store = configureStore({
  reducer: {
    home: homeReducer,
    ui: uiReducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

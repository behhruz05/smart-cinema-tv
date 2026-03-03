import { configureStore, Middleware } from '@reduxjs/toolkit';
import homeReducer from './slice/home.slice';
import uiReducer from './slice/ui.slice';
import authReducer from './slice/auth.slice'
import movieReducer from './slice/movie.slice';
import reelReducer from './slice/reel.slice';
import tvReducer from './slice/tv.slice';
import seriesReducer from './slice/series.slice';
import { showErrorToast, showWarningToast } from './slice/ui.slice';
import i18n from '../i18n';

const isTechnicalErrorMessage = (message: string) => {
  const lower = message.toLowerCase();
  return (
    lower.includes('typeerror') ||
    lower.includes('referenceerror') ||
    lower.includes('syntaxerror') ||
    lower.includes('network request failed') ||
    lower.includes('failed to fetch') ||
    lower.includes('json parse') ||
    lower.includes('undefined is not an object')
  );
};

const normalizeToastMessage = (raw?: string) => {
  if (!raw) return '';
  const trimmed = raw.trim();
  if (!trimmed || trimmed === 'Rejected') return '';
  if (isTechnicalErrorMessage(trimmed)) return i18n.t('errors.server');
  return trimmed;
};

const errorToastMiddleware: Middleware = storeApi => next => action => {
  const result = next(action);

  if (
    action &&
    typeof action === 'object' &&
    'type' in action &&
    typeof action.type === 'string' &&
    action.type.endsWith('/rejected')
  ) {
    const rejectedAction = action as {
      payload?: unknown;
      error?: { message?: string; name?: string };
      meta?: { aborted?: boolean };
    };

    const isAborted =
      rejectedAction.meta?.aborted ||
      rejectedAction.error?.name === 'AbortError';

    const message =
      typeof rejectedAction.payload === 'string'
        ? rejectedAction.payload
        : rejectedAction.error?.message;
    const normalizedMessage = normalizeToastMessage(message);
    const isUnauthorized =
      message === 'UNAUTHORIZED' ||
      normalizedMessage === 'UNAUTHORIZED';

    if (!isAborted && isUnauthorized) {
      storeApi.dispatch(showWarningToast(i18n.t('errors.unauthorized')));
      return result;
    }

    if (!isAborted && normalizedMessage) {
      storeApi.dispatch(showErrorToast(normalizedMessage));
    }
  }

  return result;
};

export const store = configureStore({
  reducer: {
    home: homeReducer,
    ui: uiReducer,
    movie: movieReducer,
    auth: authReducer,
    reel: reelReducer,
    tv: tvReducer,
    series: seriesReducer,
  },
  devTools: __DEV__,
  middleware: getDefaultMiddleware =>
    getDefaultMiddleware({
      serializableCheck: false,
    }).concat(errorToastMiddleware),
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

import React, { createContext, useContext, useEffect, useState } from 'react';
import { Provider } from 'react-redux';
import { AppState, useColorScheme } from 'react-native';
import { setLogoutHandler } from '../../features/auth/authBridge';
import { tokenStorage } from '../../shared/lib/tokenStorage';
import { appSettingsStorage } from '../../shared/lib/appSettingsStorage';
import { store } from '../../store';
import { fetchMe } from '../../store/slice/atuh.slice';

type AuthContextType = {
  token: string | null;
  isLoading: boolean;
  setToken: (token: string | null) => Promise<void>;
  logout: () => Promise<void>;
  themeMode: 'dark' | 'system';
  resolvedTheme: 'dark' | 'light';
  setThemeMode: (mode: 'dark' | 'system') => Promise<void>;
};

const AuthContext = createContext<AuthContextType>(null as any);

export function AppProviders({ children }: { children: React.ReactNode }) {
  const [token, setTokenState] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [themeMode, setThemeModeState] = useState<'dark' | 'system'>('system');
  const systemTheme = useColorScheme();
  const dispatch = store.dispatch;
  const resolvedTheme: 'dark' | 'light' =
    themeMode === 'system'
      ? systemTheme === 'dark'
        ? 'dark'
        : 'light'
      : 'dark';


  const setToken = async (newToken: string | null) => {
    if (newToken) {
      await tokenStorage.set(newToken);
      setTokenState(newToken);
    } else {
      await tokenStorage.remove();
      setTokenState(null);
    }
  };

  const logout = async () => {
    const shouldClearCache = await appSettingsStorage.getBoolean(
      'clearCacheOnExit',
      false
    );
    if (shouldClearCache) {
      await appSettingsStorage.clearCacheSettings();
    }
    await tokenStorage.remove();
    setTokenState(null);
  };

useEffect(() => {
  const bootstrap = async () => {
    try {
      const savedToken = await tokenStorage.get();
      const savedTheme = await appSettingsStorage.getThemeMode('system');
      setThemeModeState(savedTheme);

      if (savedToken) {
        setTokenState(savedToken);

        await dispatch(fetchMe());
      }
    } finally {
      setIsLoading(false);
    }
  };

  bootstrap();
}, []);

  const setThemeMode = async (mode: 'dark' | 'system') => {
    setThemeModeState(mode);
    await appSettingsStorage.setThemeMode(mode);
  };


  useEffect(() => {
    setLogoutHandler(logout);
  }, []);

  useEffect(() => {
    const subscription = AppState.addEventListener(
      'change',
      async (nextState) => {
        if (nextState !== 'background') return;

        const shouldClearCache =
          await appSettingsStorage.getBoolean(
            'clearCacheOnExit',
            false
          );

        if (shouldClearCache) {
          await appSettingsStorage.clearCacheSettings();
        }
      }
    );

    return () => subscription.remove();
  }, []);

  return (
    <Provider store={store}>
      <AuthContext.Provider
        value={{
          token,
          isLoading,
          setToken,
          logout,
          themeMode,
          resolvedTheme,
          setThemeMode,
        }}
      >
        {children}
      </AuthContext.Provider>
    </Provider>
  );
}

export const useAuth = () => useContext(AuthContext);

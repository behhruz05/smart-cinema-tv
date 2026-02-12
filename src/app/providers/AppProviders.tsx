import React, { createContext, useContext, useEffect, useState } from 'react';
import { Provider } from 'react-redux';
import { store } from '../../store';
import { setLogoutHandler } from '../../features/auth/authBridge';
import { tokenStorage } from '../../shared/lib/tokenStorage';

type AuthContextType = {
  token: string | null;
  isLoading: boolean;
  setToken: (token: string | null) => Promise<void>;
  logout: () => Promise<void>;
};

const AuthContext = createContext<AuthContextType>(null as any);

export function AppProviders({ children }: { children: React.ReactNode }) {
  const [token, setTokenState] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

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
    await tokenStorage.remove();
    setTokenState(null);
  };

  useEffect(() => {
    const bootstrap = async () => {
      try {
        const savedToken = await tokenStorage.get();
        if (savedToken) {
          setTokenState(savedToken);
        }
      } finally {
        setIsLoading(false);
      }
    };

    bootstrap();
  }, []);

  useEffect(() => {
    setLogoutHandler(logout);
  }, []);

  return (
    <Provider store={store}>
      <AuthContext.Provider value={{ token, isLoading, setToken, logout }}>
        {children}
      </AuthContext.Provider>
    </Provider>
  );
}

export const useAuth = () => useContext(AuthContext);

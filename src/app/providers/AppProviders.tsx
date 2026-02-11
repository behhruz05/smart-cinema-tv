import React, { createContext, useContext, useEffect, useState } from 'react';
import { Provider } from 'react-redux';
import { store } from '../../store';

type AuthContextType = {
  token: string | null;
  isLoading: boolean;
  setToken: (token: string | null) => void;
};

const AuthContext = createContext<AuthContextType>(null as any);

export function AppProviders({ children }: { children: React.ReactNode }) {
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const bootstrap = async () => {
      try {
        await new Promise(res => setTimeout(() => res(undefined), 5000));
      } finally {
        setIsLoading(false);
      }
    };

    bootstrap();
  }, []);

  return (
    <Provider store={store}>
      <AuthContext.Provider value={{ token, isLoading, setToken }}>
        {children}
      </AuthContext.Provider>
    </Provider>
  );
}

export const useAuth = () => useContext(AuthContext);

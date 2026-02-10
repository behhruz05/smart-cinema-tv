import React, { ReactNode } from 'react';
import { SafeAreaProvider } from 'react-native-safe-area-context';

type Props = {
  children: ReactNode;
};

export function AppProviders({ children }: Props) {
  return <SafeAreaProvider>{children}</SafeAreaProvider>;
}

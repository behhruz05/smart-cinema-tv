import React from 'react';
import { useAuth } from '../providers/AppProviders';
import { AuthNavigator } from './AuthNavigator';
import { MainNavigator } from './MainNavigator';
import { LoaderScreen } from '../../features/loader/screens/LoaderScreen';

export function RootNavigator() {
  const { token, isLoading } = useAuth();

  if (isLoading) return <LoaderScreen />;

  if (!token) return <AuthNavigator />;

  return <MainNavigator />;
}

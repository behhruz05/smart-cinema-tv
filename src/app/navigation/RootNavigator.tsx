import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

import { LoaderScreen } from '../../features/loader/screens/LoaderScreen';

import { useAuth } from '../providers/AppProviders';
import { AuthNavigator } from './AuthNavigator';
import { MainNavigator } from './MainNavigator';

export type RootStackParamList = {
  Loader: undefined;
  Login: undefined;
  Home: undefined;
};

const Stack = createNativeStackNavigator<RootStackParamList>();

export function RootNavigator() {
  const { token, isLoading } = useAuth();

  if (isLoading) {
    return <LoaderScreen />;
  }

  return <MainNavigator />;
}

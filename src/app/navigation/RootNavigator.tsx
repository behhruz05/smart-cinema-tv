import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

import { LoaderScreen } from '../../features/loader/screens/LoaderScreen';
import { LoginScreen } from '../../features/auth/screens/LoginScreen';
import { HomeScreen } from '../../features/home/screens/HomeScreen';

import { useAuth } from '../providers/AppProviders';

export type RootStackParamList = {
  Loader: undefined;
  Login: undefined;
  Home: undefined;
};

const Stack = createNativeStackNavigator<RootStackParamList>();

export function RootNavigator() {
  const { token, isLoading } = useAuth();

  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      {isLoading ? (
        <Stack.Screen name="Loader" component={LoaderScreen} />
      ) : token ? (
        <Stack.Screen name="Home" component={HomeScreen} />
      ) : (
        <Stack.Screen name="Login" component={LoginScreen} />
      )}
    </Stack.Navigator>
  );
}

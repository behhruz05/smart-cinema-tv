import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { LoaderScreen } from '../../features/loader/screens/LoaderScreen';
import { LoginScreen } from '../../features/auth/screens/LoginScreen';

export type RootStackParamList = {
  Loader: undefined;
  Enter: undefined;
  Login: undefined;
};

const Stack = createNativeStackNavigator<RootStackParamList>();

export function RootNavigator() {
  return (
    <Stack.Navigator
      initialRouteName="Loader"
      screenOptions={{ headerShown: false }}
    >
      <Stack.Screen name="Loader" component={LoaderScreen} />
      <Stack.Screen name="Login" component={LoginScreen} />
    </Stack.Navigator>
  );
}

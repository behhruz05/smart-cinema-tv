import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { HomeScreen } from '../../features/home/screens/HomeScreen';
import { SearchScreen } from '../../features/search/screens/SearchScreen';
import { MainLayout } from '../../shared/loyaut/MainLayout';

export type MainStackParamList = {
  Home: undefined;
  Search: undefined;
};

const Stack = createNativeStackNavigator<MainStackParamList>();

function HomeWithLayout() {
  return (
    <MainLayout>
      <HomeScreen />
    </MainLayout>
  );
}

export function MainNavigator() {
  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
      }}
    >
      <Stack.Screen name="Home" component={HomeWithLayout} />
      <Stack.Screen name="Search" component={SearchScreen} />
    </Stack.Navigator>
  );
}

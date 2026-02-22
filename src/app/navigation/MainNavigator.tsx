import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

import {
  RootStackParamList,
  ContentStackParamList,
} from '../../types/navigations';


import { HomeScreen } from '../../features/home/screens/HomeScreen';
import { ProfileScreen } from '../../features/profile/screens/ProfileScreen';
import { SearchScreen } from '../../features/search/screens/SearchScreen';
import { GenreScreen } from '../../features/genre/screens/GenreScreen';
import { ReelScreen } from '../../features/reel/screens/ReelScreen';
import { MainLayout } from '../../shared/layout/MainLayout';
import { MoviesScreen } from '../../features/movies/screens/MoviesScreen';
import { SettingsMainScreen } from '../../features/settings/screens/SettingsMainScreen';
import { MovieDetailScreen } from '../../features/movies/screens/MovieDetailScreen';
import { TvChannelsScreen } from '../../features/tv-channels/screens/TvChannelsScreen';
import { PlayerScreen } from '../../features/player/screens/PlayerScreen';

const RootStack =
  createNativeStackNavigator<RootStackParamList>();

const ContentStack =
  createNativeStackNavigator<ContentStackParamList>();

function ContentNavigator() {
  return (
    <ContentStack.Navigator
    initialRouteName="Home"
      screenOptions={{
        headerShown: false,
        animation: 'none',
      }}
    >
      <ContentStack.Screen name="Home" component={HomeScreen} />
      <ContentStack.Screen name="TV" component={TvChannelsScreen} />
      <ContentStack.Screen name="Movies" component={MoviesScreen} />
      <ContentStack.Screen name="Reels" component={ReelScreen} />
      <ContentStack.Screen name="Profile" component={ProfileScreen} />
      <ContentStack.Screen name="Settings" component={SettingsMainScreen} />
    </ContentStack.Navigator>
  );
}

function MainWithLayout() {
  return (
    <MainLayout>
      <ContentNavigator />
    </MainLayout>
  );
}

export function MainNavigator() {
  return (
    <RootStack.Navigator
      screenOptions={{
        headerShown: false,
        animation: 'none',
      }}>
      <RootStack.Screen name="Main" component={MainWithLayout} />
      <RootStack.Screen name="Search" component={SearchScreen} />
      <RootStack.Screen name="Genre" component={GenreScreen} />
      <RootStack.Screen name="MovieDetail" component={MovieDetailScreen} />
      <RootStack.Screen name="Player" component={PlayerScreen} />
    </RootStack.Navigator>
  );
}

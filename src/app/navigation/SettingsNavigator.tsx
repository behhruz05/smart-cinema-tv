import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { SettingsStackParamList } from '../../types/settings';
import { SettingsMainScreen } from '../../features/settings/screens/SettingsMainScreen';
import InterfaceLanguageScreen from '../../features/settings/screens/InterfaceLanguage';
import PlaybackScreen from '../../features/settings/screens/PlaybackScreen';
import ParentalControlScreen from '../../features/settings/screens/ParentalControlsScreen';
import SupportScreen from '../../features/settings/screens/SupportScreen';
import SystemCacheScreen from '../../features/settings/screens/SystemCacheScreen';

const Stack =
  createNativeStackNavigator<SettingsStackParamList>();

export function SettingsNavigator() {
  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
        animation: 'none',
      }}
    >
      <Stack.Screen
        name="SettingsMain"
        component={SettingsMainScreen}
      />
      <Stack.Screen
        name="InterfaceLanguage"
        component={InterfaceLanguageScreen}
      />
      <Stack.Screen
        name="Playback"
        component={PlaybackScreen}
      />
      <Stack.Screen
        name="ParentalControl"
        component={ParentalControlScreen}
      />
      <Stack.Screen
        name="Support"
        component={SupportScreen}
      />
      <Stack.Screen
        name="SystemCache"
        component={SystemCacheScreen}
      />
    </Stack.Navigator>
  );
}

import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  Platform,
} from 'react-native';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../../../app/providers/AppProviders';

import ParentalControlScreen from './ParentalControlsScreen';
import SupportScreen from './SupportScreen';
import InterfaceLanguageScreen from './InterfaceLanguage';
import PlaybackScreen from './PlaybackScreen';
import SystemCacheScreen from './SystemCacheScreen';
import LogoutModal from './LogoutModal';

export function SettingsMainScreen() {
  const { t } = useTranslation();
  const { resolvedTheme } = useAuth();
  const isTV = Platform.isTV;
  const isLight = resolvedTheme === 'light';

  const [active, setActive] = useState<string>('InterfaceLanguage');
  const [focused, setFocused] = useState<string | null>(null);
  const [showLogoutModal, setShowLogoutModal] = useState(false);

  const items = [
    { title: t('settings.interface_language'), route: 'InterfaceLanguage' },
    { title: t('settings.playback'), route: 'Playback' },
    { title: t('settings.parental_control'), route: 'ParentalControl' },
    { title: t('settings.support'), route: 'Support' },
    { title: t('settings.system_cache'), route: 'SystemCache' },
    { title: t('settings.logout'), route: 'Logout' },
  ];

  const renderContent = () => {
    switch (active) {
      case 'InterfaceLanguage':
        return <InterfaceLanguageScreen />;
      case 'Playback':
        return <PlaybackScreen />;
      case 'ParentalControl':
        return <ParentalControlScreen />;
      case 'Support':
        return <SupportScreen />;
      case 'SystemCache':
        return <SystemCacheScreen />;
      default:
        return null;
    }
  };

  return (
    <View style={[styles.container, isLight && styles.containerLight]}>
      {/* LEFT SIDEBAR */}
      <View style={[styles.sidebar, isLight && styles.sidebarLight]}>
        {items.map((item, index) => {
          const isActive = active === item.route;
          const isFocused = focused === item.route;

          return (
            <Pressable
              key={item.route}
              focusable={isTV}
              hasTVPreferredFocus={index === 0}
              onFocus={() => setFocused(item.route)}
              onBlur={() => setFocused(null)}
              onPress={() => {
                if (item.route === 'Logout') {
                  setShowLogoutModal(true);
                } else {
                  setActive(item.route);
                }
              }}
              style={[
                styles.menuItem,
                isLight && styles.menuItemLight,
                isActive && styles.activeItem,
                isFocused && styles.focusedItem,
                isLight && isFocused && styles.focusedItemLight,
              ]}
            >
              <Text
                style={[
                  styles.menuText,
                  isLight && styles.menuTextLight,
                  isActive && styles.activeText,
                ]}
              >
                {item.title}
              </Text>
            </Pressable>
          );
        })}
      </View>

      {/* RIGHT CONTENT */}
      <View style={[styles.content, isLight && styles.contentLight]}>
        {renderContent()}
      </View>

      {/* LOGOUT MODAL */}
      {showLogoutModal && (
        <LogoutModal onCancel={() => setShowLogoutModal(false)} />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    flexDirection: 'row',
    backgroundColor: '#101010',
    paddingVertical: 20,
  },
  containerLight: {
    backgroundColor: '#f4f4f5',
  },

  sidebar: {
    width: 300,
    paddingHorizontal: 20,
  },
  sidebarLight: {
    borderRightWidth: 1,
    borderRightColor: '#e5e7eb',
  },

  menuItem: {
    paddingVertical: 12,
    paddingHorizontal: 14,
    borderRadius: 12,
    marginBottom: 14,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  menuItemLight: {
    backgroundColor: '#ffffff',
  },

  activeItem: {
    backgroundColor: '#ffffff',
  },

  activeText: {
    color: '#000000',
    fontWeight: '600',
  },

  focusedItem: {
    borderColor: '#ffffff',
  },
  focusedItemLight: {
    borderColor: '#2563eb',
  },

  menuText: {
    color: '#ffffff',
    fontSize: 16,
  },
  menuTextLight: {
    color: '#111827',
  },

  content: {
    flex: 1,
    paddingHorizontal: 40,
  },
  contentLight: {
    backgroundColor: '#f4f4f5',
  },
});

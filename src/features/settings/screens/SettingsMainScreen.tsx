import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  Platform,
} from 'react-native';

import ParentalControlScreen from './ParentalControlsScreen';
import SupportScreen from './SupportScreen';
import InterfaceLanguageScreen from './InterfaceLanguage';
import PlaybackScreen from './PlaybackScreen';
import SystemCacheScreen from './SystemCacheScreen';
import LogoutModal from './LogoutModal';

export function SettingsMainScreen() {
  const isTV = Platform.isTV;

  const [active, setActive] = useState<string>('InterfaceLanguage');
  const [focused, setFocused] = useState<string | null>(null);
  const [showLogoutModal, setShowLogoutModal] = useState(false);

  const items = [
    { title: 'Интерфейс и язык', route: 'InterfaceLanguage' },
    { title: 'Воспроизведение', route: 'Playback' },
    { title: 'Родительский контроль', route: 'ParentalControl' },
    { title: 'Поддержка и о прилож.', route: 'Support' },
    { title: 'Система и кэш', route: 'SystemCache' },
    { title: 'Выход', route: 'Logout' },
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
    <View style={styles.container}>
      {/* LEFT SIDEBAR */}
      <View style={styles.sidebar}>
        {items.map((item, index) => {
          const isActive = active === item.route;
          const isFocused = focused === item.route;

          return (
            <Pressable
              key={item.title}
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
                isActive && styles.activeItem,
                isFocused && styles.focusedItem,
              ]}
            >
              <Text
                style={[
                  styles.menuText,
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
      <View style={styles.content}>
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

  sidebar: {
    width: 300,
    paddingHorizontal: 20,
  },

  menuItem: {
    paddingVertical: 12,
    paddingHorizontal: 14,
    borderRadius: 12,
    marginBottom: 14,
    borderWidth: 2,
    borderColor: 'transparent',
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

  menuText: {
    color: '#ffffff',
    fontSize: 16,
  },

  content: {
    flex: 1,
    paddingHorizontal: 40,
  },
});

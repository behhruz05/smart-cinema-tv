import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  Platform,
} from 'react-native';
import {
  useNavigation,
  useRoute,
} from '@react-navigation/native';

export function SettingsScreen() {
  const navigation = useNavigation<any>();
  const route = useRoute<any>();
  const isTV = Platform.isTV;

  const [active, setActive] = useState<string>('InterfaceLanguage');
  const [focused, setFocused] = useState<string | null>(null);

  const items = [
    { title: 'Интерфейс и язык', route: 'InterfaceLanguage' },
    { title: 'Воспроизведение', route: 'Playback' },
    { title: 'Родительский контроль', route: 'ParentalControl' },
    { title: 'Поддержка и о прилож.', route: 'Support' },
    { title: 'Система и кэш', route: 'SystemCache' },
    { title: 'Выход', route: 'Logout' },
  ];

  const handlePress = (item: any) => {
    if (item.route === 'Logout') return;

    setActive(item.route);
    navigation.navigate(item.route);
  };

  return (
    <View style={styles.container}>
      {/* LEFT MENU */}
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
              onPress={() => handlePress(item)}
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
        <Text style={styles.title}>Настройки</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    flexDirection: 'row',
    backgroundColor: '#101010',
  },

  sidebar: {
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
    color: '#ffff',
    fontSize: 14,
  },

  content: {
    flex: 1,
    paddingHorizontal: 80,
  },

  title: {
    fontSize: 22,
    color: '#ffffff',
  },
});

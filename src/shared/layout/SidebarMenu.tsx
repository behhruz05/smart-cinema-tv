import React, { useRef, useEffect, useState } from 'react';
import {
  View,
  StyleSheet,
  Pressable,
  Image,
  Animated,
  Text,
  Easing,
  Platform,
} from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../../app/providers/AppProviders';
import {
  useNavigation,
  useNavigationState,
} from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';

import { RootState } from '../../store';
import { toggleSidebar } from '../../store/slice/ui.slice';
import { RootStackParamList } from '../../types/navigations';

import { HomeIcon } from '../icons/HomeIcon';
import { TvIcon } from '../icons/TvIcon';
import { ReelIcon } from '../icons/ReelIcon';
import { MovieIcon } from '../icons/MovieIcon';
import { SettingsIcon } from '../icons/SettingIcon';

const Logo = require('../../assets/imgs/Group.png');

const COLLAPSED_WIDTH = 90;
const EXPANDED_WIDTH = 220;

type NavProp = NativeStackNavigationProp<RootStackParamList>;

const icons = [
  { id: 'Home', titleKey: 'sidebar.home', Icon: HomeIcon },
  { id: 'TV', titleKey: 'sidebar.tv', Icon: TvIcon },
  { id: 'Movies', titleKey: 'sidebar.movies', Icon: MovieIcon },
  { id: 'Reels', titleKey: 'sidebar.reels', Icon: ReelIcon },
];

export function SidebarMenu() {
  const { t } = useTranslation();
  const { resolvedTheme } = useAuth();
  const dispatch = useDispatch();
  const navigation = useNavigation<NavProp>();
  const isTV = Platform.isTV;

  const isOpen = useSelector(
    (state: RootState) => state.ui.isSidebarOpen
  );

  const [focused, setFocused] = useState<string | null>(null);
  const isDarkMode = resolvedTheme === 'dark';

  const widthAnim = useRef(
    new Animated.Value(COLLAPSED_WIDTH)
  ).current;

  const textOpacity = useRef(
    new Animated.Value(0)
  ).current;

  // 🔥 Sidebar animation
  useEffect(() => {
    Animated.parallel([
      Animated.timing(widthAnim, {
        toValue: isOpen ? EXPANDED_WIDTH : COLLAPSED_WIDTH,
        duration: 250,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: false,
      }),
      Animated.timing(textOpacity, {
        toValue: isOpen ? 1 : 0,
        duration: 180,
        useNativeDriver: false,
      }),
    ]).start();
  }, [isOpen, textOpacity, widthAnim]);

  const currentRoute = useNavigationState((state: any) => {
    const getDeepestRouteName = (navState: any): string => {
      const activeRoute =
        navState.routes[navState.index ?? 0];

      if (activeRoute?.state) {
        return getDeepestRouteName(activeRoute.state);
      }

      return activeRoute?.name ?? 'Home';
    };

    const activeName = getDeepestRouteName(state);
    return activeName === 'Main' ? 'Home' : activeName;
  });

  // 🔥 FIRST RENDER HOME FOCUS FIX
  useEffect(() => {
    if (currentRoute === 'Home') {
      setFocused('Home');
    }
  }, [currentRoute]);

  const navigateTo = (screen: string) => {
    navigation.navigate('Main', {
      screen: screen as never,
    });
  };

  return (
    <Animated.View
      style={[
        styles.container,
        isDarkMode && styles.containerDark,
        { width: widthAnim },
      ]}
    >
      
      {/* 🔹 LOGO */}
      <View style={styles.logoSection}>
        <Pressable
          focusable={isTV}
          onFocus={() => setFocused('Logo')}
          onBlur={() => setFocused(null)}
          onPress={() => dispatch(toggleSidebar())}
          style={[
            styles.logoWrapper,
            focused === 'Logo' && styles.focusedItem,
            isDarkMode && focused === 'Logo' && styles.focusedItemDark,
          ]}
        >
          <Image source={Logo} style={styles.logo} />
        </Pressable>
      </View>

      {/* 🔹 MENU ITEMS */}
      <View style={styles.menuSection}>
        {icons.map((item, index) => {
          const IconComponent = item.Icon;
          const active = currentRoute === item.id;
          const isFocused = focused === item.id;

          return (
            <Pressable
              key={item.id}
              focusable={isTV}
              hasTVPreferredFocus={index === 0} // 🔥 always first item
              onFocus={() => setFocused(item.id)}
              onBlur={() => setFocused(null)}
              onPress={() => navigateTo(item.id)}
              style={[
                styles.item,
                isDarkMode && styles.itemDark,
                active && styles.activeItem,
                isFocused && styles.focusedItem,
                isDarkMode && isFocused && styles.focusedItemDark,
              ]}
            >
              <IconComponent
                color={
                  active || isFocused
                    ? isDarkMode
                      ? '#ffffff'
                      : '#fff'
                    : isDarkMode
                      ? '#9a9a9a'
                      : '#777'
                }
                size={18}
                filled={active}
              />

              <Animated.View style={{ opacity: textOpacity }}>
                <Text
                  style={[
                    styles.title,
                    {
                      color:
                        active || isFocused
                          ? isDarkMode
                            ? '#ffffff'
                            : '#fff'
                          : isDarkMode
                            ? '#9a9a9a'
                            : '#777',
                    },
                  ]}
                >
                  {t(item.titleKey)}
                </Text>
              </Animated.View>
            </Pressable>
          );
        })}
      </View>

      {/* 🔹 SETTINGS */}
      <View style={styles.bottomSection}>
        <Pressable
          focusable={isTV}
          onFocus={() => setFocused('Settings')}
          onBlur={() => setFocused(null)}
          onPress={() => navigateTo('Settings')}
          style={[
            styles.item,
            isDarkMode && styles.itemDark,
            currentRoute === 'Settings' && styles.activeItem,
            focused === 'Settings' && styles.focusedItem,
            isDarkMode &&
              focused === 'Settings' &&
              styles.focusedItemDark,
          ]}
        >
          <SettingsIcon
            size={18}
            color={
              currentRoute === 'Settings' ||
              focused === 'Settings'
                ? isDarkMode
                  ? '#ffffff'
                  : '#fff'
                : isDarkMode
                  ? '#9a9a9a'
                  : '#777'
            }
            filled={currentRoute === 'Settings'}
          />

          <Animated.View style={{ opacity: textOpacity }}>
            <Text
              style={[
                styles.title,
                {
                  color:
                    currentRoute === 'Settings' ||
                    focused === 'Settings'
                      ? isDarkMode
                        ? '#ffffff'
                        : '#fff'
                      : isDarkMode
                        ? '#9a9a9a'
                        : '#777',
                },
              ]}
            >
              {t('sidebar.settings')}
            </Text>
          </Animated.View>
        </Pressable>
      </View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#101010',
    paddingVertical: 20,
    paddingHorizontal: 20,
    overflow: 'hidden',
    justifyContent: 'space-between',
  },
  containerDark: {
    backgroundColor: '#111111',
    borderRightWidth: 1,
    borderRightColor: '#2a2a2a',
  },

  logoSection: {
    alignItems: 'center',
  },

  menuSection: {
    flex: 1,
    justifyContent: 'center',
  },

  bottomSection: {
    marginBottom: 20,
  },

  logo: {
    width: 34,
    height: 34,
    resizeMode: 'contain',
  },

  logoWrapper: {
    borderRadius: 12,
    padding: 10,
    borderWidth: 2,
    borderColor: 'transparent',
  },

  item: {
    flexDirection: 'row',
    alignItems: 'center',
    height: 44,
    marginBottom: 16,
    borderRadius: 8,
    paddingHorizontal: 14,
    backgroundColor: '#1A1A1A',
    borderWidth: 2,
    borderColor: 'transparent',
  },
  itemDark: {
    backgroundColor: '#181818',
  },

  activeItem: {
    backgroundColor: '#1A1A1A',
  },

  focusedItem: {
    borderColor: '#fff',
    backgroundColor: '#1A1A1A',
  },
  focusedItemDark: {
    borderColor: '#ffffff',
    backgroundColor: '#181818',
  },

  title: {
    marginLeft: 14,
    fontSize: 14,
  },
});

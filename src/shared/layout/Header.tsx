import React, { useEffect, useRef, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  TextInput,
  Platform,
  Animated,
  Easing,
} from 'react-native';
import {
  useNavigation,
  useNavigationState,
} from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useDispatch, useSelector } from 'react-redux';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../../app/providers/AppProviders';

import { RootState } from '../../store';
import { setQuery } from '../../store/slice/movie.slice';
import { RootStackParamList } from '../../types/navigations';

import { SearchIcon } from '../icons/SearchIcon';
import { VoiceIcon } from '../icons/VoiceIcon';
import { UserIcon } from '../icons/UserIcon';
import { BackIcon } from '../icons/BackIcon';
import { formatCurrentHeaderDateTime } from '../utils/timeFormatted';
import { useWeather } from '../hooks/useWeather';

type NavProp = NativeStackNavigationProp<RootStackParamList>;

export function Header() {
  const { t } = useTranslation();
  const { resolvedTheme } = useAuth();
  const navigation = useNavigation<NavProp>();
  const dispatch = useDispatch();
  const { query } = useSelector((state: RootState) => state.movie);
  const weather = useWeather();
  const isTV = Platform.isTV;

  const [focused, setFocused] = useState<string | null>(null);
  const [currentTime, setCurrentTime] = useState(
    formatCurrentHeaderDateTime()
  );

  const currentRoute = useNavigationState((state: any) => {
    const route = state.routes[state.index];
    if (route.state) {
      const nested = route.state.routes[route.state.index];
      return nested.name;
    }
    return route.name;
  });

  const isSearch = currentRoute === 'Search';
  const isDarkMode = resolvedTheme === 'dark';

  const animatedWidth = useRef(new Animated.Value(320)).current;
  const scaleSearch = useRef(new Animated.Value(1)).current;
  const scaleAvatar = useRef(new Animated.Value(1)).current;
  const scaleBack = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    Animated.timing(animatedWidth, {
      toValue: isSearch ? 600 : 320,
      duration: 250,
      easing: Easing.out(Easing.ease),
      useNativeDriver: false,
    }).start();
  }, [animatedWidth, isSearch]);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentTime(formatCurrentHeaderDateTime());
    }, 60000);
    return () => clearInterval(interval);
  }, []);

  const animateScale = (value: Animated.Value, to: number) => {
    Animated.spring(value, {
      toValue: to,
      useNativeDriver: false,
    }).start();
  };

  return (
    <View style={[styles.container, isDarkMode && styles.containerDark]}>
      <View style={styles.left}>
        {isSearch ? (
          <Animated.View
            style={{ transform: [{ scale: scaleBack }] }}
          >
            <Pressable
              focusable={isTV}
              hasTVPreferredFocus
              onFocus={() => {
                setFocused('back');
                animateScale(scaleBack, 1);
              }}
              onBlur={() => {
                setFocused(null);
                animateScale(scaleBack, 1);
              }}
              onPress={() => navigation.goBack()}
              style={[
                styles.back,
                isDarkMode && styles.cardDark,
                focused === 'back' && styles.focusedButton,
                isDarkMode && focused === 'back' && styles.focusedButtonDark,
              ]}
            >
              <BackIcon size={20} color={isDarkMode ? '#9a9a9a' : '#888'} />
              <Text style={[styles.backText, isDarkMode && styles.textMutedDark]}>{t('common.back')}</Text>
            </Pressable>
          </Animated.View>
        ) : (
          <View style={styles.timeWeatherRow}>
            <Text style={[styles.dateTime, isDarkMode && styles.textPrimaryDark]}>{currentTime}</Text>
            <Text style={[styles.separator, isDarkMode && styles.textMutedDark]}>|</Text>
            <Text style={[styles.weather, isDarkMode && styles.textPrimaryDark]}>
              {weather?.icon ?? '☁️'} {weather?.temp ?? '--°'}
            </Text>
          </View>
        )}
      </View>

      <View style={styles.right}>
        <Animated.View
          style={[
            styles.searchContainer,
            isDarkMode && styles.cardDark,
            {
              width: animatedWidth,
              transform: [{ scale: scaleSearch }],
            },
            focused === 'search' && styles.focusedButton,
            isDarkMode && focused === 'search' && styles.focusedButtonDark,
          ]}
        >
          <SearchIcon size={18} color={isDarkMode ? '#9a9a9a' : '#888'} />

          {isSearch ? (
            <TextInput
              value={query}
              onChangeText={(text) =>
                dispatch(setQuery(text))
              }
              placeholder={t('common.search')}
              placeholderTextColor={isDarkMode ? '#9a9a9a' : '#888'}
              style={[styles.input, isDarkMode && styles.inputDark]}
              autoFocus
            />
          ) : (
            <Pressable
              style={styles.searchPressArea}
              focusable={isTV}
              onFocus={() => {
                setFocused('search');
                animateScale(scaleSearch, 1);
              }}
              onBlur={() => {
                setFocused(null);
                animateScale(scaleSearch, 1);
              }}
              onPress={() => navigation.navigate('Search')}
            >
              <Text style={[styles.searchPlaceholder, isDarkMode && styles.textMutedDark]}>
                {query || t('common.search')}
              </Text>
            </Pressable>
          )}

          <VoiceIcon size={18} color={isDarkMode ? '#9a9a9a' : '#888'} />
        </Animated.View>

        {!isSearch && (
          <Animated.View
            style={{ transform: [{ scale: scaleAvatar }] }}
          >
            <Pressable
              focusable={isTV}
              onFocus={() => {
                setFocused('avatar');
                animateScale(scaleAvatar, 1);
              }}
              onBlur={() => {
                setFocused(null);
                animateScale(scaleAvatar, 1);
              }}
              onPress={() =>
                navigation.navigate('Main', {
                  screen: 'Profile',
                })
              }
              style={[
                styles.avatar,
                isDarkMode && styles.cardDark,
                (focused === 'avatar' ||
                  currentRoute === 'Profile') &&
                  styles.focusedButton,
                isDarkMode &&
                  (focused === 'avatar' || currentRoute === 'Profile') &&
                  styles.focusedButtonDark,
              ]}
            >
              <UserIcon
                size={18}
                color={
                  currentRoute === 'Profile'
                    ? isDarkMode
                      ? '#ffffff'
                      : '#fff'
                    : isDarkMode
                      ? '#9a9a9a'
                      : '#888'
                }
              />
            </Pressable>
          </Animated.View>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
  },
  containerDark: {
    backgroundColor: '#111111',
  },
  left: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 20,
  },
  right: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
    flex: 1,
    justifyContent: 'flex-end',
  },
  timeWeatherRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  dateTime: {
    fontSize: 14,
    color: '#fff',
    fontWeight: '500',
  },
  separator: {
    color: '#666',
    marginHorizontal: 12,
    fontSize: 14,
  },
  weather: {
    fontSize: 14,
    color: '#fff',
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1A1A1A',
    borderRadius: 8,
    paddingHorizontal: 12,
    height: 45,
    borderWidth: 2,
    borderColor: 'transparent',
    gap: 12,
  },
  searchPlaceholder: {
    color: '#888',
    fontSize: 14,
  },
  searchPressArea: {
    flex: 1,
  },
  input: {
    flex: 1,
    color: '#fff',
    fontSize: 14,
  },
  inputDark: {
    color: '#ffffff',
  },
  avatar: {
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#1A1A1A',
    borderRadius: 8,
    paddingHorizontal: 10,
    height: 40,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  back: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    height: 45,
    gap: 8,
    backgroundColor: '#1A1A1A',
    borderRadius: 8,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  backText: {
    color: '#888',
    fontSize: 16,
  },
  focusedButton: {
    borderColor: '#fff',
  },
  focusedButtonDark: {
    borderColor: '#ffffff',
  },
  cardDark: {
    backgroundColor: '#181818',
  },
  textPrimaryDark: {
    color: '#ffffff',
  },
  textMutedDark: {
    color: '#9a9a9a',
  },
});

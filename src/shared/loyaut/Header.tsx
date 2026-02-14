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

import { RootState } from '../../store';
import { setQuery } from '../../store/slice/search.slice';
import { RootStackParamList } from '../../types/navigations';

import { SearchIcon } from '../icons/SearchIcon';
import { VoiceIcon } from '../icons/VoiceIcon';
import { UserIcon } from '../icons/UserIcon';
import { BackIcon } from '../icons/BackIcon';
import { formatCurrentHeaderDateTime } from '../utils/timeFormatted';
import { useWeather } from '../hooks/useWeather';

type NavProp = NativeStackNavigationProp<RootStackParamList>;

export function Header() {
  const navigation = useNavigation<NavProp>();
  const dispatch = useDispatch();

  const { query } = useSelector(
    (state: RootState) => state.search
  );

  const weather = useWeather();
  const isTV = Platform.isTV;

  const [focused, setFocused] = useState<string | null>(null);
  const [currentTime, setCurrentTime] = useState(
    formatCurrentHeaderDateTime()
  );

  /**
   * 🔥 Nested route detector
   */
  const currentRoute = useNavigationState((state: any) => {
    const route = state.routes[state.index];

    if (route.state) {
      const nested = route.state.routes[route.state.index];
      return nested.name;
    }

    return route.name;
  });

  const isSearch = currentRoute === 'Search';

  /**
   * 🔥 Animated values
   */
  const animatedWidth = useRef(new Animated.Value(320)).current;
  const scaleSearch = useRef(new Animated.Value(1)).current;
  const scaleAvatar = useRef(new Animated.Value(1)).current;
  const scaleBack = useRef(new Animated.Value(1)).current;

  /**
   * 🔥 Animate width on route change
   */
  useEffect(() => {
    Animated.timing(animatedWidth, {
      toValue: isSearch ? 600 : 320, // TV ga mos qilib o'zgartir
      duration: 250,
      easing: Easing.out(Easing.ease),
      useNativeDriver: false,
    }).start();
  }, [isSearch]);

  /**
   * 🔥 Clock update
   */
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentTime(formatCurrentHeaderDateTime());
    }, 60000);

    return () => clearInterval(interval);
  }, []);

  return (
    <View style={styles.container}>
      {/* LEFT */}
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
                Animated.spring(scaleBack, {
                  toValue: 1.05,
                  useNativeDriver: true,
                }).start();
              }}
              onBlur={() => {
                setFocused(null);
                Animated.spring(scaleBack, {
                  toValue: 1,
                  useNativeDriver: true,
                }).start();
              }}
              onPress={() => navigation.goBack()}
              style={[
                styles.back,
                focused === 'back' && styles.focusedButton,
              ]}
            >
              <BackIcon size={20} color="#888" />
              <Text style={styles.backText}>Назад</Text>
            </Pressable>
          </Animated.View>
        ) : (
          <View style={styles.timeWeatherRow}>
            <Text style={styles.dateTime}>{currentTime}</Text>
            <Text style={styles.separator}>|</Text>
            <Text style={styles.weather}>
              {weather?.icon ?? '☁️'} {weather?.temp ?? '--°'}
            </Text>
          </View>
        )}
      </View>

      {/* RIGHT */}
      <View style={styles.right}>
        {/* SEARCH */}
        <Animated.View
          style={[
            styles.searchContainer,
            {
              width: animatedWidth,
              transform: [{ scale: scaleSearch }],
            },
            focused === 'search' && styles.focusedButton,
          ]}
        >
          <SearchIcon size={18} color="#888" />

          {isSearch ? (
            <TextInput
              value={query}
              onChangeText={(text) =>
                dispatch(setQuery(text))
              }
              placeholder="Поиск"
              placeholderTextColor="#888"
              style={styles.input}
              autoFocus
            />
          ) : (
            <Pressable
              style={{ flex: 1 }}
              focusable={isTV}
              onFocus={() => {
                setFocused('search');
                Animated.spring(scaleSearch, {
                  toValue: 1.05,
                  useNativeDriver: true,
                }).start();
              }}
              onBlur={() => {
                setFocused(null);
                Animated.spring(scaleSearch, {
                  toValue: 1,
                  useNativeDriver: true,
                }).start();
              }}
              onPress={() => navigation.navigate('Search')}
            >
              <Text style={styles.searchPlaceholder}>
                {query || 'Поиск'}
              </Text>
            </Pressable>
          )}

          <VoiceIcon size={18} color="#888" />
        </Animated.View>

        {/* AVATAR */}
        {!isSearch && (
          <Animated.View
            style={{ transform: [{ scale: scaleAvatar }] }}
          >
            <Pressable
              focusable={isTV}
              onFocus={() => {
                setFocused('avatar');
                Animated.spring(scaleAvatar, {
                  toValue: 1.05,
                  useNativeDriver: true,
                }).start();
              }}
              onBlur={() => {
                setFocused(null);
                Animated.spring(scaleAvatar, {
                  toValue: 1,
                  useNativeDriver: true,
                }).start();
              }}
              onPress={() =>
                navigation.navigate('Main', {
                  screen: 'Profile',
                })
              }
              style={[
                styles.avatar,
                (focused === 'avatar' ||
                  currentRoute === 'Profile') &&
                  styles.focusedButton,
              ]}
            >
              <UserIcon
                size={18}
                color={
                  currentRoute === 'Profile'
                    ? '#fff'
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

  input: {
    flex: 1,
    color: '#fff',
    fontSize: 14,
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
});

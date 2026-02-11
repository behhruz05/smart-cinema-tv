import React, { useRef, useEffect, useState } from 'react';
import {
  View,
  StyleSheet,
  Pressable,
  Image,
  Animated,
  Text,
  Easing,
} from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '../../store';
import { toggleSidebar } from '../../store/slice/ui.slice';

import { HomeIcon } from '../icons/HomeIcon';
import { TvIcon } from '../icons/TvIcon';
import { ReelIcon } from '../icons/ReelIcon';
import { MovieIcon } from '../icons/MovieIcon';
import { SettingsIcon } from '../icons/SettingIcon';

const Logo = require('../../assets/imgs/Group.png');

const COLLAPSED_WIDTH = 90;
const EXPANDED_WIDTH = 220;

const icons = [
  { id: 'home', title: 'Home', Icon: HomeIcon },
  { id: 'tv', title: 'TV', Icon: TvIcon },
  { id: 'movies', title: 'Movies', Icon: MovieIcon },
  { id: 'reel', title: 'Reels', Icon: ReelIcon },
];

export function SidebarMenu() {
  const dispatch = useDispatch();
  const isOpen = useSelector((state: RootState) => state.ui.isSidebarOpen);

  const [focused, setFocused] = useState('home');

  const widthAnim = useRef(new Animated.Value(COLLAPSED_WIDTH)).current;
  const textOpacity = useRef(new Animated.Value(0)).current;

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
  }, [isOpen]);

  return (
    <Animated.View style={[styles.container, { width: widthAnim }]}>
      <Pressable
        onPress={() => dispatch(toggleSidebar())}
        style={styles.logoWrapper}
      >
        <Image source={Logo} style={styles.logo} />
      </Pressable>

      <View style={styles.topSection}>
        {icons.map((item, index) => {
          const IconComponent = item.Icon;
          const active = focused === item.id;

          return (
            <Pressable
              key={item.id}
              hasTVPreferredFocus={index === 0}
              onFocus={() => setFocused(item.id)}
              style={[styles.item, active && styles.activeItem]}
            >
              <IconComponent
                color={active ? '#fff' : '#777'}
                size={18}
                filled={active}
              />

              <Animated.View style={{ opacity: textOpacity }}>
                <Text
                  style={[
                    styles.title,
                    { color: active ? '#fff' : '#777' },
                  ]}
                >
                  {item.title}
                </Text>
              </Animated.View>
            </Pressable>
          );
        })}
      </View>

      <Pressable
        onFocus={() => setFocused('settings')}
        style={[styles.item, focused === 'settings' && styles.activeItem]}
      >
        <SettingsIcon
          size={18}
          color={focused === 'settings' ? '#fff' : '#777'}
          filled={focused === 'settings'}
        />

        <Animated.View style={{ opacity: textOpacity }}>
          <Text
            style={[
              styles.title,
              { color: focused === 'settings' ? '#fff' : '#777' },
            ]}
          >
            Settings
          </Text>
        </Animated.View>
      </Pressable>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#101010',
    paddingVertical: 20,
    paddingHorizontal: 20,
    overflow: 'hidden',
  },
  logoWrapper: {
    alignItems: 'center',
    marginBottom: 50,
  },
  logo: {
    width: 34,
    height: 34,
    resizeMode: 'contain',
  },
  topSection: {
    flex: 1,
  },
  item: {
    flexDirection: 'row',
    alignItems: 'center',
    height: 44,
    marginBottom: 16,
    borderRadius: 8,
    paddingHorizontal: 16,
  },
  activeItem: {
    backgroundColor: '#1A1A1A',
  },
  title: {
    marginLeft: 14,
    fontSize: 14,
  },
});

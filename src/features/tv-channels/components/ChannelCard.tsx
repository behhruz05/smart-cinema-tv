import React from 'react';
import {
  Image,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { TvChannel } from '../../../types/tv';

interface ChannelCardProps {
  channel: TvChannel;
  active: boolean;
  focused: boolean;
  onFocus: () => void;
  onBlur: () => void;
  onPress: () => void;
  isTV: boolean;
  preferredFocus?: boolean;
}

export function ChannelCard({
  channel,
  active,
  focused,
  onFocus,
  onBlur,
  onPress,
  isTV,
  preferredFocus = false,
}: ChannelCardProps) {
  return (
    <Pressable
      focusable={isTV}
      hasTVPreferredFocus={preferredFocus}
      onFocus={onFocus}
      onBlur={onBlur}
      onPress={onPress}
      style={[
        styles.card,
        active && styles.cardActive,
        focused && styles.cardFocused,
      ]}
    >
      <Image
        source={{ uri: channel.logo_url }}
        style={styles.logo}
        resizeMode="contain"
      />
      <View style={styles.footer}>
        <Text style={styles.name} numberOfLines={1}>
          {channel.name}
        </Text>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    width: 118,
    height: 74,
    borderRadius: 10,
    backgroundColor: '#101010',
    borderWidth: 2,
    borderColor: 'transparent',
    marginBottom: 10,
    justifyContent: 'center',
    overflow: 'hidden',
  },
  cardActive: {
    borderColor: '#ffffff',
    backgroundColor: '#1a1a1a',
  },
  cardFocused: {
    borderColor: '#ffffff',
    backgroundColor: '#1a1a1a',
  },
  logo: {
    width: '100%',
    height: 48,
  },
  footer: {
    paddingHorizontal: 6,
    paddingBottom: 4,
  },
  name: {
    color: '#c9c9c9',
    fontSize: 10,
    textAlign: 'center',
  },
});

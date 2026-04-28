import React, { useState } from 'react';
import { Image, Pressable, StyleSheet, Text, View } from 'react-native';
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
  const [imgError, setImgError] = useState(false);

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
      {!imgError && channel.logo_url ? (
        <Image
          source={{ uri: channel.logo_url }}
          style={styles.logo}
          resizeMode="contain"
          onError={() => setImgError(true)}
        />
      ) : (
        <View style={styles.fallback}>
          <Text style={styles.fallbackText} numberOfLines={2}>
            {channel.name}
          </Text>
        </View>
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    width: 118,
    height: 68,
    borderRadius: 10,
    backgroundColor: '#1a1a1a',
    borderWidth: 2,
    borderColor: 'transparent',
    marginBottom: 10,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
    padding: 8,
  },
  cardActive: {
    borderColor: '#ffffff',
    backgroundColor: '#242424',
  },
  cardFocused: {
    borderColor: '#ffffff',
    backgroundColor: '#242424',
  },
  logo: {
    width: '100%',
    height: '100%',
  },
  fallback: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 4,
  },
  fallbackText: {
    color: '#c9c9c9',
    fontSize: 10,
    textAlign: 'center',
    lineHeight: 14,
  },
});

import React, { useState } from 'react';
import {
  Image,
  StyleSheet,
  View,
  Text,
  Pressable,
} from 'react-native';

import {
  formatDurationHM,
  calculateProgressPercent,
} from '../utils/timeFormatted';

interface WatchHistoryItem {
  type: 'movie' | 'series';
  id: string;
  title_uz?: string;
  title_ru?: string;
  poster_url: string;
  last_position_seconds: number;
  total_duration_seconds: number;
  progress_percent?: number;
  season_number?: number | null;
  episode_number?: number | null;
}

interface Props {
  item: WatchHistoryItem;
  onPress?: (item: WatchHistoryItem) => void;
}

export const WatchHistory = ({ item, onPress }: Props) => {
  const [focused, setFocused] = useState(false);

  const duration = formatDurationHM(
    item.total_duration_seconds
  );

  const progress =
    item.progress_percent ??
    calculateProgressPercent(
      item.last_position_seconds,
      item.total_duration_seconds
    );

  const title =
    item.title_ru ||
    item.title_uz ||
    'Без названия';

  const isSeries =
    item.type === 'series' ||
    !!item.episode_number;

  return (
    <Pressable
      focusable
      onPress={() => onPress?.(item)}
      onFocus={() => setFocused(true)}
      onBlur={() => setFocused(false)}
      style={styles.card}
    >
      <View
        style={[
          styles.imageWrapper,
          focused && styles.focusedImageWrapper,
        ]}
      >
        <Image
          source={{ uri: item.poster_url }}
          style={styles.image}
        />

        <View style={styles.progressContainer}>
          <View
            style={[
              styles.progressBar,
              { width: `${progress}%` },
            ]}
          />
        </View>

        <Text style={styles.durationText}>
          {duration}
        </Text>
      </View>

      <Text style={styles.title} numberOfLines={1}>
        {title}
      </Text>

      {isSeries &&
        item.season_number &&
        item.episode_number && (
          <Text style={styles.subtitle}>
            {item.season_number} сезон,{' '}
            {item.episode_number} серия
          </Text>
        )}
    </Pressable>
  );
};

const styles = StyleSheet.create({
  card: {
    width: 320,
    marginRight: 18,
  },

  imageWrapper: {
    position: 'relative',
    borderRadius: 18,
    overflow: 'hidden',
    borderWidth: 2,
    borderColor: 'transparent',
  },

  focusedImageWrapper: {
    borderColor: '#fff',
  },

  image: {
    width: '100%',
    height: 180,
  },

  progressContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 6,
    backgroundColor: '#333',
  },

  progressBar: {
    height: '100%',
    backgroundColor: '#e50914',
  },

  durationText: {
    position: 'absolute',
    right: 8,
    bottom: 10,
    color: '#fff',
    fontSize: 12,
    backgroundColor: 'rgba(0,0,0,0.7)',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
  },

  title: {
    marginTop: 8,
    color: '#fff',
    fontSize: 16,
  },

  subtitle: {
    marginTop: 4,
    color: '#9ca3af',
    fontSize: 13,
  },
});

import React from 'react';
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
} from '../../../shared/utils/timeFormatted';

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
      onPress={() => onPress?.(item)}
      style={({ focused }) => [
        styles.card,
        focused && styles.focusedCard,
      ]}
    >
      <View style={styles.imageWrapper}>
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
    width: 260,
    marginRight: 18,
    borderRadius: 18,
  },

  focusedCard: {
    transform: [{ scale: 1.05 }],
  },

  imageWrapper: {
    position: 'relative',
  },

  image: {
    width: '100%',
    height: 150,
      borderTopLeftRadius: 18,
    borderTopRightRadius: 18,
  },

  progressContainer: {
    position: 'absolute',
    bottom: -5,
    left: 0,
    right: 0,
    height: 6,
    backgroundColor: '#333',
    borderBottomLeftRadius: 18,
    borderBottomRightRadius: 18,
    overflow: 'hidden',
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
    fontWeight: '600',
  },

  subtitle: {
    marginTop: 4,
    color: '#9ca3af',
    fontSize: 13,
  },
});

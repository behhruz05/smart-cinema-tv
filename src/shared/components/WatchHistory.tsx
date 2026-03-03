import React, { useState } from 'react';
import {
  Image,
  Platform,
  StyleSheet,
  View,
  Text,
  Pressable,
} from 'react-native';

import {
  formatDurationHM,
  calculateProgressPercent,
} from '../utils/timeFormatted';
import { useTranslation } from 'react-i18next';
import { WatchHistoryItem } from '../../types/history';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../types/navigations';

interface Props {
  item: WatchHistoryItem;
  onPress?: (item: WatchHistoryItem) => void;
}

export const WatchHistory = React.memo(({ item, onPress }: Props) => {
  const { t, i18n } = useTranslation();
  const [focused, setFocused] = useState(false);
  const isTV = Platform.isTV;
  const navigation =
    useNavigation<NativeStackNavigationProp<RootStackParamList>>();

  const duration = formatDurationHM(
    item.total_duration_seconds
  );

  const progress =
    item.progress_percent ??
    calculateProgressPercent(
      item.last_position_seconds,
      item.total_duration_seconds
    );

  const titleByLanguage =
    i18n.language === 'ru' ? item.title_ru : item.title_uz;
  const title =
    titleByLanguage || item.title_ru || item.title_uz || t('watch_history.untitled');

  const isSeries =
    item.type === 'series' ||
    item.type === 'episode' ||
    !!item.episode_number;

  const handleDefaultPress = () => {
    const contentId = item.content_id || item.movie_id || item.episode_id || item.id;

    if (item.type === 'movie') {
      navigation.navigate('MovieDetail', {
        movieId: contentId,
      });
      return;
    }

    if (item.type === 'series') {
      const targetSeriesId = item.series_id || contentId;
      if (!targetSeriesId) return;
      navigation.navigate('SeriesDetail', {
        seriesId: targetSeriesId,
      });
      return;
    }

    if (contentId) {
      navigation.navigate('Player', {
        episodeId: contentId,
        posterUri: item.poster_url,
        title: item.title_uz || item.title_ru || item.title_en || '',
        subtitle: '',
        isLive: false,
        durationSeconds: item.total_duration_seconds,
      });
    }
  };

  return (
    <Pressable
      focusable={isTV}
      onPress={() => {
        if (onPress) {
          onPress(item);
          return;
        }
        handleDefaultPress();
      }}
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
            {t('watch_history.season_episode', {
              season: item.season_number,
              episode: item.episode_number,
            })}
          </Text>
        )}
    </Pressable>
  );
});

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

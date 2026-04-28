import React, { useCallback, useEffect, useMemo } from 'react';
import { ScrollView, FlatList, StyleSheet } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useDispatch, useSelector } from 'react-redux';
import { useTranslation } from 'react-i18next';
import {
  fetchPopular,
  fetchLatest,
  fetchHistory,
  fetchChannels,
} from '../../../store/slice/home.slice';
import { fetchReels } from '../../../store/slice/reel.slice';
import {
  fetchLatestSeries,
  fetchPopularSeries,
} from '../../../store/slice/series.slice';
import { AppDispatch, RootState } from '../../../store';
import { Section } from '../../../shared/components/Section';
import { MovieCard } from '../../../shared/components/MovieCard';
import { ReelCard } from '../../../shared/components/ReelCard';
import { ChannelCard } from '../components/ChannelCard';
import { HomeCarousel } from '../components/HomeCarousel';
import { WatchHistory } from '../../../shared/components/WatchHistory';
import { NewMovieCard } from '../../../shared/components/NewMovieCard';
import { RootStackParamList } from '../../../types/navigations';
import { WatchHistoryItem } from '../../../types/history';
import { useGuardedPlayerNavigation } from '../../player/hooks/useGuardedPlayerNavigation';
import { SubscriptionRequiredModal } from '../../../shared/components/SubscriptionRequiredModal';

type NavProp = NativeStackNavigationProp<RootStackParamList>;

export function HomeScreen() {
  const { t } = useTranslation();
  const dispatch = useDispatch<AppDispatch>();
  const navigation = useNavigation<NavProp>();
  const {
    openPlayerWithGuard,
    subscriptionModalVisible,
    closeSubscriptionModal,
  } = useGuardedPlayerNavigation(navigation);

  const { popular, latest, history, channels } =
    useSelector((state: RootState) => state.home);

  const { reels } =
    useSelector((state: RootState) => state.reel);
  const {
    popular: popularSeries,
    latest: latestSeries,
  } = useSelector((state: RootState) => state.series);

  const popularCombined = useMemo(
    () => [
      ...popular.map(item => ({ type: 'movie' as const, item })),
      ...popularSeries.map(item => ({ type: 'series' as const, item })),
    ],
    [popular, popularSeries],
  );

  const latestCombined = useMemo(
    () => [
      ...latest.map(item => ({ type: 'movie' as const, item })),
      ...latestSeries.map(item => ({ type: 'series' as const, item })),
    ],
    [latest, latestSeries],
  );

  useEffect(() => {
    dispatch(fetchPopular());
    dispatch(fetchLatest());
    dispatch(fetchHistory());
    dispatch(fetchChannels());
    dispatch(fetchReels({ page: 1, per_page: 20 }));
    dispatch(fetchPopularSeries({ page: 1, per_page: 20 }));
    dispatch(fetchLatestSeries({ page: 1, per_page: 20 }));
  }, [dispatch]);

  const renderHistory = useCallback(
    ({ item }: { item: (typeof history)[0] }) => (
      <WatchHistory
        item={item}
        onPress={(historyItem: WatchHistoryItem) => {
          const contentId =
            historyItem.content_id ||
            historyItem.movie_id ||
            historyItem.episode_id ||
            historyItem.id;

          if (historyItem.type === 'movie') {
            navigation.navigate('MovieDetail', {
              movieId: contentId,
            });
            return;
          }
          if (historyItem.type === 'series') {
            navigation.navigate('SeriesDetail', {
              seriesId: historyItem.series_id || contentId,
            });
            return;
          }
          if (!contentId) {
            return;
          }
          openPlayerWithGuard({
            episodeId: contentId,
            posterUri: historyItem.poster_url,
            title:
              historyItem.title_uz ||
              historyItem.title_ru ||
              historyItem.title_en ||
              '',
            subtitle: '',
            isLive: false,
            durationSeconds: historyItem.total_duration_seconds,
          });
        }}
      />
    ),
    [navigation, openPlayerWithGuard],
  );


  const renderReel = useCallback(
    ({ item }: { item: (typeof reels)[0] }) => (
      <ReelCard item={item} />
    ),
    [],
  );

  const renderChannel = useCallback(
    ({ item }: { item: (typeof channels)[0] }) => (
      <ChannelCard item={item} />
    ),
    [],
  );

  return (
    <ScrollView
      style={styles.container}
      showsVerticalScrollIndicator={false}
    >
      <HomeCarousel />

      <Section title={t('home.sections.most_watched')} data={popularCombined}>
        <FlatList
          horizontal
          showsHorizontalScrollIndicator={false}
          data={popularCombined}
          keyExtractor={(item) => `${item.type}-${item.item.id}`}
          renderItem={({ item }) =>
            <MovieCard
              movie={item.item}
              contentType={item.type}
              style={styles.wideMovieCard}
            />
          }
        />
      </Section>

      <Section title={t('home.sections.continue_watching')} data={history}>
        <FlatList
          horizontal
          showsHorizontalScrollIndicator={false}
          data={history}
          keyExtractor={(item) => item.id}
          renderItem={renderHistory}
        />
      </Section>

      <Section title={t('home.sections.latest')} data={latestCombined}>
        <FlatList
          horizontal
          showsHorizontalScrollIndicator={false}
          data={latestCombined}
          keyExtractor={(item) => `${item.type}-${item.item.id}`}
          renderItem={({ item }) =>
            <NewMovieCard
              movie={item.item}
              contentType={item.type}
              style={styles.narrowMovieCard}
            />
          }
        />
      </Section>

      <Section title={t('home.sections.reels')} data={reels}>
        <FlatList
          horizontal
          showsHorizontalScrollIndicator={false}
          data={reels}
          keyExtractor={(item) => item.id}
          renderItem={renderReel}
        />
      </Section>

      <Section title={t('home.sections.tv_channels')} data={channels}>
        <FlatList
          horizontal
          showsHorizontalScrollIndicator={false}
          data={channels}
          keyExtractor={(item) => item.id}
          renderItem={renderChannel}
        />
      </Section>
      <SubscriptionRequiredModal
        visible={subscriptionModalVisible}
        onClose={closeSubscriptionModal}
      />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#101010',
    paddingHorizontal: 20,
  },
  wideMovieCard: {
    width: 320,
    marginRight: 16,
  },
  narrowMovieCard: {
    width: 200,
    marginRight: 16,
  },
});

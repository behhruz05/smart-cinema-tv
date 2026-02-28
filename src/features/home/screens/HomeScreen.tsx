import React, { useCallback, useEffect } from 'react';
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

type NavProp = NativeStackNavigationProp<RootStackParamList>;

export function HomeScreen() {
  const { t } = useTranslation();
  const dispatch = useDispatch<AppDispatch>();
  const navigation = useNavigation<NavProp>();

  const { popular, latest, history, channels } =
    useSelector((state: RootState) => state.home);

  const { reels } =
    useSelector((state: RootState) => state.reel);

  useEffect(() => {
    dispatch(fetchPopular());
    dispatch(fetchLatest());
    dispatch(fetchHistory());
    dispatch(fetchChannels());
    dispatch(fetchReels({ page: 1, per_page: 20 }));
  }, [dispatch]);

  const renderPopular = useCallback(
    ({ item }: { item: (typeof popular)[0] }) => (
      <MovieCard movie={item} style={styles.wideMovieCard} />
    ),
    [],
  );

  const renderHistory = useCallback(
    ({ item }: { item: (typeof history)[0] }) => (
      <WatchHistory
        item={item}
        onPress={(historyItem: WatchHistoryItem) => {
          if (historyItem.type === 'movie') {
            const movieId = historyItem.movie_id || historyItem.id;
            navigation.navigate('MovieDetail', { movieId });
            return;
          }
          const episodeId = historyItem.episode_id;
          if (!episodeId) {
            return;
          }
          navigation.navigate('Player', {
            episodeId,
            posterUri: historyItem.poster_url,
            title: historyItem.title_uz || historyItem.title_ru || '',
            subtitle: '',
            isLive: false,
            durationSeconds: historyItem.total_duration_seconds,
          });
        }}
      />
    ),
    [navigation],
  );

  const renderLatest = useCallback(
    ({ item }: { item: (typeof latest)[0] }) => (
      <NewMovieCard movie={item} style={styles.narrowMovieCard} />
    ),
    [],
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

      <Section title={t('home.sections.most_watched')} data={popular}>
        <FlatList
          horizontal
          showsHorizontalScrollIndicator={false}
          data={popular}
          keyExtractor={(item) => item.id}
          renderItem={renderPopular}
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

      <Section title={t('home.sections.latest')} data={latest}>
        <FlatList
          horizontal
          showsHorizontalScrollIndicator={false}
          data={latest}
          keyExtractor={(item) => item.id}
          renderItem={renderLatest}
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

import React, { useCallback, useEffect, useMemo } from 'react';
import {
  ScrollView,
  FlatList,
  View,
  StyleSheet,
} from 'react-native';
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
import { WatchHistory } from '../../../shared/components/WatchHistory';
import { GenreSection } from '../../../shared/components/GenreSection';
import { NewMovieCard } from '../../../shared/components/NewMovieCard';

export function MoviesScreen() {
  const { t } = useTranslation();
  const dispatch = useDispatch<AppDispatch>();

  const { popular, latest, history } =
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
      <WatchHistory item={item} />
    ),
    [],
  );

  const renderReel = useCallback(
    ({ item }: { item: (typeof reels)[0] }) => (
      <ReelCard item={item} />
    ),
    [],
  );

  return (
    <ScrollView
      style={styles.container}
      showsVerticalScrollIndicator={false}
    >
      <Section title={t('home.sections.most_watched')} data={popularCombined}>
        <FlatList
          horizontal
          showsHorizontalScrollIndicator={false}
          data={popularCombined}
          keyExtractor={(item) => `${item.type}-${item.item.id}`}
          contentContainerStyle={styles.horizontalList}
          renderItem={({ item }) => (
            <MovieCard
              movie={item.item}
              contentType={item.type}
              style={styles.wideMovieCard}
            />
          )}
        />
      </Section>

      <GenreSection />

      <Section title={t('home.sections.continue_watching')} data={history}>
        <FlatList
          horizontal
          showsHorizontalScrollIndicator={false}
          data={history}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.horizontalList}
          renderItem={renderHistory}
        />
      </Section>

      <Section title={t('home.sections.latest')} data={latestCombined}>
        <FlatList
          horizontal
          showsHorizontalScrollIndicator={false}
          data={latestCombined}
          keyExtractor={(item) => `${item.type}-${item.item.id}`}
          contentContainerStyle={styles.horizontalList}
          renderItem={({ item }) => (
            <NewMovieCard
              movie={item.item}
              contentType={item.type}
              style={styles.narrowMovieCard}
            />
          )}
        />
      </Section>

      <Section title={t('home.sections.reels')} data={reels}>
        <FlatList
          horizontal
          showsHorizontalScrollIndicator={false}
          data={reels}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.horizontalList}
          renderItem={renderReel}
        />
      </Section>

      <View style={styles.bottomSpacer} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#101010',
    paddingHorizontal: 20,
  },
  horizontalList: {
    gap: 16,
    paddingVertical: 10,
  },
  wideMovieCard: {
    width: 320,
  },
  narrowMovieCard: {
    width: 200,
  },
  bottomSpacer: {
    height: 50,
  },
});

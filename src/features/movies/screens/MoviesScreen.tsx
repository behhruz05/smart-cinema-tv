import React, { useEffect } from 'react';
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

  useEffect(() => {
    dispatch(fetchPopular());
    dispatch(fetchLatest());
    dispatch(fetchHistory());
    dispatch(fetchChannels());
    dispatch(fetchReels({ page: 1, per_page: 20 }));
  }, [dispatch]);

  return (
    <ScrollView
      style={styles.container}
      showsVerticalScrollIndicator={false}
    >
      <Section title={t('home.sections.most_watched')} data={popular}>
        <FlatList
          horizontal
          showsHorizontalScrollIndicator={false}
          data={popular}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.horizontalList}
          renderItem={({ item }) => (
            <MovieCard
              movie={item}
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
          renderItem={({ item }) => (
            <WatchHistory item={item} />
          )}
        />
      </Section>

      <Section title={t('home.sections.latest')} data={latest}>
        <FlatList
          horizontal
          showsHorizontalScrollIndicator={false}
          data={latest}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.horizontalList}
          renderItem={({ item }) => (
            <NewMovieCard
              movie={item}
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
          renderItem={({ item }) => (
            <ReelCard item={item} />
          )}
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

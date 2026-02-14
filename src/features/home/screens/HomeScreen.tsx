import React, { useEffect } from 'react';
import { ScrollView, FlatList } from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import {
  fetchPopular,
  fetchLatest,
  fetchHistory,
  fetchChannels,
} from '../../../store/slice/home.slice';
import { fetchReels } from '../../../store/slice/reel.slice';
import { AppDispatch, RootState } from '../../../store';
import { Section } from '../components/Section';
import { MovieCard } from '../components/MovieCard';
import { ReelCard } from '../components/ReelCard';
import { ChannelCard } from '../components/ChannelCard';
import { HomeCarousel } from '../components/HomeCarousel';
import { WatchHistory } from '../components/WatchHistory';

export function HomeScreen() {
  const dispatch = useDispatch<AppDispatch>();

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

  return (
    <ScrollView
      style={{
        backgroundColor: '#101010',
        paddingHorizontal: 20,
      }}
      showsVerticalScrollIndicator={false}
    >
      <HomeCarousel />

      {/* Popular */}
      <Section title="Больше всего смотрят" data={popular}>
        <FlatList
          horizontal
          showsHorizontalScrollIndicator={false}
          data={popular}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <MovieCard item={item} />
          )}
        />
      </Section>

      {/* Continue Watching */}
      <Section title="Продолжить просмотр" data={history}>
        <FlatList
          horizontal
          showsHorizontalScrollIndicator={false}
          data={history}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <WatchHistory item={item} />
          )}
        />
      </Section>

      {/* Latest */}
      <Section title="Новинки" data={latest}>
        <FlatList
          horizontal
          showsHorizontalScrollIndicator={false}
          data={latest}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <MovieCard item={item} />
          )}
        />
      </Section>

      {/* Reels */}
      <Section title="Reels" data={reels}>
        <FlatList
          horizontal
          showsHorizontalScrollIndicator={false}
          data={reels}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <ReelCard item={item} />
          )}
        />
      </Section>

      {/* Channels */}
      <Section title="Телеканалы" data={channels}>
        <FlatList
          horizontal
          showsHorizontalScrollIndicator={false}
          data={channels}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <ChannelCard item={item} />
          )}
        />
      </Section>
    </ScrollView>
  );
}


import React, { useEffect } from 'react';
import { ScrollView } from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import {
  fetchPopular,
  fetchLatest,
  fetchHistory,
  fetchReels,
  fetchChannels,
} from '../../../store/slice/home.slice';
import { AppDispatch, RootState } from '../../../store';
import { Section } from '../components/Section';
import { MovieCard } from '../components/MovieCard';
import { ReelCard } from '../components/ReelCard';
import { ChannelCard } from '../components/ChannelCard';
import { FlatList } from 'react-native';
import { HomeCarousel } from '../components/HomeCarousel';
import { WatchHistory } from '../components/WatchHistory';

export function HomeScreen() {
  const dispatch = useDispatch<AppDispatch>();
  const { popular, latest, history, reels, channels } =
    useSelector((state: RootState) => state.home);

  useEffect(() => {
    dispatch(fetchPopular());
    dispatch(fetchLatest());
    dispatch(fetchHistory());
    dispatch(fetchReels());
    dispatch(fetchChannels());
  }, [dispatch]);

  return (
    <ScrollView style={{ backgroundColor: '#101010', paddingHorizontal: 20 }}>
      <HomeCarousel/>
      <Section title="Продолжить просмотр" data={history}>
        <FlatList
          horizontal
          data={history}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <WatchHistory item={item} />
          )}
        />
      </Section>

      <Section title="Больше всего смотрят" data={popular}>
        <FlatList
          horizontal
          data={popular}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <MovieCard item={item} />
          )}
        />
      </Section>

      <Section title="Новинки" data={latest}>
        <FlatList
          horizontal
          data={latest}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <ReelCard item={item} />
          )}
        />
      </Section>

      <Section title="Reels" data={reels}>
        <FlatList
          horizontal
          data={reels}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <ReelCard item={item} />
          )}
        />
      </Section>

      <Section title="Телеканалы" data={channels}>
        <FlatList
          horizontal
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
import React, { useEffect } from 'react';
import {
  View,
  StyleSheet,
  ActivityIndicator,
  Text,
  FlatList,
  Pressable,
} from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import { RootState, AppDispatch } from '../../../store';
import {
  fetchGenres,
  fetchGenreMovies,
  setSelectedGenre,
} from '../../../store/slice/search.slice';

export function PopularMovies() {
  const dispatch = useDispatch<AppDispatch>();

  const { genres, genreLoading, selectedGenre } = useSelector(
    (state: RootState) => state.search
  );

  useEffect(() => {
    if (genres.length === 0) {
      dispatch(fetchGenres());
    }
  }, []);

  if (genreLoading) {
    return <ActivityIndicator color="#fff" />;
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Популярные жанры</Text>

      <FlatList
        data={genres}
        horizontal
        showsHorizontalScrollIndicator={false}
        keyExtractor={(item) => item.id}
        contentContainerStyle={{ gap: 10 }}
        renderItem={({ item }) => {
          const isActive = selectedGenre === item.id;

          return (
            <Pressable
              style={[
                styles.popular,
                isActive && styles.activePopular,
              ]}
              onPress={() => {
                dispatch(setSelectedGenre(item.id));
                dispatch(fetchGenreMovies(item.id));
              }}
            >
              <Text
                style={[
                  styles.titles,
                  isActive && styles.activeText,
                ]}
              >
                {item.name}
              </Text>
            </Pressable>
          );
        }}
      />
    </View>
  );
}


const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 20,
    gap: 12,
    marginBottom: 20
  },
  title: {
    fontSize: 16,
    color: '#838383',
  },
  popular: {
    paddingHorizontal: 14,
    paddingVertical: 10,
    backgroundColor: '#1A1A1A',
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  titles: {
    color: '#fff',
    fontSize: 13,
  },

  activePopular: {
    backgroundColor: '#fff',
  },
  activeText: {
    color: '#000',
    fontWeight: '600',
  },
});

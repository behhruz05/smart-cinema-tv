import React, { useEffect, useState } from 'react';
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

export function MovieGanres() {
  const dispatch = useDispatch<AppDispatch>();

  const { genres, selectedGenre } = useSelector(
    (state: RootState) => state.search
  );

  const [focusedId, setFocusedId] = useState<string | null>(null);

  useEffect(() => {
    if (genres.length === 0) {
      dispatch(fetchGenres());
    }
  }, []);

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Популярные жанры</Text>

      <FlatList
        data={genres}
        horizontal
        showsHorizontalScrollIndicator={false}
        keyExtractor={(item) => item.id}
        contentContainerStyle={{ gap: 10 }}
        renderItem={({ item, index }) => {
          const isActive = selectedGenre === item.id;
          const isFocused = focusedId === item.id;

          return (
            <Pressable
              focusable
              hasTVPreferredFocus={index === 0}
              onFocus={() => setFocusedId(item.id)}
              onBlur={() => setFocusedId(null)}
              style={[
                styles.popular,
                isActive && styles.activePopular,
                isFocused && styles.focusedGenre,
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
    borderWidth: 2,
    borderColor: 'transparent',
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
  focusedGenre: {
    borderColor: '#fff',
    transform: [{ scale: 1.01 }],
  },
});

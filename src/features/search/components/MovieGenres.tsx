import React, { useEffect, useState } from 'react';
import {
  View,
  StyleSheet,
  Text,
  FlatList,
  Pressable,
  Platform,
} from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import { useTranslation } from 'react-i18next';
import { RootState, AppDispatch } from '../../../store';
import {
  fetchGenres,
  fetchGenreMovies,
  setSelectedGenre,
} from '../../../store/slice/movie.slice';

export function MovieGenres() {
  const { t } = useTranslation();
  const dispatch = useDispatch<AppDispatch>();

  const { genres, selectedGenre } = useSelector(
    (state: RootState) => state.movie
  );

  const [focusedId, setFocusedId] = useState<string | null>(null);
  const isTV = Platform.isTV;

  useEffect(() => {
    if (genres.length === 0) {
      dispatch(fetchGenres());
    }
  }, [dispatch, genres.length]);

  return (
    <View style={styles.container}>
      <Text style={styles.title}>{t('search.popular_genres')}</Text>

      <FlatList
        data={genres}
        horizontal
        showsHorizontalScrollIndicator={false}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.list}
        renderItem={({ item, index }) => {
          const isActive = selectedGenre === item.id;
          const isFocused = focusedId === item.id;

          return (
            <Pressable
              focusable={isTV}
              hasTVPreferredFocus={isTV && index === 0}
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
  list: {
    gap: 10,
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
  },
  focusedGenre: {
    borderColor: '#fff',
  },
});

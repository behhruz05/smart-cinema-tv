import React from 'react';
import { FlatList, StyleSheet, Text, View } from 'react-native';
import { Movie } from '../../../types/search';
import { NewMovieCard } from '../../../shared/components/NewMovieCard';

interface MovieSimilarRailProps {
  title: string;
  movies: Movie[];
}

export function MovieSimilarRail({
  title,
  movies,
}: MovieSimilarRailProps) {
  if (!movies.length) return null;

  return (
    <View style={styles.section}>
      <Text style={styles.title}>{title}</Text>
      <FlatList
        horizontal
        data={movies}
        keyExtractor={item => item.id}
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.list}
        renderItem={({ item }) => (
          <NewMovieCard movie={item} style={styles.card} />
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  section: {
    paddingHorizontal: 20,
    paddingTop: 12,
    paddingBottom: 36,
  },
  title: {
    color: '#fff',
    fontSize: 24,
    fontWeight: '600',
    marginBottom: 14,
  },
  list: {
    gap: 16,
  },
  card: {
    width: 180,
  },
});

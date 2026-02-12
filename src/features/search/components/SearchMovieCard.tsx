import React from 'react';
import { View, Text, Image, StyleSheet } from 'react-native';
import { Movie } from '../../../types/search';

interface Props {
  movie: Movie;
}

export const SearchMovieCard = React.memo(({ movie }: Props) => {
  const rating = Number(movie.imdb_rating).toFixed(1);

  return (
    <View style={styles.card}>
      <Image source={{ uri: movie.poster_url }} style={styles.image} />

      <View style={styles.info}>
        <Text style={styles.title} numberOfLines={1}>
          {movie.title_uz}
        </Text>

        <Text style={styles.meta}>
          ⭐ {rating} • {movie.year}
        </Text>
      </View>
    </View>
  );
});

const styles = StyleSheet.create({
  card: {
    marginBottom: 20,
  },
  image: {
    width: '100%',
    height: 230,
    borderRadius: 14,
  },
  info: {
    marginTop: 8,
  },
  title: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
  meta: {
    color: '#888',
    fontSize: 12,
    marginTop: 4,
  },
});

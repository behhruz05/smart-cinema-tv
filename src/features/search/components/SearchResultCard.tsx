import React, { useState } from 'react';
import {
  View,
  Text,
  Image,
  StyleSheet,
  Pressable,
  ViewStyle,
} from 'react-native';
import { Movie } from '../../../types/search';

interface Props {
  movie: Movie;
  style?: ViewStyle;
}

export const SearchResultCard = React.memo(({ movie, style }: Props) => {
  const [focused, setFocused] = useState(false);

  const rating = movie?.imdb_rating
    ? Number(movie.imdb_rating).toFixed(1)
    : null;

  return (
    <Pressable
      focusable
      onFocus={() => setFocused(true)}
      onBlur={() => setFocused(false)}
      style={[
        styles.card,
        style,
        focused && styles.focusedCard,
      ]}
    >
      <Image
        source={{ uri: movie.poster_url }}
        style={styles.image}
      />

      <View style={styles.info}>
        <Text style={styles.title} numberOfLines={1}>
          {movie.title_uz || movie.title_ru}
        </Text>

        <Text style={styles.meta}>
          {rating ? `⭐ ${rating} • ` : ''}
          {movie.year}
        </Text>
      </View>
    </Pressable>
  );
});

const styles = StyleSheet.create({
  card: {
    borderRadius: 14,
    borderWidth: 2,
    borderColor: 'transparent',
    padding: 10
  },
  focusedCard: {
    borderColor: '#fff',
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
  },
  meta: {
    color: '#888',
    fontSize: 12,
    marginTop: 4,
  },
});

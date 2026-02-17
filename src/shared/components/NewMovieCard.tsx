import React, { useState } from 'react';
import {
  Image,
  StyleSheet,
  Pressable,
  ViewStyle,
} from 'react-native';
import { Movie } from '../../types/search';

interface Props {
  movie: Movie;
  style?: ViewStyle;
}

export const NewMovieCard = React.memo(({ movie, style }: Props) => {
  const [focused, setFocused] = useState(false);

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
    </Pressable>
  );
});

const styles = StyleSheet.create({
  card: {
    borderRadius: 14,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  focusedCard: {
    borderColor: '#fff',
  },
  image: {
    width: '100%',
    height: 250,
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

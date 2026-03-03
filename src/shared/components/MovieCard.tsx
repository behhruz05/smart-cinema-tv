import React, { useState } from 'react';
import {
  Image,
  Platform,
  StyleSheet,
  Pressable,
  ViewStyle,
} from 'react-native';
import { Movie } from '../../types/search';
import { Series } from '../../types/series';
import { useNavigation } from '@react-navigation/native';

interface Props {
  movie: Movie | Series;
  contentType?: 'movie' | 'series';
  style?: ViewStyle;
  tall?: boolean;
}

export const MovieCard = React.memo(({
  movie,
  contentType = 'movie',
  style,
  tall = false,
}: Props) => {
  const [focused, setFocused] = useState(false);
  const navigation = useNavigation<any>();
  const isTV = Platform.isTV;

  const handlePress = () => {
    if (contentType === 'series') {
      navigation.navigate('SeriesDetail', {
        seriesId: movie.id,
      });
      return;
    }

    navigation.navigate('MovieDetail', {
      movieId: movie.id,
    });
  };

  return (
    <Pressable
      focusable={isTV}
      onFocus={() => setFocused(true)}
      onBlur={() => setFocused(false)}
      onPress={handlePress}
      style={[
        styles.card,
        style,
        focused && styles.focusedCard,
      ]}
    >
      <Image
        source={{ uri: movie.poster_url }}
        style={[styles.image, tall && styles.tallImage]}
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
    height: 180,
    borderRadius: 14,
  },
  tallImage: {
    height: 250,
  },
});

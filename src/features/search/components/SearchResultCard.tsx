import React, { useState } from 'react';
import {
  View,
  Text,
  Image,
  StyleSheet,
  Pressable,
  ViewStyle,
  Platform,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Movie } from '../../../types/search';
import { RootStackParamList } from '../../../types/navigations';

interface Props {
  movie: Movie;
  style?: ViewStyle;
}

type NavProp = NativeStackNavigationProp<RootStackParamList>;

export const SearchResultCard = React.memo(({ movie, style }: Props) => {
  const navigation = useNavigation<NavProp>();
  const isTV = Platform.isTV;
  const [focused, setFocused] = useState(false);

  const rating = movie?.imdb_rating
    ? Number(movie.imdb_rating).toFixed(1)
    : null;

  return (
    <Pressable
      focusable={isTV}
      onFocus={() => setFocused(true)}
      onBlur={() => setFocused(false)}
      onPress={() => navigation.navigate('MovieDetail', { movieId: movie.id })}
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

import React, { useState } from 'react';
import {
  Image,
  Platform,
  StyleSheet,
  Pressable,
  ViewStyle,
} from 'react-native';
import { Movie } from '../../types/search';
import { useNavigation } from '@react-navigation/native';

interface Props {
  movie: Movie;
  style?: ViewStyle;
}

export const MovieCard = React.memo(({ movie, style }: Props) => {
  const [focused, setFocused] = useState(false);
  const navigation = useNavigation<any>();
  const isTV = Platform.isTV;

  const handlePress = () => {
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
    height: 180,
    borderRadius: 14,
  },
});

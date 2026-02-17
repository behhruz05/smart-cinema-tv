import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  FlatList,
  Pressable,
  StyleSheet,
  Platform,
} from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigation } from '@react-navigation/native';
import { AppDispatch, RootState } from '../../store';
import { fetchGenres } from '../../store/slice/movie.slice';

export const GenreSection = () => {
  const dispatch = useDispatch<AppDispatch>();
  const navigation = useNavigation<any>();
  const [focusedId, setFocusedId] = useState<string | null>(null);

  const { genres } = useSelector(
    (state: RootState) => state.movie
  );

  useEffect(() => {
    dispatch(fetchGenres());
  }, [dispatch]);

  const handlePress = (genre: any) => {
    navigation.navigate('Ganre', {
      genreId: genre.id,
      genreName: genre.name,
      slug: genre.slug,
    });
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Жанры</Text>

      <FlatList
        horizontal
        showsHorizontalScrollIndicator={false}
        data={genres}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.list}
        renderItem={({ item, index }) => {
          const isFocused = focusedId === item.id;

          return (
            <Pressable
              onPress={() => handlePress(item)}
              onFocus={() => setFocusedId(item.id)}
              onBlur={() => setFocusedId(null)}
              hasTVPreferredFocus={index === 0}
              style={[
                styles.genreItem,
                isFocused && styles.focusedItem,
              ]}
            >
              <Text style={styles.genreText}>
                {item.name}
              </Text>
            </Pressable>
          );
        }}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginTop: 30,
  },
  title: {
    color: '#fff',
    fontSize: 20,
  },
  list: {
    gap: 10,
    paddingVertical: 15,
  },
  genreItem: {
    width: 150,
    paddingVertical: 30,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#2C2C2C',
    borderRadius: 12,
    borderWidth: 2,
borderColor: 'transparent'
  },
  focusedItem: {
    borderWidth: 2,
    borderColor: '#fff',
  },
  genreText: {
    color: '#fff',
    fontSize: 18,
  },
});

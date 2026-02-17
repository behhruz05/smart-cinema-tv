import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  FlatList,
  Pressable,
  StyleSheet,
} from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useTranslation } from 'react-i18next';
import { AppDispatch, RootState } from '../../store';
import { fetchGenres } from '../../store/slice/movie.slice';
import { RootStackParamList } from '../../types/navigations';

interface Props {
  activeGenreId?: string;
}

interface GenreItem {
  id: string;
  name: string;
  slug: string;
}

export const GenreSection = ({ activeGenreId }: Props) => {
  const { t } = useTranslation();
  const dispatch = useDispatch<AppDispatch>();
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const [focusedId, setFocusedId] = useState<string | null>(null);

  const { genres } = useSelector(
    (state: RootState) => state.movie
  );

  useEffect(() => {
    dispatch(fetchGenres());
  }, [dispatch]);

  const handlePress = (genre: GenreItem) => {
    navigation.navigate('Genre', {
      genreId: genre.id,
      genreName: genre.name,
      slug: genre.slug,
    });
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>{t('genre.title')}</Text>

      <FlatList
        horizontal
        showsHorizontalScrollIndicator={false}
        data={genres}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.list}
        renderItem={({ item, index }) => {
          const isFocused = focusedId === item.id;
          const isActive = activeGenreId === item.id;

          return (
            <Pressable
              onPress={() => handlePress(item)}
              onFocus={() => setFocusedId(item.id)}
              onBlur={() => setFocusedId(null)}
              hasTVPreferredFocus={index === 0}
              style={[
                styles.genreItem,
                isActive && styles.activeItem,
                isFocused && styles.focusedItem,
              ]}
            >
              <Text style={[styles.genreText, isActive && styles.activeText]}>
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
    borderColor: 'transparent',
  },
  focusedItem: {
    borderColor: '#fff',
  },
  activeItem: {
    backgroundColor: '#fff',
  },
  genreText: {
    color: '#fff',
    fontSize: 18,
  },
  activeText: {
    color: '#000',
    fontWeight: '700',
  },
});

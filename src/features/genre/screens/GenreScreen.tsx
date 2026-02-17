import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  Pressable,
  ActivityIndicator,
  Dimensions,
  Platform,
} from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import { useTranslation } from 'react-i18next';
import { useRoute, useNavigation } from '@react-navigation/native';
import { AppDispatch, RootState } from '../../../store';
import { fetchGenreMovies } from '../../../store/slice/movie.slice';
import { MovieCard } from '../../../shared/components/MovieCard';
import { BackIcon } from '../../../shared/icons/BackIcon';
import { GenreSection } from '../../../shared/components/GenreSection';

const { width } = Dimensions.get('window');

const NUM_COLUMNS = 3;
const GAP = 16;
const HORIZONTAL_PADDING = 40;

const ITEM_WIDTH =
  (width - HORIZONTAL_PADDING - GAP * (NUM_COLUMNS - 1)) /
  NUM_COLUMNS;

export function GenreScreen() {
  const { t } = useTranslation();
  const dispatch = useDispatch<AppDispatch>();
  const route = useRoute<any>();
  const navigation = useNavigation<any>();

  const { genreId, genreName } = route.params;

  const { genreMovies, genreStatus } = useSelector(
    (state: RootState) => state.movie
  );

  const isTV = Platform.isTV;
  const [backFocused, setBackFocused] = useState(false);

  useEffect(() => {
    dispatch(fetchGenreMovies(genreId));
  }, [genreId, dispatch]);

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Pressable
          onPress={() => navigation.goBack()}
          focusable={isTV}
          hasTVPreferredFocus={isTV}
          onFocus={() => setBackFocused(true)}
          onBlur={() => setBackFocused(false)}
          style={[
            styles.back,
            backFocused && styles.backFocused,
          ]}
        >
          <BackIcon
            size={20}
            color={backFocused ? '#fff' : '#888'}
          />
          <Text
            style={[
              styles.backText,
              backFocused && styles.backTextFocused,
            ]}
          >
            {t('genre.back')}
          </Text>
        </Pressable>

        <Text style={styles.title}>{genreName}</Text>
      </View>
      <GenreSection activeGenreId={genreId} />


      {genreStatus === 'loading' && (
        <ActivityIndicator
          size="large"
          color="#fff"
          style={styles.loader}
        />
      )}

      {genreStatus === 'success' && (
        <FlatList
          data={genreMovies}
          numColumns={NUM_COLUMNS}
          keyExtractor={(item) => item.id.toString()}
          columnWrapperStyle={styles.row}
          contentContainerStyle={styles.list}
          renderItem={({ item }) => (
            <MovieCard
              movie={item}
              style={{ width: ITEM_WIDTH }}
            />
          )}
        />
      )}

      {genreStatus === 'error' && (
        <Text style={styles.errorText}>
          {t('genre.loading_error')}
        </Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#101010',
    paddingHorizontal: 20,
    paddingTop: 20,
  },
  header: {
    flexDirection: 'row',
    gap: 14,
    alignItems: 'center',
    marginBottom: 25,
  },
  back: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
    height: 50,
    gap: 8,
    backgroundColor: '#1A1A1A',
    borderRadius: 10,
    borderWidth: 2,
    borderColor: 'transparent'

  },
  backFocused: {
    borderColor: '#fff'
  },
  backText: {
    color: '#888',
    fontSize: 16,
  },
  backTextFocused: {
    color: '#fff',
  },
  title: {
    fontSize: 26,
    color: '#fff',
    fontWeight: '700',
  },
  list: {
    paddingBottom: 40,
  },
  row: {
    marginBottom: GAP,
  },
  loader: {
    marginTop: 120,
  },
  errorText: {
    color: 'red',
    textAlign: 'center',
    marginTop: 120,
  },
});

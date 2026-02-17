import React, { useEffect } from 'react';
import {
  View,
  FlatList,
  StyleSheet,
  ActivityIndicator,
  Dimensions,
  Text,
} from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import { useTranslation } from 'react-i18next';
import { RootState, AppDispatch } from '../../../store';
import {
  fetchSearchMovies,
  fetchPopularMovies,
  clearSearch,
  setSelectedGenre,
} from '../../../store/slice/movie.slice';
import { Header } from '../../../shared/loyaut/Header';
import { SearchNotFound } from '../components/SearchNotFound';
import { MovieGanres } from '../components/MovieGenres';
import { SearchResultCard } from '../components/SearchResulatCard';

const { width } = Dimensions.get('window');

const NUM_COLUMNS = 4;
const GAP = 16;
const HORIZONTAL_PADDING = 40;

const ITEM_WIDTH =
  (width - HORIZONTAL_PADDING - GAP * (NUM_COLUMNS - 1)) /
  NUM_COLUMNS;

export function SearchScreen() {
  const { t } = useTranslation();
  const dispatch = useDispatch<AppDispatch>();

  const {
    searchResults,
    popular,
    genreMovies,
    selectedGenre,
    query,
    popularStatus,
    searchStatus,
    genreStatus,
  } = useSelector((state: RootState) => state.movie);

  const isSearching = query.trim().length > 0;

  useEffect(() => {
    if (popular.length === 0) {
      dispatch(fetchPopularMovies());
    }
  }, [dispatch]);

  useEffect(() => {
    const timeout = setTimeout(() => {
      if (isSearching) {
        dispatch(fetchSearchMovies(query));
        dispatch(setSelectedGenre(null));
      }
    }, 400);

    return () => clearTimeout(timeout);
  }, [query, isSearching, dispatch]);

  useEffect(() => {
    if (!isSearching) {
      dispatch(clearSearch());
    }
  }, [isSearching, dispatch]);

  const renderMovies = (data: any[]) => (
    <FlatList
      data={data}
      numColumns={NUM_COLUMNS}
      keyExtractor={(item) => item.id.toString()}
      columnWrapperStyle={styles.row}
      contentContainerStyle={styles.list}
      renderItem={({ item }) => (
        <SearchResultCard
          movie={item}
          style={{ width: ITEM_WIDTH }}
        />
      )}
    />
  );

  return (
    <View style={styles.container}>
      <Header />

      {!isSearching && (
        <>
          <MovieGanres />

          {selectedGenre ? (
            genreStatus === 'loading' ? (
              <ActivityIndicator size="large" color="#fff" style={styles.loader} />
            ) : (
              renderMovies(genreMovies)
            )
          ) : (
            <>
              <Text style={styles.sectionTitle}>
                {t('search.recommended')}
              </Text>

              {popularStatus === 'loading' ? (
                <ActivityIndicator size="large" color="#fff" style={styles.loader} />
              ) : (
                renderMovies(popular)
              )}
            </>
          )}
        </>
      )}

      {isSearching && (
        <>
          {searchStatus === 'loading' && (
            <ActivityIndicator size="large" color="#fff" style={styles.loader} />
          )}

          {searchStatus === 'success' && searchResults.length === 0 && (
            <SearchNotFound />
          )}

          {searchStatus === 'success' && searchResults.length > 0 && (
            <>
              <Text style={styles.sectionTitle}>
                {t('search.results')}
              </Text>
              {renderMovies(searchResults)}
            </>
          )}

          {searchStatus === 'error' && (
            <Text style={styles.errorText}>
              {t('errors.loading')}
            </Text>
          )}
        </>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#101010',
    gap: 25,
  },
  sectionTitle: {
    color: '#838383',
    fontSize: 16,
    paddingHorizontal: 20,
  },
  list: {
    paddingHorizontal: 20,
    paddingBottom: 40,
  },
  row: {
    marginBottom: GAP,

  },
  loader: {
    marginTop: 100,
  },
  errorText: {
    color: 'red',
    textAlign: 'center',
    marginTop: 100,
  },
});

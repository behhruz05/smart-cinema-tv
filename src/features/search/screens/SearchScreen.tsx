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
import { RootState, AppDispatch } from '../../../store';
import {
  fetchSearchMovies,
  fetchPopularMovies,
  clearSearch,
  setSelectedGenre,
} from '../../../store/slice/search.slice';
import { Header } from '../../../shared/loyaut/Header';
import { SearchNotFound } from '../components/SearchNotFound';
import { MovieGanres } from '../components/MovieGanres';
import { MovieCard } from '../components/MovieCard';

const { width } = Dimensions.get('window');

const NUM_COLUMNS = 5;
const HORIZONTAL_PADDING = 40;
const GAP = 10;

const ITEM_WIDTH =
  (width - HORIZONTAL_PADDING - GAP * (NUM_COLUMNS - 1)) /
  NUM_COLUMNS;

export function SearchScreen() {
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
  } = useSelector((state: RootState) => state.search);

  const isSearching = query.trim().length > 0;

  /* ================= POPULAR FETCH ================= */
  useEffect(() => {
    if (popular.length === 0) {
      dispatch(fetchPopularMovies());
    }
  }, [dispatch]);

  /* ================= SEARCH DEBOUNCE ================= */
  useEffect(() => {
    const timeout = setTimeout(() => {
      if (isSearching) {
        dispatch(fetchSearchMovies(query));
        dispatch(setSelectedGenre(null));
      }
    }, 400);

    return () => clearTimeout(timeout);
  }, [query, isSearching, dispatch]);

  /* ================= CLEAR SEARCH ================= */
  useEffect(() => {
    if (!isSearching) {
      dispatch(clearSearch());
    }
  }, [isSearching, dispatch]);

  /* ================= UNMOUNT CLEAN ================= */
  useEffect(() => {
    return () => {
      dispatch(clearSearch());
      dispatch(setSelectedGenre(null));
    };
  }, [dispatch]);

  /* ================= RENDER ================= */

  const renderMovies = (data: any[]) => (
    <FlatList
      data={data}
      numColumns={NUM_COLUMNS}
      keyExtractor={(item) => item.id.toString()}
      columnWrapperStyle={styles.row}
      contentContainerStyle={styles.list}
      renderItem={({ item }) => (
        <View style={{ width: ITEM_WIDTH }}>
          <MovieCard movie={item} />
        </View>
      )}
    />
  );

  return (
    <View style={styles.container}>
      <Header />

      {/* ================= SEARCH YO‘Q ================= */}
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
                Вам может понравиться
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

      {/* ================= SEARCH BOR ================= */}
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
                Результаты поиска
              </Text>
              {renderMovies(searchResults)}
            </>
          )}

          {searchStatus === 'error' && (
            <Text style={styles.errorText}>
              Ошибка загрузки
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
    justifyContent: 'flex-start',
    gap: 10,
    marginBottom: 15,
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

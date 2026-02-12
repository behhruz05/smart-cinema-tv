import React, { useEffect } from 'react';
import {
  View,
  FlatList,
  StyleSheet,
  ActivityIndicator,
  Dimensions,
} from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import { RootState, AppDispatch } from '../../../store';
import {
  fetchSearchMovies,
  fetchPopularMovies,
  setSelectedGenre,
  clearSearch,
} from '../../../store/slice/search.slice';
import { SearchMovieCard } from '../components/SearchMovieCard';
import { PopularMovies } from '../components/PopularMovie';
import { Header } from '../../../shared/loyaut/Header';
import { SearchNotFound } from '../components/SearchNotFound';

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
    loading,
  } = useSelector((state: RootState) => state.search);

  const isSearching = query.trim().length > 0;

  useEffect(() => {
    if (popular.length === 0) {
      dispatch(fetchPopularMovies());
    }
  }, []);

  useEffect(() => {
    const timeout = setTimeout(() => {
      if (isSearching) {
        dispatch(fetchSearchMovies(query));
        dispatch(setSelectedGenre(null));
      }
    }, 400);

    return () => clearTimeout(timeout);
  }, [query]);

  useEffect(() => {
    return () => {
      dispatch(clearSearch());
      dispatch(setSelectedGenre(null));
    };
  }, []);

  const getMovies = () => {
    if (isSearching) return searchResults;
    if (selectedGenre) return genreMovies;
    return popular;
  };

  return (
    <View style={styles.container}>
      <Header />

      {!isSearching && <PopularMovies />}

<FlatList
  data={getMovies()}
  numColumns={NUM_COLUMNS}
  keyExtractor={(item) => item.id}
  columnWrapperStyle={styles.row}
  contentContainerStyle={[
    styles.list,
    isSearching && getMovies().length === 0 && { flex: 1 },
  ]}
  renderItem={({ item }) => (
    <View style={{ width: ITEM_WIDTH }}>
      <SearchMovieCard movie={item} />
    </View>
  )}
  ListEmptyComponent={
    !loading ? (
      <SearchNotFound/>
    ) : null
  }
  ListFooterComponent={
    loading ? (
      <ActivityIndicator
        color="#fff"
        style={{ marginVertical: 20 }}
      />
    ) : null
  }
/>

    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#101010',
    gap: 25,
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
});

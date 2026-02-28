import React, { useEffect } from 'react';
import {
  ActivityIndicator,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import {
  RouteProp,
  useNavigation,
  useRoute,
} from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useTranslation } from 'react-i18next';
import { useDispatch, useSelector } from 'react-redux';

import { RootStackParamList } from '../../../types/navigations';
import { AppDispatch, RootState } from '../../../store';
import {
  checkMovieFavorite,
  fetchMovieById,
  fetchMoviesByCountry,
  toggleMovieFavorite,
} from '../../../store/slice/movie.slice';
import { MovieDetailHero } from '../components/MovieDetailHero';
import { MovieDetailFacts } from '../components/MovieDetailFacts';
import { MovieSimilarRail } from '../components/MovieSimilarRail';

type ScreenRouteProp = RouteProp<
  RootStackParamList,
  'MovieDetail'
>;
type ScreenNavigationProp = NativeStackNavigationProp<RootStackParamList>;

export function MovieDetailScreen() {
  const { t, i18n } = useTranslation();
  const route = useRoute<ScreenRouteProp>();
  const navigation = useNavigation<ScreenNavigationProp>();
  const dispatch = useDispatch<AppDispatch>();
  const { movieId } = route.params;

  const {
    selectedMovie: movie,
    detailStatus,
    relatedMovies,
    relatedStatus,
    favoriteStatus,
  } = useSelector((state: RootState) => state.movie);

  const lang = i18n.language.startsWith('ru')
    ? 'ru'
    : i18n.language.startsWith('en')
      ? 'en'
      : 'uz';

  useEffect(() => {
    dispatch(fetchMovieById({ movieId, lang }));
    dispatch(checkMovieFavorite({ movieId, lang }));
  }, [dispatch, lang, movieId]);

  useEffect(() => {
    if (!movie?.country_id) return;
    dispatch(
      fetchMoviesByCountry({
        countryId: movie.country_id,
        lang,
        page: 1,
        per_page: 20,
      }),
    );
  }, [dispatch, lang, movie?.country_id]);

  if (detailStatus === 'loading' || !movie) {
    return (
      <View style={styles.loader}>
        <ActivityIndicator size="large" color="#fff" />
      </View>
    );
  }

  if (detailStatus === 'error') {
    return (
      <View style={styles.loader}>
        <Text style={styles.errorText}>
          {t('genre.loading_error')}
        </Text>
      </View>
    );
  }

  const title = i18n.language.startsWith('ru')
    ? movie.title_ru || movie.title_uz
    : i18n.language.startsWith('en')
      ? movie.title_en || movie.title_uz
      : movie.title_uz;

  const description = i18n.language.startsWith('ru')
    ? movie.description_ru || movie.description_uz
    : i18n.language.startsWith('en')
      ? movie.description_en || movie.description_uz
      : movie.description_uz;

  const durationHours = Math.floor(
    movie.duration_seconds / 3600,
  );
  const durationMinutes = Math.floor(
    (movie.duration_seconds % 3600) / 60,
  );
  const durationLabel =
    durationHours > 0
      ? t('time.duration_hours_minutes', {
          hours: durationHours,
          minutes: durationMinutes,
        })
      : t('time.duration_minutes', {
          minutes: durationMinutes,
        });

  const similarMovies = relatedMovies.filter(
    relatedMovie => relatedMovie.id !== movie.id,
  );
  return (
    <ScrollView
      style={styles.container}
      showsVerticalScrollIndicator={false}
    >
      <MovieDetailHero
        movie={movie}
        title={title}
        description={description}
        durationLabel={durationLabel}
        backLabel={t('common.back')}
        watchLabel={t('home.carousel.watch')}
        isFavorite={Boolean(movie.is_favorite)}
        isFavoriteLoading={favoriteStatus === 'loading'}
        onBack={() => navigation.goBack()}
        onWatch={() =>
          navigation.navigate('Player', {
            movieId: movie.id,
            posterUri: movie.poster_url,
            title,
            subtitle: durationLabel,
            isLive: false,
            durationSeconds: movie.duration_seconds,
          })
        }
        onToggleFavorite={() => {
          dispatch(
            toggleMovieFavorite({
              movieId: movie.id,
              lang,
              shouldFavorite: !movie.is_favorite,
            }),
          );
        }}
      />

      <MovieDetailFacts
        movie={movie}
        description={description}
        descriptionTitle={t('movie_detail.description')}
        countryTitle={t('movie_detail.country')}
        subtitlesTitle={t('movie_detail.subtitles')}
        qualitiesTitle={t('movie_detail.qualities')}
        castTitle={t('movie_detail.cast')}
        directorsTitle={t('movie_detail.directors')}
        audioTitle={t('movie_detail.audio_tracks')}
        noDataLabel={t('movie_detail.not_available')}
      />

      {relatedStatus !== 'error' && (
        <MovieSimilarRail
          title={t('movie_detail.similar')}
          movies={similarMovies}
        />
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#101010',
  },
  loader: {
    flex: 1,
    backgroundColor: '#101010',
    alignItems: 'center',
    justifyContent: 'center',
  },
  errorText: {
    color: '#f87171',
    fontSize: 16,
  },
});

import React, { useEffect, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  Image,
  ImageBackground,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import { RouteProp, useNavigation, useRoute } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useDispatch, useSelector } from 'react-redux';
import { useTranslation } from 'react-i18next';
import { AppDispatch, RootState } from '../../../store';
import {
  clearSelectedSeries,
  fetchSeasonEpisodes,
  fetchSeriesByCountry,
  fetchSeriesById,
  fetchSeriesSeasons,
  setSelectedSeasonId,
} from '../../../store/slice/series.slice';
import { RootStackParamList } from '../../../types/navigations';
import { PlayIcon } from '../../../shared/icons/PlayIcon';
import { BackIcon } from '../../../shared/icons/BackIcon';
import { MovieCard } from '../../../shared/components/MovieCard';
import { RatingBadge } from '../../../shared/components/RatingBadge';
import { SeriesEpisode, SeriesSeason } from '../../../types/series';

type ScreenRouteProp = RouteProp<RootStackParamList, 'SeriesDetail'>;
type ScreenNavigationProp = NativeStackNavigationProp<RootStackParamList>;

function formatDuration(seconds: number, t: (key: string, options?: Record<string, unknown>) => string) {
  const safe = Math.max(0, Math.floor(seconds || 0));
  const hours = Math.floor(safe / 3600);
  const minutes = Math.floor((safe % 3600) / 60);

  if (hours > 0) {
    return t('time.duration_hours_minutes', { hours, minutes });
  }

  return t('time.duration_minutes', { minutes });
}

export function SeriesDetailScreen() {
  const { t, i18n } = useTranslation();
  const route = useRoute<ScreenRouteProp>();
  const navigation = useNavigation<ScreenNavigationProp>();
  const dispatch = useDispatch<AppDispatch>();
  const isTV = Platform.isTV;
  const { seriesId } = route.params;
  const [focusedEpisodeId, setFocusedEpisodeId] = useState<string | null>(null);

  const {
    selectedSeries,
    detailStatus,
    seasons,
    selectedSeasonId,
    seasonEpisodes,
    episodesStatus,
    related,
  } = useSelector((state: RootState) => state.series);

  const lang: 'uz' | 'ru' | 'en' = i18n.language.startsWith('ru')
    ? 'ru'
    : i18n.language.startsWith('en')
      ? 'en'
      : 'uz';

  useEffect(() => {
    dispatch(fetchSeriesById({ seriesId, lang }));
    dispatch(fetchSeriesSeasons({ seriesId, lang }));

    return () => {
      dispatch(clearSelectedSeries());
    };
  }, [dispatch, lang, seriesId]);

  useEffect(() => {
    if (!selectedSeries?.country_id) {
      return;
    }

    dispatch(
      fetchSeriesByCountry({
        countryId: selectedSeries.country_id,
        page: 1,
        per_page: 20,
        lang,
      }),
    );
  }, [dispatch, lang, selectedSeries?.country_id]);

  useEffect(() => {
    if (!selectedSeasonId) {
      return;
    }

    dispatch(fetchSeasonEpisodes({ seasonId: selectedSeasonId, lang }));
  }, [dispatch, lang, selectedSeasonId]);

  const title = useMemo(() => {
    if (!selectedSeries) return '';

    if (lang === 'ru') {
      return selectedSeries.title_ru || selectedSeries.title_uz;
    }
    if (lang === 'en') {
      return selectedSeries.title_en || selectedSeries.title_uz;
    }
    return selectedSeries.title_uz;
  }, [lang, selectedSeries]);

  const description = useMemo(() => {
    if (!selectedSeries) return '';

    if (lang === 'ru') {
      return selectedSeries.description_ru || selectedSeries.description_uz || '';
    }
    if (lang === 'en') {
      return selectedSeries.description_en || selectedSeries.description_uz || '';
    }
    return selectedSeries.description_uz || '';
  }, [lang, selectedSeries]);

  const castList = useMemo(() => {
    const rawCast = Array.isArray(selectedSeries?.cast) ? selectedSeries?.cast : [];

    return rawCast
      .map(member => {
        if (typeof member === 'string') {
          return member;
        }

        if (member && typeof member === 'object' && 'name' in member) {
          return String((member as { name: unknown }).name);
        }

        return '';
      })
      .filter(Boolean)
      .slice(0, 8);
  }, [selectedSeries?.cast]);

  const similarSeries = useMemo(
    () => related.filter(item => item.id !== selectedSeries?.id),
    [related, selectedSeries?.id],
  );

  const fallbackEpisode = seasonEpisodes[0];
  const continueEpisodeId = selectedSeries?.last_episode_id || fallbackEpisode?.id;

  const handleWatchEpisode = (episode: SeriesEpisode | undefined) => {
    if (!episode || !selectedSeries) {
      return;
    }

    const episodeTitle =
      lang === 'ru'
        ? episode.title_ru || episode.title_uz
        : lang === 'en'
          ? episode.title_en || episode.title_uz
          : episode.title_uz;

    navigation.navigate('Player', {
      episodeId: episode.id,
      posterUri: episode.poster_url || selectedSeries.poster_url,
      title,
      subtitle: episodeTitle,
      isLive: false,
      durationSeconds: episode.duration_seconds,
    });
  };

  const handleWatchByEpisodeId = (episodeId?: string | null) => {
    if (!episodeId || !selectedSeries) return;

    const matchedEpisode = seasonEpisodes.find(item => item.id === episodeId);
    if (matchedEpisode) {
      handleWatchEpisode(matchedEpisode);
      return;
    }

    navigation.navigate('Player', {
      episodeId,
      posterUri: selectedSeries.poster_url,
      title,
      subtitle: '',
      isLive: false,
      durationSeconds: 0,
    });
  };

  if (detailStatus === 'loading' || !selectedSeries) {
    return (
      <View style={styles.loader}>
        <ActivityIndicator size="large" color="#fff" />
      </View>
    );
  }

  if (detailStatus === 'error') {
    return (
      <View style={styles.loader}>
        <Text style={styles.errorText}>{t('genre.loading_error')}</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      <ImageBackground source={{ uri: selectedSeries.poster_url }} style={styles.hero}>
        <LinearGradient
          colors={['rgba(0,0,0,0.1)', 'rgba(0,0,0,0.55)', '#101010']}
          locations={[0.2, 0.7, 1]}
          style={styles.gradient}
        />

        <Pressable
          style={styles.backButton}
          focusable={isTV}
          hasTVPreferredFocus={isTV}
          onPress={() => navigation.goBack()}
        >
          <BackIcon size={16} color="#fff" />
          <Text style={styles.backText}>{t('common.back')}</Text>
        </Pressable>

        <View style={styles.heroContent}>
          <RatingBadge rating={selectedSeries.imdb_rating} style={styles.ratingBadge} />
          <Text style={styles.title}>{title}</Text>

          <View style={styles.badges}>
            <View style={styles.badge}>
              <Text style={styles.badgeText}>
                {selectedSeries.age_rating ? `${selectedSeries.age_rating}+` : '-'}
              </Text>
            </View>
            <View style={styles.badge}><Text style={styles.badgeText}>{(selectedSeries.seasons_count || seasons.length || 0)} {t('series.seasons')}</Text></View>
          </View>

          {description ? (
            <Text numberOfLines={4} style={styles.description}>
              {description}
            </Text>
          ) : null}

          <Pressable
            style={styles.watchButton}
            focusable={isTV}
            onPress={() => handleWatchByEpisodeId(continueEpisodeId)}
          >
            <PlayIcon size={16} color="#000" />
            <Text style={styles.watchText}>{t('home.carousel.watch')}</Text>
          </Pressable>
        </View>
      </ImageBackground>

      <View style={styles.content}>
        <View style={styles.detailsRow}>
          <Image source={{ uri: selectedSeries.poster_url }} style={styles.poster} />

          <View style={styles.detailBlock}>
            <Text style={styles.detailTitle}>{t('movie_detail.cast')}</Text>
            <Text style={styles.detailText}>
              {castList.length ? castList.join(', ') : t('movie_detail.not_available')}
            </Text>
          </View>

          <View style={styles.detailBlock}>
            <Text style={styles.detailTitle}>{t('series.genres')}</Text>
            <Text style={styles.detailText}>
              {selectedSeries.genres?.length
                ? selectedSeries.genres.map(genre => genre.name).join(', ')
                : t('movie_detail.not_available')}
            </Text>
          </View>
        </View>

        <Text style={styles.sectionTitle}>{t('series.season')}</Text>
        <FlatList
          horizontal
          data={seasons}
          keyExtractor={item => item.id}
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.seasonsList}
          renderItem={({ item }: { item: SeriesSeason }) => {
            const isSelected = item.id === selectedSeasonId;

            return (
              <Pressable
                style={[styles.seasonButton, isSelected && styles.seasonButtonActive]}
                focusable={isTV}
                onPress={() => dispatch(setSelectedSeasonId(item.id))}
              >
                <Text style={[styles.seasonButtonText, isSelected && styles.seasonButtonTextActive]}>
                  {item.order_number || '-'}
                </Text>
              </Pressable>
            );
          }}
        />

        <Text style={styles.sectionTitle}>{t('series.episodes')}</Text>

        {episodesStatus === 'loading' ? (
          <ActivityIndicator color="#fff" style={styles.episodesLoader} />
        ) : (
          <FlatList
            horizontal
            data={seasonEpisodes}
            keyExtractor={item => item.id}
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.episodesList}
            renderItem={({ item }) => {
              const isFocused = focusedEpisodeId === item.id;
              const episodeTitle =
                lang === 'ru'
                  ? item.title_ru || item.title_uz
                  : lang === 'en'
                    ? item.title_en || item.title_uz
                    : item.title_uz;

              return (
                <Pressable
                  style={[styles.episodeCard, isFocused && styles.episodeCardFocused]}
                  focusable={isTV}
                  onFocus={() => setFocusedEpisodeId(item.id)}
                  onBlur={() => setFocusedEpisodeId(null)}
                  onPress={() => handleWatchEpisode(item)}
                >
                  <Image source={{ uri: item.poster_url || selectedSeries.poster_url }} style={styles.episodePoster} />
                  <View style={styles.episodeMeta}>
                    <Text numberOfLines={1} style={styles.episodeTitle}>{episodeTitle}</Text>
                    <Text style={styles.episodeDuration}>{formatDuration(item.duration_seconds, t)}</Text>
                  </View>
                </Pressable>
              );
            }}
          />
        )}

        {similarSeries.length > 0 ? (
          <View style={styles.similarSection}>
            <Text style={styles.sectionTitle}>{t('movie_detail.similar')}</Text>
            <FlatList
              horizontal
              data={similarSeries}
              keyExtractor={item => item.id}
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.similarList}
              renderItem={({ item }) => (
                <MovieCard
                  movie={item}
                  contentType="series"
                  style={styles.similarCard}
                />
              )}
            />
          </View>
        ) : null}
      </View>
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
  hero: {
    height: 420,
    justifyContent: 'flex-end',
  },
  gradient: {
    ...StyleSheet.absoluteFillObject,
  },
  backButton: {
    position: 'absolute',
    top: 20,
    left: 20,
    zIndex: 2,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: 'rgba(255,255,255,0.14)',
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 10,
  },
  backText: {
    color: '#fff',
    fontSize: 14,
  },
  heroContent: {
    paddingHorizontal: 20,
    paddingBottom: 24,
  },
  ratingBadge: {
    marginBottom: 8,
  },
  title: {
    color: '#fff',
    fontSize: 36,
    fontWeight: '700',
    marginBottom: 8,
  },
  badges: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginBottom: 10,
  },
  badge: {
    backgroundColor: 'rgba(255,255,255,0.14)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 18,
  },
  badgeText: {
    color: '#fff',
    fontSize: 12,
  },
  description: {
    color: '#d1d5db',
    maxWidth: 820,
    lineHeight: 22,
    marginBottom: 12,
  },
  watchButton: {
    width: 190,
    backgroundColor: '#fff',
    borderRadius: 12,
    paddingHorizontal: 20,
    paddingVertical: 10,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    gap: 8,
  },
  watchText: {
    color: '#000',
    fontSize: 14,
    fontWeight: '600',
  },
  content: {
    paddingHorizontal: 20,
    paddingBottom: 36,
  },
  detailsRow: {
    marginTop: 18,
    flexDirection: 'row',
    gap: 14,
    flexWrap: 'wrap',
  },
  poster: {
    width: 132,
    height: 186,
    borderRadius: 12,
    backgroundColor: '#1a1a1a',
  },
  detailBlock: {
    flex: 1,
    minWidth: 260,
    backgroundColor: '#121212',
    borderRadius: 12,
    padding: 12,
    borderWidth: 1,
    borderColor: '#232323',
  },
  detailTitle: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 6,
  },
  detailText: {
    color: '#b4b4b4',
    fontSize: 14,
    lineHeight: 20,
  },
  sectionTitle: {
    color: '#fff',
    fontSize: 24,
    fontWeight: '600',
    marginTop: 20,
    marginBottom: 12,
  },
  seasonsList: {
    gap: 8,
    paddingBottom: 4,
  },
  seasonButton: {
    minWidth: 42,
    height: 40,
    borderRadius: 10,
    backgroundColor: '#1f1f1f',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#2e2e2e',
    paddingHorizontal: 10,
  },
  seasonButtonActive: {
    backgroundColor: '#fff',
  },
  seasonButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
  seasonButtonTextActive: {
    color: '#000',
  },
  episodesLoader: {
    marginTop: 10,
    marginBottom: 10,
  },
  episodesList: {
    gap: 12,
    paddingBottom: 8,
  },
  episodeCard: {
    width: 290,
    backgroundColor: '#171717',
    borderRadius: 12,
    borderWidth: 2,
    borderColor: 'transparent',
    overflow: 'hidden',
  },
  episodeCardFocused: {
    borderColor: '#fff',
  },
  episodePoster: {
    width: '100%',
    height: 150,
    backgroundColor: '#1e1e1e',
  },
  episodeMeta: {
    padding: 10,
    gap: 4,
  },
  episodeTitle: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  episodeDuration: {
    color: '#b4b4b4',
    fontSize: 13,
  },
  similarSection: {
    marginTop: 10,
  },
  similarList: {
    gap: 12,
  },
  similarCard: {
    width: 180,
  },
});

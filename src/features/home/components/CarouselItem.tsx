import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ImageBackground,
  Pressable,
  Platform,
} from 'react-native';
import { Carousel } from '../../../types/home';
import { PlayIcon } from '../../../shared/icons/PlayIcon';
import { SavedIcon } from '../../../shared/icons/SaverIcon';
import { useTranslation } from 'react-i18next';
import { useNavigation } from '@react-navigation/native';
import { movieService } from '../../../service/movie.service';
import { RatingBadge } from '../../../shared/components/RatingBadge';

interface Props {
  item: Carousel;
  itemIndex: number;
  preferredFocus?: boolean;
  onActionFocus?: (itemIndex: number, action: 'watch' | 'details' | 'save') => void;
  onActionBlur?: (itemIndex: number, action: 'watch' | 'details' | 'save') => void;
  onDirectionalPress?: (direction: 'left' | 'right', itemIndex: number) => void;
  onEdgeNavigate?: (direction: 'left' | 'right', itemIndex: number) => void;
}

function CarouselItemComponent({
  item,
  itemIndex,
  preferredFocus = false,
  onActionFocus,
  onActionBlur,
  onDirectionalPress,
  onEdgeNavigate,
}: Props) {
  const { t, i18n } = useTranslation();
  const movie = item.movie;
  const navigation = useNavigation<any>();
  const isTV = Platform.isTV;
  const [focusedButton, setFocusedButton] = React.useState<
    null | 'watch' | 'details' | 'save'
  >(null);
  const [isFavorite, setIsFavorite] = React.useState(false);
  const [favoriteLoading, setFavoriteLoading] = React.useState(false);
  const watchRef = React.useRef<React.ComponentRef<typeof Pressable> | null>(null);
  const detailsRef = React.useRef<React.ComponentRef<typeof Pressable> | null>(null);
  const saveRef = React.useRef<React.ComponentRef<typeof Pressable> | null>(null);
  const [watchHandle, setWatchHandle] = React.useState<number | undefined>(undefined);
  const [detailsHandle, setDetailsHandle] = React.useState<number | undefined>(undefined);
  const [saveHandle, setSaveHandle] = React.useState<number | undefined>(undefined);
  const lastDirectionalEventRef = React.useRef<{
    direction: 'left' | 'right';
    at: number;
  } | null>(null);

  const lang = i18n.language.startsWith('ru')
    ? 'ru'
    : i18n.language.startsWith('en')
      ? 'en'
      : 'uz';

  const title = i18n.language.startsWith('ru')
    ? movie.title_ru || movie.title_uz
    : i18n.language.startsWith('en')
      ? movie.title_en || movie.title_uz
      : movie.title_uz;

  React.useEffect(() => {
    let isMounted = true;
    movieService
      .checkMovieFavorite(movie.id, lang)
      .then(res => {
        if (isMounted) {
          setIsFavorite(Boolean(res.data.is_favorite));
        }
      })
      .catch(() => {});

    return () => {
      isMounted = false;
    };
  }, [movie.id, lang]);

  const handleToggleFavorite = React.useCallback(async () => {
    if (favoriteLoading) return;

    const nextValue = !isFavorite;
    setFavoriteLoading(true);
    setIsFavorite(nextValue);

    try {
      if (nextValue) {
        await movieService.addMovieToFavorites(movie.id, lang);
      } else {
        await movieService.removeMovieFromFavorites(movie.id, lang);
      }
    } catch {
      setIsFavorite(!nextValue);
    } finally {
      setFavoriteLoading(false);
    }
  }, [favoriteLoading, isFavorite, movie.id, lang]);

  React.useEffect(() => {
    if (!isTV) return;
    const rnModule = require('react-native');
    const findNodeHandle = rnModule?.findNodeHandle as
      | ((componentOrHandle: any) => number | null)
      | undefined;
    if (!findNodeHandle) return;

    setWatchHandle(findNodeHandle(watchRef.current) ?? undefined);
    setDetailsHandle(findNodeHandle(detailsRef.current) ?? undefined);
    setSaveHandle(findNodeHandle(saveRef.current) ?? undefined);
  }, [isTV]);

  const resolveDirection = React.useCallback((event: any): 'left' | 'right' | null => {
    const normalized = String(
      event?.nativeEvent?.key || event?.nativeEvent?.eventType || event?.eventType || '',
    )
      .toLowerCase()
      .trim();
    const keyCode = event?.nativeEvent?.keyCode ?? event?.keyCode;

    if (
      normalized === 'left' ||
      normalized === 'arrowleft' ||
      normalized === 'dpadleft' ||
      normalized === 'swipeleft' ||
      normalized === 'rewind' ||
      keyCode === 21 ||
      keyCode === 37
    ) {
      return 'left';
    }

    if (
      normalized === 'right' ||
      normalized === 'arrowright' ||
      normalized === 'dpadright' ||
      normalized === 'swiperight' ||
      normalized === 'fastforward' ||
      keyCode === 22 ||
      keyCode === 39
    ) {
      return 'right';
    }

    return null;
  }, []);

  const handleDirectionalEvent = React.useCallback((event: any) => {
    const direction = resolveDirection(event);
    if (!direction || !focusedButton) return;

    const now = Date.now();
    const prev = lastDirectionalEventRef.current;
    if (prev && prev.direction === direction && now - prev.at < 120) {
      return;
    }
    lastDirectionalEventRef.current = { direction, at: now };

    if (focusedButton === 'watch' && direction === 'left') {
      onEdgeNavigate?.('left', itemIndex);
      return;
    }

    if (focusedButton === 'save' && direction === 'right') {
      onEdgeNavigate?.('right', itemIndex);
      return;
    }

    onDirectionalPress?.(direction, itemIndex);
  }, [focusedButton, itemIndex, onDirectionalPress, onEdgeNavigate, resolveDirection]);

  const handleDirectionalKeyDown = React.useCallback(
    (event: any) => {
      handleDirectionalEvent(event);
    },
    [handleDirectionalEvent],
  );

  React.useEffect(() => {
    if (!isTV || !focusedButton) return;
    let tvEventSubscription: any = null;

    try {
      const rnModule = require('react-native');
      const TVHandler = rnModule?.TVEventHandler;
      if (!TVHandler) return;
      const tvEventHandler = new TVHandler();
      tvEventSubscription = tvEventHandler;
      tvEventHandler.enable?.(undefined, (_: any, event: any) => {
        handleDirectionalEvent(event);
      });
    } catch {
      // no-op when TV event handler is unavailable
    }

    return () => {
      tvEventSubscription?.disable?.();
    };
  }, [focusedButton, handleDirectionalEvent, isTV]);

  const tvKeyDownProps = isTV
    ? ({
        onKeyDown: handleDirectionalKeyDown,
      } as any)
    : null;

  return (
    <ImageBackground
      source={{ uri: item.poster_url }}
      style={styles.banner}
    >
      <View style={styles.overlay} />

      <View style={styles.content}>
        <RatingBadge rating={movie.imdb_rating} style={styles.ratingBadge} />

        <Text style={styles.title}>{movie.title_uz}</Text>

        <View style={styles.meta}>
          <View style={styles.badge}>
            <Text style={styles.badgeText}>{movie.year}</Text>
          </View>
          <View style={styles.badge}>
            <Text style={styles.badgeText}>{movie.age_rating}+</Text>
          </View>
        </View>

        <View style={styles.actions}>
          <Pressable
            ref={watchRef}
            style={[
              styles.playBtn,
              focusedButton === 'watch' && styles.focusedButton,
            ]}
            focusable={isTV}
            hasTVPreferredFocus={isTV && preferredFocus}
            {...(isTV
              ? ({
                  nextFocusLeft: watchHandle,
                  nextFocusRight: detailsHandle,
                } as any)
              : null)}
            onFocus={() => {
              setFocusedButton('watch');
              onActionFocus?.(itemIndex, 'watch');
            }}
            onBlur={() => {
              setFocusedButton(null);
              onActionBlur?.(itemIndex, 'watch');
            }}
            {...tvKeyDownProps}
            onPress={() =>
              navigation.navigate('Player', {
                movieId: movie.id,
                posterUri: item.poster_url || movie.poster_url,
                title,
                subtitle: String(movie.year),
                isLive: false,
                durationSeconds: movie.duration_seconds,
              })
            }
          >
            <PlayIcon size={18} color="#000" />
            <Text style={styles.playText}>{t('home.carousel.watch')}</Text>
          </Pressable>

          <Pressable
            ref={detailsRef}
            style={[
              styles.moreBtn,
              focusedButton === 'details' && styles.focusedButton,
            ]}
            focusable={isTV}
            {...(isTV
              ? ({
                  nextFocusLeft: watchHandle,
                  nextFocusRight: saveHandle,
                } as any)
              : null)}
            onFocus={() => {
              setFocusedButton('details');
              onActionFocus?.(itemIndex, 'details');
            }}
            onBlur={() => {
              setFocusedButton(null);
              onActionBlur?.(itemIndex, 'details');
            }}
            {...tvKeyDownProps}
            onPress={() =>
              navigation.navigate('MovieDetail', {
                movieId: movie.id,
              })
            }
          >
            <Text style={styles.moreText}>{t('home.carousel.details')}</Text>
          </Pressable>

          <Pressable
            ref={saveRef}
            style={[
              styles.savedBtn,
              isFavorite && styles.savedBtnActive,
              focusedButton === 'save' && styles.focusedButton,
            ]}
            focusable={isTV}
            {...(isTV
              ? ({
                  nextFocusLeft: detailsHandle,
                  nextFocusRight: saveHandle,
                } as any)
              : null)}
            onFocus={() => {
              setFocusedButton('save');
              onActionFocus?.(itemIndex, 'save');
            }}
            onBlur={() => {
              setFocusedButton(null);
              onActionBlur?.(itemIndex, 'save');
            }}
            {...tvKeyDownProps}
            onPress={handleToggleFavorite}
            disabled={favoriteLoading}
          >
            <SavedIcon
              size={20}
              color="#fff"
              filled={isFavorite}
            />
          </Pressable>
        </View>
      </View>
    </ImageBackground>
  );
}

export const CarouselItem = React.memo(
  CarouselItemComponent,
  (prev, next) =>
    prev.item.id === next.item.id &&
    prev.preferredFocus === next.preferredFocus,
);

const styles = StyleSheet.create({
  banner: {
    width: '100%',
    height: 300,
    borderRadius: 16,
    overflow: 'hidden',
    justifyContent: 'flex-end',
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.45)',
  },
  content: {
    padding: 32,
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
  meta: {
    flexDirection: 'row',
    marginBottom: 16,
  },
  badge: {
    backgroundColor: 'rgba(255,255,255,0.15)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
    marginRight: 8,
  },
  badgeText: {
    color: '#fff',
    fontSize: 14,
  },
  actions: {
    flexDirection: 'row',
  },
  playBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
    marginRight: 12,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  playText: {
    color: '#000',
    fontWeight: '600',
    marginLeft: 8,
  },
  moreBtn: {
    backgroundColor: 'rgba(255,255,255,0.1)',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
    marginRight: 12,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  moreText: {
    color: '#fff',
  },
  savedBtn: {
    backgroundColor: 'rgba(255,255,255,0.1)',
    padding: 10,
    borderRadius: 8,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  savedBtnActive: {
    backgroundColor: 'rgba(255,255,255,0.22)',
  },
  focusedButton: {
    borderWidth: 2,
    borderColor: '#fff',
  },
});

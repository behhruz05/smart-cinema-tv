import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ImageBackground,
  Pressable,
} from 'react-native';
import { Carousel } from '../../../types/home';
import { PlayIcon } from '../../../shared/icons/PlayIcon';
import { SavedIcon } from '../../../shared/icons/SaverIcon';

interface Props {
  item: Carousel;
}

export function CarouselItem({ item }: Props) {
  const movie = item.movie;

  return (
    <ImageBackground
      source={{ uri: item.poster_url }}
      style={styles.banner}
    >
      <View style={styles.overlay} />

      <View style={styles.content}>
        <Text style={styles.rating}>⭐ {movie.imdb_rating}</Text>

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
          <Pressable style={styles.playBtn}>
            <PlayIcon size={18} color="#000" />
            <Text style={styles.playText}>Смотреть</Text>
          </Pressable>

          <Pressable style={styles.moreBtn}>
            <Text style={styles.moreText}>Подробнее</Text>
          </Pressable>

          <Pressable style={styles.savedBtn}>
            <SavedIcon size={20} color="#fff" />
          </Pressable>
        </View>
      </View>
    </ImageBackground>
  );
}

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
  rating: {
    color: '#facc15',
    fontSize: 14,
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
  },
  moreText: {
    color: '#fff',
  },
  savedBtn: {
    backgroundColor: 'rgba(255,255,255,0.1)',
    padding: 10,
    borderRadius: 8,
  },
});

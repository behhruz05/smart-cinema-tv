import React from 'react';
import {
  ImageBackground,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';

import { PlayIcon } from '../../../shared/icons/PlayIcon';
import { BackIcon } from '../../../shared/icons/BackIcon';
import { SavedIcon } from '../../../shared/icons/SaverIcon';
import { MovieDetailHeroProps } from '../types/movieDetail.types';

export function MovieDetailHero({
  movie,
  title,
  description,
  durationLabel,
  backLabel,
  watchLabel,
  onBack,
}: MovieDetailHeroProps) {
  const isTV = Platform.isTV;
  const [focusedControl, setFocusedControl] = React.useState<
    null | 'back' | 'watch' | 'save'
  >(null);

  return (
    <View style={styles.wrapper}>
      <ImageBackground
        source={{ uri: movie.poster_url }}
        style={styles.hero}
        resizeMode="cover"
      >
        <LinearGradient
          colors={[
            'rgba(0,0,0,0)',
            'rgba(0,0,0,0.4)',
            'rgba(16,16,16,0.9)',
            '#101010',
          ]}
          locations={[0, 0.5, 0.85, 1]}
          style={styles.gradient}
        />

        {/* Back */}
        <Pressable
          style={[
            styles.backBtn,
            focusedControl === 'back' && styles.focusedControl,
          ]}
          focusable={isTV}
          hasTVPreferredFocus={isTV}
          onFocus={() => setFocusedControl('back')}
          onBlur={() => setFocusedControl(null)}
          onPress={onBack}
        >
          <BackIcon size={16} color="#fff" />
          <Text style={styles.backText}>{backLabel}</Text>
        </Pressable>

        <View style={styles.heroContent}>
          <Text style={styles.rating}>{movie.imdb_rating}★</Text>

          <Text style={styles.title}>{title}</Text>

          <Text numberOfLines={3} style={styles.description}>
            {description}
          </Text>

          <View style={styles.metaRow}>
            <Text style={styles.metaText}>{movie.year}</Text>
            <Text style={styles.metaText}>{durationLabel}</Text>

            {movie.genres?.map((genre) => (
              <View key={genre.id} style={styles.genreChip}>
                <Text style={styles.genreText}>{genre.name}</Text>
              </View>
            ))}

            <Text style={styles.metaText}>{movie.age_rating}+</Text>
          </View>

          <View style={styles.actionRow}>
            <Pressable
              style={[
                styles.primaryBtn,
                focusedControl === 'watch' && styles.focusedControl,
              ]}
              focusable={isTV}
              onFocus={() => setFocusedControl('watch')}
              onBlur={() => setFocusedControl(null)}
            >
              <PlayIcon size={18} color="#000" />
              <Text style={styles.primaryBtnText}>{watchLabel}</Text>
            </Pressable>

            <Pressable
              style={[
                styles.secondaryBtn,
                focusedControl === 'save' && styles.focusedControl,
              ]}
              focusable={isTV}
              onFocus={() => setFocusedControl('save')}
              onBlur={() => setFocusedControl(null)}
            >
              <SavedIcon size={22} color="#fff" />
            </Pressable>
          </View>
        </View>
      </ImageBackground>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    backgroundColor: '#101010',
  },

  hero: {
    height: 420,
    justifyContent: 'flex-end',
  },

  gradient: {
    ...StyleSheet.absoluteFillObject,
  },

  backBtn: {
    position: 'absolute',
    top: 20,
    left: 20,
    backgroundColor: 'rgba(255,255,255,0.12)',
    paddingHorizontal: 18,
    paddingVertical: 10,
    borderRadius: 8,
    zIndex: 2,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    borderWidth: 2,
    borderColor: 'transparent',
  },

  backText: {
    color: '#fff',
    fontSize: 14,
  },

  heroContent: {
    paddingHorizontal: 20,
    paddingBottom: 30,
  },

  rating: {
    color: '#f4c64f',
    fontSize: 20,
    fontWeight: '700',
    marginBottom: 8,
  },

  title: {
    color: '#fff',
    fontSize: 36,
    fontWeight: '700',
    marginBottom: 8,
  },

  description: {
    color: '#d1d5db',
    fontSize: 14,
    lineHeight: 24,
    marginBottom: 10,
    maxWidth: 900,
  },

  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 10,
    flexWrap: 'wrap',
  },

  metaText: {
    color: '#d1d5db',
    fontSize: 12,
    backgroundColor: 'rgba(255,255,255,0.08)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },

  genreChip: {
    backgroundColor: 'rgba(255,255,255,0.12)',
    borderRadius: 16,
    paddingHorizontal: 12,
    paddingVertical: 4,
  },

  genreText: {
    color: '#fff',
    fontSize: 12,
  },

  actionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },

  primaryBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: '#fff',
    borderRadius: 12,
    paddingHorizontal: 26,
    paddingVertical: 10,
    borderWidth: 2,
    borderColor: 'transparent',
  },

  primaryBtnText: {
    color: '#000',
    fontSize: 14,
    fontWeight: '600',
  },

  secondaryBtn: {
    width: 56,
    height: 42,
    borderRadius: 12,
    backgroundColor: 'rgba(255,255,255,0.12)',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: 'transparent',
  },
  focusedControl: {
    borderWidth: 2,
    borderColor: '#ffffff',
  },
});

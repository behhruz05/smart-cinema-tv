import React from 'react';
import { Image, StyleSheet, Text, View } from 'react-native';
import { MovieDetail } from '../../../types/search';

interface MovieDetailFactsProps {
  movie: MovieDetail;
  description: string;
  descriptionTitle: string;
  countryTitle: string;
  subtitlesTitle: string;
  qualitiesTitle: string;
  castTitle: string;
  directorsTitle: string;
  audioTitle: string;
  noDataLabel: string;
}

function joinOrFallback(items: string[], fallback: string) {
  if (!items.length) return fallback;
  return items.join(', ');
}

export function MovieDetailFacts({
  movie,
  description,
  descriptionTitle,
  countryTitle,
  subtitlesTitle,
  qualitiesTitle,
  castTitle,
  directorsTitle,
  audioTitle,
  noDataLabel,
}: MovieDetailFactsProps) {
  const subtitles = movie.subtitles.map(
    subtitle => subtitle.language.toUpperCase(),
  );
  const qualities = movie.files.map(file => file.quality);
  const cast = movie.cast
    .map(member => {
      if (typeof member === 'string') return member;
      if (member && typeof member === 'object' && 'name' in member) {
        return String(
          (member as { name: unknown }).name,
        );
      }
      return '';
    })
    .filter(Boolean);

  const country = movie.country?.name || noDataLabel;

  return (
    <View style={styles.wrapper}>
      <View style={styles.headerRow}>
        <Image
          source={{ uri: movie.poster_url }}
          style={styles.poster}
          resizeMode="cover"
        />
        <View style={styles.headerContent}>
          <Text style={styles.descriptionTitle}>{descriptionTitle}</Text>
          <Text style={styles.description}>
            {description}
          </Text>
        </View>
      </View>

      {/* <View style={styles.grid}>
        <View style={styles.gridCol}>
          <Text style={styles.colTitle}>{castTitle}</Text>
          <Text style={styles.colValue}>
            {joinOrFallback(cast, noDataLabel)}
          </Text>
        </View>
        <View style={styles.gridCol}>
          <Text style={styles.colTitle}>{directorsTitle}</Text>
          <Text style={styles.colValue}>{noDataLabel}</Text>
        </View>
        <View style={styles.gridCol}>
          <Text style={styles.colTitle}>{audioTitle}</Text>
          <Text style={styles.colValue}>{noDataLabel}</Text>
        </View>
        <View style={styles.gridCol}>
          <Text style={styles.colTitle}>{subtitlesTitle}</Text>
          <Text style={styles.colValue}>
            {joinOrFallback(subtitles, noDataLabel)}
          </Text>
        </View>
        <View style={styles.gridCol}>
          <Text style={styles.colTitle}>{countryTitle}</Text>
          <Text style={styles.colValue}>{country}</Text>
        </View>
        <View style={styles.gridCol}>
          <Text style={styles.colTitle}>{qualitiesTitle}</Text>
          <Text style={styles.colValue}>
            {joinOrFallback(qualities, noDataLabel)}
          </Text>
        </View>
      </View> */}
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    marginTop: -6,
    paddingHorizontal: 20,
    paddingBottom: 16,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 16,
    marginBottom: 18,
  },
  headerContent: {
    flex: 1,
  },
  poster: {
    width: 132,
    height: 188,
    borderRadius: 12,
    backgroundColor: '#1b1b1b',
  },
  descriptionTitle: {
    color: '#ffffff',
    fontSize: 20,
    fontWeight: '600',
    marginBottom: 10,
  },
  description: {
    color: '#d1d5db',
    fontSize: 15,
    lineHeight: 23,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 14,
  },
  gridCol: {
    width: '31%',
    minWidth: 220,
    backgroundColor: '#121212',
    borderRadius: 12,
    padding: 12,
    borderWidth: 1,
    borderColor: '#232323',
  },
  colTitle: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 6,
  },
  colValue: {
    color: '#b4b4b4',
    fontSize: 14,
    lineHeight: 20,
  },
});

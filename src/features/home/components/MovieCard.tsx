import React from 'react';
import { Image, StyleSheet, View, Text } from 'react-native';

export const MovieCard = ({ item }: any) => (
  <View style={styles.card}>
    <Image source={{ uri: item.poster_url }} style={styles.image} />

    {item?.imdb_rating && (
      <View style={styles.ratingBadge}>
        <Text style={styles.ratingText}>
          {item.imdb_rating}
        </Text>
      </View>
    )}
  </View>
);

const styles = StyleSheet.create({
  card: {
    marginRight: 12,
    position: 'relative',
  },
  image: {
    width: 200,
    height: 130,
    borderRadius: 12,
  },
  ratingBadge: {
    position: 'absolute',
    top: 8,
    left: 8,
    backgroundColor: 'rgba(0,0,0,0.7)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  ratingText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '600',
  },
});
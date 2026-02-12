import React from 'react';
import { Image, StyleSheet } from 'react-native';

export const ReelCard = ({ item }: any) => (
  <Image source={{ uri: item.poster_url }} style={styles.image} />
);

const styles = StyleSheet.create({
  image: {
    width: 120,
    height: 160,
    borderRadius: 12,
    marginRight: 10,
  },
});

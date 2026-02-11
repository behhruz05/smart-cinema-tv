import React from 'react';
import { View, StyleSheet } from 'react-native';
import { HomeCarousel } from '../components/HomeCarousel';

export function HomeScreen() {
  return (
    <View style={styles.container}>
      <HomeCarousel />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#101010',
  },
});

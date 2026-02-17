import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

export default function PlaybackScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Воспроизведение</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#101010',
  },
  title: {
    color: '#fff',
    fontSize: 24,
  },
});

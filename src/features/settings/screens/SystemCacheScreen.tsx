import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

export default function SystemCacheScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Система и кэш</Text>
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

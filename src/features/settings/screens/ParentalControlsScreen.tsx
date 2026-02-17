import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

export default function ParentalControlScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Родительский контроль</Text>
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

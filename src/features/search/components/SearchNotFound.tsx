import React from 'react';
import { View, Text, StyleSheet, Image } from 'react-native';
import { SearchFoundIcon } from '../../../shared/icons/SearchFoundIcon';

export function SearchNotFound() {
  return (
    <View style={styles.container}>
      <SearchFoundIcon size={50} color="#838383" />

      <Text style={styles.title}>Ничего не найдено</Text>
      <Text style={styles.subtitle}>
        Попробуйте изменить запрос или проверить написание
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '600',
    marginTop: 15,
  },
  subtitle: {
    color: '#838383',
    fontSize: 14,
    marginTop: 8,
    textAlign: 'center',
  },
});

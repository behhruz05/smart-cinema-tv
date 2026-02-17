import React from 'react';
import { View, Text, StyleSheet, Image } from 'react-native';
import { useTranslation } from 'react-i18next';
import { SearchFoundIcon } from '../../../shared/icons/SearchFoundIcon';

export function SearchNotFound() {
  const { t } = useTranslation();
  return (
    <View style={styles.container}>
      <SearchFoundIcon size={50} color="#838383" />

      <Text style={styles.title}>{t('search.not_found_title')}</Text>
      <Text style={styles.subtitle}>
        {t('search.not_found_subtitle')}
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

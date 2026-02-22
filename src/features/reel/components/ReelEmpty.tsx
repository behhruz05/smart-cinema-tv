import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { useTranslation } from 'react-i18next';
import { ReelIcon } from '../../../shared/icons/ReelIcon';

export function ReelEmpty() {
  const { t } = useTranslation();

  return (
    <View style={styles.container}>
      <ReelIcon size={34} color="#838383" />
      <Text style={styles.title}>{t('reel.empty_title')}</Text>
      <Text style={styles.subtitle}>{t('reel.empty_subtitle')}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    width: '100%',
    height: '100%',
    backgroundColor: '#101010',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 100,
  },
  title: {
    color: '#fff',
    fontSize: 22,
    marginBottom: 8,
    textAlign: 'center',
    marginTop: 20,
  },
  subtitle: {
    color: '#838383',
    fontSize: 14,
    textAlign: 'center',
  },
});

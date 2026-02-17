import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../../../app/providers/AppProviders';

const APP_VERSION = '0.0.1';

export default function SupportScreen() {
  const { t } = useTranslation();
  const { resolvedTheme } = useAuth();
  const isDarkMode = resolvedTheme === 'dark';

  return (
    <View style={[styles.container, isDarkMode && styles.containerDark]}>
      <Text style={[styles.title, isDarkMode && styles.titleDark]}>{t('settings.support')}</Text>
      <Text style={[styles.subtitle, isDarkMode && styles.subtitleDark]}>{t('settings.support_desc')}</Text>

      <View style={[styles.card, isDarkMode && styles.cardDark]}>
        <Text style={[styles.label, isDarkMode && styles.labelDark]}>{t('settings.support_email')}</Text>
        <Text style={[styles.value, isDarkMode && styles.valueDark]}>support@alloplay.uz</Text>
      </View>

      <View style={[styles.card, isDarkMode && styles.cardDark]}>
        <Text style={[styles.label, isDarkMode && styles.labelDark]}>{t('settings.support_phone')}</Text>
        <Text style={[styles.value, isDarkMode && styles.valueDark]}>+998 71 200 00 00</Text>
      </View>

      <View style={[styles.card, isDarkMode && styles.cardDark]}>
        <Text style={[styles.label, isDarkMode && styles.labelDark]}>{t('settings.app_version')}</Text>
        <Text style={[styles.value, isDarkMode && styles.valueDark]}>{APP_VERSION}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#101010',
  },
  containerDark: {
    backgroundColor: '#111111',
  },
  title: {
    color: '#fff',
    fontSize: 24,
    marginBottom: 8,
  },
  titleDark: {
    color: '#ffffff',
  },
  subtitle: {
    color: '#a3a3a3',
    marginBottom: 20,
  },
  subtitleDark: {
    color: '#a1a1a1',
  },
  card: {
    backgroundColor: '#1a1a1a',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
  },
  cardDark: {
    backgroundColor: '#181818',
  },
  label: {
    color: '#a3a3a3',
    marginBottom: 6,
  },
  labelDark: {
    color: '#9a9a9a',
  },
  value: {
    color: '#fff',
    fontSize: 16,
  },
  valueDark: {
    color: '#ffffff',
  },
});

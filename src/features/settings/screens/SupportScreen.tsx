import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../../../app/providers/AppProviders';

const APP_VERSION = '0.0.1';

export default function SupportScreen() {
  const { t } = useTranslation();
  const { resolvedTheme } = useAuth();
  const isLight = resolvedTheme === 'light';

  return (
    <View style={[styles.container, isLight && styles.containerLight]}>
      <Text style={[styles.title, isLight && styles.titleLight]}>{t('settings.support')}</Text>
      <Text style={[styles.subtitle, isLight && styles.subtitleLight]}>{t('settings.support_desc')}</Text>

      <View style={[styles.card, isLight && styles.cardLight]}>
        <Text style={[styles.label, isLight && styles.labelLight]}>{t('settings.support_email')}</Text>
        <Text style={[styles.value, isLight && styles.valueLight]}>support@alloplay.uz</Text>
      </View>

      <View style={[styles.card, isLight && styles.cardLight]}>
        <Text style={[styles.label, isLight && styles.labelLight]}>{t('settings.support_phone')}</Text>
        <Text style={[styles.value, isLight && styles.valueLight]}>+998 71 200 00 00</Text>
      </View>

      <View style={[styles.card, isLight && styles.cardLight]}>
        <Text style={[styles.label, isLight && styles.labelLight]}>{t('settings.app_version')}</Text>
        <Text style={[styles.value, isLight && styles.valueLight]}>{APP_VERSION}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#101010',
  },
  containerLight: {
    backgroundColor: '#f4f4f5',
  },
  title: {
    color: '#fff',
    fontSize: 24,
    marginBottom: 8,
  },
  titleLight: {
    color: '#111827',
  },
  subtitle: {
    color: '#a3a3a3',
    marginBottom: 20,
  },
  subtitleLight: {
    color: '#4b5563',
  },
  card: {
    backgroundColor: '#1a1a1a',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
  },
  cardLight: {
    backgroundColor: '#ffffff',
  },
  label: {
    color: '#a3a3a3',
    marginBottom: 6,
  },
  labelLight: {
    color: '#6b7280',
  },
  value: {
    color: '#fff',
    fontSize: 16,
  },
  valueLight: {
    color: '#111827',
  },
});

import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  Platform,
  Alert,
} from 'react-native';
import { useTranslation } from 'react-i18next';
import { appSettingsStorage } from '../../../shared/lib/appSettingsStorage';
import { useAuth } from '../../../app/providers/AppProviders';

export default function SystemCacheScreen() {
  const { t } = useTranslation();
  const { resolvedTheme } = useAuth();
  const isTV = Platform.isTV;
  const isLight = resolvedTheme === 'light';

  const [clearOnExit, setClearOnExit] = useState(false);
  const [focused, setFocused] = useState<string | null>(null);

  useEffect(() => {
    const load = async () => {
      const value = await appSettingsStorage.getBoolean('clearCacheOnExit', false);
      setClearOnExit(value);
    };

    load();
  }, []);

  const onClearCache = async () => {
    await appSettingsStorage.clearCacheSettings();
    setClearOnExit(false);
    Alert.alert(t('settings.system_cache'), t('settings.cache_cleared'));
  };

  const onToggleClearOnExit = async () => {
    const next = !clearOnExit;
    setClearOnExit(next);
    await appSettingsStorage.setBoolean('clearCacheOnExit', next);
  };

  return (
    <View style={[styles.container, isLight && styles.containerLight]}>
      <Text style={[styles.title, isLight && styles.titleLight]}>{t('settings.system_cache')}</Text>
      <Text style={[styles.subtitle, isLight && styles.subtitleLight]}>{t('settings.cache_desc')}</Text>

      <Pressable
        focusable={isTV}
        hasTVPreferredFocus
        onFocus={() => setFocused('clear')}
        onBlur={() => setFocused(null)}
        onPress={onClearCache}
        style={[
          styles.clearButton,
          isLight && styles.clearButtonLight,
          focused === 'clear' && styles.focused,
          isLight && focused === 'clear' && styles.focusedLight,
        ]}
      >
        <Text style={[styles.clearButtonText, isLight && styles.clearButtonTextLight]}>
          {t('settings.clear_cache')}
        </Text>
      </Pressable>

      <Pressable
        focusable={isTV}
        onFocus={() => setFocused('exit')}
        onBlur={() => setFocused(null)}
        onPress={onToggleClearOnExit}
        style={[
          styles.row,
          isLight && styles.rowLight,
          focused === 'exit' && styles.focused,
          isLight && focused === 'exit' && styles.focusedLight,
        ]}
      >
        <Text style={[styles.label, isLight && styles.labelLight]}>{t('settings.clear_on_exit')}</Text>
        <Text style={[styles.value, isLight && styles.valueLight]}>{clearOnExit ? 'ON' : 'OFF'}</Text>
      </Pressable>
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
  clearButton: {
    alignSelf: 'flex-start',
    backgroundColor: '#fff',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: 'transparent',
    marginBottom: 16,
  },
  clearButtonText: {
    color: '#000',
    fontWeight: '600',
  },
  clearButtonLight: {
    backgroundColor: '#2563eb',
  },
  clearButtonTextLight: {
    color: '#fff',
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#1a1a1a',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  rowLight: {
    backgroundColor: '#ffffff',
  },
  focused: {
    borderColor: '#fff',
  },
  focusedLight: {
    borderColor: '#2563eb',
  },
  label: {
    color: '#fff',
    fontSize: 16,
    flex: 1,
    paddingRight: 12,
  },
  labelLight: {
    color: '#111827',
  },
  value: {
    color: '#fff',
    fontWeight: '700',
  },
  valueLight: {
    color: '#111827',
  },
});

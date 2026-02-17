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
  const isDarkMode = resolvedTheme === 'dark';

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
    <View style={[styles.container, isDarkMode && styles.containerDark]}>
      <Text style={[styles.title, isDarkMode && styles.titleDark]}>{t('settings.system_cache')}</Text>
      <Text style={[styles.subtitle, isDarkMode && styles.subtitleDark]}>{t('settings.cache_desc')}</Text>

      <Pressable
        focusable={isTV}
        hasTVPreferredFocus
        onFocus={() => setFocused('clear')}
        onBlur={() => setFocused(null)}
        onPress={onClearCache}
        style={[
          styles.clearButton,
          isDarkMode && styles.clearButtonDark,
          focused === 'clear' && styles.focused,
          isDarkMode && focused === 'clear' && styles.focusedDark,
        ]}
      >
        <Text style={[styles.clearButtonText, isDarkMode && styles.clearButtonTextDark]}>
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
          isDarkMode && styles.rowDark,
          focused === 'exit' && styles.focused,
          isDarkMode && focused === 'exit' && styles.focusedDark,
        ]}
      >
        <Text style={[styles.label, isDarkMode && styles.labelDark]}>{t('settings.clear_on_exit')}</Text>
        <Text style={[styles.value, isDarkMode && styles.valueDark]}>{clearOnExit ? 'ON' : 'OFF'}</Text>
      </Pressable>
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
  clearButtonDark: {
    backgroundColor: '#2c2c2c',
  },
  clearButtonTextDark: {
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
  rowDark: {
    backgroundColor: '#181818',
  },
  focused: {
    borderColor: '#fff',
  },
  focusedDark: {
    borderColor: '#ffffff',
  },
  label: {
    color: '#fff',
    fontSize: 16,
    flex: 1,
    paddingRight: 12,
  },
  labelDark: {
    color: '#ffffff',
  },
  value: {
    color: '#fff',
    fontWeight: '700',
  },
  valueDark: {
    color: '#ffffff',
  },
});

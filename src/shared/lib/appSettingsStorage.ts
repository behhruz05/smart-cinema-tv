import AsyncStorage from '@react-native-async-storage/async-storage';

const KEYS = {
  autoplayNext: 'settings_autoplay_next',
  highQuality: 'settings_high_quality',
  parentalEnabled: 'settings_parental_enabled',
  parentalPin: 'settings_parental_pin',
  clearCacheOnExit: 'settings_clear_cache_on_exit',
  themeMode: 'settings_theme_mode',
  videoQuality: 'settings_video_quality',
} as const;

export type SettingsKey = keyof typeof KEYS;

async function getBoolean(key: SettingsKey, fallback = false) {
  const value = await AsyncStorage.getItem(KEYS[key]);
  if (value == null) return fallback;
  return value === 'true';
}

async function setBoolean(key: SettingsKey, value: boolean) {
  await AsyncStorage.setItem(KEYS[key], String(value));
}

async function getString(key: SettingsKey, fallback = '') {
  const value = await AsyncStorage.getItem(KEYS[key]);
  return value ?? fallback;
}

async function setString(key: SettingsKey, value: string) {
  await AsyncStorage.setItem(KEYS[key], value);
}

async function clearCacheSettings() {
  await AsyncStorage.multiRemove([
    KEYS.autoplayNext,
    KEYS.highQuality,
    KEYS.parentalEnabled,
    KEYS.parentalPin,
    KEYS.clearCacheOnExit,
  ]);
}

type ThemeMode = 'dark' | 'system';

async function getThemeMode(fallback: ThemeMode = 'system'): Promise<ThemeMode> {
  const value = await AsyncStorage.getItem(KEYS.themeMode);
  if (value === 'dark' || value === 'system') return value;
  return fallback;
}

async function setThemeMode(value: ThemeMode) {
  await AsyncStorage.setItem(KEYS.themeMode, value);
}

export const appSettingsStorage = {
  getBoolean,
  setBoolean,
  getString,
  setString,
  clearCacheSettings,
  getThemeMode,
  setThemeMode,
};

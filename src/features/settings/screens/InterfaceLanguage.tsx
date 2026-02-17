import React from 'react';
import {
  ScrollView,
  View,
  Text,
  StyleSheet,
  Pressable,
  Platform,
} from 'react-native';
import { useTranslation } from 'react-i18next';
import { changeAppLanguage } from '../../../i18n';
import { useAuth } from '../../../app/providers/AppProviders';

export default function InterfaceLanguageScreen() {
  const { t, i18n } = useTranslation();
  const { themeMode, setThemeMode, resolvedTheme } = useAuth();
  const isTV = Platform.isTV;
  const [focusedLang, setFocusedLang] = React.useState<string | null>(null);
  const [focusedTheme, setFocusedTheme] = React.useState<string | null>(null);
  const isLight = resolvedTheme === 'light';

  const languages: Array<'uz' | 'ru' | 'en'> = ['uz', 'ru', 'en'];

  const onChangeLanguage = async (lang: 'uz' | 'ru' | 'en') => {
    if (i18n.language.startsWith(lang)) return;
    await changeAppLanguage(lang);
  };

  const themeOptions: Array<'dark' | 'system'> = ['dark', 'system'];

  return (
    <ScrollView
      style={[
        styles.container,
        isLight && styles.containerLight,
      ]}
      contentContainerStyle={styles.content}
      showsVerticalScrollIndicator={false}
    >
      <Text style={[styles.title, isLight && styles.titleLight]}>
        {t('settings.language.select')}
      </Text>

      <View style={styles.list}>
        {languages.map((lang, index) => {
          const active = i18n.language.startsWith(lang);
          return (
            <Pressable
              key={lang}
              focusable={isTV}
              hasTVPreferredFocus={index === 0}
              onFocus={() => setFocusedLang(lang)}
              onBlur={() => setFocusedLang(null)}
              onPress={() => onChangeLanguage(lang)}
              style={[
                styles.item,
                isLight && styles.itemLight,
                focusedLang === lang && styles.focusedItem,
                isLight && focusedLang === lang && styles.focusedItemLight,
              ]}
            >
              <View
                style={[
                  styles.checkbox,
                  isLight && styles.checkboxLight,
                  active && styles.checkboxActive,
                ]}
              >
                {active && <View style={styles.checkboxDot} />}
              </View>
              <Text style={[styles.itemText, isLight && styles.itemTextLight]}>
                {t(`settings.language.${lang}`)}
              </Text>
            </Pressable>
          );
        })}
      </View>

      <Text style={[styles.title, styles.themeTitle, isLight && styles.titleLight]}>
        {t('settings.theme.select')}
      </Text>

      <View style={styles.list}>
        {themeOptions.map((mode) => {
          const active = themeMode === mode;
          return (
            <Pressable
              key={mode}
              focusable={isTV}
              onFocus={() => setFocusedTheme(mode)}
              onBlur={() => setFocusedTheme(null)}
              onPress={() => setThemeMode(mode)}
              style={[
                styles.item,
                isLight && styles.itemLight,
                focusedTheme === mode && styles.focusedItem,
                isLight && focusedTheme === mode && styles.focusedItemLight,
              ]}
            >
              <View
                style={[
                  styles.checkbox,
                  isLight && styles.checkboxLight,
                  active && styles.checkboxActive,
                ]}
              >
                {active && <View style={styles.checkboxDot} />}
              </View>
              <Text style={[styles.itemText, isLight && styles.itemTextLight]}>
                {t(`settings.theme.${mode}`)}
              </Text>
            </Pressable>
          );
        })}
      </View>
    </ScrollView>
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
  content: {
    paddingBottom: 28,
  },
  title: {
    color: '#fff',
    fontSize: 24,
    marginBottom: 10,
  },
  titleLight: {
    color: '#111827',
  },
  subtitle: {
    color: '#a3a3a3',
    fontSize: 14,
    marginBottom: 20,
  },
  subtitleLight: {
    color: '#4b5563',
  },
  list: {
    gap: 12,
  },
  themeTitle: {
    marginTop: 24,
  },
  item: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    borderRadius: 10,
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  itemLight: {
    backgroundColor: '#ffffff',
  },
  focusedItem: {
    borderColor: '#fff',
  },
  focusedItemLight: {
    borderColor: '#fff',
  },
  checkbox: {
    width: 20,
    height: 20,
    borderRadius: '50%',
    borderWidth: 2,
    borderColor: '#8b8b8b',
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkboxLight: {
    borderColor: '#6b7280',
  },
  checkboxActive: {
    borderColor: '#fff',
  },
  checkboxDot: {
    width: 10,
    height: 10,
    borderRadius: "50%",
    backgroundColor: '#fff',
  },
  itemText: {
    color: '#fff',
    fontSize: 16,
  },
  itemTextLight: {
    color: '#111827',
  },
});

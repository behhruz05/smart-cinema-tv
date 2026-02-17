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
  const isDarkMode = resolvedTheme === 'dark';

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
        isDarkMode && styles.containerDark,
      ]}
      contentContainerStyle={styles.content}
      showsVerticalScrollIndicator={false}
    >
      <Text style={[styles.title, isDarkMode && styles.titleDark]}>
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
                isDarkMode && styles.itemDark,
                focusedLang === lang && styles.focusedItem,
                isDarkMode && focusedLang === lang && styles.focusedItemDark,
              ]}
            >
              <View
                style={[
                  styles.checkbox,
                  isDarkMode && styles.checkboxDark,
                  active && styles.checkboxActive,
                ]}
              >
                {active && <View style={styles.checkboxDot} />}
              </View>
              <Text style={[styles.itemText, isDarkMode && styles.itemTextDark]}>
                {t(`settings.language.${lang}`)}
              </Text>
            </Pressable>
          );
        })}
      </View>

      <Text style={[styles.title, styles.themeTitle, isDarkMode && styles.titleDark]}>
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
                isDarkMode && styles.itemDark,
                focusedTheme === mode && styles.focusedItem,
                isDarkMode && focusedTheme === mode && styles.focusedItemDark,
              ]}
            >
              <View
                style={[
                  styles.checkbox,
                  isDarkMode && styles.checkboxDark,
                  active && styles.checkboxActive,
                ]}
              >
                {active && <View style={styles.checkboxDot} />}
              </View>
              <Text style={[styles.itemText, isDarkMode && styles.itemTextDark]}>
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
  containerDark: {
    backgroundColor: '#111111',
  },
  content: {
    paddingBottom: 28,
  },
  title: {
    color: '#fff',
    fontSize: 24,
    marginBottom: 10,
  },
  titleDark: {
    color: '#ffffff',
  },
  subtitle: {
    color: '#a3a3a3',
    fontSize: 14,
    marginBottom: 20,
  },
  subtitleDark: {
    color: '#a1a1a1',
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
    backgroundColor: '#1a1a1a',
    borderRadius: 10,
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  itemDark: {
    backgroundColor: '#181818',
  },
  focusedItem: {
    borderColor: '#fff',
  },
  focusedItemDark: {
    borderColor: '#ffffff',
  },
  checkbox: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: '#8b8b8b',
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkboxDark: {
    borderColor: '#9a9a9a',
  },
  checkboxActive: {
    borderColor: '#fff',
  },
  checkboxDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#fff',
  },
  itemText: {
    color: '#fff',
    fontSize: 16,
  },
  itemTextDark: {
    color: '#ffffff',
  },
});

import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  Platform,
} from 'react-native';
import { useTranslation } from 'react-i18next';
import { changeAppLanguage } from '../../../i18n';

export default function InterfaceLanguageScreen() {
  const { t, i18n } = useTranslation();
  const isTV = Platform.isTV;
  const [focusedLang, setFocusedLang] = React.useState<string | null>(null);

  const languages: Array<'uz' | 'ru' | 'en'> = ['uz', 'ru', 'en'];

  const onChangeLanguage = async (lang: 'uz' | 'ru' | 'en') => {
    if (lang === i18n.language) return;
    await changeAppLanguage(lang);
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>{t('settings.language.title')}</Text>
      <Text style={styles.subtitle}>{t('settings.language.select')}</Text>

      <View style={styles.list}>
        {languages.map((lang, index) => {
          const active = i18n.language === lang;
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
                active && styles.activeItem,
                focusedLang === lang && styles.focusedItem,
              ]}
            >
              <Text
                style={[
                  styles.itemText,
                  active && styles.activeText,
                ]}
              >
                {t(`settings.language.${lang}`)}
              </Text>
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#101010',
  },
  title: {
    color: '#fff',
    fontSize: 24,
    marginBottom: 10,
  },
  subtitle: {
    color: '#a3a3a3',
    fontSize: 14,
    marginBottom: 20,
  },
  list: {
    gap: 12,
  },
  item: {
    backgroundColor: '#1A1A1A',
    borderRadius: 10,
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  focusedItem: {
    borderColor: '#fff',
  },
  activeItem: {
    backgroundColor: '#fff',
  },
  itemText: {
    color: '#fff',
    fontSize: 16,
  },
  activeText: {
    color: '#000',
  },
});

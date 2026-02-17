import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import AsyncStorage from '@react-native-async-storage/async-storage';

import uz from './locales/uz.json';
import ru from './locales/ru.json';
import en from './locales/en.json';

const LANGUAGE_KEY = 'app_language';

const resources = {
  uz: { translation: uz },
  ru: { translation: ru },
  en: { translation: en },
};

async function initI18n() {
  let savedLanguage = 'uz'; 

  try {
    const storedLang = await AsyncStorage.getItem(LANGUAGE_KEY);
    if (storedLang) {
      savedLanguage = storedLang;
    }
  } catch (e) {
    console.log('Language load error', e);
  }

  await i18n
    .use(initReactI18next)
    .init({
      compatibilityJSON: 'v4',
      resources,
      lng: savedLanguage,
      fallbackLng: 'uz',
      interpolation: {
        escapeValue: false,
      },
    });
}

export async function changeAppLanguage(lang: 'uz' | 'ru' | 'en') {
  await i18n.changeLanguage(lang);
  await AsyncStorage.setItem(LANGUAGE_KEY, lang);
}

export { initI18n };
export default i18n;

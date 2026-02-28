import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

import uz from './locales/uz.json';
import ru from './locales/ru.json';
import en from './locales/en.json';

const resources = {
  uz: { translation: uz },
  ru: { translation: ru },
  en: { translation: en },
};

export type AppLanguage = 'uz' | 'ru' | 'en';

export function normalizeAppLanguage(lng?: string | null): AppLanguage {
  if (lng?.startsWith('ru')) return 'ru';
  if (lng?.startsWith('en')) return 'en';
  return 'uz';
}

export function getAppLanguage(
  lng: string | undefined = i18n.resolvedLanguage || i18n.language,
): AppLanguage {
  return normalizeAppLanguage(lng);
}

async function initI18n() {
  await i18n
    .use(initReactI18next)
    .init({
      compatibilityJSON: 'v4',
      resources,
      lng: 'uz',
      fallbackLng: 'uz',
      interpolation: {
        escapeValue: false,
      },
    });
}

export async function changeAppLanguage(lang: 'uz' | 'ru' | 'en') {
  await i18n.changeLanguage(normalizeAppLanguage(lang));
}

export { initI18n };
export default i18n;

import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';
import en from '../locales/en/translation.json';
import fr from '../locales/fr/translation.json';
import es from '../locales/es/translation.json';

export const SUPPORTED_LANGS = ['en', 'fr', 'es'] as const;
export type AppLanguage = (typeof SUPPORTED_LANGS)[number];

export function normalizeLang(lng: string): AppLanguage {
  const base = lng.split('-')[0]?.toLowerCase() ?? 'en';
  return (SUPPORTED_LANGS as readonly string[]).includes(base) ? (base as AppLanguage) : 'en';
}

function setDocumentLang(lng: string) {
  document.documentElement.lang = normalizeLang(lng);
}

void i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources: {
      en: { translation: en },
      fr: { translation: fr },
      es: { translation: es },
    },
    fallbackLng: 'en',
    supportedLngs: [...SUPPORTED_LANGS],
    interpolation: { escapeValue: false },
    react: {
      transSupportBasicHtmlNodes: true,
      transKeepBasicHtmlNodesFor: ['br', 'strong'],
    },
    detection: {
      order: ['localStorage', 'navigator'],
      caches: ['localStorage'],
      lookupLocalStorage: 'i18nextLng',
    },
  })
  .then(() => {
    setDocumentLang(i18n.resolvedLanguage || 'en');
  });

i18n.on('languageChanged', (lng) => {
  setDocumentLang(lng);
});

export default i18n;

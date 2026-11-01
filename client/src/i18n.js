import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import en from './locales/en/translation.json';

// Clear any previously persisted non-English language setting
if (typeof window !== 'undefined' && localStorage.getItem('lang')) {
  localStorage.removeItem('lang');
}

i18n.use(initReactI18next).init({
  resources: {
    en: { translation: en },
  },
  lng: 'en',
  fallbackLng: 'en',
  interpolation: { escapeValue: false },
});

export default i18n;

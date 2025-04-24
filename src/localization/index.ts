import AsyncStorage from '@react-native-async-storage/async-storage';
import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import { findBestLanguageTag } from 'react-native-localize';
import { defaultLanguage, LocalStorageKeys } from '../constants';
import de from './de';
import en from './en';
import fr from './fr';

export type Translation = typeof en;

const resources = {
  en: {
    translation: en,
  },
  fr: {
    translation: fr,
  },
  de: {
    translation: de,
  },
};

export enum Locales {
  en = 'en',
  fr = 'fr',
  de = 'de',
}

const currentLanguage = i18n.language;

// Store language into the AsyncStorage
const storeLanguage = async (language: string) => {
  await AsyncStorage.setItem(LocalStorageKeys.Language, language);
};

// Fetch user preference language from the AsyncStorage and set if require
const initStoredLanguage = async () => {
  const langId = await AsyncStorage.getItem(LocalStorageKeys.Language);
  if (langId !== null) {
    if (langId !== currentLanguage) {
      await i18n.changeLanguage(langId);
    }
  }
};

const availableLanguages = Object.keys(resources);
const bestLanguageMatch = findBestLanguageTag(availableLanguages);
let translationToUse = defaultLanguage;

if (
  bestLanguageMatch &&
  availableLanguages.includes(bestLanguageMatch.languageTag)
) {
  translationToUse = bestLanguageMatch.languageTag;
}
i18n.use(initReactI18next).init({
  debug: true,
  lng: 'en', // TODO force to use german language. Or use translationToUse var
  fallbackLng: defaultLanguage,
  resources,
});

export { currentLanguage, i18n, initStoredLanguage, storeLanguage };

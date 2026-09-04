import { useState, useEffect, useCallback } from 'react';
import { SupportedLang, SUPPORTED_LANGUAGES, translations } from '../lib/translations';
import { updateFarmerProfile } from '../lib/api';

export type { SupportedLang };

const LANG_KEY = 'agriq_farmer_lang';

function getInitialLang(): SupportedLang {
  const saved = localStorage.getItem(LANG_KEY);
  if (saved && ['en', 'kn', 'hi', 'mr', 'te', 'pa'].includes(saved)) {
    return saved as SupportedLang;
  }
  return 'en';
}

let globalLang: SupportedLang = getInitialLang();
const subscribers = new Set<(lang: SupportedLang) => void>();

function notifySubscribers(lang: SupportedLang) {
  globalLang = lang;
  localStorage.setItem(LANG_KEY, lang);
  document.documentElement.lang = lang;
  subscribers.forEach(cb => cb(lang));
}

export function setGlobalLanguage(lang: SupportedLang, syncWithDb: boolean = true) {
  notifySubscribers(lang);
  if (syncWithDb) {
    updateFarmerProfile({ preferred_lang: lang }).catch(console.error);
  }
}

export function useTranslation() {
  const [currentLang, setCurrentLang] = useState<SupportedLang>(globalLang);

  useEffect(() => {
    const handleLangChange = (newLang: SupportedLang) => {
      setCurrentLang(newLang);
    };
    subscribers.add(handleLangChange);
    return () => {
      subscribers.delete(handleLangChange);
    };
  }, []);

  const setLanguage = useCallback((lang: SupportedLang, syncWithDb: boolean = true) => {
    setGlobalLanguage(lang, syncWithDb);
  }, []);

  const t = useCallback((key: string, fallback?: string): string => {
    const langDict = translations[currentLang] || translations.en;
    if (langDict && langDict[key]) return langDict[key];
    if (translations.en && translations.en[key]) return translations.en[key];
    return fallback || key;
  }, [currentLang]);

  useEffect(() => {
    document.documentElement.lang = currentLang;
  }, [currentLang]);

  return {
    lang: currentLang,
    language: currentLang,
    setLanguage,
    t,
    languages: SUPPORTED_LANGUAGES,
  };
}

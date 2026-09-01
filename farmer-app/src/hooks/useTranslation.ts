import { useState, useEffect, useCallback } from 'react';
import { SupportedLang, SUPPORTED_LANGUAGES, translations } from '../lib/translations';
import { updateFarmerProfile } from '../lib/api';

const LANG_KEY = 'agriq_farmer_lang';

export function useTranslation() {
  const [currentLang, setCurrentLangState] = useState<SupportedLang>(() => {
    const saved = localStorage.getItem(LANG_KEY);
    if (saved && ['en', 'hi', 'mr', 'kn', 'te', 'pa'].includes(saved)) {
      return saved as SupportedLang;
    }
    return 'en';
  });

  const setLanguage = useCallback((lang: SupportedLang, syncWithDb: boolean = true) => {
    setCurrentLangState(lang);
    localStorage.setItem(LANG_KEY, lang);
    if (syncWithDb) {
      updateFarmerProfile({ preferred_lang: lang }).catch(console.error);
    }
  }, []);

  const t = useCallback((key: string, fallback?: string): string => {
    const langDict = translations[currentLang] || translations.en;
    if (langDict[key]) return langDict[key];
    if (translations.en[key]) return translations.en[key];
    return fallback || key;
  }, [currentLang]);

  useEffect(() => {
    document.documentElement.lang = currentLang;
  }, [currentLang]);

  return {
    lang: currentLang,
    setLanguage,
    t,
    languages: SUPPORTED_LANGUAGES,
  };
}

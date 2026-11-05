import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';
import { cs, type Translations } from '../locales/cs';
import { en } from '../locales/en';

export type Language = 'cs' | 'en';
export type LanguagePreference = 'auto' | 'cs' | 'en';

export function detectSystemLanguage(): Language {
  if (typeof window === 'undefined' || !window.navigator) {
    return 'cs';
  }

  const candidateLanguages: string[] = [];
  if (Array.isArray(window.navigator.languages) && window.navigator.languages.length > 0) {
    candidateLanguages.push(...window.navigator.languages);
  }
  if (window.navigator.language) {
    candidateLanguages.push(window.navigator.language);
  }

  for (const lang of candidateLanguages) {
    const code = lang.toLowerCase();
    if (code.startsWith('cs') || code.startsWith('sk')) {
      return 'cs';
    }
    if (code.startsWith('en')) {
      return 'en';
    }
  }

  if (candidateLanguages.length > 0) {
    const first = candidateLanguages[0].toLowerCase();
    if (!first.startsWith('cs') && !first.startsWith('sk')) {
      return 'en';
    }
  }

  return 'cs';
}

interface LanguageContextValue {
  language: Language;
  preference: LanguagePreference;
  systemLanguage: Language;
  setPreference: (pref: LanguagePreference) => void;
  toggleLanguage: () => void;
  t: (path: string, params?: Record<string, string | number>) => string;
}

const dictionaries: Record<Language, Translations> = {
  cs,
  en,
};

const LanguageContext = createContext<LanguageContextValue | null>(null);

const STORAGE_KEY = 'app_language_preference';

export const LanguageProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [preference, setPreferenceState] = useState<LanguagePreference>(() => {
    if (typeof window === 'undefined') return 'auto';
    try {
      const stored = localStorage.getItem(STORAGE_KEY) as LanguagePreference | null;
      if (stored === 'auto' || stored === 'cs' || stored === 'en') {
        return stored;
      }
    } catch {
      // ignore
    }
    return 'auto';
  });

  const [systemLanguage, setSystemLanguage] = useState<Language>(() => detectSystemLanguage());

  // Naslouchání na změnu systémového jazyka v prohlížeči / OS
  useEffect(() => {
    const handleLanguageChange = () => {
      const detected = detectSystemLanguage();
      setSystemLanguage(detected);
    };

    window.addEventListener('languagechange', handleLanguageChange);
    return () => {
      window.removeEventListener('languagechange', handleLanguageChange);
    };
  }, []);

  const language: Language = useMemo(() => {
    if (preference === 'auto') {
      return systemLanguage;
    }
    return preference;
  }, [preference, systemLanguage]);

  // Uložení volby do localStorage
  const setPreference = useCallback((pref: LanguagePreference) => {
    setPreferenceState(pref);
    try {
      localStorage.setItem(STORAGE_KEY, pref);
    } catch {
      // ignore
    }
  }, []);

  // Rychlé přepínání (cs <-> en)
  const toggleLanguage = useCallback(() => {
    setPreference(language === 'cs' ? 'en' : 'cs');
  }, [language, setPreference]);

  // Synchronizace <html lang="...">
  useEffect(() => {
    if (typeof document !== 'undefined') {
      document.documentElement.lang = language;
    }
  }, [language]);

  // Překladová funkce t('home.rewardsProgress', { count: 3 })
  const t = useCallback(
    (path: string, params?: Record<string, string | number>): string => {
      const dict = dictionaries[language] || dictionaries.cs;
      const parts = path.split('.');

      let current: unknown = dict;
      for (const part of parts) {
        if (current && typeof current === 'object' && part in current) {
          current = (current as Record<string, unknown>)[part];
        } else {
          current = undefined;
          break;
        }
      }

      // Fallback do češtiny, pokud by klíč chyběl v cílovém jazyce
      if (current === undefined) {
        let fallback: unknown = dictionaries.cs;
        for (const part of parts) {
          if (fallback && typeof fallback === 'object' && part in fallback) {
            fallback = (fallback as Record<string, unknown>)[part];
          } else {
            fallback = undefined;
            break;
          }
        }
        current = fallback;
      }

      if (typeof current !== 'string') {
        return path;
      }

      if (!params) {
        return current;
      }

      // Nahrazení {{param}} hodnotami
      return current.replace(/\{\{(\w+)\}\}/g, (_, key: string) => {
        if (key in params) {
          return String(params[key]);
        }
        return `{{${key}}}`;
      });
    },
    [language]
  );

  const value = useMemo(
    () => ({
      language,
      preference,
      systemLanguage,
      setPreference,
      toggleLanguage,
      t,
    }),
    [language, preference, systemLanguage, setPreference, toggleLanguage, t]
  );

  return <LanguageContext.Provider value={value}>{children}</LanguageContext.Provider>;
};

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
}


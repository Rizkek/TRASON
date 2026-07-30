import { useUserPreferences } from '@/hooks/useUserPreferences';
import { en } from './en';
import { id } from './id';
import { ja } from './ja';
import { es } from './es';

type Dictionary = typeof en;

export function useTranslation() {
  const { language } = useUserPreferences();

  // Build lookup table inside the function so Webpack HMR correctly picks up
  // changes to any dictionary file. A module-level constant is frozen at
  // import time and won't reflect hot-reloaded dictionary updates.
  const dictionaries: Record<string, Dictionary> = { en, id, ja, es };

  // Fallback to English if dictionary not found
  const dict = dictionaries[language] || en;

  // Simple key dot-notation resolver (e.g. 'nav.dashboard')
  const t = (key: string): string => {
    const keys = key.split('.');
    
    // First try the requested language dictionary
    let value: any = dict;
    for (const k of keys) {
      if (value === undefined) break;
      value = value[k as keyof typeof value];
    }
    
    // If not found, try the English fallback dictionary
    if (typeof value !== 'string') {
      let fallbackValue: any = en;
      for (const k of keys) {
        if (fallbackValue === undefined) break;
        fallbackValue = fallbackValue[k as keyof typeof fallbackValue];
      }
      
      if (typeof fallbackValue === 'string') {
        if (process.env.NODE_ENV === 'development') {
          console.warn(`[i18n] Missing key "${key}" for language "${language}". Using English fallback.`);
        }
        return fallbackValue;
      }
    }
    
    // If still not found, return the key string
    if (process.env.NODE_ENV === 'development' && typeof value !== 'string') {
      console.warn(`[i18n] Missing key "${key}" completely.`);
    }

    return typeof value === 'string' ? value : key;
  };

  return { t, language };
}

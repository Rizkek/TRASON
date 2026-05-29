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

  // --- DIAGNOSTIC LOGGING ---
  if (process.env.NODE_ENV === 'development') {
    const callerComponent = new Error().stack
      ?.split('\n')
      .find((line, i) => i > 1 && !line.includes('useTranslation') && !line.includes('useUserPreferences'))
      ?.trim()
      .replace(/.*at /, '')
      .split(' ')[0] || 'unknown';
    console.log(
      `[i18n] useTranslation render | language="${language}" | dict=${language in dictionaries ? 'found' : 'MISSING→fallback en'} | caller=${callerComponent}`
    );
  }
  // --- END DIAGNOSTIC ---

  // Simple key dot-notation resolver (e.g. 'nav.dashboard')
  const t = (key: string): string => {
    const keys = key.split('.');
    let value: any = dict;
    
    for (const k of keys) {
      if (value === undefined) break;
      value = value[k as keyof typeof value];
    }
    
    if (process.env.NODE_ENV === 'development' && typeof value !== 'string') {
      console.warn(`[i18n] Missing key "${key}" for language "${language}"`);
    }

    return typeof value === 'string' ? value : key;
  };

  return { t, language };
}

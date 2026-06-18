'use client';

import { useMemo } from 'react';
import { useAuthStore } from '@/store/authStore';

export type AppTheme = 'light' | 'dark' | 'auto';

export interface AppPreferences {
  theme: AppTheme;
  language: string;
  currency: string;
  timezone: string;
  notifications_enabled: boolean;
  push_notifications_enabled: boolean;
  email_digest_enabled: boolean;
  digest_frequency: string;
  module_features?: Record<string, boolean>;
}

const DEFAULT_PREFERENCES: AppPreferences = {
  theme: 'dark',
  language: 'en',
  currency: 'USD',
  timezone: 'UTC',
  notifications_enabled: true,
  push_notifications_enabled: true,
  email_digest_enabled: true,
  digest_frequency: 'weekly',
};

const LANGUAGE_LOCALES: Record<string, string> = {
  en: 'en-US',
  id: 'id-ID',
  ja: 'ja-JP',
  es: 'es-ES',
};

export function useUserPreferences() {
  // Read the rest of the preferences (theme, currency, timezone, etc.) from user object
  const userPrefs = useAuthStore((s) => {
    const prefs = (s.user as any)?.user_preferences;
    return Array.isArray(prefs) ? prefs[0] : prefs;
  });

  // Use dedicated string primitive for language — this is the reliable single source of truth.
  // Zustand's strict equality check works perfectly on strings, so any language change
  // from setUser() or setActiveLanguage() will immediately trigger a re-render.
  const activeLanguage = useAuthStore((s) => s.activeLanguage);

  const preferences = useMemo<AppPreferences>(
    () => ({
      ...DEFAULT_PREFERENCES,
      ...userPrefs,
      // Override language with the dedicated field — always authoritative
      language: activeLanguage,
    }),
    [userPrefs, activeLanguage]
  );

  const locale = LANGUAGE_LOCALES[preferences.language] || 'en-US';

  return {
    ...preferences,
    locale,
    isOnboarded: preferences.module_features?.['onboarding_done'] === true,
  };
}

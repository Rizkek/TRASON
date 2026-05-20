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
};

export function useUserPreferences() {
  const userPrefs = useAuthStore((s) => (s.user as any)?.user_preferences?.[0]);

  const preferences = useMemo<AppPreferences>(
    () => ({
      ...DEFAULT_PREFERENCES,
      ...userPrefs,
    }),
    [userPrefs]
  );

  const locale = LANGUAGE_LOCALES[preferences.language] || 'en-US';

  return {
    ...preferences,
    locale,
  };
}

'use client';

import { useMemo, useState } from 'react';
import { useAuthStore } from '@/store/authStore';
import { userQueries } from '@/services/core/userQueries';
import type { UserPreferences } from '@/types/database';
import { executeMutation } from "@/libs/api/mutationBuilder";

export type AppTheme = 'light' | 'dark';

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
  const [isUpdating, setIsUpdating] = useState(false);
  const user = useAuthStore((s) => s.user);
  const setUser = useAuthStore((s) => s.setUser);
  
  const userPrefs = useAuthStore((s) => {
    const prefs = (s.user as any)?.user_preferences;
    return Array.isArray(prefs) ? prefs[0] : prefs;
  });

  const activeLanguage = useAuthStore((s) => s.activeLanguage);
  const setActiveLanguage = useAuthStore((s) => s.setActiveLanguage);

  const preferences = useMemo<AppPreferences>(
    () => ({
      ...DEFAULT_PREFERENCES,
      ...userPrefs,
      language: activeLanguage,
    }),
    [userPrefs, activeLanguage]
  );

  const locale = LANGUAGE_LOCALES[preferences.language] || 'en-US';

  const updatePreferences = async (updates: Partial<UserPreferences>) => {
    return await executeMutation(
        (async () => {
      setIsUpdating(true);
      const updated = await userQueries.updateUserPreferences(updates);
      if (user) {
              const updatedUser = {
                ...user,
                user_preferences: [updated]
              };
              setUser(updatedUser as any);
            }
      if (updates.language) {
              setActiveLanguage(updates.language);
            }
      return updated;
        })(),
        'useUserPreferences.update'
      );
  };

  return {
    ...preferences,
    locale,
    isOnboarded: preferences.module_features?.['onboarding_done'] === true,
    updatePreferences,
    isUpdating
  };
}

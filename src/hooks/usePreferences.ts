'use client';

// eslint-disable-next-line @typescript-eslint/no-unused-vars
import type { SWRConfiguration, SWRResponse } from 'swr';
import useSWR from 'swr';
import { userQueries } from '@/services/queries';
import { UserPreferences } from '@/types/database';
import { SWR_CONFIG_STABLE } from '@/config/swr';
import { CACHE_KEYS } from '@/libs/cacheKeys';
import { handleQueryError, getUserErrorMessage, logError } from '@/libs/apiErrors';

// Partial type for preferences data returned from query (without id/user_id/timestamps)
type PreferencesData = Pick<UserPreferences, 'theme' | 'language' | 'currency' | 'timezone' | 'notifications_enabled' | 'push_notifications_enabled' | 'email_digest_enabled' | 'digest_frequency' | 'module_features'>;

export interface UsePreferencesReturn {
  preferences: PreferencesData | null;
  isLoading: boolean;
  error: Error | null;
  userErrorMessage: string | null;
  updatePreferences: (updates: Partial<UserPreferences>) => Promise<PreferencesData | null>;
  refresh: () => Promise<PreferencesData | null | undefined>;
}

/**
 * Hook for managing user preferences with SWR caching
 * Uses SWR_CONFIG_STABLE since preferences change infrequently
 */
export const usePreferences = (userId?: string): UsePreferencesReturn => {
  const key = userId ? CACHE_KEYS.settings.preferences(userId) : null;

  const { data, error, isLoading, mutate } = useSWR<PreferencesData | null>(
    key,
    async () => {
      try {
        const userData = await userQueries.getUserWithPreferences();
        // user_preferences is returned as an array, get the first element
        const prefsArray = userData?.user_preferences as PreferencesData[] | undefined;
        return Array.isArray(prefsArray) && prefsArray.length > 0 ? prefsArray[0] : null;
      } catch (err) {
        logError(err, 'usePreferences.fetch');
        throw handleQueryError(err);
      }
    },
    SWR_CONFIG_STABLE
  );

  const updatePreferences = async (updates: Partial<UserPreferences>): Promise<PreferencesData | null> => {
    try {
      const updated = await userQueries.updateUserPreferences(updates);
      await mutate();
      return updated as PreferencesData | null;
    } catch (err) {
      logError(err, 'usePreferences.update');
      throw handleQueryError(err);
    }
  };

  // User-friendly error message
  const userErrorMessage = error ? getUserErrorMessage(error) : null;

  return {
    preferences: data || null,
    isLoading,
    error: error as Error | null,
    userErrorMessage,
    updatePreferences,
    refresh: mutate,
  };
};

export default usePreferences;

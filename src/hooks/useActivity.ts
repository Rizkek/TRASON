'use client';

import { useCallback } from 'react';
import useSWR, { mutate as globalMutate } from 'swr';
import { activityQueries } from '@/services/queries';
import { Activity } from '@/services/supabaseClient';
import { SWR_CONFIG_DASHBOARD } from '@/config/swr';
import { CACHE_KEYS, INVALIDATION_PATTERNS } from '@/libs/cacheKeys';
import { handleQueryError, getUserErrorMessage, logError } from '@/libs/apiErrors';

export interface UseActivityReturn {
  activities: Activity[];
  isLoading: boolean;
  error: Error | null;
  userErrorMessage: string | null;
  createActivity: (data: Omit<Activity, 'id' | 'user_id' | 'created_at' | 'updated_at' | 'deleted_at'>) => Promise<Activity | null>;
  updateActivity: (id: string, data: Partial<Omit<Activity, 'id' | 'created_at' | 'updated_at'>>) => Promise<Activity | null>;
  deleteActivity: (id: string) => Promise<boolean>;
  mutate: () => Promise<Activity[] | undefined>;
  refresh: () => Promise<Activity[] | undefined>;
}

export const useActivity = (startDate?: Date, endDate?: Date): UseActivityReturn => {
  // Generate stable cache key using CACHE_KEYS helper
  const targetStartDate = startDate || new Date();
  const targetEndDate = endDate || targetStartDate;
  const startStr = targetStartDate.toISOString().split('T')[0];
  const endStr = targetEndDate.toISOString().split('T')[0];
  const key = startDate && endDate 
    ? CACHE_KEYS.activities.list(startStr, endStr)
    : CACHE_KEYS.activities.byDate(startStr);

  const { data, error, isLoading, mutate } = useSWR(
    key,
    async () => {
      try {
        if (startDate && endDate) {
            const res = await activityQueries.getActivities(startDate, endDate, 1000); // fetch up to 1000 for week view
            return res.data || [];
        } else {
            const res = await activityQueries.getActivitiesByDate(targetStartDate);
            return res || [];
        }
      } catch (err) {
        logError(err, 'useActivity.fetch');
        throw handleQueryError(err);
      }
    },
    SWR_CONFIG_DASHBOARD
  );

  const createActivity = useCallback(
    async (dataToCreate: Omit<Activity, 'id' | 'user_id' | 'created_at' | 'updated_at' | 'deleted_at'>) => {
      try {
        const newActivity = await activityQueries.createActivity(dataToCreate);

        // Cascade invalidation: invalidate all related caches
        const keysToInvalidate = INVALIDATION_PATTERNS.onActivityChange(startStr);
        await Promise.all(keysToInvalidate.map(k => {
          if (typeof k === 'string') {
            return globalMutate(k);
          }
          return globalMutate(
            (key) => Array.isArray(key) && key[0] === 'activities',
            undefined,
            { revalidate: true }
          );
        }));

        return newActivity;
      } catch (err) {
        logError(err, 'useActivity.create');
        throw handleQueryError(err);
      }
    },
    [startStr]
  );

  const updateActivity = useCallback(
    async (
      id: string,
      dataToUpdate: Partial<Omit<Activity, 'id' | 'created_at' | 'updated_at'>>
    ) => {
      try {
        const updatedActivity = await activityQueries.updateActivity(id, dataToUpdate);

        // Cascade invalidation
        const keysToInvalidate = INVALIDATION_PATTERNS.onActivityChange(startStr);
        await Promise.all(keysToInvalidate.map(k => {
          if (typeof k === 'string') {
            return globalMutate(k);
          }
          return globalMutate(
            (key) => Array.isArray(key) && key[0] === 'activities',
            undefined,
            { revalidate: true }
          );
        }));

        return updatedActivity;
      } catch (err) {
        logError(err, 'useActivity.update');
        throw handleQueryError(err);
      }
    },
    [startStr]
  );

  const deleteActivity = useCallback(async (id: string) => {
    try {
      await activityQueries.deleteActivity(id);

      // Cascade invalidation
      const keysToInvalidate = INVALIDATION_PATTERNS.onActivityChange(startStr);
      await Promise.all(keysToInvalidate.map(k => {
        if (typeof k === 'string') {
          return globalMutate(k);
        }
        return globalMutate(
          (key) => Array.isArray(key) && key[0] === 'activities',
          undefined,
          { revalidate: true }
        );
      }));

      return true;
    } catch (err) {
      logError(err, 'useActivity.delete');
      throw handleQueryError(err);
    }
  }, [startStr]);

  // User-friendly error message
  const userErrorMessage = error ? getUserErrorMessage(error) : null;

  return {
    activities: data || [],
    isLoading,
    error: error as Error | null,
    userErrorMessage,
    createActivity,
    updateActivity,
    deleteActivity,
    mutate,
    refresh: mutate
  };
};

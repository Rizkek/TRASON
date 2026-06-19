'use client';

import { useCallback } from 'react';
import useSWR, { mutate as globalMutate } from 'swr';
import { activityQueries } from '@/services/activity/activityQueries';
import { Activity } from '@/services/supabaseClient';
import { SWR_CONFIG_DASHBOARD } from '@/config/swr';
import { CACHE_KEYS, INVALIDATION_PATTERNS } from '@/libs/cacheKeys';
import { executeMutation } from "@/libs/api/mutationBuilder";
import { getUserErrorMessage } from "@/libs/apiErrors";

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
      return await executeMutation(
          (async () => {
        if (startDate && endDate) {
                    const res = await activityQueries.getActivities(startDate, endDate, 1000); // fetch up to 1000 for week view
                    return res.data || [];
                } else {
                    const res = await activityQueries.getActivitiesByDate(targetStartDate);
                    return res || [];
                }
          })(),
          'useActivity.fetch'
        );
    },
    SWR_CONFIG_DASHBOARD
  );

  const createActivity = useCallback(
    async (dataToCreate: Omit<Activity, 'id' | 'user_id' | 'created_at' | 'updated_at' | 'deleted_at'>) => {
      return await executeMutation(
            (async () => {
          const optimisticActivity: any = { ...dataToCreate, id: `temp-${Date.now()}`, created_at: new Date().toISOString() };
          await mutate(
                    (currentData: Activity[] | undefined) => currentData ? [optimisticActivity, ...currentData] : [optimisticActivity],
                    { revalidate: false }
                  );
          const newActivity = await activityQueries.createActivity(dataToCreate);
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
            })(),
            'useActivity.create', { onError: async (err) => { await mutate(); } }
          );
    },
    [startStr, mutate]
  );

  const updateActivity = useCallback(
    async (
      id: string,
      dataToUpdate: Partial<Omit<Activity, 'id' | 'created_at' | 'updated_at'>>
    ) => {
      return await executeMutation(
            (async () => {
          await mutate(
                    (currentData: Activity[] | undefined) => 
                      currentData ? currentData.map((a) => (a.id === id ? { ...a, ...dataToUpdate } : a)) : [],
                    { revalidate: false }
                  );
          const updatedActivity = await activityQueries.updateActivity(id, dataToUpdate);
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
            })(),
            'useActivity.update', { onError: async (err) => { await mutate(); } }
          );
    },
    [startStr, mutate]
  );

  const deleteActivity = useCallback(async (id: string) => {
    return await executeMutation(
        (async () => {
      await mutate(
              (currentData: Activity[] | undefined) => 
                currentData ? currentData.filter((a) => a.id !== id) : [],
              { revalidate: false }
            );
      await activityQueries.deleteActivity(id);
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
        })(),
        'useActivity.delete', { onError: async (err) => { await mutate(); } }
      );
  }, [startStr, mutate]);

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

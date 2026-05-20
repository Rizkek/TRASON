'use client';

import { useCallback } from 'react';
import useSWR from 'swr';
import { useActivity } from './useActivity';
import { sportQueries } from '@/services/sportQueries';
import { Activity, SportLog } from '@/services/supabaseClient';

export const useSportActivity = (date?: Date) => {
  const { 
    activities, 
    isLoading, 
    error, 
    createActivity: baseCreateActivity, 
    updateActivity: baseUpdateActivity,
    deleteActivity: baseDeleteActivity,
    mutate: mutateActivities
  } = useActivity(date);

  // Fetch sport logs for the current activities
  const activityIds = activities.filter(a => a.category === 'Sport' || a.category === 'Exercise').map(a => a.id);
  const cacheKey = activityIds.length > 0 ? ['sport_logs', activityIds.sort().join(',')] : null;

  const { data: sportLogs, mutate: mutateSportLogs } = useSWR(
    cacheKey,
    async () => {
      return await sportQueries.getSportLogsByActivityIds(activityIds);
    }
  );

  const mutate = useCallback(async () => {
    await Promise.all([mutateActivities(), mutateSportLogs()]);
  }, [mutateActivities, mutateSportLogs]);

  const createSportActivity = useCallback(
    async (
      activityData: Omit<Activity, 'id' | 'user_id' | 'created_at' | 'updated_at' | 'deleted_at'>,
      sportData?: Omit<SportLog, 'id' | 'user_id' | 'activity_id' | 'created_at' | 'updated_at'>
    ) => {
      const activity = await baseCreateActivity(activityData);
      
      if (sportData && activity) {
        await sportQueries.createSportLog({
          ...sportData,
          activity_id: activity.id,
        });
      }
      
      await mutate();
      return activity;
    },
    [baseCreateActivity, mutate]
  );

  const updateSportActivity = useCallback(
    async (
      id: string,
      activityData: Partial<Omit<Activity, 'id' | 'user_id' | 'created_at' | 'updated_at'>>,
      sportData?: Partial<Omit<SportLog, 'id' | 'user_id' | 'activity_id' | 'created_at' | 'updated_at'>>
    ) => {
      const activity = await baseUpdateActivity(id, activityData);
      
      if (sportData && activity) {
        const existingLog = await sportQueries.getSportLogByActivityId(id);
        if (existingLog) {
          await sportQueries.updateSportLog(existingLog.id, sportData);
        } else {
          // If it wasn't a sport activity before but now it is
          await sportQueries.createSportLog({
            type: (sportData.type as string) || 'other',
            ...sportData,
            activity_id: id,
          } as any);
        }
      }
      
      await mutate();
      return activity;
    },
    [baseUpdateActivity, mutate]
  );

  const deleteSportActivity = useCallback(
    async (id: string) => {
      const existingLog = await sportQueries.getSportLogByActivityId(id);
      if (existingLog) {
        await sportQueries.deleteSportLog(existingLog.id);
      }
      await baseDeleteActivity(id);
      await mutate();
    },
    [baseDeleteActivity, mutate]
  );

  return {
    activities,
    sportLogs: sportLogs || [],
    isLoading,
    error,
    createSportActivity,
    updateSportActivity,
    deleteSportActivity,
    mutate
  };
};

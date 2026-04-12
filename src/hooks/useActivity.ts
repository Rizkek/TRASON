'use client';

import { useCallback, useState } from 'react';
import { activityQueries } from '@/services/queries';
import { Activity } from '@/services/supabaseClient';

export const useActivity = () => {
  const [activities, setActivities] = useState<Activity[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchActivities = useCallback(
    async (date?: Date) => {
      setIsLoading(true);
      setError(null);
      try {
        const data = await activityQueries.getActivitiesByDate(date || new Date());
        setActivities(data || []);
        return data;
      } catch (err) {
        const errorMessage =
          err instanceof Error ? err.message : 'Failed to fetch activities';
        setError(errorMessage);
        throw err;
      } finally {
        setIsLoading(false);
      }
    },
    []
  );

  const createActivity = useCallback(
    async (data: Omit<Activity, 'id' | 'user_id' | 'created_at' | 'updated_at' | 'deleted_at'>) => {
      setError(null);
      try {
        const newActivity = await activityQueries.createActivity(data);
        setActivities((prev) => [...prev, newActivity]);
        return newActivity;
      } catch (err) {
        const errorMessage =
          err instanceof Error ? err.message : 'Failed to create activity';
        setError(errorMessage);
        throw err;
      }
    },
    []
  );

  const updateActivity = useCallback(
    async (
      id: string,
      data: Partial<Omit<Activity, 'id' | 'created_at' | 'updated_at'>>
    ) => {
      setError(null);
      try {
        const updatedActivity = await activityQueries.updateActivity(id, data);
        setActivities((prev) =>
          prev.map((activity) =>
            activity.id === id ? updatedActivity : activity
          )
        );
        return updatedActivity;
      } catch (err) {
        const errorMessage =
          err instanceof Error ? err.message : 'Failed to update activity';
        setError(errorMessage);
        throw err;
      }
    },
    []
  );

  const deleteActivity = useCallback(async (id: string) => {
    setError(null);
    try {
      await activityQueries.deleteActivity(id);
      setActivities((prev) => prev.filter((activity) => activity.id !== id));
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : 'Failed to delete activity';
      setError(errorMessage);
      throw err;
    }
  }, []);

  return {
    activities,
    isLoading,
    error,
    fetchActivities,
    createActivity,
    updateActivity,
    deleteActivity,
  };
};

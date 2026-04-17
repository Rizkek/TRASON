import { useCallback } from 'react';
import { activityQueries } from '@/services/queries';
import { Activity } from '@/services/supabaseClient';
import { useActivityStore } from '@/store/activityStore';

export const useActivity = () => {
  const store = useActivityStore();

  const fetchActivities = useCallback(
    async (date?: Date) => {
      store.setLoading(true);
      store.setError(null);
      try {
        const data = await activityQueries.getActivitiesByDate(date || new Date());
        store.setActivities(data || []);
        return data;
      } catch (err) {
        const errorMessage =
          err instanceof Error ? err.message : 'Failed to fetch activities';
        store.setError(errorMessage);
        throw err;
      } finally {
        store.setLoading(false);
      }
    },
    [store]
  );

  const createActivity = useCallback(
    async (data: Omit<Activity, 'id' | 'user_id' | 'created_at' | 'updated_at' | 'deleted_at'>) => {
      store.setError(null);
      try {
        const newActivity = await activityQueries.createActivity(data);
        store.addActivity(newActivity);
        return newActivity;
      } catch (err) {
        const errorMessage =
          err instanceof Error ? err.message : 'Failed to create activity';
        store.setError(errorMessage);
        throw err;
      }
    },
    [store]
  );

  const updateActivity = useCallback(
    async (
      id: string,
      data: Partial<Omit<Activity, 'id' | 'created_at' | 'updated_at'>>
    ) => {
      store.setError(null);
      try {
        const updatedActivity = await activityQueries.updateActivity(id, data);
        store.updateActivity(id, updatedActivity);
        return updatedActivity;
      } catch (err) {
        const errorMessage =
          err instanceof Error ? err.message : 'Failed to update activity';
        store.setError(errorMessage);
        throw err;
      }
    },
    [store]
  );

  const deleteActivity = useCallback(async (id: string) => {
    store.setError(null);
    try {
      await activityQueries.deleteActivity(id);
      store.deleteActivity(id);
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : 'Failed to delete activity';
      store.setError(errorMessage);
      throw err;
    }
  }, [store]);

  return {
    activities: store.activities,
    isLoading: store.isLoading,
    error: store.error,
    fetchActivities,
    createActivity,
    updateActivity,
    deleteActivity,
  };
};

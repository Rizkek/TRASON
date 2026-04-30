import { useCallback } from 'react';
import useSWR from 'swr';
import { activityQueries } from '@/services/queries';
import { Activity } from '@/services/supabaseClient';

export const useActivity = (date?: Date) => {
  // Buat key SWR yg berubah tiap kali harinya berubah (cache berbasis hari)
  const key = date 
    ? ['activities', date.toISOString().split('T')[0]]
    : ['activities', new Date().toISOString().split('T')[0]];

  const { data, error, isLoading, mutate } = useSWR(
    key,
    () => activityQueries.getActivitiesByDate(date || new Date()).then(res => res || []),
    {
      revalidateOnFocus: true,
      dedupingInterval: 5000,
      keepPreviousData: true,
    }
  );

  const createActivity = useCallback(
    async (dataToCreate: Omit<Activity, 'id' | 'user_id' | 'created_at' | 'updated_at' | 'deleted_at'>) => {
      const newActivity = await activityQueries.createActivity(dataToCreate);
      await mutate();
      return newActivity;
    },
    [mutate]
  );

  const updateActivity = useCallback(
    async (
      id: string,
      dataToUpdate: Partial<Omit<Activity, 'id' | 'created_at' | 'updated_at'>>
    ) => {
      const updatedActivity = await activityQueries.updateActivity(id, dataToUpdate);
      await mutate();
      return updatedActivity;
    },
    [mutate]
  );

  const deleteActivity = useCallback(async (id: string) => {
    await activityQueries.deleteActivity(id);
    await mutate();
  }, [mutate]);

  return {
    activities: data || [],
    isLoading,
    error,
    createActivity,
    updateActivity,
    deleteActivity,
    mutate
  };
};

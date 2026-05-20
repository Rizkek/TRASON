import { useCallback } from 'react';
import useSWR from 'swr';
import { habitQueries } from '@/services/queries';
import { Habit } from '@/services/supabaseClient';

export const useHabit = () => {
  const { data, error, isLoading, mutate } = useSWR(
    'habits',
    () => habitQueries.getHabits().then(res => res || []),
    {
      revalidateOnFocus: true,
      dedupingInterval: 5000,
    }
  );

  const createHabit = useCallback(
    async (dataToCreate: Omit<Habit, 'id' | 'user_id' | 'created_at' | 'updated_at' | 'deleted_at'>) => {
      const newHabit = await habitQueries.createHabit(dataToCreate);
      await mutate();
      return newHabit;
    },
    [mutate]
  );

  const updateHabit = useCallback(
    async (id: string, dataToUpdate: Partial<Omit<Habit, 'id' | 'created_at' | 'updated_at'>>) => {
      const updatedHabit = await habitQueries.updateHabit(id, dataToUpdate);
      await mutate();
      return updatedHabit;
    },
    [mutate]
  );

  const deleteHabit = useCallback(async (id: string) => {
    await habitQueries.deleteHabit(id);
    await mutate();
  }, [mutate]);

  return {
    habits: data || [],
    isLoading,
    error,
    createHabit,
    updateHabit,
    deleteHabit,
    mutate
  };
};

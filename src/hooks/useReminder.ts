import { useCallback } from 'react';
import useSWR from 'swr';
import { reminderQueries } from '@/services/queries';
import { Reminder } from '@/services/supabaseClient';

export const useReminder = (startDate?: Date, endDate?: Date) => {
  const key = startDate && endDate 
    ? ['reminders', startDate.toISOString().split('T')[0], endDate.toISOString().split('T')[0]]
    : ['reminders', 'pending'];

  const { data, error, isLoading, mutate } = useSWR(
    key,
    async ([, startStr, endStr]) => {
      if (startStr === 'pending') {
        const res = await reminderQueries.getPendingReminders();
        return res || [];
      }
      const res = await reminderQueries.getReminders(new Date(startStr), new Date(endStr as string));
      return res || [];
    },
    {
      revalidateOnFocus: true,
      dedupingInterval: 5000,
      keepPreviousData: true,
    }
  );

  const createReminder = useCallback(
    async (dataToCreate: Omit<Reminder, 'id' | 'user_id' | 'created_at' | 'updated_at' | 'deleted_at'>) => {
      const newReminder = await reminderQueries.createReminder(dataToCreate);
      await mutate();
      return newReminder;
    },
    [mutate]
  );

  const updateReminder = useCallback(
    async (id: string, dataToUpdate: Partial<Omit<Reminder, 'id' | 'created_at' | 'updated_at'>>) => {
      const updatedReminder = await reminderQueries.updateReminder(id, dataToUpdate);
      await mutate();
      return updatedReminder;
    },
    [mutate]
  );

  const deleteReminder = useCallback(async (id: string) => {
    await reminderQueries.deleteReminder(id);
    await mutate();
  }, [mutate]);

  const markReminderDone = useCallback(async (id: string) => {
    const updatedReminder = await reminderQueries.completeReminder(id);
    await mutate();
    return updatedReminder;
  }, [mutate]);

  return {
    reminders: data || [],
    isLoading,
    error,
    createReminder,
    updateReminder,
    deleteReminder,
    markReminderDone,
    mutate
  };
};

import { useCallback } from 'react';
import { reminderQueries } from '@/services/queries';
import { Reminder } from '@/services/supabaseClient';
import { useReminderStore } from '@/store/reminderStore';

export const useReminder = () => {
  const store = useReminderStore();

  const fetchReminders = useCallback(async (startDate?: Date, endDate?: Date) => {
    store.setLoading(true);
    store.setError(null);
    try {
      const data =
        startDate && endDate
          ? await reminderQueries.getReminders(startDate, endDate)
          : await reminderQueries.getPendingReminders();
      store.setReminders(data || []);
      return data;
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : 'Failed to fetch reminders';
      store.setError(errorMessage);
      throw err;
    } finally {
      store.setLoading(false);
    }
  }, [store]);

  const createReminder = useCallback(
    async (
      data: Omit<Reminder, 'id' | 'user_id' | 'created_at' | 'updated_at' | 'deleted_at'>
    ) => {
      store.setError(null);
      try {
        const newReminder = await reminderQueries.createReminder(data);
        store.addReminder(newReminder);
        return newReminder;
      } catch (err) {
        const errorMessage =
          err instanceof Error ? err.message : 'Failed to create reminder';
        store.setError(errorMessage);
        throw err;
      }
    },
    [store]
  );

  const updateReminder = useCallback(
    async (
      id: string,
      data: Partial<Omit<Reminder, 'id' | 'created_at' | 'updated_at'>>
    ) => {
      store.setError(null);
      try {
        const updatedReminder = await reminderQueries.updateReminder(id, data);
        store.updateReminder(id, updatedReminder);
        return updatedReminder;
      } catch (err) {
        const errorMessage =
          err instanceof Error ? err.message : 'Failed to update reminder';
        store.setError(errorMessage);
        throw err;
      }
    },
    [store]
  );

  const deleteReminder = useCallback(async (id: string) => {
    store.setError(null);
    try {
      await reminderQueries.deleteReminder(id);
      store.deleteReminder(id);
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : 'Failed to delete reminder';
      store.setError(errorMessage);
      throw err;
    }
  }, [store]);

  const markReminderDone = useCallback(async (id: string) => {
    store.setError(null);
    try {
      const updatedReminder = await reminderQueries.completeReminder(id);
      store.updateReminder(id, updatedReminder);
      return updatedReminder;
    } catch (err) {
      const errorMessage =
        err instanceof Error
          ? err.message
          : 'Failed to mark reminder as done';
      store.setError(errorMessage);
      throw err;
    }
  }, [store]);

  return {
    reminders: store.reminders,
    isLoading: store.isLoading,
    error: store.error,
    fetchReminders,
    createReminder,
    updateReminder,
    deleteReminder,
    markReminderDone,
  };
};

'use client';

import { useCallback, useState } from 'react';
import { reminderQueries } from '@/services/queries';
import { Reminder } from '@/services/supabaseClient';

export const useReminder = () => {
  const [reminders, setReminders] = useState<Reminder[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchReminders = useCallback(async (startDate?: Date, endDate?: Date) => {
    setIsLoading(true);
    setError(null);
    try {
      const data =
        startDate && endDate
          ? await reminderQueries.getReminders(startDate, endDate)
          : await reminderQueries.getPendingReminders();
      setReminders(data || []);
      return data;
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : 'Failed to fetch reminders';
      setError(errorMessage);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const createReminder = useCallback(
    async (
      data: Omit<Reminder, 'id' | 'user_id' | 'created_at' | 'updated_at' | 'deleted_at'>
    ) => {
      setError(null);
      try {
        const newReminder = await reminderQueries.createReminder(data);
        setReminders((prev) => [...prev, newReminder]);
        return newReminder;
      } catch (err) {
        const errorMessage =
          err instanceof Error ? err.message : 'Failed to create reminder';
        setError(errorMessage);
        throw err;
      }
    },
    []
  );

  const updateReminder = useCallback(
    async (
      id: string,
      data: Partial<Omit<Reminder, 'id' | 'created_at' | 'updated_at'>>
    ) => {
      setError(null);
      try {
        const updatedReminder = await reminderQueries.updateReminder(id, data);
        setReminders((prev) =>
          prev.map((reminder) =>
            reminder.id === id ? updatedReminder : reminder
          )
        );
        return updatedReminder;
      } catch (err) {
        const errorMessage =
          err instanceof Error ? err.message : 'Failed to update reminder';
        setError(errorMessage);
        throw err;
      }
    },
    []
  );

  const deleteReminder = useCallback(async (id: string) => {
    setError(null);
    try {
      await reminderQueries.deleteReminder(id);
      setReminders((prev) => prev.filter((reminder) => reminder.id !== id));
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : 'Failed to delete reminder';
      setError(errorMessage);
      throw err;
    }
  }, []);

  const markReminderDone = useCallback(async (id: string) => {
    setError(null);
    try {
      const updatedReminder = await reminderQueries.completeReminder(id);
      setReminders((prev) =>
        prev.map((reminder) =>
          reminder.id === id ? updatedReminder : reminder
        )
      );
      return updatedReminder;
    } catch (err) {
      const errorMessage =
        err instanceof Error
          ? err.message
          : 'Failed to mark reminder as done';
      setError(errorMessage);
      throw err;
    }
  }, []);

  return {
    reminders,
    isLoading,
    error,
    fetchReminders,
    createReminder,
    updateReminder,
    deleteReminder,
    markReminderDone,
  };
};

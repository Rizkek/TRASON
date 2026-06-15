'use client';

import { useCallback } from 'react';
import useSWR, { mutate as globalMutate } from 'swr';
import { reminderQueries } from '@/services/queries';
import { Reminder } from '@/services/supabaseClient';
import { SWR_CONFIG_DASHBOARD } from '@/config/swr';
import { CACHE_KEYS } from '@/libs/cacheKeys';
import { handleQueryError, getUserErrorMessage, logError } from '@/libs/apiErrors';

export interface UseReminderReturn {
  reminders: Reminder[];
  isLoading: boolean;
  error: Error | null;
  userErrorMessage: string | null;
  createReminder: (data: Omit<Reminder, 'id' | 'user_id' | 'created_at' | 'updated_at' | 'deleted_at'>) => Promise<Reminder | null>;
  updateReminder: (id: string, data: Partial<Omit<Reminder, 'id' | 'created_at' | 'updated_at'>>) => Promise<Reminder | null>;
  deleteReminder: (id: string) => Promise<boolean>;
  markReminderDone: (id: string) => Promise<Reminder | null>;
  mutate: () => Promise<Reminder[] | undefined>;
  refresh: () => Promise<Reminder[] | undefined>;
}

export const useReminder = (startDate?: Date, endDate?: Date): UseReminderReturn => {
  // Generate stable cache key using CACHE_KEYS helper
  const isPendingView = !startDate || !endDate;
  const startStr = startDate?.toISOString().split('T')[0];
  const endStr = endDate?.toISOString().split('T')[0];
  const key = isPendingView
    ? CACHE_KEYS.reminders.pending()
    : ['reminders', 'range', startStr, endStr];

  const { data, error, isLoading, mutate } = useSWR(
    key,
    async () => {
      try {
        if (isPendingView) {
          const res = await reminderQueries.getPendingReminders();
          return res || [];
        }
        const res = await reminderQueries.getReminders(startDate!, endDate!);
        return res || [];
      } catch (err) {
        logError(err, 'useReminder.fetch');
        throw handleQueryError(err);
      }
    },
    SWR_CONFIG_DASHBOARD
  );

  const createReminder = useCallback(
    async (dataToCreate: Omit<Reminder, 'id' | 'user_id' | 'created_at' | 'updated_at' | 'deleted_at'>) => {
      try {
        const newReminder = await reminderQueries.createReminder(dataToCreate);

        // Direct exact-key invalidation — more reliable than filter function
        await globalMutate(['reminders', 'pending'], undefined, { revalidate: true });
        await globalMutate(['reminders', 'completed'], undefined, { revalidate: true });
        await globalMutate('dashboard:overview', undefined, { revalidate: true });
        await mutate();

        return newReminder;
      } catch (err) {
        logError(err, 'useReminder.create');
        throw handleQueryError(err);
      }
    },
    [mutate]
  );

  const updateReminder = useCallback(
    async (id: string, dataToUpdate: Partial<Omit<Reminder, 'id' | 'created_at' | 'updated_at'>>) => {
      try {
        const updatedReminder = await reminderQueries.updateReminder(id, dataToUpdate);

        // Direct exact-key invalidation — more reliable than filter function
        await globalMutate(['reminders', 'pending'], undefined, { revalidate: true });
        await globalMutate(['reminders', 'completed'], undefined, { revalidate: true });
        await globalMutate('dashboard:overview', undefined, { revalidate: true });
        await mutate();

        return updatedReminder;
      } catch (err) {
        logError(err, 'useReminder.update');
        throw handleQueryError(err);
      }
    },
    [mutate]
  );

  const deleteReminder = useCallback(async (id: string) => {
    try {
      await reminderQueries.deleteReminder(id);

        // Direct exact-key invalidation — more reliable than filter function
        await globalMutate(['reminders', 'pending'], undefined, { revalidate: true });
        await globalMutate(['reminders', 'completed'], undefined, { revalidate: true });
        await globalMutate('dashboard:overview', undefined, { revalidate: true });
        await mutate();

        return true;
    } catch (err) {
      logError(err, 'useReminder.delete');
      throw handleQueryError(err);
    }
  }, []);

  const markReminderDone = useCallback(async (id: string) => {
    try {
      const updatedReminder = await reminderQueries.completeReminder(id);

        // Direct exact-key invalidation — more reliable than filter function
        await globalMutate(['reminders', 'pending'], undefined, { revalidate: true });
        await globalMutate(['reminders', 'completed'], undefined, { revalidate: true });
        await globalMutate('dashboard:overview', undefined, { revalidate: true });
        await mutate();

        return updatedReminder;
    } catch (err) {
      logError(err, 'useReminder.complete');
      throw handleQueryError(err);
    }
  }, []);

  // User-friendly error message
  const userErrorMessage = error ? getUserErrorMessage(error) : null;

  return {
    reminders: data || [],
    isLoading,
    error: error as Error | null,
    userErrorMessage,
    createReminder,
    updateReminder,
    deleteReminder,
    markReminderDone,
    mutate,
    refresh: mutate
  };
};

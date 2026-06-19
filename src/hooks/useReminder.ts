'use client';
'use client';

import { useCallback } from 'react';
import useSWR, { mutate as globalMutate } from 'swr';
import { reminderQueries } from '@/services/core/reminderQueries';
import { Reminder } from '@/services/supabaseClient';
import { SWR_CONFIG_DASHBOARD } from '@/config/swr';
import { CACHE_KEYS } from '@/libs/cacheKeys';
import { executeMutation } from "@/libs/api/mutationBuilder";
import { getUserErrorMessage } from "@/libs/apiErrors";

export interface UseReminderReturn {
  reminders: Reminder[];
  isLoading: boolean;
  error: Error | null;
  userErrorMessage: string | null;
  createReminder: (data: Omit<Reminder, 'id' | 'user_id' | 'created_at' | 'updated_at' | 'deleted_at'>) => Promise<Reminder | null>;
  updateReminder: (id: string, data: Partial<Omit<Reminder, 'id' | 'created_at' | 'updated_at'>>) => Promise<Reminder | null>;
  deleteReminder: (id: string) => Promise<boolean>;
  markReminderDone: (id: string) => Promise<Reminder | null>;
  unmarkReminderDone: (id: string) => Promise<Reminder | null>;
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
      return await executeMutation(
          (async () => {
        if (isPendingView) {
                  const res = await reminderQueries.getPendingReminders();
                  return res || [];
                }
        const res = await reminderQueries.getReminders(startDate!, endDate!);
        return res || [];
          })(),
          'useReminder.fetch'
        );
    },
    SWR_CONFIG_DASHBOARD
  );

  const createReminder = useCallback(
    async (dataToCreate: Omit<Reminder, 'id' | 'user_id' | 'created_at' | 'updated_at' | 'deleted_at'>) => {
      return await executeMutation(
            (async () => {
          const optimisticReminder: any = { ...dataToCreate, id: `temp-${Date.now()}`, created_at: new Date().toISOString() };
          await mutate(
                    (currentData: Reminder[] | undefined) => currentData ? [...currentData, optimisticReminder] : [optimisticReminder],
                    { revalidate: false }
                  );
          const newReminder = await reminderQueries.createReminder(dataToCreate);
          await globalMutate(['reminders', 'pending'], undefined, { revalidate: true });
          await globalMutate(['reminders', 'completed'], undefined, { revalidate: true });
          await globalMutate('dashboard:overview', undefined, { revalidate: true });
          await mutate();
          return newReminder;
            })(),
            'useReminder.create', { onError: async (err) => { await mutate(); } }
          );
    },
    [mutate]
  );

  const updateReminder = useCallback(
    async (id: string, dataToUpdate: Partial<Omit<Reminder, 'id' | 'created_at' | 'updated_at'>>) => {
      return await executeMutation(
            (async () => {
          await mutate(
                    (currentData: Reminder[] | undefined) => 
                      currentData ? currentData.map((r) => (r.id === id ? { ...r, ...dataToUpdate } : r)) : [],
                    { revalidate: false }
                  );
          const updatedReminder = await reminderQueries.updateReminder(id, dataToUpdate);
          await globalMutate(['reminders', 'pending'], undefined, { revalidate: true });
          await globalMutate(['reminders', 'completed'], undefined, { revalidate: true });
          await globalMutate('dashboard:overview', undefined, { revalidate: true });
          await mutate();
          return updatedReminder;
            })(),
            'useReminder.update', { onError: async (err) => { await mutate(); } }
          );
    },
    [mutate]
  );

  const deleteReminder = useCallback(async (id: string) => {
    return await executeMutation(
        (async () => {
      await mutate(
              (currentData: Reminder[] | undefined) => 
                currentData ? currentData.filter((r) => r.id !== id) : [],
              { revalidate: false }
            );
      await reminderQueries.deleteReminder(id);
      await globalMutate(['reminders', 'pending'], undefined, { revalidate: true });
      await globalMutate(['reminders', 'completed'], undefined, { revalidate: true });
      await globalMutate('dashboard:overview', undefined, { revalidate: true });
      await mutate();
      return true;
        })(),
        'useReminder.delete', { onError: async (err) => { await mutate(); } }
      );
  }, [mutate]);

  const markReminderDone = useCallback(async (id: string) => {
    return await executeMutation(
        (async () => {
      await mutate(
              (currentData: Reminder[] | undefined) => 
                currentData ? currentData.map((r) => (r.id === id ? { ...r, status: 'completed' } : r)) : [],
              { revalidate: false }
            );
      const updatedReminder = await reminderQueries.completeReminder(id);
      await globalMutate(['reminders', 'pending'], undefined, { revalidate: true });
      await globalMutate(['reminders', 'completed'], undefined, { revalidate: true });
      await globalMutate('dashboard:overview', undefined, { revalidate: true });
      await mutate();
      return updatedReminder;
        })(),
        'useReminder.complete', { onError: async (err) => { await mutate(); } }
      );
  }, [mutate]);

  const unmarkReminderDone = useCallback(async (id: string) => {
    return await executeMutation(
        (async () => {
      await mutate(
              (currentData: Reminder[] | undefined) => 
                currentData ? currentData.map((r) => (r.id === id ? { ...r, status: 'pending' } : r)) : [],
              { revalidate: false }
            );
      const updatedReminder = await reminderQueries.uncompleteReminder(id);
      await globalMutate(['reminders', 'pending'], undefined, { revalidate: true });
      await globalMutate(['reminders', 'completed'], undefined, { revalidate: true });
      await globalMutate('dashboard:overview', undefined, { revalidate: true });
      await mutate();
      return updatedReminder;
        })(),
        'useReminder.uncomplete', { onError: async (err) => { await mutate(); } }
      );
  }, [mutate]);

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
    unmarkReminderDone,
    mutate,
    refresh: mutate
  };
};

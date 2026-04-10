'use client';

import { useCallback, useState } from 'react';
import { apiClient } from '@/services/apiClient';
import { Reminder } from '@/types';
import { useFetch } from './useFetch';

export const useReminder = () => {
  const [reminders, setReminders] = useState<Reminder[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { execute } = useFetch<Reminder[]>();

  const fetchReminders = useCallback(async () => {
    setIsLoading(true);
    try {
      const response = await apiClient.get('/reminders');
      setReminders(response.data);
      setIsLoading(false);
      return response.data;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch reminders';
      setError(errorMessage);
      setIsLoading(false);
      throw err;
    }
  }, []);

  const createReminder = useCallback(
    async (data: Omit<Reminder, 'id' | 'createdAt' | 'updatedAt'>) => {
      try {
        const response = await apiClient.post('/reminders', data);
        setReminders((prev) => [...prev, response.data]);
        return response.data;
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Failed to create reminder';
        setError(errorMessage);
        throw err;
      }
    },
    []
  );

  const updateReminder = useCallback(
    async (
      id: string,
      data: Partial<Omit<Reminder, 'id' | 'createdAt' | 'updatedAt'>>
    ) => {
      try {
        const response = await apiClient.put(`/reminders/${id}`, data);
        setReminders((prev) =>
          prev.map((reminder) =>
            reminder.id === id ? response.data : reminder
          )
        );
        return response.data;
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Failed to update reminder';
        setError(errorMessage);
        throw err;
      }
    },
    []
  );

  const deleteReminder = useCallback(async (id: string) => {
    try {
      await apiClient.delete(`/reminders/${id}`);
      setReminders((prev) => prev.filter((reminder) => reminder.id !== id));
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to delete reminder';
      setError(errorMessage);
      throw err;
    }
  }, []);

  const markReminderDone = useCallback(async (id: string) => {
    try {
      const response = await apiClient.post(`/reminders/${id}/mark-done`);
      setReminders((prev) =>
        prev.map((reminder) =>
          reminder.id === id
            ? {
                ...reminder,
                lastNotifiedAt: new Date().toISOString(),
              }
            : reminder
        )
      );
      return response.data;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to mark reminder as done';
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

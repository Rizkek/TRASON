'use client';

import { useCallback, useState } from 'react';
import { apiClient } from '@/services/apiClient';
import { Activity } from '@/types';
import { useFetch } from './useFetch';

export const useActivity = () => {
  const [activities, setActivities] = useState<Activity[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { execute } = useFetch<Activity[]>();

  const fetchActivities = useCallback(
    async (date?: Date) => {
      setIsLoading(true);
      try {
        const response = await apiClient.get('/activities', {
          params: {
            date: date?.toISOString().split('T')[0],
          },
        });
        setActivities(response.data);
        setIsLoading(false);
        return response.data;
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Failed to fetch activities';
        setError(errorMessage);
        setIsLoading(false);
        throw err;
      }
    },
    []
  );

  const createActivity = useCallback(
    async (data: Omit<Activity, 'id' | 'createdAt' | 'updatedAt'>) => {
      try {
        const response = await apiClient.post('/activities', data);
        setActivities((prev) => [...prev, response.data]);
        return response.data;
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Failed to create activity';
        setError(errorMessage);
        throw err;
      }
    },
    []
  );

  const updateActivity = useCallback(
    async (
      id: string,
      data: Partial<Omit<Activity, 'id' | 'createdAt' | 'updatedAt'>>
    ) => {
      try {
        const response = await apiClient.put(`/activities/${id}`, data);
        setActivities((prev) =>
          prev.map((activity) =>
            activity.id === id ? response.data : activity
          )
        );
        return response.data;
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Failed to update activity';
        setError(errorMessage);
        throw err;
      }
    },
    []
  );

  const deleteActivity = useCallback(async (id: string) => {
    try {
      await apiClient.delete(`/activities/${id}`);
      setActivities((prev) => prev.filter((activity) => activity.id !== id));
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to delete activity';
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

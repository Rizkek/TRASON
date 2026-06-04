'use client';

import { useCallback } from 'react';
import useSWR from 'swr';
import { dailyTaskQueries } from '@/services/queries';
import type { DailyTask } from '@/types/database';
import { handleQueryError, logError } from '@/libs/apiErrors';

const CACHE_KEY = 'daily-tasks-today';

export interface UseDailyTasksReturn {
  tasks: DailyTask[];
  isLoading: boolean;
  error: Error | null;
  completedCount: number;
  totalCount: number;
  createTask: (data: Pick<DailyTask, 'title' | 'description' | 'category'>) => Promise<DailyTask | null>;
  toggleTask: (id: string, completed: boolean) => Promise<void>;
  deleteTask: (id: string) => Promise<void>;
  mutate: () => void;
}

export function useDailyTasks(): UseDailyTasksReturn {
  const { data, error, isLoading, mutate } = useSWR<DailyTask[]>(
    CACHE_KEY,
    () => dailyTaskQueries.getTodaysTasks(),
    {
      revalidateOnFocus: true,
      dedupingInterval: 10_000,
    }
  );

  const tasks = data || [];

  const createTask = useCallback(
    async (taskData: Pick<DailyTask, 'title' | 'description' | 'category'>) => {
      try {
        const newTask = await dailyTaskQueries.createTask({
          ...taskData,
          sort_order: tasks.length,
        });
        await mutate();
        return newTask;
      } catch (err) {
        logError(err, 'useDailyTasks.createTask');
        throw handleQueryError(err);
      }
    },
    [tasks.length, mutate]
  );

  const toggleTask = useCallback(
    async (id: string, completed: boolean) => {
      // Optimistic update
      await mutate(
        async (current) => {
          if (!current) return current;
          try {
            await dailyTaskQueries.toggleTask(id, completed);
          } catch (err) {
            logError(err, 'useDailyTasks.toggleTask');
            throw handleQueryError(err);
          }
          return current.map((t) => (t.id === id ? { ...t, completed_today: completed } : t));
        },
        {
          // Optimistically apply before confirm
          optimisticData: tasks.map((t) =>
            t.id === id ? { ...t, completed_today: completed } : t
          ),
          rollbackOnError: true,
          revalidate: false,
        }
      );
    },
    [tasks, mutate]
  );

  const deleteTask = useCallback(
    async (id: string) => {
      await mutate(
        async (current) => {
          if (!current) return current;
          try {
            await dailyTaskQueries.deleteTask(id);
          } catch (err) {
            logError(err, 'useDailyTasks.deleteTask');
            throw handleQueryError(err);
          }
          return current.filter((t) => t.id !== id);
        },
        {
          optimisticData: tasks.filter((t) => t.id !== id),
          rollbackOnError: true,
          revalidate: false,
        }
      );
    },
    [tasks, mutate]
  );

  return {
    tasks,
    isLoading,
    error: error as Error | null,
    completedCount: tasks.filter((t) => t.completed_today).length,
    totalCount: tasks.length,
    createTask,
    toggleTask,
    deleteTask,
    mutate: () => mutate(),
  };
}

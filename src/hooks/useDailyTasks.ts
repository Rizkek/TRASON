'use client';

import { useCallback } from 'react';
import useSWR from 'swr';
import { dailyTaskQueries } from '@/services/activity/dailyTaskQueries';
import type { DailyTask } from '@/types/database';
import { executeMutation } from "@/libs/api/mutationBuilder";

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
      return await executeMutation(
        (async () => {
          const optimisticTask: any = { 
            ...taskData, 
            id: `temp-${Date.now()}`, 
            sort_order: tasks.length, // this is slightly stale potentially but it's fine for sort_order
            completed_today: false,
            created_at: new Date().toISOString()
          };
          await mutate(
            async (current: DailyTask[] | undefined) => {
              const newTask = await dailyTaskQueries.createTask({
                ...taskData,
                sort_order: current ? current.length : 0,
              });
              return current ? [...current, newTask] : [newTask];
            },
            {
              optimisticData: (current: DailyTask[] | undefined) =>
                current ? [...current, optimisticTask] : [optimisticTask],
              rollbackOnError: true,
              revalidate: false,
            }
          );
          return optimisticTask;
        })(),
        'useDailyTasks.createTask'
      );
    },
    [tasks.length, mutate]
  );

  const toggleTask = useCallback(
    async (id: string, completed: boolean) => {
      return await executeMutation(
        (async () => {
          await mutate(
            async (current: DailyTask[] | undefined) => {
              const updatedData = await dailyTaskQueries.toggleTask(id, completed);
              if (!current) return [updatedData];
              return current.map((t) => (t.id === id ? updatedData : t));
            },
            {
              optimisticData: (current: DailyTask[] | undefined) =>
                current ? current.map((t) =>
                  t.id === id ? { ...t, completed_today: completed } : t
                ) : [],
              rollbackOnError: true,
              revalidate: false,
            }
          );
        })(),
        'useDailyTasks.toggleTask'
      );
    },
    [mutate]
  );

  const deleteTask = useCallback(
    async (id: string) => {
      return await executeMutation(
        (async () => {
          await mutate(
            async (current: DailyTask[] | undefined) => {
              await dailyTaskQueries.deleteTask(id);
              if (!current) return current;
              return current.filter((t) => t.id !== id);
            },
            {
              optimisticData: (current: DailyTask[] | undefined) =>
                current ? current.filter((t) => t.id !== id) : [],
              rollbackOnError: true,
              revalidate: false,
            }
          );
        })(),
        'useDailyTasks.deleteTask'
      );
    },
    [mutate]
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

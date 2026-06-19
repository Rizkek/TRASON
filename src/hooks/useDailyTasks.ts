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
                    sort_order: tasks.length,
                    completed_today: false,
                    created_at: new Date().toISOString()
                  };
          await mutate(
                    async (current) => {
                      const newTask = await dailyTaskQueries.createTask({
                        ...taskData,
                        sort_order: tasks.length,
                      });
                      return current ? [...current, newTask] : [newTask];
                    },
                    {
                      optimisticData: [...tasks, optimisticTask],
                      rollbackOnError: true,
                      revalidate: false,
                    }
                  );
          return optimisticTask;
            })(),
            'useDailyTasks.createTask'
          );
    },
    [tasks, mutate]
  );

  const toggleTask = useCallback(
    async (id: string, completed: boolean) => {
      return await executeMutation(
        (async () => {
          await mutate(
            async (current) => {
              if (!current) return current;
              await dailyTaskQueries.toggleTask(id, completed);
              return current.map((t) => (t.id === id ? { ...t, completed_today: completed } : t));
            },
            {
              optimisticData: tasks.map((t) =>
                t.id === id ? { ...t, completed_today: completed } : t
              ),
              rollbackOnError: true,
              revalidate: false,
            }
          );
        })(),
        'useDailyTasks.toggleTask'
      );
    },
    [tasks, mutate]
  );

  const deleteTask = useCallback(
    async (id: string) => {
      return await executeMutation(
        (async () => {
          await mutate(
            async (current) => {
              if (!current) return current;
              await dailyTaskQueries.deleteTask(id);
              return current.filter((t) => t.id !== id);
            },
            {
              optimisticData: tasks.filter((t) => t.id !== id),
              rollbackOnError: true,
              revalidate: false,
            }
          );
        })(),
        'useDailyTasks.deleteTask'
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

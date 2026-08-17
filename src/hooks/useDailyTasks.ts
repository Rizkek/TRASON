'use client';

import { useCallback, useRef } from 'react';
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
  /** IDs of tasks whose toggle is currently in flight (prevents double-click race) */
  pendingToggleIds: Set<string>;
  /** IDs of tasks whose delete is currently in flight */
  pendingDeleteIds: Set<string>;
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
      // Disabled to prevent server data from overwriting optimistic updates
      // when the user switches tabs/windows and comes back (main cause of the
      // "checkbox undo" bug on first interaction after focus change).
      revalidateOnFocus: false,
      dedupingInterval: 10_000,
    }
  );

  const tasks = data || [];

  // Refs (not state) so guards don't trigger extra renders
  const pendingToggleIds = useRef<Set<string>>(new Set());
  const pendingDeleteIds = useRef<Set<string>>(new Set());

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
      // Guard: ignore clicks while a toggle for this task is already in flight
      if (pendingToggleIds.current.has(id)) return;
      pendingToggleIds.current.add(id);
      try {
        await executeMutation(
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
      } finally {
        pendingToggleIds.current.delete(id);
      }
    },
    [mutate]
  );

  const deleteTask = useCallback(
    async (id: string) => {
      // Guard: ignore if delete for this task is already in flight
      if (pendingDeleteIds.current.has(id)) return;
      pendingDeleteIds.current.add(id);
      try {
        await executeMutation(
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
      } finally {
        pendingDeleteIds.current.delete(id);
      }
    },
    [mutate]
  );

  return {
    tasks,
    isLoading,
    error: error as Error | null,
    completedCount: tasks.filter((t) => t.completed_today).length,
    totalCount: tasks.length,
    pendingToggleIds: pendingToggleIds.current,
    pendingDeleteIds: pendingDeleteIds.current,
    createTask,
    toggleTask,
    deleteTask,
    mutate: () => mutate(),
  };
}

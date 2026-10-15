'use client';

import { useCallback, useRef, useState, type Dispatch, type SetStateAction } from 'react';
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

  // The ref blocks a double click synchronously (state updates are async); the state is what makes
  // the rows re-render while a request is running. A Set kept only in a ref never triggers a render.
  const inFlight = useRef(new Set<string>());
  const [pendingToggleIds, setPendingToggleIds] = useState<Set<string>>(new Set());
  const [pendingDeleteIds, setPendingDeleteIds] = useState<Set<string>>(new Set());

  /**
   * Patches the list currently displayed. SWR's `optimisticData` and async mutators receive the last
   * *committed* data, which excludes other mutations still in flight, so using them let one checkbox
   * wipe another's pending state. A plain updater always works on the displayed data.
   */
  const patchCache = useCallback(
    (updater: (current: DailyTask[]) => DailyTask[]) =>
      mutate((current) => updater(current ?? []), { revalidate: false }),
    [mutate]
  );

  const runGuarded = useCallback(
    async (key: string, id: string, setPending: Dispatch<SetStateAction<Set<string>>>, run: () => Promise<void>) => {
      if (inFlight.current.has(key)) return;
      inFlight.current.add(key);
      setPending((prev) => new Set(prev).add(id));
      try {
        await run();
      } finally {
        inFlight.current.delete(key);
        setPending((prev) => {
          const next = new Set(prev);
          next.delete(id);
          return next;
        });
      }
    },
    []
  );

  const createTask = useCallback(
    async (taskData: Pick<DailyTask, 'title' | 'description' | 'category'>) => {
      const tempId = `temp-${Date.now()}`;
      const sortOrder = tasks.length;
      const optimisticTask = {
        ...taskData,
        id: tempId,
        sort_order: sortOrder,
        completed_today: false,
        created_at: new Date().toISOString(),
      } as DailyTask;

      await patchCache((current) => [...current, optimisticTask]);

      try {
        const saved = await executeMutation(
          dailyTaskQueries.createTask({ ...taskData, sort_order: sortOrder }),
          'useDailyTasks.createTask'
        );
        await patchCache((current) => current.map((t) => (t.id === tempId ? saved : t)));
        return saved;
      } catch (err) {
        await patchCache((current) => current.filter((t) => t.id !== tempId));
        throw err;
      }
    },
    [tasks.length, patchCache]
  );

  const toggleTask = useCallback(
    (id: string, completed: boolean) =>
      runGuarded(`toggle:${id}`, id, setPendingToggleIds, async () => {
        const patchTask = (changes: Partial<DailyTask>) =>
          patchCache((current) => current.map((t) => (t.id === id ? { ...t, ...changes } : t)));

        await patchTask({ completed_today: completed });

        const saved = await executeMutation(
          dailyTaskQueries.toggleTask(id, completed),
          'useDailyTasks.toggleTask',
          { throwOnError: false }
        );

        await patchTask(saved ?? { completed_today: !completed });
      }),
    [runGuarded, patchCache]
  );

  const deleteTask = useCallback(
    (id: string) =>
      runGuarded(`delete:${id}`, id, setPendingDeleteIds, async () => {
        let removed: DailyTask | undefined;
        await patchCache((current) => {
          removed = current.find((t) => t.id === id);
          return current.filter((t) => t.id !== id);
        });

        const ok = await executeMutation(
          dailyTaskQueries.deleteTask(id).then(() => true),
          'useDailyTasks.deleteTask',
          { throwOnError: false }
        );

        if (!ok && removed) {
          const restored = removed;
          await patchCache((current) => [...current, restored].sort((a, b) => a.sort_order - b.sort_order));
        }
      }),
    [runGuarded, patchCache]
  );

  return {
    tasks,
    isLoading,
    error: error as Error | null,
    completedCount: tasks.filter((t) => t.completed_today).length,
    totalCount: tasks.length,
    pendingToggleIds,
    pendingDeleteIds,
    createTask,
    toggleTask,
    deleteTask,
    mutate: () => mutate(),
  };
}

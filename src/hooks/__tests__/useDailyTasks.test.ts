import React from 'react';
import { renderHook, act, waitFor } from '@testing-library/react';
import { SWRConfig } from 'swr';
import { useDailyTasks } from '@/hooks/useDailyTasks';
import { dailyTaskQueries } from '@/services/activity/dailyTaskQueries';
import type { DailyTask } from '@/types/database';

jest.mock('@/services/activity/dailyTaskQueries', () => ({
  dailyTaskQueries: {
    getTodaysTasks: jest.fn(),
    createTask: jest.fn(),
    toggleTask: jest.fn(),
    deleteTask: jest.fn(),
  },
}));

const queries = dailyTaskQueries as jest.Mocked<typeof dailyTaskQueries>;

const makeTask = (id: string, sortOrder: number, done = false) =>
  ({ id, title: id, sort_order: sortOrder, completed_today: done }) as unknown as DailyTask;

function deferred<T>() {
  let resolve!: (value: T) => void;
  let reject!: (reason?: unknown) => void;
  const promise = new Promise<T>((res, rej) => {
    resolve = res;
    reject = rej;
  });
  return { promise, resolve, reject };
}

// A fresh cache per test so state never leaks between cases.
const wrapper = ({ children }: { children: React.ReactNode }) =>
  React.createElement(SWRConfig, { value: { provider: () => new Map() } }, children);

async function renderLoaded(initial: DailyTask[]) {
  queries.getTodaysTasks.mockResolvedValue(initial);
  const hook = renderHook(() => useDailyTasks(), { wrapper });
  await waitFor(() => expect(hook.result.current.tasks).toHaveLength(initial.length));
  return hook;
}

describe('useDailyTasks', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    jest.spyOn(console, 'error').mockImplementation(() => {});
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('keeps an earlier checkbox checked while a later toggle is still in flight', async () => {
    const { result } = await renderLoaded([makeTask('a', 0), makeTask('b', 1)]);
    const first = deferred<DailyTask>();
    const second = deferred<DailyTask>();
    queries.toggleTask.mockReturnValueOnce(first.promise).mockReturnValueOnce(second.promise);

    let toggleA!: Promise<void>;
    let toggleB!: Promise<void>;
    act(() => {
      toggleA = result.current.toggleTask('a', true);
    });
    act(() => {
      toggleB = result.current.toggleTask('b', true);
    });

    // Both are visibly checked before either request has finished.
    await waitFor(() => expect(result.current.completedCount).toBe(2));
    expect(result.current.pendingToggleIds.has('a')).toBe(true);
    expect(result.current.pendingToggleIds.has('b')).toBe(true);

    await act(async () => {
      first.resolve(makeTask('a', 0, true));
      second.resolve(makeTask('b', 1, true));
      await Promise.all([toggleA, toggleB]);
    });

    expect(result.current.completedCount).toBe(2);
    expect(result.current.pendingToggleIds.size).toBe(0);
  });

  it('does not undo a pending toggle when another task is deleted', async () => {
    const { result } = await renderLoaded([makeTask('a', 0), makeTask('b', 1)]);
    const toggle = deferred<DailyTask>();
    queries.toggleTask.mockReturnValueOnce(toggle.promise);
    queries.deleteTask.mockResolvedValueOnce(undefined);

    let toggleA!: Promise<void>;
    act(() => {
      toggleA = result.current.toggleTask('a', true);
    });
    await waitFor(() => expect(result.current.completedCount).toBe(1));

    await act(async () => {
      await result.current.deleteTask('b');
    });

    expect(result.current.tasks.map((t) => t.id)).toEqual(['a']);
    expect(result.current.completedCount).toBe(1);

    await act(async () => {
      toggle.resolve(makeTask('a', 0, true));
      await toggleA;
    });
    expect(result.current.completedCount).toBe(1);
  });

  it('reverts only the failed toggle', async () => {
    const { result } = await renderLoaded([makeTask('a', 0), makeTask('b', 1)]);
    queries.toggleTask
      .mockRejectedValueOnce(new Error('network down'))
      .mockResolvedValueOnce(makeTask('b', 1, true));

    await act(async () => {
      await Promise.all([result.current.toggleTask('a', true), result.current.toggleTask('b', true)]);
    });

    const byId = Object.fromEntries(result.current.tasks.map((t) => [t.id, t.completed_today]));
    expect(byId).toEqual({ a: false, b: true });
  });

  it('ignores a second click on the same task while its request is running', async () => {
    const { result } = await renderLoaded([makeTask('a', 0)]);
    const toggle = deferred<DailyTask>();
    queries.toggleTask.mockReturnValueOnce(toggle.promise);

    let first!: Promise<void>;
    act(() => {
      first = result.current.toggleTask('a', true);
      void result.current.toggleTask('a', false);
    });

    await act(async () => {
      toggle.resolve(makeTask('a', 0, true));
      await first;
    });

    expect(queries.toggleTask).toHaveBeenCalledTimes(1);
    expect(result.current.completedCount).toBe(1);
  });

  it('restores a task when deleting it fails', async () => {
    const { result } = await renderLoaded([makeTask('a', 0), makeTask('b', 1)]);
    queries.deleteTask.mockRejectedValueOnce(new Error('network down'));

    await act(async () => {
      await result.current.deleteTask('a');
    });

    expect(result.current.tasks.map((t) => t.id)).toEqual(['a', 'b']);
  });
});

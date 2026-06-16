'use client';

import useSWR from 'swr';
import { useMemo } from 'react';
import { analyticsQueries } from '@/services/analyticsQueries';
import { useDailyTasks } from '@/hooks/useDailyTasks';
import { calculateStreak, StreakData } from '@/libs/analytics/streakEngine';

export function useStreak(): {
  streakData: StreakData | null;
  isLoading: boolean;
} {
  const { totalCount, isLoading: taskLoading } = useDailyTasks();
  
  const { data: logs, isLoading: logsLoading } = useSWR(
    'task-logs-30-days',
    () => analyticsQueries.getTaskLogs30Days(),
    { revalidateOnFocus: true }
  );

  const streakData = useMemo(() => {
    if (logsLoading || taskLoading || !logs) return null;
    return calculateStreak(logs, totalCount, 0.8);
  }, [logs, totalCount, logsLoading, taskLoading]);

  return {
    streakData,
    isLoading: logsLoading || taskLoading,
  };
}

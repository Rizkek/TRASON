'use client';

import { useCallback } from 'react';
import useSWR from 'swr';
import { workoutSessionQueries, personalRecordQueries } from '@/services/workoutQueries';
import { activityQueries } from '@/services/queries';
import type { WorkoutSession, PersonalRecord, Activity } from '@/types/database';
import { CACHE_KEYS } from '@/libs/cacheKeys';
import { SWR_CONFIG } from '@/config/swr';
import { handleQueryError, logError } from '@/libs/apiErrors';

/**
 * Derived sport statistics from a list of activities + sessions
 */
export interface SportStats {
  totalSessions: number;
  totalMinutes: number;
  totalVolumeTons: number;    // total weight lifted in tonnes
  totalDistanceKm: number;    // total running/cycling distance
  avgSessionMinutes: number;
  thisWeekSessions: number;
  thisWeekMinutes: number;
}

function computeSportStats(sessions: WorkoutSession[], activities: Activity[]): SportStats {
  const now = new Date();
  const monday = new Date(now);
  const dayOfWeek = now.getDay();
  monday.setDate(now.getDate() - (dayOfWeek === 0 ? 6 : dayOfWeek - 1));
  monday.setHours(0, 0, 0, 0);

  const thisWeekSessions = sessions.filter(
    (s) => new Date(s.session_date) >= monday
  );

  const totalMinutes = sessions.reduce((sum, s) => sum + (s.duration_minutes || 0), 0);
  const thisWeekMinutes = thisWeekSessions.reduce((sum, s) => sum + (s.duration_minutes || 0), 0);

  return {
    totalSessions: sessions.length,
    totalMinutes,
    totalVolumeTons: 0,     // computed from exercise logs if needed
    totalDistanceKm: 0,
    avgSessionMinutes: sessions.length > 0 ? Math.round(totalMinutes / sessions.length) : 0,
    thisWeekSessions: thisWeekSessions.length,
    thisWeekMinutes,
  };
}

/**
 * useSportHistory — fetches workout sessions, activities, and personal records
 * for the Sport dashboard page.
 */
export const useSportHistory = (startDate?: Date, endDate?: Date) => {
  const today = new Date();
  const defaultStart = new Date(today);
  defaultStart.setMonth(today.getMonth() - 3);  // default: 3 months back

  const start = startDate || defaultStart;
  const end = endDate || today;
  const startStr = start.toISOString().split('T')[0];
  const endStr = end.toISOString().split('T')[0];

  // Fetch workout sessions
  const sessionsKey = CACHE_KEYS.sport.sessions(startStr, endStr);
  const { data: sessions, isLoading: sessionsLoading, mutate: mutateSessions } = useSWR(
    sessionsKey,
    async () => {
      try {
        return await workoutSessionQueries.getSessions(start, end);
      } catch (err) {
        logError(err, 'useSportHistory.fetchSessions');
        throw handleQueryError(err);
      }
    },
    SWR_CONFIG
  );

  // Fetch recent sessions (last 10) for the history list
  const recentKey = CACHE_KEYS.sport.recentSessions();
  const { data: recentSessions, isLoading: recentLoading, mutate: mutateRecent } = useSWR(
    recentKey,
    async () => {
      try {
        return await workoutSessionQueries.getRecentSessions(10);
      } catch (err) {
        logError(err, 'useSportHistory.fetchRecent');
        throw handleQueryError(err);
      }
    },
    SWR_CONFIG
  );

  // Fetch PR board (always fetch latest)
  const prKey = CACHE_KEYS.sport.prBoard();
  const { data: prBoard, isLoading: prLoading, mutate: mutatePR } = useSWR(
    prKey,
    async () => {
      try {
        return await personalRecordQueries.getPRBoard();
      } catch (err) {
        logError(err, 'useSportHistory.fetchPR');
        throw handleQueryError(err);
      }
    },
    SWR_CONFIG
  );

  const isLoading = sessionsLoading || recentLoading || prLoading;

  const stats = computeSportStats(sessions || [], []);

  const mutateAll = useCallback(async () => {
    await Promise.all([mutateSessions(), mutateRecent(), mutatePR()]);
  }, [mutateSessions, mutateRecent, mutatePR]);

  const logSession = useCallback(
    async (sessionData: Omit<WorkoutSession, 'id' | 'user_id' | 'created_at' | 'updated_at' | 'deleted_at'>) => {
      try {
        const session = await workoutSessionQueries.logSession(sessionData);
        await mutateAll();
        return session;
      } catch (err) {
        logError(err, 'useSportHistory.logSession');
        throw handleQueryError(err);
      }
    },
    [mutateAll]
  );

  const deleteSession = useCallback(
    async (sessionId: string) => {
      try {
        await workoutSessionQueries.deleteSession(sessionId);
        await mutateAll();
      } catch (err) {
        logError(err, 'useSportHistory.deleteSession');
        throw handleQueryError(err);
      }
    },
    [mutateAll]
  );

  return {
    sessions: sessions || [],
    recentSessions: recentSessions || [],
    prBoard: prBoard || [],
    stats,
    isLoading,
    mutate: mutateAll,
    logSession,
    deleteSession,
  };
};

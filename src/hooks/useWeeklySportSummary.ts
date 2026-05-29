'use client';

import useSWR from 'swr';
import { useAuthStore } from '@/store/authStore';
import { useActivity } from './useActivity';

export interface WeeklySportSummary {
  totalSessions: number;
  totalMinutes: number;
  activeDays: number;
  dayActivity: number[]; // [Mon, Tue, Wed, Thu, Fri, Sat, Sun] — duration in minutes per day
  topActivity: string | null;
  streak: number; // consecutive days with sport activity
}

function getWeekBounds() {
  const now = new Date();
  const day = now.getDay(); // 0=Sun
  const diffToMon = (day === 0 ? -6 : 1 - day);
  const mon = new Date(now);
  mon.setDate(now.getDate() + diffToMon);
  mon.setHours(0, 0, 0, 0);
  const sun = new Date(mon);
  sun.setDate(mon.getDate() + 6);
  sun.setHours(23, 59, 59, 999);
  return { start: mon, end: sun };
}

export const useWeeklySportSummary = (): { summary: WeeklySportSummary; isLoading: boolean } => {
  const { start, end } = getWeekBounds();
  const { activities, isLoading } = useActivity(start, end);

  const SPORT_CATEGORIES = ['sport', 'exercise'];

  const sportActivities = activities.filter(
    (a) => a.category && SPORT_CATEGORIES.includes(a.category.toLowerCase())
  );

  // dayActivity index: 0=Mon, 1=Tue, ..., 6=Sun
  const dayActivity: number[] = [0, 0, 0, 0, 0, 0, 0];

  const typeFreq: Record<string, number> = {};

  for (const act of sportActivities) {
    const d = new Date(act.start_time);
    const jsDay = d.getDay(); // 0=Sun, 1=Mon, ..., 6=Sat
    const idx = jsDay === 0 ? 6 : jsDay - 1; // convert to Mon=0
    dayActivity[idx] += act.duration_minutes ?? 0;

    if (act.category) {
      typeFreq[act.category] = (typeFreq[act.category] || 0) + 1;
    }
  }

  const totalSessions = sportActivities.length;
  const totalMinutes = sportActivities.reduce((s, a) => s + (a.duration_minutes ?? 0), 0);
  const activeDays = dayActivity.filter((m) => m > 0).length;
  const topActivity =
    Object.entries(typeFreq).sort((a, b) => b[1] - a[1])[0]?.[0] ?? null;

  // Simple streak: count consecutive days ending today (within current week)
  // Note: this is a week-scoped streak. For a full historical streak,
  // a separate query spanning 30+ days would be needed.
  const todayLocal = new Date();
  let streak = 0;
  for (let i = 0; i < 7; i++) {
    const checkDate = new Date(todayLocal);
    checkDate.setDate(todayLocal.getDate() - i);
    const checkStr = checkDate.toDateString();
    const hasActivity = sportActivities.some(
      (a) => new Date(a.start_time).toDateString() === checkStr
    );
    if (hasActivity) {
      streak++;
    } else {
      // Stop at first gap, unless it's today (give today a pass if it's early)
      if (i > 0) break;
    }
  }

  return {
    summary: { totalSessions, totalMinutes, activeDays, dayActivity, topActivity, streak },
    isLoading,
  };
};

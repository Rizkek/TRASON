import { Activity } from '@/services/supabase/supabaseClient';

export const CATEGORY_OPTIONS = [
  'work',
  'study',
  'exercise',
  'sport',
  'meals',
  'social',
  'rest',
  'personal',
  'other',
];

export const HOURS = Array.from({ length: 24 }, (_, i) => i);
export const CELL_HEIGHT = 64; // px per hour row

export function formatHour(h: number) {
  if (h === 0) return '12 AM';
  if (h < 12) return `${h} AM`;
  if (h === 12) return '12 PM';
  return `${h - 12} PM`;
}

export function getDurationLabel(activity: Activity) {
  if (!activity.end_time) return null;
  const mins = Math.round(
    (new Date(activity.end_time).getTime() - new Date(activity.start_time).getTime()) / 60000
  );
  if (mins < 60) return `${mins}m`;
  const h = Math.floor(mins / 60);
  const m = mins % 60;
  return m > 0 ? `${h}h ${m}m` : `${h}h`;
}

/** Monday to Sunday of the current week, or `weekOffset` weeks away from it. */
export function getWeekBounds(weekOffset = 0) {
  const now = new Date();
  const day = now.getDay();
  const diffToMon = day === 0 ? -6 : 1 - day;
  const start = new Date(now.getFullYear(), now.getMonth(), now.getDate() + diffToMon + weekOffset * 7);
  start.setHours(0, 0, 0, 0);

  const end = new Date(start);
  end.setDate(start.getDate() + 6);
  end.setHours(23, 59, 59, 999);

  return { start, end };
}

export function getDaysOfWeek(start: Date): Date[] {
  return Array.from({ length: 7 }, (_, i) => {
    const d = new Date(start);
    d.setDate(start.getDate() + i);
    return d;
  });
}

export interface ActivityFormData {
  title: string;
  description: string;
  category: string;
  dayIndex: number; // 0 = Mon, 1 = Tue, ..., 6 = Sun
  start_hour: number;
  start_minute: number;
  duration_minutes: number;
  applyToAllDays: boolean;
  isWeeklyRoutine: boolean;
}

export const defaultActivityForm: ActivityFormData = {
  title: '',
  description: '',
  category: '',
  dayIndex: (() => {
    const d = new Date().getDay();
    return d === 0 ? 6 : d - 1; // 0=Mon, 6=Sun
  })(),
  start_hour: new Date().getHours(),
  start_minute: 0,
  duration_minutes: 60,
  applyToAllDays: false,
  isWeeklyRoutine: false,
};

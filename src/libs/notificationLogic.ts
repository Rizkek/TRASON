export function getReminderNotifyWindows(
  dueDatetime?: string | null,
  notifyTimes: number[] = [],
  toleranceMinutes = 30,
): Array<{ triggerAt: Date; dueAt: Date }> {
  if (!dueDatetime) {
    return [];
  }

  const dueAt = new Date(dueDatetime);
  if (Number.isNaN(dueAt.getTime())) {
    return [];
  }

  const effectiveTolerance = Number.isFinite(toleranceMinutes) ? toleranceMinutes : 30;
  const normalizedTimes = Array.from(
    new Set((notifyTimes.length > 0 ? notifyTimes : [60, 180, 360]).map((minutes) => Number(minutes)))
  ).filter((minutes) => Number.isFinite(minutes) && minutes >= 0);

  return normalizedTimes.map((minutes) => ({
    triggerAt: new Date(dueAt.getTime() - minutes * 60 * 1000),
    dueAt,
  }));
}

export function isReminderDue(
  now: Date,
  dueDatetime?: string | null,
  notifyTimes: number[] = [],
  toleranceMinutes = 30,
): boolean {
  if (!dueDatetime) {
    return false;
  }

  const dueAt = new Date(dueDatetime);
  if (Number.isNaN(dueAt.getTime())) {
    return false;
  }

  const triggerWindows = getReminderNotifyWindows(dueDatetime, notifyTimes, toleranceMinutes);
  if (triggerWindows.length === 0) {
    return Math.abs(dueAt.getTime() - now.getTime()) <= toleranceMinutes * 60 * 1000;
  }

  const toleranceMs = toleranceMinutes * 60 * 1000;
  return triggerWindows.some(({ triggerAt }) => Math.abs(triggerAt.getTime() - now.getTime()) <= toleranceMs);
}

export function isReminderPastDue(
  now: Date,
  reminder: { due_datetime?: string | null; due_date?: string | null; due_time?: string | null },
): boolean {
  const dueAt = reminder.due_datetime
    ? new Date(reminder.due_datetime)
    : reminder.due_date
      ? new Date(`${reminder.due_date}T${reminder.due_time || '23:59:59'}`)
      : null;

  return dueAt !== null && !Number.isNaN(dueAt.getTime()) && dueAt.getTime() <= now.getTime();
}

export function shouldSendTaskReminder(
  now: Date,
  userTimezone: string,
  task: { completed_today: boolean; last_reset_date?: string | null },
  activeHours: { start: number; end: number } = { start: 6, end: 23 },
): boolean {
  const localNow = new Date(now.toLocaleString('en-US', { timeZone: userTimezone }));
  const currentHour = localNow.getHours();
  const todayStr = localNow.toLocaleDateString('en-CA');

  const isIncomplete = !task.completed_today || (task.completed_today && task.last_reset_date !== todayStr);
  const inWindow = currentHour >= activeHours.start && currentHour <= activeHours.end;

  return isIncomplete && inWindow;
}

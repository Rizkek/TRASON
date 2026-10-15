const DEFAULT_NOTIFY_MINUTES = [60, 180, 360];

export interface DueNotification {
  notifyMinutes: number;
  triggerAt: Date;
  dueAt: Date;
}

/**
 * A notification is due once its trigger time has passed and stays due for `catchupMinutes`,
 * so a missed cron run is recovered on the next one. It never fires before its trigger time.
 * Exactly-once delivery is the caller's job (see the reminder_notifications ledger).
 */
export function getDueNotifications(
  now: Date,
  dueDatetime?: string | null,
  notifyTimes: number[] = [],
  catchupMinutes = 15,
): DueNotification[] {
  if (!dueDatetime) return [];

  const dueAt = new Date(dueDatetime);
  if (Number.isNaN(dueAt.getTime())) return [];

  const minutesList = Array.from(
    new Set((notifyTimes.length > 0 ? notifyTimes : DEFAULT_NOTIFY_MINUTES).map(Number))
  ).filter((minutes) => Number.isFinite(minutes) && minutes >= 0);

  const catchupMs = catchupMinutes * 60 * 1000;

  return minutesList
    .map((notifyMinutes) => ({
      notifyMinutes,
      dueAt,
      triggerAt: new Date(dueAt.getTime() - notifyMinutes * 60 * 1000),
    }))
    .filter(({ triggerAt }) => {
      const elapsed = now.getTime() - triggerAt.getTime();
      return elapsed >= 0 && elapsed <= catchupMs;
    });
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

/**
 * True when the due time is earlier than the start of the current minute. The time input has minute
 * precision and defaults to "now", so a due time within the current minute must still be accepted.
 */
export function hasDueTimePassed(dueDatetime: string | Date, now: Date = new Date()): boolean {
  const due = new Date(dueDatetime).getTime();
  if (Number.isNaN(due)) return false;

  const startOfMinute = Math.floor(now.getTime() / 60_000) * 60_000;
  return due < startOfMinute;
}

/** Calendar date (YYYY-MM-DD) and hour (0-23) of `now` in the given IANA timezone; falls back to UTC. */
export function getLocalDateHour(now: Date, timeZone: string): { date: string; hour: number } {
  try {
    const parts = new Intl.DateTimeFormat('en-CA', {
      timeZone,
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      hourCycle: 'h23',
    }).formatToParts(now);
    const part = (type: string) => parts.find((p) => p.type === type)?.value ?? '';
    return { date: `${part('year')}-${part('month')}-${part('day')}`, hour: Number(part('hour')) };
  } catch {
    return timeZone === 'UTC' ? { date: now.toISOString().slice(0, 10), hour: now.getUTCHours() } : getLocalDateHour(now, 'UTC');
  }
}

export function shouldSendTaskReminder(
  now: Date,
  userTimezone: string,
  task: { completed_today: boolean; last_reset_date?: string | null },
  activeHours: { start: number; end: number } = { start: 6, end: 23 },
): boolean {
  const { date: today, hour } = getLocalDateHour(now, userTimezone);

  const isIncomplete = !task.completed_today || task.last_reset_date !== today;
  const inWindow = hour >= activeHours.start && hour <= activeHours.end;

  return isIncomplete && inWindow;
}

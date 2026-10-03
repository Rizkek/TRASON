import { isReminderPastDue } from '@/libs/notificationLogic';

describe('isReminderPastDue', () => {
  const now = new Date('2026-10-03T10:00:00.000Z');

  it('returns true after the reminder deadline', () => {
    expect(isReminderPastDue(now, { due_datetime: '2026-10-03T09:59:59.000Z' })).toBe(true);
  });

  it('treats the exact deadline as expired', () => {
    expect(isReminderPastDue(now, { due_datetime: now.toISOString() })).toBe(true);
  });

  it('keeps future reminders active', () => {
    expect(isReminderPastDue(now, { due_datetime: '2026-10-03T10:00:01.000Z' })).toBe(false);
  });
});
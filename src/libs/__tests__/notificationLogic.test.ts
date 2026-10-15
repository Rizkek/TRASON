import {
  getDueNotifications,
  getLocalDateHour,
  hasDueTimePassed,
  isReminderPastDue,
  shouldSendTaskReminder,
} from '@/libs/notificationLogic';

describe('hasDueTimePassed', () => {
  const now = new Date('2026-10-15T10:30:45.000Z');

  it('accepts a due time within the current minute', () => {
    expect(hasDueTimePassed('2026-10-15T10:30:00.000Z', now)).toBe(false);
  });

  it('rejects a due time in an earlier minute', () => {
    expect(hasDueTimePassed('2026-10-15T10:29:59.000Z', now)).toBe(true);
  });

  it('accepts future due times', () => {
    expect(hasDueTimePassed('2026-10-15T10:31:00.000Z', now)).toBe(false);
  });

  it('does not flag an unparseable value', () => {
    expect(hasDueTimePassed('not-a-date', now)).toBe(false);
  });
});

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

describe('getDueNotifications', () => {
  const due = '2026-10-15T12:00:00.000Z';

  it('does not fire before the trigger time', () => {
    const now = new Date('2026-10-15T10:59:59.000Z');
    expect(getDueNotifications(now, due, [60])).toEqual([]);
  });

  it('fires at the trigger time', () => {
    const now = new Date('2026-10-15T11:00:00.000Z');
    expect(getDueNotifications(now, due, [60]).map((n) => n.notifyMinutes)).toEqual([60]);
  });

  it('keeps firing during the catch-up window and then stops', () => {
    expect(getDueNotifications(new Date('2026-10-15T11:15:00.000Z'), due, [60])).toHaveLength(1);
    expect(getDueNotifications(new Date('2026-10-15T11:15:01.000Z'), due, [60])).toHaveLength(0);
  });

  it('returns only the notify times whose window is open', () => {
    const now = new Date('2026-10-15T09:05:00.000Z');
    expect(getDueNotifications(now, due, [60, 180, 360]).map((n) => n.notifyMinutes)).toEqual([180]);
  });

  it('supports notify time 0 as the due moment', () => {
    const now = new Date('2026-10-15T12:03:00.000Z');
    expect(getDueNotifications(now, due, [0]).map((n) => n.notifyMinutes)).toEqual([0]);
  });

  it('falls back to default notify times and ignores invalid ones', () => {
    const now = new Date('2026-10-15T11:00:00.000Z');
    expect(getDueNotifications(now, due, []).map((n) => n.notifyMinutes)).toEqual([60]);
    expect(getDueNotifications(now, due, [-5, Number.NaN, 60]).map((n) => n.notifyMinutes)).toEqual([60]);
  });

  it('returns nothing for a missing or invalid due date', () => {
    const now = new Date('2026-10-15T11:00:00.000Z');
    expect(getDueNotifications(now, null, [60])).toEqual([]);
    expect(getDueNotifications(now, 'not-a-date', [60])).toEqual([]);
  });
});

describe('getLocalDateHour', () => {
  it('resolves date and hour in the user timezone', () => {
    const now = new Date('2026-10-15T18:30:00.000Z');
    expect(getLocalDateHour(now, 'Asia/Jakarta')).toEqual({ date: '2026-10-16', hour: 1 });
    expect(getLocalDateHour(now, 'UTC')).toEqual({ date: '2026-10-15', hour: 18 });
  });

  it('falls back to UTC for an invalid timezone', () => {
    const now = new Date('2026-10-15T18:30:00.000Z');
    expect(getLocalDateHour(now, 'Not/AZone')).toEqual({ date: '2026-10-15', hour: 18 });
  });
});

describe('shouldSendTaskReminder', () => {
  const task = { completed_today: false, last_reset_date: '2026-10-15' };

  it('sends inside the active hours of the user timezone', () => {
    expect(shouldSendTaskReminder(new Date('2026-10-15T05:00:00.000Z'), 'Asia/Jakarta', task)).toBe(true);
  });

  it('stays silent outside the active hours', () => {
    expect(shouldSendTaskReminder(new Date('2026-10-14T18:00:00.000Z'), 'Asia/Jakarta', task)).toBe(false);
  });

  it('stays silent when the task was completed today', () => {
    const done = { completed_today: true, last_reset_date: '2026-10-15' };
    expect(shouldSendTaskReminder(new Date('2026-10-15T05:00:00.000Z'), 'Asia/Jakarta', done)).toBe(false);
  });
});

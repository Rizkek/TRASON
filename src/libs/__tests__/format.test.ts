import { formatReminderDue } from '@/libs/format';

describe('formatReminderDue', () => {
  const now = new Date('2026-11-05T03:00:00.000Z');
  const timezone = 'Asia/Jakarta';

  it('shows only the time on the same day', () => {
    const label = formatReminderDue({ due_datetime: '2026-11-05T07:30:00.000Z' }, 'en-GB', timezone, now);
    expect(label).toBe('14:30');
  });

  it('shows the date for another day, which a reminder due next month needs', () => {
    const label = formatReminderDue({ due_datetime: '2026-12-10T07:30:00.000Z' }, 'en-GB', timezone, now);
    expect(label).toContain('10 Dec');
    expect(label).toContain('14:30');
    expect(label).not.toContain('2026');
  });

  it('adds the year when it differs from the current one', () => {
    const label = formatReminderDue({ due_datetime: '2027-01-10T07:30:00.000Z' }, 'en-GB', timezone, now);
    expect(label).toContain('2027');
  });

  it('uses the profile timezone to decide the day', () => {
    // 18:00 UTC on Nov 5 is already Nov 6 in Jakarta.
    const label = formatReminderDue({ due_datetime: '2026-11-05T18:00:00.000Z' }, 'en-GB', timezone, now);
    expect(label).toContain('6 Nov');
  });

  it('always shows the full date without a reference time', () => {
    const label = formatReminderDue({ due_datetime: '2026-11-05T07:30:00.000Z' }, 'en-GB', timezone);
    expect(label).toContain('5 Nov 2026');
  });

  it('shows no invented time for a date-only reminder, even today', () => {
    const label = formatReminderDue({ due_date: '2026-11-05' }, 'en-GB', timezone, now);
    expect(label).toBe('5 Nov');
  });

  it('returns null without a due time', () => {
    expect(formatReminderDue({}, 'en-GB', timezone, now)).toBeNull();
  });
});

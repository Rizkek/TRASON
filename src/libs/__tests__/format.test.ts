import { formatReminderDue, roundToCurrency, sanitizeAmountInput } from '@/libs/format';

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

describe('roundToCurrency', () => {
  it('keeps cents for currencies that have them', () => {
    expect(roundToCurrency(12.5, 'USD')).toBe(12.5);
    expect(roundToCurrency(12.345, 'USD')).toBe(12.35);
  });

  it('rounds to whole units for currencies without cents', () => {
    expect(roundToCurrency(166500.4, 'IDR')).toBe(166500);
    expect(roundToCurrency(1999.5, 'JPY')).toBe(2000);
  });
});

describe('sanitizeAmountInput', () => {
  it('keeps digits only for IDR, so a thousands dot does not become a decimal', () => {
    expect(sanitizeAmountInput('166.500', 'IDR')).toBe('166500');
    expect(sanitizeAmountInput('1a2b3', 'IDR')).toBe('123');
  });

  it('allows one decimal separator and two cents for USD', () => {
    expect(sanitizeAmountInput('12.50', 'USD')).toBe('12.50');
    expect(sanitizeAmountInput('12,5', 'USD')).toBe('12.5');
    expect(sanitizeAmountInput('12.345', 'USD')).toBe('12.34');
    expect(sanitizeAmountInput('12.', 'USD')).toBe('12.');
  });

  it('treats earlier separators as thousands marks', () => {
    expect(sanitizeAmountInput('1,250.50', 'USD')).toBe('1250.50');
  });

  it('drops letters and signs', () => {
    expect(sanitizeAmountInput('-$12.5x', 'USD')).toBe('12.5');
  });
});

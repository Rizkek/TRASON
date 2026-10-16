import { addBillingCycle, formatDateOnly, getDateRange } from '@/libs/date';
import { getLocalISODate } from '@/libs/format';

describe('date helpers', () => {
  it('resolves the calendar day in the requested timezone, not in UTC', () => {
    const instant = new Date('2026-07-13T20:00:00Z');
    expect(getLocalISODate(instant, 'UTC')).toBe('2026-07-13');
    expect(getLocalISODate(instant, 'Asia/Jakarta')).toBe('2026-07-14');
    expect(getLocalISODate(instant, 'America/Los_Angeles')).toBe('2026-07-13');
  });

  it('advances a billing date by one cycle without drifting a day', () => {
    expect(addBillingCycle('2026-03-01', 'monthly')).toBe('2026-04-01');
    expect(addBillingCycle('2026-03-01', 'weekly')).toBe('2026-03-08');
    expect(addBillingCycle('2026-03-01', 'yearly')).toBe('2027-03-01');
  });

  it('clamps month steps to the last day of the target month', () => {
    expect(addBillingCycle('2026-01-31', 'monthly')).toBe('2026-02-28');
    expect(addBillingCycle('2028-02-29', 'yearly')).toBe('2029-02-28');
    expect(addBillingCycle('2026-12-15', 'monthly')).toBe('2027-01-15');
  });

  it('formats a Date to a YYYY-MM-DD string without timezone drift', () => {
    const date = new Date(2026, 6, 13, 23, 59, 59);
    expect(formatDateOnly(date)).toBe('2026-07-13');
  });

  it('returns a month range that is inclusive of the whole selected month', () => {
    const { start, end } = getDateRange(6, 2026);
    expect(formatDateOnly(start)).toBe('2026-07-01');
    expect(formatDateOnly(end)).toBe('2026-07-31');
  });
});

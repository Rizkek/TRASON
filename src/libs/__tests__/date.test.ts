import { formatDateOnly, getDateRange } from '@/libs/date';

describe('date helpers', () => {
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

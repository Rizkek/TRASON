export const formatDateOnly = (value: Date | string): string => {
  if (typeof value === 'string') {
    if (/^\d{4}-\d{2}-\d{2}$/.test(value)) {
      return value;
    }
    const parsed = new Date(value);
    if (!Number.isNaN(parsed.getTime())) {
      return `${parsed.getFullYear()}-${String(parsed.getMonth() + 1).padStart(2, '0')}-${String(parsed.getDate()).padStart(2, '0')}`;
    }
    return value;
  }

  const year = value.getFullYear();
  const month = String(value.getMonth() + 1).padStart(2, '0');
  const day = String(value.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

export type BillingCycle = 'monthly' | 'yearly' | 'weekly';

// Works on the calendar date in UTC: a date-only string parses as UTC midnight, so local setters
// would land on the previous day west of UTC. Month steps clamp to the last day (Jan 31 -> Feb 28).
export const addBillingCycle = (dateOnly: string, cycle: BillingCycle): string => {
  const [year, month, day] = dateOnly.slice(0, 10).split('-').map(Number);
  const next = new Date(Date.UTC(year, month - 1, day));

  if (cycle === 'weekly') {
    next.setUTCDate(next.getUTCDate() + 7);
  } else {
    const months = cycle === 'yearly' ? 12 : 1;
    const target = new Date(Date.UTC(year, month - 1 + months, 1));
    const lastDay = new Date(Date.UTC(target.getUTCFullYear(), target.getUTCMonth() + 1, 0)).getUTCDate();
    target.setUTCDate(Math.min(day, lastDay));
    return target.toISOString().slice(0, 10);
  }

  return next.toISOString().slice(0, 10);
};

export const getDateRange = (
  month: number,
  year: number
): { start: Date; end: Date } => {
  const start = new Date(year, month, 1, 0, 0, 0, 0);
  const end = new Date(year, month + 1, 0, 23, 59, 59, 999);
  return { start, end };
};


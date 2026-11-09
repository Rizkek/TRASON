import { getReminderDueAt } from './notificationLogic';

export const formatCurrency = (amount: number, currency = 'USD', locale = 'en-US'): string => {
  return new Intl.NumberFormat(locale, {
    style: 'currency',
    currency,
  }).format(amount);
};

export const formatDate = (
  date: Date | string,
  format = 'short',
  locale = 'en-US',
  timezone?: string
): string => {
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  const tzOption = timezone ? { timeZone: timezone } : {};

  if (format === 'short') {
    return new Intl.DateTimeFormat(locale, {
      month: 'short',
      day: 'numeric',
      ...tzOption,
    }).format(dateObj);
  }

  return new Intl.DateTimeFormat(locale, {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    ...tzOption,
  }).format(dateObj);
};

export const formatNumber = (num: number, decimals = 2): string => {
  return new Intl.NumberFormat('en-US', {
    minimumFractionDigits: 0,
    maximumFractionDigits: decimals,
  }).format(num);
};

/**
 * Get current date in specified timezone formatted as YYYY-MM-DD
 * This avoids the issue of UTC dates pushing the day backward for Eastern timezones
 */
export const getLocalISODate = (date: Date = new Date(), timezone?: string): string => {
  if (!timezone) {
    const tzOffset = date.getTimezoneOffset() * 60000;
    return new Date(date.getTime() - tzOffset).toISOString().split('T')[0];
  }

  // Format date parts according to the specific timezone
  const formatter = new Intl.DateTimeFormat('en-CA', { // en-CA gives YYYY-MM-DD
    timeZone: timezone,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  });
  
  return formatter.format(date);
};

/**
 * Due date and time of a reminder, or null when it has none. With `now`, the parts the reader can
 * assume are dropped: the date on the same day and the year within the same year. Without `now`
 * the full date is shown, which is what a history entry needs.
 */
export const formatReminderDue = (
  reminder: { due_datetime?: string | null; due_date?: string | null; due_time?: string | null },
  locale: string,
  timezone?: string,
  now?: Date,
): string | null => {
  const dueAt = getReminderDueAt(reminder);
  if (!dueAt) return null;

  const dueDay = getLocalISODate(dueAt, timezone);
  const today = now ? getLocalISODate(now, timezone) : null;
  const hasTime = Boolean(reminder.due_datetime || reminder.due_time);

  return dueAt.toLocaleString(locale, {
    ...((dueDay !== today || !hasTime) && {
      day: 'numeric',
      month: 'short',
      ...(dueDay.slice(0, 4) !== today?.slice(0, 4) && { year: 'numeric' }),
    }),
    ...(hasTime && { hour: '2-digit', minute: '2-digit' }),
    timeZone: timezone,
  });
};

// Currencies without minor units. Intl reports two digits for IDR, but nobody prices in sen.
const ZERO_DECIMAL_CURRENCIES = new Set(['IDR', 'JPY', 'KRW', 'VND', 'CLP', 'PYG', 'UGX', 'XAF', 'XOF']);

export const currencyFractionDigits = (currency: string): number =>
  ZERO_DECIMAL_CURRENCIES.has(currency.toUpperCase()) ? 0 : 2;

/** Rounds to the currency's minor unit, so float noise never reaches the amount column. */
export const roundToCurrency = (amount: number, currency: string): number => {
  const factor = 10 ** currencyFractionDigits(currency);
  return Math.round((amount + Number.EPSILON) * factor) / factor;
};

/**
 * What a money field may hold: digits only for currencies without cents, so "166.500" typed with a
 * thousands dot stays 166500; otherwise digits and one decimal separator, with cents capped.
 */
export const sanitizeAmountInput = (raw: string, currency: string): string => {
  const digits = currencyFractionDigits(currency);
  if (digits === 0) return raw.replace(/\D/g, '');
  const normalized = raw.replace(/,/g, '.').replace(/[^\d.]/g, '');
  const cut = normalized.lastIndexOf('.');
  if (cut === -1) return normalized;
  return `${normalized.slice(0, cut).replace(/\./g, '')}.${normalized.slice(cut + 1, cut + 1 + digits)}`;
};

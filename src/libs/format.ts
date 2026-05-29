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

export const formatTime = (
  date: Date | string,
  locale = 'en-US',
  timezone?: string
): string => {
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  const tzOption = timezone ? { timeZone: timezone } : {};

  return new Intl.DateTimeFormat(locale, {
    hour: '2-digit',
    minute: '2-digit',
    ...tzOption,
  }).format(dateObj);
};

export const formatDatetime = (
  date: Date | string,
  locale = 'en-US',
  timezone?: string
): string => {
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  const tzOption = timezone ? { timeZone: timezone } : {};

  return new Intl.DateTimeFormat(locale, {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    ...tzOption,
  }).format(dateObj);
};

export const formatNumber = (num: number, decimals = 2): string => {
  return num.toFixed(decimals).replace(/\B(?=(\d{3})+(?!\d))/g, ',');
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


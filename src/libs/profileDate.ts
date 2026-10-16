import { useAuthStore } from '@/store/authStore';
import { getLocalISODate } from '@/libs/format';

// Cron resets tasks and sends nudges by the profile timezone, so "today" on the client has to use
// the same zone. Without a saved preference the device zone is the best available answer.
export const getProfileTimezone = (): string | undefined => {
  const prefs = (useAuthStore.getState().user as { user_preferences?: unknown } | null)?.user_preferences;
  const pref = (Array.isArray(prefs) ? prefs[0] : prefs) as { timezone?: string } | undefined;
  return pref?.timezone || undefined;
};

export const getProfileToday = (date: Date = new Date()): string =>
  getLocalISODate(date, getProfileTimezone());

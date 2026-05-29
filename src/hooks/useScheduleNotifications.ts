'use client';

import { useCallback, useEffect, useRef } from 'react';
import { Reminder } from '@/types/database';
import { useUserPreferences } from './useUserPreferences';

export interface UseScheduleNotificationsOptions {
  enabled?: boolean;
}

// =============================================================================
// SW postMessage helper
// =============================================================================

/**
 * Send a message to the active Service Worker controller.
 * Returns false if SW is not available/ready.
 */
async function postMessageToSW(message: Record<string, unknown>): Promise<boolean> {
  if (typeof window === 'undefined' || !('serviceWorker' in navigator)) return false;

  try {
    // Wait up to 3 seconds for SW to be ready
    const registration = await Promise.race([
      navigator.serviceWorker.ready,
      new Promise<never>((_, reject) =>
        setTimeout(() => reject(new Error('SW ready timeout')), 3000)
      ),
    ]);

    const controller = (registration as ServiceWorkerRegistration).active;
    if (!controller) return false;

    controller.postMessage(message);
    return true;
  } catch {
    return false;
  }
}

/**
 * Fallback: show a one-shot notification directly via browser Notification API.
 * Used when SW is not available (e.g., localhost HTTP on some browsers).
 */
function showFallbackNotification(reminder: Reminder): void {
  if (!('Notification' in window) || Notification.permission !== 'granted') return;

  new Notification(`🔔 ${reminder.title}`, {
    body: reminder.description || 'Tap to open TRASON',
    icon: '/icon-192x192.png',
    tag: `reminder-${reminder.id}`,
  });
}

// =============================================================================
// Hook
// =============================================================================

export function useScheduleNotifications(options: UseScheduleNotificationsOptions = {}) {
  const prefs = useUserPreferences();
  const enabled = (options.enabled ?? true) && prefs.notifications_enabled;

  // Track whether we've registered the SW message listener this session
  const swMessageListenerRef = useRef(false);

  // Listen for SW confirmation messages (optional — useful for debugging)
  useEffect(() => {
    if (typeof window === 'undefined' || !('serviceWorker' in navigator)) return;
    if (swMessageListenerRef.current) return;
    swMessageListenerRef.current = true;

    const handler = (event: MessageEvent) => {
      // Handled message internally
    };

    navigator.serviceWorker.addEventListener('message', handler);
    return () => navigator.serviceWorker.removeEventListener('message', handler);
  }, []);

  // ==========================================================================
  // requestNotificationPermission
  // ==========================================================================

  const requestNotificationPermission = useCallback(async (): Promise<boolean> => {
    if (typeof window === 'undefined' || !('Notification' in window)) return false;
    if (Notification.permission === 'granted') return true;
    if (Notification.permission === 'denied') return false;

    const permission = await Notification.requestPermission();
    return permission === 'granted';
  }, []);

  // ==========================================================================
  // scheduleReminders — main entry point
  // ==========================================================================

  const scheduleReminders = useCallback(async (reminders: Reminder[]) => {
    const isSupported =
      typeof window !== 'undefined' && 'Notification' in window;



    if (!enabled) {
      // Clear all scheduled notifications from SW
      await postMessageToSW({ type: 'CLEAR_NOTIFICATIONS' });

      return;
    }

    if (!isSupported) {
      console.warn('[useScheduleNotifications] Notifications not supported in this browser');
      return;
    }

    // Request permission if not yet granted
    if (Notification.permission !== 'granted') {
      const granted = await requestNotificationPermission();
      if (!granted) {
        console.warn('[useScheduleNotifications] Permission denied — skipping schedule');
        return;
      }
    }

    // Try to send reminders to SW scheduler
    const swAvailable = await postMessageToSW({
      type: 'SCHEDULE_NOTIFICATIONS',
      reminders,
    });

    if (swAvailable) {

    } else {
      // SW not available — fall back to in-page setTimeout (e.g. HTTP localhost)

      scheduleFallback(reminders);
    }
  }, [enabled, prefs.notifications_enabled, requestNotificationPermission]);

  // ==========================================================================
  // Fallback: in-page setTimeout (when SW unavailable)
  // Only for dev/degraded environments
  // ==========================================================================

  const fallbackTimeouts = useRef<Map<string, ReturnType<typeof setTimeout>>>(new Map());

  const scheduleFallback = useCallback((reminders: Reminder[]) => {
    // Clear existing fallback timeouts
    fallbackTimeouts.current.forEach((t) => clearTimeout(t));
    fallbackTimeouts.current.clear();

    const now = Date.now();
    const ONE_WEEK_MS = 7 * 24 * 60 * 60 * 1000;

    reminders.forEach((reminder) => {
      if (reminder.status !== 'pending' || !reminder.due_datetime) return;

      const dueTime = new Date(reminder.due_datetime).getTime();
      const notifyMins: number[] = Array.isArray(reminder.notify_times)
        ? reminder.notify_times
        : [0, 60, 180, 360];

      notifyMins.forEach((mins) => {
        const notifyTime = dueTime - mins * 60_000;
        const timeUntil = notifyTime - now;
        if (timeUntil <= 0 || timeUntil >= ONE_WEEK_MS) return;

        const key = `${reminder.id}-${mins}`;
        if (fallbackTimeouts.current.has(key)) return;

        const t = setTimeout(() => {
          showFallbackNotification(reminder);
          fallbackTimeouts.current.delete(key);
        }, timeUntil);

        fallbackTimeouts.current.set(key, t);

      });
    });
  }, []);

  // Cleanup fallback timeouts on unmount
  useEffect(() => {
    return () => {
      fallbackTimeouts.current.forEach((t) => clearTimeout(t));
      fallbackTimeouts.current.clear();
    };
  }, []);

  // ==========================================================================
  // sendNotification — direct one-shot (still available for manual use)
  // ==========================================================================

  const sendNotification = useCallback(async (reminder: Reminder) => {
    if (!('Notification' in window)) {
      console.warn('[useScheduleNotifications] Notifications not supported');
      return;
    }
    if (Notification.permission !== 'granted') {
      const granted = await requestNotificationPermission();
      if (!granted) return;
    }
    showFallbackNotification(reminder);
  }, [requestNotificationPermission]);

  // ==========================================================================
  // Debug helper — query SW status
  // ==========================================================================

  const querySWStatus = useCallback(async () => {
    await postMessageToSW({ type: 'GET_STATUS' });
  }, []);

  // ==========================================================================
  // Derived state
  // ==========================================================================

  const isSupported =
    typeof window !== 'undefined' && 'Notification' in window;

  const permission = (() => {
    try {
      return isSupported ? Notification.permission : 'default';
    } catch {
      return 'default';
    }
  })();

  return {
    sendNotification,
    requestNotificationPermission,
    scheduleReminders,
    querySWStatus,
    isSupported,
    permission,
  };
}

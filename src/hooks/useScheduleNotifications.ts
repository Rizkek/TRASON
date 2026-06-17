'use client';

import { useCallback, useEffect, useRef } from 'react';
import { Reminder } from '@/types/database';
import { useUserPreferences } from './useUserPreferences';
import { useAuthStore } from '@/store/authStore';

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

  new Notification(reminder.title, {
    body: reminder.description || 'Tap to open TRASON',
    icon: '/icon-192x192.png',
    tag: `reminder-${reminder.id}`,
  });
}

// =============================================================================
// Auto-register Service Worker (silent, no push subscription needed)
// =============================================================================

let swRegistrationPromise: Promise<ServiceWorkerRegistration | null> | null = null;

export async function ensureSWRegistered(): Promise<ServiceWorkerRegistration | null> {
  if (typeof window === 'undefined' || !('serviceWorker' in navigator)) return null;

  if (!swRegistrationPromise) {
    swRegistrationPromise = navigator.serviceWorker
      .register('/sw.js')
      .then((reg) => {
        console.log('[SW] Registered successfully:', reg.scope);
        return reg;
      })
      .catch((err) => {
        console.warn('[SW] Registration failed:', err);
        swRegistrationPromise = null;
        return null;
      });
  }

  return swRegistrationPromise;
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

    const handler = (_event: MessageEvent) => {
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
  // Combines SW scheduling (works when browser is open) +
  // server-side push scheduling (works even when browser is closed)
  // ==========================================================================

  const scheduleReminders = useCallback(
    async (reminders: Reminder[]) => {
      const isSupported = typeof window !== 'undefined' && 'Notification' in window;

      if (!enabled) {
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

      // Ensure SW is registered (auto, no push subscription needed)
      await ensureSWRegistered();

      // ==========================================================================
      // The background notification bug is fixed here by REMOVING client-side
      // setTimeouts and SW postMessages. All scheduling is now purely handled
      // by the Vercel Cron Job (/api/cron/reminders) reading from Supabase.
      // We only ensure the Service Worker is registered and permissions are granted.
      // ==========================================================================

      console.log('[useScheduleNotifications] Delegating scheduling to Server Cron Job.');
    },
    [enabled, requestNotificationPermission]
  );

  // ==========================================================================
  // sendNotification — direct one-shot (still available for manual use)
  // ==========================================================================

  const sendNotification = useCallback(
    async (reminder: Reminder) => {
      if (!('Notification' in window)) {
        console.warn('[useScheduleNotifications] Notifications not supported');
        return;
      }
      if (Notification.permission !== 'granted') {
        const granted = await requestNotificationPermission();
        if (!granted) return;
      }
      showFallbackNotification(reminder);
    },
    [requestNotificationPermission]
  );

  // ==========================================================================
  // Debug helper — query SW status
  // ==========================================================================

  const querySWStatus = useCallback(async () => {
    await postMessageToSW({ type: 'GET_STATUS' });
  }, []);

  // ==========================================================================
  // Derived state
  // ==========================================================================

  const isSupported = typeof window !== 'undefined' && 'Notification' in window;

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

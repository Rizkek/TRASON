'use client';

import { useCallback, useState, useEffect } from 'react';
import { supabase } from '@/services/supabase/supabaseClient';

interface PushNotificationState {
  isSupported: boolean;
  isSubscribed: boolean;
  isLoading: boolean;
  isConfigured: boolean; // true jika NEXT_PUBLIC_VAPID_PUBLIC_KEY tersedia
  error: string | null;
}

const urlBase64ToUint8Array = (base64String: string) => {
  const padding = '='.repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/');
  const rawData = window.atob(base64);
  return Uint8Array.from([...rawData].map((char) => char.charCodeAt(0)));
};

/**
 * Safely converts an ArrayBuffer to a base64 string.
 * Uses forEach instead of String.fromCharCode.apply to avoid
 * RangeError: Maximum call stack size exceeded on large buffers.
 */
const arrayBufferToBase64 = (buffer: ArrayBuffer): string => {
  const bytes = new Uint8Array(buffer);
  let binary = '';
  bytes.forEach((b) => { binary += String.fromCharCode(b); });
  return btoa(binary);
};

export const usePushNotification = () => {
  const [state, setState] = useState<PushNotificationState>(() => {
    const isSupported =
      typeof window !== 'undefined' &&
      'serviceWorker' in navigator &&
      'PushManager' in window &&
      'Notification' in window;

    return {
      isSupported,
      isSubscribed: false,
      isLoading: false,
      isConfigured: !!process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY,
      error: null,
    };
  });

  // On mount: check if there is an existing browser push subscription and
  // sync it to Supabase. This handles the case where a new deploy updated the
  // Service Worker, the browser generated a new push endpoint, but the DB
  // still has the old (now-expired/410) endpoint — causing all cron pushes to fail.
  useEffect(() => {
    if (!state.isSupported) return;

    navigator.serviceWorker.getRegistration().then(async (reg) => {
      if (!reg) return;
      const sub = await reg.pushManager.getSubscription().catch(() => null);

      // Update UI state
      setState((prev) => ({ ...prev, isSubscribed: sub !== null }));

      if (!sub) return;

      // Sync current subscription endpoint to DB silently.
      // If the SW was updated and generated a new endpoint, this ensures the
      // DB always has the latest valid endpoint even without user action.
      try {
        const { data } = await supabase.auth.getSession();
        const user = data.session?.user;
        if (!user) return;

        const p256dh = sub.getKey('p256dh');
        const auth = sub.getKey('auth');
        if (!p256dh || !auth) return;

        const bytes = (buf: ArrayBuffer) => {
          const u = new Uint8Array(buf);
          let s = '';
          u.forEach((b) => { s += String.fromCharCode(b); });
          return btoa(s);
        };

        // Deactivate all other subscriptions for this user (stale endpoints)
        await supabase
          .from('push_subscriptions')
          .update({ is_active: false })
          .eq('user_id', user.id)
          .neq('endpoint', sub.endpoint);

        // Upsert the current fresh endpoint
        await supabase
          .from('push_subscriptions')
          .upsert(
            [{
              user_id: user.id,
              endpoint: sub.endpoint,
              p256dh: bytes(p256dh),
              auth: bytes(auth),
              user_agent: navigator.userAgent,
              is_active: true,
              last_used_at: new Date().toISOString(),
            }],
            { onConflict: 'endpoint' }
          );
      } catch {
        // Non-fatal: DB sync failed, will retry on next load
      }
    }).catch(() => {});
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [state.isSupported]);


  // Register service worker
  const registerServiceWorker = useCallback(async () => {
    try {
      if ('serviceWorker' in navigator) {
        const registration = await navigator.serviceWorker.register('/sw.js');
        console.log('Service Worker registered:', registration);
        return registration;
      }
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : 'Failed to register service worker';
      setState((prev) => ({ ...prev, error: errorMessage }));
    }
  }, []);

  // Subscribe to push notifications
  const subscribe = useCallback(async () => {
    setState((prev) => ({ ...prev, isLoading: true, error: null }));

    try {
      if (!state.isSupported) {
        throw new Error('Push notifications are not supported in this browser');
      }

      const vapidPublicKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY;
      if (!vapidPublicKey) {
        throw new Error('Push notifications are not configured');
      }

      // Check notification permission
      if (Notification.permission === 'denied') {
        throw new Error('Notification permission denied');
      }

      if (Notification.permission !== 'granted') {
        const permission = await Notification.requestPermission();
        if (permission !== 'granted') {
          throw new Error('Notification permission not granted');
        }
      }

      // Register service worker if not already registered
      const registration =
        (await navigator.serviceWorker.getRegistration()) ||
        (await registerServiceWorker());

      if (!registration) {
        throw new Error('Failed to register service worker');
      }

      // Subscribe to push manager
      const subscription = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(vapidPublicKey),
      });

      // Get current user
      const { data } = await supabase.auth.getSession();
      const user = data.session?.user;
      if (!user) {
        throw new Error('Not authenticated');
      }

      // Deactivate all OLD subscriptions for this user before inserting the new one.
      // This prevents stale endpoints from accumulating in the DB — browsers can
      // generate a brand-new endpoint when the SW is reinstalled or cache is cleared,
      // leaving old entries with is_active=true that will cause cron push failures.
      await supabase
        .from('push_subscriptions')
        .update({ is_active: false })
        .eq('user_id', user.id)
        .neq('endpoint', subscription.endpoint);

      // Upsert the current (fresh) subscription
      const { error } = await supabase
        .from('push_subscriptions')
        .upsert(
          [
            {
              user_id: user.id,
              endpoint: subscription.endpoint,
              // Use forEach-based encoding to avoid RangeError on large buffers
              p256dh: arrayBufferToBase64(subscription.getKey('p256dh')!),
              auth: arrayBufferToBase64(subscription.getKey('auth')!),
              user_agent: navigator.userAgent,
              is_active: true,
              last_used_at: new Date().toISOString(),
            },
          ],
          { onConflict: 'endpoint' }
        );

      if (error) throw error;

      setState((prev) => ({
        ...prev,
        isSubscribed: true,
        isLoading: false,
      }));

      return subscription;
    } catch (error) {
      const errorMessage =
        error instanceof Error
          ? error.message
          : 'Failed to subscribe to push notifications';
      setState((prev) => ({
        ...prev,
        error: errorMessage,
        isLoading: false,
      }));
      throw error;
    }
  }, [registerServiceWorker, state.isSupported]);

  // Unsubscribe from push notifications
  const unsubscribe = useCallback(async () => {
    setState((prev) => ({ ...prev, isLoading: true, error: null }));

    try {
      const registration = await navigator.serviceWorker.getRegistration();
      if (!registration) {
        throw new Error('Service worker not found');
      }

      const subscription = await registration.pushManager.getSubscription();
      if (!subscription) {
        throw new Error('No active subscription');
      }

      await subscription.unsubscribe();

      // Get current user
      const { data } = await supabase.auth.getSession();
      const user = data.session?.user;
      if (user) {
        // Update subscription in Supabase
        await supabase
          .from('push_subscriptions')
          .update({ is_active: false })
          .eq('endpoint', subscription.endpoint)
          .eq('user_id', user.id);
      }

      setState((prev) => ({
        ...prev,
        isSubscribed: false,
        isLoading: false,
      }));

      return true;
    } catch (error) {
      const errorMessage =
        error instanceof Error
          ? error.message
          : 'Failed to unsubscribe from push notifications';
      setState((prev) => ({
        ...prev,
        error: errorMessage,
        isLoading: false,
      }));
      throw error;
    }
  }, []);

  // Check if already subscribed
  const checkSubscription = useCallback(async () => {
    try {
      const registration = await navigator.serviceWorker.getRegistration();
      if (!registration) {
        setState((prev) => ({ ...prev, isSubscribed: false }));
        return;
      }

      const subscription = await registration.pushManager.getSubscription();
      setState((prev) => ({
        ...prev,
        isSubscribed: subscription !== null,
      }));
    } catch (error) {
      console.error('Error checking subscription:', error);
    }
  }, []);

  return {
    ...state,
    subscribe,
    unsubscribe,
    checkSubscription,
    registerServiceWorker,
  };
};

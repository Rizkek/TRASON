'use client';

import { useCallback, useState, useEffect } from 'react';
import { supabase } from '@/services/supabase/supabaseClient';
import {
  ensureSWRegistered,
  isPushSupported,
  saveSubscription,
  subscriptionMatchesVapidKey,
  urlBase64ToUint8Array,
} from '@/libs/pushSync';

interface PushNotificationState {
  isSupported: boolean;
  isSubscribed: boolean;
  isLoading: boolean;
  isConfigured: boolean; // true jika NEXT_PUBLIC_VAPID_PUBLIC_KEY tersedia
  error: string | null;
}

/**
 * UI state plus explicit subscribe/unsubscribe actions. Writing the current endpoint to the
 * database on load is done once per app by `syncPushSubscription`, not by each hook instance.
 */
export const usePushNotification = () => {
  const [state, setState] = useState<PushNotificationState>(() => ({
    isSupported: isPushSupported(),
    isSubscribed: false,
    isLoading: false,
    isConfigured: !!process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY,
    error: null,
  }));

  useEffect(() => {
    if (!state.isSupported) return;

    navigator.serviceWorker
      .getRegistration()
      .then((registration) => registration?.pushManager.getSubscription())
      .then((subscription) => setState((prev) => ({ ...prev, isSubscribed: !!subscription })))
      .catch(() => {});
  }, [state.isSupported]);

  const registerServiceWorker = useCallback(async () => {
    const registration = await ensureSWRegistered();
    if (!registration) {
      setState((prev) => ({ ...prev, error: 'Failed to register service worker' }));
    }
    return registration ?? undefined;
  }, []);

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

      if (Notification.permission === 'denied') {
        throw new Error('Notification permission denied');
      }

      if (Notification.permission !== 'granted') {
        const permission = await Notification.requestPermission();
        if (permission !== 'granted') {
          throw new Error('Notification permission not granted');
        }
      }

      const registration =
        (await navigator.serviceWorker.getRegistration()) || (await registerServiceWorker());
      if (!registration) {
        throw new Error('Failed to register service worker');
      }

      const { data } = await supabase.auth.getSession();
      const user = data.session?.user;
      if (!user) {
        throw new Error('Not authenticated');
      }

      // Reuse a subscription only when it was created with the current VAPID key.
      let subscription = await registration.pushManager.getSubscription();
      if (subscription && !subscriptionMatchesVapidKey(subscription, vapidPublicKey)) {
        await subscription.unsubscribe();
        subscription = null;
      }

      subscription ??= await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(vapidPublicKey),
      });

      await saveSubscription(subscription, user.id);

      setState((prev) => ({ ...prev, isSubscribed: true, isLoading: false }));
      return subscription;
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : 'Failed to subscribe to push notifications';
      setState((prev) => ({ ...prev, error: errorMessage, isLoading: false }));
      throw error;
    }
  }, [registerServiceWorker, state.isSupported]);

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

      const { data } = await supabase.auth.getSession();
      const user = data.session?.user;
      if (user) {
        await supabase
          .from('push_subscriptions')
          .update({ is_active: false })
          .eq('endpoint', subscription.endpoint)
          .eq('user_id', user.id);
      }

      setState((prev) => ({ ...prev, isSubscribed: false, isLoading: false }));
      return true;
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : 'Failed to unsubscribe from push notifications';
      setState((prev) => ({ ...prev, error: errorMessage, isLoading: false }));
      throw error;
    }
  }, []);

  const checkSubscription = useCallback(async () => {
    try {
      const registration = await navigator.serviceWorker.getRegistration();
      const subscription = await registration?.pushManager.getSubscription();
      setState((prev) => ({ ...prev, isSubscribed: !!subscription }));
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

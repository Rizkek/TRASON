'use client';

import { useCallback, useState, useEffect } from 'react';
import { supabase } from '@/services/supabaseClient';

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

export const usePushNotification = () => {
  const [state, setState] = useState<PushNotificationState>({
    isSupported: false,
    isSubscribed: false,
    isLoading: false,
    isConfigured: !!process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY,
    error: null,
  });

  // Check if push notifications are supported & configured, then check existing subscription
  useEffect(() => {
    const isSupported =
      typeof window !== 'undefined' &&
      'serviceWorker' in navigator &&
      'PushManager' in window &&
      'Notification' in window;

    const isConfigured = !!process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY;

    setState((prev) => ({ ...prev, isSupported, isConfigured }));

    // Auto-detect if already subscribed
    if (isSupported) {
      navigator.serviceWorker.getRegistration().then((reg) => {
        if (reg) {
          reg.pushManager.getSubscription().then((sub) => {
            setState((prev) => ({ ...prev, isSubscribed: sub !== null }));
          });
        }
      }).catch(() => {});
    }
  }, []);

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

      // Save subscription to Supabase
      const { error } = await supabase
        .from('push_subscriptions')
        .upsert([
          {
            user_id: user.id,
            endpoint: subscription.endpoint,
            p256dh: btoa(
              String.fromCharCode.apply(
                null,
                Array.from(new Uint8Array(subscription.getKey('p256dh')!))
              )
            ),
            auth: btoa(
              String.fromCharCode.apply(
                null,
                Array.from(new Uint8Array(subscription.getKey('auth')!))
              )
            ),
            user_agent: navigator.userAgent,
            is_active: true,
            last_used_at: new Date().toISOString(),
          },
        ], { onConflict: 'endpoint' });

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

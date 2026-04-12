'use client';

import { useCallback, useState, useEffect } from 'react';
import { supabase } from '@/services/supabaseClient';

interface PushNotificationState {
  isSupported: boolean;
  isSubscribed: boolean;
  isLoading: boolean;
  error: string | null;
}

export const usePushNotification = () => {
  const [state, setState] = useState<PushNotificationState>({
    isSupported: false,
    isSubscribed: false,
    isLoading: false,
    error: null,
  });

  // Check if push notifications are supported
  useEffect(() => {
    const isSupported =
      'serviceWorker' in navigator &&
      'PushManager' in window &&
      'Notification' in window;

    setState((prev) => ({ ...prev, isSupported }));
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
        applicationServerKey: process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY,
      });

      // Get current user
      const { data } = await supabase.auth.getUser();
      if (!data.user) {
        throw new Error('Not authenticated');
      }

      // Save subscription to Supabase
      const { error } = await supabase
        .from('push_subscriptions')
        .insert([
          {
            user_id: data.user.id,
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
          },
        ]);

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
  }, [registerServiceWorker]);

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
      const { data } = await supabase.auth.getUser();
      if (data.user) {
        // Update subscription in Supabase
        await supabase
          .from('push_subscriptions')
          .update({ is_active: false })
          .eq('endpoint', subscription.endpoint)
          .eq('user_id', data.user.id);
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

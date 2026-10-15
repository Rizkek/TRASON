import { supabase } from '@/services/supabase/supabaseClient';

export const urlBase64ToUint8Array = (base64String: string) => {
  const padding = '='.repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/');
  const rawData = window.atob(base64);
  return Uint8Array.from([...rawData].map((char) => char.charCodeAt(0)));
};

export const subscriptionMatchesVapidKey = (subscription: PushSubscription, vapidPublicKey: string) => {
  const subscribedKey = subscription.options.applicationServerKey;
  if (!subscribedKey) return false;

  const expectedKey = urlBase64ToUint8Array(vapidPublicKey);
  const actualKey = new Uint8Array(subscribedKey);
  return expectedKey.length === actualKey.length && expectedKey.every((byte, index) => byte === actualKey[index]);
};

// forEach instead of String.fromCharCode.apply avoids "Maximum call stack size exceeded" on large buffers.
export const arrayBufferToBase64 = (buffer: ArrayBuffer): string => {
  let binary = '';
  new Uint8Array(buffer).forEach((byte) => {
    binary += String.fromCharCode(byte);
  });
  return btoa(binary);
};

export const isPushSupported = () =>
  typeof window !== 'undefined' &&
  'serviceWorker' in navigator &&
  'PushManager' in window &&
  'Notification' in window;

let swRegistrationPromise: Promise<ServiceWorkerRegistration | null> | null = null;

export function ensureSWRegistered(): Promise<ServiceWorkerRegistration | null> {
  if (typeof window === 'undefined' || !('serviceWorker' in navigator)) return Promise.resolve(null);

  swRegistrationPromise ??= navigator.serviceWorker
    .register('/sw.js')
    .catch((err) => {
      console.warn('[SW] Registration failed:', err);
      swRegistrationPromise = null;
      return null;
    });

  return swRegistrationPromise;
}

/**
 * Stores this browser's subscription. A user can hold one active subscription per device,
 * so other endpoints are never touched here; dead ones are retired by the cron on 404/410.
 */
export async function saveSubscription(subscription: PushSubscription, userId: string): Promise<void> {
  const p256dh = subscription.getKey('p256dh');
  const auth = subscription.getKey('auth');
  if (!p256dh || !auth) throw new Error('Browser push subscription is missing encryption keys');

  const { error } = await supabase.from('push_subscriptions').upsert(
    [
      {
        user_id: userId,
        endpoint: subscription.endpoint,
        p256dh: arrayBufferToBase64(p256dh),
        auth: arrayBufferToBase64(auth),
        user_agent: navigator.userAgent,
        is_active: true,
        failure_count: 0,
        last_error: null,
        last_used_at: new Date().toISOString(),
      },
    ],
    { onConflict: 'endpoint' }
  );

  if (error) throw error;
}

async function runSync(): Promise<void> {
  if (!isPushSupported() || Notification.permission !== 'granted') return;

  const registration = await navigator.serviceWorker.getRegistration();
  const subscription = await registration?.pushManager.getSubscription().catch(() => null);
  if (!subscription) return;

  const { data } = await supabase.auth.getSession();
  const user = data.session?.user;
  if (!user) return;

  // A subscription created with an old VAPID key can never receive pushes signed with the current one.
  const vapidPublicKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY;
  if (vapidPublicKey && !subscriptionMatchesVapidKey(subscription, vapidPublicKey)) {
    await subscription.unsubscribe().catch(() => {});
    await supabase
      .from('push_subscriptions')
      .update({ is_active: false })
      .eq('endpoint', subscription.endpoint)
      .eq('user_id', user.id);
    return;
  }

  await saveSubscription(subscription, user.id);
}

let syncInFlight: Promise<void> | null = null;

/** Re-registers the current browser endpoint in the database (also reactivates one the cron retired). */
export function syncPushSubscription(): Promise<void> {
  syncInFlight ??= runSync()
    .catch((err) => console.warn('[Push] Subscription sync failed (will retry on next load):', err))
    .finally(() => {
      syncInFlight = null;
    });

  return syncInFlight;
}

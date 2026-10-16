'use client';

import React from 'react';
import { ensureSWRegistered, syncPushSubscription } from '@/libs/pushSync';

const PUSH_RESYNC_INTERVAL_MS = 30 * 60 * 1000;

/**
 * Mounted once on authenticated pages. Keeps this device's push endpoint registered in the
 * database: the browser can rotate endpoints silently and the cron retires failing ones.
 * It never asks for notification permission; that only happens from an explicit user action.
 */
export function PushSubscriptionSync() {
  React.useEffect(() => {
    let lastSync = Date.now();
    ensureSWRegistered().then(syncPushSubscription);

    const resyncWhenVisible = () => {
      if (document.visibilityState !== 'visible' || Date.now() - lastSync < PUSH_RESYNC_INTERVAL_MS) return;
      lastSync = Date.now();
      syncPushSubscription();
    };

    document.addEventListener('visibilitychange', resyncWhenVisible);
    return () => document.removeEventListener('visibilitychange', resyncWhenVisible);
  }, []);

  return null;
}

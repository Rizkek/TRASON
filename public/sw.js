// =============================================================================
// TRASON Service Worker — SW-based Notification Scheduler
// =============================================================================
// Architecture:
//   1. Page sends reminders via postMessage({ type: 'SCHEDULE_NOTIFICATIONS', reminders })
//   2. SW stores scheduled notification times in IndexedDB (survives SW restart)
//   3. SW runs a setInterval every 30s to check for due notifications
//   4. SW calls showNotification() — works even if app tab is minimized/backgrounded
//   5. On SW activate, reads IndexedDB to restart any pending schedules
// =============================================================================

const CACHE_NAME = 'trason-v3';
const NOTIF_DB_NAME = 'trason-notif-db';
const NOTIF_STORE_NAME = 'scheduled';
const CHECK_INTERVAL_MS = 30_000; // check every 30 seconds

const urlsToCache = [
  '/',
  '/manifest.json',
  '/favicon.svg',
  '/icon-192x192.png',
  '/badge-72x72.png',
];

// In-memory schedule map: key → { title, body, notifyTime, reminderId, url }
// This is rebuilt from IndexedDB on SW activate/install.
const pendingNotifications = new Map();
let checkIntervalId = null;

// =============================================================================
// IndexedDB helpers
// =============================================================================

function openDB() {
  return new Promise((resolve, reject) => {
    const req = indexedDB.open(NOTIF_DB_NAME, 1);
    req.onupgradeneeded = (e) => {
      const db = e.target.result;
      if (!db.objectStoreNames.contains(NOTIF_STORE_NAME)) {
        db.createObjectStore(NOTIF_STORE_NAME, { keyPath: 'key' });
      }
    };
    req.onsuccess = (e) => resolve(e.target.result);
    req.onerror = (e) => reject(e.target.error);
  });
}

async function dbPutAll(records) {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(NOTIF_STORE_NAME, 'readwrite');
    const store = tx.objectStore(NOTIF_STORE_NAME);
    records.forEach((r) => store.put(r));
    tx.oncomplete = resolve;
    tx.onerror = (e) => reject(e.target.error);
  });
}

async function dbGetAll() {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(NOTIF_STORE_NAME, 'readonly');
    const store = tx.objectStore(NOTIF_STORE_NAME);
    const req = store.getAll();
    req.onsuccess = (e) => resolve(e.target.result);
    req.onerror = (e) => reject(e.target.error);
  });
}

async function dbClear() {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(NOTIF_STORE_NAME, 'readwrite');
    tx.objectStore(NOTIF_STORE_NAME).clear();
    tx.oncomplete = resolve;
    tx.onerror = (e) => reject(e.target.error);
  });
}

async function dbDeleteKey(key) {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(NOTIF_STORE_NAME, 'readwrite');
    tx.objectStore(NOTIF_STORE_NAME).delete(key);
    tx.oncomplete = resolve;
    tx.onerror = (e) => reject(e.target.error);
  });
}

// =============================================================================
// Scheduler
// =============================================================================

function startCheckInterval() {
  if (checkIntervalId !== null) return;
  checkPendingNotifications(); // immediate check
  checkIntervalId = setInterval(checkPendingNotifications, CHECK_INTERVAL_MS);
}

function stopCheckInterval() {
  if (checkIntervalId !== null) {
    clearInterval(checkIntervalId);
    checkIntervalId = null;
  }
}

async function checkPendingNotifications() {
  if (pendingNotifications.size === 0) {
    stopCheckInterval();
    return;
  }

  const now = Date.now();
  const fired = [];

  pendingNotifications.forEach((data, key) => {
    if (data.notifyTime <= now) {
      fired.push({ key, data });
    }
  });

  for (const { key, data } of fired) {
    pendingNotifications.delete(key);
    await dbDeleteKey(key);

    // Build human-readable body
    const minsBeforeText = data.minsBefore > 0
      ? ` — ${data.minsBefore >= 60
          ? `${data.minsBefore / 60}h`
          : `${data.minsBefore}m`} before`
      : '';

    try {
      await self.registration.showNotification(`🔔 ${data.title}${minsBeforeText}`, {
        body: data.body || 'Tap to open TRASON',
        icon: '/icon-192x192.png',
        badge: '/badge-72x72.png',
        tag: key,
        vibrate: [200, 100, 200, 100, 200],
        requireInteraction: data.minsBefore === 0, // only stay persistent at due time
        data: { url: data.url || '/reminders' },
        actions: [
          { action: 'open', title: 'Open' },
          { action: 'dismiss', title: 'Dismiss' },
        ],
      });
    } catch (err) {
      console.error('[SW] showNotification failed:', err);
    }
  }

  if (pendingNotifications.size === 0) {
    stopCheckInterval();
  }
}

// Load stored notifications from IndexedDB into memory (called on SW start)
async function restoreFromDB() {
  try {
    const records = await dbGetAll();
    const now = Date.now();
    let hasValid = false;

    records.forEach((r) => {
      if (r.notifyTime > now) {
        pendingNotifications.set(r.key, r);
        hasValid = true;
      }
    });

    // Clean up expired records from DB
    const expired = records.filter((r) => r.notifyTime <= now);
    if (expired.length > 0) {
      const db = await openDB();
      const tx = db.transaction(NOTIF_STORE_NAME, 'readwrite');
      const store = tx.objectStore(NOTIF_STORE_NAME);
      expired.forEach((r) => store.delete(r.key));
    }

    if (hasValid) {
      console.log(`[SW] Restored ${pendingNotifications.size} scheduled notifications from IndexedDB`);
      startCheckInterval();
    }
  } catch (err) {
    console.error('[SW] Failed to restore from IndexedDB:', err);
  }
}

// =============================================================================
// Message handler — receives reminders from the app page
// =============================================================================

self.addEventListener('message', async (event) => {
  const { type, reminders } = event.data || {};

  if (type === 'SCHEDULE_NOTIFICATIONS') {
    // Clear existing in-memory + DB schedules
    pendingNotifications.clear();
    await dbClear();
    stopCheckInterval();

    if (!Array.isArray(reminders) || reminders.length === 0) {
      console.log('[SW] SCHEDULE_NOTIFICATIONS: no reminders, cleared schedule');
      return;
    }

    const now = Date.now();
    const ONE_WEEK_MS = 7 * 24 * 60 * 60 * 1000;
    const toStore = [];

    console.groupCollapsed('[SW] Schedule Evaluation');
    reminders.forEach((reminder) => {
      if (reminder.status !== 'pending' || !reminder.due_datetime) {
        console.log(`[Skip] "${reminder.title}" (status: ${reminder.status})`);
        return;
      }

      const dueTime = new Date(reminder.due_datetime).getTime();
      const notifyMins = Array.isArray(reminder.notify_times)
        ? reminder.notify_times
        : [60, 180, 360];

      console.log(`[Evaluate] "${reminder.title}" | Due: ${new Date(dueTime).toLocaleString()} | Options:`, notifyMins);

      notifyMins.forEach((mins) => {
        const notifyTime = dueTime - mins * 60_000;
        const timeUntil = notifyTime - now;

        // Only schedule if in the future and within the next 7 days
        if (timeUntil > 0 && timeUntil < ONE_WEEK_MS) {
          console.log(`  -> ✅ [${mins}m before] Scheduled in ${Math.round(timeUntil / 1000)}s (at ${new Date(notifyTime).toLocaleTimeString()})`);
          const key = `${reminder.id}-${mins}`;
          const record = {
            key,
            title: reminder.title,
            body: reminder.description || '',
            notifyTime,
            minsBefore: mins,
            url: '/reminders',
            reminderId: reminder.id,
          };
          pendingNotifications.set(key, record);
          toStore.push(record);
        } else {
          console.log(`  -> ❌ [${mins}m before] Skipped. Time until: ${Math.round(timeUntil / 1000)}s`);
        }
      });
    });
    console.groupEnd();

    if (toStore.length > 0) {
      await dbPutAll(toStore);
      startCheckInterval();
      console.log(`[SW] Scheduled ${toStore.length} notifications for ${reminders.length} reminders`);
    } else {
      console.log('[SW] SCHEDULE_NOTIFICATIONS: all reminders out of time window');
    }

    // Reply to the page with confirmation
    event.source?.postMessage({ type: 'SCHEDULE_CONFIRMED', count: toStore.length });

  } else if (type === 'CLEAR_NOTIFICATIONS') {
    pendingNotifications.clear();
    await dbClear();
    stopCheckInterval();
    console.log('[SW] CLEAR_NOTIFICATIONS: all schedules cleared');
    event.source?.postMessage({ type: 'CLEAR_CONFIRMED' });

  } else if (type === 'GET_STATUS') {
    event.source?.postMessage({
      type: 'STATUS',
      pending: pendingNotifications.size,
      isChecking: checkIntervalId !== null,
    });
  }
});

// =============================================================================
// Notification click handler
// =============================================================================

self.addEventListener('notificationclick', (event) => {
  event.notification.close();

  if (event.action === 'dismiss') return;

  const targetUrl = event.notification.data?.url || '/reminders';

  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then((clientList) => {
      // Focus existing tab if open
      for (const client of clientList) {
        const clientUrl = new URL(client.url);
        if (clientUrl.origin === self.location.origin) {
          client.focus();
          return client.navigate(targetUrl);
        }
      }
      // Otherwise open new tab
      return clients.openWindow(targetUrl);
    })
  );
});

// =============================================================================
// SW Lifecycle
// =============================================================================

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(urlsToCache).catch((err) => {
        console.warn('[SW] Some cache URLs failed:', err);
      });
    })
  );
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    Promise.all([
      // Clean up old caches
      caches.keys().then((cacheNames) =>
        Promise.all(
          cacheNames
            .filter((name) => name !== CACHE_NAME)
            .map((name) => caches.delete(name))
        )
      ),
      // Claim clients immediately
      self.clients.claim(),
      // Restore persisted schedules from IndexedDB
      restoreFromDB(),
    ])
  );
});

// =============================================================================
// Fetch handler — cache-first for static assets only
// =============================================================================

self.addEventListener('fetch', (event) => {
  if (event.request.method !== 'GET') return;

  const requestUrl = new URL(event.request.url);
  const isSameOrigin = requestUrl.origin === self.location.origin;
  const isStaticAsset = isSameOrigin && (
    requestUrl.pathname.startsWith('/_next/static/') ||
    requestUrl.pathname.startsWith('/icons/') ||
    requestUrl.pathname.endsWith('.css') ||
    requestUrl.pathname.endsWith('.js') ||
    requestUrl.pathname.endsWith('.svg') ||
    requestUrl.pathname.endsWith('.png') ||
    requestUrl.pathname.endsWith('.woff2')
  );
  const isApiRequest = requestUrl.pathname.startsWith('/api/');
  const isSupabaseRequest = requestUrl.hostname.includes('supabase.co');

  if (isApiRequest || isSupabaseRequest || !isStaticAsset) return;

  event.respondWith(
    caches.match(event.request).then((cached) => {
      if (cached) return cached;
      return fetch(event.request).then((response) => {
        if (!response || response.status !== 200 || response.type !== 'basic') {
          return response;
        }
        const clone = response.clone();
        caches.open(CACHE_NAME).then((cache) => cache.put(event.request, clone));
        return response;
      });
    })
  );
});

// =============================================================================
// Server Push handler (existing — for future VAPID push server integration)
// =============================================================================

self.addEventListener('push', (event) => {
  if (!event.data) return;

  let payload;
  try {
    payload = event.data.json();
  } catch {
    payload = { title: 'TRASON', body: event.data.text() };
  }

  event.waitUntil(
    self.registration.showNotification(payload.title || 'TRASON', {
      body: payload.body || '',
      icon: '/icon-192x192.png',
      badge: '/badge-72x72.png',
      vibrate: [200, 100, 200],
      tag: payload.tag || 'push-notification',
      data: { url: payload.url || '/dashboard' },
    })
  );
});

// =============================================================================
// Background sync (placeholder — no backend endpoint yet)
// =============================================================================

self.addEventListener('sync', (event) => {
  if (event.tag === 'sync-transactions') {
    event.waitUntil(Promise.resolve());
  }
});

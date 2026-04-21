const CACHE_NAME = 'trason-v2';
const urlsToCache = [
  '/',
  '/favicon.ico',
  '/manifest.json',
  '/favicon.svg',
  '/icon-192x192.svg',
];

// Install event - cache resources
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(urlsToCache).catch((error) => {
        console.log('Caching URLs failed:', error);
      });
    })
  );
  self.skipWaiting();
});

// Activate event - clean up old caches
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== CACHE_NAME) {
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
  self.clients.claim();
});

// Fetch event - serve from cache, fallback to network
self.addEventListener('fetch', (event) => {
  // Skip non-GET requests
  if (event.request.method !== 'GET') {
    return;
  }

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

  // Never cache APIs or Supabase traffic
  if (isApiRequest || isSupabaseRequest || !isStaticAsset) {
    return;
  }

  // Cache-first for static assets only
  event.respondWith(
    caches.match(event.request).then((response) => {
      if (response) {
        return response;
      }

      return fetch(event.request).then((response) => {
        if (!response || response.status !== 200 || response.type !== 'basic') {
          return response;
        }

        const responseToCache = response.clone();
        caches.open(CACHE_NAME).then((cache) => {
          cache.put(event.request, responseToCache);
        });

        return response;
      });
    })
  );
});

// Push notification event
self.addEventListener('push', (event) => {
  if (!event.data) {
    return;
  }

  const options = {
    body: event.data.text(),
    icon: '/icon-192x192.svg',
    badge: '/favicon.svg',
    vibrate: [100, 50, 100],
    tag: 'notification',
    requireInteraction: true,
  };

  event.waitUntil(
    self.registration.showNotification('TRASON', options)
  );
});

// Notification click event
self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  event.waitUntil(
    clients.matchAll({ type: 'window' }).then((clientList) => {
      for (let client of clientList) {
        if (client.url === '/' && 'focus' in client) {
          return client.focus();
        }
      }
      if (clients.openWindow) {
        return clients.openWindow('/');
      }
    })
  );
});

// Background sync for offline transactions
self.addEventListener('sync', (event) => {
  if (event.tag === 'sync-transactions') {
    // No backend sync endpoint implemented yet.
    // Avoid repeated failing sync tasks until endpoint is available.
    event.waitUntil(Promise.resolve());
  }
});

import { defaultCache } from "@serwist/next/worker";
import type { PrecacheEntry, SerwistGlobalConfig } from "serwist";
import { Serwist, NetworkOnly } from "serwist";

// This declares the value of `injectionPoint` to TypeScript.
// `injectionPoint` is the string that will be replaced by the
// actual precache manifest. By default, this string is set to
// `"self.__SW_MANIFEST"`.
declare global {
  interface WorkerGlobalScope extends SerwistGlobalConfig {
    __SW_MANIFEST: (PrecacheEntry | string)[] | undefined;
  }
}

declare const self: ServiceWorkerGlobalScope;

// Dynamic app routes and API routes must ALWAYS go to the network.
// These routes use cookies/auth and cannot be served from cache.
const NETWORK_ONLY_ROUTES = [
  /^\/(dashboard|finance|timeline|sport|career|reminders|investments|insights|settings|onboarding)(\/.*)?$/,
  /^\/api\//,
];

const serwist = new Serwist({
  precacheEntries: self.__SW_MANIFEST,
  skipWaiting: true,
  clientsClaim: true,
  navigationPreload: true,
  runtimeCaching: [
    // Force network-only for authenticated app routes
    {
      matcher: ({ url }) => NETWORK_ONLY_ROUTES.some((pattern) => pattern.test(url.pathname)),
      handler: new NetworkOnly(),
    },
    // Use default caching strategy for everything else (static assets, public pages)
    ...defaultCache,
  ],
});

serwist.addEventListeners();

// Handle Push Notifications
self.addEventListener('push', (event) => {
  if (event.data) {
    try {
      const data = event.data.json();
      const title = data.title || 'TRASON';
      const options: NotificationOptions = {
        body: data.body || 'You have a new update.',
        icon: '/icon-192x192.png',
        badge: '/icon-192x192.png',
        data: {
          url: data.url || '/',
        },
      };

      event.waitUntil(self.registration.showNotification(title, options));
    } catch (err) {
      console.error('[SW] Failed to parse push event data:', err);
      // Fallback notification if parsing fails
      event.waitUntil(
        self.registration.showNotification('TRASON', {
          body: event.data.text(),
          icon: '/icon-192x192.png',
          badge: '/icon-192x192.png',
          data: { url: '/' },
        })
      );
    }
  } else {
    // Fallback if no data is provided
    event.waitUntil(
      self.registration.showNotification('TRASON', {
        body: 'You have a new notification.',
        icon: '/icon-192x192.png',
        badge: '/icon-192x192.png',
        data: { url: '/' },
      })
    );
  }
});

// Handle Notification Clicks
self.addEventListener('notificationclick', (event) => {
  event.notification.close();

  const targetUrl = event.notification.data?.url || '/';

  // Open the target URL
  event.waitUntil(
    self.clients
      .matchAll({ type: 'window', includeUncontrolled: true })
      .then((clientList) => {
        // If a window is already open, focus it and navigate
        for (const client of clientList) {
          if (client.url.includes(self.location.origin) && 'focus' in client) {
            return client.focus().then((focusedClient) => {
              if ('navigate' in focusedClient) {
                return focusedClient.navigate(targetUrl);
              }
            });
          }
        }
        // Otherwise, open a new window
        if (self.clients.openWindow) {
          return self.clients.openWindow(targetUrl);
        }
      })
  );
});

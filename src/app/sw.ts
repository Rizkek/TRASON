import { defaultCache } from "@serwist/next/worker";
import type { PrecacheEntry, SerwistGlobalConfig } from "serwist";
import { Serwist } from "serwist";
import type { RouteHandlerCallbackOptions } from "serwist";

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

/**
 * Network-with-fallback handler for authenticated app routes.
 *
 * `NetworkOnly` will let its promise reject when the network is unavailable,
 * which causes Serwist/Workbox to emit the "no-response" error and the
 * FetchEvent to propagate a network-error response to the browser.
 *
 * This custom handler always resolves — on network failure it returns a
 * minimal 503 HTML page so the browser gets a real response instead of
 * an opaque network error.
 */
const networkWithFallback = {
  handle: async ({ request, event }: RouteHandlerCallbackOptions): Promise<Response> => {
    try {
      // Prefer the navigation-preload response when available (faster TTFB).
      // Cast event to FetchEvent to access preloadResponse.
      const preloadResponse = await (event as FetchEvent).preloadResponse;
      if (preloadResponse) return preloadResponse;

      return await fetch(request);
    } catch {
      // Network is offline or the request failed — return a graceful 503
      // so the SW FetchEvent always resolves with a real Response.
      const isNavigation = request.mode === 'navigate';
      if (isNavigation) {
        return new Response(
          `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>You're offline – TRASON</title>
  <style>
    body { margin: 0; display: flex; flex-direction: column; align-items: center;
           justify-content: center; min-height: 100dvh; font-family: system-ui, sans-serif;
           background: #0f0f11; color: #e5e5e5; text-align: center; padding: 2rem; }
    h1  { font-size: 1.5rem; margin-bottom: 0.5rem; }
    p   { color: #9ca3af; max-width: 320px; }
    button { margin-top: 1.5rem; padding: 0.6rem 1.4rem; border: none;
             border-radius: 8px; background: #6366f1; color: #fff;
             font-size: 1rem; cursor: pointer; }
  </style>
</head>
<body>
  <h1>You're offline</h1>
  <p>TRASON couldn't load this page because there's no internet connection.</p>
  <button onclick="location.reload()">Try again</button>
</body>
</html>`,
          {
            status: 503,
            headers: { 'Content-Type': 'text/html; charset=utf-8' },
          }
        );
      }
      // For non-navigation requests (e.g. API calls from the page), return a
      // JSON error so clients can handle it gracefully.
      return new Response(
        JSON.stringify({ error: 'offline', message: 'You are offline.' }),
        {
          status: 503,
          headers: { 'Content-Type': 'application/json' },
        }
      );
    }
  },
};

const serwist = new Serwist({
  precacheEntries: self.__SW_MANIFEST,
  skipWaiting: true,
  clientsClaim: true,
  navigationPreload: true,
  runtimeCaching: [
    // Network-with-fallback for authenticated app routes.
    // Using NetworkOnly here would cause "no-response" when the network fails
    // because NetworkOnly lets its promise reject, which Serwist converts to
    // a network-error FetchEvent response.
    {
      matcher: ({ url }) => NETWORK_ONLY_ROUTES.some((pattern) => pattern.test(url.pathname)),
      handler: networkWithFallback,
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

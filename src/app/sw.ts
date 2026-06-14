import { defaultCache } from "@serwist/next/worker";
import type { PrecacheEntry, SerwistGlobalConfig } from "serwist";
import { Serwist } from "serwist";

declare global {
  interface WorkerGlobalScope extends SerwistGlobalConfig {
    __SW_MANIFEST: (PrecacheEntry | string)[] | undefined;
  }
}

declare const self: ServiceWorkerGlobalScope;

const serwist = new Serwist({
  precacheEntries: self.__SW_MANIFEST,
  skipWaiting: true,
  clientsClaim: true,
  navigationPreload: true,
  runtimeCaching: defaultCache,
});

serwist.addEventListeners();

// =============================================================================
// Server Push handler (VAPID push server integration)
// =============================================================================

self.addEventListener("push", (event) => {
  if (!event.data) return;

  let payload: any;
  try {
    payload = event.data.json();
  } catch {
    payload = { title: "TRASON", body: event.data.text() };
  }

  event.waitUntil(
    self.registration.showNotification(payload.title || "TRASON", {
      body: payload.body || "",
      icon: "/icon-192x192.png",
      badge: "/badge-72x72.png",
      // @ts-expect-error: vibrate is standard but missing from some TypeScript DOM libs
      vibrate: [200, 100, 200],
      tag: payload.tag || "push-notification",
      data: { url: payload.url || "/dashboard" },
    })
  );
});

// =============================================================================
// Notification click handler
// =============================================================================

self.addEventListener("notificationclick", (event) => {
  event.notification.close();

  if (event.action === "dismiss") return;

  const targetUrl = event.notification.data?.url || "/reminders";

  event.waitUntil(
    self.clients
      .matchAll({ type: "window", includeUncontrolled: true })
      .then((clientList) => {
        // Focus existing tab if open
        for (const client of clientList) {
          const clientUrl = new URL(client.url);
          if (clientUrl.origin === self.location.origin) {
            client.focus();
            return client.navigate(targetUrl);
          }
        }
        // Otherwise open new tab
        return self.clients.openWindow(targetUrl);
      })
  );
});

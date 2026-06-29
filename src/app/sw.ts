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

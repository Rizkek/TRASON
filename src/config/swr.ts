import { SWRConfiguration } from 'swr';

/**
 * Global SWR Configuration
 * Ensures consistent data fetching behavior across the app
 */
export const SWR_CONFIG: SWRConfiguration = {
  // Don't automatically revalidate when window gains focus
  // (reduces unnecessary API calls when switching tabs)
  revalidateOnFocus: false,

  // Revalidate when network reconnects
  // (important for PWA offline support)
  revalidateOnReconnect: true,

  // Deduplicate requests made within this time window (ms)
  // Dinaikkan ke 10 detik agar 7 hooks dashboard tidak balapan saat mount bersamaan
  dedupingInterval: 10000,

  // After window focus, only revalidate after this interval (ms)
  // Prevents excessive revalidation on repeated focus events
  focusThrottleInterval: 300000, // 5 minutes

  // Number of times to retry failed requests
  errorRetryCount: 2,

  // Wait this long between retries (ms)
  errorRetryInterval: 5000,

  // Retry on all errors (network, 4xx, 5xx)
  shouldRetryOnError: true,

  // DIMATIKAN: revalidateIfStale = true menyebabkan semua data refetch setiap kali
  // user navigasi balik ke halaman yang sudah di-load sebelumnya (penyebab LCP tinggi).
  // Data tetap fresh karena mutate() dipanggil setelah setiap create/update/delete.
  revalidateIfStale: false,

  // Reference-equal comparison (fast)
  compare: (a: any, b: any) => a === b,
};

/**
 * Dashboard SWR Config
 * Dioptimasi untuk halaman yang load banyak hook sekaligus (7 hooks).
 * Data di-cache agresif — hanya refresh jika user eksplisit atau data berubah.
 */
export const SWR_CONFIG_DASHBOARD: SWRConfiguration = {
  ...SWR_CONFIG,
  revalidateOnFocus: false,
  revalidateOnReconnect: false,  // Jangan auto-refetch saat reconnect di dashboard
  revalidateIfStale: false,
  dedupingInterval: 30000,       // 30 detik — cukup lama untuk prevent cascading requests
  errorRetryCount: 1,
};

/**
 * Aggressive SWR Config for real-time data
 * Use for dashboards, notifications, prices
 */
export const SWR_CONFIG_REALTIME: SWRConfiguration = {
  ...SWR_CONFIG,
  revalidateOnFocus: true,      // Revalidate when tab regains focus
  focusThrottleInterval: 60000,  // But only every 1 minute
  dedupingInterval: 500,         // Tighter deduping for real-time
};

/**
 * Light SWR Config for stable data
 * Use for user profiles, settings, static content
 */
export const SWR_CONFIG_STABLE: SWRConfiguration = {
  ...SWR_CONFIG,
  revalidateOnFocus: false,
  revalidateIfStale: false,
  errorRetryCount: 1,            // Retry once only
  focusThrottleInterval: 600000, // 10 minutes
  dedupingInterval: 60000,       // 1 menit — data statis jarang berubah
};

/**
 * Offline-safe SWR Config for PWA
 * Use for data that should work offline
 */
export const SWR_CONFIG_OFFLINE: SWRConfiguration = {
  ...SWR_CONFIG,
  revalidateOnFocus: false,
  revalidateOnReconnect: true,   // Critical for PWA
  revalidateOnMount: true,       // Always load from cache first
  dedupingInterval: 5000,        // Higher dedup for reliability
};


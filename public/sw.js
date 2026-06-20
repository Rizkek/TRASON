self.addEventListener('install', () => {
  self.skipWaiting();
});

self.addEventListener('activate', () => {
  return self.clients.claim();
});

// A simple fetch handler so the browser recognizes it as a PWA
self.addEventListener('fetch', (event) => {
  // Let the browser handle everything normally
  return;
});

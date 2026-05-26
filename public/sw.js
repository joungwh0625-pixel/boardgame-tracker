const CACHE_NAME = 'bg-tracker-cache-v2';

self.addEventListener('install', (e) => {
  self.skipWaiting(); // Force the waiting service worker to become the active service worker.
  e.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll([
        '/manifest.json',
        '/icon-192x192.png',
        '/icon-512x512.png'
      ]); // Intentionally omitting '/' to prevent HTML locking
    })
  );
});

self.addEventListener('activate', (e) => {
  e.waitUntil(
    caches.keys().then((keyList) => {
      return Promise.all(keyList.map((key) => {
        if (key !== CACHE_NAME) {
          return caches.delete(key); // Delete old caches
        }
      }));
    })
  );
  self.clients.claim(); // Claim clients immediately
});

self.addEventListener('fetch', (e) => {
  // Network-first strategy
  e.respondWith(
    fetch(e.request)
      .catch(() => {
        return caches.match(e.request);
      })
  );
});

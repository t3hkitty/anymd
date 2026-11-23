// Meow Anymd Service Worker for Standalone PWA & Web Share Target
const CACHE_NAME = 'anymd-meow-v3.8';

self.addEventListener('install', (event) => {
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) => {
      return Promise.all(
        keys.map((key) => {
          if (key !== CACHE_NAME) {
            return caches.delete(key);
          }
        })
      );
    }).then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', (event) => {
  // Let network handle dynamic requests, with cache fallback
  if (event.request.method !== 'GET') return;

  event.respondWith(
    fetch(event.request).catch(() => caches.match(event.request))
  );
});

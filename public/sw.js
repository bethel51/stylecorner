const CACHE_NAME = 'style-corner-v10';
const PRECACHE_ASSETS = [
  '/',
  '/index.html',
  '/manifest.json',
  '/pwa-icon-192.png',
  '/pwa-icon-512.png'
];

// 1. Install Event — Pre-cache critical app shell and skip waiting immediately
self.addEventListener('install', (event) => {
  self.skipWaiting();
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(PRECACHE_ASSETS);
    })
  );
});

// 2. Activate Event — Immediately claim clients and purge all older cache versions
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((name) => {
          if (name !== CACHE_NAME) {
            console.log('[PWA SW] Purging old cache version:', name);
            return caches.delete(name);
          }
        })
      );
    }).then(() => self.clients.claim())
  );
});

// Message Event — Support skip waiting, cache purge, or clean unregister
self.addEventListener('message', (event) => {
  if (event.data) {
    if (event.data.type === 'SKIP_WAITING') {
      self.skipWaiting();
    } else if (event.data.type === 'PURGE_ALL') {
      caches.keys().then((names) => Promise.all(names.map((n) => caches.delete(n))));
    } else if (event.data.type === 'UNREGISTER') {
      self.registration.unregister();
    }
  }
});

// 3. Fetch Event — Network-First for HTML navigation (with fallback to offline cache)
// Stale-While-Revalidate for static assets (JS, CSS, images)
self.addEventListener('fetch', (event) => {
  // Never intercept non-GET or backend API requests
  if (event.request.method !== 'GET') return;
  if (event.request.url.includes('/api/')) return;

  const url = new URL(event.request.url);

  // Navigation requests (HTML) — Network First, wait for server (e.g. Render spin-up), fallback only when offline
  if (event.request.mode === 'navigate' || url.pathname.endsWith('.html')) {
    event.respondWith(
      fetch(event.request)
        .then((networkRes) => {
          if (networkRes && networkRes.status === 200) {
            const resClone = networkRes.clone();
            caches.open(CACHE_NAME).then((cache) => cache.put('/index.html', resClone));
          }
          return networkRes;
        })
        .catch(() => {
          // Fallback to cached index.html only if completely offline
          return caches.match('/index.html');
        })
    );
    return;
  }

  // Static Assets (Hashed JS/CSS, images, fonts)
  event.respondWith(
    caches.match(event.request).then((cachedResponse) => {
      const fetchPromise = fetch(event.request).then((networkResponse) => {
        if (networkResponse && networkResponse.status === 200) {
          const resClone = networkResponse.clone();
          caches.open(CACHE_NAME).then((cache) => cache.put(event.request, resClone));
        } else if (networkResponse && (networkResponse.status === 404 || networkResponse.status >= 400)) {
          caches.open(CACHE_NAME).then((cache) => cache.delete(event.request));
        }
        return networkResponse;
      }).catch(() => {
        // Network fail silently for cached assets
      });

      return cachedResponse || fetchPromise;
    })
  );
});

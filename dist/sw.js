const CACHE_NAME = 'style-corner-v3';
const PRECACHE_ASSETS = [
  '/',
  '/index.html',
  '/manifest.json',
  '/pwa-icon-192.png',
  '/pwa-icon-512.png'
];

// 1. Install Event — Pre-cache critical app shell and skip waiting immediately
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(PRECACHE_ASSETS);
    })
  );
  self.skipWaiting();
});

// 2. Activate Event — Immediately claim clients and purge old cache versions
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((name) => {
          if (name !== CACHE_NAME) {
            console.log('[PWA SW] Purging old cache:', name);
            return caches.delete(name);
          }
        })
      );
    })
  );
  self.clients.claim();
});

// Message Event — Force activate if requested by app
self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
});

// 3. Fetch Event — Network-First with 2.5s Timeout for navigation, Cache-First for static assets
self.addEventListener('fetch', (event) => {
  // Never intercept POST/PUT/DELETE or API requests
  if (event.request.method !== 'GET') return;
  if (event.request.url.includes('/api/')) return;

  const url = new URL(event.request.url);

  // Navigation requests (HTML) — Network First with 2.5s fast timeout fallback
  if (event.request.mode === 'navigate' || url.pathname.endsWith('.html')) {
    event.respondWith(
      new Promise((resolve) => {
        let timeoutTriggered = false;
        const timer = setTimeout(() => {
          timeoutTriggered = true;
          caches.match('/index.html').then((cached) => {
            if (cached) resolve(cached);
          });
        }, 2500);

        fetch(event.request)
          .then((networkRes) => {
            clearTimeout(timer);
            if (networkRes && networkRes.status === 200) {
              const resClone = networkRes.clone();
              caches.open(CACHE_NAME).then((cache) => cache.put('/index.html', resClone));
            }
            if (!timeoutTriggered) resolve(networkRes);
          })
          .catch(() => {
            clearTimeout(timer);
            caches.match('/index.html').then((cached) => resolve(cached));
          });
      })
    );
    return;
  }

  // Static Assets (Hashed JS/CSS, images, fonts) — Stale-While-Revalidate for maximum speed
  event.respondWith(
    caches.match(event.request).then((cachedResponse) => {
      const fetchPromise = fetch(event.request).then((networkResponse) => {
        if (networkResponse && networkResponse.status === 200) {
          const resClone = networkResponse.clone();
          caches.open(CACHE_NAME).then((cache) => cache.put(event.request, resClone));
        }
        return networkResponse;
      }).catch((err) => {
        // Network fail silently for cached assets
      });

      return cachedResponse || fetchPromise;
    })
  );
});

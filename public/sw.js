// =====================================================================
// NOC Portal - Progressive Web App Service Worker (v1.0.0)
// =====================================================================

const CACHE_NAME = 'noc-portal-v1.0.0';
const STATIC_ASSETS = [
  '/',
  '/index.html',
  '/manifest.json',
  '/pwa-icon-192.svg',
  '/pwa-icon-512.svg',
  '/pwa-icon-maskable.svg',
  '/favicon.svg'
];

// Install Event - Pre-cache core shell
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(STATIC_ASSETS).catch((err) => {
        console.warn('PWA: Pre-caching non-fatal warning:', err);
      });
    })
  );
  self.skipWaiting();
});

// Activate Event - Clean old caches
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
    })
  );
  self.clients.claim();
});

// Fetch Event - Network First with Cache Fallback for dynamic/HTML, Cache First for static
self.addEventListener('fetch', (event) => {
  const url = new URL(event.request.url);

  // Skip non-GET requests or browser-extension/supabase websocket calls
  if (event.request.method !== 'GET' || url.protocol === 'chrome-extension:' || url.pathname.includes('/realtime/')) {
    return;
  }

  // Handle Navigation (HTML Pages) - Network first, fallback to cached / or /index.html
  if (event.request.mode === 'navigate') {
    event.respondWith(
      fetch(event.request)
        .then((response) => {
          if (response && response.status === 200) {
            const clone = response.clone();
            caches.open(CACHE_NAME).then((cache) => cache.put(event.request, clone));
          }
          return response;
        })
        .catch(async () => {
          const cached = await caches.match(event.request);
          if (cached) return cached;
          return caches.match('/index.html') || caches.match('/');
        })
    );
    return;
  }

  // Handle Static Assets (images, fonts, css, scripts)
  event.respondWith(
    caches.match(event.request).then((cachedResponse) => {
      if (cachedResponse) {
        // Fetch in background to revalidate cache
        fetch(event.request).then((networkResponse) => {
          if (networkResponse && networkResponse.status === 200) {
            caches.open(CACHE_NAME).then((cache) => cache.put(event.request, networkResponse));
          }
        }).catch(() => {});
        return cachedResponse;
      }

      return fetch(event.request)
        .then((response) => {
          if (response && response.status === 200 && (url.origin === location.origin || url.hostname.includes('fonts.'))) {
            const responseToCache = response.clone();
            caches.open(CACHE_NAME).then((cache) => cache.put(event.request, responseToCache));
          }
          return response;
        })
        .catch(() => {
          // Offline fallback
          return caches.match('/index.html');
        });
    })
  );
});

// Push Notification Event (Web Push integration)
self.addEventListener('push', (event) => {
  let data = {
    title: 'NOC Portal Notification',
    body: 'A new update is available in the NOC Portal.',
    url: '/'
  };

  try {
    if (event.data) {
      data = event.data.json();
    }
  } catch (e) {
    if (event.data) {
      data.body = event.data.text();
    }
  }

  const options = {
    body: data.body || data.message,
    icon: '/pwa-icon-192.svg',
    badge: '/favicon.svg',
    vibrate: [100, 50, 100],
    data: {
      url: data.url || (data.requestId ? `/requests/${data.requestId}` : '/')
    },
    actions: [
      { action: 'open', title: 'Open Case' }
    ]
  };

  event.waitUntil(
    self.registration.showNotification(data.title || 'NOC Approval Update', options)
  );
});

// Notification Click Handler - Focus or Open Window
self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  const targetUrl = event.notification.data?.url || '/';

  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then((windowClients) => {
      for (let client of windowClients) {
        if (client.url.includes(location.origin) && 'focus' in client) {
          client.navigate(targetUrl);
          return client.focus();
        }
      }
      if (clients.openWindow) {
        return clients.openWindow(targetUrl);
      }
    })
  );
});

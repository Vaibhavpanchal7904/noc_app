// =====================================================================
// NOC Portal - Progressive Web App Service Worker (v1.0.2)
// =====================================================================

const CACHE_NAME = 'noc-portal-v1.0.2';
const PRECACHE_ASSETS = [
  '/',
  '/index.html',
  '/manifest.json',
  '/pwa-icon-192.svg',
  '/pwa-icon-512.svg',
  '/pwa-icon-maskable.svg',
  '/favicon.svg'
];

// Install Event - Pre-cache core shell & force immediate activation
self.addEventListener('install', (event) => {
  self.skipWaiting();
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(PRECACHE_ASSETS).catch((err) => {
        console.warn('PWA: Pre-cache warning:', err);
      });
    })
  );
});

// Activate Event - Clean all old/stale caches & claim clients immediately
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) => {
      return Promise.all(
        keys.map((key) => {
          if (key !== CACHE_NAME) {
            console.log('PWA: Removing old cache', key);
            return caches.delete(key);
          }
        })
      );
    }).then(() => self.clients.claim())
  );
});

// Fetch Event - Network First for all HTML navigation, Stale-while-revalidate for static assets
self.addEventListener('fetch', (event) => {
  const url = new URL(event.request.url);

  // Skip non-GET requests or external/supabase/realtime/extension calls
  if (
    event.request.method !== 'GET' ||
    url.protocol === 'chrome-extension:' ||
    url.pathname.includes('/realtime/') ||
    url.pathname.includes('/rest/v1/')
  ) {
    return;
  }

  // Handle HTML navigation (pages) - Network First, fallback to cached /index.html
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
          return caches.match('/index.html');
        })
    );
    return;
  }

  // For JS / CSS / Media - Fetch from network, fallback to cache if offline
  // NEVER return HTML for a JS or CSS file!
  event.respondWith(
    fetch(event.request)
      .then((networkResponse) => {
        if (networkResponse && networkResponse.status === 200 && url.origin === location.origin) {
          const responseToCache = networkResponse.clone();
          caches.open(CACHE_NAME).then((cache) => cache.put(event.request, responseToCache));
        }
        return networkResponse;
      })
      .catch(async () => {
        const cached = await caches.match(event.request);
        if (cached) return cached;
        // Do NOT return /index.html for failed JS/CSS requests
        return new Response('Network error and asset not in offline cache', {
          status: 408,
          headers: { 'Content-Type': 'text/plain' }
        });
      })
  );
});

// Push Notification Event (Web Push)
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

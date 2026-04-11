// ShiftPro Push Notification Service Worker
// This file must be at /public/sw.js (served from root)

self.addEventListener('install', (event) => {
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(clients.claim());
});

// Handle incoming push messages
self.addEventListener('push', (event) => {
  const defaultData = {
    title: 'ShiftPro',
    body: 'You have a new notification',
    icon: '/icon-192.png',
    badge: '/icon-badge.png',
    tag: 'shiftpro-' + Date.now(),
    data: { url: '/' },
  };

  let data = defaultData;
  try {
    if (event.data) {
      const parsed = event.data.json();
      data = { ...defaultData, ...parsed };
    }
  } catch (e) {
    if (event.data) {
      data.body = event.data.text();
    }
  }

  const options = {
    body: data.body,
    icon: data.icon || '/icon-192.png',
    badge: data.badge || '/icon-badge.png',
    tag: data.tag || defaultData.tag,
    renotify: true,
    requireInteraction: data.requireInteraction || false,
    data: data.data || { url: '/' },
    actions: data.actions || [],
    vibrate: [100, 50, 100],
  };

  event.waitUntil(
    self.registration.showNotification(data.title, options)
  );
});

// Handle notification click — open the app
self.addEventListener('notificationclick', (event) => {
  event.notification.close();

  const url = event.notification.data?.url || '/';

  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then((windowClients) => {
      // If app is already open, focus it
      for (const client of windowClients) {
        if (client.url.includes('shiftpro.ai') && 'focus' in client) {
          return client.focus();
        }
      }
      // Otherwise open new window
      return clients.openWindow(url);
    })
  );
});

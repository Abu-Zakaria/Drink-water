/* eslint-disable-next-line no-redeclare */
/* global self */

// This service worker file is effectively a 'no-op' that will reset any
// previous service worker registered for the same host:port combination.

// It is read and returned by a dev server middleware that is only loaded
// during development.

// In the production build, this file is replaced with an actual service worker
// file that will precache your site's local assets.

import { precacheAndRoute } from 'workbox-precaching';

precacheAndRoute(self.__WB_MANIFEST);

self.addEventListener('install', () => self.skipWaiting())

self.addEventListener('fetch', () => {})

self.addEventListener('activate', () => {
    self.clients.matchAll({ type: 'window' }).then(windowClients => {
        for (const windowClient of windowClients) {
            // Force open pages to refresh, so that they have a chance to load the
            // fresh navigation response from the local dev server.
            windowClient.navigate(windowClient.url)
        }
    });


});

const channel = new BroadcastChannel('drink-water');

self.addEventListener('notificationclick', (event) => {
    if (event.action == 'took-a-sip') {
        channel.postMessage({
            action: 'took-sip',
        });
        return;
    }

    event.waitUntil(clients.matchAll({
        type: "window"
    }).then((clientList) => {
        for (const client of clientList) {
            if ('focus' in client) {
                return client.focus();
            }
        }

        if (clients.openWindow) {
            return clients.openWindow('/');
        }
    }))
});

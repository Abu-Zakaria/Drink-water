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

const getRandomQuote = () => {
    const quotes = [
        "Water is the elixir of life, drink up and stay hydrated",
        "Drink water, it will clear your mind, rejuvenate your body and hydrate your soul.",
        "Drinking water is like giving your body a hug from the inside out.",
        "Stay hydrated, my friends. Water is the foundation of a healthy life.",
        "Water is the key to unlock the full potential of your body and mind.",
        "Drinking water is like taking a bath for the inside of your body.",
        "Drinking water regularly is like giving your body a spa day every day.",
        "Water is the essence of life, drink up and flourish.",
        "Water is the most essential ingredient for a healthy and thriving life.",
        "Drink water and watch your health soar, your skin glow and your energy flow.",
        "Water is the magic potion for a healthy mind, body, and soul.",
        "Drinking water is like giving your cells a revitalizing shower.",
        "Water is the life force that keeps you going, so drink up and keep the energy flowing.",
        "Stay hydrated, drink water, and watch your body transform.",
        "Water is the source of all life, so make sure to drink enough every day.",
        "Drinking water is like taking a dive into a pool of good health and wellness.",
        "Water is the foundation of a healthy lifestyle, so make sure to drink plenty of it.",
        "Drink water, it's like giving your body a drink of pure energy.",
    ];
    const randomIndex = Math.floor(Math.random() * quotes.length);
    return quotes[randomIndex];
}

const channel = new BroadcastChannel('drink-water');

channel.onmessage = (message) => {
    if (message.data.action === "show-notification") {
        const quote = getRandomQuote();
        const options = {
            body: quote,
            icon: "/img/logo.png",
            vibrate: [200, 100, 100, 100, 400],
            actions: [
                {
                    action: "took-a-sip",
                    title: "Took a sip",
                    type: "button",
                },
            ],
        };
        const title = "Time to take a sip";

        self.registration.showNotification(title, options);
    } else if (message.data.action === 'clear-notifications') {
        self.registration.getNotifications().then(notifications => {
            notifications.forEach(notification => {
                notification.close();
            });
        });
    }
}

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

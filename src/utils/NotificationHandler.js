const icon = "/img/logo.png";

const getSWRegister = () => {
    return navigator.serviceWorker.ready;
}

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

const defaultNotificationConfig = {
    silent: false,
    requireInteraction: true,
};

export default {
    drinkReminder: () => {
        const quote = getRandomQuote();
        const options = {
            body: quote,
            icon: icon,
            vibrate: [200, 100, 100, 100, 400],
            actions: [
                {
                    action: "took-a-sip",
                    title: "Took a sip",
                    type: "button",
                },
            ],
            ...defaultNotificationConfig,
        };
        const title = "Time to take a sip";

        getSWRegister().then(register => {
            register.showNotification(title, options);
        });
    },
    clearNotifcations: () => {
        getSWRegister().then(register => {
            register.getNotifications().then(notifications => {
                notifications.forEach(notification => {
                    notification.close();
                });
            });
        });
    },
    updatingFiles: () => {
        const options = {
            body: "Some new features are available now 😁",
            icon: icon,
            ...defaultNotificationConfig,
        }
        const title = "Installing updates";

        getSWRegister().then(register => {
            register.showNotification(title, options);
        });
    },
    installed: () => {
        const options = {
            icon: icon,
            ...defaultNotificationConfig,
        }
        const title = "Installation successful! ✌️";

        getSWRegister().then(register => {
            register.showNotification(title, options); 
        })
    }
}
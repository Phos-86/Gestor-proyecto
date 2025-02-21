self.addEventListener('install', (event) => {
    console.log('Service Worker installing.');
    // Cache resources here if needed
});

self.addEventListener('activate', (event) => {
    console.log('Service Worker activating.');
    // Take control of all pages under this scope
});

self.addEventListener('fetch', (event) => {
    console.log('Fetching:', event.request.url);
    // Add fetch event handling logic here
});

self.addEventListener('push', (event) => {
    const data = event.data.json();
    const title = data.title;
    const options = {
        body: data.message,
        icon: 'huchita.png', // Path to your notification icon
        badge: 'hucha.png' // Path to your badge icon
    };

    event.waitUntil(
        self.registration.showNotification(title, options)
    );
});
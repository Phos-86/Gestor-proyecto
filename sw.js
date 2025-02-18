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

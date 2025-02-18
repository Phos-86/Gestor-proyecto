const CACHE_NAME = 'gestor'; // Make CACHE_NAME a string
const urlsToCache = [
  '/Gestor-proyecto/',
  '/Gestor-proyecto/index.html',
  '/Gestor-proyecto/app.js',
  '/Gestor-proyecto/manifest.json',
  '/Gestor-proyecto/huchita.png',
  '/Gestor-proyecto/hucha.png'
];

// Install the service worker and cache the assets
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => cache.addAll(urlsToCache)) // Use urlsToCache instead of gestor
  );
});

// Fetch event to serve cached assets
self.addEventListener('fetch', (event) => {
  event.respondWith(
    caches.match(event.request)
      .then((response) => response || fetch(event.request))
  );
});
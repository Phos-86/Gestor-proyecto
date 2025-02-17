const CACHE_NAME = 'gestor-proyecto-v1';
const ASSETS = [
  '/Gestor-proyecto/proyecto.html',
  '/Gestor-proyecto/styles.css',
  '/Gestor-proyecto/script.js',
  '/Gestor-proyecto/icon-192x192.png',
  '/Gestor-proyecto/icon-512x512.png'
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => cache.addAll(ASSETS))
  );
});

self.addEventListener('fetch', (event) => {
  event.respondWith(
    caches.match(event.request)
      .then((response) => response || fetch(event.request))
  );
});

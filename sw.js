const CACHE_NAME = 'gestor-proyecto-v1';
const ASSETS = [
  '/Gestor-proyecto/proyecto.html',
  '/Gestor-proyecto/script.js',
  '/Gestor-proyecto/huchita.png',
  '/Gestor-proyecto/hucha.png'
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

const CACHE_NAME = 'gestor';
const urlsToCache = [
  '/Gestor-proyecto/',
  '/Gestor-proyecto/index.html',
  '/Gestor-proyecto/app.js',
  '/Gestor-proyecto/manifest.json',
  '/Gestor-proyecto/huchita.png',
  '/Gestor-proyecto/hucha.png'
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => cache.addAll('gestor'))
  );
});

self.addEventListener('fetch', (event) => {
  event.respondWith(
    caches.match(event.request)
      .then((response) => response || fetch(event.request))
  );
});

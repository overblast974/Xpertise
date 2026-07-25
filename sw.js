// Service worker : app shell en cache, fonctionnement 100 % hors-ligne.
const CACHE = 'xpertise-v5';
const ASSETS = [
  './',
  './index.html',
  './manifest.webmanifest',
  './css/style.css',
  './js/app.js',
  './js/db.js',
  './js/metrics.js',
  './js/parser.js',
  './js/charts.js',
  './js/ui.js',
  './js/advice.js',
  './js/plan.js',
  './js/nutrition.js',
  './js/knowledge/coaching.js',
  './js/knowledge/nutrition.js',
  './js/views/dashboard.js',
  './js/views/workouts.js',
  './js/views/analysis.js',
  './js/views/plan.js',
  './js/views/nutrition.js',
  './js/views/profile.js',
  './icons/icon-192.png',
  './icons/icon-512.png',
  './icons/icon-maskable-512.png',
];

self.addEventListener('install', e => {
  e.waitUntil(caches.open(CACHE).then(c => c.addAll(ASSETS)).then(() => self.skipWaiting()));
});

self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys()
      .then(keys => Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

// réseau d'abord pour la navigation (mises à jour), cache d'abord pour le reste
self.addEventListener('fetch', e => {
  if (e.request.method !== 'GET') return;
  if (e.request.mode === 'navigate') {
    e.respondWith(
      fetch(e.request)
        .then(r => { const copy = r.clone(); caches.open(CACHE).then(c => c.put(e.request, copy)); return r; })
        .catch(() => caches.match(e.request).then(r => r || caches.match('./index.html')))
    );
    return;
  }
  e.respondWith(
    caches.match(e.request).then(cached => cached || fetch(e.request).then(r => {
      if (r.ok && new URL(e.request.url).origin === location.origin) {
        const copy = r.clone();
        caches.open(CACHE).then(c => c.put(e.request, copy));
      }
      return r;
    }))
  );
});

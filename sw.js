const CACHE_NAME = 'essiaw-portfolio-v1';
const PRECACHE_ASSETS = [
  './',
  'index.html',
  'resume.html',
  'resume.pdf',
  'styles.css',
  'script.js',
  'manifest.json',
  'profile.jpg',
  'og-card.png',
  'assets/projects/sweetbite.jpg',
  'assets/projects/emergency.jpg',
  'assets/projects/patron.jpg',
  'assets/projects/bizconnect.svg',
  'assets/projects/kelrose.svg'
];

// Install Event: Pre-cache core application shell
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(PRECACHE_ASSETS);
    }).then(() => self.skipWaiting())
  );
});

// Activate Event: Clear outdated caches
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((name) => {
          if (name !== CACHE_NAME) {
            return caches.delete(name);
          }
        })
      );
    }).then(() => self.clients.claim())
  );
});

// Fetch Event: Stale-While-Revalidate with network fallback
self.addEventListener('fetch', (event) => {
  // Ignore non-GET requests and external analytics (GoatCounter)
  if (event.request.method !== 'GET') return;
  const url = new URL(event.request.url);
  if (url.origin !== self.location.origin) return;

  event.respondWith(
    caches.match(event.request).then((cachedResponse) => {
      const fetchPromise = fetch(event.request)
        .then((networkResponse) => {
          if (networkResponse && networkResponse.status === 200 && networkResponse.type === 'basic') {
            const responseToCache = networkResponse.clone();
            caches.open(CACHE_NAME).then((cache) => {
              cache.put(event.request, responseToCache);
            });
          }
          return networkResponse;
        })
        .catch(() => {
          // If offline and requesting an HTML page, fallback to cached index
          if (event.request.headers.get('accept')?.includes('text/html')) {
            return caches.match('index.html');
          }
        });

      return cachedResponse || fetchPromise;
    })
  );
});

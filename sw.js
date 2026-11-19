const CACHE_NAME = 'presensi-kiosk-v4'; // Naikkan versi agar SW lama otomatis terhapus
const urlsToCache = [
  '/',
  '/index.html',
  'https://unpkg.com/html5-qrcode',
  'https://cdn.pixabay.com/download/audio/2021/08/04/audio_0625c1539c.mp3'
];

self.addEventListener('install', event => {
  self.skipWaiting();
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => cache.addAll(urlsToCache))
  );
});

self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cacheName => {
          if (cacheName !== CACHE_NAME) return caches.delete(cacheName);
        })
      );
    }).then(() => self.clients.claim())
  );
});

// STRATEGI: NETWORK FIRST (KHUSUS FILE STATIS GET, JANGAN CEGAT POST / GOOGLE SCRIPT)
self.addEventListener('fetch', event => {
  if (
    event.request.method !== 'GET' ||
    event.request.url.includes('script.google.com') ||
    event.request.url.includes('script.googleusercontent.com')
  ) {
    return;
  }

  event.respondWith(
    fetch(event.request).then(response => {
      if (response && response.status === 200) {
        const responseClone = response.clone();
        caches.open(CACHE_NAME).then(cache => {
          cache.put(event.request, responseClone).catch(() => {});
        });
      }
      return response;
    }).catch(() => {
      return caches.match(event.request).then(response => {
        return response || caches.match('/index.html');
      });
    })
  );
});

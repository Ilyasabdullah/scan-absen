const CACHE_NAME = 'presensi-kiosk-v3'; // Naikkan versi cache
const urlsToCache = [
  '/',
  '/index.html',
  'https://unpkg.com/html5-qrcode',
  'https://cdn.pixabay.com/download/audio/2021/08/04/audio_0625c1539c.mp3'
];

self.addEventListener('install', event => {
  self.skipWaiting(); // Memaksa SW baru langsung menimpa yang lama
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => cache.addAll(urlsToCache))
  );
});

self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cacheName => {
          // Hapus semua memori cache versi lama
          if (cacheName !== CACHE_NAME) return caches.delete(cacheName); 
        })
      );
    }).then(() => self.clients.claim()) 
  );
});

// STRATEGI: NETWORK FIRST (Selalu ambil update terbaru dari Vercel jika internet nyala)
self.addEventListener('fetch', event => {
  event.respondWith(
    fetch(event.request).then(response => {
      // Jika berhasil ambil dari internet, simpan ke cache sebagai backup
      return caches.open(CACHE_NAME).then(cache => {
        cache.put(event.request, response.clone());
        return response;
      });
    }).catch(() => {
      // Jika internet mati (fetch gagal), baru keluarkan dari cache
      return caches.match(event.request).then(response => {
         return response || caches.match('/index.html');
      });
    })
  );
});

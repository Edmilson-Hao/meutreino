// sw.js - Gorilla Gang V7 (Atualizado 23/11/2025)
const CACHE_NAME = 'gorilla-gang-v7';
const ASSETS = [
  '/',
  '/index.html',
  '/treino.html',
  '/historico.html',
  '/style.css',
  '/treino.js',
  '/historico.js',
  '/manifest.json',
  '/gorilla-192.png',
  '/gorilla-512.png'
  // Removi o Chart.js CDN por enquanto — cacheia local se possível, ou fetch online
];

self.addEventListener('install', e => {
  console.log('SW: Instalando...'); // Pra debug
  e.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        console.log('SW: Cache aberto');
        return cache.addAll(ASSETS).catch(err => {
          console.error('SW: Erro no cache:', err); // Ignora falhas em assets
        });
      })
  );
  self.skipWaiting(); // Ativa imediatamente
});

self.addEventListener('activate', e => {
  console.log('SW: Ativando...');
  e.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cache => {
          if (cache !== CACHE_NAME) {
            return caches.delete(cache); // Limpa caches velhos
          }
        })
      );
    })
  );
  self.clients.claim(); // Assume controle imediato
});

self.addEventListener('fetch', e => {
  e.respondWith(
    caches.match(e.request)
      .then(response => {
        if (response) {
          return response; // Cache hit
        }
        // Se não tem cache, tenta fetch online
        return fetch(e.request).catch(() => {
          console.error('SW: Offline e sem cache:', e.request.url);
          // Fallback: página offline simples
          return new Response('Offline: Volte online pra treinar! 🦍', {
            status: 503,
            statusText: 'Service Unavailable'
          });
        });
      })
  );
});
// sw.js - Gorilla Gang V7 (Corrigido pra GitHub Pages /meutreino/ - 24/11/2025)
const CACHE_NAME = 'gorilla-gang-v7';
const BASE_PATH = '/meutreino/';  // Scope pro seu repo
const ASSETS = [
  BASE_PATH,  // /
  BASE_PATH + 'index.html',
  BASE_PATH + 'treino.html',
  BASE_PATH + 'historico.html',
  BASE_PATH + 'style.css',
  BASE_PATH + 'treino.js',
  BASE_PATH + 'historico.js',
  BASE_PATH + 'manifest.json',
  BASE_PATH + 'gorilla-192.png',
  BASE_PATH + 'gorilla-512.png',
  BASE_PATH + 'chart.js'  // Se você baixou o Chart.js local
];

self.addEventListener('install', e => {
  console.log('SW: Instalando no /meutreino/...');
  e.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        console.log('SW: Cache aberto');
        return cache.addAll(ASSETS).catch(err => {
          console.error('SW: Erro no cache (ignora falhas):', err);
        });
      })
  );
  self.skipWaiting();  // Ativa na hora
});

self.addEventListener('activate', e => {
  console.log('SW: Ativando...');
  e.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cache => {
          if (cache !== CACHE_NAME) {
            return caches.delete(cache);  // Limpa velhos
          }
        })
      );
    })
  );
  self.clients.claim();  // Controle imediato
});

self.addEventListener('fetch', e => {
  // Corrige paths pro repo
  let requestUrl = e.request.url;
  if (requestUrl.indexOf(BASE_PATH) === -1) {
    requestUrl = BASE_PATH + new URL(requestUrl).pathname.replace(/^\//, '');
  }
  
  e.respondWith(
    caches.match(e.request)
      .then(response => {
        if (response) return response;
        return fetch(requestUrl).catch(() => {
          console.error('SW: Offline fallback:', requestUrl);
          return new Response('Offline: Conecte pra treinar! 🦍', { status: 503 });
        });
      })
  );
});

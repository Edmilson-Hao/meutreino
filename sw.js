// sw.js - Service Worker do Gorilla Gang V7
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
  '/gorilla-512.png',
  // Chart.js (usado no histórico)
  'https://cdn.jsdelivr.net/npm/chart.js'
];

self.addEventListener('install', e => {
  e.waitUntil(
    caches.open(CACHE_NAME).then(cache => {
      return cache.addAll(ASSETS);
    })
  );
});

self.addEventListener('fetch', e => {
  e.respondWith(
    caches.match(e.request).then(response => {
      return response || fetch(e.request);
    })
  );
});
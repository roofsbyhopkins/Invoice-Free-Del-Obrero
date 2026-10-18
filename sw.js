/* Invoice Free del Obrero — offline support. Bump VERSION when you change files. */
const VERSION = 'obrero-v27';
const SHELL = ['./', './index.html', './manifest.webmanifest', './roofer.png', './cloud.js', './config.js', './icon-192.png', './icon-512.png'];
const CDN = [
  'https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js',
  'https://cdnjs.cloudflare.com/ajax/libs/jspdf-autotable/3.8.2/jspdf.plugin.autotable.min.js',
  'https://cdnjs.cloudflare.com/ajax/libs/qrcode-generator/1.4.4/qrcode.min.js',
  'https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2.45.4/dist/umd/supabase.js',
  'https://cdn.jsdelivr.net/npm/bip39@3.1.0/src/wordlists/english.json'
];
self.addEventListener('install', e => {
  e.waitUntil(caches.open(VERSION).then(c => c.addAll(SHELL).then(() => Promise.all(CDN.map(u => c.add(u).catch(() => {}))))));
  self.skipWaiting();
});
self.addEventListener('activate', e => {
  e.waitUntil(caches.keys().then(keys => Promise.all(keys.filter(k => k !== VERSION).map(k => caches.delete(k)))));
  self.clients.claim();
});
self.addEventListener('fetch', e => {
  const url = new URL(e.request.url);
  if (e.request.method !== 'GET' || url.hostname === 'api.coingecko.com' || url.hostname.endsWith('supabase.co')) return; // live prices: never cache
  // App files: network first (get updates), fall back to cache when offline
  if (url.origin === location.origin) {
    e.respondWith(fetch(e.request).then(r => { const copy = r.clone(); caches.open(VERSION).then(c => c.put(e.request, copy)); return r; }).catch(() => caches.match(e.request).then(r => r || caches.match('./index.html'))));
    return;
  }
  // Libraries and fonts: cache first
  e.respondWith(caches.match(e.request).then(r => r || fetch(e.request).then(res => { const copy = res.clone(); caches.open(VERSION).then(c => c.put(e.request, copy)); return res; })));
});

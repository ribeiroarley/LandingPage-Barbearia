// Service worker — cache do shell da aplicação para abertura instantânea e modo offline
const CACHE = "dom-rocha-v5";
const ASSETS = [
  "./",
  "./index.html",
  "./manifest.json",
  "./assets/css/style.css",
  "./assets/js/app.js",
  "./assets/js/config.js",
  "./assets/js/store.js",
  "./assets/js/calendar.js",
  "./assets/js/checkout.js",
  "./assets/js/whatsapp.js",
  "./assets/img/hero.webp",
  "./assets/img/icons/icon-192.png",
  "./assets/img/icons/icon-512.png"
];

self.addEventListener("install", e => {
  e.waitUntil(caches.open(CACHE).then(c => c.addAll(ASSETS)).then(() => self.skipWaiting()));
});
self.addEventListener("activate", e => {
  e.waitUntil(caches.keys().then(keys => Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k)))).then(() => self.clients.claim()));
});
self.addEventListener("fetch", e => {
  const req = e.request;
  if (req.method !== "GET") return;
  e.respondWith(
    caches.match(req).then(hit => hit || fetch(req).then(res => {
      const copy = res.clone();
      caches.open(CACHE).then(c => c.put(req, copy)).catch(() => {});
      return res;
    }).catch(() => caches.match("./index.html")))
  );
});

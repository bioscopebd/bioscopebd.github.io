/* Offline app shell; remote sample artwork is cached as it is viewed. */
const VERSION = "bioscopebd-v2";
const SHELL = `${VERSION}-shell`;
const MEDIA = `${VERSION}-media`;
const APP_FILES = ["./", "./index.html", "./style.css", "./config.js", "./script.js", "./manifest.json",
  "./icons/icon-192.png", "./icons/icon-512.png", "./icons/apple-touch-icon-180.png"];

self.addEventListener("install", event => {
  event.waitUntil(caches.open(SHELL).then(cache => cache.addAll(APP_FILES)).then(() => self.skipWaiting()));
});

self.addEventListener("activate", event => {
  event.waitUntil(Promise.all([
    caches.keys().then(keys => Promise.all(keys.filter(key => ![SHELL, MEDIA].includes(key)).map(key => caches.delete(key)))),
    self.clients.claim()
  ]));
});

self.addEventListener("fetch", event => {
  const request = event.request;
  if (request.method !== "GET") return;
  const url = new URL(request.url);
  if (url.origin === self.location.origin) {
    event.respondWith(caches.match(request).then(cached => cached || fetch(request).then(response => {
      if (response.ok) caches.open(SHELL).then(cache => cache.put(request, response.clone()));
      return response;
    }).catch(() => caches.match("./index.html"))));
    return;
  }
  if (request.destination === "image" || request.destination === "font") {
    event.respondWith(caches.open(MEDIA).then(async cache => {
      const cached = await cache.match(request);
      if (cached) return cached;
      const response = await fetch(request);
      if (response.ok || response.type === "opaque") {
        await cache.put(request, response.clone());
        const keys = await cache.keys();
        if (keys.length > 60) await cache.delete(keys[0]);
      }
      return response;
    }));
  }
});

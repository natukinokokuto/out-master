const CACHE_NAME = "out-master-v10-13-8-force-update";
const VERSION = "10138";
const ASSETS = [
  "./",
  "./index.html?v=10138",
  "./manifest.json?v=10138",
  "./assets/bgm.mp3",
  "./assets/menu-bg.jpg",
  "./assets/se/button.wav",
  "./assets/se/single.wav",
  "./assets/se/double.wav",
  "./assets/se/triple.wav",
  "./assets/se/bull.wav",
  "./assets/se/good.mp3",
  "./assets/se/perfect.mp3",
  "./assets/se/miss.wav",
  "./icon-192.png",
  "./icon-512.png"
];

self.addEventListener("install", (event) => {
  self.skipWaiting();
  event.waitUntil(caches.open(CACHE_NAME).then((cache) => cache.addAll(ASSETS)));
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys()
      .then((keys) => Promise.all(keys.map((key) => key === CACHE_NAME ? null : caches.delete(key))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener("fetch", (event) => {
  const req = event.request;
  if (req.mode === "navigate" || req.destination === "document") {
    event.respondWith(
      fetch(req).catch(() => caches.match("./index.html?v=10138").then((cached) => cached || caches.match("./")))
    );
    return;
  }
  event.respondWith(
    caches.match(req).then((cached) => cached || fetch(req).then((res) => {
      const copy = res.clone();
      caches.open(CACHE_NAME).then((cache) => cache.put(req, copy));
      return res;
    }))
  );
});

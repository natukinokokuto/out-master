const CACHE_NAME = "out-master-v10-13-6-recovery";
const ASSETS = [
  "./",
  "./index.html?v=10136",
  "./manifest.json?v=10136",
  "./icon-192.png",
  "./icon-512.png",
  "./assets/menu-bg.jpg",
  "./assets/bgm.mp3",
  "./assets/se/button.wav",
  "./assets/se/single.wav",
  "./assets/se/double.wav",
  "./assets/se/triple.wav",
  "./assets/se/bull.wav",
  "./assets/se/good.mp3",
  "./assets/se/perfect.mp3",
  "./assets/se/miss.wav"
];

self.addEventListener("install", (event) => {
  self.skipWaiting();
  event.waitUntil(caches.open(CACHE_NAME).then((cache) => cache.addAll(ASSETS)));
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys()
      .then((keys) => Promise.all(keys.map((key) => key !== CACHE_NAME ? caches.delete(key) : undefined)))
      .then(() => self.clients.claim())
  );
});

self.addEventListener("fetch", (event) => {
  const req = event.request;
  const url = new URL(req.url);

  // HTMLはネット優先。10.13.1亡霊対策。
  if (req.mode === "navigate" || url.pathname.endsWith("/index.html")) {
    event.respondWith(
      fetch(req, { cache: "no-store" })
        .then((res) => {
          const copy = res.clone();
          caches.open(CACHE_NAME).then((cache) => cache.put(req, copy));
          return res;
        })
        .catch(() => caches.match(req).then((cached) => cached || caches.match("./index.html?v=10136")))
    );
    return;
  }

  // 音・画像はキャッシュ優先。
  event.respondWith(
    caches.match(req).then((cached) => cached || fetch(req).then((res) => {
      const copy = res.clone();
      caches.open(CACHE_NAME).then((cache) => cache.put(req, copy));
      return res;
    }))
  );
});

const CACHE_NAME = "out-master-v10-13-3-settings-audio-ui";
const ASSETS = [
  "./",
  "./index.html",
  "./manifest.json",
  "./icon-192.png",
  "./icon-512.png",
  "./assets/menu-bg.jpg",
  "./assets/bgm.mp3",
  "./assets/se/good.mp3",
  "./assets/se/perfect.mp3",
  "./assets/se/single.wav",
  "./assets/se/double.wav",
  "./assets/se/triple.wav",
  "./assets/se/bull.wav",
  "./assets/se/miss.wav",
  "./assets/se/button.wav"
];

self.addEventListener("install", event => {
  event.waitUntil(caches.open(CACHE_NAME).then(cache => cache.addAll(ASSETS)));
  self.skipWaiting();
});

self.addEventListener("activate", event => {
  event.waitUntil(
    caches.keys().then(keys => Promise.all(keys.filter(key => key !== CACHE_NAME).map(key => caches.delete(key))))
  );
  self.clients.claim();
});

self.addEventListener("fetch", event => {
  if (event.request.method !== "GET") return;
  event.respondWith(
    caches.match(event.request).then(cached => {
      return cached || fetch(event.request).then(response => {
        const clone = response.clone();
        caches.open(CACHE_NAME).then(cache => cache.put(event.request, clone));
        return response;
      }).catch(() => caches.match("./index.html"));
    })
  );
});

const CACHE_NAME = "electrolyser-fix-v10";
const UI_ASSETS = [
  "./",
  "./index.html",
  "./manifest.json",
  "./chart.min.js",
  "./icons/icon-192.png",
  "./icons/icon-512.png"
];

self.addEventListener("install", event => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => {
      // This "map" method is safer than "addAll"
      return Promise.allSettled(
        UI_ASSETS.map(url => 
          fetch(url).then(res => {
            if (res.ok) return cache.put(url, res);
          }).catch(err => console.log("Skipped: " + url))
        )
      );
    })
  );
  self.skipWaiting();
});

self.addEventListener("activate", event => {
  event.waitUntil(
    caches.keys().then(keys => Promise.all(
      keys.filter(k => k !== CACHE_NAME).map(k => caches.delete(k))
    ))
  );
  self.clients.claim();
});

self.addEventListener("fetch", event => {
  event.respondWith(
    fetch(event.request).catch(() => caches.match(event.request))
  );
});

const CACHE_NAME = "electrolyser-ui-v5.0"; // Updated version

// 1. DEFINE THE ASSETS CORRECTLY
const UI_ASSETS = [
  "./",
  "./index.html",
  "./chart.min.js",
  "./manifest.json"
];

// 2. INSTALL - Cache UI assets
self.addEventListener("install", event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => cache.addAll(UI_ASSETS))
      .catch(err => console.error("Asset Cache Failed:", err))
  );
  self.skipWaiting();
});

// 3. ACTIVATE - Clean up old versions
self.addEventListener("activate", event => {
  event.waitUntil(
    caches.keys().then(keys => Promise.all(
      keys.filter(k => k !== CACHE_NAME).map(k => caches.delete(k))
    ))
  );
  self.clients.claim();
});

// 4. FETCH - Network First for Data, Cache First for UI
self.addEventListener("fetch", event => {
  const req = event.request;

  // A. Google Apps Script API -> Network First, then Cache (Fallthrough)
  if (req.url.includes("script.google.com")) {
    event.respondWith(
      fetch(req)
        .then(res => {
          // Clone and cache ONLY if valid response
          if (res && res.status === 200) {
            const clone = res.clone();
            caches.open(CACHE_NAME).then(c => c.put(req, clone));
          }
          return res;
        })
        .catch(() => {
          // If offline, try to find cached data
          return caches.match(req);
        })
    );
    return;
  }

  // B. UI Assets (HTML, JS) -> Cache First
  event.respondWith(
    caches.match(req).then(cached => cached || fetch(req))
  );
});

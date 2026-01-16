const CACHE_NAME = "electrolyser-ui-v3"; // Changed from v1 to v12  "./",
  "./index.html",
  "./chart.min.js",
  "./manifest.json"
];

// Install – cache UI only
self.addEventListener("install", event => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => cache.addAll(UI_ASSETS))
  );
  self.skipWaiting();
});

// Activate – clean old cache
self.addEventListener("activate", event => {
  event.waitUntil(
    caches.keys().then(keys =>
      Promise.all(
        keys.filter(k => k !== CACHE_NAME).map(k => caches.delete(k))
      )
    )
  );
  self.clients.claim();
});

// Fetch logic
self.addEventListener("fetch", event => {
  const req = event.request;

  // 🔑 Google Apps Script API → ALWAYS NETWORK FIRST
  if (req.url.includes("script.google.com")) {
    event.respondWith(
      fetch(req)
        .then(res => {
          const clone = res.clone();
          caches.open(CACHE_NAME).then(c => c.put(req, clone));
          return res;
        })
        .catch(() => caches.match(req))
    );
    return;
  }

  // UI assets → Cache first
  event.respondWith(
    caches.match(req).then(cached => cached || fetch(req))
  );
});



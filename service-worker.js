const CACHE_NAME = "sound-project-cache-v1";
const URLS_TO_CACHE = [
  "/index.html",
  "/filelist.js",
  "/playback.js",
  "/display.js",
  "/manifest.json",
  "/styles.css",
  // Add other assets here as needed, like CSS or image files
];

// Install the service worker and cache all app shell assets
self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(URLS_TO_CACHE);
    }),
  );
});

// Intercept requests and serve cached files if available
self.addEventListener("fetch", (event) => {
  event.respondWith(
    caches.match(event.request).then((response) => {
      return response || fetch(event.request);
    }),
  );
});

// Update the service worker and clear old caches
self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cache) => {
          if (cache !== CACHE_NAME) {
            return caches.delete(cache);
          }
        }),
      );
    }),
  );
});

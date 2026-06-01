const CACHE_NAME = "yana-unicorn-v1";
const CACHE_PATHS = [
  "./",
  "./index.html",
  "./start/index.html",
  "./games/index.html",
  "./games/cat-chase/index.html",
  "./school/index.html",
  "./schedule/index.html",
  "./projects/index.html",
  "./gallery/index.html",
  "./map/index.html",
  "./install/index.html",
  "./launch/index.html",
  "./privacy/index.html",
  "./parents/index.html",
  "./updates/index.html",
  "./404.html",
  "./assets/site.js",
  "./assets/yana-unicorn-logo.png",
  "./assets/yana-unicorn-hero.png",
  "./site.webmanifest"
];

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => cache.addAll(CACHE_PATHS.map((item) => new URL(item, self.registration.scope).toString())))
      .then(() => self.skipWaiting())
  );
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys()
      .then((names) => Promise.all(names
        .filter((name) => name !== CACHE_NAME)
        .map((name) => caches.delete(name))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener("fetch", (event) => {
  const request = event.request;
  if (request.method !== "GET") return;

  event.respondWith(
    caches.match(request)
      .then((cached) => cached || fetch(request)
        .then((response) => {
          if (!response || response.status !== 200 || response.type === "opaque") return response;
          const copy = response.clone();
          caches.open(CACHE_NAME).then((cache) => cache.put(request, copy));
          return response;
        })
        .catch(() => caches.match(new URL("./index.html", self.registration.scope).toString())))
  );
});

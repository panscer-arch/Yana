const CACHE_NAME = "yana-unicorn-v22";
const CACHE_PATHS = [
  "./",
  "./index.html",
  "./start/index.html",
  "./games/index.html",
  "./games/cat-chase/index.html",
  "./games/parkour/index.html",
  "./games/parkour/game.js",
  "./games/parkour/styles.css",
  "./games/kitten-care/index.html",
  "./games/animation-studio/index.html",
  "./games/kolobok/index.html",
  "./games/kolobok/game.js",
  "./games/kolobok/styles.css",
  "./games/snake-clash/index.html",
  "./games/people-arena/index.html",
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
  "./assets/covers/generated/cat-chase.png",
  "./assets/covers/generated/parkour.png",
  "./assets/covers/generated/kitten-care.png",
  "./assets/covers/generated/goose-artist.png",
  "./assets/covers/generated/kolobok.png",
  "./assets/covers/generated/snake-clash.png",
  "./assets/covers/generated/people-arena.png",
  "./assets/covers/generated/unicorn-run.png",
  "./assets/covers/generated/math-quest.png",
  "./assets/sprites/sparkle-unicorn.png",
  "./assets/sprites/luna-kitten.png",
  "./assets/sprites/lana-kitten.png",
  "./assets/sprites/care-kitten.png",
  "./assets/sprites/goose-artist-sprite.png",
  "./assets/sprites/kolobok-sprite.png",
  "./assets/sprites/snake-sprite.png",
  "./assets/sprites/arena-player-sprite.png",
  "./assets/sprites/math-number-sprite.png",
  "./assets/sprites/unicorn-idea-sprite.png",
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

  const wantsHtml = request.mode === "navigate" || request.headers.get("accept")?.includes("text/html");
  if (wantsHtml) {
    event.respondWith(
      fetch(request)
        .then((response) => {
          if (!response || response.status !== 200) return response;
          const copy = response.clone();
          caches.open(CACHE_NAME).then((cache) => cache.put(request, copy));
          return response;
        })
        .catch(() => caches.match(request)
          .then((cached) => cached || caches.match(new URL("./index.html", self.registration.scope).toString())))
    );
    return;
  }

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

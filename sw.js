const CACHE_NAME = "yana-unicorn-v90";
const CACHE_PATHS = [
  "./",
  "./index.html",
  "./start/index.html",
  "./games/index.html",
  "./games/cat-chase/index.html",
  "./games/animal-meadow/index.html",
  "./games/plush-escape/index.html",
  "./games/night-school/index.html",
  "./games/fluffy-school-escape/index.html",
  "./games/kawaii-scene/index.html",
  "./games/fluffy-run/index.html",
  "./games/black-cubes/index.html",
  "./games/parkour/index.html",
  "./games/parkour/game.js",
  "./games/parkour/styles.css",
  "./games/kitten-care/index.html",
  "./games/cozy-house/index.html",
  "./games/animation-studio/index.html",
  "./games/lost-cloud/index.html",
  "./games/riko-pik-cartoon/index.html",
  "./games/kolobok/index.html",
  "./games/kolobok/game.js",
  "./games/kolobok/styles.css",
  "./games/snake-clash/index.html",
  "./games/people-arena/index.html",
  "./school/index.html",
  "./interneturok/index.html",
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
  "./assets/covers/generated/animal-meadow.svg",
  "./assets/covers/generated/plush-escape.svg",
  "./assets/covers/generated/night-school.svg",
  "./assets/covers/generated/fluffy-school-escape.svg",
  "./assets/covers/generated/kawaii-scene.svg",
  "./assets/covers/generated/fluffy-run.svg",
  "./assets/covers/generated/parkour.png",
  "./assets/covers/generated/kitten-care.png",
  "./assets/covers/generated/cozy-house.svg",
  "./assets/cozy-house/character-yana.png",
  "./assets/cozy-house/character-friend.png",
  "./assets/cozy-house/room-details.png",
  "./assets/cozy-house/sofa.png",
  "./assets/cozy-house/bed.png",
  "./assets/cozy-house/table.png",
  "./assets/cozy-house/plant.png",
  "./assets/cozy-house/lamp.png",
  "./assets/cozy-house/tub.png",
  "./assets/cozy-house/fridge.png",
  "./assets/cozy-house/tv.png",
  "./assets/cozy-house/petbed.png",
  "./assets/cozy-house/mirror.png",
  "./assets/cozy-house/rug.png",
  "./assets/cozy-house/toy.png",
  "./assets/cozy-house/food.png",
  "./assets/cozy-house/wardrobe.png",
  "./assets/cozy-house/book.png",
  "./assets/cozy-house/backpack.png",
  "./assets/cozy-house/phone.png",
  "./assets/cozy-house/character-yana-party.png",
  "./assets/cozy-house/character-yana-sleep.png",
  "./assets/cozy-house/character-friend-party.png",
  "./assets/cozy-house/character-friend-sleep.png",
  "./assets/covers/generated/goose-artist.png",
  "./assets/covers/generated/lost-cloud.svg",
  "./assets/covers/generated/riko-pik-cartoon.svg",
  "./assets/covers/generated/kolobok.png",
  "./assets/covers/generated/snake-clash.png",
  "./assets/covers/generated/people-arena.png",
  "./assets/models/Soldier.glb",
  "./assets/models/kenney-mini-characters/LICENSE.txt",
  "./assets/models/kenney-mini-characters/Textures/colormap.png",
  "./assets/models/kenney-mini-characters/character-female-a.glb",
  "./assets/models/kenney-mini-characters/character-female-b.glb",
  "./assets/models/kenney-mini-characters/character-female-c.glb",
  "./assets/models/kenney-mini-characters/character-female-d.glb",
  "./assets/models/kenney-mini-characters/character-female-e.glb",
  "./assets/models/kenney-mini-characters/character-female-f.glb",
  "./assets/models/kenney-mini-characters/character-male-a.glb",
  "./assets/models/kenney-mini-characters/character-male-b.glb",
  "./assets/models/kenney-mini-characters/character-male-c.glb",
  "./assets/models/kenney-mini-characters/character-male-d.glb",
  "./assets/models/kenney-mini-characters/character-male-e.glb",
  "./assets/models/kenney-mini-characters/character-male-f.glb",
  "./assets/sprites/kenney-mini-characters/character-female-a.png",
  "./assets/sprites/kenney-mini-characters/character-female-b.png",
  "./assets/sprites/kenney-mini-characters/character-female-c.png",
  "./assets/sprites/kenney-mini-characters/character-female-d.png",
  "./assets/sprites/kenney-mini-characters/character-female-e.png",
  "./assets/sprites/kenney-mini-characters/character-female-f.png",
  "./assets/sprites/kenney-mini-characters/character-male-a.png",
  "./assets/sprites/kenney-mini-characters/character-male-b.png",
  "./assets/sprites/kenney-mini-characters/character-male-c.png",
  "./assets/sprites/kenney-mini-characters/character-male-d.png",
  "./assets/sprites/kenney-mini-characters/character-male-e.png",
  "./assets/sprites/kenney-mini-characters/character-male-f.png",
  "./assets/models/kenney-modular-buildings/building-block.glb",
  "./assets/models/kenney-modular-buildings/building-sample-house-a.glb",
  "./assets/models/kenney-modular-buildings/building-sample-house-b.glb",
  "./assets/models/kenney-modular-buildings/building-sample-house-c.glb",
  "./assets/models/kenney-modular-buildings/building-sample-tower-a.glb",
  "./assets/models/kenney-modular-buildings/building-sample-tower-b.glb",
  "./assets/models/kenney-modular-buildings/building-sample-tower-d.glb",
  "./assets/models/kenney-modular-buildings/building-window-awnings.glb",
  "./assets/models/kenney-modular-buildings/building-window-balcony.glb",
  "./assets/models/kenney-modular-buildings/building-window-door-window-round.glb",
  "./assets/models/kenney-modular-buildings/building-door.glb",
  "./assets/models/kenney-modular-buildings/building-edges-door.glb",
  "./assets/models/kenney-modular-buildings/building-steps-wide.glb",
  "./assets/models/kenney-modular-buildings/roof-flat-awning-a.glb",
  "./assets/models/kenney-modular-buildings/roof-flat-awning-b.glb",
  "./assets/models/kenney-modular-buildings/detail-ac-a.glb",
  "./assets/models/kenney-modular-buildings/detail-ac-b.glb",
  "./assets/covers/generated/black-cubes.svg",
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

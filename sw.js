/* Study Quest service worker: lets the games open with no Wi-Fi after the first visit.
   Pages: network first (so updates show up), falling back to the saved copy.
   Other files: saved copy first, refreshed in the background. */
var CACHE = "studyquest-v3";
var SCOPE = self.registration.scope;
var PRECACHE = [
  "", "index.html", "manifest.webmanifest",
  "assets/app.js", "assets/icon.svg", "assets/icon-192.png", "assets/icon-512.png", "assets/apple-touch-icon.png",
  "spanish/", "social-studies-unit1/", "map-skills/", "northeast-states/",
  "european-exploration/", "european-exploration/styles.css", "european-exploration/data.js", "european-exploration/art.js", "european-exploration/game.js",
  "stars-galaxies/", "stars-galaxies/styles.css", "stars-galaxies/art-core.js", "stars-galaxies/art-stars.js", "stars-galaxies/art-galaxies.js",
  "stars-galaxies/art-system.js", "stars-galaxies/data.js", "stars-galaxies/game.js"
];

self.addEventListener("install", function (e) {
  e.waitUntil(
    caches.open(CACHE).then(function (c) {
      return Promise.all(PRECACHE.map(function (p) {
        return c.add(new Request(new URL(p, SCOPE), { cache: "reload" })).catch(function () { /* one miss must not block install */ });
      }));
    }).then(function () { return self.skipWaiting(); })
  );
});

self.addEventListener("activate", function (e) {
  e.waitUntil(
    caches.keys().then(function (keys) {
      return Promise.all(keys.filter(function (k) { return k.indexOf("studyquest-") === 0 && k !== CACHE; }).map(function (k) { return caches.delete(k); }));
    }).then(function () { return self.clients.claim(); })
  );
});

self.addEventListener("fetch", function (e) {
  var req = e.request;
  if (req.method !== "GET") return;
  var url = new URL(req.url);
  if (url.origin !== location.origin || url.href.indexOf(SCOPE) !== 0) return;

  if (req.mode === "navigate") {
    e.respondWith(
      fetch(req).then(function (res) {
        if (res && res.ok) { var copy = res.clone(); caches.open(CACHE).then(function (c) { c.put(req, copy); }); }
        return res;
      }).catch(function () {
        return caches.match(req).then(function (hit) {
          return hit || caches.match(new URL("index.html", SCOPE).href);
        });
      })
    );
    return;
  }

  e.respondWith(
    caches.match(req).then(function (hit) {
      var refresh = fetch(req).then(function (res) {
        if (res && res.ok) { var copy = res.clone(); caches.open(CACHE).then(function (c) { c.put(req, copy); }); }
        return res;
      }).catch(function () { return hit; });
      return hit || refresh;
    })
  );
});

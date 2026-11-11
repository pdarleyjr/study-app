/* Study Quest service worker: lets the games open with no Wi-Fi after the first visit.
   Pages: network first (so updates show up), falling back to the saved copy.
   Other files: saved copy first, refreshed in the background. */
var CACHE = "studyquest-v6";
var SCOPE = self.registration.scope;
var PRECACHE = [
  "", "index.html", "manifest.webmanifest",
  "assets/app.js", "assets/icon.svg", "assets/icon-192.png", "assets/icon-512.png", "assets/apple-touch-icon.png",
  "assets/quest-kit.js", "assets/quest-kit.css",
  "todays-plan/", "todays-plan/styles.css", "todays-plan/plan-data.js", "todays-plan/plan.js",
  "fractions-review/", "fractions-review/styles.css", "fractions-review/data.js", "fractions-review/app.js",
  "fractions-review/homework/mixed-numbers-worksheet-p47.png",
  "sacraments-quest/", "sacraments-quest/styles.css", "sacraments-quest/data.js", "sacraments-quest/app.js",
  "sacraments-quest/homework/about-the-sacraments-p46.jpg", "sacraments-quest/homework/sacraments-in-review-p47.png",
  "sacraments-quest/homework/unit1-review-p45.jpg",
  "matter-lab/", "matter-lab/styles.css", "matter-lab/data.js", "matter-lab/app.js",
  "wild-robot-quest/", "wild-robot-quest/styles.css", "wild-robot-quest/data.js", "wild-robot-quest/app.js",
  "spanish/", "social-studies-unit1/", "map-skills/", "northeast-states/",
  "european-exploration/", "european-exploration/styles.css", "european-exploration/data.js", "european-exploration/art.js", "european-exploration/game.js",
  "stars-galaxies/", "stars-galaxies/styles.css", "stars-galaxies/art-core.js", "stars-galaxies/art-stars.js", "stars-galaxies/art-galaxies.js",
  "stars-galaxies/art-system.js", "stars-galaxies/data.js", "stars-galaxies/game.js",
  "math-mission/", "math-mission/styles.css", "math-mission/gen.js", "math-mission/game.js",
  "fifth-grade/", "second-grade/",
  "second-grade/spanish-days/", "second-grade/spanish-days/styles.css", "second-grade/spanish-days/data.js", "second-grade/spanish-days/speech.js",
  "second-grade/spanish-days/store.js", "second-grade/spanish-days/ui.js", "second-grade/spanish-days/quiz.js", "second-grade/spanish-days/parent.js",
  "second-grade/spanish-days/game.js"
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

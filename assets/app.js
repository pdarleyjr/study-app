/* Study Quest shared helpers: progress tracking + offline support.
   Loaded with <script defer> by the hub and every study game. */
(function () {
  "use strict";
  var KEY = "studyquest:progress:v1";

  function read() {
    try { var d = JSON.parse(localStorage.getItem(KEY)); return d && typeof d === "object" ? d : {}; }
    catch (e) { return {}; }
  }
  function write(d) {
    try { localStorage.setItem(KEY, JSON.stringify(d)); } catch (e) { /* private mode or storage full: ignore */ }
  }

  window.StudyQuest = {
    /* Remember a finished round: pct is 0-100. Keeps the best score and play count. */
    record: function (gameId, pct) {
      pct = Math.max(0, Math.min(100, Math.round(Number(pct) || 0)));
      var d = read(), g = d[gameId] || { best: 0, plays: 0 };
      g.best = Math.max(g.best || 0, pct);
      g.plays = (g.plays || 0) + 1;
      g.last = pct;
      g.at = Date.now();
      d[gameId] = g;
      write(d);
      return g;
    },
    get: function (gameId) { return read()[gameId] || null; },
    all: read
  };

  /* Offline support: register the service worker that sits next to this file's parent folder. */
  if ("serviceWorker" in navigator && (location.protocol === "https:" || location.hostname === "localhost" || location.hostname === "127.0.0.1")) {
    var base = document.currentScript && document.currentScript.src;
    if (base) {
      window.addEventListener("load", function () {
        navigator.serviceWorker.register(new URL("../sw.js", base)).catch(function () { /* offline support is optional */ });
      });
    }
  }
})();

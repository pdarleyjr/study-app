var G = window.AM_GAMES = window.AM_GAMES || {};
/* Ave María Quest — Light the Window (G.window): fill in the missing words of each line (drag a glass jewel onto a blank
   or tap it) and the matching panel of a stained-glass window lights up. 8 lines, 8 panels, never a game over.
   Signature: function (mount, ctx, opts) -> { destroy }. Renders only inside mount (plus short-lived drag/fly ghosts on
   document.body that destroy() always removes). CSS prefix amw- (window.css). */
(function () {
  "use strict";
  var h = QuestKit.h;
  var uid = 0;

  function clear(el) { while (el.firstChild) { el.removeChild(el.firstChild); } }
  function shuffle(a, r) {
    a = a.slice();
    for (var i = a.length - 1; i > 0; i--) { var j = Math.floor(r() * (i + 1)); var t = a[i]; a[i] = a[j]; a[j] = t; }
    return a;
  }

  /* ---------------------------------------------------------------------------------------------------------
     The window: original inline SVG. 300 x 520 viewBox, pointed arch, 8 panes in reading order:
     rose (line 1), then 2 columns x 3 rows (lines 2-7), then one wide pane for Amen (line 8).
     --------------------------------------------------------------------------------------------------------- */
  var ARCH = "M12 512 V170 C12 86 80 34 150 6 C220 34 288 86 288 170 V512 Z";
  var SPEC = [
    { m: "star", name: "star", rose: true, c0: "#7aa3f5", c1: "#17348a", m1: "#ffd76a", m2: "#fff3c4" },
    { m: "dove", name: "dove", x: 24, y: 170, w: 122, h: 80, c0: "#a873ea", c1: "#38166f", m1: "#ffffff", m2: "#ffe28a", mk: "#38166f" },
    { m: "lily", name: "lily", x: 154, y: 170, w: 122, h: 80, c0: "#3fcf94", c1: "#0a5a3e", m1: "#fff7e6", m2: "#ffd35a", mg: "#a8f0c6" },
    { m: "rose", name: "rose", x: 24, y: 256, w: 122, h: 80, c0: "#f06a88", c1: "#6a1031", m1: "#ffa6bc", m2: "#ffe3a8", mk: "#6a1031", mg: "#8fe3ac" },
    { m: "crown", name: "crown", x: 154, y: 256, w: 122, h: 80, c0: "#f6bd44", c1: "#865000", m1: "#fff0b8", m2: "#b3204c" },
    { m: "hands", name: "praying hands", x: 24, y: 342, w: 122, h: 80, c0: "#35c9e0", c1: "#064a5e", m1: "#ffe9d2", m2: "#ffffff" },
    { m: "candle", name: "candle", x: 154, y: 342, w: 122, h: 80, c0: "#f59656", c1: "#74200e", m1: "#fff3dc", m2: "#ffd84a" },
    { m: "cross", name: "cross and heart", x: 24, y: 428, w: 252, h: 74, c0: "#5b84df", c1: "#0a1f5a", m1: "#ffd76a", m2: "#ff8aa0" }
  ];

  function starPts(R, r, n, rot) {
    var pts = [], k, a, rad;
    for (k = 0; k < n * 2; k++) {
      a = Math.PI / n * k - Math.PI / 2 + (rot || 0); rad = k % 2 ? r : R;
      pts.push((Math.cos(a) * rad).toFixed(1) + "," + (Math.sin(a) * rad).toFixed(1));
    }
    return pts.join(" ");
  }
  function circ(cls, x, y, r) { return '<circle class="' + cls + '" cx="' + x + '" cy="' + y + '" r="' + r + '"/>'; }
  function path(cls, d, extra) { return '<path class="' + cls + '" d="' + d + '"' + (extra ? " " + extra : "") + "/>"; }

  /* motifs are drawn around (0,0), about 26 units from the centre */
  var MOTIF = {
    star: function () {
      var s = "", k;
      for (k = 0; k < 8; k++) { s += circ("m2", (Math.cos(k * Math.PI / 4) * 40).toFixed(1), (Math.sin(k * Math.PI / 4) * 40).toFixed(1), 8.5); }
      s += '<polygon class="m1" points="' + starPts(33, 14, 8, 0) + '"/>';
      s += circ("m2", 0, 0, 8) + circ("mk", 0, 0, 3.4);
      return s;
    },
    dove: function () {
      return path("m1", "M-24 8 C-16 -3 -2 -8 9 -6 C11 -13 18 -15 22 -10 L31 -8 L22 -5 C20 4 8 13 -6 12 L-26 21 L-20 9Z") +
        path("m2", "M-5 0 C-14 -19 0 -28 15 -23 C7 -17 7 -9 11 -4Z") +
        path("m2", "M-22 6 C-26 -2 -22 -10 -16 -12 C-17 -4 -15 0 -12 3Z") + circ("mk", 17, -9, 1.7) +
        '<path class="msl" d="M-30 -14 C-24 -22 -12 -24 -6 -18" /><path class="m2" d="M-31 -15 q-3 3 -1 6 q4 -1 4 -5Z"/><path class="m2" d="M-24 -21 q0 4 3 5 q2 -3 -1 -6Z"/>';
    },
    lily: function () {
      return path("mg", "M0 8 C-1 16 -1 22 0 30") + '<path class="msl mgl" d="M0 8 V30"/>' +
        path("mg", "M0 26 C-12 25 -19 19 -22 11 C-10 12 -3 17 0 26Z") + path("mg", "M0 26 C12 25 19 19 22 11 C10 12 3 17 0 26Z") +
        path("m1", "M0 8 C-15 4 -26 -8 -24 -22 C-13 -16 -4 -6 0 8Z") + path("m1", "M0 8 C15 4 26 -8 24 -22 C13 -16 4 -6 0 8Z") +
        path("m1", "M0 8 C-11 -2 -10 -16 0 -28 C10 -16 11 -2 0 8Z") +
        circ("m2", -3.5, -8, 2.2) + circ("m2", 3.5, -8, 2.2) + circ("m2", 0, -14, 2.2);
    },
    rose: function () {
      var s = path("mg", "M-8 14 C-24 18 -30 8 -26 -2 C-18 0 -10 6 -8 14Z") + path("mg", "M8 14 C24 18 30 8 26 -2 C18 0 10 6 8 14Z"), k;
      for (k = 0; k < 6; k++) { s += circ("m1", (Math.cos(k * Math.PI / 3 - 1) * 14).toFixed(1), (Math.sin(k * Math.PI / 3 - 1) * 14).toFixed(1), 11); }
      s += circ("m2", 0, 0, 11);
      s += '<path class="msk" d="M-5 -3 C-5 -9 5 -9 6 -3 C7 3 0 6 -3 3"/>';
      return s;
    },
    crown: function () {
      return '<ellipse class="mst" cx="0" cy="-19" rx="19" ry="5.5"/>' +
        path("m1", "M-20 12 L-23 -6 L-11 3 L0 -12 L11 3 L23 -6 L20 12Z") + '<rect class="m2" x="-21" y="12" width="42" height="7" rx="2"/>' +
        circ("m2", 0, -12, 2.6) + circ("m2", -23, -6, 2.6) + circ("m2", 23, -6, 2.6) + circ("mk", 0, 5, 3.2);
    },
    hands: function () {
      var half = "M0 -31 C-5 -24 -13 -10 -14 4 L-14 17 L0 17Z";
      return '<g class="mrays"><path class="msl" d="M0 -42 V-36 M-14 -38 L-11 -33 M14 -38 L11 -33 M-25 -27 L-20 -24 M25 -27 L20 -24"/></g>' +
        path("m1", half) + path("m1", half, 'transform="scale(-1 1)"') +
        '<path class="m1" d="M-14 2 C-20 -2 -21 -9 -17 -12 C-14 -8 -12 -3 -11 2Z"/><path class="m1" d="M14 2 C20 -2 21 -9 17 -12 C14 -8 12 -3 11 2Z"/>' +
        '<path class="msk" d="M0 -26 V17 M-7 -8 L-7 4 M7 -8 L7 4"/>' +
        '<rect class="m2" x="-20" y="17" width="20" height="11" rx="3"/><rect class="m2" x="0" y="17" width="20" height="11" rx="3"/>';
    },
    candle: function () {
      return circ("mglow", 0, -16, 17) + path("m2", "M0 -32 C8 -21 7 -13 0 -10 C-7 -13 -8 -21 0 -32Z") +
        path("mk", "M0 -24 C3 -19 3 -15 0 -13 C-3 -15 -3 -19 0 -24Z") +
        '<rect class="m1" x="-7" y="-9" width="14" height="30" rx="2.5"/>' + '<path class="msk" d="M-3 -6 V14"/>' +
        path("m2", "M-17 22 H17 L12 30 H-12Z");
    },
    cross: function () {
      return '<polygon class="m1" points="' + starPts(11, 4.6, 5, 0) + '" transform="translate(-76 -2)"/>' +
        '<polygon class="m1" points="' + starPts(11, 4.6, 5, 0) + '" transform="translate(76 -2)"/>' +
        '<polygon class="m1" points="' + starPts(7, 3, 5, 0) + '" transform="translate(-56 14)"/>' +
        '<polygon class="m1" points="' + starPts(7, 3, 5, 0) + '" transform="translate(56 14)"/>' +
        '<rect class="m1" x="-6" y="-31" width="12" height="62" rx="2"/><rect class="m1" x="-21" y="-17" width="42" height="12" rx="2"/>' +
        path("m2", "M0 11 C-16 -1 -11 -14 0 -7 C11 -14 16 -1 0 11Z", 'transform="translate(0 -2) scale(.9)"');
    }
  };

  function paneGeom(s) {
    if (s.rose) { return { d: "M94 104 a56 56 0 1 0 112 0 a56 56 0 1 0 -112 0Z", cx: 150, cy: 104, sc: 1.32, nx: 205, ny: 60 }; }
    var x = s.x, y = s.y, w = s.w, hh = s.h, d;
    if (s.m === "cross") {
      d = "M" + x + "," + (y + hh - 4) + " V" + (y + 14) + " Q" + x + "," + y + " " + (x + 14) + "," + y + " H" + (x + w - 14) + " Q" + (x + w) + "," + y + " " + (x + w) + "," + (y + 14) + " V" + (y + hh - 4) + " Q" + (x + w) + "," + (y + hh) + " " + (x + w - 4) + "," + (y + hh) + " H" + (x + 4) + " Q" + x + "," + (y + hh) + " " + x + "," + (y + hh - 4) + "Z";
      return { d: d, cx: x + w / 2, cy: y + hh * 0.52, sc: 1.05, nx: x + 14, ny: y + 18 };
    }
    d = "M" + x + "," + (y + hh) + " V" + (y + 32) + " Q" + x + "," + (y + 10) + " " + (x + w / 2) + "," + y + " Q" + (x + w) + "," + (y + 10) + " " + (x + w) + "," + (y + 32) + " V" + (y + hh) + "Z";
    return { d: d, cx: x + w / 2, cy: y + hh * 0.6, sc: 0.98, nx: x + 15, ny: y + 24 };
  }

  function buildWindowSVG(n) {
    var id = "amw" + (++uid), defs = "", panes = "", i;
    defs += '<clipPath id="' + id + 'a"><path d="' + ARCH + '"/></clipPath>';
    defs += '<filter id="' + id + 'b" x="-30%" y="-30%" width="160%" height="160%"><feGaussianBlur stdDeviation="6"/></filter>';
    defs += '<pattern id="' + id + 'q" width="15" height="15" patternUnits="userSpaceOnUse" patternTransform="rotate(45)"><path d="M0 0H15M0 0V15" stroke="#080d1c" stroke-width="1.1" opacity=".5" fill="none"/></pattern>';
    defs += '<linearGradient id="' + id + 'f" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#f4dc9a"/><stop offset=".5" stop-color="#b98a2e"/><stop offset="1" stop-color="#f1d58b"/></linearGradient>';
    defs += '<radialGradient id="' + id + 'bg" cx=".5" cy=".38" r=".8"><stop offset="0" stop-color="#2a3a68"/><stop offset="1" stop-color="#0d1530"/></radialGradient>';
    defs += '<linearGradient id="' + id + 'r" x1="0" y1="1" x2="0" y2="0"><stop offset="0" stop-color="#fff3c4" stop-opacity=".0"/><stop offset=".55" stop-color="#fff3c4" stop-opacity=".5"/><stop offset="1" stop-color="#fff" stop-opacity=".0"/></linearGradient>';
    for (i = 0; i < n; i++) {
      var s = SPEC[i], g = paneGeom(s);
      s.g = g;
      defs += '<clipPath id="' + id + "c" + i + '"><path d="' + g.d + '"/></clipPath>';
      defs += '<radialGradient id="' + id + "g" + i + '" cx=".5" cy=".45" r=".75"><stop offset="0" stop-color="' + s.c0 + '"/><stop offset="1" stop-color="' + s.c1 + '"/></radialGradient>';
      var sun = "", k;
      for (k = 0; k < 8; k++) { sun += '<path d="M0 0 L-6 -80 L6 -80Z" transform="rotate(' + (k * 45 + 22) + ')"/>'; }
      panes += '<g class="amw-pane" data-i="' + i + '" style="--m1:' + s.m1 + ";--m2:" + s.m2 + ";--mk:" + (s.mk || "#2b1450") + ";--mg:" + (s.mg || "#9fe8bd") + '">' +
        '<path class="amw-halo" d="' + g.d + '" fill="' + s.c0 + '" filter="url(#' + id + 'b)"/>' +
        '<g clip-path="url(#' + id + "c" + i + ')">' +
        '<path class="amw-dark" d="' + g.d + '"/>' +
        '<g class="amw-ghost" transform="translate(' + g.cx + " " + g.cy + ") scale(" + g.sc + ')">' + MOTIF[s.m]() + "</g>" +
        '<g class="amw-colour"><path d="' + g.d + '" fill="url(#' + id + "g" + i + ')"/>' +
        '<g class="amw-sun" transform="translate(' + g.cx + " " + g.cy + ')">' + sun + "</g>" +
        '<g class="amw-motif" transform="translate(' + g.cx + " " + g.cy + ") scale(" + g.sc + ')">' + MOTIF[s.m]() + "</g></g>" +
        '<rect x="0" y="0" width="300" height="520" fill="url(#' + id + 'q)"/>' +
        '<path class="amw-flash" d="' + g.d + '"/></g>' +
        '<path class="amw-lead" d="' + g.d + '"/>' +
        '<path class="amw-ring" d="' + g.d + '"/>' +
        '<text class="amw-num" x="' + g.nx + '" y="' + (g.ny + 4) + '" text-anchor="middle">' + (i + 1) + "</text>" +
        '<g class="amw-badge" transform="translate(' + g.nx + " " + g.ny + ')"><circle r="9" /><path d="M-4.2 .4 L-1.2 3.6 L4.6 -3.4"/></g>' +
        "</g>";
    }
    var decor = '<g class="amw-decor">' + circ("amw-dc", 150, 28, 11) + circ("amw-dc", 52, 114, 13) + circ("amw-dc", 248, 114, 13) +
      path("amw-dc", "M30 150 L40 138 L50 150 L40 162Z") + path("amw-dc", "M270 150 L260 138 L250 150 L260 162Z") +
      path("amw-dc", "M92 52 L100 44 L108 52 L100 60Z") + path("amw-dc", "M208 52 L200 44 L192 52 L200 60Z") + "</g>";
    var rays = '<g class="amw-rays" clip-path="url(#' + id + 'a)">', r;
    for (r = 0; r < 9; r++) { rays += '<path d="M150 270 L132 -60 L168 -60Z" fill="url(#' + id + 'r)" transform="rotate(' + (r * 40 - 160) + ' 150 270)"/>'; }
    rays += "</g>";
    var sparks = '<g class="amw-sparks">', SP = [[40, 60], [262, 70], [150, 18], [24, 250], [278, 300], [62, 470], [240, 480], [150, 410], [96, 150], [210, 150]];
    SP.forEach(function (p, k2) {
      sparks += '<g transform="translate(' + p[0] + " " + p[1] + ')"><path class="amw-spark" style="animation-delay:' + (k2 * 0.23).toFixed(2) + 's" d="M0 -9 Q0 0 9 0 Q0 0 0 9 Q0 0 -9 0 Q0 0 0 -9Z"/></g>';
    });
    sparks += "</g>";
    return '<svg class="amw-svg" viewBox="0 0 300 520" xmlns="http://www.w3.org/2000/svg" aria-hidden="true" focusable="false">' +
      "<defs>" + defs + "</defs>" +
      '<rect class="amw-sill" x="2" y="506" width="296" height="12" rx="4" fill="url(#' + id + 'f)"/>' +
      '<path class="amw-stone" d="' + ARCH + '" fill="url(#' + id + 'bg)"/>' +
      '<g clip-path="url(#' + id + 'a)">' + decor + panes + "</g>" + rays +
      '<path class="amw-rim" d="' + ARCH + '" fill="none" stroke="url(#' + id + 'f)"/>' + sparks + "</svg>";
  }

  /* ---------------------------------------------------------------------------------------------------------
     The game
     --------------------------------------------------------------------------------------------------------- */
  G.window = function (mount, ctx, opts) {
    var D = ctx.D, reduced = !!ctx.reduced, N = D.LINES.length;
    var r = D.rng((Date.now() ^ (Math.random() * 1e9)) >>> 0);
    var dead = false, busy = false, finished = false, ignoreClick = false;
    var timers = [], cleanups = [], strays = [];
    var points = 0, streak = 0, firstTry = 0, totalBlanks = 0, litCount = 0, lit = [];
    var li = -1, L = null, jid = 0;

    function later(fn, ms) { var t = setTimeout(function () { if (!dead) { fn(); } }, ms); timers.push(t); return t; }
    function speakOk() { try { return !!(ctx.speech && ctx.speech.canSpeak()); } catch (e) { return false; } }
    function say(text, opt) { try { ctx.speech.say(text, opt || {}); } catch (e) { /* ignore */ } }
    function announce(t) { try { QuestKit.announce(t); } catch (e) { /* ignore */ } }

    /* ---- frame ---- */
    var root = h("section", { class: "amw" + (reduced ? " amw-reduced" : ""), "aria-label": "Light the window" });
    var streakEl = h("span", { class: "amw-chip" }), pointsEl = h("span", { class: "amw-chip" });
    var progEl = h("span", { class: "amw-prog" });
    var barFill = h("span", { class: "amw-barfill" });
    var bar = h("span", { class: "amw-bar", role: "progressbar", "aria-valuemin": "0", "aria-valuemax": String(N), "aria-valuenow": "0", "aria-label": "Panels lit" }, barFill);
    root.appendChild(h("div", { class: "amw-head" }, progEl, h("div", { class: "amw-hud" }, streakEl, pointsEl)));
    root.appendChild(h("div", { class: "amw-progwrap" }, bar));

    var winBox = h("div", { class: "amw-win", role: "img", html: buildWindowSVG(N) });
    var capEl = h("p", { class: "amw-cap", "aria-live": "polite" });
    var winCol = h("div", { class: "amw-wincol" }, winBox, capEl);
    var play = h("div", { class: "amw-play" });
    root.appendChild(h("div", { class: "amw-stage" }, winCol, play));
    mount.appendChild(root);
    var svg = winBox.querySelector(".amw-svg");
    var panes = Array.prototype.slice.call(winBox.querySelectorAll(".amw-pane"));

    function hud(bump) {
      streakEl.textContent = "🔥 " + streak + " in a row";
      pointsEl.textContent = "⭐ " + points + " pts";
      if (bump && !reduced) { streakEl.classList.remove("amw-bump"); void streakEl.offsetWidth; streakEl.classList.add("amw-bump"); }
    }
    function winLabel() {
      winBox.setAttribute("aria-label", "Stained-glass window: " + litCount + " of " + N + " panels lit" + (litCount === N ? ". The window is complete." : "."));
    }
    function progress() {
      progEl.textContent = litCount + " of " + N + " panels lit";
      barFill.style.width = Math.round(litCount / N * 100) + "%";
      bar.setAttribute("aria-valuenow", String(litCount));
    }
    function setNext(i) { panes.forEach(function (p, k) { p.classList.toggle("is-next", k === i && !lit[k]); }); }

    /* ---- round set-up ---- */
    function lineWords(i) { return D.WORDS.filter(function (w) { return w.lineIndex === i; }); }
    function pickBlanks(words) {
      var n = words.length, want = n <= 2 ? 1 : 3;
      if (n > 1 && want >= n) { want = n - 1; }
      var W = { "shaky": 3, "new": 2, "strong": 1 };
      var scored = words.map(function (w) {
        var s = "new"; try { s = ctx.strength(w.i); } catch (e) { s = "new"; }
        return { w: w, s: (W[s] || 2) + r() * 2.2 };
      });
      scored.sort(function (a, b) { return b.s - a.s; });
      return scored.slice(0, want).map(function (x) { return x.w; }).sort(function (a, b) { return a.at - b.at; });
    }
    function pickDecoys(i, words, blanks) {
      var skip = {}, seen = {}, cands = [];
      words.forEach(function (w) { skip[w.key] = true; });
      D.WORDS.forEach(function (w) {
        if (w.lineIndex === i || skip[w.key] || seen[w.key]) { return; }
        seen[w.key] = true; cands.push(w);
      });
      var ref = blanks[Math.floor(r() * blanks.length)];
      var scored = cands.map(function (c) {
        var s = r() * 1.6;
        blanks.forEach(function (b) {
          if (c.key.charAt(0) === b.key.charAt(0)) { s += 1.6; }
          if (Math.abs(c.key.length - b.key.length) <= 2) { s += 1.1; }
          if (c.key.slice(-2) === b.key.slice(-2)) { s += 1.4; }
        });
        if (ref && c.token.charAt(0) === c.token.charAt(0).toUpperCase() && ref.token.charAt(0) === ref.token.charAt(0).toUpperCase()) { s += 0.4; }
        return { c: c, s: s };
      });
      scored.sort(function (a, b) { return b.s - a.s; });
      var out = [];
      scored.forEach(function (x) { if (out.length < 2) { out.push(x.c); } });
      return out;
    }
    function startRound(i) {
      li = i;
      var words = lineWords(i), bw = pickBlanks(words), dec = pickDecoys(i, words, bw);
      var jewels = shuffle(bw.concat(dec), r).map(function (w, k) { return { id: ++jid, order: k, word: w.word, key: D.norm(w.word), bounce: false }; });
      L = {
        i: i, words: words, byAt: {}, blanks: bw.map(function (w) { return { w: w, jewel: null, miss: 0, first: true, locked: false, wrong: false }; }),
        tray: jewels, sel: 0, done: false, streakBase: streak, msg: null
      };
      L.blanks.forEach(function (b, k) { L.byAt[b.w.i] = k; });
      totalBlanks += bw.length;
      capEl.textContent = "";
      capEl.className = "amw-cap";
      setNext(i);
      progress("Line " + (i + 1) + " of " + N);
      winLabel();
      buildPlay();
      paint();
      setFb("hint", "Tap a jewel, or drag it onto a blank space. " + (bw.length > 1 ? "Fill all " + bw.length + " blanks." : "Fill the blank."));
      var first = trayEl.querySelector(".amw-jewel");
      if (first) { try { first.focus({ preventScroll: true }); } catch (e) { /* ignore */ } }
    }

    /* ---- play column ---- */
    var lineEl, fbEl, trayEl, trayWrap, labelEl, helpEl;
    function buildPlay() {
      clear(play);
      var say1 = speakOk() ? h("button", { type: "button", class: "amw-listen", "aria-label": "Listen to this line", onclick: function () { say(D.LINES[li].text, {}); } }, "🔊", h("span", null, " Listen")) : null;
      labelEl = h("span", { class: "amw-linelabel" }, "Line " + (li + 1) + " of " + N);
      lineEl = h("p", { class: "amw-line", lang: "la" });
      fbEl = h("div", { class: "amw-fb", role: "status", "aria-live": "polite" });
      play.appendChild(h("div", { class: "amw-card" }, h("div", { class: "amw-linehead" }, labelEl, say1), lineEl, fbEl));
      trayEl = h("div", { class: "amw-tray", role: "group", "aria-label": "Word jewels" });
      trayWrap = h("div", { class: "amw-trayplate" }, trayEl);
      play.appendChild(trayWrap);
    }
    function setFb(kind, text, extra) {
      clear(fbEl);
      fbEl.className = "amw-fb amw-fb-" + kind;
      var icon = kind === "good" ? "✓" : kind === "bad" ? "✗" : "💡";
      fbEl.appendChild(h("p", { class: "amw-fbtext" }, h("span", { class: "amw-fbicon", "aria-hidden": "true" }, icon), " ", text));
      if (extra) { fbEl.appendChild(h("p", { class: "amw-fbextra" }, extra)); }
    }

    function hintText(b) { return b.w.word.slice(0, Math.min(b.miss, Math.max(1, b.w.word.length - 1))); }
    function blankBtn(bi) {
      var b = L.blanks[bi], n = L.blanks.length, empty = !b.jewel;
      var cls = "amw-blank" + (empty ? "" : " is-filled amw-j" + (b.jewel.id % 6)) + (b.locked ? " is-locked" : "") + (empty && bi === L.sel ? " is-sel" : "") + (b.wrong ? " amw-bad" : "") + (b.landing ? " is-landing" : "");
      var label = "Blank " + (bi + 1) + " of " + n + ": ";
      var kids = [];
      if (empty) {
        label += "empty" + (b.miss ? ", starts with " + hintText(b) : "") + (bi === L.sel ? ", selected" : "") + ". Tap to choose it.";
        if (b.miss) { kids.push(h("span", { class: "amw-hintl" }, hintText(b) + "…")); }
      } else if (b.locked) {
        label += b.jewel.word + ", correct";
        kids.push(h("span", { class: "amw-mk", "aria-hidden": "true" }, "✓ "), b.jewel.word);
      } else if (b.wrong) {
        label += b.jewel.word + ", not right";
        kids.push(h("span", { class: "amw-mk", "aria-hidden": "true" }, "✗ "), h("s", null, b.jewel.word));
      } else {
        label += b.jewel.word + ". Tap to take it back.";
        kids.push(b.jewel.word);
      }
      var len = b.w.word.length;
      var el = h("button", { type: "button", class: cls, "data-bi": String(bi), "aria-label": label, style: "min-width:" + (len * 0.46 + 1.1).toFixed(1) + "em",
        onclick: function () { onBlank(bi, el); } }, kids);
      if (b.locked) { el.setAttribute("aria-disabled", "true"); }
      return el;
    }
    function paint(focusSel) {
      clear(lineEl);
      L.words.forEach(function (w) {
        var wrap = h("span", { class: "amw-wd" }), bi = L.byAt[w.i];
        if (bi === undefined) { wrap.appendChild(h("span", { class: "amw-fixed" }, w.word)); } else { wrap.appendChild(blankBtn(bi)); }
        var punct = w.token.slice(w.word.length);
        if (punct) { wrap.appendChild(h("span", { class: "amw-punc" }, punct)); }
        lineEl.appendChild(wrap);
      });
      if (L.done) { lineEl.appendChild(h("span", { class: "amw-tick", role: "img", "aria-label": "Line complete" }, "✓")); }
      clear(trayEl);
      L.tray.slice().sort(function (a, b) { return a.order - b.order; }).forEach(function (J) { trayEl.appendChild(jewelBtn(J)); });
      trayEl.classList.toggle("is-empty", !L.tray.length);
      if (focusSel) { var f = root.querySelector(focusSel); if (f) { try { f.focus({ preventScroll: true }); } catch (e) { /* ignore */ } } }
    }
    function jewelBtn(J) {
      var el = h("button", { type: "button", class: "amw-jewel amw-j" + (J.id % 6) + (J.bounce ? " is-bounce" : ""), "data-id": String(J.id),
        "aria-label": "Word " + J.word + ". Tap to place it, or drag it onto a blank.",
        onclick: function (e) { if (ignoreClick) { return; } onJewelTap(J, el, e.detail === 0); } }, J.word);
      J.bounce = false;
      el.addEventListener("pointerdown", function (e) { onDown(e, J, el); });
      return el;
    }

    /* ---- placing words ---- */
    function firstEmpty() { for (var k = 0; k < L.blanks.length; k++) { if (!L.blanks[k].jewel) { return k; } } return -1; }
    function flyTo(text, cls, from, done) {
      if (reduced || !from || !document.body.animate) { done(); return; }
      var tgt = null;
      var g = h("div", { class: "amw-fly amw-jewel " + cls, "aria-hidden": "true" }, text);
      g.style.left = from.left + "px"; g.style.top = from.top + "px"; g.style.width = from.width + "px"; g.style.height = from.height + "px";
      document.body.appendChild(g); strays.push(g);
      function end() { if (g.parentNode) { g.parentNode.removeChild(g); } done(); }
      tgt = function (rect) {
        var dx = rect.left + rect.width / 2 - (from.left + from.width / 2), dy = rect.top + rect.height / 2 - (from.top + from.height / 2);
        var a = g.animate([{ transform: "translate(0,0) scale(1.06)" }, { transform: "translate(" + dx + "px," + dy + "px) scale(1)" }], { duration: 240, easing: "cubic-bezier(.2,.8,.25,1)" });
        a.onfinish = end; a.oncancel = end;
      };
      return tgt;
    }
    function place(J, bi, from) {
      if (busy || dead || L.done) { return; }
      var b = L.blanks[bi]; if (!b || b.locked) { return; }
      var prev = b.jewel;
      L.tray = L.tray.filter(function (x) { return x !== J; });
      if (prev) { prev.bounce = true; L.tray.push(prev); }
      b.jewel = J; b.wrong = false;
      L.sel = firstEmpty();
      var full = L.sel < 0;
      var land = !reduced && from && document.body.animate;
      if (land) { b.landing = true; busy = true; }
      paint(land ? null : (full ? null : ".amw-jewel"));
      if (land) {
        var fn = flyTo(J.word, "amw-j" + (J.id % 6), from, function () { b.landing = false; busy = false; var el = lineEl.querySelector('[data-bi="' + bi + '"]'); if (el) { el.classList.remove("is-landing"); el.classList.add("is-thud"); } if (full) { check(); } else { refocus(); } });
        var tgtEl = lineEl.querySelector('[data-bi="' + bi + '"]');
        if (fn && tgtEl) { fn(tgtEl.getBoundingClientRect()); } else { b.landing = false; busy = false; if (tgtEl) { tgtEl.classList.remove("is-landing"); } if (full) { check(); } }
      } else if (full) { check(); }
    }
    var wantFocus = false;
    function refocus() {
      if (!wantFocus) { return; }
      var f = trayEl.querySelector(".amw-jewel");
      if (f) { try { f.focus({ preventScroll: true }); } catch (e) { /* ignore */ } }
    }
    function onJewelTap(J, el, byKey) {
      if (busy || L.done) { return; }
      wantFocus = !!byKey;
      var bi = (L.sel >= 0 && !L.blanks[L.sel].jewel && !L.blanks[L.sel].locked) ? L.sel : firstEmpty();
      if (bi < 0) { return; }
      var rect = el.getBoundingClientRect();
      place(J, bi, rect);
      if (wantFocus && (reduced || !document.body.animate)) { refocus(); }
    }
    function onBlank(bi, el) {
      if (busy || L.done) { return; }
      var b = L.blanks[bi];
      if (b.locked) { return; }
      if (b.jewel) {
        var J = b.jewel; b.jewel = null; b.wrong = false; J.bounce = true; L.tray.push(J); L.sel = bi;
        paint('[data-bi="' + bi + '"]');
        return;
      }
      L.sel = bi;
      Array.prototype.forEach.call(lineEl.querySelectorAll(".amw-blank"), function (x) { x.classList.toggle("is-sel", +x.getAttribute("data-bi") === bi && !x.classList.contains("is-filled")); });
    }

    /* ---- drag and drop (pointer events: mouse, pen and touch) ---- */
    function blankAt(x, y) {
      var els = document.elementsFromPoint ? document.elementsFromPoint(x, y) : [], k, bi;
      for (k = 0; k < els.length; k++) {
        var t = els[k].closest ? els[k].closest(".amw-blank") : null;
        if (t && lineEl.contains(t) && !L.blanks[+t.getAttribute("data-bi")].locked) { return +t.getAttribute("data-bi"); }
      }
      var best = -1, bd = 44;
      Array.prototype.forEach.call(lineEl.querySelectorAll(".amw-blank"), function (t2) {
        bi = +t2.getAttribute("data-bi"); if (L.blanks[bi].locked) { return; }
        var rc = t2.getBoundingClientRect();
        var dx = Math.max(rc.left - x, 0, x - rc.right), dy = Math.max(rc.top - y, 0, y - rc.bottom), d = Math.sqrt(dx * dx + dy * dy);
        if (d < bd) { bd = d; best = bi; }
      });
      return best;
    }
    function onDown(e, J, el) {
      if (busy || L.done || dead) { return; }
      if (e.pointerType === "mouse" && e.button !== 0) { return; }
      var pid = e.pointerId, sx = e.clientX, sy = e.clientY, started = false, ghost = null, over = -1;
      var rect = el.getBoundingClientRect(), ox = sx - rect.left, oy = sy - rect.top;
      try { el.setPointerCapture(pid); } catch (err) { /* ignore */ }
      function mark(bi) {
        if (bi === over) { return; }
        over = bi;
        Array.prototype.forEach.call(lineEl.querySelectorAll(".amw-blank"), function (t) { t.classList.toggle("is-over", +t.getAttribute("data-bi") === bi); });
      }
      function move(ev) {
        if (ev.pointerId !== pid) { return; }
        if (!started) {
          if (Math.abs(ev.clientX - sx) + Math.abs(ev.clientY - sy) < 9) { return; }
          started = true;
          ghost = h("div", { class: "amw-fly amw-jewel is-drag amw-j" + (J.id % 6), "aria-hidden": "true" }, J.word);
          ghost.style.width = rect.width + "px"; ghost.style.height = rect.height + "px";
          document.body.appendChild(ghost); strays.push(ghost);
          el.classList.add("is-lifted");
          root.classList.add("is-dragging");
        }
        ghost.style.left = (ev.clientX - ox) + "px"; ghost.style.top = (ev.clientY - oy) + "px";
        mark(blankAt(ev.clientX, ev.clientY));
        if (ev.cancelable) { ev.preventDefault(); }
      }
      function stop() {
        el.removeEventListener("pointermove", move); el.removeEventListener("pointerup", up); el.removeEventListener("pointercancel", cancel);
        try { el.releasePointerCapture(pid); } catch (err) { /* ignore */ }
        root.classList.remove("is-dragging"); mark(-1);
        var k = cleanups.indexOf(stop); if (k >= 0) { cleanups.splice(k, 1); }
      }
      function dropGhost() { if (ghost && ghost.parentNode) { ghost.parentNode.removeChild(ghost); } }
      function up(ev) {
        if (ev.pointerId !== pid) { return; }
        stop();
        if (!started) { return; } // a plain tap: the click event does the work
        ignoreClick = true; setTimeout(function () { ignoreClick = false; }, 60);
        var bi = blankAt(ev.clientX, ev.clientY), gr = ghost.getBoundingClientRect();
        el.classList.remove("is-lifted");
        dropGhost();
        wantFocus = false;
        if (bi >= 0) { place(J, bi, gr); }
        else if (!reduced) { setBack(gr); }
        setFb("hint", "Drop the jewel right onto a blank space, or just tap it.");
      }
      function setBack(gr) { /* nothing to restore: the jewel never left the tray; a little wobble tells where it lives */
        var again = trayEl.querySelector('[data-id="' + J.id + '"]');
        if (again) { again.classList.remove("is-bounce"); void again.offsetWidth; again.classList.add("is-bounce"); }
      }
      function cancel(ev) {
        if (ev.pointerId !== pid) { return; }
        stop(); el.classList.remove("is-lifted"); dropGhost();
        if (started) { ignoreClick = true; setTimeout(function () { ignoreClick = false; }, 60); }
      }
      el.addEventListener("pointermove", move); el.addEventListener("pointerup", up); el.addEventListener("pointercancel", cancel);
      cleanups.push(function () { stop(); dropGhost(); });
    }

    /* ---- checking a full line ---- */
    function check() {
      if (dead || L.done) { return; }
      busy = true;
      var wrong = [];
      L.blanks.forEach(function (b) {
        if (b.locked) { return; }
        if (D.norm(b.jewel.word) === b.w.key) { b.locked = true; b.wrong = false; } else { b.wrong = true; b.miss++; b.first = false; wrong.push(b); }
      });
      if (!wrong.length) { success(); return; }
      streak = 0; hud(false);
      var names = wrong.map(function (b) { return "“" + b.jewel.word + "”"; });
      var list = names.length > 1 ? names.slice(0, -1).join(", ") + " and " + names[names.length - 1] : names[0];
      setFb("bad", list + (wrong.length > 1 ? " don’t" : " doesn’t") + " fit there. Try again: the first letter" + (wrong.length > 1 ? "s are" : " is") + " shown.");
      announce("Not quite. " + wrong.length + (wrong.length > 1 ? " words go" : " word goes") + " back to the tray.");
      paint();
      later(function () {
        wrong.forEach(function (b) { var J = b.jewel; J.bounce = true; L.tray.push(J); b.jewel = null; b.wrong = false; });
        L.sel = firstEmpty();
        busy = false;
        paint();
      }, reduced ? 500 : 900);
    }

    function success() {
      L.done = true;
      lit[li] = true; litCount++;
      var pts = 0, s = L.streakBase, perfect = true, lineFirst = 0;
      L.blanks.forEach(function (b) {
        var st = b.first ? "right" : "hint";
        try { ctx.word(b.w.i, st === "right" ? "right" : "hint"); } catch (e) { /* ignore */ }
        if (b.first) { s++; firstTry++; lineFirst++; pts += 10; if (s % 5 === 0) { pts += 2; } } else { s = 0; pts += 4; perfect = false; }
      });
      if (perfect) { pts += 5; }
      streak = s; points += pts; hud(true);
      try { ctx.award(pts, "Panel " + (li + 1) + " lit"); } catch (e) { /* ignore */ }
      lightPane(li);
      progress("Line " + (li + 1) + " of " + N + " ✓");
      winLabel();
      paint();
      busy = false;
      var msg = "Panel " + (li + 1) + " of " + N + " lit! +" + pts + " points";
      setFb("good", msg, perfect ? "Perfect: every word on the first try." : "");
      capEl.className = "amw-cap is-shown";
      clear(capEl);
      capEl.appendChild(h("span", { class: "amw-capk" }, "Panel " + (li + 1) + " means"));
      capEl.appendChild(h("span", { class: "amw-capt" }, "“" + D.LINES[li].en + "”"));
      announce(msg + ". Meaning: " + D.LINES[li].en);
      clear(trayEl);
      trayEl.classList.add("is-empty");
      if (li < N - 1) {
        setNext(li + 1);
        var nb = h("button", { type: "button", class: "qk-btn qk-btn-primary amw-next", onclick: function () { if (!busy) { startRound(li + 1); } } }, "Next line →");
        trayWrap.classList.add("is-actions");
        trayEl.classList.remove("is-empty");
        trayEl.appendChild(nb);
        try { nb.focus({ preventScroll: true }); } catch (e) { /* ignore */ }
      } else {
        busy = true;
        later(finale, reduced ? 250 : 1500);
      }
    }
    function lightPane(i) {
      var p = panes[i];
      p.classList.add("is-lit"); p.classList.remove("is-next");
      if (!reduced) { p.classList.add("is-new"); later(function () { p.classList.remove("is-new"); }, 1900); }
    }

    /* ---- finale ---- */
    function finale() {
      busy = false; finished = true;
      svg.classList.add("is-complete");
      winBox.classList.add("is-complete");
      progress("All " + N + " panels lit ✓");
      var bonus = 10; points += bonus; hud(false);
      try { ctx.award(bonus, "The window is complete"); } catch (e) { /* ignore */ }
      clear(capEl); capEl.className = "amw-cap is-shown";
      capEl.appendChild(h("span", { class: "amw-capt" }, "The window is complete"));
      clear(play);
      var lines = D.LINES.map(function (l) { return h("p", { class: "amw-fin-l", lang: "la" }, l.text); });
      var listen = speakOk() ? h("button", { type: "button", class: "amw-listen", "aria-label": "Listen to the whole prayer", onclick: function () { say(D.TEXT, {}); } }, "🔊", h("span", null, " Hear the whole prayer")) : null;
      var res = h("button", { type: "button", class: "qk-btn qk-btn-primary amw-next", onclick: function () { done(); } }, "See results →");
      var card = h("div", { class: "amw-card amw-fin" },
        h("h3", { class: "amw-fin-h", tabindex: "-1" }, "The window is complete — Gloria!"),
        h("p", { class: "amw-fin-sub" }, "Every panel shines. Read the whole prayer once, out loud."),
        h("div", { class: "amw-fin-text" }, lines),
        h("div", { class: "amw-fin-row" }, listen, res));
      play.appendChild(card);
      var hd = card.querySelector(".amw-fin-h"); if (hd) { try { hd.focus({ preventScroll: true }); } catch (e) { /* ignore */ } }
      if (!reduced) { try { QuestKit.celebrate("The window is complete — Gloria!"); } catch (e) { /* ignore */ } } else { announce("The window is complete. Gloria!"); }
    }
    function done() {
      var note = "All 8 panels are lit. " + firstTry + " of " + totalBlanks + " blanks right on the first try.";
      try { ctx.done({ title: "Light the window", correct: firstTry, total: totalBlanks, points: points, note: note }); } catch (e) { /* ignore */ }
    }

    hud(false);
    winLabel();
    startRound(0);

    return {
      destroy: function () {
        if (dead) { return; }
        dead = true;
        timers.forEach(function (t) { clearTimeout(t); });
        cleanups.slice().forEach(function (f) { try { f(); } catch (e) { /* ignore */ } });
        strays.forEach(function (g) { if (g.parentNode) { g.parentNode.removeChild(g); } });
        try { ctx.speech && ctx.speech.stop && ctx.speech.stop(); } catch (e) { /* ignore */ }
        if (root.parentNode) { root.parentNode.removeChild(root); }
      }
    };
  };
})();

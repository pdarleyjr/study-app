/* Spanish Quest: ¿Cómo vivimos? — original flat vector art (Unit 2 Grammar Adventure).
   Pure string builders: loads in Node (require) and in the browser (window.SU_ART). No DOM access at load.
   See docs/spanish-unit2-contract.md section 4. */
(function (root) {
  "use strict";

  /* ---------- palette ---------- */
  var P = {
    ink: "#3b2a22", cream: "#fff4e0", sand: "#f6d9a8", terra: "#c2410c", terraDark: "#7c2d12", clay: "#e2653a",
    sun: "#f5b82e", teal: "#0f766e", tealLight: "#1b9aaa", mint: "#cfeee6", green: "#2e9e5b", leaf: "#6dbb5a",
    sky: "#dff1f5", red: "#d6322e", pink: "#f48fb1", navy: "#24385f", wood: "#8a5a35", glass: "#cfeaf2", grey: "#8b8f9a"
  };
  var COLORS = {
    rojo: { hex: "#d6322e", en: "red" }, amarillo: { hex: "#f5c418", en: "yellow" }, negro: { hex: "#2b2b33", en: "black" },
    blanco: { hex: "#fbfbfb", en: "white" }, azul: { hex: "#2f6fdb", en: "blue" }, verde: { hex: "#2e9e5b", en: "green" },
    marron: { hex: "#8a5a35", en: "brown" }, anaranjado: { hex: "#f08a1c", en: "orange" }, rosado: { hex: "#f48fb1", en: "pink" }
  };
  var ITEM_EN = { camisa: "button-up shirt with long sleeves", camiseta: "short-sleeve T-shirt", blusa: "blouse with puffy sleeves", falda: "skirt",
    pantalon: "pair of pants", "pantalon-corto": "pair of short pants", "pantalon-largo": "pair of long pants", vestido: "dress", traje: "suit with jacket and pants", corbata: "necktie" };

  /* ---------- helpers ---------- */
  function esc(s) { return String(s == null ? "" : s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;"); }
  var uidN = 0;
  function uid(p) { uidN += 1; return (p || "su") + uidN; }
  function hex2rgb(h) { h = String(h).replace("#", ""); if (h.length === 3) h = h.replace(/(.)/g, "$1$1"); var n = parseInt(h, 16) || 0; return [(n >> 16) & 255, (n >> 8) & 255, n & 255]; }
  function rgb2hex(a) { return "#" + a.map(function (v) { v = Math.max(0, Math.min(255, Math.round(v))); return (v < 16 ? "0" : "") + v.toString(16); }).join(""); }
  function mix(a, b, t) { var x = hex2rgb(a), y = hex2rgb(b); return rgb2hex([x[0] + (y[0] - x[0]) * t, x[1] + (y[1] - x[1]) * t, x[2] + (y[2] - x[2]) * t]); }
  function shade(c, t) { return mix(c, "#000000", t == null ? 0.25 : t); }
  function tint(c, t) { return mix(c, "#ffffff", t == null ? 0.35 : t); }
  function rect(x, y, w, h, fill, rx, extra) { return '<rect x="' + x + '" y="' + y + '" width="' + w + '" height="' + h + '" fill="' + fill + '"' + (rx ? ' rx="' + rx + '"' : "") + (extra ? " " + extra : "") + "/>"; }
  function circ(cx, cy, r, fill, extra) { return '<circle cx="' + cx + '" cy="' + cy + '" r="' + r + '" fill="' + fill + '"' + (extra ? " " + extra : "") + "/>"; }
  function ell(cx, cy, rx, ry, fill, extra) { return '<ellipse cx="' + cx + '" cy="' + cy + '" rx="' + rx + '" ry="' + ry + '" fill="' + fill + '"' + (extra ? " " + extra : "") + "/>"; }
  function path(d, fill, extra) { return '<path d="' + d + '" fill="' + fill + '"' + (extra ? " " + extra : "") + "/>"; }
  function line(x1, y1, x2, y2, stroke, w, extra) { return '<line x1="' + x1 + '" y1="' + y1 + '" x2="' + x2 + '" y2="' + y2 + '" stroke="' + stroke + '" stroke-width="' + (w || 3) + '" stroke-linecap="round"' + (extra ? " " + extra : "") + "/>"; }
  function poly(pts, fill, extra) { return '<polygon points="' + pts + '" fill="' + fill + '"' + (extra ? " " + extra : "") + "/>"; }
  function grp(inner, extra) { return "<g" + (extra ? " " + extra : "") + ">" + inner + "</g>"; }
  function star(cx, cy, r, fill, extra) {
    var pts = [], i, a, rr;
    for (i = 0; i < 10; i++) { a = -Math.PI / 2 + i * Math.PI / 5; rr = i % 2 ? r * 0.45 : r; pts.push((cx + Math.cos(a) * rr).toFixed(1) + "," + (cy + Math.sin(a) * rr).toFixed(1)); }
    return poly(pts.join(" "), fill, extra);
  }
  function sparkle(cx, cy, r, fill) { return path("M" + cx + " " + (cy - r) + "Q" + cx + " " + cy + " " + (cx + r) + " " + cy + "Q" + cx + " " + cy + " " + cx + " " + (cy + r) + "Q" + cx + " " + cy + " " + (cx - r) + " " + cy + "Q" + cx + " " + cy + " " + cx + " " + (cy - r) + "Z", fill); }
  function txt(x, y, s, size, fill, anchor, extra) {
    return '<text x="' + x + '" y="' + y + '" font-size="' + size + '" fill="' + fill + '" text-anchor="' + (anchor || "middle") + '" font-weight="800" font-family="ui-rounded,\'Arial Rounded MT Bold\',system-ui,-apple-system,\'Segoe UI\',sans-serif"' + (extra ? " " + extra : "") + ">" + esc(s) + "</text>";
  }
  function wrap(w, h, inner, label, opts, cls) {
    opts = opts || {};
    var a = ' class="su-art ' + (cls || "") + '" viewBox="0 0 ' + w + " " + h + '" xmlns="http://www.w3.org/2000/svg" preserveAspectRatio="xMidYMid meet"';
    if (opts.size) a += ' width="' + opts.size + '" height="' + Math.round(opts.size * h / w) + '"';
    a += opts.decorative ? ' aria-hidden="true" focusable="false"' : ' role="img" aria-label="' + esc(label) + '"';
    return "<svg" + a + ">" + inner + "</svg>";
  }
  function backdrop(w, h, c1, c2) { return rect(0, 0, w, h, c1 || P.sky, 16) + (c2 ? rect(0, h * 0.78, w, h * 0.22, c2, 0, 'clip-path="inset(0 round 0 0 16px 16px)"') : ""); }
  function groundShadow(cx, y, rx) { return ell(cx, y, rx, 6, "#000", 'opacity=".13"'); }

  /* ---------- places: 200 x 150 glyphs, ground at y = 140 ---------- */
  var PLACE_EN = {
    hotel: "a tall yellow building with a bed and stars sign", farmacia: "a store with a big green cross sign", panaderia: "a shop with a striped awning and a loaf of bread sign",
    hospital: "a big white building with a red cross and a blue H sign", parque: "a park with trees, a bench and a soccer ball", tienda: "a clothing shop with a T-shirt sign",
    mercado: "an open market stall with a striped awning and fresh fruit", "centro-comercial": "a big glass shopping center with shopping bags",
    teatro: "a theater with columns, drama masks and a red curtain", estacion: "a train station with a clock tower and a train", apartamento: "a tall apartment building with balconies",
    casa: "a house with a pitched roof, a chimney and a door"
  };
  function win(x, y, w, h, glass) { return rect(x, y, w, h, glass || P.glass, 3) + rect(x + w / 2 - 1, y, 2, h, "#fff", 0, 'opacity=".7"') + rect(x, y + h / 2 - 1, w, 2, "#fff", 0, 'opacity=".7"'); }
  function pcross(cx, cy, s, fill) { return rect(cx - s / 6, cy - s / 2, s / 3, s, fill, 2) + rect(cx - s / 2, cy - s / 6, s, s / 3, fill, 2); }
  function bag(x, y, w, h, fill) {
    return rect(x, y, w, h, fill, 4) + rect(x, y, w, h * 0.22, shade(fill, 0.18), 4) + path("M" + (x + w * 0.3) + " " + y + "q0-" + h * 0.32 + " " + w * 0.2 + "-" + h * 0.32 + "t" + w * 0.2 + " " + h * 0.32, "none", 'stroke="' + shade(fill, 0.35) + '" stroke-width="3" stroke-linecap="round"');
  }
  var GLYPH = {};
  GLYPH.farmacia = function () {
    return groundShadow(100, 142, 84) + rect(28, 44, 144, 96, "#fdf6e3", 6) + rect(28, 44, 144, 96, "#000", 6, 'opacity=".04"') + rect(22, 32, 156, 20, P.green, 6) + rect(22, 46, 156, 6, "#1d7a45", 0) +
      win(38, 62, 34, 36, "#d4f1f4") + win(128, 62, 34, 36, "#d4f1f4") +
      rect(46, 80, 8, 14, "#f08a1c", 2) + rect(48, 76, 4, 4, "#fff", 1) + rect(58, 84, 8, 10, "#2f6fdb", 2) + rect(136, 80, 8, 14, "#2f6fdb", 2) + rect(148, 84, 8, 10, "#f08a1c", 2) +
      circ(100, 80, 25, "#fff", 'stroke="' + P.green + '" stroke-width="4"') + pcross(100, 80, 34, P.green) +
      rect(84, 108, 32, 32, P.teal, 4) + rect(88, 112, 24, 18, "#bfe8ea", 3) + circ(110, 128, 2, P.sun);
  };
  GLYPH.hospital = function () {
    return groundShadow(100, 142, 86) + rect(22, 38, 156, 102, "#f3f6fb", 5) + rect(158, 38, 20, 102, "#d9e2f0", 5) + rect(18, 32, 164, 10, "#9fb4cf", 4) +
      rect(74, 6, 52, 30, "#2563eb", 7) + rect(84, 12, 7, 18, "#fff", 1) + rect(109, 12, 7, 18, "#fff", 1) + rect(88, 18, 24, 6, "#fff", 1) +
      circ(100, 72, 26, "#fff", 'stroke="#d63a3a" stroke-width="4"') + pcross(100, 72, 34, "#d63a3a") +
      win(34, 50, 28, 22, "#cfe6fb") + win(34, 80, 28, 22, "#cfe6fb") + win(138, 50, 28, 22, "#cfe6fb") + win(138, 80, 28, 22, "#cfe6fb") +
      rect(78, 106, 44, 8, "#d63a3a", 3) + rect(82, 112, 36, 28, "#bfe0f7", 3) + rect(99, 112, 2, 28, "#fff");
  };
  GLYPH.panaderia = function () {
    var i, o = groundShadow(100, 142, 84) + rect(28, 52, 144, 88, P.sand, 6) + rect(150, 52, 22, 88, "#e8c88e", 6);
    o += rect(62, 4, 76, 32, P.terraDark, 8) + ell(100, 21, 22, 11, "#d98e3a") + path("M84 17q5-5 8 0M96 14q5-5 8 0M108 17q5-5 8 0", "none", 'stroke="#f6d39a" stroke-width="3" stroke-linecap="round"');
    for (i = 0; i < 8; i++) o += rect(28 + i * 18, 40, 18, 22, i % 2 ? P.cream : "#d9531e") + circ(37 + i * 18, 62, 9, i % 2 ? P.cream : "#d9531e");
    o += rect(38, 76, 62, 40, "#7a4a24", 4) + rect(42, 80, 54, 32, "#ffe9b8", 3) +
      path("M48 108L74 84", "none", 'stroke="#d98e3a" stroke-width="7" stroke-linecap="round"') + path("M60 108L86 84", "none", 'stroke="#c77d2e" stroke-width="7" stroke-linecap="round"') +
      circ(86, 104, 6, "#d98e3a") + circ(75, 106, 5, "#c77d2e") +
      rect(112, 74, 38, 66, "#8a4b1f", 4) + rect(117, 80, 28, 22, "#ffe9b8", 3) + circ(142, 112, 2.5, P.sun);
    return o;
  };
  GLYPH.tienda = function () {
    var i, o = groundShadow(100, 142, 84) + rect(28, 52, 144, 88, "#cfc7f4", 6) + rect(150, 52, 22, 88, "#b5abe6", 6);
    o += rect(56, 4, 88, 34, P.sun, 8) + path("M80 12l8-4q4 6 12 6t12-6l8 4 8 8-8 6-4-4v16H84V22l-4 4-8-6z", "#fff", 'stroke="' + P.terraDark + '" stroke-width="3" stroke-linejoin="round"');
    for (i = 0; i < 8; i++) o += rect(28 + i * 18, 40, 18, 20, i % 2 ? "#e6f7f9" : P.tealLight) + circ(37 + i * 18, 60, 9, i % 2 ? "#e6f7f9" : P.tealLight);
    o += rect(36, 74, 66, 44, "#fff", 4) + rect(40, 78, 58, 36, "#eaf6ff", 3) +
      path("M54 84h14l4 6-6 4v18H56V94l-6-4z", P.red) + path("M80 90h14l6 24H74z", P.pink) +
      rect(112, 74, 38, 66, P.teal, 4) + rect(117, 80, 28, 22, "#bfe8ea", 3) + circ(142, 112, 2.5, P.sun);
    return o;
  };
  GLYPH.mercado = function () {
    var i, o = groundShadow(100, 142, 86);
    o += rect(34, 36, 6, 104, P.wood) + rect(160, 36, 6, 104, P.wood) + rect(40, 62, 120, 54, "#fbe7c4", 4);
    o += rect(46, 66, 108, 24, "#6dbb5a", 4, 'opacity=".5"');
    for (i = 0; i < 8; i++) {
      o += poly((40 + i * 15) + ",16 " + (55 + i * 15) + ",16 " + (40 + i * 20) + ",48 " + (20 + i * 20) + ",48", i % 2 ? "#fff" : "#d6322e");
      o += circ(30 + i * 20, 48, 10, i % 2 ? "#fff" : "#d6322e");
    }
    o += rect(24, 112, 152, 28, "#b57a45", 5) + rect(24, 112, 152, 8, "#c98b5e", 4);
    o += rect(34, 92, 40, 24, "#8a5a35", 4) + rect(82, 92, 36, 24, "#8a5a35", 4) + rect(126, 92, 40, 24, "#8a5a35", 4);
    var apples = [[42, 92, "#d6322e"], [54, 90, "#d6322e"], [66, 93, "#e8453c"], [90, 92, "#f08a1c"], [102, 90, "#f08a1c"], [112, 93, "#f5a623"], [134, 93, "#2e9e5b"], [146, 90, "#6dbb5a"], [158, 93, "#2e9e5b"]];
    apples.forEach(function (a) { o += circ(a[0], a[1], 8, a[2]) + circ(a[0] - 2, a[1] - 3, 2, "#fff", 'opacity=".5"'); });
    return o;
  };
  GLYPH["centro-comercial"] = function () {
    var i, o = groundShadow(100, 142, 90) + rect(12, 24, 176, 116, "#7cc9d6", 8) + rect(12, 14, 176, 24, P.teal, 8);
    o += rect(14, 40, 172, 100, "#9ad9e2", 4);
    for (i = 1; i < 6; i++) o += rect(12 + i * 29, 40, 2.5, 100, "#fff", 0, 'opacity=".7"');
    for (i = 1; i < 3; i++) o += rect(12, 40 + i * 33, 176, 2.5, "#fff", 0, 'opacity=".7"');
    o += poly("30,40 62,40 24,140 12,140 12,110", "#fff", 'opacity=".22"') + poly("100,40 124,40 86,140 62,140", "#fff", 'opacity=".16"');
    o += bag(88, 18, 12, 12, "#fff");
    o += rect(80, 94, 40, 46, "#1c5f6a", 4) + rect(84, 98, 15, 42, "#bdeaf1", 2) + rect(101, 98, 15, 42, "#bdeaf1", 2);
    o += rect(66, 56, 68, 10, P.sun, 4);
    o += bag(26, 112, 26, 28, P.red) + bag(150, 108, 26, 32, P.sun) + bag(54, 122, 18, 18, "#2f6fdb");
    return o;
  };
  GLYPH.teatro = function () {
    var i, o = groundShadow(100, 142, 86) + rect(22, 54, 156, 86, "#7f1d3a", 4) + poly("14,54 100,10 186,54", "#a3314f") + poly("30,54 100,20 170,54", "#7f1d3a", 'opacity=".5"') + rect(14, 52, 172, 6, "#f5b82e", 2);
    // masks
    o += circ(80, 40, 12, "#f5b82e") + ell(76, 38, 2.4, 3, "#7f1d3a") + ell(84, 38, 2.4, 3, "#7f1d3a") + path("M73 44q7 8 14 0", "none", 'stroke="#7f1d3a" stroke-width="2.6" stroke-linecap="round"');
    o += circ(120, 40, 12, "#fde68a") + ell(116, 38, 2.4, 3, "#7f1d3a") + ell(124, 38, 2.4, 3, "#7f1d3a") + path("M113 49q7-8 14 0", "none", 'stroke="#7f1d3a" stroke-width="2.6" stroke-linecap="round"');
    for (i = 0; i < 4; i++) o += rect(32 + (i < 2 ? i * 22 : 94 + (i - 2) * 22), 62, 12, 78, "#fff4e0", 3);
    o += path("M80 140V98Q80 80 100 80Q120 80 120 98V140Z", "#d9304a") + path("M100 80V140M90 84l-4 56M110 84l4 56", "none", 'stroke="#a31e36" stroke-width="3"') + rect(70, 134, 60, 8, "#e8c88e", 2);
    return o;
  };
  GLYPH.estacion = function () {
    var i, o = groundShadow(100, 142, 92) + rect(26, 44, 148, 58, "#e0956a", 4) + rect(76, 14, 48, 52, "#c26a3d", 3) + poly("70,16 100,2 130,16", "#7c2d12");
    o += circ(100, 36, 14, "#fff", 'stroke="#7c2d12" stroke-width="3"') + path("M100 36V27M100 36l7 4", "none", 'stroke="#3b2a22" stroke-width="2.5" stroke-linecap="round"');
    o += win(36, 56, 30, 24) + win(134, 56, 30, 24) + rect(88, 70, 24, 32, "#5a2d17", 3);
    o += rect(12, 98, 176, 34, "#2b7bbd", 7) + rect(12, 98, 176, 9, "#1d5a91", 5) + rect(160, 86, 22, 14, "#2b7bbd", 3) + rect(146, 82, 10, 16, "#1d5a91", 2);
    for (i = 0; i < 5; i++) o += rect(22 + i * 27, 109, 18, 13, "#d4ecff", 3);
    o += circ(182, 114, 4, P.sun) + rect(10, 133, 180, 5, "#6b5a4a", 2);
    [30, 62, 96, 128, 160].forEach(function (x) { o += circ(x, 132, 7, "#2a2f3a") + circ(x, 132, 2.5, "#9aa4b5"); });
    return o;
  };
  GLYPH.hotel = function () {
    var r, c, o = groundShadow(100, 142, 84) + rect(42, 22, 116, 118, "#f4c04a", 5) + rect(138, 22, 20, 118, "#dca62c", 5) + rect(38, 18, 124, 8, "#c9902a", 3);
    o += rect(60, 0, 80, 34, P.teal, 8) + rect(70, 20, 34, 6, "#fff", 2) + rect(70, 10, 5, 16, "#fff", 1) + rect(76, 14, 12, 6, "#ffdede", 2) + rect(70, 26, 3, 5, "#fff") + rect(101, 26, 3, 5, "#fff");
    o += star(116, 13, 6.5, P.sun) + star(129, 21, 6.5, P.sun) + star(113, 26, 4.5, P.sun, 'opacity="0"');
    for (r = 0; r < 3; r++) for (c = 0; c < 3; c++) { if (r === 2 && c === 1) continue; o += win(56 + c * 30, 42 + r * 26, 20, 18, (r + c) % 4 === 1 ? "#fff3b0" : P.glass); }
    o += rect(76, 110, 48, 8, P.teal, 3) + rect(84, 116, 32, 24, "#7c4a28", 3) + rect(88, 120, 10, 20, "#bfe8ea") + rect(102, 120, 10, 20, "#bfe8ea");
    return o;
  };
  GLYPH.parque = function () {
    var o = ell(100, 128, 96, 22, "#79c466") + ell(100, 134, 96, 14, "#5aa84c", 'opacity=".5"') + path("M70 150Q92 126 134 120", "none", 'stroke="#ecd9a8" stroke-width="14" stroke-linecap="round"');
    o += rect(38, 62, 9, 66, P.wood) + circ(42, 50, 28, P.green) + circ(26, 66, 19, "#38b06a") + circ(60, 66, 19, "#38b06a") + circ(48, 40, 12, "#4cc47a", 'opacity=".6"');
    o += rect(158, 78, 7, 50, P.wood) + circ(162, 68, 22, P.green) + circ(148, 82, 14, "#38b06a") + circ(176, 82, 14, "#38b06a");
    o += rect(98, 96, 40, 5, "#a56a38", 2) + rect(98, 104, 40, 5, "#a56a38", 2) + rect(102, 108, 4, 16, "#6b4423") + rect(130, 108, 4, 16, "#6b4423");
    o += circ(82, 124, 13, "#fff", 'stroke="#2b2b33" stroke-width="2.4"') + poly("82,117 88,121 86,128 78,128 76,121", "#2b2b33") + path("M82 117V111M88 121l6-3M86 128l4 6M78 128l-4 6M76 121l-6-3", "none", 'stroke="#2b2b33" stroke-width="2"');
    o += circ(116, 130, 3, "#fff") + circ(124, 134, 3, P.sun) + circ(110, 136, 3, P.pink);
    return o;
  };
  GLYPH.casa = function () {
    var o = groundShadow(100, 142, 84) + rect(38, 64, 124, 76, "#f9d9a6", 4) + rect(138, 64, 24, 76, "#e8bf80", 4) + rect(124, 28, 16, 34, "#a85a3a", 2) + rect(122, 24, 20, 7, "#7c2d12", 2) +
      poly("24,68 100,18 176,68", P.terra) + poly("24,68 100,18 100,28 38,68", "#e2653a", 'opacity=".6"') + rect(24, 66, 152, 6, "#7c2d12", 2) +
      circ(100, 46, 8, "#fff3b0", 'stroke="#7c2d12" stroke-width="3"') + rect(86, 88, 28, 52, P.teal, 4) + circ(106, 116, 2.5, P.sun) + rect(90, 94, 20, 12, "#bfe8ea", 2) +
      win(48, 84, 28, 28) + win(126, 84, 26, 28) + rect(44, 112, 36, 5, "#7c2d12", 2) + rect(120, 112, 36, 5, "#7c2d12", 2);
    o += circ(52, 108, 3, P.red, 'opacity="0"') + circ(50, 118, 4, P.pink) + circ(60, 118, 4, P.sun) + circ(70, 118, 4, P.pink);
    return o;
  };
  GLYPH.apartamento = function () {
    var r, c, o = groundShadow(100, 142, 70) + rect(52, 6, 96, 134, "#e8a07c", 4) + rect(128, 6, 20, 134, "#cf8460", 4) + rect(46, 2, 108, 8, "#7c2d12", 3);
    for (r = 0; r < 4; r++) for (c = 0; c < 2; c++) {
      o += win(62 + c * 38, 16 + r * 28, 22, 16, (r === 1 && c === 0) || (r === 2 && c === 1) ? "#fff3b0" : P.glass) + rect(58 + c * 38, 33 + r * 28, 30, 5, "#7c2d12", 2) + rect(61 + c * 38, 33 + r * 28 - 5, 24, 1.5, "#7c2d12", 0, 'opacity=".5"');
    }
    o += rect(84, 112, 32, 28, "#5a2d17", 3) + rect(88, 116, 24, 24, "#bfe8ea", 3) + circ(108, 130, 2, P.sun);
    return o;
  };

  function placeSvgInner(id) { return GLYPH[id] ? GLYPH[id]() : null; }

  /* ---------- clothing: 160 x 160 ---------- */
  function outlineOf(fill) { return fill === "#fbfbfb" ? "#8f98aa" : shade(fill, 0.38); }
  var GARMENT = {};
  GARMENT.camiseta = function (f, s) {
    var d = shade(f, 0.14);
    return path("M54 26L34 34 12 62l24 18 12-12v72q0 4 4 4h56q4 0 4-4V68l12 12 24-18-22-28-20-8q-4 14-26 14T54 26z", f) +
      path("M54 26q26 22 52 0", "none", 'stroke="' + s + '" stroke-width="4" stroke-linecap="round"') +
      path("M48 68l-12 12M112 68l12 12", "none", 'stroke="' + d + '" stroke-width="3" stroke-linecap="round"') + path("M56 134h48", "none", 'stroke="' + d + '" stroke-width="3" stroke-linecap="round"');
  };
  GARMENT.camisa = function (f, s) {
    var l = tint(f, 0.45), d = shade(f, 0.14), btn = f === "#fbfbfb" ? "#8f98aa" : tint(f, 0.7);
    return path("M54 24L32 34 18 114l20 6 8-48v68q0 4 4 4h60q4 0 4-4V72l8 48 20-6-14-80-22-10-26 14z", f) +
      path("M54 24l26 18-12 14-20-14zM106 24L80 42l12 14 20-14z", l) +
      path("M54 24l26 18-12 14-20-14zM106 24L80 42l12 14 20-14z", "none", 'stroke="' + s + '" stroke-width="3" stroke-linejoin="round"') +
      rect(77, 44, 6, 96, d, 0) + circ(80, 62, 3.2, btn) + circ(80, 84, 3.2, btn) + circ(80, 106, 3.2, btn) + circ(80, 126, 3.2, btn) +
      rect(92, 70, 18, 20, d, 3, 'opacity=".55"') + path("M20 106l17 6M140 106l-17 6", "none", 'stroke="' + d + '" stroke-width="4" stroke-linecap="round"');
  };
  GARMENT.blusa = function (f, s) {
    var l = tint(f, 0.5), d = shade(f, 0.12), o = "", i, st = 'stroke="' + s + '" stroke-width="3.5"';
    o += path("M54 30Q80 46 106 30L122 46 114 108Q120 128 124 138H36Q40 128 46 108L38 46Z", f, st + ' stroke-linejoin="round"');
    o += ell(32, 62, 19, 25, f, st + ' transform="rotate(16 32 62)"') + ell(128, 62, 19, 25, f, st + ' transform="rotate(-16 128 62)"');
    o += path("M24 78q9 7 19 2M136 78q-9 7-19 2", "none", 'stroke="' + s + '" stroke-width="3.5" stroke-linecap="round"') + path("M30 46q-6 14-2 26M130 46q6 14 2 26", "none", 'stroke="' + d + '" stroke-width="3" stroke-linecap="round"');
    for (i = 0; i < 5; i++) o += circ(56 + i * 12, [31, 36, 38, 36, 31][i], 7.5, l, st);
    for (i = 0; i < 7; i++) o += circ(44 + i * 12, 138, 9, l, st);
    o += circ(80, 62, 3, d) + circ(80, 80, 3, d) + circ(80, 98, 3, d);
    return o;
  };
  GARMENT.falda = function (f, s) {
    var d = shade(f, 0.16);
    return path("M52 38h56l32 96q-60 18-120 0z", f) + path("M52 38h56l32 96q-60 18-120 0z", "none", 'stroke="' + s + '" stroke-width="3.5" stroke-linejoin="round"') +
      rect(50, 28, 60, 16, d, 4) + rect(50, 28, 60, 16, "none", 3, 'stroke="' + s + '" stroke-width="3"') +
      path("M66 44L50 134M80 44v92M94 44l16 90", "none", 'stroke="' + d + '" stroke-width="3" stroke-linecap="round"') + circ(80, 36, 3, tint(f, 0.6));
  };
  GARMENT["pantalon-corto"] = function (f, s) {
    var d = shade(f, 0.16);
    return path("M42 30h76l8 80H90L80 66l-10 44H34z", f) + path("M42 30h76l8 80H90L80 66l-10 44H34z", "none", 'stroke="' + s + '" stroke-width="3.5" stroke-linejoin="round"') +
      rect(42, 30, 76, 14, d, 3) + rect(42, 30, 76, 14, "none", 3, 'stroke="' + s + '" stroke-width="3"') + path("M80 44v22", "none", 'stroke="' + s + '" stroke-width="3"') +
      path("M52 54q8 12 18 4M108 54q-8 12-18 4", "none", 'stroke="' + d + '" stroke-width="3" stroke-linecap="round"') + path("M36 104h32M92 104h32", "none", 'stroke="' + d + '" stroke-width="3" stroke-linecap="round"');
  };
  GARMENT["pantalon-largo"] = function (f, s) {
    var d = shade(f, 0.16);
    return path("M44 10h72l6 144H90L80 50l-10 104H38z", f) + path("M44 10h72l6 144H90L80 50l-10 104H38z", "none", 'stroke="' + s + '" stroke-width="3.5" stroke-linejoin="round"') +
      rect(44, 10, 72, 14, d, 3) + rect(44, 10, 72, 14, "none", 3, 'stroke="' + s + '" stroke-width="3"') + path("M80 24v26", "none", 'stroke="' + s + '" stroke-width="3"') +
      path("M54 34q8 12 18 4M106 34q-8 12-18 4", "none", 'stroke="' + d + '" stroke-width="3" stroke-linecap="round"') + path("M39 142h30M91 142h30", "none", 'stroke="' + d + '" stroke-width="4" stroke-linecap="round"') + circ(80, 17, 3, tint(f, 0.6));
  };
  GARMENT.pantalon = GARMENT["pantalon-largo"];
  GARMENT.vestido = function (f, s) {
    var d = shade(f, 0.14), l = tint(f, 0.45);
    return path("M54 12l6 24q-2 16 4 26l-8 6 4 10L20 146q60 16 120 0L102 78l4-10-8-6q6-10 4-26l6-24-12 2q-6 14-14 14T66 14z", f) +
      path("M54 12l6 24q-2 16 4 26l-8 6 4 10L20 146q60 16 120 0L102 78l4-10-8-6q6-10 4-26l6-24-12 2q-6 14-14 14T66 14z", "none", 'stroke="' + s + '" stroke-width="3.5" stroke-linejoin="round"') +
      path("M58 36q22 22 44 0", "none", 'stroke="' + s + '" stroke-width="3" stroke-linecap="round"') + rect(56, 66, 48, 10, l, 3) + rect(56, 66, 48, 10, "none", 3, 'stroke="' + s + '" stroke-width="3"') + circ(80, 71, 4, d) +
      path("M70 78L50 144M90 78l20 66M80 78v70", "none", 'stroke="' + d + '" stroke-width="3" stroke-linecap="round" opacity=".7"');
  };
  GARMENT.traje = function (f, s) {
    var d = shade(f, 0.16), tie = f === "#d6322e" ? "#2f6fdb" : "#d6322e";
    return path("M52 84h56l6 66H90L80 112l-10 38H46z", d) + path("M52 84h56l6 66H90L80 112l-10 38H46z", "none", 'stroke="' + s + '" stroke-width="3" stroke-linejoin="round"') +
      path("M48 14L28 22 22 84l22 6 8-24V92h56V66l8 24 22-6-6-62-20-8-18 8-14 14-14-14z", f) +
      path("M48 14l32 38-16 40V30z", "#fff") + path("M112 14L80 52l16 40V30z", "#fff") + poly("72,34 88,34 84,42 76,42", tie) + poly("76,42 84,42 87,76 80,84 73,76", tie) +
      path("M48 14l24 48-14 30H52zM112 14L88 62l14 30h10z", f, 'stroke="' + s + '" stroke-width="3" stroke-linejoin="round"') +
      path("M48 14L28 22 22 84l22 6 8-24V92h56V66l8 24 22-6-6-62-20-8", "none", 'stroke="' + s + '" stroke-width="3" stroke-linejoin="round"') +
      circ(80, 100, 3, tint(f, 0.5)) + circ(80, 118, 0, "none");
  };
  GARMENT.corbata = function (f, s) {
    var d = shade(f, 0.18), l = tint(f, 0.4);
    return path("M64 8h32l6 20-22 10-22-10z", f) + path("M64 8h32l6 20-22 10-22-10z", "none", 'stroke="' + s + '" stroke-width="3.5" stroke-linejoin="round"') +
      path("M70 38l-10 98 20 16 20-16-10-98z", f) + path("M70 38l-10 98 20 16 20-16-10-98z", "none", 'stroke="' + s + '" stroke-width="3.5" stroke-linejoin="round"') +
      path("M66 70l28-12M63 94l34-14M62 118l36-14", "none", 'stroke="' + l + '" stroke-width="6" stroke-linecap="round" opacity=".75"') + path("M72 12l-6 14", "none", 'stroke="' + l + '" stroke-width="3" stroke-linecap="round"');
  };
  function stainsFor(item) {
    var spots = [[58, 62, 9, 7], [96, 84, 11, 8], [70, 112, 8, 6], [104, 46, 6, 5]];
    if (item === "corbata") spots = [[76, 70, 6, 5], [86, 100, 7, 5], [78, 124, 5, 4]];
    if (item === "pantalon-corto") spots = [[56, 70, 9, 7], [102, 92, 9, 6], [70, 98, 6, 5]];
    return spots.map(function (p) { return ell(p[0], p[1], p[2], p[3], "#6b4a2b", 'opacity=".78" transform="rotate(-18 ' + p[0] + " " + p[1] + ')"') + circ(p[0] + p[2] + 4, p[1] + 5, 2, "#6b4a2b", 'opacity=".7"'); }).join("") +
      path("M122 20q4-8 10-2M132 34q6-6 10 0", "none", 'stroke="#8a6a4a" stroke-width="2.4" stroke-linecap="round"') + ell(136, 22, 4, 2.6, "#5a4a3a") + ell(131, 20, 3, 2, "#cfd6dd", 'opacity=".8"');
  }
  function garmentInner(item, color, state) {
    var info = COLORS[color] || COLORS.azul, f = info.hex, fn = GARMENT[item] || GARMENT.camiseta, s = outlineOf(f);
    var o = fn(f, s);
    if (state === "sucia") o += stainsFor(item);
    if (state === "limpia") o += sparkle(124, 30, 11, "#fff") + sparkle(40, 100, 8, "#ffe27a") + sparkle(132, 110, 7, "#fff") + sparkle(34, 40, 6, "#fff");
    return o;
  }
  function garmentLabel(item, color, state) {
    var info = COLORS[color] || COLORS.azul, name = ITEM_EN[item] || "garment";
    return "a " + (state === "sucia" ? "dirty " : state === "limpia" ? "clean, sparkling " : "") + info.en + " " + name;
  }
  function renderClothing(spec, opts) {
    var inner = rect(0, 0, 160, 160, "#fff7e8", 18) + ell(80, 152, 52, 5, "#000", 'opacity=".1"') + garmentInner(spec.item, spec.color, spec.state);
    return wrap(160, 160, inner, garmentLabel(spec.item, spec.color, spec.state), opts, "su-art-clothing");
  }
  function renderOutfit(spec, opts) {
    var items = (spec.items || []).slice(0, 3), n = Math.max(1, items.length), w = n * 150 + 10, o = rect(0, 0, w, 170, "#fff7e8", 18), labels = [];
    items.forEach(function (it, i) {
      o += grp(garmentInner(it.item, it.color, it.state), 'transform="translate(' + (10 + i * 150) + ' 8) scale(.9)"');
      labels.push(garmentLabel(it.item, it.color, it.state));
    });
    return wrap(w, 170, o, labels.length ? "an outfit: " + labels.join(", ") : "an empty outfit", opts, "su-art-outfit");
  }

  /* ---------- tools & things: 160 x 160 ---------- */
  var TOOL = {}, TOOL_EN = {
    escoba: "a broom with a long handle and stiff bristles", trapeador: "a mop with a long handle and a soft shaggy head",
    aspiradora: "a vacuum cleaner with a hose and wheels", jabon: "a bar of soap covered in bubbles", agua: "a bucket of water with a splash"
  };
  TOOL.escoba = function () {
    return path("M30 142L118 20", "none", 'stroke="#a56a38" stroke-width="9" stroke-linecap="round"') + path("M34 138L118 22", "none", 'stroke="#c98b5e" stroke-width="3" stroke-linecap="round"') +
      grp(poly("96,64 120,80 82,142 38,118", "#e9c46a") + path("M92 72l-34 52M102 78L66 130M110 84L74 136", "none", 'stroke="#c99a2e" stroke-width="3" stroke-linecap="round"') + poly("92,60 118,78 112,88 86,70", P.terra) + path("M90 66l24 16", "none", 'stroke="#7c2d12" stroke-width="2"'), 'transform="translate(6 4)"') +
      circ(120, 18, 6, "#6b4423") + sparkle(36, 40, 9, P.sun) + sparkle(138, 112, 7, "#fff");
  };
  TOOL.trapeador = function () {
    var i, o = path("M112 12L78 100", "none", 'stroke="#a56a38" stroke-width="9" stroke-linecap="round"') + path("M114 16L81 96", "none", 'stroke="#c98b5e" stroke-width="3" stroke-linecap="round"');
    o += rect(48, 94, 64, 12, "#6b7a99", 6, 'transform="rotate(-12 80 100)"') + path("M44 106Q40 140 56 148H108Q124 140 116 106Q80 96 44 106Z", "#e8eef6", 'stroke="#aebdd4" stroke-width="3" stroke-linejoin="round"');
    for (i = 0; i < 7; i++) o += path("M" + (54 + i * 9) + " 108v36", "none", 'stroke="#aebdd4" stroke-width="3" stroke-linecap="round"');
    return o + ell(112, 152, 36, 5, "#5aa9d6", 'opacity=".5"') + circ(130, 136, 4, "#5aa9d6") + circ(138, 148, 3, "#5aa9d6") + sparkle(32, 40, 8, P.sun);
  };
  TOOL.aspiradora = function () {
    return path("M96 84Q132 52 134 20", "none", 'stroke="#555b6e" stroke-width="9" stroke-linecap="round"') + rect(124, 8, 22, 14, "#2f6fdb", 5) +
      rect(24, 74, 92, 48, "#d6322e", 22) + rect(34, 80, 72, 14, "#e8685f", 8) + rect(44, 100, 20, 8, "#fff", 3) + circ(100, 98, 7, "#fff") + circ(100, 98, 3, "#a8231f") +
      circ(42, 130, 14, "#2a2f3a") + circ(42, 130, 5, "#9aa4b5") + circ(96, 132, 10, "#2a2f3a") + circ(96, 132, 4, "#9aa4b5") + path("M20 98q-14 0-14 16", "none", 'stroke="#555b6e" stroke-width="5" stroke-linecap="round"');
  };
  TOOL.jabon = function () {
    var o = rect(30, 80, 100, 48, "#ffd6e3", 14) + rect(30, 80, 100, 18, "#ffb8cf", 14) + rect(40, 104, 40, 6, "#fff", 3, 'opacity=".6"');
    o += circ(110, 56, 18, "#d9f2ff", 'stroke="#7fc3e8" stroke-width="3"') + circ(104, 50, 5, "#fff", 'opacity=".8"') + circ(66, 52, 24, "#e9f8ff", 'stroke="#7fc3e8" stroke-width="3"') + circ(58, 44, 7, "#fff", 'opacity=".85"');
    o += circ(36, 70, 11, "#d9f2ff", 'stroke="#7fc3e8" stroke-width="3"') + circ(132, 90, 9, "#e9f8ff", 'stroke="#7fc3e8" stroke-width="3"') + circ(86, 28, 8, "#e9f8ff", 'stroke="#7fc3e8" stroke-width="3"');
    return o + sparkle(132, 30, 8, "#fff");
  };
  TOOL.agua = function () {
    var o = path("M38 70h84l-10 70H48z", "#2f6fdb") + rect(34, 64, 92, 12, "#1f4fa8", 6) + path("M42 76h76l-3 18H45z", "#7fc3e8") + path("M50 100h8l6 36h-8z", "#fff", 'opacity=".25"');
    o += path("M38 68Q80 8 122 68", "none", 'stroke="#8f98aa" stroke-width="5" stroke-linecap="round"');
    o += path("M80 30q10 16 0 24q-10-8 0-24z", "#5ec1f0") + path("M34 40q7 12 0 18q-7-6 0-18z", "#5ec1f0") + path("M130 44q7 12 0 18q-7-6 0-18z", "#5ec1f0") + path("M144 94q5 9 0 14q-5-5 0-14z", "#7fd2f7");
    return o + path("M46 82q10-6 20 0t20 0 20 0", "none", 'stroke="#fff" stroke-width="3" stroke-linecap="round" opacity=".8"');
  };

  var THING = {}, THING_EN = {
    alfombra: "a patterned rug with fringe on the ends", piso: "a shiny wooden floor made of boards", pan: "a loaf of bread and a roll",
    medicinas: "a medicine bottle, pills and a first-aid box", libros: "a stack of three books", comida: "a basket full of vegetables, fruit and bread",
    ropa: "a shirt and pants hanging together", tren: "a blue train engine with wheels", dinero: "a pile of paper money and coins", moneda: "one shiny gold coin with a star", balon: "a black and white soccer ball"
  };
  THING.alfombra = function () {
    var i, o = poly("26,60 134,60 150,120 10,120", "#c2410c") + poly("36,68 124,68 136,112 24,112", "#fde8c8") + poly("44,74 116,74 126,106 34,106", "#0f766e") + poly("54,80 106,80 114,100 46,100", "#f5b82e");
    o += poly("66,84 94,84 98,96 62,96", "#c2410c") + circ(80, 90, 4, "#fff");
    for (i = 0; i < 12; i++) o += line(14 + i * 11.5, 120, 12 + i * 11.5, 130, "#e8c88e", 3) + line(28 + i * 9.5, 60, 28 + i * 9.5, 52, "#e8c88e", 3);
    return o;
  };
  THING.piso = function () {
    var i, o = poly("10,40 150,40 156,140 4,140", "#d9a066");
    for (i = 0; i < 6; i++) o += path("M" + (10 - i * 1) + " " + (40 + i * 20) + "L" + (150 + i) + " " + (40 + i * 20), "none", 'stroke="#a8713e" stroke-width="2.5"');
    for (i = 0; i < 5; i++) o += path("M" + (40 + (i % 2) * 20 + i * 12) + " " + (40 + i * 20) + "l" + (i % 2 ? 1 : -1) * 2 + " 20", "none", 'stroke="#a8713e" stroke-width="2.5"');
    return o + poly("20,44 52,44 36,138 10,138", "#fff", 'opacity=".22"') + sparkle(112, 80, 12, "#fff") + sparkle(60, 112, 8, "#fff");
  };
  THING.pan = function () {
    var o = ell(80, 128, 66, 8, "#000", 'opacity=".1"') + path("M16 96q0-34 44-34t44 34q0 26-44 26T16 96z", "#d98e3a", 'transform="rotate(-14 60 96)"');
    o += path("M30 82q10-12 18-2M52 74q10-12 18-2M72 80q10-12 18-2", "none", 'stroke="#f6d39a" stroke-width="5" stroke-linecap="round" transform="rotate(-10 60 90)"');
    o += circ(118, 108, 24, "#c77d2e") + path("M104 98q14-10 28 0", "none", 'stroke="#f3c277" stroke-width="4" stroke-linecap="round"') + circ(110, 100, 4, "#e5ad5a") + sparkle(136, 64, 9, P.sun);
    return o;
  };
  THING.medicinas = function () {
    var o = rect(14, 90, 76, 52, "#fff", 8, 'stroke="#9aa4b5" stroke-width="3"') + pcross(52, 116, 28, P.green);
    o += rect(100, 54, 34, 70, "#f08a1c", 8) + rect(104, 40, 26, 18, "#fff", 4) + rect(104, 76, 26, 26, "#fff", 3) + pcross(117, 89, 14, P.green);
    o += ell(40, 70, 14, 7, "#fff", 'transform="rotate(-20 40 70)" stroke="#9aa4b5" stroke-width="2.5"') + circ(70, 78, 7, "#f5b82e") + circ(24, 82, 7, "#ec6b9a");
    return o;
  };
  THING.libros = function () {
    return ell(80, 140, 62, 7, "#000", 'opacity=".1"') + rect(20, 98, 120, 36, "#2f6fdb", 6) + rect(24, 104, 112, 24, "#fff4e0", 3) + rect(20, 98, 14, 36, "#1f4fa8", 5) +
      rect(28, 62, 112, 34, "#d6322e", 6) + rect(36, 68, 100, 22, "#fff4e0", 3) + rect(28, 62, 14, 34, "#a8231f", 5) +
      rect(36, 28, 100, 32, "#2e9e5b", 6) + rect(44, 34, 88, 20, "#fff4e0", 3) + rect(36, 28, 14, 32, "#1d7a45", 5) + star(90, 44, 6, P.sun, 'opacity=".0"') + circ(120, 80, 6, P.sun) ;
  };
  THING.comida = function () {
    var o = path("M18 78h124l-14 62H32z", "#b57a45") + path("M28 96h104M32 116h96", "none", 'stroke="#8a5a35" stroke-width="3"') + path("M30 78Q80 30 130 78", "none", 'stroke="#8a5a35" stroke-width="6" stroke-linecap="round"');
    o += circ(54, 68, 16, "#d6322e") + path("M54 52q2-8 8-8", "none", 'stroke="#2e9e5b" stroke-width="3"') + circ(86, 62, 16, "#f08a1c") + path("M86 46l6-6", "none", 'stroke="#2e9e5b" stroke-width="4" stroke-linecap="round"');
    o += path("M106 70l22-34 6 6-18 36z", "#f08a1c") + path("M126 36l-4-10M132 38l6-8", "none", 'stroke="#2e9e5b" stroke-width="4" stroke-linecap="round"') + ell(112, 60, 11, 18, "#d98e3a", 'transform="rotate(30 112 60)"');
    return o + rect(18, 78, 124, 10, "#a56a38", 4);
  };
  THING.ropa = function () {
    var o = path("M80 22q0-12 10-12t10 10q0 8-10 12", "none", 'stroke="#8f98aa" stroke-width="4" stroke-linecap="round"') + path("M30 52L80 28l50 24", "none", 'stroke="#8f98aa" stroke-width="5" stroke-linecap="round" stroke-linejoin="round"');
    o += grp(GARMENT.camiseta("#2f6fdb", "#1f4fa8"), 'transform="translate(10 46) scale(.5)"') + grp(GARMENT["pantalon-largo"]("#f5c418", "#b8920f"), 'transform="translate(62 54) scale(.62)"') + grp(GARMENT.falda("#f48fb1", "#b04a74"), 'transform="translate(100 56) scale(.4)"');
    return o;
  };
  THING.tren = function () {
    var o = rect(8, 144, 144, 6, "#6b5a4a", 2) + rect(14, 52, 100, 74, "#2b7bbd", 10) + rect(14, 52, 100, 18, "#1d5a91", 8) + rect(108, 34, 38, 92, "#1d5a91", 8) + rect(114, 44, 26, 28, "#d4ecff", 5) + rect(34, 22, 22, 32, "#2a2f3a", 4) + rect(30, 18, 30, 8, "#2a2f3a", 3);
    o += circ(46, 10, 7, "#fff", 'opacity=".7"') + circ(56, 2, 5, "#fff", 'opacity=".5"') + rect(26, 76, 72, 22, "#d4ecff", 6) + circ(144, 100, 6, P.sun) + path("M146 126l12 18H134z", "#e8453c");
    [34, 74, 122].forEach(function (x) { o += circ(x, 130, 14, "#2a2f3a") + circ(x, 130, 5, "#9aa4b5"); });
    return o;
  };
  THING.dinero = function () {
    var o = rect(14, 56, 100, 56, "#7fc88b", 6, 'transform="rotate(-8 64 84)"') + rect(30, 46, 100, 56, "#a8dfae", 6, 'transform="rotate(5 80 74)"') + circ(80, 74, 14, "#7fc88b", 'stroke="#2e7d46" stroke-width="3"') + txt(80, 80, "$", 20, "#1d5a31");
    o += circ(40, 120, 18, "#f5c418", 'stroke="#b8920f" stroke-width="4"') + circ(40, 120, 11, "none", 'stroke="#b8920f" stroke-width="2.5"') + circ(92, 128, 15, "#f5c418", 'stroke="#b8920f" stroke-width="4"') + circ(92, 128, 9, "none", 'stroke="#b8920f" stroke-width="2.5"');
    return o + circ(124, 124, 13, "#e9e9ef", 'stroke="#8f98aa" stroke-width="4"');
  };
  THING.moneda = function () {
    return ell(80, 140, 44, 6, "#000", 'opacity=".12"') + circ(80, 80, 56, "#f5c418", 'stroke="#b8920f" stroke-width="6"') + circ(80, 80, 42, "#ffd84d", 'stroke="#d9a516" stroke-width="3"') + star(80, 80, 24, "#e0a410") + path("M40 56q10-20 34-26", "none", 'stroke="#fff" stroke-width="5" stroke-linecap="round" opacity=".6"');
  };
  THING.balon = function () {
    var o = ell(80, 146, 46, 6, "#000", 'opacity=".12"') + circ(80, 80, 56, "#fff", 'stroke="#2b2b33" stroke-width="5"') + poly("80,52 106,70 96,100 64,100 54,70", "#2b2b33");
    o += path("M80 52V26M106 70l24-10M96 100l16 26M64 100l-16 26M54 70L30 60", "none", 'stroke="#2b2b33" stroke-width="4" stroke-linecap="round"');
    return o + poly("80,26 100,34 96,22 82,18", "#2b2b33") + path("M44 44q12-14 30-18", "none", 'stroke="#c8ccd6" stroke-width="4" stroke-linecap="round"');
  };

  function renderToolLike(table, enTable, kind, spec, opts) {
    var fn = table[spec.id]; if (!fn) return null;
    return wrap(160, 160, rect(0, 0, 160, 160, "#fff7e8", 18) + fn(), enTable[spec.id], opts, "su-art-" + kind);
  }

  /* ---------- scenes: 240 x 160 ---------- */
  var SCENE = {}, SCENE_EN = {
    "piso-sucio": "a floor with muddy footprints, crumbs and flies", "piso-mojado": "a wet floor with a puddle and a yellow warning sign",
    "ropa-sucia": "a laundry basket overflowing with stained, dirty clothes", "alfombra-sucia": "a rug covered in dust, crumbs and stains",
    "dormitorio-sucio": "a messy bedroom with an unmade bed and things all over the floor", "ropa-nueva": "a new shirt and pants on hangers with price tags and sparkles",
    "teatro-noche": "a theater stage at night with a red curtain, a spotlight and dressed-up people", "parque-futbol": "children playing soccer in a park with a goal and trees"
  };
  var WOOD_FLOOR = function (y) { var i, o = rect(0, y, 240, 160 - y, "#d9a066"); for (i = 0; i < 5; i++) o += rect(0, y + 8 + i * 14, 240, 2, "#a8713e", 0, 'opacity=".6"'); return o; };
  SCENE["piso-sucio"] = function () {
    var o = rect(0, 0, 240, 56, "#fde8c8") + rect(0, 52, 240, 6, "#c98b5e") + WOOD_FLOOR(58), i;
    [[50, 100], [80, 90], [112, 104], [146, 92], [178, 106]].forEach(function (f, k) { o += ell(f[0], f[1], 9, 15, "#6b4a2b", 'opacity=".75" transform="rotate(' + (k % 2 ? 12 : -10) + " " + f[0] + " " + f[1] + ')"') + ell(f[0] + 2, f[1] - 20, 7, 8, "#6b4a2b", 'opacity=".75"'); });
    for (i = 0; i < 9; i++) o += circ(30 + i * 22, 126 + (i % 3) * 6, 3, "#e8c88e") + circ(34 + i * 22, 70 + (i % 2) * 9, 2.5, "#c77d2e");
    return o + ell(196, 74, 5, 3, "#3b2a22") + ell(191, 71, 4, 2.4, "#cfd6dd", 'opacity=".8"') + ell(40, 120, 5, 3, "#3b2a22");
  };
  SCENE["piso-mojado"] = function () {
    var o = rect(0, 0, 240, 50, "#fde8c8") + rect(0, 46, 240, 6, "#c98b5e") + WOOD_FLOOR(52);
    o += ell(92, 114, 66, 24, "#5ec1f0", 'opacity=".85"') + ell(80, 108, 28, 7, "#bfe8fb", 'opacity=".8"') + path("M60 116q10-5 20 0t20 0", "none", 'stroke="#fff" stroke-width="3" stroke-linecap="round"');
    o += poly("186,50 214,50 226,128 174,128", P.sun) + poly("194,66 206,66 210,80 190,80", "#fff") + rect(196, 84, 8, 22, "#2b2b33", 3) + circ(200, 114, 5, "#2b2b33") + path("M186 50h28", "none", 'stroke="#c9902a" stroke-width="4"');
    return o + path("M120 130q5 10 0 14q-5-4 0-14z", "#5ec1f0");
  };
  SCENE["ropa-sucia"] = function () {
    var o = rect(0, 0, 240, 160, "#fdf1dc") + rect(0, 128, 240, 32, "#d9a066") + ell(120, 140, 80, 8, "#000", 'opacity=".12"');
    o += grp(GARMENT.camiseta("#d6322e", "#8f2320") + stainsFor("camiseta"), 'transform="translate(52 16) scale(.62)"') + grp(GARMENT["pantalon-largo"]("#2f6fdb", "#1f4fa8") + stainsFor("x"), 'transform="translate(112 12) scale(.58)"');
    o += path("M56 78h128l-14 56q-50 12-100 0z", "#b57a45") + path("M70 92h100M74 112h92", "none", 'stroke="#8a5a35" stroke-width="3"') + rect(52, 72, 136, 12, "#a56a38", 5);
    return o + ell(34, 56, 4, 3, "#3b2a22") + ell(30, 53, 4, 2.2, "#cfd6dd", 'opacity=".8"') + path("M200 40q4-8 10-2M208 54q6-6 10 0", "none", 'stroke="#8a6a4a" stroke-width="2.4" stroke-linecap="round"');
  };
  SCENE["alfombra-sucia"] = function () {
    var i, o = rect(0, 0, 240, 160, "#fdf1dc") + rect(0, 112, 240, 48, "#d9a066") + poly("30,56 210,56 232,128 8,128", "#c2410c") + poly("44,66 196,66 214,118 26,118", "#fde8c8") + poly("58,74 182,74 196,110 44,110", "#0f766e");
    for (i = 0; i < 14; i++) o += line(14 + i * 16, 128, 12 + i * 16, 140, "#e8c88e", 3);
    o += ell(90, 92, 18, 9, "#6b4a2b", 'opacity=".75"') + ell(150, 98, 14, 7, "#6b4a2b", 'opacity=".75"') + ell(120, 84, 10, 5, "#6b4a2b", 'opacity=".7"');
    for (i = 0; i < 10; i++) o += circ(60 + i * 14, 80 + (i % 3) * 10, 2.5, "#f3c277") + circ(66 + i * 14, 94 + (i % 2) * 6, 2, "#7c4a28");
    return o + circ(36, 36, 16, "#d9d2c5", 'opacity=".8"') + circ(54, 30, 12, "#d9d2c5", 'opacity=".8"') + circ(200, 34, 14, "#d9d2c5", 'opacity=".8"') + circ(184, 26, 10, "#d9d2c5", 'opacity=".8"');
  };
  SCENE["dormitorio-sucio"] = function () {
    var o = rect(0, 0, 240, 160, "#e6f2f6") + rect(0, 108, 240, 52, "#d9a066") + win(160, 18, 56, 52, "#bfe3f0");
    o += rect(24, 70, 120, 48, "#2f6fdb", 8) + rect(24, 56, 18, 62, "#8a5a35", 4) + rect(30, 60, 40, 22, "#fff", 8, 'transform="rotate(-8 50 70)"') + path("M60 76q30-16 60 8t26 30H60z", "#f5c418") + path("M60 100q40 10 80 0", "none", 'stroke="#c99a2e" stroke-width="3"');
    o += grp(GARMENT.camiseta("#ec6b9a", "#a04a6e"), 'transform="translate(112 112) scale(.34) rotate(18 80 80)"') + grp(GARMENT["pantalon-corto"]("#2e9e5b", "#1d6a3b"), 'transform="translate(160 118) scale(.32) rotate(-20 80 80)"');
    o += circ(190, 136, 12, "#f5b82e") + circ(190, 136, 5, "#d98e3a") + rect(60, 126, 34, 8, "#d6322e", 3, 'transform="rotate(-10 76 130)"') + rect(70, 132, 30, 8, "#2e9e5b", 3, 'transform="rotate(8 80 136)"') + path("M200 90q6-8 12 0", "none", 'stroke="#8a6a4a" stroke-width="2.4"');
    return o;
  };
  SCENE["ropa-nueva"] = function () {
    var o = rect(0, 0, 240, 160, "#fff1d6") + path("M16 36H224", "none", 'stroke="#8f98aa" stroke-width="6" stroke-linecap="round"');
    o += path("M70 36l4-8q4-6 10 0M168 36l4-8q4-6 10 0", "none", 'stroke="#8f98aa" stroke-width="4" stroke-linecap="round"');
    o += grp(GARMENT.camisa("#2f6fdb", "#1f4fa8"), 'transform="translate(30 36) scale(.72)"') + grp(GARMENT.falda("#f5c418", "#b8920f"), 'transform="translate(138 38) scale(.7)"');
    o += rect(88, 74, 28, 18, "#fff", 3, 'transform="rotate(12 100 84)" stroke="#8f98aa" stroke-width="2"') + path("M94 76l-10-14", "none", 'stroke="#8f98aa" stroke-width="2"') + circ(95, 83, 2.2, "#8f98aa");
    return o + sparkle(26, 30, 12, P.sun) + sparkle(216, 64, 11, "#ffd84d") + sparkle(124, 20, 8, "#fff") + sparkle(206, 128, 9, P.sun) + sparkle(30, 128, 8, "#fff");
  };
  SCENE["teatro-noche"] = function () {
    var i, o = rect(0, 0, 240, 160, "#1c2447") + rect(0, 120, 240, 40, "#2b1d38");
    for (i = 0; i < 14; i++) o += circ(14 + i * 17, 8 + (i * 7) % 20, 1.2, "#fff", 'opacity=".7"');
    o += rect(40, 20, 160, 100, "#3a2f5e", 4) + path("M40 20q30 8 40 100H40zM200 20q-30 8-40 100h40z", "#c0263f") + path("M60 26l10 94M80 40l-2 80M180 26l-10 94M160 40l2 80", "none", 'stroke="#8c1a2d" stroke-width="3"') + rect(32, 14, 176, 12, "#f5b82e", 4);
    o += poly("120,24 90,120 150,120", "#ffe9a8", 'opacity=".28"') + ell(120, 122, 38, 6, "#ffe9a8", 'opacity=".5"') + rect(50, 120, 140, 6, "#8a5a35", 2);
    o += fig({ x: 92, y: 140, s: 0.56, skin: "#c98b5e", hair: "#2b2b33", top: "#24385f", bot: "#24385f", armL: [-30, -66], armR: [30, -66] });
    o += fig({ x: 148, y: 140, s: 0.56, skin: "#f2c9a0", hair: "#6b3a1d", hairStyle: "long", top: "#d9304a", skirt: true, armL: [-30, -66], armR: [30, -66] });
    return o;
  };
  SCENE["parque-futbol"] = function () {
    var o = rect(0, 0, 240, 160, "#dff1f5") + circ(196, 30, 18, "#ffe27a") + ell(120, 130, 150, 40, "#79c466") + rect(0, 110, 240, 50, "#6dbb5a");
    o += circ(30, 70, 26, P.green) + rect(26, 76, 8, 40, P.wood) + circ(214, 76, 22, "#38b06a") + rect(210, 82, 7, 34, P.wood);
    o += rect(150, 76, 60, 44, "none", 0, 'stroke="#fff" stroke-width="4"') + path("M154 78l52 40M206 78l-52 40M154 98h52", "none", 'stroke="#fff" stroke-width="1.6" opacity=".5"');
    o += fig({ x: 80, y: 140, s: 0.5, skin: "#c98b5e", hair: "#2b2b33", top: "#d6322e", bot: "#fff", armL: [-30, -80], armR: [28, -62] });
    o += fig({ x: 124, y: 144, s: 0.5, skin: "#f2c9a0", hair: "#6b3a1d", top: "#2f6fdb", bot: "#fff", armL: [-28, -62], armR: [30, -84] });
    return o + circ(106, 142, 8, "#fff", 'stroke="#2b2b33" stroke-width="2.2"') + poly("106,138 110,141 108,146 104,146 102,141", "#2b2b33");
  };

  /* ---------- rooms: 240 x 160 ---------- */
  var ROOM = {}, ROOM_EN = {
    sala: "a room with a sofa, a lamp and a rug", comedor: "a room with a table and four chairs set for a meal", cocina: "a room with a stove, a sink and a fridge",
    dormitorio: "a room with a bed, a pillow and a night table", bano: "a room with a bathtub, a toilet and a sink with a mirror"
  };
  function roomBase(wall, floor) { return rect(0, 0, 240, 160, wall) + rect(0, 112, 240, 48, floor) + rect(0, 108, 240, 6, shade(wall, 0.12)); }
  ROOM.sala = function () {
    return roomBase("#f9e3bd", "#c98b5e") + win(150, 20, 60, 50, "#bfe3f0") + rect(150, 14, 60, 8, "#c2410c", 3) + ell(120, 140, 80, 10, "#0f766e", 'opacity=".5"') +
      rect(24, 70, 120, 48, "#e2653a", 14) + rect(16, 84, 26, 40, "#c2410c", 10) + rect(126, 84, 26, 40, "#c2410c", 10) + rect(34, 56, 100, 30, "#f08a5c", 12) + rect(48, 96, 30, 10, "#f5b82e", 5) +
      rect(34, 118, 6, 10, "#7c2d12") + rect(128, 118, 6, 10, "#7c2d12") + rect(190, 78, 4, 46, "#7c2d12") + poly("178,78 206,78 200,54 184,54", "#f5b82e") + rect(182, 124, 24, 6, "#7c2d12", 2) + rect(66, 24, 40, 28, "#fff", 3, 'stroke="#7c2d12" stroke-width="3"') + circ(86, 38, 8, "#2e9e5b");
  };
  ROOM.comedor = function () {
    var o = roomBase("#e6f2e8", "#d9a066") + rect(88, 12, 4, 30, "#555b6e") + path("M70 44q20-22 40 0z", "#f5b82e") + win(20, 24, 50, 46, "#bfe3f0") + win(172, 24, 50, 46, "#bfe3f0");
    o += rect(52, 86, 136, 12, "#a56a38", 5) + rect(60, 96, 8, 38, "#8a5a35") + rect(172, 96, 8, 38, "#8a5a35");
    [34, 188].forEach(function (x) { o += rect(x, 78, 20, 8, "#e2653a", 4) + rect(x + (x < 100 ? 0 : 16), 78, 4, 54, "#c2410c") + rect(x, 94, 20, 30, "#e2653a", 5) + rect(x + 2, 124, 4, 14, "#8a5a35") + rect(x + 14, 124, 4, 14, "#8a5a35"); });
    o += ell(90, 84, 16, 5, "#fff") + ell(150, 84, 16, 5, "#fff") + circ(120, 76, 9, "#d6322e") + rect(112, 82, 16, 4, "#a8231f", 2) + rect(108, 70, 24, 5, "#2e9e5b", 2, 'opacity="0"');
    return o;
  };
  ROOM.cocina = function () {
    var o = roomBase("#fdf1dc", "#c9a27a") + rect(0, 20, 240, 4, "#e8c88e") + rect(120, 14, 100, 34, "#0f766e", 5) + rect(126, 20, 28, 22, "#128c82", 3) + rect(160, 20, 28, 22, "#128c82", 3) + rect(194, 20, 20, 22, "#128c82", 3);
    o += rect(16, 60, 70, 74, "#e8eef6", 8) + rect(16, 94, 70, 3, "#9aa4b5") + rect(70, 72, 4, 16, "#9aa4b5", 2) + rect(70, 104, 4, 22, "#9aa4b5", 2);
    o += rect(104, 82, 124, 52, "#e2653a", 4) + rect(104, 74, 124, 10, "#d9d2c5", 3) + rect(116, 88, 40, 36, "#fff", 4, 'opacity=".25"');
    o += rect(112, 66, 52, 8, "#2a2f3a", 3) + circ(124, 64, 4, "#555b6e") + circ(150, 64, 4, "#555b6e") + rect(120, 50, 36, 14, "#8f98aa", 4) + rect(118, 46, 40, 6, "#555b6e", 3);
    o += rect(176, 70, 44, 14, "#bfe3f0", 6) + rect(194, 54, 5, 18, "#8f98aa", 2) + path("M194 54q-18 0-18 8", "none", 'stroke="#8f98aa" stroke-width="5" stroke-linecap="round"') + path("M176 70h44", "none", 'stroke="#fff" stroke-width="3" opacity=".7"');
    return o + circ(48, 80, 3, "#555b6e") + circ(48, 116, 3, "#555b6e");
  };
  ROOM.dormitorio = function () {
    return roomBase("#e9ebfa", "#d9a066") + win(150, 20, 60, 56, "#bfe3f0") + rect(150, 12, 60, 8, "#f5b82e", 3) + path("M150 20v50M210 20v50", "none", 'stroke="#f5b82e" stroke-width="3" opacity="0"') +
      rect(20, 66, 124, 56, "#2f6fdb", 8) + rect(20, 50, 16, 76, "#8a5a35", 5) + rect(130, 76, 14, 54, "#8a5a35", 5) + rect(24, 66, 120, 14, "#fff4e0", 6) + rect(40, 58, 40, 22, "#fff", 9) + rect(36, 82, 100, 36, "#f5b82e", 6) + path("M36 96q50 10 100 0", "none", 'stroke="#c99a2e" stroke-width="3"') +
      rect(168, 98, 44, 32, "#a56a38", 5) + rect(168, 108, 44, 3, "#7c4a28") + rect(180, 78, 20, 20, "#fff3b0", 4) + rect(188, 98, 4, 4, "#7c4a28") + star(60, 30, 8, P.sun) + star(100, 22, 6, "#ffd84d") + star(28, 30, 5, "#ffd84d");
  };
  ROOM.bano = function () {
    return roomBase("#dff1f5", "#b4dfe5") + rect(0, 50, 240, 3, "#fff", 0, 'opacity=".7"') + rect(0, 80, 240, 3, "#fff", 0, 'opacity=".5"') +
      rect(14, 76, 100, 44, "#fff", 18) + rect(8, 70, 112, 10, "#e8eef6", 5) + rect(24, 82, 80, 24, "#bfe8fb", 10) + rect(104, 56, 4, 20, "#8f98aa", 2) + rect(98, 52, 16, 6, "#8f98aa", 3) + circ(60, 70, 6, "#fff", 'stroke="#7fc3e8" stroke-width="2"') + circ(76, 66, 4, "#fff", 'stroke="#7fc3e8" stroke-width="2"') + rect(26, 118, 10, 8, "#8f98aa") + rect(98, 118, 10, 8, "#8f98aa") +
      rect(140, 78, 22, 30, "#fff", 6) + rect(134, 66, 34, 16, "#fff", 6) + rect(136, 104, 30, 20, "#fff", 8) + rect(180, 18, 46, 52, "#bfe3f0", 8, 'stroke="#8f98aa" stroke-width="4"') + poly("186,24 200,24 190,64 186,64", "#fff", 'opacity=".5"') +
      rect(184, 86, 40, 8, "#fff", 4) + rect(194, 94, 20, 30, "#fff", 6) + rect(194, 76, 20, 8, "#8f98aa", 3) + rect(198, 70, 4, 8, "#8f98aa");
  };

  /* ---------- homes: 240 x 160 ---------- */
  var HOME_EN = { "casa-grande": "a very large two-story house with many windows and a big yard", "casa-pequena": "a tiny little house with one window and a door",
    "apartamento-grande": "a huge apartment building many floors tall with lots of windows", "apartamento-pequeno": "a short, small apartment building with two floors" };
  function homeRender(id) {
    var o = rect(0, 0, 240, 160, "#dff1f5", 16) + rect(0, 140, 240, 20, "#79c466", 0), r, c;
    if (id === "casa-grande") {
      o += rect(20, 56, 200, 86, "#f9d9a6", 4) + poly("10,60 120,6 230,60", P.terra) + rect(10, 58, 220, 6, "#7c2d12", 2) + rect(176, 18, 18, 34, "#a85a3a", 2);
      for (c = 0; c < 4; c++) o += win(34 + c * 48, 72, 26, 24) + (c === 1 || c === 3 ? "" : "");
      o += rect(100, 100, 40, 42, P.teal, 4) + circ(130, 124, 3, P.sun) + win(34, 108, 26, 22) + win(182, 108, 26, 22) + circ(120, 36, 10, "#fff3b0", 'stroke="#7c2d12" stroke-width="3"');
    } else if (id === "casa-pequena") {
      o += rect(84, 94, 72, 48, "#f9d9a6", 3) + poly("76,98 120,64 164,98", P.terra) + rect(130, 70, 10, 20, "#a85a3a", 2) + rect(102, 112, 18, 30, P.teal, 3) + win(126, 108, 22, 20) + circ(40, 124, 14, P.green) + rect(38, 126, 4, 16, P.wood);
    } else if (id === "apartamento-grande") {
      o += rect(52, 4, 136, 138, "#e8a07c", 4) + rect(168, 4, 20, 138, "#cf8460", 4) + rect(46, 0, 148, 8, "#7c2d12", 3);
      for (r = 0; r < 5; r++) for (c = 0; c < 4; c++) o += win(62 + c * 28, 14 + r * 24, 18, 14, (r * 4 + c) % 5 === 2 ? "#fff3b0" : P.glass) + rect(60 + c * 28, 29 + r * 24, 22, 3, "#7c2d12", 1);
      o += rect(104, 116, 32, 26, "#5a2d17", 3) + rect(108, 120, 24, 22, "#bfe8ea", 3);
    } else if (id === "apartamento-pequeno") {
      o += rect(78, 78, 84, 64, "#e8a07c", 4) + rect(144, 78, 18, 64, "#cf8460", 4) + rect(72, 74, 96, 7, "#7c2d12", 3);
      for (r = 0; r < 2; r++) for (c = 0; c < 2; c++) o += win(88 + c * 34, 88 + r * 26, 20, 14) + rect(86 + c * 34, 103 + r * 26, 24, 3, "#7c2d12", 1);
      o += rect(110, 118, 20, 24, "#5a2d17", 3) + circ(36, 126, 12, P.green) + rect(34, 128, 4, 14, P.wood);
    } else return null;
    return o + (id.indexOf("grande") > 0 ? "" : "");
  }
  function renderHome(spec, opts) { var inner = homeRender(spec.id); return inner ? wrap(240, 160, inner, HOME_EN[spec.id], opts, "su-art-home") : null; }

  /* ---------- money ---------- */
  function renderMoney(spec, opts) {
    var amt = String(spec.amount == null ? 50 : spec.amount), usd = spec.currency !== "PYG", o, big = amt.length > 3 ? 30 : 38;
    var shown = amt.length > 3 ? amt.replace(/\B(?=(\d{3})+$)/g, ".") : amt;
    if (usd) {
      o = rect(0, 0, 240, 140, "#fff7e8", 16) + rect(20, 22, 200, 96, "#a8dfae", 10, 'stroke="#2e7d46" stroke-width="4"') + rect(30, 32, 180, 76, "none", 6, 'stroke="#2e7d46" stroke-width="2" stroke-dasharray="5 4"') +
        circ(120, 70, 26, "#7fc88b", 'stroke="#2e7d46" stroke-width="3"') + txt(120, 80, "$" + shown, big * 0.6, "#1d5a31") + txt(46, 52, "$", 20, "#1d5a31") + txt(194, 98, "$", 20, "#1d5a31");
      return wrap(240, 140, o, "a paper bill showing " + amt + " US dollars, written $" + amt, opts, "su-art-money");
    }
    o = rect(0, 0, 240, 140, "#fff7e8", 16) + rect(20, 22, 200, 96, "#cdb8f0", 10, 'stroke="#5b3fa0" stroke-width="4"') + rect(30, 32, 180, 76, "none", 6, 'stroke="#5b3fa0" stroke-width="2" stroke-dasharray="5 4"') +
      circ(46, 52, 12, "#a98be0") + circ(194, 98, 12, "#a98be0") + txt(120, 80, "₲ " + shown, big * 0.62, "#3b2570");
    return wrap(240, 140, o, "a banknote with the number " + amt + " and the Paraguayan money symbol", opts, "su-art-money");
  }

  /* ---------- people: 240 x 200 ---------- */
  function fig(o) {
    var s = o.s || 1, skin = o.skin || "#f2c9a0", hair = o.hair || "#3b2a22", top = o.top || "#2f6fdb", bot = o.bot || "#3a4a6b", ink = "#2b2b33", hs = o.hairStyle || "short";
    function hand(p) { return p.length === 4 ? [p[2], p[3]] : [p[0], p[1]]; }
    function arm(p, side) {
      var sx = side * 18, sy = -100, pts = "M" + sx + " " + sy + "L" + p.join(" ").replace(/(-?\d+) (-?\d+)/g, "$1 $2L").replace(/L$/, "");
      var h = hand(p);
      return path(pts, "none", 'stroke="' + top + '" stroke-width="11" stroke-linecap="round" stroke-linejoin="round"') + circ(h[0], h[1], 6.5, skin);
    }
    function finger(f, p) { if (!f) return ""; var h = hand(p); return line(h[0], h[1], f[0], f[1], skin, 5); }
    var o2 = '<g transform="translate(' + o.x + " " + o.y + ") scale(" + s + ')">';
    var lA = o.armL || [-30, -62], rA = o.armR || [30, -62], legs, upper = "";
    if (o.skirt) legs = rect(-11, -62, 9, 60, skin, 4) + rect(2, -62, 9, 60, skin, 4);
    else legs = rect(-15, -62, 13, 60, bot, 6) + rect(2, -62, 13, 60, bot, 6);
    legs += ell(-9, -2, 11, 5, ink) + ell(9, -2, 11, 5, ink);
    o2 += (o.back || "") + legs;
    if (hs === "long" || hs === "bun") upper += path("M-22 -128Q-25 -154 0 -154Q25 -154 22 -128L25 -94Q0 -88 -25 -94Z", hair);
    upper += rect(-20, -110, 40, 56, top, 14);
    if (o.skirt) upper += path("M-20 -70L20 -70L32 -36Q0 -26 -32 -36Z", o.skirtColor || bot);
    upper += (o.torsoOver || "") + finger(o.fingerL, lA) + arm(lA, -1) + finger(o.fingerR, rA) + arm(rA, 1);
    upper += rect(-5, -118, 10, 10, skin, 3) + circ(0, -130, 19, skin);
    if (hs === "bun") upper += circ(0, -156, 9, hair);
    upper += path(hs === "long" ? "M-20 -129Q-24 -153 0 -153Q24 -153 20 -129Q14 -142 0 -140Q-14 -142 -20 -129Z" : "M-20 -130Q-22 -151 0 -151Q22 -151 20 -130Q12 -141 0 -139Q-12 -141 -20 -130Z", hair);
    upper += circ(-7, -130, 2.3, ink) + circ(7, -130, 2.3, ink) + path("M-5 -122q5 5 10 0", "none", 'stroke="' + ink + '" stroke-width="2" stroke-linecap="round"') + circ(-12, -125, 3, "#f48fb1", 'opacity=".35"') + circ(12, -125, 3, "#f48fb1", 'opacity=".35"');
    upper += (o.headOver || "");
    o2 += o.bow ? grp(upper, 'transform="rotate(' + o.bow + ' 0 -62)"') : upper;
    return o2 + (o.front || "") + "</g>";
  }
  var KIDS = {
    me: { skin: "#f2c9a0", hair: "#3b2a22", top: "#f5b82e", bot: "#3a4a6b" },
    meG: { skin: "#f2c9a0", hair: "#6b3a1d", hairStyle: "long", top: "#f5b82e", skirt: true, bot: "#0f766e" },
    b1: { skin: "#c98b5e", hair: "#2b2b33", top: "#2f6fdb", bot: "#3a4a6b" },
    b2: { skin: "#8d5a3b", hair: "#2b2b33", top: "#2e9e5b", bot: "#5a4a3a" },
    b3: { skin: "#f2c9a0", hair: "#b8570f", top: "#d6322e", bot: "#3a4a6b" },
    g1: { skin: "#f2c9a0", hair: "#6b3a1d", hairStyle: "long", top: "#e2653a", skirt: true, bot: "#24385f" },
    g2: { skin: "#c98b5e", hair: "#2b2b33", hairStyle: "bun", top: "#0f766e", skirt: true, bot: "#f48fb1" },
    g3: { skin: "#8d5a3b", hair: "#2b2b33", hairStyle: "long", top: "#7a5cb8", skirt: true, bot: "#2f6fdb" }
  };
  function kid(v, x, y, s, extra) { var o = {}, k; for (k in KIDS[v]) o[k] = KIDS[v][k]; o.x = x; o.y = y; o.s = s; for (k in (extra || {})) o[k] = extra[k]; return fig(o); }
  function meStar(x, y, r) { return star(x, y, r, P.sun, 'stroke="#b8780c" stroke-width="2.5" stroke-linejoin="round"') + txt(x, y + r * 0.28, "me", r * 0.62, "#5a3a05"); }
  function pointer(x, y, k) {
    return grp(rect(-5, -2, 10, 30, "#f2c9a0", 5, 'stroke="#c98b5e" stroke-width="2"') + circ(0, 28, 6.5, "#f2c9a0", 'stroke="#c98b5e" stroke-width="2"') + circ(0, -2, 11, "#f2c9a0", 'stroke="#c98b5e" stroke-width="2"') +
      path("M0 44v26", "none", 'stroke="' + P.terra + '" stroke-width="4" stroke-linecap="round" stroke-dasharray="1 8"') + poly("-8,70 8,70 0,82", P.terra), 'transform="translate(' + x + " " + y + ") scale(" + k + ')"');
  }
  var PERSON_EN = {
    yo: "a child pointing at himself, with a star that says me", tu: "a friend pointing straight toward you",
    el: "a child on the left points to a boy who is standing nearby", ella: "a child on the left points to a girl who is standing nearby",
    usted: "a grown-up in a suit who bows politely and carries a briefcase", nosotros: "three children with their arms around each other inside a ring, one marked with a star that says me",
    nosotras: "three girls with their arms around each other inside a ring, one marked with a star that says me", ellos: "a child on the left points to a group of three boys",
    ellas: "a child on the left points to a group of three girls", ustedes: "a group of three children who all point toward you"
  };
  var PERSON = {};
  PERSON.yo = function () {
    return ell(120, 120, 84, 78, "#fde68a", 'opacity=".55"') + kid("me", 112, 190, 1.12, { armR: [34, -78, 3, -90], fingerR: [-4, -92], armL: [-30, -62] }) + meStar(190, 56, 25);
  };
  PERSON.tu = function () {
    return kid("b1", 112, 190, 1.1, { armR: [38, -88, 38, -66], armL: [-30, -62] }) + pointer(154, 112, 1);
  };
  PERSON.el = function () {
    return kid("me", 56, 190, 0.66, { armR: [30, -100, 52, -102], fingerR: [66, -102] }) + meStar(26, 52, 15) + kid("b2", 162, 190, 1.05);
  };
  PERSON.ella = function () {
    return kid("me", 56, 190, 0.66, { armR: [30, -100, 52, -102], fingerR: [66, -102] }) + meStar(26, 52, 15) + kid("g1", 162, 190, 1.05);
  };
  PERSON.usted = function () {
    return kid("b1", 118, 190, 1.12, { top: "#24385f", bot: "#24385f", bow: 11, torsoOver: path("M-8 -110L0 -92L8 -110Z", "#fff") + poly("-3,-108 3,-108 4,-90 0,-82 -4,-90", P.red), armL: [-32, -70, -34, -50], armR: [34, -92, 48, -108],
      front: rect(-52, -56, 38, 26, "#7c4a28", 5) + path("M-44 -56v-8q0-4 4-4h12q4 0 4 4v8", "none", 'stroke="#5a2d17" stroke-width="4"') + rect(-36, -46, 10, 5, P.sun, 2) });
  };
  var RING = ell(120, 112, 112, 80, "none", 'stroke="' + P.teal + '" stroke-width="4" stroke-dasharray="3 9" stroke-linecap="round"');
  PERSON.nosotros = function () {
    return RING + kid("b1", 56, 186, 0.8, { armR: [50, -96] }) + kid("g1", 184, 186, 0.8, { armL: [-50, -96] }) + kid("me", 120, 190, 0.86, { armL: [-52, -96], armR: [52, -96] }) + meStar(120, 22, 17);
  };
  PERSON.nosotras = function () {
    return RING + kid("g2", 56, 186, 0.8, { armR: [50, -96] }) + kid("g3", 184, 186, 0.8, { armL: [-50, -96] }) + kid("meG", 120, 190, 0.86, { armL: [-52, -96], armR: [52, -96] }) + meStar(120, 22, 17);
  };
  PERSON.ellos = function () {
    return kid("me", 40, 190, 0.6, { armR: [30, -100, 52, -102], fingerR: [66, -102] }) + meStar(18, 62, 14) + kid("b1", 116, 186, 0.72) + kid("b2", 164, 186, 0.72) + kid("b3", 210, 186, 0.72);
  };
  PERSON.ellas = function () {
    return kid("meG", 40, 190, 0.6, { armR: [30, -100, 52, -102], fingerR: [66, -102] }) + meStar(18, 62, 14) + kid("g1", 116, 186, 0.72) + kid("g2", 164, 186, 0.72) + kid("g3", 210, 186, 0.72);
  };
  PERSON.ustedes = function () {
    var a = { armR: [38, -88, 38, -66] };
    return kid("b1", 56, 186, 0.8, a) + kid("g2", 184, 186, 0.8, a) + kid("b3", 120, 190, 0.86, a) + pointer(86, 126, 0.7) + pointer(214, 126, 0.7) + pointer(153, 126, 0.75);
  };
  function renderPerson(spec, opts) {
    var fn = PERSON[spec.id]; if (!fn) return null;
    return wrap(240, 200, rect(0, 0, 240, 200, "#fff7e8", 18) + ell(120, 192, 96, 6, "#000", 'opacity=".08"') + fn(), PERSON_EN[spec.id], opts, "su-art-person");
  }

  /* workers */
  var WORKER = {}, WORKER_EN = {
    vendedor: "a man in a green apron holding a basket of fruit and vegetables", vendedora: "a woman holding up a dress on a hanger",
    panadero: "a baker in a tall white hat holding a long loaf of bread", farmaceutico: "a man in a white coat with a green cross badge holding a medicine bottle",
    farmaceutica: "a woman in a white coat with a green cross badge holding a medicine bottle", escritor: "a man with glasses holding a book and a pen"
  };
  WORKER.vendedor = function () {
    return fig({ x: 120, y: 190, s: 1.12, skin: "#c98b5e", top: "#f2ecda", bot: "#5a4a3a", armL: [-36, -60], armR: [36, -60],
      torsoOver: path("M-17 -108h34l4 52h-42z", P.green) + rect(-9, -96, 18, 10, "#1d7a45", 3),
      front: path("M-52 -66h104l-12 40h-80z", "#b57a45") + rect(-52, -70, 104, 8, "#a56a38", 3) + circ(-16, -76, 8, "#d6322e") + circ(0, -75, 8, "#f08a1c") + circ(16, -76, 8, "#2e9e5b") + circ(32, -75, 8, "#d6322e") });
  };
  WORKER.vendedora = function () {
    var dress = grp(GARMENT.vestido("#ec6b9a", "#a04a6e"), 'transform="translate(26 -118) scale(.42)"');
    return fig({ x: 108, y: 190, s: 1.12, skin: "#f2c9a0", hair: "#6b3a1d", hairStyle: "long", top: "#0f766e", skirt: true, bot: "#24385f", armL: [-30, -62], armR: [34, -112, 40, -134],
      front: path("M40 -142q0-8 8-8t8 6", "none", 'stroke="#8f98aa" stroke-width="3" stroke-linecap="round"') + path("M30 -134l18-6 18 6", "none", 'stroke="#8f98aa" stroke-width="3" stroke-linecap="round"') + dress });
  };
  WORKER.panadero = function () {
    return fig({ x: 120, y: 192, s: 0.98, skin: "#8d5a3b", top: "#fff", bot: "#5a4a3a", armL: [-36, -62], armR: [36, -62],
      torsoOver: path("M-17 -100h34l4 46h-42z", "#f2ecda"),
      headOver: rect(-18, -164, 36, 14, "#fff", 4) + circ(-14, -168, 11, "#fff") + circ(0, -174, 13, "#fff") + circ(14, -168, 11, "#fff") + rect(-18, -156, 36, 5, "#e8e1d0", 2),
      front: ell(0, -62, 56, 12, "#d98e3a", 'transform="rotate(-6 0 -62)"') + path("M-32 -66l10-8M-12 -66l10-8M8 -68l10-8M28 -68l10-8", "none", 'stroke="#f6d39a" stroke-width="4" stroke-linecap="round"') });
  };
  function pharm(girl) {
    var o = {
      x: 116, y: 190, s: 1.12, skin: girl ? "#f2c9a0" : "#c98b5e", hair: girl ? "#6b3a1d" : "#2b2b33", hairStyle: girl ? "bun" : "short", top: "#fff", bot: girl ? "#0f766e" : "#3a4a6b", armL: [-30, -62], armR: [38, -88, 40, -104],
      torsoOver: path("M-6 -110l6 14 6-14", "none", 'stroke="#c8d0dc" stroke-width="2.5"') + pcross(-9, -82, 12, P.green) + rect(-19, -112, 38, 60, "none", 12, 'stroke="#c8d0dc" stroke-width="2.5"'),
      front: rect(34, -122, 14, 24, "#f08a1c", 4) + rect(36, -128, 10, 8, "#fff", 2) + pcross(41, -110, 6, "#fff")
    };
    if (girl) { o.skirt = true; o.skirtColor = "#fff"; }
    return fig(o);
  }
  WORKER.farmaceutico = function () { return pharm(false); };
  WORKER.farmaceutica = function () { return pharm(true); };
  WORKER.escritor = function () {
    return fig({ x: 120, y: 190, s: 1.12, skin: "#f2c9a0", hair: "#6b3a1d", top: "#7a5cb8", bot: "#3a4a6b", armL: [-34, -64], armR: [36, -100, 40, -122],
      headOver: circ(-8, -130, 8.5, "none", 'stroke="#2b2b33" stroke-width="2.4"') + circ(8, -130, 8.5, "none", 'stroke="#2b2b33" stroke-width="2.4"') + line(-0.5, -130, 0.5, -130, "#2b2b33", 2.4),
      front: rect(-58, -78, 40, 30, "#d6322e", 4) + rect(-54, -74, 32, 22, "#fff4e0", 2) + line(-38, -74, -38, -52, "#b8a07a", 1.5) + line(40, -122, 46, -150, P.sun, 5) + poly("38,-124 42,-124 40,-116", "#3b2a22") });
  };
  function renderWorker(spec, opts) {
    var fn = WORKER[spec.id]; if (!fn) return null;
    return wrap(240, 200, rect(0, 0, 240, 200, "#fff7e8", 18) + ell(120, 192, 80, 6, "#000", 'opacity=".08"') + fn(), WORKER_EN[spec.id], opts, "su-art-worker");
  }

  /* ---------- neighborhood map ---------- */
  var MAPDATA = null;
  var MAP_W = 1000, MAP_H = 700, ROW_TOP = [6, 210, 494], CELL_W_PAD = 8;
  function setMap(map, places) { MAPDATA = map && map.places ? { map: map, places: places || [] } : null; }
  function placeInfo(places, id) {
    var i, p; for (i = 0; i < (places || []).length; i++) if (places[i].id === id) { p = places[i]; break; }
    p = p || { id: id, es: id, en: id };
    var art = p.article || ({ casa: "la", apartamento: "el", farmacia: "la", panaderia: "la", hospital: "el", hotel: "el", parque: "el", tienda: "la", mercado: "el", "centro-comercial": "el", teatro: "el", estacion: "la" }[id] || "");
    return { id: id, es: p.es || id, en: p.en || id, name: (art ? art + " " : "") + (p.es || id) };
  }
  function labelLines(name) {
    if (name.length <= 14) return [name];
    var w = name.split(" "), best = [name], bestD = 99, i, a, b;
    for (i = 1; i < w.length; i++) { a = w.slice(0, i).join(" "); b = w.slice(i).join(" "); if (Math.abs(a.length - b.length) < bestD) { bestD = Math.abs(a.length - b.length); best = [a, b]; } }
    return best;
  }
  function fitText(x, y, s, size) {
    var est = s.length * size * 0.56, fit = est > 190 ? ' textLength="190" lengthAdjust="spacingAndGlyphs"' : "";
    return txt(x, y, s, size, P.ink, "middle", 'stroke="#fff" stroke-width="6" stroke-linejoin="round" paint-order="stroke"' + fit);
  }
  function markerGlyph(person) {
    var base = { yo: P.sun, tu: P.teal, el: "#2f6fdb", ella: "#e2653a", usted: "#24385f", nosotros: P.sun, nosotras: P.sun, ellos: "#2f6fdb", ellas: "#e2653a", ustedes: P.teal }[person] || P.teal;
    var group = /^(nosotros|nosotras|ellos|ellas|ustedes)$/.test(person), o = circ(0, 0, 25, "#fff", 'stroke="' + shade(base, 0.2) + '" stroke-width="4"');
    function head(x, y, r, c) { return circ(x, y - 4, r, c) + path("M" + (x - r * 1.4) + " " + (y + r * 1.9) + "q" + r * 1.4 + " -" + r * 2.6 + " " + r * 2.8 + " 0z", c); }
    if (group) o += head(-9, 2, 6.5, shade(base, 0.2)) + head(9, 2, 6.5, shade(base, 0.2)) + head(0, 5, 7.5, base); else o += head(0, 3, 9, base);
    if (person === "yo" || person === "nosotros" || person === "nosotras") o += star(15, -16, 9, P.sun, 'stroke="#b8780c" stroke-width="2"');
    return o;
  }
  function buildMap(map, places, opts) {
    opts = opts || {};
    var cols = map.cols || 5, colW = MAP_W / cols, labels = opts.labels !== false, hl = opts.highlight || [], markers = opts.markers || [], interactive = !!opts.interactive;
    var o = rect(0, 0, MAP_W, MAP_H, "#dcefc8", 26) + rect(0, 0, MAP_W, 206, "#cfe6b4", 0, 'clip-path="inset(0 round 26px 26px 0 0)"') + rect(0, 200, MAP_W, 6, "#bcd9a0");
    o += rect(0, 396, MAP_W, 16, "#efe3cc") + rect(0, 484, MAP_W, 16, "#efe3cc") + rect(0, 410, MAP_W, 76, "#5e6678") + rect(0, 410, MAP_W, 4, "#4a5163") + rect(0, 482, MAP_W, 4, "#4a5163");
    var d, dash = "";
    for (d = 0; d < 1000; d += 56) if (d + 36 < 360 || d > 640) dash += rect(d + 6, 446, 36, 5, "#ffe9a8", 2);
    o += dash + rect(352, 428, 296, 40, "#3f4659", 20) + txt(500, 456, map.street || "Calle Principal", 28, "#fff");
    var items = "", ringLayer = "", ids = [];
    (map.places || []).forEach(function (pl) {
      var info = placeInfo(places, pl.id), k = pl.row === 0 ? 0.84 : 0.9, top = ROW_TOP[pl.row] || 0, cx = pl.col * colW, gw = 200 * k, gx = cx + (colW - gw) / 2, gy = top + 6 + (pl.row === 0 ? 10 : 0);
      var glyph = GLYPH[pl.id] ? GLYPH[pl.id]() : rect(30, 40, 140, 100, "#d9d2c5", 8) + txt(100, 100, "?", 40, "#8f98aa");
      var isHl = hl.indexOf(pl.id) >= 0, inner = "";
      ids.push(pl.id);
      if (isHl) ringLayer += '<g class="su-ring-g" data-place="' + esc(pl.id) + '">' + rect(cx + 10, top + 1, colW - 20, 192, "#f5b82e", 22, 'fill-opacity=".26" stroke="#e09a0b" stroke-width="7" class="su-ring"') + star(cx + 28, top + 20, 15, P.sun, 'stroke="#b8780c" stroke-width="3" stroke-linejoin="round"') + "</g>";
      inner += rect(cx + 2, top + 2, colW - 4, 190, "#fff", 20, 'class="su-hit" fill-opacity="0"');
      inner += grp(glyph, 'class="su-glyph" transform="translate(' + gx.toFixed(1) + " " + gy + ") scale(" + k + ')"');
      if (labels) {
        var ls = labelLines(info.name), sz = ls.length > 1 ? 25 : 30;
        if (ls.length > 1) inner += fitText(cx + colW / 2, top + 163, ls[0], sz) + fitText(cx + colW / 2, top + 189, ls[1], sz);
        else inner += fitText(cx + colW / 2, top + 176, ls[0], sz);
      }
      markers.forEach(function (m) { if (m && m.place === pl.id) inner += grp(markerGlyph(m.person), 'class="su-marker" data-person="' + esc(m.person) + '" transform="translate(' + (cx + colW - 38) + " " + (top + 50) + ')"'); });
      var attrs = ' class="su-bldg' + (isHl ? " is-hl" : "") + '" data-place="' + esc(pl.id) + '"';
      if (interactive) attrs += ' role="button" tabindex="0" aria-label="' + esc(labels ? info.name + " (" + info.en + ")" : info.en) + '"';
      items += "<g" + attrs + ">" + inner + "</g>";
    });
    var label = interactive ? "Neighborhood map. Choose a building." : "A neighborhood map: twelve buildings in three rows, with a main street running left to right between the second and third rows.";
    var a = ' class="su-art su-art-map' + (interactive ? " is-interactive" : "") + '" viewBox="0 0 ' + MAP_W + " " + MAP_H + '" xmlns="http://www.w3.org/2000/svg" preserveAspectRatio="xMidYMid meet"';
    if (opts.size) a += ' width="' + opts.size + '" height="' + Math.round(opts.size * MAP_H / MAP_W) + '"';
    a += opts.decorative ? ' aria-hidden="true" focusable="false"' : (interactive ? ' role="group" aria-label="' + label + '"' : ' role="img" aria-label="' + label + '"');
    return "<svg" + a + ">" + o + ringLayer + items + "</svg>";
  }
  function mapSvg(map, places, opts) {
    try { if (!map || !map.places) throw new Error("no map"); return buildMap(map, places || [], opts); } catch (e) { return placeholder(opts, "map"); }
  }

  /* ---------- hero + icons ---------- */
  function hero(opts) {
    opts = opts || {};
    var o = circ(246, 52, 30, "#ffd34d", 'opacity=".95"') + circ(246, 52, 40, "#ffd34d", 'opacity=".25"');
    var i, flags = ["#f5b82e", "#fff4e0", "#1b9aaa", "#f08a7a", "#f5b82e", "#fff4e0", "#1b9aaa", "#f08a7a", "#f5b82e"];
    o += path("M6 18Q160 46 314 14", "none", 'stroke="#fff4e0" stroke-width="2.4" opacity=".8"');
    for (i = 0; i < flags.length; i++) { var x = 22 + i * 34, y = 22 + Math.sin(i / 8 * Math.PI) * 14 + 4; o += poly(x + "," + y + " " + (x + 20) + "," + (y + 2) + " " + (x + 9) + "," + (y + 24), flags[i]); }
    o += rect(0, 138, 320, 22, "#7c2d12", 0, 'opacity=".55"') + rect(0, 146, 320, 14, "#5a1f0a", 0, 'opacity=".4"');
    o += grp(GLYPH.casa(), 'transform="translate(-6 41) scale(.7)"') + grp(GLYPH.panaderia(), 'transform="translate(90 35) scale(.78)"') + grp(GLYPH.farmacia(), 'transform="translate(194 41) scale(.7)"');
    return wrap(320, 160, o, "A sunny street with a house, a bakery and a pharmacy", { decorative: opts.decorative !== false }, "qk-hero-art su-hero-art");
  }
  var ICON = {};
  ICON.mission = function () { return path("M8 14l16-6 16 6 16-6v42l-16 6-16-6-16 6z", "#fff4e0", 'stroke="#7c2d12" stroke-width="3" stroke-linejoin="round"') + path("M24 8v42M40 14v42", "none", 'stroke="#7c2d12" stroke-width="2.5" opacity=".5"') + path("M32 40q-9-10-9-17a9 9 0 0 1 18 0q0 7-9 17z", "#c2410c", 'stroke="#7c2d12" stroke-width="2.5" stroke-linejoin="round"') + circ(32, 23, 3.5, "#fff4e0"); };
  ICON.practice = function () { return circ(30, 34, 22, "#fff4e0", 'stroke="#7c2d12" stroke-width="3"') + circ(30, 34, 14, "#f5b82e", 'stroke="#7c2d12" stroke-width="2.5"') + circ(30, 34, 6, "#c2410c") + path("M32 32l22-22", "none", 'stroke="#7c2d12" stroke-width="3.5" stroke-linecap="round"') + poly("46,8 56,8 56,18 52,14 48,18", "#0f766e"); };
  ICON.test = function () { return rect(12, 8, 40, 50, "#fff4e0", 6, 'stroke="#7c2d12" stroke-width="3"') + rect(24, 4, 16, 10, "#0f766e", 4) + path("M20 26l4 4 7-8M20 42l4 4 7-8", "none", 'stroke="#2e9e5b" stroke-width="3.5" stroke-linecap="round" stroke-linejoin="round"') + path("M36 28h10M36 44h10", "none", 'stroke="#7c2d12" stroke-width="3" stroke-linecap="round"'); };
  ICON.warmup = function () { var i, o = path("M6 44h52", "none", 'stroke="#7c2d12" stroke-width="3" stroke-linecap="round"') + path("M18 44a14 14 0 0 1 28 0z", "#f5b82e", 'stroke="#7c2d12" stroke-width="3" stroke-linejoin="round"'); for (i = 0; i < 5; i++) o += line(32 + Math.cos(Math.PI + i * Math.PI / 4) * 22, 44 + Math.sin(Math.PI + i * Math.PI / 4) * 22, 32 + Math.cos(Math.PI + i * Math.PI / 4) * 28, 44 + Math.sin(Math.PI + i * Math.PI / 4) * 28, "#c2410c", 3.5); return o + path("M14 52h36", "none", 'stroke="#7c2d12" stroke-width="3" stroke-linecap="round" opacity=".5"'); };
  ICON.sheet = function () { return path("M6 12q13-4 26 4v40q-13-8-26-4z", "#fff4e0", 'stroke="#7c2d12" stroke-width="3" stroke-linejoin="round"') + path("M58 12q-13-4-26 4v40q13-8 26-4z", "#ffedd5", 'stroke="#7c2d12" stroke-width="3" stroke-linejoin="round"') + path("M12 24q8-2 14 2M12 33q8-2 14 2M38 26q6-4 14-2M38 35q6-4 14-2", "none", 'stroke="#0f766e" stroke-width="3" stroke-linecap="round"'); };
  ICON.progress = function () { return rect(8, 36, 12, 20, "#1b9aaa", 3) + rect(26, 24, 12, 32, "#f5b82e", 3) + rect(44, 12, 12, 44, "#c2410c", 3) + path("M6 58h52", "none", 'stroke="#7c2d12" stroke-width="3" stroke-linecap="round"') + star(50, 6, 6, "#ffd34d", 'stroke="#7c2d12" stroke-width="1.5"'); };
  function icon(name) {
    var fn = ICON[name] || ICON.mission;
    return '<svg class="su-icon" viewBox="0 0 64 64" xmlns="http://www.w3.org/2000/svg" aria-hidden="true" focusable="false">' + fn() + "</svg>";
  }

  /* ---------- dispatch ---------- */
  function placeholder(opts, what) {
    return wrap(160, 160, rect(0, 0, 160, 160, "#fff7e8", 18) + rect(18, 18, 124, 124, "none", 14, 'stroke="#c9b79c" stroke-width="4" stroke-dasharray="8 8"') + txt(80, 104, "?", 64, "#c9b79c"), "a picture", opts, "su-art-placeholder");
  }
  function renderPlace(spec, opts) {
    var fn = GLYPH[spec.id]; if (!fn) return null;
    var inner = rect(0, 0, 200, 150, "#e4f4f1", 16) + path("M0 134H200v0a16 16 0 0 1-16 16H16A16 16 0 0 1 0 134z", "#bfe0a6") + fn();
    return wrap(200, 150, inner, PLACE_EN[spec.id], opts, "su-art-place");
  }
  function render(spec, opts) {
    try {
      if (!spec || typeof spec !== "object") return placeholder(opts);
      var out = null;
      switch (spec.kind) {
        case "place": out = renderPlace(spec, opts); break;
        case "clothing": out = GARMENT[spec.item] ? renderClothing(spec, opts) : null; break;
        case "outfit": out = renderOutfit(spec, opts); break;
        case "tool": out = renderToolLike(TOOL, TOOL_EN, "tool", spec, opts); break;
        case "thing": out = renderToolLike(THING, THING_EN, "thing", spec, opts); break;
        case "scene": out = SCENE[spec.id] ? wrap(240, 160, SCENE[spec.id](), SCENE_EN[spec.id], opts, "su-art-scene") : null; break;
        case "person": out = renderPerson(spec, opts); break;
        case "worker": out = renderWorker(spec, opts); break;
        case "room": out = ROOM[spec.id] ? wrap(240, 160, ROOM[spec.id](), ROOM_EN[spec.id], opts, "su-art-room") : null; break;
        case "home": out = renderHome(spec, opts); break;
        case "money": out = renderMoney(spec, opts); break;
        case "map": out = MAPDATA ? buildMap(spec.map || MAPDATA.map, spec.places || MAPDATA.places, { highlight: spec.highlight, markers: spec.markers, labels: spec.labels, interactive: spec.interactive, size: opts && opts.size, decorative: opts && opts.decorative }) : null; break;
      }
      return out || placeholder(opts);
    } catch (e) { return placeholder(opts); }
  }
  function alt(spec) { var m = /aria-label="([^"]*)"/.exec(render(spec, {})); return m ? m[1].replace(/&quot;/g, '"').replace(/&amp;/g, "&").replace(/&lt;/g, "<").replace(/&gt;/g, ">") : "a picture"; }

  var SU_ART = { render: render, map: mapSvg, setMap: setMap, hero: hero, icon: icon, alt: alt, palette: P, colors: COLORS, MAP_VIEWBOX: [MAP_W, MAP_H] };
  if (typeof module !== "undefined" && module.exports) module.exports = SU_ART; else root.SU_ART = SU_ART;
})(typeof window !== "undefined" ? window : this);

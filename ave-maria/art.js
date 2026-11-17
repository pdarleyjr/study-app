/* Ave María Quest — original flat vector art as inline SVG strings. No images, no network.
   AM_ART.render(name, opts) -> "<svg …>". opts.label makes it an image (role="img"); otherwise it is decorative.
   Other opts: opts.class (extra class), opts.text (badge letter). */
(function () {
  "use strict";
  var uid = 0;
  var BLUE = "#1e4fa3", NAVY = "#0f2a5c", SKY = "#2b5fb8", GOLD = "#d4a13a", GOLD2 = "#f2cf74", CREAM = "#fff8e6";

  function esc(s) { return String(s).replace(/&/g, "&amp;").replace(/"/g, "&quot;").replace(/</g, "&lt;"); }
  function wrap(vb, inner, opts, defLabel) {
    opts = opts || {};
    var cls = "am-art" + (opts.class ? " " + opts.class : "");
    var a = opts.label
      ? 'role="img" aria-label="' + esc(opts.label) + '"'
      : (opts.decorative === false && defLabel ? 'role="img" aria-label="' + esc(defLabel) + '"' : 'aria-hidden="true" focusable="false"');
    return '<svg class="' + cls + '" xmlns="http://www.w3.org/2000/svg" viewBox="' + vb + '" ' + a + ">" + inner + "</svg>";
  }
  function star(cx, cy, R, r, n, rot) {
    var pts = [], k, ang;
    for (k = 0; k < n * 2; k++) {
      ang = Math.PI / n * k - Math.PI / 2 + (rot || 0);
      var rad = k % 2 ? r : R;
      pts.push((cx + Math.cos(ang) * rad).toFixed(1) + "," + (cy + Math.sin(ang) * rad).toFixed(1));
    }
    return pts.join(" ");
  }
  function lily(x, y, s, flip) {
    return '<g transform="translate(' + x + " " + y + ") scale(" + (flip ? -s : s) + " " + s + ')">' +
      '<path d="M0 0 C-2 -30 -2 -50 0 -70" stroke="#3f8f5a" stroke-width="3" fill="none" stroke-linecap="round"/>' +
      '<path d="M0 -26 C-18 -30 -26 -42 -30 -54 C-16 -48 -6 -40 0 -26Z" fill="#4aa56a"/>' +
      '<path d="M0 -70 C-16 -78 -18 -96 -6 -110 C0 -96 2 -84 0 -70Z" fill="#fffdf4" stroke="#e9dcae" stroke-width="1.2"/>' +
      '<path d="M0 -70 C16 -78 18 -96 6 -110 C0 -96 -2 -84 0 -70Z" fill="#fff" stroke="#e9dcae" stroke-width="1.2"/>' +
      '<path d="M0 -70 C-26 -74 -34 -92 -30 -102 C-14 -96 -4 -84 0 -70Z" fill="#fffaf0" stroke="#e9dcae" stroke-width="1.2"/>' +
      '<path d="M0 -70 C26 -74 34 -92 30 -102 C14 -96 4 -84 0 -70Z" fill="#fffdf4" stroke="#e9dcae" stroke-width="1.2"/>' +
      '<circle cx="-4" cy="-96" r="2.2" fill="' + GOLD + '"/><circle cx="4" cy="-98" r="2.2" fill="' + GOLD + '"/><circle cx="0" cy="-92" r="2.2" fill="' + GOLD + '"/></g>';
  }
  function roseG(x, y, s) {
    return '<g transform="translate(' + x + " " + y + ") scale(" + s + ')">' +
      '<path d="M-14 8 C-26 4 -28 -8 -20 -14 C-18 -4 -12 2 -4 6Z" fill="#3f8f5a"/>' +
      '<circle r="15" fill="#c2415a"/><path d="M-9 -3 C-9 -12 6 -14 9 -5 C12 4 2 10 -4 7" fill="none" stroke="#8f2740" stroke-width="2.2" stroke-linecap="round"/>' +
      '<path d="M-3 0 C-3 -5 3 -5 3 -1" fill="none" stroke="#8f2740" stroke-width="2" stroke-linecap="round"/><circle r="15" fill="none" stroke="#9c2d48" stroke-width="1.5"/></g>';
  }
  function icon(bg, glyph, opts, label) {
    return wrap("0 0 48 48", '<rect width="48" height="48" rx="13" fill="' + bg + '"/>' + glyph, opts, label);
  }

  var ART = {
    hero: function (o) {
      var id = "h" + (++uid), s = "", i;
      var rays = "";
      for (i = 0; i < 9; i++) {
        var a = (-80 + i * 20) * Math.PI / 180;
        rays += '<path d="M160 118 L' + (160 + Math.cos(a - .07) * 240).toFixed(0) + " " + (118 + Math.sin(a - .07) * 240).toFixed(0) + " L" + (160 + Math.cos(a + .07) * 240).toFixed(0) + " " + (118 + Math.sin(a + .07) * 240).toFixed(0) + 'Z" fill="#ffe9a8" opacity=".10"/>';
      }
      s += '<defs><linearGradient id="' + id + 'g" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#3a74d6"/><stop offset="1" stop-color="#173d86"/></linearGradient>' +
        '<radialGradient id="' + id + 'r"><stop offset="0" stop-color="#fff6c8" stop-opacity=".9"/><stop offset="1" stop-color="#fff6c8" stop-opacity="0"/></radialGradient>' +
        '<clipPath id="' + id + 'c"><path d="M104 204 V92 A56 56 0 0 1 216 92 V204Z"/></clipPath></defs>';
      s += rays;
      s += '<path d="M96 210 V92 A64 64 0 0 1 224 92 V210Z" fill="' + GOLD + '"/>';
      s += '<path d="M104 204 V92 A56 56 0 0 1 216 92 V204Z" fill="url(#' + id + 'g)"/>';
      s += '<g clip-path="url(#' + id + 'c)">';
      s += '<path d="M104 92 H216 V120 H104Z" fill="#2f66c4" opacity=".55"/>';
      s += '<path d="M104 150 H216 V204 H104Z" fill="#0f2a5c" opacity=".35"/>';
      s += '<path d="M160 36 V204 M104 92 H216 M104 150 H216 M104 92 L160 36 L216 92 M104 150 L160 92 L216 150" stroke="' + GOLD2 + '" stroke-width="2.4" fill="none" opacity=".9"/>';
      s += '<path d="M160 92 L132 150 H188Z" fill="#e8c05a" opacity=".35"/><path d="M104 120 L132 92 L104 92Z M216 120 L188 92 L216 92Z" fill="#8fb4f0" opacity=".45"/>';
      s += '<circle cx="160" cy="92" r="46" fill="url(#' + id + 'r)"/>';
      s += "</g>";
      s += '<polygon points="' + star(160, 78, 20, 8, 8) + '" fill="' + GOLD2 + '" stroke="#fff6c8" stroke-width="1.5" stroke-linejoin="round"/>';
      s += '<path d="M96 210 V92 A64 64 0 0 1 224 92 V210Z" fill="none" stroke="#fff3c4" stroke-width="2.2" opacity=".7"/>';
      [[36, 40, 3], [70, 22, 2], [262, 30, 3], [288, 70, 2], [40, 100, 2], [284, 128, 2.6], [250, 12, 2]].forEach(function (p) {
        s += '<polygon points="' + star(p[0], p[1], p[2] * 2, p[2] * .8, 4) + '" fill="#fff3c4" opacity=".85"/>';
      });
      s += '<rect x="60" y="204" width="200" height="12" rx="6" fill="#0b1f47" opacity=".55"/>';
      s += lily(66, 206, .62) + lily(254, 206, .62, true) + lily(92, 208, .5, true) + lily(228, 208, .5);
      s += roseG(124, 204, .9) + roseG(196, 204, .9) + roseG(160, 208, .75);
      return wrap("0 0 320 220", s, o, "Stained glass window with a star, lilies and roses");
    },
    rose: function (o) { return wrap("0 0 64 64", roseG(32, 34, 1.7), o, "Rose"); },
    star: function (o) {
      return wrap("0 0 64 64", '<circle cx="32" cy="32" r="28" fill="#ffe9a8" opacity=".35"/><polygon points="' + star(32, 32, 26, 10, 8) + '" fill="' + GOLD + '" stroke="#f2cf74" stroke-width="2" stroke-linejoin="round"/><circle cx="32" cy="32" r="5" fill="#fff6c8"/>', o, "Star");
    },
    candle: function (o) {
      return wrap("0 0 64 64", '<ellipse cx="32" cy="14" rx="14" ry="14" fill="#ffe9a8" opacity=".35"/><path d="M32 4 C40 14 38 22 32 24 C26 22 24 14 32 4Z" fill="' + GOLD2 + '"/><path d="M32 12 C36 17 35 21 32 22 C29 21 28 17 32 12Z" fill="#fff6c8"/><rect x="23" y="25" width="18" height="28" rx="3" fill="' + CREAM + '" stroke="#e0cf9c" stroke-width="1.5"/><path d="M32 24 V28" stroke="#6b4f2a" stroke-width="2"/><path d="M17 54 H47 L44 59 H20Z" fill="' + GOLD + '"/>', o, "Candle");
    },
    lily: function (o) { return wrap("0 0 64 64", '<g transform="translate(32 60) scale(.52)">' + lily(0, 0, 1) + "</g>", o, "Lily"); },
    dove: function (o) {
      return wrap("0 0 64 64", '<path d="M8 36 C14 26 24 24 32 28 C36 18 46 14 56 18 C50 22 48 26 48 30 C54 32 58 38 58 44 C48 40 40 44 32 46 C22 48 12 44 8 36Z" fill="#fff" stroke="#c9d6ee" stroke-width="2" stroke-linejoin="round"/><path d="M26 30 C22 18 28 10 38 8 C36 16 38 22 44 26" fill="#eef3fb" stroke="#c9d6ee" stroke-width="2" stroke-linejoin="round"/><circle cx="50" cy="22" r="1.6" fill="' + NAVY + '"/><path d="M56 19 L61 21 L56 23Z" fill="' + GOLD + '"/>', o, "Dove");
    },
    scroll: function (o) {
      return wrap("0 0 64 64", '<rect x="12" y="10" width="40" height="44" rx="4" fill="' + CREAM + '" stroke="#d9c58a" stroke-width="2"/><rect x="8" y="6" width="48" height="8" rx="4" fill="' + GOLD + '"/><rect x="8" y="50" width="48" height="8" rx="4" fill="' + GOLD + '"/><path d="M20 24 H44 M20 32 H44 M20 40 H36" stroke="' + SKY + '" stroke-width="3" stroke-linecap="round"/>', o, "Scroll");
    },
    badge: function (o) {
      var t = o && o.text ? esc(o.text) : "";
      return wrap("0 0 64 64", '<path d="M20 36 L12 60 L24 54 L28 62 L34 40Z" fill="#1e4fa3"/><path d="M44 36 L52 60 L40 54 L36 62 L30 40Z" fill="#2b5fb8"/><circle cx="32" cy="26" r="22" fill="' + GOLD + '"/><circle cx="32" cy="26" r="17" fill="' + GOLD2 + '" stroke="#b9852a" stroke-width="1.5"/>' +
        (t ? '<text x="32" y="33" text-anchor="middle" font-family="Georgia,serif" font-weight="700" font-size="22" fill="' + NAVY + '">' + t + "</text>" : '<polygon points="' + star(32, 26, 11, 4.6, 5) + '" fill="' + NAVY + '"/>'), o, "Rank medal");
    },
    moon: function (o) {
      return wrap("0 0 64 64", '<rect width="64" height="64" rx="16" fill="' + NAVY + '"/><path d="M40 12 A20 20 0 1 0 52 40 A16 16 0 1 1 40 12Z" fill="' + GOLD2 + '"/><polygon points="' + star(18, 16, 4, 1.6, 4) + '" fill="#fff3c4"/><polygon points="' + star(52, 18, 3, 1.2, 4) + '" fill="#fff3c4"/><polygon points="' + star(48, 52, 3.4, 1.4, 4) + '" fill="#fff3c4"/>', o, "Moon and stars");
    },
    sun: function (o) {
      var r = "", i;
      for (i = 0; i < 10; i++) { var a = i * Math.PI / 5; r += '<path d="M' + (32 + Math.cos(a) * 20).toFixed(1) + " " + (32 + Math.sin(a) * 20).toFixed(1) + " L" + (32 + Math.cos(a) * 28).toFixed(1) + " " + (32 + Math.sin(a) * 28).toFixed(1) + '" stroke="' + GOLD + '" stroke-width="3.4" stroke-linecap="round"/>'; }
      return wrap("0 0 64 64", '<rect width="64" height="64" rx="16" fill="#cfe0fb"/>' + r + '<circle cx="32" cy="32" r="14" fill="' + GOLD2 + '" stroke="' + GOLD + '" stroke-width="2"/>', o, "Sun");
    },
    "icon-meet": function (o) { return icon(BLUE, '<path d="M10 14 C16 12 21 13 24 16 V37 C21 34 16 33 10 35Z" fill="#fff"/><path d="M38 14 C32 12 27 13 24 16 V37 C27 34 32 33 38 35Z" fill="#fff" opacity=".88"/><path d="M14 19 H20 M14 24 H20 M28 19 H34 M28 24 H34" stroke="' + SKY + '" stroke-width="2" stroke-linecap="round"/><polygon points="' + star(36, 10, 5, 2, 4) + '" fill="' + GOLD2 + '"/>', o); },
    "icon-learn": function (o) { return icon("#12805a", '<path d="M8 38 H18 V30 H28 V22 H38 V14" fill="none" stroke="#fff" stroke-width="4" stroke-linecap="round" stroke-linejoin="round"/><polygon points="' + star(38, 9, 5, 2, 5) + '" fill="' + GOLD2 + '"/>', o); },
    "icon-vanish": function (o) { return icon("#6b4fb3", '<text x="8" y="31" font-family="Georgia,serif" font-weight="700" font-size="20" fill="#fff">A</text><text x="21" y="31" font-family="Georgia,serif" font-weight="700" font-size="20" fill="#fff" opacity=".6">v</text><text x="31" y="31" font-family="Georgia,serif" font-weight="700" font-size="20" fill="#fff" opacity=".3">e</text><path d="M9 37 H39" stroke="#fff" stroke-width="2.4" stroke-dasharray="1 5" stroke-linecap="round" opacity=".7"/>', o); },
    "icon-build": function (o) { return icon("#c26a1a", '<rect x="7" y="25" width="12" height="12" rx="3" fill="#fff"/><rect x="21" y="25" width="12" height="12" rx="3" fill="#fff" opacity=".85"/><rect x="14" y="10" width="12" height="12" rx="3" fill="' + GOLD2 + '" transform="rotate(-8 20 16)"/><rect x="35" y="25" width="7" height="12" rx="3" fill="#fff" opacity=".6"/>', o); },
    "icon-next": function (o) { return icon("#0f8a7a", '<path d="M9 24 H27" stroke="#fff" stroke-width="4.4" stroke-linecap="round"/><path d="M21 14 L33 24 L21 34" fill="none" stroke="#fff" stroke-width="4.4" stroke-linecap="round" stroke-linejoin="round"/><circle cx="39" cy="24" r="3" fill="' + GOLD2 + '"/>', o); },
    "icon-slip": function (o) { return icon("#b3412b", '<circle cx="21" cy="21" r="10" fill="none" stroke="#fff" stroke-width="4"/><path d="M29 29 L39 39" stroke="#fff" stroke-width="5" stroke-linecap="round"/><path d="M21 15 V22" stroke="' + GOLD2 + '" stroke-width="3.4" stroke-linecap="round"/><circle cx="21" cy="26.5" r="1.9" fill="' + GOLD2 + '"/>', o); },
    "icon-match": function (o) { return icon("#2a7aa8", '<rect x="6" y="9" width="17" height="14" rx="4" fill="#fff"/><rect x="25" y="25" width="17" height="14" rx="4" fill="#fff" opacity=".88"/><path d="M15 23 C15 31 20 32 25 32" fill="none" stroke="' + GOLD2 + '" stroke-width="3" stroke-linecap="round"/><circle cx="15" cy="16" r="2.4" fill="' + SKY + '"/><circle cx="34" cy="32" r="2.4" fill="' + SKY + '"/>', o); },
    "icon-test": function (o) { return icon(NAVY, '<circle cx="24" cy="22" r="13" fill="' + GOLD + '"/><circle cx="24" cy="22" r="9.4" fill="' + GOLD2 + '"/><path d="M19 22 L23 26 L30 18" fill="none" stroke="' + NAVY + '" stroke-width="3.2" stroke-linecap="round" stroke-linejoin="round"/><path d="M17 33 L14 43 L24 39 L34 43 L31 33" fill="#2b5fb8"/>', o); },
    "icon-plan": function (o) { return icon("#7a3fb0", '<rect x="11" y="8" width="26" height="33" rx="5" fill="#fff"/><path d="M16 17 L18.5 19.5 L23 14.5" fill="none" stroke="#12805a" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round"/><path d="M27 17 H33 M16 26 H18 M27 26 H33 M16 34 H18 M27 34 H33" stroke="' + SKY + '" stroke-width="2.6" stroke-linecap="round"/>', o); }
  };

  window.AM_ART = {
    names: Object.keys(ART),
    render: function (name, opts) {
      var f = ART[name];
      if (!f) { return ""; }
      try { return f(opts || {}); } catch (e) { return ""; }
    }
  };
})();

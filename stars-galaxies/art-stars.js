/* Cosmic Quest - STARS art: nebula, starbirth, telescope, sun-distance, star-colors,
   star-sizes, hr, twins, star-temp. Registered into SG_ART (see art-core.js). */
(function () {
  "use strict";
  if (!window.SG_ART) { return; }
  var R = window.SG_ART;
  var INK = "#eef2ff", DIM = "#a9b4e6", GOLD = "#ffd166", NAVY = "#0b1030";
  var DEG = "°", TIMES = "×";

  /* ---------- small helpers ---------- */
  function n(v) { return Math.round(v * 10) / 10; }
  function clamp(v, lo, hi) { return v < lo ? lo : (v > hi ? hi : v); }
  function hex2rgb(h) {
    var s = h.replace("#", "");
    return [parseInt(s.substr(0, 2), 16), parseInt(s.substr(2, 2), 16), parseInt(s.substr(4, 2), 16)];
  }
  function mix(a, b, t) {
    var x = hex2rgb(a), y = hex2rgb(b), out = "#", i, v, h;
    for (i = 0; i < 3; i += 1) {
      v = Math.round(x[i] + (y[i] - x[i]) * t);
      h = v.toString(16);
      out += (h.length < 2 ? "0" : "") + h;
    }
    return out;
  }
  function tx(x, y, s, size, o) {
    o = o || {};
    return '<text x="' + n(x) + '" y="' + n(y) + '" font-size="' + size + '" font-family="inherit" text-anchor="' + (o.a || "middle") +
      '" fill="' + (o.f || INK) + '"' + (o.w ? ' font-weight="' + o.w + '"' : "") + (o.i ? ' font-style="italic"' : "") +
      (o.op != null ? ' opacity="' + o.op + '"' : "") +
      (o.halo ? ' stroke="' + NAVY + '" stroke-width="3.2" stroke-linejoin="round" paint-order="stroke"' : "") +
      (o.extra || "") + ">" + R.H.esc(s) + "</text>";
  }
  function circ(cx, cy, r, fill, extra) {
    return '<circle cx="' + n(cx) + '" cy="' + n(cy) + '" r="' + n(r) + '" fill="' + fill + '"' + (extra || "") + "/>";
  }
  function stop(off, col, op) {
    return '<stop offset="' + off + '" stop-color="' + col + '"' + (op != null ? ' stop-opacity="' + op + '"' : "") + "/>";
  }
  function radial(id, stops, extra) {
    return '<radialGradient id="' + id + '"' + (extra || "") + ">" + stops + "</radialGradient>";
  }
  function arrow(x1, y1, x2, y2, col, w, head) {
    var a = Math.atan2(y2 - y1, x2 - x1), hl = head || 9, hw = hl * 0.62;
    var bx = x2 - Math.cos(a) * hl, by = y2 - Math.sin(a) * hl;
    var px = -Math.sin(a) * hw, py = Math.cos(a) * hw;
    return '<line x1="' + n(x1) + '" y1="' + n(y1) + '" x2="' + n(bx) + '" y2="' + n(by) + '" stroke="' + col +
      '" stroke-width="' + w + '" stroke-linecap="round"/><polygon points="' + n(x2) + "," + n(y2) + " " + n(bx + px) + "," + n(by + py) +
      " " + n(bx - px) + "," + n(by - py) + '" fill="' + col + '"/>';
  }
  function sparkle(cx, cy, s, col, op) {
    return '<path d="M' + n(cx) + " " + n(cy - s) + "Q" + n(cx) + " " + n(cy) + " " + n(cx + s) + " " + n(cy) + "Q" + n(cx) + " " + n(cy) + " " +
      n(cx) + " " + n(cy + s) + "Q" + n(cx) + " " + n(cy) + " " + n(cx - s) + " " + n(cy) + "Q" + n(cx) + " " + n(cy) + " " + n(cx) + " " +
      n(cy - s) + 'Z" fill="' + (col || "#fff") + '" opacity="' + (op == null ? 0.9 : op) + '"/>';
  }
  /* Soft cloud blob: an ellipse filled with a fading radial gradient. */
  function blob(H, cx, cy, rx, ry, rot, col, op) {
    var id = H.uid("bl");
    return "<defs>" + radial(id, stop(0, col, op) + stop(0.55, col, op * 0.45) + stop(1, col, 0)) + "</defs>" +
      '<ellipse cx="' + n(cx) + '" cy="' + n(cy) + '" rx="' + n(rx) + '" ry="' + n(ry) + '" transform="rotate(' + (rot || 0) + " " + n(cx) + " " + n(cy) +
      ')" fill="url(#' + id + ')"/>';
  }
  /* Glowing star ball: corona + shaded sphere. */
  function bigStar(H, cx, cy, r, col, coronaK) {
    var g = H.uid("co"), s = H.uid("sf"), k = coronaK || 2.1;
    return "<defs>" + radial(g, stop(0, col, 0.85) + stop(0.35, col, 0.3) + stop(1, col, 0)) +
      radial(s, stop(0, "#ffffff") + stop(0.32, mix(col, "#ffffff", 0.6)) + stop(0.75, col) + stop(1, mix(col, "#000000", 0.28)), ' cx="0.4" cy="0.36" r="0.75"') +
      "</defs>" + circ(cx, cy, r * k, "url(#" + g + ")") + circ(cx, cy, r, "url(#" + s + ")");
  }
  var COLS = { blue: R.H.C.star.blue, white: R.H.C.star.white, yellow: R.H.C.star.yellow, orange: R.H.C.star.orange, red: R.H.C.star.red };
  var COL_ORDER = ["blue", "white", "yellow", "orange", "red"];
  function band(id, x1, x2) {
    return '<linearGradient id="' + id + '" gradientUnits="userSpaceOnUse" x1="' + x1 + '" y1="0" x2="' + x2 + '" y2="0">' +
      stop(0.1, COLS.blue) + stop(0.3, COLS.white) + stop(0.5, COLS.yellow) + stop(0.7, COLS.orange) + stop(0.9, COLS.red) + "</linearGradient>";
  }
  function colAt(c) {
    var i, t, stops = [0.1, 0.3, 0.5, 0.7, 0.9];
    if (c <= 0.1) { return COLS.blue; }
    if (c >= 0.9) { return COLS.red; }
    for (i = 0; i < 4; i += 1) {
      if (c <= stops[i + 1]) {
        t = (c - stops[i]) / 0.2;
        return mix(COLS[COL_ORDER[i]], COLS[COL_ORDER[i + 1]], t);
      }
    }
    return COLS.red;
  }

  /* ---------- nebula ---------- */
  R.register("nebula", function (spec, H) {
    var W = 360, Ht = 240, out = H.space(W, Ht, 11, 70), i, st;
    var blobs = [
      [110, 120, 120, 70, -20, "#ff6bd6", 0.55], [230, 110, 130, 75, 15, "#9a6bff", 0.55],
      [180, 150, 140, 60, -5, "#ff4fa8", 0.38], [270, 70, 80, 45, 30, "#5ee7ff", 0.28],
      [70, 60, 70, 40, -30, "#7a5bff", 0.35], [200, 60, 90, 40, 10, "#ff8bd8", 0.35],
      [300, 175, 80, 45, -25, "#b66bff", 0.4], [60, 185, 80, 40, 20, "#ff6bd6", 0.3]
    ];
    var dust = [[150, 105, 60, 14, 20], [235, 135, 70, 12, -15], [100, 160, 50, 10, -25]];
    st = [[130, 105, 5.5, "#ffffff"], [215, 90, 4.5, "#bfe0ff"], [245, 140, 6.5, "#ffffff"], [175, 135, 4, "#ffe9a8"],
      [105, 150, 4, "#ffd1f0"], [285, 105, 3.5, "#bfe0ff"], [160, 75, 3.5, "#fff"], [60, 100, 3, "#fff"]];
    for (i = 0; i < blobs.length; i += 1) { out += blob(H, blobs[i][0], blobs[i][1], blobs[i][2], blobs[i][3], blobs[i][4], blobs[i][5], blobs[i][6]); }
    for (i = 0; i < dust.length; i += 1) { out += blob(H, dust[i][0], dust[i][1], dust[i][2], dust[i][3], dust[i][4], "#0b1030", 0.7); }
    for (i = 0; i < st.length; i += 1) {
      out += blob(H, st[i][0], st[i][1], st[i][2] * 4.5, st[i][2] * 4.5, 0, st[i][3], 0.5);
      out += circ(st[i][0], st[i][1], st[i][2] * 0.55, "#ffffff");
      if (st[i][2] >= 4.5) { out += sparkle(st[i][0], st[i][1], st[i][2] * 3.2, "#ffffff", 0.85); }
    }
    out += '<rect x="64" y="204" width="232" height="26" rx="13" fill="' + NAVY + '" opacity="0.72"/>';
    out += tx(180, 222, "A nebula: a cloud of gas and dust", 13.5, { w: 600 });
    return H.svg(W, Ht, out, "A glowing pink and purple cloud of gas and dust with bright new stars shining inside it");
  });

  /* ---------- starbirth ---------- */
  R.register("starbirth", function (spec, H) {
    var W = 360, Ht = 162, out = H.space(W, Ht, 21, 30), x0 = [6, 126, 246], pw = 108, py = 10, ph = 118, cy = py + ph / 2;
    var caps = ["gas & dust", "gravity pulls", "star is born"], i, j, cx, clip, rand = H.rng(33), pts, a;
    var p1 = [[-32, -28, 20, "#ff6bd6", 0.5], [28, -32, 18, "#9a6bff", 0.5], [-36, 24, 17, "#9a6bff", 0.45], [32, 28, 20, "#ff6bd6", 0.45], [0, -2, 14, "#b66bff", 0.4]];
    var p2 = [[-16, -14, 18, "#ff6bd6", 0.7], [16, -16, 17, "#9a6bff", 0.7], [-14, 15, 17, "#9a6bff", 0.7], [17, 14, 18, "#ff6bd6", 0.7], [0, 0, 18, "#ffb0ec", 0.7]];
    for (i = 0; i < 3; i += 1) {
      cx = x0[i] + pw / 2; clip = H.uid("cp");
      out += '<defs><clipPath id="' + clip + '"><rect x="' + x0[i] + '" y="' + py + '" width="' + pw + '" height="' + ph + '" rx="12"/></clipPath></defs>';
      out += '<rect x="' + x0[i] + '" y="' + py + '" width="' + pw + '" height="' + ph + '" rx="12" fill="#0f1640" stroke="#33408a" stroke-width="1.5"/>';
      out += '<g clip-path="url(#' + clip + ')">';
      if (i === 0) {
        for (j = 0; j < p1.length; j += 1) { out += blob(H, cx + p1[j][0], cy + p1[j][1], p1[j][2], p1[j][2] * 0.85, j * 25, p1[j][3], p1[j][4]); }
        for (j = 0; j < 16; j += 1) { out += circ(x0[i] + 6 + rand() * (pw - 12), py + 6 + rand() * (ph - 12), 0.9 + rand() * 0.8, "#d9c9ff", ' opacity="0.65"'); }
      } else if (i === 1) {
        for (j = 0; j < p2.length; j += 1) { out += blob(H, cx + p2[j][0], cy + p2[j][1], p2[j][2], p2[j][2] * 0.9, j * 25, p2[j][3], p2[j][4]); }
        for (j = 0; j < 10; j += 1) { a = rand() * 6.283; out += circ(cx + Math.cos(a) * (14 + rand() * 18), cy + Math.sin(a) * (14 + rand() * 18), 1 + rand() * 0.8, "#ffe2f6", ' opacity="0.85"'); }
        pts = [[-1, -1], [1, -1], [-1, 1], [1, 1]];
        for (j = 0; j < 4; j += 1) {
          out += arrow(cx + pts[j][0] * 46, cy + pts[j][1] * 40, cx + pts[j][0] * 30, cy + pts[j][1] * 26, H.C.cyan, 3, 9);
        }
      } else {
        out += blob(H, cx, cy, 52, 46, 0, "#ff9ad8", 0.28);
        out += blob(H, cx, cy, 40, 40, 0, "#ffd166", 0.55);
        out += bigStar(H, cx, cy, 11, "#fff2b8", 3.4);
        out += sparkle(cx, cy, 30, "#ffffff", 0.9);
        for (j = 0; j < 8; j += 1) { out += circ(x0[i] + 8 + rand() * (pw - 16), py + 8 + rand() * (ph - 16), 0.8 + rand() * 0.7, "#fff", ' opacity="0.6"'); }
      }
      out += "</g>";
      out += circ(x0[i] + 14, py + 14, 9, GOLD) + tx(x0[i] + 14, py + 18, String(i + 1), 12, { f: NAVY, w: 700 });
      out += tx(cx, 150, caps[i], 13.5, { w: 600 });
    }
    for (i = 0; i < 2; i += 1) { out += '<polygon points="' + (x0[i] + pw + 2) + "," + (cy - 7) + " " + (x0[i] + pw + 10) + "," + cy + " " + (x0[i] + pw + 2) + "," + (cy + 7) + '" fill="' + GOLD + '"/>'; }
    return H.svg(W, Ht, out, "Three steps: a scattered cloud of gas and dust, gravity pulling it together, and a new star glowing");
  });

  /* ---------- telescope ---------- */
  R.register("telescope", function (spec, H) {
    var W = 360, Ht = 240, out = H.space(W, Ht, 5, 60), g1 = H.uid("tb"), g2 = H.uid("gr"), g3 = H.uid("ln"), sx = 300, sy = 52;
    out += "<defs>" +
      '<linearGradient id="' + g1 + '" x1="0" y1="0" x2="0" y2="1">' + stop(0, "#c9d6ff") + stop(0.45, "#7f93d6") + stop(1, "#36457f") + "</linearGradient>" +
      '<linearGradient id="' + g2 + '" x1="0" y1="0" x2="0" y2="1">' + stop(0, "#1b2459") + stop(1, "#0f1640") + "</linearGradient>" +
      radial(g3, stop(0, "#ffffff", 0.95) + stop(0.5, "#8fd8ff", 0.55) + stop(1, "#5ee7ff", 0.3)) + "</defs>";
    out += blob(H, sx, sy, 34, 34, 0, "#bcd4ff", 0.5) + circ(sx, sy, 4, "#fff") + sparkle(sx, sy, 20, "#fff", 0.95);
    out += sparkle(60, 40, 8, "#fff", 0.8) + sparkle(220, 30, 6, "#ffe9a8", 0.8) + sparkle(330, 120, 7, "#fff", 0.7);
    out += '<ellipse cx="180" cy="248" rx="210" ry="38" fill="url(#' + g2 + ')"/>';
    out += '<line x1="258" y1="86" x2="' + (sx - 8) + '" y2="' + (sy + 6) + '" stroke="#ffe9a8" stroke-width="2" stroke-dasharray="3 5" opacity="0.8"/>';
    out += '<g stroke="#8a6a44" stroke-width="6" stroke-linecap="round">' +
      '<line x1="150" y1="156" x2="104" y2="222"/><line x1="150" y1="156" x2="198" y2="222"/><line x1="150" y1="156" x2="150" y2="226"/></g>';
    out += '<g stroke="#c9a06a" stroke-width="2" stroke-linecap="round" opacity="0.8"><line x1="149" y1="160" x2="103" y2="224"/><line x1="151" y1="160" x2="199" y2="224"/></g>';
    out += circ(150, 152, 11, "#4b5aa8", ' stroke="#9fb0ff" stroke-width="1.5"');
    out += '<g transform="translate(150 150) rotate(-30)">' +
      '<rect x="-34" y="-5" width="16" height="10" rx="3" fill="#5260b0" stroke="#a9b4e6" stroke-width="1.2"/>' +
      '<rect x="-20" y="-15" width="124" height="30" rx="7" fill="url(#' + g1 + ')" stroke="#eef2ff" stroke-width="1.3"/>' +
      '<rect x="-4" y="-21" width="46" height="8" rx="3" fill="#5260b0" stroke="#a9b4e6" stroke-width="1"/>' +
      '<rect x="98" y="-21" width="22" height="42" rx="7" fill="#6577c4" stroke="#eef2ff" stroke-width="1.3"/>' +
      '<ellipse cx="120" cy="0" rx="4" ry="17" fill="url(#' + g3 + ')"/>' +
      '<rect x="20" y="-15" width="4" height="30" fill="#2b3777" opacity="0.5"/><rect x="62" y="-15" width="4" height="30" fill="#2b3777" opacity="0.5"/>' +
      "</g>";
    out += tx(18, 214, "telescope", 15, { a: "start", w: 700, halo: true });
    out += tx(sx, sy + 34, "far-away star", 12, { halo: true, f: DIM });
    return H.svg(W, Ht, out, "A telescope on a tripod pointing up at a faraway star");
  });

  /* ---------- sun-distance ---------- */
  R.register("sun-distance", function (spec, H) {
    var W = 360, Ht = 240, out = H.space(W, Ht, 9, 45), ey = 118, eg = H.uid("eg"), cl = H.uid("ec");
    out += blob(H, 58, ey, 92, 92, 0, "#ffb347", 0.55);
    out += bigStar(H, 58, ey, 46, H.C.star.yellow, 1.5);
    out += tx(58, ey - 58, "Sun", 14, { w: 700, halo: true });
    out += "<defs>" + radial(eg, stop(0, "#9fe3ff") + stop(0.55, "#2f7dd6") + stop(1, "#12306e"), ' cx="0.38" cy="0.34" r="0.8"') +
      '<clipPath id="' + cl + '"><circle cx="178" cy="' + ey + '" r="15"/></clipPath></defs>';
    out += circ(178, ey, 15, "url(#" + eg + ")");
    out += '<g clip-path="url(#' + cl + ')" fill="#4fcf86"><ellipse cx="173" cy="' + (ey - 4) + '" rx="7" ry="5"/><ellipse cx="185" cy="' + (ey + 6) + '" rx="6" ry="4"/></g>';
    out += tx(178, ey - 24, "Earth", 12.5, { halo: true });
    out += blob(H, 326, ey, 22, 22, 0, "#cfe0ff", 0.8) + circ(326, ey, 4.5, "#ffffff") + sparkle(326, ey, 11, "#fff", 0.9);
    out += tx(326, ey - 24, "far star", 12.5, { halo: true });
    out += arrow(160, 176, 78, 176, GOLD, 2.6, 9) + tx(119, 168, "close", 13.5, { w: 700, f: GOLD });
    out += '<line x1="196" y1="176" x2="316" y2="176" stroke="' + H.C.cyan + '" stroke-width="2.6" stroke-dasharray="2 6" stroke-linecap="round"/>' +
      '<polygon points="324,176 314,170.5 314,181.5" fill="' + H.C.cyan + '"/>' + tx(260, 168, "far away", 13.5, { w: 700, f: H.C.cyan });
    out += tx(180, 206, "The Sun looks big because it is close.", 12.5, { w: 600 });
    out += tx(180, 224, "A far star can be as big as the Sun, or bigger.", 12.5, { f: DIM });
    return H.svg(W, Ht, out, "A big Sun close to Earth on the left, and a tiny far-away star on the right that is really as big or bigger");
  });

  /* ---------- star-colors ---------- */
  R.register("star-colors", function (spec, H) {
    var W = 360, Ht = 240, out = H.space(W, Ht, 14, 30), xs = [36, 108, 180, 252, 324], names = ["Blue", "White", "Yellow", "Orange", "Red"];
    var words = ["hottest", "hot", "medium", "cool", "coolest"], gid = H.uid("bd"), i, x;
    out += "<defs>" + band(gid, 14, 346) + "</defs>";
    out += '<rect x="14" y="34" width="332" height="9" rx="4.5" fill="url(#' + gid + ')"/>';
    out += tx(14, 26, "hotter", 12, { a: "start", w: 600, f: "#9cc4ff" }) + tx(346, 26, "cooler", 12, { a: "end", w: 600, f: "#ff9a8d" });
    for (i = 0; i < 5; i += 1) {
      x = xs[i];
      out += bigStar(H, x, 90, 17, COLS[COL_ORDER[i]], 2.3);
      out += tx(x, 134, names[i], 14, { w: 700 }) + tx(x, 151, words[i], 12, { f: DIM });
    }
    out += tx(xs[0], 168, "about", 12, { f: GOLD }) + tx(xs[0], 182, "15,000 " + DEG + "C", 12, { f: GOLD, w: 600 });
    out += tx(xs[2], 168, "the Sun", 12, { f: GOLD, w: 600 });
    out += tx(180, 220, "A star’s color shows how hot it is.", 13, { w: 600 });
    return H.svg(W, Ht, out, "Five stars in a row from blue, the hottest, through white, yellow, and orange to red, the coolest");
  });

  /* ---------- star-sizes ---------- */
  R.register("star-sizes", function (spec, H) {
    var W = 360, Ht = 240, out = H.space(W, Ht, 17, 36), cy = 92;
    out += bigStar(H, 46, cy, 5, "#dfeaff", 3.2);
    out += bigStar(H, 122, cy, 14, H.C.star.yellow, 1.9);
    out += bigStar(H, 200, cy, 30, H.C.star.orange, 1.45);
    out += bigStar(H, 298, cy, 52, "#ff6b4a", 1.25);
    out += tx(46, 166, "White dwarf", 12.5, { w: 700 }) + tx(46, 182, "planet-size", 12, { f: DIM });
    out += tx(122, 166, "Sun", 13, { w: 700, f: GOLD }) + tx(122, 182, "medium", 12, { f: DIM });
    out += tx(200, 166, "Giant", 13, { w: 700 }) + tx(200, 182, "much bigger", 12, { f: DIM });
    out += tx(298, 166, "Supergiant", 13, { w: 700 }) + tx(298, 182, "100" + TIMES + " Sun or more", 12, { f: DIM });
    out += tx(180, 220, "Not to scale! Real supergiants are even bigger.", 12.5, { i: true, f: DIM });
    return H.svg(W, Ht, out, "Four stars from smallest to biggest: a tiny white dwarf, the medium Sun, a giant and a huge supergiant, not drawn to scale");
  });

  /* ---------- star-temp ---------- */
  R.register("star-temp", function (spec, H) {
    var W = 360, Ht = 240, out = H.space(W, Ht, 23, 28), tg = H.uid("tm"), i, y, lv = [44, 78, 112, 146, 180];
    var names = ["Blue", "White", "Yellow", "Orange", "Red"], l2 = ["hottest, about 15,000 " + DEG + "C", "hot", "medium, the Sun", "cool", "coolest"];
    out += "<defs>" + '<linearGradient id="' + tg + '" x1="0" y1="0" x2="0" y2="1">' + stop(0, COLS.blue) + stop(0.25, COLS.white) + stop(0.5, COLS.yellow) +
      stop(0.75, COLS.orange) + stop(1, COLS.red) + "</linearGradient></defs>";
    out += '<rect x="68" y="30" width="28" height="150" rx="14" fill="#101845" stroke="#a9b4e6" stroke-width="2"/>';
    out += '<rect x="75" y="36" width="14" height="150" rx="7" fill="url(#' + tg + ')"/>';
    out += circ(82, 190, 19, COLS.red, ' stroke="#a9b4e6" stroke-width="2"') + circ(76, 184, 5, "#fff", ' opacity="0.45"');
    out += tx(82, 20, "hotter", 12, { w: 600, f: "#9cc4ff" }) + tx(82, 227, "cooler", 12, { w: 600, f: "#ff9a8d" });
    for (i = 0; i < 5; i += 1) {
      y = lv[i];
      out += '<line x1="98" y1="' + y + '" x2="128" y2="' + y + '" stroke="' + COLS[COL_ORDER[i]] + '" stroke-width="2" stroke-dasharray="2 4"/>';
      out += bigStar(H, 146, y, 10, COLS[COL_ORDER[i]], 2.1);
      out += tx(166, y - 1, names[i], 14, { a: "start", w: 700 }) + tx(166, y + 14, l2[i], 12, { a: "start", f: i === 0 || i === 2 ? GOLD : DIM });
    }
    out += tx(350, 214, "Surprise! For stars,", 12.5, { a: "end", w: 600, f: GOLD }) + tx(350, 229, "blue is hotter than red.", 12.5, { a: "end", w: 600, f: GOLD });
    return H.svg(W, Ht, out, "A thermometer showing star colors: blue stars are the hottest and red stars are cooler");
  });

  /* ---------- twins ---------- */
  function meterBar(H, x, top, w, h, frac) {
    var id = H.uid("mt"), fh = Math.max(4, frac * (h - 8)), out = "<defs>" +
      '<linearGradient id="' + id + '" x1="0" y1="1" x2="0" y2="0">' + stop(0, "#ff9d3c") + stop(1, "#fff3b0") + "</linearGradient></defs>";
    var k;
    out += '<rect x="' + x + '" y="' + top + '" width="' + w + '" height="' + h + '" rx="6" fill="#101845" stroke="#7f8ee0" stroke-width="1.8" class="meter"/>';
    out += '<rect x="' + (x + 4) + '" y="' + n(top + h - 4 - fh) + '" width="' + (w - 8) + '" height="' + n(fh) + '" rx="3" fill="url(#' + id + ')" class="meter-fill" data-h="' + n(fh) + '"/>';
    for (k = 1; k < 4; k += 1) { out += '<line x1="' + (x + w - 7) + '" y1="' + n(top + (h * k) / 4) + '" x2="' + (x + w) + '" y2="' + n(top + (h * k) / 4) + '" stroke="#7f8ee0" stroke-width="1.2"/>'; }
    return out;
  }
  function meterBarH(H, x, top, w, h, frac) {
    var id = H.uid("mh"), fw = Math.max(4, frac * (w - 8)), out = "<defs>" +
      '<linearGradient id="' + id + '" x1="0" y1="0" x2="1" y2="0">' + stop(0, "#ff9d3c") + stop(1, "#fff3b0") + "</linearGradient></defs>", k;
    out += '<rect x="' + x + '" y="' + top + '" width="' + w + '" height="' + h + '" rx="6" fill="#101845" stroke="#7f8ee0" stroke-width="1.8" class="meter"/>';
    out += '<rect x="' + (x + 4) + '" y="' + (top + 4) + '" width="' + n(fw) + '" height="' + (h - 8) + '" rx="3" fill="url(#' + id + ')" class="meter-fill" data-w="' + n(fw) + '"/>';
    for (k = 1; k < 4; k += 1) { out += '<line x1="' + n(x + (w * k) / 4) + '" y1="' + (top + h - 5) + '" x2="' + n(x + (w * k) / 4) + '" y2="' + (top + h) + '" stroke="#7f8ee0" stroke-width="1.2"/>'; }
    return out;
  }
  R.register("twins", function (spec, H) {
    var W = 360, Ht = 240, out = H.space(W, Ht, 31, 32), cname = COLS[spec.color] ? spec.color : "yellow", col = COLS[cname];
    var labelOn = spec.label !== false, single = spec.size != null && isFinite(Number(spec.size)), r, a, b, mx, top = 30, mh = 160, cy;
    var meter1, sx, withMeter, xs, mxs, k, rr;
    if (single) {
      r = clamp(Number(spec.size), 8, 60);
      meter1 = spec.meter !== false; sx = meter1 ? 118 : 180;
      cy = 112;
      out += bigStar(H, sx, cy, r, col, 1.9);
      if (meter1) {
        out += meterBar(H, 250, top, 30, mh, (r * r) / 3600);
        out += tx(288, top + 10, "more", 12, { a: "start", f: DIM }) + tx(288, top + mh - 2, "less", 12, { a: "start", f: DIM });
        if (labelOn) { out += tx(265, 212, "light it gives off", 12.5, { w: 600, f: GOLD }); }
      }
      if (labelOn) { out += tx(sx, 212, "star size", 12.5, { w: 600 }); }
      return H.svg(W, Ht, out, "A " + cname + " star" + (meter1 ? " with a bar showing how much light it gives off" : ""));
    }
    a = clamp(Number(spec.sizes && spec.sizes[0] != null ? spec.sizes[0] : 20), 8, 60);
    b = clamp(Number(spec.sizes && spec.sizes[1] != null ? spec.sizes[1] : 45), 8, 60);
    withMeter = spec.meter === true; xs = [92, 268]; rr = [a, b];
    mx = Math.max(a * a, b * b); cy = withMeter ? 76 : 112;
    for (k = 0; k < 2; k += 1) {
      out += bigStar(H, xs[k], cy, rr[k], col, 1.9);
      if (withMeter) {
        out += meterBarH(H, xs[k] - 75, 158, 150, 16, (rr[k] * rr[k]) / mx);
        if (labelOn) { out += tx(xs[k], 152, "light it gives off", 12, { f: GOLD, w: 600 }); }
      }
    }
    if (labelOn) {
      var by = withMeter ? 214 : 30, ty = withMeter ? 190 : 206;
      out += '<path d="M' + xs[0] + " " + (withMeter ? by - 8 : by) + "V" + (withMeter ? by : by - 6) + "H" + xs[1] + "V" + (withMeter ? by - 8 : by) +
        '" fill="none" stroke="' + GOLD + '" stroke-width="2" stroke-linejoin="round"/>';
      out += '<rect x="126" y="' + (by - 11) + '" width="108" height="22" rx="11" fill="' + NAVY + '"/>' + tx(180, by + 4, "same color", 13, { w: 700, f: GOLD });
      if (a !== b) {
        if (withMeter) { ty = 190; } else { ty = 200; }
        out += tx(xs[0], ty, a > b ? "bigger star" : "smaller star", 13, { w: 600 }) + tx(xs[1], ty, b > a ? "bigger star" : "smaller star", 13, { w: 600 });
      }
    }
    return H.svg(W, Ht, out, "Two " + cname + " stars of the same color but different sizes" + (withMeter ? ", each with a bar showing the light it gives off" : ""));
  });

  /* ---------- hr (brightness vs temperature) ---------- */
  var HR_X0 = 44, HR_X1 = 348, HR_Y0 = 20, HR_Y1 = 240;
  function hx(c) { return 50 + 292 * c; }
  function hy(l) { return 232 - 204 * l; }
  var HR_NAMED = {
    rigel: { n: "Rigel", c: 0.02, l: 0.97, r: 8, col: COLS.blue, side: "r" },
    betelgeuse: { n: "Betelgeuse", c: 0.93, l: 0.95, r: 11, col: COLS.red, side: "b" },
    spica: { n: "Spica", c: 0.06, l: 0.84, r: 6, col: COLS.blue, side: "r" },
    polaris: { n: "Polaris", c: 0.45, l: 0.80, r: 8, col: COLS.yellow, side: "r" },
    aldebaran: { n: "Aldebaran", c: 0.74, l: 0.66, r: 8, col: COLS.orange, side: "r" },
    vega: { n: "Vega", c: 0.12, l: 0.63, r: 5, col: "#d6e4ff", side: "r" },
    sirius: { n: "Sirius", c: 0.14, l: 0.52, r: 5, col: COLS.white, side: "r" },
    sun: { n: "Sun", c: 0.45, l: 0.38, r: 4, col: COLS.yellow, side: "r" },
    proxima: { n: "Proxima Centauri", c: 0.93, l: 0.06, r: 3, col: COLS.red, side: "l" },
    siriusB: { n: "Sirius B", c: 0.10, l: 0.17, r: 2.5, col: COLS.white, side: "r" },
    barnard: { n: "Barnard’s Star", c: 0.90, l: 0.10, r: 3, col: COLS.red, side: "l" }
  };
  var HR_ORDER = ["rigel", "betelgeuse", "spica", "polaris", "aldebaran", "vega", "sirius", "sun", "proxima", "siriusB", "barnard"];
  var HR_MS = [[0, 0.95], [0.06, 0.80], [0.14, 0.58], [0.3, 0.49], [0.45, 0.38], [0.6, 0.27], [0.75, 0.17], [0.9, 0.09], [1, 0.04]];
  var HR_MS_C = [0.03, 0.09, 0.17, 0.21, 0.26, 0.33, 0.4, 0.52, 0.57, 0.64, 0.69, 0.79, 0.83, 0.96];
  var HR_GIANTS = [[0.58, 0.70, 5.5], [0.64, 0.60, 6], [0.80, 0.56, 6.5], [0.88, 0.55, 7]];
  var HR_SUPER = [[0.62, 0.90, 8], [0.70, 0.93, 9], [0.80, 0.87, 9], [0.87, 0.90, 10]];
  var HR_BLUEG = [[0.09, 0.88, 6], [0.15, 0.80, 6]];
  var HR_DWARFS = [[0.04, 0.12, 2.6], [0.07, 0.20, 2.6], [0.16, 0.08, 2.6], [0.26, 0.10, 2.6]];
  var HR_GROUPS = [
    { t: "Blue giants", x: 122, y: 32, a: "start" }, { t: "Supergiants", x: 266, y: 31, a: "middle" },
    { t: "Giants", x: 297, y: 142, a: "middle" }, { t: "White dwarfs", x: 52, y: 234, a: "start" }
  ];
  function msAt(c) {
    var i, p, q, t;
    for (i = 0; i < HR_MS.length - 1; i += 1) {
      p = HR_MS[i]; q = HR_MS[i + 1];
      if (c <= q[0]) { t = (c - p[0]) / (q[0] - p[0]); return p[1] + (q[1] - p[1]) * t; }
    }
    return HR_MS[HR_MS.length - 1][1];
  }
  function toMap(arr) {
    var m = {}, i;
    if (!arr || !arr.length) { return m; }
    for (i = 0; i < arr.length; i += 1) { m[arr[i]] = true; }
    return m;
  }
  function textBox(x, y, s, size, anchor) {
    var w = s.length * size * 0.57, x0 = anchor === "end" ? x - w : (anchor === "middle" ? x - w / 2 : x);
    return { x0: x0, x1: x0 + w, y0: y - size, y1: y + size * 0.3 };
  }
  function dotHitsBox(x, y, r, b, pad) {
    return x + r + pad > b.x0 && x - r - pad < b.x1 && y + r + pad > b.y0 && y - r - pad < b.y1;
  }
  function segClear(x, y, dx, dy, d0, d1, boxes, dots, self) {
    var d, px, py, i, b, o;
    for (d = d0; d <= d1; d += 3) {
      px = x + dx * d; py = y + dy * d;
      if (px < HR_X0 + 4 || px > HR_X1 - 4 || py < HR_Y0 + 4 || py > HR_Y1 - 4) { return false; }
      for (i = 0; i < boxes.length; i += 1) { b = boxes[i]; if (px > b.x0 - 3 && px < b.x1 + 3 && py > b.y0 - 3 && py < b.y1 + 3) { return false; } }
      for (i = 0; i < dots.length; i += 1) {
        o = dots[i];
        if (o.id !== self && Math.sqrt((px - o.x) * (px - o.x) + (py - o.y) * (py - o.y)) < o.r + 5) { return false; }
      }
    }
    return true;
  }

  R.register("hr", function (spec, H) {
    var W = 360, Ht = 304, named = spec.set === "named", out = H.space(W, Ht, 41, 24), i, j, id, s, bg = H.uid("hb");
    var labelMap = named ? (spec.label ? toMap(spec.label) : null) : { sun: true };
    var tapMap = named ? toMap(spec.tap) : {}, arrMap = named ? toMap(spec.arrows) : {}, hlMap = named ? toMap(spec.hl) : {};
    var infos = [], boxes = [], dots = [], anon = [], rand = H.rng(77), c, l, jit, a, inf, d, skip;
    for (i = 0; i < HR_ORDER.length; i += 1) {
      id = HR_ORDER[i];
      if (!named && id !== "sun") { continue; }
      s = HR_NAMED[id];
      inf = { id: id, s: s, x: hx(s.c), y: hy(s.l), lab: labelMap === null ? true : !!labelMap[id] };
      if (inf.lab) {
        inf.lx = inf.x + (s.side === "r" ? s.r + 5 : -s.r - 5);
        inf.la = s.side === "r" ? "start" : "end";
        inf.ly = inf.y + 4;
        if (s.side === "b") { inf.lx = inf.x + 18; inf.ly = inf.y + s.r + 17; }
        if (id === "proxima") { inf.ly = inf.y + 8; }
        if (id === "barnard") { inf.ly = inf.y - 2; }
        inf.box = textBox(inf.lx, inf.ly, s.n, 12, inf.la);
        boxes.push(inf.box);
      }
      dots.push({ id: id, x: inf.x, y: inf.y, r: s.r });
      infos.push(inf);
    }
    for (i = 0; i < HR_GROUPS.length; i += 1) { boxes.push(textBox(HR_GROUPS[i].x, HR_GROUPS[i].y, HR_GROUPS[i].t, 11.5, HR_GROUPS[i].a)); }
    for (i = 0; i < HR_MS_C.length; i += 1) {
      c = HR_MS_C[i]; jit = (rand() - 0.5) * 0.05; l = clamp(msAt(c) + jit, 0.03, 0.97);
      anon.push({ x: hx(c), y: hy(l), r: 3.2 + (1 - c) * 1.6, col: colAt(c) });
    }
    for (i = 0; i < HR_GIANTS.length; i += 1) { anon.push({ x: hx(HR_GIANTS[i][0]), y: hy(HR_GIANTS[i][1]), r: HR_GIANTS[i][2], col: colAt(HR_GIANTS[i][0]) }); }
    for (i = 0; i < HR_SUPER.length; i += 1) { anon.push({ x: hx(HR_SUPER[i][0]), y: hy(HR_SUPER[i][1]), r: HR_SUPER[i][2], col: colAt(HR_SUPER[i][0]) }); }
    for (i = 0; i < HR_BLUEG.length; i += 1) { anon.push({ x: hx(HR_BLUEG[i][0]), y: hy(HR_BLUEG[i][1]), r: HR_BLUEG[i][2], col: COLS.blue }); }
    for (i = 0; i < HR_DWARFS.length; i += 1) { anon.push({ x: hx(HR_DWARFS[i][0]), y: hy(HR_DWARFS[i][1]), r: HR_DWARFS[i][2], col: "#e8f0ff" }); }

    out += "<defs>" + band(bg, HR_X0, HR_X1) + "</defs>";
    out += '<rect x="' + HR_X0 + '" y="' + HR_Y0 + '" width="' + (HR_X1 - HR_X0) + '" height="' + (HR_Y1 - HR_Y0) + '" rx="8" fill="#111845"/>';
    out += '<rect x="' + HR_X0 + '" y="' + HR_Y0 + '" width="' + (HR_X1 - HR_X0) + '" height="' + (HR_Y1 - HR_Y0) + '" rx="8" fill="url(#' + bg + ')" opacity="0.13"/>';
    for (i = 1; i < 5; i += 1) { out += '<line x1="' + n(HR_X0 + i * 60.8) + '" y1="' + HR_Y0 + '" x2="' + n(HR_X0 + i * 60.8) + '" y2="' + HR_Y1 + '" stroke="#a9b4e6" stroke-opacity="0.12" stroke-dasharray="3 5"/>'; }
    for (i = 1; i < 4; i += 1) { out += '<line x1="' + HR_X0 + '" y1="' + n(HR_Y0 + i * 55) + '" x2="' + HR_X1 + '" y2="' + n(HR_Y0 + i * 55) + '" stroke="#a9b4e6" stroke-opacity="0.12" stroke-dasharray="3 5"/>'; }
    s = "";
    for (i = 0; i < HR_MS.length; i += 1) { s += (i ? " " : "") + n(hx(HR_MS[i][0])) + "," + n(hy(HR_MS[i][1])); }
    out += '<polyline points="' + s + '" fill="none" stroke="#9fb4ff" stroke-opacity="0.10" stroke-width="22" stroke-linecap="round" stroke-linejoin="round"/>';
    out += '<rect x="' + HR_X0 + '" y="' + HR_Y0 + '" width="' + (HR_X1 - HR_X0) + '" height="' + (HR_Y1 - HR_Y0) + '" rx="8" fill="none" stroke="#4a58b0" stroke-width="1.6"/>';

    for (i = 0; i < anon.length; i += 1) {
      d = anon[i]; skip = false;
      for (j = 0; j < boxes.length; j += 1) { if (dotHitsBox(d.x, d.y, d.r, boxes[j], 2)) { skip = true; break; } }
      for (j = 0; j < dots.length && !skip; j += 1) {
        if (Math.sqrt((d.x - dots[j].x) * (d.x - dots[j].x) + (d.y - dots[j].y) * (d.y - dots[j].y)) < d.r + dots[j].r + 5) { skip = true; }
      }
      if (skip) { continue; }
      out += circ(d.x, d.y, d.r * 2.1, d.col, ' opacity="0.16"') + circ(d.x, d.y, d.r, d.col) + circ(d.x - d.r * 0.3, d.y - d.r * 0.3, d.r * 0.35, "#fff", ' opacity="0.7"');
    }
    for (i = 0; i < HR_GROUPS.length; i += 1) {
      out += tx(HR_GROUPS[i].x, HR_GROUPS[i].y, HR_GROUPS[i].t, 11.5, { a: HR_GROUPS[i].a, w: 600, i: true, f: "#c4cdf7", halo: true });
    }

    var pass, g, x0b, x1b;
    for (pass = 0; pass < 2; pass += 1) {
      for (i = 0; i < infos.length; i += 1) {
        inf = infos[i];
        if ((pass === 0) === !!tapMap[inf.id]) { continue; }
        s = inf.s;
        g = "";
        if (hlMap[inf.id]) {
          g += blob(H, inf.x, inf.y, s.r + 20, s.r + 20, 0, GOLD, 0.5);
          g += circ(inf.x, inf.y, s.r + 6.5, "none", ' stroke="' + GOLD + '" stroke-width="2.6"');
        }
        if (tapMap[inf.id]) {
          x0b = inf.x - Math.max(14, s.r + 8); x1b = inf.x + Math.max(14, s.r + 8);
          if (inf.box) { x0b = Math.min(x0b, inf.box.x0 - 4); x1b = Math.max(x1b, inf.box.x1 + 4); }
          g = '<rect x="' + n(x0b) + '" y="' + n(inf.y - 14) + '" width="' + n(x1b - x0b) + '" height="28" rx="8" fill="#ffffff" fill-opacity="0"/>' + g;
          if (!hlMap[inf.id]) { g += circ(inf.x, inf.y, s.r + 5, "none", ' stroke="#ffffff" stroke-opacity="0.55" stroke-width="1.5" stroke-dasharray="2.5 3"'); }
        }
        g += circ(inf.x, inf.y, s.r * 2.3, s.col, ' opacity="0.22"');
        g += circ(inf.x, inf.y, s.r, s.col, ' stroke="#ffffff" stroke-opacity="0.85" stroke-width="1"');
        g += circ(inf.x - s.r * 0.3, inf.y - s.r * 0.3, s.r * 0.32, "#fff", ' opacity="0.7"');
        if (inf.lab) { g += tx(inf.lx, inf.ly, s.n, 12, { a: inf.la, w: 600, halo: true }); }
        if (tapMap[inf.id]) {
          out += '<g class="hot" data-opt="' + R.H.esc(inf.id) + '" tabindex="-1" style="cursor:pointer">' + g + "</g>";
        } else {
          out += '<g data-star="' + R.H.esc(inf.id) + '">' + g + "</g>";
        }
      }
    }
    var angs = [90, 135, 45, 180, 0, -90, -45, -135, 112, 68, 157, 22, -112, -68], ax1, ay1, ax2, ay2;
    for (i = 0; i < infos.length; i += 1) {
      inf = infos[i];
      if (!arrMap[inf.id]) { continue; }
      for (j = 0; j < angs.length; j += 1) {
        a = angs[j] * Math.PI / 180;
        if (segClear(inf.x, inf.y, Math.cos(a), Math.sin(a), inf.s.r + 8, inf.s.r + 38, boxes, dots, inf.id)) { break; }
      }
      if (j === angs.length) { j = 0; }
      a = angs[j] * Math.PI / 180;
      ax1 = inf.x + Math.cos(a) * (inf.s.r + 40); ay1 = inf.y + Math.sin(a) * (inf.s.r + 40);
      ax2 = inf.x + Math.cos(a) * (inf.s.r + 9); ay2 = inf.y + Math.sin(a) * (inf.s.r + 9);
      out += arrow(ax1, ay1, ax2, ay2, NAVY, 7, 12) + arrow(ax1, ay1, ax2, ay2, GOLD, 3.4, 11);
    }
    out += '<rect x="' + HR_X0 + '" y="246" width="' + (HR_X1 - HR_X0) + '" height="11" rx="5.5" fill="url(#' + bg + ')"/>';
    var nm = ["Blue", "White", "Yellow", "Orange", "Red"];
    for (i = 0; i < 5; i += 1) { out += tx(HR_X0 + 30.4 + i * 60.8, 273, nm[i], 11.5, { f: i === 0 ? "#a9c8ff" : INK, w: 600 }); }
    out += '<polygon points="44,291 53,286 53,296" fill="#9cc4ff"/>' + tx(57, 296, "Hot", 13, { a: "start", w: 700, f: "#9cc4ff" });
    out += tx(196, 296, "Temperature", 13, { w: 700 });
    out += '<polygon points="348,291 339,286 339,296" fill="#ff9a8d"/>' + tx(335, 296, "Cool", 13, { a: "end", w: 700, f: "#ff9a8d" });
    out += tx(14, 139, "Brightness", 13, { w: 700, extra: ' transform="rotate(-90 14 134)"' });
    out += '<polygon points="14,80 9,90 19,90" fill="' + INK + '"/><polygon points="14,188 9,178 19,178" fill="' + INK + '"/>';
    out += tx(40, 34, "High", 11.5, { a: "end", f: DIM, w: 600 }) + tx(40, 236, "Low", 11.5, { a: "end", f: DIM, w: 600 });
    out += tx(348, 13, "simplified chart", 11, { a: "end", f: DIM, i: true });
    return H.svg(W, Ht, out, named ?
      "Star chart of brightness against temperature. Hot stars are on the left and cool stars on the right. Brighter stars are higher up. Named stars are marked." :
      "Star chart of brightness against temperature. Hot stars are on the left and cool stars on the right. Brighter stars are higher up. Most stars form a diagonal band, with giants at the top right and white dwarfs at the bottom left.");
  });
}());

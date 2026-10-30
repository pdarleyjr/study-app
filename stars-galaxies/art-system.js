/* Cosmic Quest art: solar system, orbits, planets, small bodies, icons, hero, page map. */
(function () {
  var A = window.SG_ART, H0 = A.H, C = H0.C, esc = H0.esc;

  function f(n) { return Math.round(n * 10) / 10; }
  function tx(x, y, s, size, fill, anchor, wt, extra) {
    return '<text x="' + f(x) + '" y="' + f(y) + '" font-size="' + size + '" fill="' + fill + '" font-family="inherit"' +
      (anchor ? ' text-anchor="' + anchor + '"' : '') + (wt ? ' font-weight="' + wt + '"' : '') + (extra || '') + '>' + esc(s) + '</text>';
  }
  function mix(a, b, t) {
    var o = "#", i, v;
    function p(h, k) { return parseInt(h.substr(1 + k * 2, 2), 16); }
    for (i = 0; i < 3; i += 1) { v = Math.round(p(a, i) * (1 - t) + p(b, i) * t); o += (v < 16 ? "0" : "") + v.toString(16); }
    return o;
  }
  function ball(H, cx, cy, r, color) {
    var id = H.uid("bl");
    return '<defs><radialGradient id="' + id + '" cx=".36" cy=".32" r=".78"><stop offset="0" stop-color="' + mix(color, "#ffffff", 0.6) +
      '"/><stop offset=".5" stop-color="' + color + '"/><stop offset="1" stop-color="' + mix(color, "#000000", 0.6) + '"/></radialGradient></defs>' +
      '<circle cx="' + f(cx) + '" cy="' + f(cy) + '" r="' + f(r) + '" fill="url(#' + id + ')"/>';
  }
  function star5(cx, cy, R, r, rot) {
    var pts = [], i, a, d;
    for (i = 0; i < 10; i += 1) {
      a = (rot || 0) - Math.PI / 2 + i * Math.PI / 5; d = i % 2 ? r : R;
      pts.push(f(cx + d * Math.cos(a)) + "," + f(cy + d * Math.sin(a)));
    }
    return pts.join(" ");
  }
  function sunMk(H, cx, cy, r) {
    var g = H.glow("#ffb703", "#fff6c8", 0), c = H.uid("sn");
    return '<defs>' + g.def + '<radialGradient id="' + c + '"><stop offset="0" stop-color="#fffbe0"/><stop offset=".6" stop-color="#ffd84d"/><stop offset="1" stop-color="#ff9d3c"/></radialGradient></defs>' +
      '<circle cx="' + f(cx) + '" cy="' + f(cy) + '" r="' + f(r * 3) + '" fill="' + g.ref + '" opacity=".55"/>' +
      '<circle cx="' + f(cx) + '" cy="' + f(cy) + '" r="' + f(r) + '" fill="url(#' + c + ')"/>';
  }
  function spiralPath(cx, cy, R, phase, turns, tilt, sq) {
    var pts = [], i, n = 44, t, a, r, x, y, ca = Math.cos(tilt), sa = Math.sin(tilt);
    for (i = 0; i <= n; i += 1) {
      t = i / n; a = phase + t * turns * Math.PI * 2; r = R * (0.1 + 0.9 * t);
      x = r * Math.cos(a); y = r * Math.sin(a) * sq;
      pts.push(f(cx + x * ca - y * sa) + " " + f(cy + x * sa + y * ca));
    }
    return "M" + pts.join(" L");
  }
  function galaxyMk(H, cx, cy, R, tilt, sq) {
    var g1 = H.glow("#ffd9a0", "#fff6e0", 0), g2 = H.glow("#7fb2ff", "#bcd6ff", 0), out, k, ph, d;
    out = '<defs>' + g1.def + g2.def + '</defs>';
    out += '<ellipse cx="' + f(cx) + '" cy="' + f(cy) + '" rx="' + f(R * 1.05) + '" ry="' + f(R * 1.05 * sq) + '" fill="' + g2.ref + '" opacity=".4" transform="rotate(' + tilt + ' ' + f(cx) + ' ' + f(cy) + ')"/>';
    for (k = 0; k < 2; k += 1) {
      ph = k * Math.PI; d = spiralPath(cx, cy, R, ph, 0.85, tilt * Math.PI / 180, sq);
      out += '<path d="' + d + '" fill="none" stroke="#7fb2ff" stroke-width="' + f(R * 0.2) + '" stroke-linecap="round" stroke-linejoin="round" opacity=".28"/>';
      out += '<path d="' + d + '" fill="none" stroke="#dbe8ff" stroke-width="' + f(R * 0.07) + '" stroke-linecap="round" stroke-linejoin="round" opacity=".85"/>';
    }
    out += '<ellipse cx="' + f(cx) + '" cy="' + f(cy) + '" rx="' + f(R * 0.4) + '" ry="' + f(R * 0.4 * Math.max(sq, 0.6)) + '" fill="' + g1.ref + '"/>';
    return out;
  }
  function rocketMk(H) {
    var b = H.uid("rk");
    return '<defs><linearGradient id="' + b + '" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#b9c4ee"/><stop offset=".45" stop-color="#ffffff"/><stop offset="1" stop-color="#9aa8dd"/></linearGradient></defs>' +
      '<path d="M-7 20 Q0 52 7 20 Z" fill="#ff9d3c"/><path d="M-3.5 20 Q0 40 3.5 20 Z" fill="#ffe27a"/>' +
      '<path d="M-10 6 L-22 26 L-9 20 Z" fill="#ff5a4a"/><path d="M10 6 L22 26 L9 20 Z" fill="#ff5a4a"/>' +
      '<path d="M0 -36 C13 -24 13 6 9 21 L-9 21 C-13 6 -13 -24 0 -36 Z" fill="url(#' + b + ')"/>' +
      '<path d="M0 -36 C6 -31 10 -26 11 -19 L-11 -19 C-10 -26 -6 -31 0 -36 Z" fill="#ff5a4a"/>' +
      '<circle cx="0" cy="-5" r="6.2" fill="#1b2459"/><circle cx="0" cy="-5" r="4.6" fill="#5ee7ff"/><circle cx="-1.5" cy="-6.5" r="1.4" fill="#fff" opacity=".9"/>';
  }

  /* ---------- planets (drawn in a local frame where the planet radius is 100) ---------- */
  var PL = {
    mercury: { base: "#a39d94", halo: "#b8b2a8", label: "Mercury" },
    venus: { base: "#e9cd8f", halo: "#f3dfa8", label: "Venus" },
    earth: { base: "#2a6fd6", halo: "#6fb0ff", label: "Earth" },
    mars: { base: "#c4552f", halo: "#e0825a", label: "Mars" },
    jupiter: { base: "#d9b48a", halo: "#e8c9a0", label: "Jupiter" },
    saturn: { base: "#ead9a2", halo: "#f2e6bb", label: "Saturn" },
    uranus: { base: "#a8e6e8", halo: "#c6f2f2", label: "Uranus" },
    neptune: { base: "#3558d8", halo: "#6f8cf2", label: "Neptune" }
  };
  var PNAMES = ["mercury", "venus", "earth", "mars", "jupiter", "saturn", "uranus", "neptune"];
  function ringsLocal(front) {
    var set = [[212, 56, 9, "#a8966c", 0.8], [180, 48, 16, "#e2d2a0", 0.95], [148, 39, 10, "#c8b685", 0.9]], s = '<g transform="rotate(-16)">', i, d;
    for (i = 0; i < set.length; i += 1) {
      d = set[i];
      s += '<path d="M' + (-d[0]) + ' 0 A' + d[0] + ' ' + d[1] + ' 0 0 ' + (front ? 0 : 1) + ' ' + d[0] + ' 0" fill="none" stroke="' + d[3] + '" stroke-width="' + d[2] + '" opacity="' + d[4] + '"/>';
    }
    return s + "</g>";
  }
  function planetInner(name) {
    var s = "", i, c, b;
    if (name === "mercury") {
      c = [[-45, -30, 22], [30, -52, 14], [52, 18, 26], [-22, 46, 18], [-64, 34, 10], [8, 2, 9], [68, -28, 8], [-10, -70, 8]];
      for (i = 0; i < c.length; i += 1) {
        s += '<circle cx="' + c[i][0] + '" cy="' + c[i][1] + '" r="' + c[i][2] + '" fill="#7f7970" stroke="#c9c3b8" stroke-width="2.5" opacity=".9"/>' +
          '<circle cx="' + (c[i][0] - c[i][2] * 0.2) + '" cy="' + (c[i][1] - c[i][2] * 0.2) + '" r="' + c[i][2] * 0.55 + '" fill="#6f695f" opacity=".6"/>';
      }
    } else if (name === "venus") {
      b = [[-62, "#f6e2b0", 0.7], [-30, "#caa566", 0.5], [0, "#f6e2b0", 0.7], [30, "#d4b073", 0.5], [60, "#f6e2b0", 0.6]];
      for (i = 0; i < b.length; i += 1) {
        s += '<path d="M-110 ' + b[i][0] + ' Q-55 ' + (b[i][0] - 22) + ' 0 ' + b[i][0] + ' T110 ' + b[i][0] + '" fill="none" stroke="' + b[i][1] + '" stroke-width="20" opacity="' + b[i][2] + '"/>';
      }
    } else if (name === "earth") {
      s += '<path d="M-58 -62 C-32 -78 -8 -52 -20 -26 C-32 0 -10 20 -16 46 C-22 72 -48 62 -42 32 C-64 10 -78 -30 -58 -62 Z" fill="#4caf50"/>' +
        '<path d="M-48 -50 C-34 -60 -22 -50 -26 -38 C-36 -34 -46 -38 -48 -50 Z" fill="#8bd16b" opacity=".8"/>' +
        '<path d="M26 -52 C58 -58 84 -26 62 6 C50 32 42 62 20 56 C4 40 16 10 6 -10 C0 -30 10 -46 26 -52 Z" fill="#3fa14a"/>' +
        '<path d="M30 -30 C48 -32 60 -14 48 2 C40 -6 30 -12 30 -30 Z" fill="#c9b36a" opacity=".75"/>' +
        '<ellipse cx="0" cy="-96" rx="48" ry="16" fill="#fff" opacity=".95"/><ellipse cx="0" cy="98" rx="40" ry="12" fill="#fff" opacity=".9"/>' +
        '<path d="M-96 -20 Q-60 -34 -20 -22" fill="none" stroke="#fff" stroke-width="12" stroke-linecap="round" opacity=".7"/>' +
        '<path d="M10 28 Q50 14 90 30" fill="none" stroke="#fff" stroke-width="13" stroke-linecap="round" opacity=".7"/>' +
        '<path d="M-60 66 Q-20 54 20 70" fill="none" stroke="#fff" stroke-width="10" stroke-linecap="round" opacity=".6"/>';
    } else if (name === "mars") {
      s += '<ellipse cx="25" cy="10" rx="70" ry="38" fill="#d9764a" opacity=".6"/>' +
        '<path d="M-70 -10 C-50 -34 -20 -28 -10 -6 C-14 14 -46 30 -66 18 Z" fill="#8e3a22" opacity=".75"/>' +
        '<path d="M20 36 C40 24 72 30 78 48 C60 62 30 62 20 36 Z" fill="#8e3a22" opacity=".6"/>' +
        '<circle cx="-20" cy="-52" r="9" fill="#a8452a" opacity=".7"/><circle cx="46" cy="-34" r="6" fill="#a8452a" opacity=".6"/>' +
        '<ellipse cx="0" cy="-95" rx="32" ry="11" fill="#fff" opacity=".92"/>';
    } else if (name === "jupiter") {
      b = [[-100, 30, "#d9b48a"], [-72, 18, "#b07a52"], [-56, 22, "#efe0c6"], [-36, 20, "#c08a5e"], [-18, 22, "#f3e7d2"], [2, 18, "#a96f48"], [18, 22, "#e6cfa8"], [38, 18, "#c28a5c"], [54, 22, "#efe0c6"], [74, 14, "#b98a64"], [86, 30, "#d9b48a"]];
      for (i = 0; i < b.length; i += 1) { s += '<path d="M-110 ' + b[i][0] + ' Q-50 ' + (b[i][0] + 3) + ' 0 ' + b[i][0] + ' T110 ' + b[i][0] + ' V' + (b[i][0] + b[i][1]) + ' H-110 Z" fill="' + b[i][2] + '"/>'; }
      s += '<ellipse cx="36" cy="34" rx="25" ry="13" fill="#e9b79b" opacity=".8"/><ellipse cx="36" cy="34" rx="20" ry="9.5" fill="#c9522f"/><ellipse cx="34" cy="33" rx="9" ry="4.5" fill="#a63d22"/>';
    } else if (name === "saturn") {
      b = [[-90, 30, "#f0e2b4"], [-62, 18, "#d9c389"], [-44, 22, "#f2e6bd"], [-22, 22, "#e0cc92"], [0, 20, "#f4e8c2"], [20, 22, "#d6bf84"], [42, 22, "#efe0b0"], [66, 40, "#dcc690"]];
      for (i = 0; i < b.length; i += 1) { s += '<rect x="-110" y="' + b[i][0] + '" width="220" height="' + b[i][1] + '" fill="' + b[i][2] + '"/>'; }
    } else if (name === "uranus") {
      s += '<rect x="-110" y="-20" width="220" height="40" fill="#c9f4f4" opacity=".5"/><rect x="-110" y="40" width="220" height="14" fill="#8fd6da" opacity=".35"/>' +
        '<ellipse cx="-30" cy="-50" rx="55" ry="22" fill="#d6fafa" opacity=".35"/>';
    } else if (name === "neptune") {
      s += '<path d="M-110 -50 Q-50 -62 0 -50 T110 -50" fill="none" stroke="#5c7df0" stroke-width="22" opacity=".55"/>' +
        '<path d="M-110 40 Q-50 28 0 40 T110 40" fill="none" stroke="#2a46b8" stroke-width="26" opacity=".5"/>' +
        '<ellipse cx="-28" cy="-8" rx="26" ry="14" fill="#1c3498"/>' +
        '<path d="M10 -30 Q50 -38 86 -24" fill="none" stroke="#fff" stroke-width="5" stroke-linecap="round" opacity=".7"/>' +
        '<path d="M-50 36 Q-10 28 30 40" fill="none" stroke="#fff" stroke-width="4" stroke-linecap="round" opacity=".6"/>';
    }
    return s;
  }
  function planetMk(H, name, cx, cy, r) {
    var d = PL[name] || PL.earth, cl = H.uid("pc"), sh = H.uid("ps"), k = r / 100, out;
    out = '<g transform="translate(' + f(cx) + ' ' + f(cy) + ') scale(' + k.toFixed(4) + ')">' +
      '<defs><clipPath id="' + cl + '"><circle r="100"/></clipPath><radialGradient id="' + sh + '" cx=".38" cy=".33" r=".82"><stop offset="0" stop-color="#fff" stop-opacity=".38"/><stop offset=".4" stop-color="#fff" stop-opacity="0"/><stop offset="1" stop-color="#000" stop-opacity=".62"/></radialGradient></defs>' +
      '<circle r="118" fill="' + d.halo + '" opacity=".12"/><circle r="107" fill="' + d.halo + '" opacity=".18"/>';
    if (name === "saturn") { out += ringsLocal(false); }
    out += '<circle r="100" fill="' + d.base + '"/><g clip-path="url(#' + cl + ')">' + planetInner(name) + '</g><circle r="100" fill="url(#' + sh + ')"/>';
    if (name === "saturn") { out += ringsLocal(true); }
    return out + "</g>";
  }
  function pnameOf(s) {
    var n = s.planet || s.arg || s.of || s.pname || s.id || (PL[s.name] ? s.name : "") || "earth";
    n = String(n).toLowerCase();
    return PL[n] ? n : "earth";
  }

  A.register("planet", function (s, H) {
    var n = pnameOf(s), r = n === "saturn" ? 52 : 72, cy = n === "saturn" ? 108 : 106;
    return H.svg(360, 240, H.space(360, 240, 31, 46) + planetMk(H, n, 180, cy, r) + tx(180, 224, PL[n].label, 22, C.ink, "middle", 700), PL[n].label + ", a shaded planet" + (n === "saturn" ? " with rings" : ""));
  });
  PNAMES.forEach(function (n) { A.register(n, function (s, H) { return A.render({ name: "planet", planet: n }); }); });

  A.register("planet-group", function (s, H) {
    var names = s.names || s.arg, xs = [45, 135, 225, 315], out = H.space(360, 190, 41, 36), i, n, r;
    if (typeof names === "string") { names = names.split(","); }
    if (!names || !names.length) { names = ["mercury", "venus", "earth", "mars"]; }
    names = names.slice(0, 4);
    for (i = 0; i < names.length; i += 1) {
      n = String(names[i]).toLowerCase(); if (!PL[n]) { n = "earth"; }
      r = n === "saturn" ? 22 : 32;
      xs[i] = names.length === 4 ? xs[i] : 360 / (names.length + 1) * (i + 1);
      out += planetMk(H, n, xs[i], 82, r) + tx(xs[i], 150, PL[n].label, 15, C.ink, "middle", 700);
    }
    out += tx(180, 180, "sizes not to scale", 11, C.dim, "middle");
    return H.svg(360, 190, out, "a row of planets: " + names.join(", "));
  });

  var PROF = {
    mercury: ["small", "", "almost none", "", "dense and rocky", ""],
    venus: ["medium", "", "very thick", "", "dense and rocky", ""],
    earth: ["medium", "", "medium", "", "dense and rocky", ""],
    mars: ["small", "", "thin", "", "dense and rocky", ""],
    jupiter: ["huge", "the biggest planet", "thick (gas)", "", "low density", ""],
    saturn: ["very large", "", "thick (gas)", "", "low density", "less dense than water"],
    uranus: ["large", "", "thick", "", "low density", ""],
    neptune: ["large", "", "thick", "", "low density", ""]
  };
  A.register("planet-profile", function (s, H) {
    var n = pnameOf(s), p = PROF[n], r = n === "saturn" ? 34 : 54, out = H.space(360, 240, 51, 30), labels = ["SIZE", "ATMOSPHERE", "DENSITY"], cols = [C.cyan, C.pink, C.amber], i, y;
    out += planetMk(H, n, 94, 104, r) + tx(94, 206, PL[n].label, 22, C.ink, "middle", 700);
    for (i = 0; i < 3; i += 1) {
      y = 20 + i * 66;
      out += '<rect x="184" y="' + y + '" width="164" height="58" rx="12" fill="' + C.deep + '" stroke="' + cols[i] + '" stroke-opacity=".7"/>' +
        '<rect x="184" y="' + (y + 10) + '" width="5" height="38" rx="2.5" fill="' + cols[i] + '"/>' +
        tx(198, y + 19, labels[i], 11, C.dim, "start", 700, ' letter-spacing="1"') + tx(198, y + 36, p[i * 2], 18, C.ink, "start", 700);
      if (p[i * 2 + 1]) { out += tx(198, y + 50, p[i * 2 + 1], 11, C.dim, "start"); }
    }
    return H.svg(360, 240, out, PL[n].label + ": " + p[0] + " size, " + p[2] + " atmosphere, " + p[4]);
  });

  /* ---------- solar system, constellation, galaxy group ---------- */
  A.register("solar-system", function (s, H) {
    var n = parseInt(s.n || s.arg || 5, 10), out, i, rmax, rx, ry, a, px, py, pl, orb = "", dots = "";
    var P = [{ c: "#b5afa5", r: 3.6 }, { c: "#e9cd8f", r: 5.2 }, { c: "#3f87e8", r: 5.8, moon: 1 }, { c: "#d0562f", r: 4.6 }, { c: "#d9b48a", r: 9.5 }, { c: "#ead9a2", r: 7.6, ring: 1 }, { c: "#a8e6e8", r: 6.4 }, { c: "#3b5fe0", r: 6.2 }];
    var ang = [200, 318, 38, 250, 120, 335, 205, 72];
    if (!(n >= 3)) { n = 5; }
    if (n > 8) { n = 8; }
    rmax = 70 + 12 * n;
    out = H.space(360, 240, 61, 55) + '<g transform="rotate(-8 180 120)">';
    for (i = 0; i < n; i += 1) {
      rx = 38 + (rmax - 38) * i / (n - 1); ry = rx * 0.55; a = ang[i] * Math.PI / 180;
      orb += '<ellipse cx="180" cy="120" rx="' + f(rx) + '" ry="' + f(ry) + '" fill="none" stroke="#9fb0f0" stroke-opacity=".5" stroke-width="1.3"/>';
      px = 180 + rx * Math.cos(a); py = 120 + ry * Math.sin(a); pl = { c: P[i].c, r: P[i].r * 1.2, ring: P[i].ring, moon: P[i].moon };
      if (pl.ring) { dots += '<ellipse cx="' + f(px) + '" cy="' + f(py) + '" rx="' + f(pl.r * 2) + '" ry="' + f(pl.r * 0.55) + '" fill="none" stroke="#e2d2a0" stroke-width="2.2" transform="rotate(-14 ' + f(px) + ' ' + f(py) + ')"/>'; }
      dots += ball(H, px, py, pl.r, pl.c);
      if (pl.moon) { dots += '<circle cx="' + f(px + 10) + '" cy="' + f(py - 7) + '" r="2" fill="#f4f7ff"/>'; }
    }
    out += orb + sunMk(H, 180, 120, 15) + dots + "</g>";
    return H.svg(360, 240, out, "a star with planets orbiting it");
  });

  A.register("constellation", function (s, H) {
    var out = H.space(360, 240, 71, 50), g = H.glow("#cfe0ff", "#ffffff", 0);
    var pts = [[52, 70], [104, 92], [150, 112], [196, 132], [206, 184], [290, 196], [298, 140]], i, path = "";
    var faint = [[40, 180], [120, 200], [250, 60], [320, 80], [90, 40], [330, 215], [160, 175]];
    out += '<defs>' + g.def + '</defs>';
    path = "M" + pts[0].join(" ");
    for (i = 1; i < pts.length; i += 1) { path += " L" + pts[i].join(" "); }
    path += " L" + pts[3].join(" ");
    out += '<path d="' + path + '" fill="none" stroke="#9fc0ff" stroke-width="1.4" stroke-opacity=".8" stroke-linejoin="round"/>';
    for (i = 0; i < faint.length; i += 1) { out += '<circle cx="' + faint[i][0] + '" cy="' + faint[i][1] + '" r="1.8" fill="#dbe6ff" opacity=".6"/>'; }
    for (i = 0; i < pts.length; i += 1) {
      out += '<circle cx="' + pts[i][0] + '" cy="' + pts[i][1] + '" r="13" fill="' + g.ref + '" opacity=".7"/><circle cx="' + pts[i][0] + '" cy="' + pts[i][1] + '" r="3.8" fill="#fff"/>';
    }
    return H.svg(360, 240, out, "bright stars joined by lines into a dipper-shaped pattern");
  });

  A.register("galaxy-system-pic", function (s, H) {
    var out = H.space(360, 240, 81, 70), rand = H.rng(9), gs = [], i, x, y, rx, ry, rot, col;
    var cols = [["#ffe2b8", "#fff4df"], ["#9cc2ff", "#e2eeff"], ["#f6a6e6", "#ffe3f8"]];
    var pos = [[180, 120, 30], [128, 92, 22], [238, 86, 24], [112, 156, 20], [250, 160, 26], [182, 62, 16], [186, 188, 18], [78, 124, 14], [296, 120, 15], [150, 128, 10], [214, 138, 12]];
    out += "<defs>";
    for (i = 0; i < 3; i += 1) { gs.push(H.glow(cols[i][0], cols[i][1], 0)); out += gs[i].def; }
    out += "</defs>";
    for (i = 0; i < pos.length; i += 1) {
      x = pos[i][0]; y = pos[i][1]; rx = pos[i][2]; ry = rx * (0.35 + rand() * 0.4); rot = Math.round(rand() * 160 - 80); col = i % 3;
      out += '<ellipse cx="' + x + '" cy="' + y + '" rx="' + rx + '" ry="' + f(ry) + '" fill="' + gs[col].ref + '" transform="rotate(' + rot + ' ' + x + ' ' + y + ')"/>';
      if (rx > 17) {
        out += '<path d="' + spiralPath(x, y, rx * 0.85, i, 0.8, rot * Math.PI / 180, ry / rx) + '" fill="none" stroke="#fff" stroke-opacity=".5" stroke-width="1.2" stroke-linecap="round"/>';
      }
      out += '<circle cx="' + x + '" cy="' + y + '" r="2.4" fill="#fff"/>';
    }
    return H.svg(360, 240, out, "a fuzzy group of many small galaxies close together");
  });

  /* ---------- comet, asteroid, meteor ---------- */
  A.register("comet", function (s, H) {
    var out = H.space(360, 240, 91, 60), a = H.uid("cd"), b = H.uid("ci"), g = H.glow("#bff3ff", "#ffffff", 0);
    out += '<defs>' + g.def +
      '<linearGradient id="' + a + '" gradientUnits="userSpaceOnUse" x1="0" y1="0" x2="250" y2="0"><stop offset="0" stop-color="#fff2c4" stop-opacity=".9"/><stop offset="1" stop-color="#ffd9a0" stop-opacity="0"/></linearGradient>' +
      '<linearGradient id="' + b + '" gradientUnits="userSpaceOnUse" x1="0" y1="0" x2="280" y2="0"><stop offset="0" stop-color="#9fe8ff" stop-opacity=".95"/><stop offset="1" stop-color="#5ee7ff" stop-opacity="0"/></linearGradient></defs>';
    out += '<g transform="translate(262 152) rotate(202) scale(.9)">' +
      '<path d="M0 -9 C90 -20 170 -8 245 26 C170 12 90 20 0 9 Z" fill="url(#' + a + ')"/>' +
      '<path d="M0 -5 C100 -7 200 -9 282 -15 L282 -7 C200 -3 100 5 0 5 Z" fill="url(#' + b + ')"/>' +
      '<path d="M10 -2 L200 -6" stroke="#fff" stroke-opacity=".45" stroke-width="1.2"/><path d="M10 3 L170 9" stroke="#fff" stroke-opacity=".3" stroke-width="1"/>' +
      '</g>';
    out += '<circle cx="262" cy="152" r="38" fill="' + g.ref + '"/><circle cx="262" cy="152" r="11" fill="#e8fbff"/><circle cx="262" cy="152" r="6.5" fill="#fff"/>';
    return H.svg(360, 240, out, "a comet with a glowing head and a long tail streaming away");
  });

  A.register("asteroid", function (s, H) {
    var out = H.space(360, 240, 101, 55), rand = H.rng(17), n = 15, pts = [], mids = [], i, a, r, id = H.uid("as"), cl = H.uid("ac"), d, p, m;
    var cr = [[150, 100, 17, 11], [208, 132, 20, 13], [172, 148, 9, 6], [222, 98, 8, 6], [128, 130, 8, 6], [196, 108, 5, 4], [160, 78, 6, 4]];
    for (i = 0; i < n; i += 1) {
      a = i / n * Math.PI * 2; r = 0.76 + rand() * 0.3;
      pts.push([180 + 76 * r * Math.cos(a), 120 + 54 * r * Math.sin(a)]);
    }
    for (i = 0; i < n; i += 1) { p = pts[i]; m = pts[(i + 1) % n]; mids.push([(p[0] + m[0]) / 2, (p[1] + m[1]) / 2]); }
    d = "M" + f(mids[0][0]) + " " + f(mids[0][1]);
    for (i = 1; i <= n; i += 1) { d += " Q" + f(pts[i % n][0]) + " " + f(pts[i % n][1]) + " " + f(mids[i % n][0]) + " " + f(mids[i % n][1]); }
    d += " Z";
    out += '<defs><radialGradient id="' + id + '" cx=".34" cy=".3" r=".85"><stop offset="0" stop-color="#c2b5a6"/><stop offset=".5" stop-color="#8d7e6f"/><stop offset="1" stop-color="#3f352e"/></radialGradient><clipPath id="' + cl + '"><path d="' + d + '"/></clipPath></defs>';
    out += '<g transform="translate(180 120) scale(1.22) translate(-180 -120)"><path d="' + d + '" fill="url(#' + id + ')"/><g clip-path="url(#' + cl + ')">';
    for (i = 0; i < cr.length; i += 1) {
      out += '<ellipse cx="' + cr[i][0] + '" cy="' + cr[i][1] + '" rx="' + cr[i][2] + '" ry="' + cr[i][3] + '" fill="#5a4e44" opacity=".85"/>' +
        '<path d="M' + (cr[i][0] - cr[i][2]) + ' ' + cr[i][1] + ' A' + cr[i][2] + ' ' + cr[i][3] + ' 0 0 0 ' + (cr[i][0] + cr[i][2]) + ' ' + cr[i][1] + '" fill="none" stroke="#b9ab9b" stroke-width="1.6" opacity=".7"/>' +
        '<ellipse cx="' + (cr[i][0] + 1.5) + '" cy="' + (cr[i][1] + 1.5) + '" rx="' + f(cr[i][2] * 0.65) + '" ry="' + f(cr[i][3] * 0.6) + '" fill="#3f352e" opacity=".55"/>';
    }
    for (i = 0; i < 40; i += 1) { out += '<circle cx="' + f(110 + rand() * 140) + '" cy="' + f(75 + rand() * 90) + '" r="' + f(0.6 + rand() * 1.2) + '" fill="#5f5348" opacity=".6"/>'; }
    out += '</g></g><circle cx="288" cy="52" r="3" fill="#8d7e6f"/><circle cx="92" cy="176" r="2.4" fill="#7a6c5f"/><circle cx="286" cy="176" r="1.8" fill="#8d7e6f"/>';
    return H.svg(360, 240, out, "a gray-brown lumpy rock with craters floating in space");
  });

  A.register("meteor", function (s, H) {
    var out = H.space(360, 240, 111, 70), a = H.uid("mt"), g = H.glow("#fff3c8", "#ffffff", 0);
    out += '<defs>' + g.def + '<linearGradient id="' + a + '" gradientUnits="userSpaceOnUse" x1="0" y1="0" x2="-230" y2="0"><stop offset="0" stop-color="#fff" stop-opacity="1"/><stop offset=".5" stop-color="#ffe7a8" stop-opacity=".5"/><stop offset="1" stop-color="#ffd166" stop-opacity="0"/></linearGradient></defs>';
    out += '<g transform="translate(278 164) rotate(28)">' +
      '<path d="M0 -7 L-190 0 L0 7 Z" fill="url(#' + a + ')" opacity=".35"/><path d="M0 -2.4 L-230 0 L0 2.4 Z" fill="url(#' + a + ')"/>' +
      '<circle r="14" fill="' + g.ref + '"/><circle r="3.4" fill="#fff"/>' +
      '<circle cx="-34" cy="-5" r="1.4" fill="#ffe7a8"/><circle cx="-70" cy="4" r="1.2" fill="#ffe7a8" opacity=".8"/><circle cx="-110" cy="-3" r="1" fill="#ffe7a8" opacity=".6"/></g>';
    return H.svg(360, 240, out, "a thin bright streak of light across a dark sky");
  });

  /* ---------- orbit diagrams ---------- */
  function ring(cx, cy, r, color, dash, w, op) {
    return '<circle cx="' + f(cx) + '" cy="' + f(cy) + '" r="' + f(r) + '" fill="none" stroke="' + color + '" stroke-width="' + (w || 1.6) + '"' +
      (dash ? ' stroke-dasharray="' + dash + '"' : "") + (op ? ' stroke-opacity="' + op + '"' : "") + '/>';
  }
  A.register("comet-orbit", function (s, H) {
    var kind = s.kind || s.arg || "comet", dflt = { comet: "Borrelly", asteroid: "Ceres", moon: "Moon", planet: "Planet" }, label = s.label || dflt[kind] || "Borrelly";
    var out = H.space(360, 240, 121, 34), sx, sy = 120, ea, ex, ey, ob = "#ffd166", tg, aa, ax, ay, ma, pa, px, py;
    if (kind === "comet") {
      sx = 294; ea = 100 * Math.PI / 180; ex = sx + 33 * Math.cos(ea); ey = sy + 33 * Math.sin(ea);
      tg = H.uid("ctl");
      out += '<ellipse cx="154" cy="120" rx="141" ry="16" fill="none" stroke="' + ob + '" stroke-opacity=".25" stroke-width="7"/>' +
        '<ellipse cx="154" cy="120" rx="141" ry="16" fill="none" stroke="' + ob + '" stroke-width="1.9" stroke-dasharray="7 4"/>' +
        ring(sx, sy, 33, C.cyan, "4 3", 1.8) + sunMk(H, sx, sy, 7) +
        '<defs><linearGradient id="' + tg + '" gradientUnits="userSpaceOnUse" x1="0" y1="0" x2="46" y2="0"><stop offset="0" stop-color="#bff3ff" stop-opacity=".95"/><stop offset="1" stop-color="#5ee7ff" stop-opacity="0"/></linearGradient></defs>' +
        '<g transform="translate(70 133) rotate(184)"><path d="M0 -3.5 L46 -1 L46 1 L0 3.5 Z" fill="url(#' + tg + ')"/></g>' +
        '<circle cx="70" cy="133" r="8" fill="#bff3ff" opacity=".35"/><circle cx="70" cy="133" r="3.8" fill="#fff"/>' +
        tx(70, 162, label, 15, ob, "middle", 700);
      out += ball(H, ex, ey, 4.6, "#3f87e8") + tx(ex, ey + 19, "Earth", 13, C.cyan, "middle", 700) + tx(sx, sy - 34, "Sun", 13, C.ink, "middle", 700);
    } else if (kind === "asteroid") {
      sx = 200; ea = -120 * Math.PI / 180; ex = sx + 36 * Math.cos(ea); ey = sy + 36 * Math.sin(ea);
      aa = 38 * Math.PI / 180; ax = sx + 96 * Math.cos(aa); ay = sy + 96 * Math.sin(aa);
      out += ring(sx, sy, 36, C.cyan, "4 3") + ring(sx, sy, 96, ob, "7 4", 1.9) + sunMk(H, sx, sy, 8) +
        ball(H, ex, ey, 4.6, "#3f87e8") + tx(ex - 8, ey - 7, "Earth", 13, C.cyan, "end", 700) + tx(sx, sy + 28, "Sun", 12, C.ink, "middle", 700) +
        ball(H, ax, ay, 5, "#9a8c7d") + tx(ax + 10, ay + 18, label, 15, ob, "start", 700);
    } else if (kind === "moon") {
      sx = 160; ex = sx + 72; ey = sy; ma = -55 * Math.PI / 180;
      out += ring(sx, sy, 72, C.cyan, "5 3") + sunMk(H, sx, sy, 9) + tx(sx, sy + 32, "Sun", 12, C.ink, "middle", 700) +
        tx(sx, 40, "Earth's orbit", 13, C.cyan, "middle", 700) +
        ring(ex, ey, 20, "#eef2ff", "", 1.5) + ball(H, ex, ey, 6, "#3f87e8") + ball(H, ex + 20 * Math.cos(ma), ey + 20 * Math.sin(ma), 3.4, "#d4d4d8") +
        tx(ex + 20 * Math.cos(ma) + 8, ey + 20 * Math.sin(ma) - 4, label, 15, ob, "start", 700) + tx(ex, ey + 40, "Earth", 13, C.cyan, "middle", 700);
    } else {
      sx = 190; ea = -125 * Math.PI / 180; ex = sx + 36 * Math.cos(ea); ey = sy + 36 * Math.sin(ea);
      pa = 25 * Math.PI / 180; px = sx + 76 * Math.cos(pa); py = sy + 76 * Math.sin(pa);
      out += ring(sx, sy, 36, C.cyan, "4 3") + ring(sx, sy, 76, ob, "7 4", 1.9) + sunMk(H, sx, sy, 8) +
        ball(H, ex, ey, 4.6, "#3f87e8") + tx(ex - 8, ey - 7, "Earth", 13, C.cyan, "end", 700) + tx(sx, sy + 28, "Sun", 12, C.ink, "middle", 700) +
        ball(H, px, py, 7, "#d0562f") + tx(px + 12, py + 20, label, 15, ob, "start", 700);
    }
    out += tx(10, 230, "not to scale", 11, C.dim, "start");
    return H.svg(360, 240, out, kind === "comet" ? "top-down map: a very long thin oval orbit crossing Earth's small round orbit near the Sun" :
      kind === "asteroid" ? "top-down map: a nearly round orbit larger than Earth's around the Sun" :
      kind === "moon" ? "top-down map: a small ring around Earth, which circles the Sun" : "top-down map: a round orbit larger than Earth's around the Sun");
  });

  A.register("orbit-race", function (s, H) {
    var cx = 118, cy = 104, set = [[20, 3, "Mercury", "#b5afa5", 40], [42, 8, "Earth", "#3f87e8", 200], [68, 24, "Jupiter", "#d9b48a", 310], [95, 60, "Neptune", "#3b5fe0", 120]], i, d, out = H.space(360, 240, 131, 30), ly;
    for (i = 0; i < set.length; i += 1) { out += ring(cx, cy, set[i][0], "#9fb0f0", "", 1.2, ".45"); }
    out += sunMk(H, cx, cy, 8);
    for (i = 0; i < set.length; i += 1) {
      d = set[i];
      out += '<g transform="rotate(' + d[4] + ' ' + cx + ' ' + cy + ')"><g class="anim"><animateTransform attributeName="transform" type="rotate" from="0 ' + cx + ' ' + cy + '" to="360 ' + cx + ' ' + cy + '" dur="' + d[1] + 's" repeatCount="indefinite"/>' +
        ball(H, cx + d[0], cy, i === 2 ? 6 : 4.6, d[3]) + '</g></g>';
      ly = 52 + i * 30;
      out += '<circle cx="250" cy="' + (ly - 5) + '" r="6" fill="' + d[3] + '"/>' + tx(264, ly, d[2], 15, C.ink, "start", 700);
    }
    out += tx(180, 218, "inner planets finish a trip faster", 14, C.gold, "middle", 700) + tx(180, 234, "sizes and distances not to scale", 11, C.dim, "middle");
    return H.svg(360, 240, out, "four planets circling the Sun on rings; the closest circles fastest");
  });

  A.register("orbit-times", function (s, H) {
    var rows = [["Mercury", "88 days", 52, "#b5afa5"], ["Earth", "1 year", 92, "#3f87e8"], ["Jupiter", "about 12 years", 190, "#d9b48a"], ["Neptune", "about 165 years", 320, "#3b5fe0"]], out = H.space(360, 240, 141, 24), i, y;
    out += tx(16, 22, "Time to go once around the Sun", 14, C.gold, "start", 700);
    for (i = 0; i < rows.length; i += 1) {
      y = 38 + i * 45;
      out += tx(16, y + 11, rows[i][0], 14, C.ink, "start", 700) + tx(344, y + 11, rows[i][1], 14, C.dim, "end", 700) +
        '<rect x="16" y="' + (y + 17) + '" width="328" height="12" rx="6" fill="#1b2459"/><rect x="16" y="' + (y + 17) + '" width="' + rows[i][2] + '" height="12" rx="6" fill="' + rows[i][3] + '"/>';
    }
    out += tx(180, 230, "(bars not to scale)", 12, C.dim, "middle");
    return H.svg(360, 240, out, "bars showing the farther planets take longer to go around the Sun");
  });

  /* ---------- models ---------- */
  A.register("orrery", function (s, H) {
    var out = H.space(360, 240, 151, 36), w = H.uid("wd"), arms, i, g = H.glow("#fff0a8", "#ffffff", 0);
    out += '<defs><linearGradient id="' + w + '" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#c58c58"/><stop offset="1" stop-color="#7a4c2a"/></linearGradient>' + g.def + '</defs>';
    out += '<ellipse cx="190" cy="214" rx="152" ry="19" fill="#4a2d17"/><ellipse cx="190" cy="205" rx="152" ry="19" fill="url(#' + w + ')"/><ellipse cx="190" cy="205" rx="130" ry="14" fill="none" stroke="#e0b383" stroke-opacity=".4"/>';
    out += '<rect x="186" y="100" width="8" height="100" rx="3" fill="#b9bfd6"/><rect x="182" y="194" width="16" height="8" rx="3" fill="#8f96b4"/>';
    arms = [[190, 150, 112, 134], [190, 166, 276, 150], [190, 178, 52, 170], [190, 186, 322, 186]];
    for (i = 0; i < arms.length; i += 1) {
      out += '<line x1="' + arms[i][0] + '" y1="' + arms[i][1] + '" x2="' + arms[i][2] + '" y2="' + arms[i][3] + '" stroke="#cfd3e6" stroke-width="2.4" stroke-linecap="round"/><circle cx="190" cy="' + arms[i][1] + '" r="4" fill="#8f96b4"/>';
    }
    out += '<rect x="181" y="98" width="18" height="7" rx="2" fill="#5b6288"/><circle cx="190" cy="85" r="26" fill="' + g.ref + '" opacity=".7"/>' + ball(H, 190, 86, 14, "#ffd84d") +
      ball(H, 112, 134, 6, "#b5afa5") + ball(H, 276, 150, 9, "#3f87e8") + '<path d="M270 146 Q276 142 281 148 Q277 152 272 153Z" fill="#4caf50" opacity=".85"/>' + ball(H, 52, 170, 12, "#d9b48a") +
      '<ellipse cx="322" cy="186" rx="19" ry="5.5" fill="none" stroke="#c8b685" stroke-width="2.4" transform="rotate(-16 322 186)" opacity=".7"/>' + ball(H, 322, 186, 9, "#ead9a2") +
      '<path d="M303 189 A19 5.5 0 0 0 341 183" fill="none" stroke="#e2d2a0" stroke-width="2.4" transform="rotate(-16 322 186)" opacity=".95"/>';
    out += tx(14, 30, "a model", 20, C.gold, "start", 700) + tx(14, 49, "shows how it works", 13, C.dim, "start") +
      '<path d="M40 58 Q56 104 102 124" fill="none" stroke="' + C.gold + '" stroke-width="2" stroke-linecap="round" stroke-dasharray="1 5"/><polygon points="108,126 96,127 100,117" fill="' + C.gold + '"/>';
    return H.svg(360, 240, out, "a table-top model of the solar system with ball planets on rods around a lamp Sun");
  });

  A.register("model-vs-real", function (s, H) {
    var out = H.space(360, 240, 161, 22), cl = H.uid("mr"), skin = "#f2c9a5", i, r = [58, 92, 134, 182, 236], pa = [200, 300, 60, 150, 250];
    out += '<defs><clipPath id="' + cl + '"><rect x="172" y="14" width="176" height="176" rx="14"/></clipPath></defs>';
    out += '<rect x="12" y="14" width="150" height="176" rx="14" fill="#141b45"/><rect x="172" y="14" width="176" height="176" rx="14" fill="#10173b"/>';
    out += '<g clip-path="url(#' + cl + ')" opacity=".9">';
    for (i = 0; i < r.length; i += 1) {
      out += ring(340, 102, r[i], "#9fb0f0", "", 1.5, ".45");
      out += '<circle cx="' + f(340 + r[i] * Math.cos(pa[i] * Math.PI / 180)) + '" cy="' + f(102 + r[i] * Math.sin(pa[i] * Math.PI / 180)) + '" r="' + (3 + i) + '" fill="' + ["#b5afa5", "#3f87e8", "#d0562f", "#d9b48a", "#ead9a2"][i] + '" opacity=".85"/>';
    }
    out += sunMk(H, 340, 102, 20) + '</g>';
    out += '<rect x="80" y="144" width="14" height="46" rx="4" fill="#8a5a33"/><ellipse cx="87" cy="144" rx="44" ry="9" fill="#a8723f"/><rect x="85" y="60" width="4" height="84" fill="#b9bfd6"/>' +
      '<line x1="87" y1="96" x2="42" y2="84" stroke="#cfd3e6" stroke-width="2" stroke-linecap="round"/><line x1="87" y1="118" x2="134" y2="108" stroke="#cfd3e6" stroke-width="2" stroke-linecap="round"/>' +
      sunMk(H, 87, 50, 9) + ball(H, 42, 84, 6, "#b5afa5") + ball(H, 134, 108, 8, "#3f87e8");
    out += '<rect x="68" y="152" width="38" height="10" rx="5" fill="' + skin + '"/><rect x="68" y="163" width="38" height="10" rx="5" fill="' + mix(skin, "#000000", 0.06) + '"/><rect x="68" y="174" width="38" height="10" rx="5" fill="' + skin + '"/>' +
      '<path d="M70 150 C58 146 54 160 66 170 C70 172 74 166 72 160 Z" fill="' + mix(skin, "#000000", 0.14) + '"/>';
    out += tx(87, 210, "a model", 14, C.ink, "middle", 700) + tx(260, 210, "the real solar system", 14, C.ink, "middle", 700) +
      tx(260, 36, "much bigger", 12, C.dim, "middle") + tx(180, 232, "models are smaller, but show how things work", 12, C.gold, "middle", 700);
    return H.svg(360, 240, out, "a small hand-held model of the solar system next to the much bigger real solar system");
  });

  /* ---------- icons ---------- */
  function tile(H, inner, label) {
    var id = H.uid("tl");
    return H.svg(96, 96, '<defs><linearGradient id="' + id + '" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#232d6b"/><stop offset="1" stop-color="#0b1030"/></linearGradient></defs>' +
      '<rect width="96" height="96" rx="22" fill="url(#' + id + ')"/><rect x="1.5" y="1.5" width="93" height="93" rx="21" fill="none" stroke="#fff" stroke-opacity=".12"/>' + inner, label);
  }
  var ICONS = {
    "icon-star": function (H) {
      var g = H.glow("#ffd166", "#fff6c8", 0), id = H.uid("is");
      return '<defs>' + g.def + '<linearGradient id="' + id + '" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#fff0a0"/><stop offset="1" stop-color="#ffb703"/></linearGradient></defs>' +
        '<circle cx="48" cy="50" r="40" fill="' + g.ref + '" opacity=".5"/><polygon points="' + star5(48, 51, 31, 14, 0) + '" fill="url(#' + id + ')" stroke="#ffe9a0" stroke-width="2" stroke-linejoin="round"/>' +
        '<circle cx="18" cy="22" r="2" fill="#fff"/><circle cx="80" cy="30" r="1.6" fill="#fff"/><circle cx="76" cy="78" r="2" fill="#fff" opacity=".8"/>';
    },
    "icon-galaxy": function (H) { return galaxyMk(H, 48, 48, 34, -25, 0.75) + '<circle cx="14" cy="18" r="1.6" fill="#fff"/><circle cx="82" cy="76" r="1.6" fill="#fff"/>'; },
    "icon-planet": function (H) { return planetMk(H, "saturn", 48, 50, 17) + '<circle cx="15" cy="20" r="1.6" fill="#fff"/><circle cx="82" cy="24" r="1.6" fill="#fff"/><circle cx="20" cy="78" r="1.4" fill="#fff"/>'; },
    "icon-orbit": function (H) {
      return sunMk(H, 48, 48, 7) + '<ellipse cx="48" cy="48" rx="36" ry="14" fill="none" stroke="#5ee7ff" stroke-width="2" transform="rotate(-25 48 48)"/>' +
        '<ellipse cx="48" cy="48" rx="26" ry="10" fill="none" stroke="#ff6bd6" stroke-width="1.8" transform="rotate(35 48 48)"/>' +
        ball(H, 48 + 36 * Math.cos(-25 * Math.PI / 180) * 0.92, 48 + 36 * Math.sin(-25 * Math.PI / 180) * 0.92 - 4, 4.6, "#5ee7ff") + ball(H, 70, 59, 3.6, "#ff6bd6");
    },
    "icon-book": function () {
      return '<path d="M46 72 L46 30 Q32 22 11 27 L11 68 Q32 63 46 72 Z" fill="#f4f0e0"/><path d="M50 72 L50 30 Q64 22 85 27 L85 68 Q64 63 50 72 Z" fill="#e6dfc8"/>' +
        '<path d="M18 36 Q30 33 40 38 M18 45 Q30 42 40 47 M18 54 Q30 51 40 56 M58 38 Q68 33 78 36 M58 47 Q68 42 78 45" fill="none" stroke="#9aa0b8" stroke-width="2" stroke-linecap="round"/>' +
        '<circle cx="62" cy="58" r="15" fill="#5ee7ff" fill-opacity=".25" stroke="#ffd166" stroke-width="5"/><line x1="73" y1="69" x2="85" y2="82" stroke="#ffd166" stroke-width="7" stroke-linecap="round"/><path d="M54 52 Q57 48 62 48" fill="none" stroke="#fff" stroke-width="2.2" stroke-linecap="round" opacity=".8"/>';
    },
    "icon-trophy": function (H) {
      var id = H.uid("tg");
      return '<defs><linearGradient id="' + id + '" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#ffb703"/><stop offset=".5" stop-color="#fff0a0"/><stop offset="1" stop-color="#ffb703"/></linearGradient></defs>' +
        '<path d="M30 28 H18 C18 44 24 50 33 50 M66 28 H78 C78 44 72 50 63 50" fill="none" stroke="#ffc933" stroke-width="5" stroke-linecap="round"/>' +
        '<path d="M28 20 H68 V42 C68 56 59 63 48 63 C37 63 28 56 28 42 Z" fill="url(#' + id + ')"/><rect x="44" y="62" width="8" height="10" fill="#e09d00"/><rect x="31" y="72" width="34" height="9" rx="3" fill="#c98500"/>' +
        '<polygon points="' + star5(48, 41, 9, 4, 0) + '" fill="#fff" opacity=".9"/>';
    },
    "icon-rocket": function (H) { return '<g transform="translate(47 48) rotate(45) scale(.92)">' + rocketMk(H) + '</g><circle cx="16" cy="76" r="1.6" fill="#fff"/><circle cx="82" cy="18" r="1.6" fill="#fff"/><circle cx="20" cy="22" r="1.4" fill="#fff"/>'; },
    "icon-check": function (H) {
      var id = H.uid("ck");
      return '<defs><linearGradient id="' + id + '" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#7cf0b8"/><stop offset="1" stop-color="#26b574"/></linearGradient></defs>' +
        '<circle cx="48" cy="48" r="32" fill="url(#' + id + ')"/><path d="M32 49 L44 61 L66 37" fill="none" stroke="#fff" stroke-width="9" stroke-linecap="round" stroke-linejoin="round"/>';
    }
  };
  var ILABEL = { "icon-star": "a bright gold star", "icon-galaxy": "a spiral galaxy", "icon-planet": "a ringed planet", "icon-orbit": "planets on orbit rings", "icon-book": "an open book with a magnifying glass", "icon-trophy": "a gold trophy", "icon-rocket": "a rocket", "icon-check": "a green check mark" };
  Object.keys(ICONS).forEach(function (k) { A.register(k, function (s, H) { return tile(H, ICONS[k](H), ILABEL[k]); }); });

  /* ---------- hero ---------- */
  A.register("hero", function (s, H) {
    var out = H.space(640, 200, 171, 70, 18), rand = H.rng(23), i, x, y, ng = H.glow("#ff6bd6", "#ff9be6", 0), nb = H.glow("#5ee7ff", "#9bf0ff", 0);
    out += '<defs>' + ng.def + nb.def + '</defs><ellipse cx="300" cy="170" rx="210" ry="60" fill="' + nb.ref + '" opacity=".12"/><ellipse cx="560" cy="30" rx="150" ry="50" fill="' + ng.ref + '" opacity=".12"/>';
    for (i = 0; i < 18; i += 1) {
      x = 20 + rand() * 600; y = 10 + rand() * 180;
      out += '<circle class="anim" cx="' + f(x) + '" cy="' + f(y) + '" r="' + f(1 + rand() * 1.4) + '" fill="#fff"><animate attributeName="opacity" values=".25;1;.25" dur="' + f(2 + rand() * 3) + 's" begin="-' + f(rand() * 3) + 's" repeatCount="indefinite"/></circle>';
    }
    out += galaxyMk(H, 566, 62, 44, -22, 0.5);
    out += planetMk(H, "saturn", 440, 120, 38);
    out += '<path d="M40 150 Q90 142 128 128" fill="none" stroke="#ffd166" stroke-width="2.4" stroke-linecap="round" stroke-dasharray="1 8" opacity=".8"/>';
    out += '<g transform="translate(178 112) rotate(78) scale(1.15)">' + rocketMk(H) + '</g>';
    return H.svg(640, 200, out, "a small rocket flying toward a ringed planet, with a spiral galaxy far away");
  });

  /* ---------- page map ---------- */
  var REG = {
    topleft: [14, 9, 46, 9, "Top-left corner"], topright: [168, 9, 36, 9, "Top-right corner"], title: [20, 21, 132, 14, "Title"],
    heading: [20, 40, 92, 11, "Heading"], bold: [42, 61, 38, 9, "Bold word"], callout: [20, 94, 118, 26, "Callout box"],
    sidebar: [146, 40, 58, 80, "Sidebar box"], diagram: [20, 126, 184, 54, "Diagram"], caption: [20, 183, 130, 14, "Caption"],
    math: [20, 200, 120, 16, "Math or numbers"], bottom: [20, 222, 184, 26, "Bottom of page"]
  };
  A.register("page-map", function (s, H) {
    var region = s.region || s.arg || "heading", d = REG[region] || REG.heading, out, i, pad = 3;
    out = '<rect width="220" height="280" rx="14" fill="' + C.deep + '"/><rect x="10" y="6" width="200" height="246" rx="6" fill="#f7f3e6"/>';
    out += '<rect x="14" y="9" width="46" height="9" rx="2" fill="#cfc9b4"/><rect x="172" y="9" width="28" height="9" rx="2" fill="#cfc9b4"/>';
    out += '<rect x="20" y="21" width="132" height="14" rx="3" fill="#2b3566"/>';
    out += '<rect x="20" y="40" width="92" height="11" rx="2" fill="#3f87e8"/>';
    for (i = 0; i < 5; i += 1) { out += '<rect x="20" y="' + (57 + i * 7) + '" width="' + (i === 4 ? 78 : 118) + '" height="3.4" rx="1.7" fill="#cdc7b3"/>'; }
    out += '<rect x="46" y="63" width="30" height="5" rx="2" fill="#2b2f45"/>';
    out += '<rect x="20" y="94" width="118" height="26" rx="5" fill="#fff0c2" stroke="#e8b84a"/><circle cx="32" cy="107" r="6" fill="#ffd166"/><rect x="44" y="100" width="86" height="3.4" rx="1.7" fill="#b9a76b"/><rect x="44" y="108" width="70" height="3.4" rx="1.7" fill="#b9a76b"/>';
    out += '<rect x="146" y="40" width="58" height="80" rx="5" fill="#dff1ff" stroke="#7cb5e6"/><rect x="152" y="46" width="34" height="6" rx="2" fill="#5a9bd0"/>';
    for (i = 0; i < 6; i += 1) { out += '<rect x="152" y="' + (58 + i * 9) + '" width="46" height="3.4" rx="1.7" fill="#9ec3e0"/>'; }
    out += '<rect x="20" y="126" width="184" height="54" rx="5" fill="#0f1640"/><circle cx="60" cy="153" r="11" fill="#ffd84d"/><ellipse cx="60" cy="153" rx="32" ry="14" fill="none" stroke="#9fb0f0" stroke-opacity=".6"/><circle cx="90" cy="156" r="4" fill="#3f87e8"/><circle cx="150" cy="150" r="10" fill="#d9b48a"/><ellipse cx="150" cy="150" rx="19" ry="4.5" fill="none" stroke="#e2d2a0" stroke-width="2" transform="rotate(-14 150 150)"/><circle cx="182" cy="136" r="1.4" fill="#fff"/><circle cx="120" cy="170" r="1.4" fill="#fff"/><circle cx="195" cy="168" r="1.4" fill="#fff"/>';
    out += '<rect x="20" y="185" width="126" height="3.4" rx="1.7" fill="#8a8575"/><rect x="20" y="191" width="92" height="3.4" rx="1.7" fill="#8a8575"/>';
    out += tx(22, 213, "3,300 ÷ 150 = 22", 12, "#2b2f45", "start", 700);
    out += '<rect x="20" y="222" width="184" height="26" rx="5" fill="#ece6d2" stroke="#cfc9b4"/><rect x="28" y="229" width="150" height="3.4" rx="1.7" fill="#a9a38c"/><rect x="28" y="238" width="110" height="3.4" rx="1.7" fill="#a9a38c"/>';
    out += '<rect x="' + (d[0] - pad) + '" y="' + (d[1] - pad) + '" width="' + (d[2] + pad * 2) + '" height="' + (d[3] + pad * 2) + '" rx="6" fill="none" stroke="#ffd166" stroke-opacity=".5" stroke-width="8"/>' +
      '<rect x="' + (d[0] - pad) + '" y="' + (d[1] - pad) + '" width="' + (d[2] + pad * 2) + '" height="' + (d[3] + pad * 2) + '" rx="6" fill="none" stroke="#e59a00" stroke-width="3"/>';
    out += '<rect x="30" y="257" width="160" height="19" rx="9.5" fill="#ffd166"/>' + tx(110, 271, d[4], 13, "#2b2f45", "middle", 700);
    return H.svg(220, 280, out, "a textbook page with the " + d[4].toLowerCase() + " outlined in gold");
  });
}());

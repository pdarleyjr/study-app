/* Cosmic Quest - galaxy pictures. Every galaxy is drawn procedurally with a seeded rng so pictures are stable. */
(function () {
  var H = SG_ART.H, C = H.C, PI = Math.PI, TAU = PI * 2;

  function n1(v) { return String(Math.round(v * 10) / 10); }
  function gauss(rand) { return (rand() + rand() + rand() + rand() - 2) * 1.15; }
  function clamp(v, a, b) { return v < a ? a : (v > b ? b : v); }

  /* gradient/def collector so each SVG owns unique ids */
  function mkDefs() {
    var d = { s: "", cache: {} };
    d.rg = function (stops) {
      var key = stops.join("|"), id, out, i, st;
      if (d.cache[key]) { return d.cache[key]; }
      id = H.uid("gg");
      out = '<radialGradient id="' + id + '">';
      for (i = 0; i < stops.length; i += 1) {
        st = stops[i];
        out += '<stop offset="' + st[0] + '" stop-color="' + st[1] + '" stop-opacity="' + st[2] + '"/>';
      }
      d.s += out + "</radialGradient>";
      d.cache[key] = "url(#" + id + ")";
      return d.cache[key];
    };
    return d;
  }

  var G_HALO = [[0, "#8fa8ff", 0.3], [0.55, "#5b72e0", 0.12], [1, "#5b72e0", 0]];
  var G_BULGE = [[0, "#fffbe6", 1], [0.22, "#ffe2a0", 0.92], [0.55, "#f0b055", 0.42], [1, "#e8a24a", 0]];
  var G_PINK = [[0, "#ffffff", 0.95], [0.3, "#ff86dd", 0.8], [1, "#ff4fc0", 0]];
  var G_BAR = [[0, "#fff3c8", 1], [0.4, "#ffd078", 0.85], [0.8, "#d99a45", 0.35], [1, "#d99a45", 0]];
  var G_ELL = [[0, "#fff3d2", 1], [0.15, "#ffd790", 0.95], [0.4, "#eaa04a", 0.65], [0.7, "#b4672e", 0.25], [1, "#7a3f1e", 0]];
  var G_IRR = [[0, "#e4ecff", 0.85], [0.5, "#9bb0f0", 0.38], [1, "#7189d8", 0]];
  var G_SOFTBLUE = [[0, "#dfe9ff", 0.6], [0.5, "#9cb4ff", 0.25], [1, "#7f9cff", 0]];
  var G_GOLD = [[0, "#ffffff", 0.95], [0.3, "#ffd166", 0.8], [1, "#ffb347", 0]];
  var G_FIRE = [[0, "#ffffff", 1], [0.25, "#ffd24d", 0.9], [0.6, "#ff6a2b", 0.5], [1, "#ff3b1f", 0]];

  function blob(D, x, y, r, stops, op) {
    return '<circle cx="' + n1(x) + '" cy="' + n1(y) + '" r="' + n1(r) + '" fill="' + D.rg(stops) + '"' +
      (op != null && op < 1 ? ' opacity="' + op + '"' : "") + "/>";
  }
  function dot(x, y, r) { return '<circle cx="' + n1(x) + '" cy="' + n1(y) + '" r="' + n1(r) + '"/>'; }

  /* ---------- galaxy bodies, drawn around (0,0) ---------- */

  function spiralBody(D, rand, R, bar, lite, dots) {
    var s = "", a, i, k, t, p, p2, tx, ty, len, off, x, y, rr, d, steps, sc = Math.max(0.5, R / 100);
    var r0 = bar ? 0.5 : 0.13, sweep = bar ? 3.2 : 5.3;
    var wh = "", bl = "", pk = "";
    function pos(arm, tt) {
      var rad = bar ? R * (r0 + (1 - r0) * Math.pow(tt, 0.85)) : R * r0 * Math.exp(Math.log(1 / r0) * tt);
      var th = arm * PI + tt * sweep;
      return [Math.cos(th) * rad, Math.sin(th) * rad];
    }
    s += blob(D, 0, 0, R * 1.1, G_HALO);
    /* arm glow strokes (3 layers) */
    steps = lite ? 14 : 26;
    var widths = lite ? [0.34, 0.2, 0.09] : [0.36, 0.22, 0.12, 0.05];
    var ops = lite ? [0.1, 0.2, 0.36] : [0.07, 0.1, 0.16, 0.32], cols = lite ? ["#5b7cff", "#8fb0ff", "#d6e4ff"] : ["#4f6be0", "#6f8cf5", "#a9c1ff", "#e4edff"];
    for (k = 0; k < widths.length; k += 1) {
      d = "";
      for (a = 0; a < 2; a += 1) {
        for (i = 0; i <= steps; i += 1) {
          t = (bar ? 0 : 0.05) + (i / steps) * (bar ? 1 : 0.95);
          p = pos(a, t);
          d += (i === 0 ? "M" : "L") + n1(p[0]) + " " + n1(p[1]);
        }
      }
      s += '<path d="' + d + '" fill="none" stroke="' + cols[k] + '" stroke-width="' + n1(widths[k] * R) + '" opacity="' + ops[k] +
        '" stroke-linecap="round" stroke-linejoin="round"/>';
    }
    /* soft glow blobs along arms */
    for (a = 0; a < 2; a += 1) {
      for (i = 0; i < (lite ? 5 : 22); i += 1) {
        t = (bar ? 0.05 : 0.12) + (i / (lite ? 5 : 22)) * 0.88;
        p = pos(a, t);
        s += blob(D, p[0], p[1], R * (0.11 + 0.08 * t), G_SOFTBLUE, 0.6);
      }
    }
    /* tiny stars along the arms */
    if (!lite) {
      for (a = 0; a < 2; a += 1) {
        for (i = 0; i < dots; i += 1) {
          t = 0.03 + rand() * 0.97;
          p = pos(a, t); p2 = pos(a, Math.min(1, t + 0.012));
          tx = p2[0] - p[0]; ty = p2[1] - p[1]; len = Math.sqrt(tx * tx + ty * ty) || 1;
          off = gauss(rand) * R * (0.035 + 0.07 * t);
          x = p[0] - (ty / len) * off; y = p[1] + (tx / len) * off;
          rr = (0.5 + rand() * 0.9) * sc;
          k = rand();
          if (k < 0.55) { wh += dot(x, y, rr); } else if (k < 0.9) { bl += dot(x, y, rr); } else { pk += dot(x, y, rr); }
        }
      }
      s += '<g fill="#eef4ff">' + wh + '</g><g fill="#9fbaff">' + bl + '</g><g fill="#ffb3e6">' + pk + "</g>";
      /* older yellow stars between the arms */
      d = "";
      for (i = 0; i < 90; i += 1) {
        rr = R * 0.85 * Math.pow(rand(), 0.9); t = rand() * TAU;
        d += dot(Math.cos(t) * rr, Math.sin(t) * rr, (0.5 + rand() * 0.6) * sc);
      }
      s += '<g fill="#ffe2b0" opacity="0.5">' + d + "</g>";
    }
    /* pink star-forming spots */
    for (a = 0; a < 2; a += 1) {
      for (i = 0; i < (lite ? 3 : 8); i += 1) {
        t = 0.3 + 0.7 * rand();
        p = pos(a, t);
        s += blob(D, p[0] + gauss(rand) * R * 0.02, p[1] + gauss(rand) * R * 0.02, R * (0.035 + rand() * 0.035) * (lite ? 1.5 : 1), G_PINK, 0.9);
      }
    }
    if (bar) {
      s += '<g transform="scale(1 0.2)">' + blob(D, 0, 0, R * 0.68, G_BAR) + "</g>";
      s += '<g transform="scale(1 0.1)">' + blob(D, 0, 0, R * 0.5, G_BAR) + "</g>";
      if (!lite) {
        d = "";
        for (i = 0; i < 70; i += 1) { d += dot(clamp(gauss(rand) * R * 0.22, -R * 0.52, R * 0.52), gauss(rand) * R * 0.025, (0.5 + rand() * 0.6) * sc); }
        s += '<g fill="#fff0c4" opacity="0.8">' + d + "</g>";
      }
      s += blob(D, 0, 0, R * 0.24, G_BULGE);
    } else {
      s += blob(D, 0, 0, R * 0.4, G_BULGE);
      s += blob(D, 0, 0, R * 0.13, [[0, "#ffffff", 1], [1, "#fff2c0", 0]]);
    }
    return s;
  }

  function ellipticalBody(D, rand, R, ratio, lite) {
    var s = '<g transform="rotate(-25) scale(1 ' + ratio + ')">', i, rr, th, d = "", sc = Math.max(0.5, R / 100);
    s += blob(D, 0, 0, R, G_ELL);
    s += blob(D, 0, 0, R * 0.33, [[0, "#ffffff", 1], [0.5, "#fff0c0", 0.7], [1, "#ffd790", 0]]);
    if (!lite) {
      for (i = 0; i < 240; i += 1) {
        rr = Math.abs(gauss(rand)) * R * 0.4; th = rand() * TAU;
        if (rr < R * 0.95) { d += dot(Math.cos(th) * rr, Math.sin(th) * rr, (0.5 + rand() * 0.6) * sc); }
      }
      s += '<g fill="#ffe6bb" opacity="0.75">' + d + "</g>";
    }
    return s + "</g>";
  }

  /* lumpy irregular cloud; o.burst = pink knots, o.n = lumps, o.spread, o.cores (merger nuclei) */
  function irregularBody(D, rand, R, lite, o) {
    var s = "", lumps = [], i, j, L, x, y, r, d1 = "", d2 = "", sc = Math.max(0.5, R / 100);
    for (i = 0; i < o.n; i += 1) {
      lumps.push({ x: (rand() - 0.5) * 2 * R * o.spread * 1.05, y: (rand() - 0.5) * 2 * R * o.spread * 0.85, r: R * (0.14 + rand() * 0.2) });
    }
    s += blob(D, 0, 0, R * 0.85, G_IRR, 0.4);
    for (i = 0; i < lumps.length; i += 1) { L = lumps[i]; s += blob(D, L.x, L.y, L.r, G_IRR, 0.9); }
    if (o.cores) {
      s += blob(D, -R * 0.14, R * 0.03, R * 0.26, G_BULGE);
      s += blob(D, R * 0.15, -R * 0.04, R * 0.22, G_BULGE);
    } else {
      for (i = 0; i < 4; i += 1) { L = lumps[i]; s += blob(D, L.x, L.y, L.r * 0.45, [[0, "#ffffff", 0.8], [1, "#cfdcff", 0]]); }
    }
    if (!lite) {
      for (i = 0; i < 170; i += 1) {
        L = lumps[Math.floor(rand() * lumps.length)];
        x = L.x + gauss(rand) * L.r * 0.7; y = L.y + gauss(rand) * L.r * 0.7;
        r = (0.5 + rand() * 0.9) * sc;
        if (rand() < 0.6) { d1 += dot(x, y, r); } else { d2 += dot(x, y, r); }
      }
      s += '<g fill="#ffffff">' + d1 + '</g><g fill="#a9c0ff">' + d2 + "</g>";
    }
    for (j = 0; j < o.burst; j += 1) {
      L = lumps[Math.floor(rand() * lumps.length)];
      x = L.x + gauss(rand) * L.r * 0.8; y = L.y + gauss(rand) * L.r * 0.8;
      s += blob(D, x, y, R * (0.04 + rand() * 0.05), G_PINK, 0.95);
    }
    return s;
  }

  function drawGalaxy(D, kind, cx, cy, R, seed, o) {
    o = o || {};
    var rand = H.rng(seed), body, lite = !!o.lite, dots = o.dots == null ? 210 : o.dots;
    if (kind === "spiral") { body = spiralBody(D, rand, R, false, lite, dots); }
    else if (kind === "barred") { body = spiralBody(D, rand, R, true, lite, dots); }
    else if (kind === "elliptical") { body = ellipticalBody(D, rand, R, o.ratio || (o.flat ? 0.5 : 0.92), lite); }
    else if (kind === "merged") { body = irregularBody(D, rand, R, lite, { n: 20, burst: lite ? 7 : 16, spread: 0.62, cores: true }); }
    else { body = irregularBody(D, rand, R, lite, { n: 17, burst: lite ? 4 : 9, spread: 0.72, cores: false }); }
    return '<g transform="translate(' + n1(cx) + " " + n1(cy) + ") rotate(" + (o.rot || 0) + ") scale(1 " + (o.tilt == null ? 1 : o.tilt) + ')">' + body + "</g>";
  }

  /* soft glowing stroke (used for tidal tails) */
  function glowPath(d, w) {
    w *= 1.6;
    return '<path d="' + d + '" fill="none" stroke="#5b7cff" stroke-width="' + n1(w * 2.2) + '" opacity="0.1" stroke-linecap="round"/>' +
      '<path d="' + d + '" fill="none" stroke="#8fb0ff" stroke-width="' + n1(w * 1.2) + '" opacity="0.22" stroke-linecap="round"/>' +
      '<path d="' + d + '" fill="none" stroke="#d6e4ff" stroke-width="' + n1(w * 0.5) + '" opacity="0.4" stroke-linecap="round"/>';
  }

  function scene(w, h, seed, ns, D, inner, label) {
    return H.svg(w, h, "<defs>" + D.s + "</defs>" + H.space(w, h, seed, ns) + inner, label);
  }

  function arrow(x1, y1, x2, y2, col, sw) {
    var a = Math.atan2(y2 - y1, x2 - x1), hs = sw * 3.2, bx = x2 - Math.cos(a) * hs, by = y2 - Math.sin(a) * hs;
    return '<line x1="' + n1(x1) + '" y1="' + n1(y1) + '" x2="' + n1(bx) + '" y2="' + n1(by) + '" stroke="' + col + '" stroke-width="' + n1(sw) + '" stroke-linecap="round"/>' +
      '<polygon points="' + n1(x2) + "," + n1(y2) + " " + n1(bx + Math.cos(a + 1.6) * hs * 0.8) + "," + n1(by + Math.sin(a + 1.6) * hs * 0.8) + " " +
      n1(bx + Math.cos(a - 1.6) * hs * 0.8) + "," + n1(by + Math.sin(a - 1.6) * hs * 0.8) + '" fill="' + col + '"/>';
  }

  function sparkle(x, y, s, op) {
    return '<path d="M' + n1(x) + " " + n1(y - s) + "Q" + n1(x) + " " + n1(y) + " " + n1(x + s) + " " + n1(y) + "Q" + n1(x) + " " + n1(y) + " " + n1(x) + " " + n1(y + s) +
      "Q" + n1(x) + " " + n1(y) + " " + n1(x - s) + " " + n1(y) + "Q" + n1(x) + " " + n1(y) + " " + n1(x) + " " + n1(y - s) + 'Z" fill="#fff" opacity="' + op + '"/>';
  }

  /* registration helper (hoisted function declaration) */
  function reg(name, fn) { SG_ART.register(name, function (spec) { return fn(spec || {}, H); }); }

  /* ---------- the four galaxy types ---------- */

  reg("galaxy-spiral", function () {
    var D = mkDefs();
    return scene(360, 240, 3, 80, D, drawGalaxy(D, "spiral", 180, 120, 108, 11, { rot: -25 }),
      "A spiral galaxy like a pinwheel: a bright yellow center and two blue-white arms curling out");
  });

  reg("galaxy-barred", function () {
    var D = mkDefs();
    return scene(360, 240, 5, 80, D, drawGalaxy(D, "barred", 180, 120, 108, 23, { rot: -22 }),
      "A barred spiral galaxy: a bright straight bar through the center with two arms curling off the ends of the bar");
  });

  reg("galaxy-elliptical", function (spec) {
    var D = mkDefs(), flat = spec.flat === true || spec.flat === "true" || spec.arg === "flat";
    return scene(360, 240, 8, 80, D, drawGalaxy(D, "elliptical", 180, 120, flat ? 112 : 104, 31, { flat: flat }),
      flat ? "A flattened oval galaxy, smooth and yellow-orange, brightest at the center with no arms"
        : "A round galaxy, smooth and yellow-orange, brightest at the center and fading outward, with no arms");
  });

  reg("galaxy-irregular", function () {
    var D = mkDefs();
    return scene(360, 240, 13, 80, D, drawGalaxy(D, "irregular", 180, 118, 108, 47, { rot: 8 }),
      "An irregular galaxy: a lumpy blobby cloud with no pattern, pink star-forming knots and blue stars");
  });

  /* ---------- Milky Way from above ---------- */

  reg("milky-way-top", function (spec) {
    var D = mkDefs(), marker = !(spec.marker === false || spec.marker === "false");
    var cx = 160, cy = 126, R = 100, ang = 38 * PI / 180, dist = R * 0.66;
    var mx = cx + Math.cos(ang) * dist, my = cy + Math.sin(ang) * dist;
    var inner = drawGalaxy(D, "barred", cx, cy, R, 61, { rot: -22 });
    inner += '<text x="14" y="26" font-size="15" font-weight="700" font-family="inherit" fill="' + C.ink + '">Milky Way Galaxy</text>';
    if (marker) {
      inner += '<line x1="' + n1(mx) + '" y1="' + n1(my) + '" x2="262" y2="190" stroke="' + C.gold + '" stroke-width="1.4"/>';
      inner += blob(D, mx, my, 11, G_GOLD) + '<circle cx="' + n1(mx) + '" cy="' + n1(my) + '" r="3.6" fill="' + C.gold + '" stroke="#fff" stroke-width="1.2"/>';
      inner += '<text x="276" y="206" font-size="15" font-weight="700" font-family="inherit" text-anchor="middle" fill="' + C.gold + '">You are here</text>';
      inner += '<text x="276" y="223" font-size="11.5" font-family="inherit" text-anchor="middle" fill="' + C.ink + '">our Sun and planets</text>';
    }
    return scene(360, 240, 17, 70, D, inner,
      marker ? "The Milky Way seen from above as a barred spiral. A gold dot marked You are here sits about two thirds of the way out from the center, not at the middle"
        : "The Milky Way seen from above as a barred spiral galaxy");
  });

  /* ---------- how stars are spread in a round galaxy ---------- */

  reg("density", function (spec) {
    var kind = spec.kind || spec.arg || "center-dense", rand = H.rng(kind.length * 977 + 5), R = 80, c = 90, i, r, th, x, y, d = "", d2 = "", label, a, t;
    var id = H.uid("dn");
    function add(px, py, rr) { if (rand() < 0.8) { d += dot(px, py, rr); } else { d2 += dot(px, py, rr); } }
    if (kind === "even") {
      var sp = 7.4, row = 0;
      for (y = -R; y <= R; y += sp * 0.866) {
        for (x = -R + (row % 2 ? sp / 2 : 0); x <= R; x += sp) {
          var jx = x + (rand() - 0.5) * 3, jy = y + (rand() - 0.5) * 3;
          if (Math.sqrt(jx * jx + jy * jy) < R - 2) { add(c + jx, c + jy, 1.15); }
        }
        row += 1;
      }
      label = "Dots spread evenly across the whole circle, the same everywhere";
    } else if (kind === "ring") {
      for (i = 0; i < 400; i += 1) {
        r = clamp(R * (0.84 + gauss(rand) * 0.09), R * 0.62, R - 2); th = rand() * TAU;
        add(c + Math.cos(th) * r, c + Math.sin(th) * r, 1.15);
      }
      for (i = 0; i < 6; i += 1) { r = R * 0.5 * rand(); th = rand() * TAU; add(c + Math.cos(th) * r, c + Math.sin(th) * r, 1); }
      label = "Dots crowded in a ring near the outside edge with an empty middle";
    } else if (kind === "bands") {
      for (a = 0; a < 3; a += 1) {
        for (i = 0; i < 150; i += 1) {
          r = 12 + (R - 14) * Math.pow(rand(), 0.7); t = (r - 12) / (R - 14);
          th = a * TAU / 3 + t * 3.1 + gauss(rand) * 0.07;
          add(c + Math.cos(th) * r, c + Math.sin(th) * r, 1.15);
        }
      }
      for (i = 0; i < 25; i += 1) { r = R * Math.sqrt(rand()) * 0.95; th = rand() * TAU; add(c + Math.cos(th) * r, c + Math.sin(th) * r, 1); }
      label = "Dots arranged in curved bands like spiral arms with gaps between them";
    } else {
      for (i = 0; i < 620; i += 1) {
        r = R * Math.pow(rand(), 1.55) * 0.98; th = rand() * TAU;
        add(c + Math.cos(th) * r, c + Math.sin(th) * r, 0.95);
      }
      label = "Dots packed tightly at the center and thinning out steadily toward the edge";
    }
    var inner = '<defs><clipPath id="' + id + '"><circle cx="' + c + '" cy="' + c + '" r="' + R + '"/></clipPath></defs>' +
      '<rect width="180" height="180" rx="14" fill="' + C.navy + '"/>' +
      '<circle cx="' + c + '" cy="' + c + '" r="' + R + '" fill="#1a2358" opacity="0.55"/>' +
      '<g clip-path="url(#' + id + ')"><g fill="#ffe9b8">' + d + '</g><g fill="#cfe0ff">' + d2 + "</g></g>" +
      '<circle cx="' + c + '" cy="' + c + '" r="' + R + '" fill="none" stroke="#7f9cff" stroke-width="1.6" opacity="0.7"/>';
    return H.svg(180, 180, inner, label);
  });

  /* ---------- galaxy collisions ---------- */

  function collScene(D, step, W, Hh, lite, seed) {
    var rand = H.rng(seed), R = W * 0.15, cx = W / 2, cy = Hh / 2, s = "", i, sep, ax, ay, bx, by, sw = Math.max(1.1, W * 0.009), knots, tilt;
    if (step === 5) {
      s += drawGalaxy(D, "merged", cx, cy, W * 0.29, seed + 5, { lite: lite, rot: 15 });
      return s;
    }
    sep = [0.62, 0.42, 0.2, 0.09][step - 1] * W;
    ax = cx - sep / 2; bx = cx + sep / 2;
    ay = cy - Hh * (step === 4 ? 0.02 : 0.07); by = cy + Hh * (step === 4 ? 0.02 : 0.07);
    tilt = [0.92, 0.85, 0.72, 0.6][step - 1];
    if (step === 3) {
      s += glowPath("M" + n1(ax - R * 0.2) + " " + n1(ay - R * 0.9) + " Q" + n1(ax - R * 1.0) + " " + n1(ay - R * 1.9) + " " + n1(ax - R * 1.7) + " " + n1(ay - R * 1.5), R * 0.1);
      s += glowPath("M" + n1(bx + R * 0.2) + " " + n1(by + R * 0.9) + " Q" + n1(bx + R * 1.0) + " " + n1(by + R * 1.9) + " " + n1(bx + R * 1.7) + " " + n1(by + R * 1.5), R * 0.1);
    }
    if (step === 4) {
      s += glowPath("M" + n1(cx - R * 0.4) + " " + n1(cy - R * 0.6) + " C" + n1(cx - R * 0.6) + " " + n1(cy - R * 1.6) + " " + n1(cx - R * 1.6) + " " + n1(cy - R * 1.8) + " " + n1(cx - R * 2.2) + " " + n1(cy - R * 1.2), R * 0.1);
      s += glowPath("M" + n1(cx + R * 0.4) + " " + n1(cy + R * 0.6) + " C" + n1(cx + R * 0.6) + " " + n1(cy + R * 1.6) + " " + n1(cx + R * 1.6) + " " + n1(cy + R * 1.8) + " " + n1(cx + R * 2.2) + " " + n1(cy + R * 1.2), R * 0.1);
    }
    s += drawGalaxy(D, "spiral", ax, ay, R, seed + 1, { lite: lite, rot: -20 - step * 8, tilt: tilt, dots: 70 });
    s += drawGalaxy(D, "spiral", bx, by, R, seed + 2, { lite: lite, rot: 35 + step * 10, tilt: tilt, dots: 70 });
    if (step === 4) { s += blob(D, cx, cy, R * 0.55, G_BULGE, 0.8); }
    knots = [0, 0, 3, 7][step - 1];
    for (i = 0; i < knots; i += 1) {
      s += blob(D, cx + gauss(rand) * R * 0.4, cy + gauss(rand) * R * 0.3, R * (0.06 + rand() * 0.05), G_PINK, 0.95);
    }
    if (step <= 2) {
      var gap = sep - 2 * R * 1.05, len = step === 1 ? W * 0.11 : Math.max(W * 0.03, gap * 0.4), st = ax + R * 1.12;
      s += arrow(st, ay + (by - ay) * 0.15, st + len, ay + (by - ay) * 0.3, C.gold, sw);
      s += arrow(bx - R * 1.12, by - (by - ay) * 0.15, bx - R * 1.12 - len, by - (by - ay) * 0.3, C.gold, sw);
    }
    return s;
  }

  var COLL_LABELS = [
    "Two spiral galaxies far apart with gold arrows showing gravity pulling them toward each other",
    "Two spiral galaxies closer together, still pulled toward each other by gravity",
    "Two galaxies touching and overlapping, with long tails of stars stretched out and pink star-forming spots",
    "Two galaxies merging into one bright tangled mass with curving tails of stars",
    "One big lumpy irregular galaxy with pink starburst spots, left after the collision"
  ];
  var COLL_CAPS = ["far apart, gravity pulls", "getting closer", "touching, tails stretch out", "merging", "one big lumpy galaxy"];

  reg("collision", function (spec) {
    var step = clamp(parseInt(spec.step || spec.arg || 1, 10) || 1, 1, 5), D = mkDefs(), inner = collScene(D, step, 360, 240, false, 70);
    if (spec.label === true || spec.label === "true") {
      inner += '<circle cx="24" cy="24" r="13" fill="' + C.panel + '" stroke="' + C.gold + '" stroke-width="1.5"/><text x="24" y="29.5" font-size="16" font-weight="700" text-anchor="middle" font-family="inherit" fill="' + C.ink + '">' + step + "</text>";
      inner += '<text x="180" y="228" font-size="13" text-anchor="middle" font-family="inherit" fill="' + C.dim + '">' + H.esc(COLL_CAPS[step - 1]) + "</text>";
    }
    return scene(360, 240, 71, 80, D, inner, COLL_LABELS[step - 1]);
  });

  reg("collision-strip", function () {
    var D = mkDefs(), s = "", i, id, cw = 72, defs = "";
    for (i = 0; i < 5; i += 1) {
      id = H.uid("cs");
      defs += '<clipPath id="' + id + '"><rect x="' + (i * cw + 2) + '" y="3" width="' + (cw - 4) + '" height="84" rx="8"/></clipPath>';
      s += '<rect x="' + (i * cw + 2) + '" y="3" width="' + (cw - 4) + '" height="84" rx="8" fill="#ffffff" opacity="0.04"/>';
      s += '<g clip-path="url(#' + id + ')"><g transform="translate(' + (i * cw) + ' 3)">' + collScene(D, i + 1, cw, 84, true, 90 + i) + "</g></g>";
      s += '<circle cx="' + (i * cw + cw / 2) + '" cy="99" r="9" fill="' + C.panel + '" stroke="' + C.gold + '" stroke-width="1.3"/>' +
        '<text x="' + (i * cw + cw / 2) + '" y="104" font-size="13" font-weight="700" text-anchor="middle" font-family="inherit" fill="' + C.ink + '">' + (i + 1) + "</text>";
    }
    return H.svg(360, 110, "<defs>" + defs + D.s + "</defs>" + H.space(360, 110, 95, 40) + s,
      "Five small pictures in order: two galaxies far apart, closer, touching with tails, merging, and finally one big lumpy galaxy");
  });

  reg("collision-end", function (spec) {
    var kind = spec.kind || spec.arg || "merged", D = mkDefs(), inner = "", i, rand, label, x, y, a, k, th, rr, ctr;
    if (kind === "bounce") {
      var A = [80, 80], B = [280, 160], cc = [180, 120], f = [A, B];
      inner += drawGalaxy(D, "spiral", A[0], A[1], 46, 101, { rot: -25, dots: 70 }) + drawGalaxy(D, "spiral", B[0], B[1], 46, 102, { rot: 30, dots: 70 });
      for (i = 0; i < 2; i += 1) {
        inner += arrow(cc[0] + (f[i][0] - cc[0]) * 0.12, cc[1] + (f[i][1] - cc[1]) * 0.12, cc[0] + (f[i][0] - cc[0]) * 0.46, cc[1] + (f[i][1] - cc[1]) * 0.46, C.gold, 3);
      }
      label = "Two spiral galaxies that did not touch, flying away from each other, each still a neat spiral";
    } else if (kind === "vanish") {
      rand = H.rng(222);
      for (i = 0; i < 12; i += 1) {
        x = 20 + rand() * 320; y = 20 + rand() * 200;
        inner += blob(D, x, y, 12 + rand() * 10, [[0, "#ffffff", 0.5], [1, "#9fb4ff", 0]]) + sparkle(x, y, 4 + rand() * 7, (0.55 + rand() * 0.4).toFixed(2));
      }
      label = "Empty dark space with only a few sparkles; the galaxies have disappeared";
    } else if (kind === "stars-crash") {
      rand = H.rng(333);
      ctr = [[180, 120, 40], [86, 66, 26], [278, 74, 28], [118, 182, 26], [260, 178, 28], [48, 150, 20], [322, 140, 20]];
      for (i = 0; i < ctr.length; i += 1) {
        x = ctr[i][0]; y = ctr[i][1]; rr = ctr[i][2];
        inner += blob(D, x, y, rr, G_FIRE, 0.95);
        a = "";
        for (k = 0; k < 11; k += 1) {
          th = rand() * TAU;
          a += '<line x1="' + n1(x + Math.cos(th) * rr * 0.4) + '" y1="' + n1(y + Math.sin(th) * rr * 0.4) + '" x2="' + n1(x + Math.cos(th) * rr * (1 + rand() * 0.9)) + '" y2="' + n1(y + Math.sin(th) * rr * (1 + rand() * 0.9)) + '"/>';
        }
        inner += '<g stroke="#ffd9a0" stroke-width="1.3" stroke-linecap="round" opacity="0.85">' + a + "</g>";
        a = "";
        for (k = 0; k < 14; k += 1) {
          th = rand() * TAU;
          a += dot(x + Math.cos(th) * rr * (0.9 + rand() * 1.3), y + Math.sin(th) * rr * (0.9 + rand() * 1.3), 0.8 + rand() * 1.4);
        }
        inner += '<g fill="#ffb86b">' + a + "</g>";
      }
      label = "Many tiny stars smashing together in orange fireballs and flying sparks";
    } else {
      inner = collScene(D, 5, 360, 240, false, 70);
      label = "One big lumpy irregular galaxy with pink starburst spots, made when two galaxies merged";
    }
    return scene(360, 240, 103, 80, D, inner, label);
  });

  /* ---------- the Milky Way as seen from Earth ---------- */

  function tree(x, base, h, w) {
    var s = "", i, tw = w * 0.14, top, bot, hw;
    s += '<rect x="' + n1(x - tw / 2) + '" y="' + n1(base - h * 0.12) + '" width="' + n1(tw) + '" height="' + n1(h * 0.14) + '"/>';
    for (i = 0; i < 3; i += 1) {
      top = base - h + i * h * 0.22; bot = base - h * 0.12 - (2 - i) * h * 0.2; hw = w * (0.35 + i * 0.3);
      s += '<polygon points="' + n1(x) + "," + n1(top) + " " + n1(x - hw / 2) + "," + n1(bot) + " " + n1(x + hw / 2) + "," + n1(bot) + '"/>';
    }
    return s;
  }

  reg("sky-milky-way", function (spec) {
    var kind = spec.kind || spec.arg || "band", D = mkDefs(), rand = H.rng(41), W = 360, Hh = 240, i, t, x, y, s = "", d = "", dm = "", r, label, p, q, lane;
    var bg = H.uid("sk"), hz = H.uid("hz"), clip = H.uid("cl");
    var defs = '<clipPath id="' + clip + '"><rect width="360" height="240" rx="14"/></clipPath>' +
      '<linearGradient id="' + bg + '" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#040716"/><stop offset="0.6" stop-color="#0c1436"/><stop offset="1" stop-color="#1d2859"/></linearGradient>' +
      '<linearGradient id="' + hz + '" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#3d4f9a" stop-opacity="0"/><stop offset="1" stop-color="#3d4f9a" stop-opacity="0.45"/></linearGradient>';
    s += '<rect width="360" height="240" fill="url(#' + bg + ')"/>';
    function bandPt(tt, spread) {
      var bx = -20 + 400 * tt, by = 212 - 178 * tt + 16 * Math.sin(tt * PI), nrm = gauss(rand) * spread;
      return [bx + nrm * 0.41, by + nrm * 0.91];
    }
    var bandAng = -Math.atan2(178, 400) * 180 / PI;
    if (kind === "band") {
      var cols = [[[0, "#d5ddff", 1], [1, "#d5ddff", 0]], [[0, "#eadcff", 1], [1, "#eadcff", 0]], [[0, "#ffe9cc", 1], [1, "#ffe9cc", 0]]];
      for (i = 0; i < 80; i += 1) {
        t = i / 79; p = bandPt(t, 14);
        s += blob(D, p[0], p[1], 20 + rand() * 22, cols[t > 0.35 && t < 0.65 && rand() < 0.5 ? 2 : (rand() < 0.4 ? 1 : 0)], (0.06 + rand() * 0.07).toFixed(3));
      }
      for (i = 0; i < 190; i += 1) {
        q = bandPt(rand(), 13);
        d += dot(q[0], q[1], 0.35 + rand() * 0.45);
      }
      s += '<g fill="#e4eaff" opacity="0.6">' + d + "</g>";
      for (i = 0; i < 5; i += 1) {
        lane = bandPt(0.15 + i * 0.17, 6);
        s += '<g transform="translate(' + n1(lane[0]) + " " + n1(lane[1]) + ") rotate(" + n1(bandAng + (rand() - 0.5) * 14) + ') scale(2.4 0.45)">' +
          blob(D, 0, 0, 14, [[0, "#070b22", 0.6], [1, "#070b22", 0]]) + "</g>";
      }
      label = "A night sky over dark hills and trees, with a faint hazy band of cloudy light stretching across the stars";
    } else if (kind === "spiral") {
      s += drawGalaxy(D, "spiral", 210, 92, 74, 207, { rot: -25, tilt: 0.62, dots: 110 });
      label = "A night sky over dark hills and trees with a clear bright spiral galaxy hanging among the stars";
    } else {
      s += blob(D, 232, 84, 30, [[0, "#c1ccff", 0.3], [1, "#c1ccff", 0]]);
      for (i = 0; i < 60; i += 1) { dm += dot(232 + gauss(rand) * 8, 84 + gauss(rand) * 7, 0.5 + rand() * 0.6); }
      s += '<g fill="#dfe6ff" opacity="0.8">' + dm + "</g>";
      label = "A night sky over dark hills and trees with one small dim clump of stars";
    }
    /* scattered stars on top */
    d = "";
    for (i = 0; i < 150; i += 1) {
      x = rand() * W; y = rand() * 205; r = 0.35 + Math.pow(rand(), 3) * 1.3;
      d += '<circle cx="' + n1(x) + '" cy="' + n1(y) + '" r="' + n1(r) + '" opacity="' + (0.4 + rand() * 0.6).toFixed(2) + '"/>';
    }
    s += '<g fill="#fff">' + d + "</g>";
    for (i = 0; i < 7; i += 1) { x = rand() * W; y = 10 + rand() * 150; s += blob(D, x, y, 5, [[0, "#ffffff", 0.9], [1, "#bcd0ff", 0]]) + '<circle cx="' + n1(x) + '" cy="' + n1(y) + '" r="1.4" fill="#fff"/>'; }
    /* horizon glow, hills, trees */
    s += '<rect y="140" width="360" height="100" fill="url(#' + hz + ')"/>';
    s += '<path d="M0 214 Q60 194 125 207 T250 203 T360 208 L360 240 L0 240Z" fill="#04060f"/>';
    s += '<g fill="#04060f">' + tree(26, 214, 58, 30) + tree(54, 212, 40, 22) + tree(8, 216, 44, 22) + tree(296, 208, 64, 32) + tree(326, 208, 46, 24) + tree(346, 210, 54, 26) + tree(170, 210, 20, 12) + "</g>";
    return H.svg(W, Hh, "<defs>" + defs + D.s + '</defs><g clip-path="url(#' + clip + ')">' + s + "</g>", label);
  });

  /* ---------- the universe ---------- */

  function miniGal(D, rand, x, y, s) {
    var k = rand(), g = "", tilt = 0.4 + rand() * 0.6, rot = Math.round(rand() * 180);
    var open = '<g transform="translate(' + n1(x) + " " + n1(y) + ") rotate(" + rot + ") scale(1 " + n1(tilt) + ')">';
    if (k < 0.45) {
      g = blob(D, 0, 0, s * 1.5, G_SOFTBLUE) + blob(D, 0, 0, s * 0.55, G_BULGE);
      if (s >= 5) { g += '<path d="M' + n1(-s) + " " + n1(-s * 0.15) + " Q0 " + n1(-s * 0.9) + " " + n1(s) + " " + n1(s * 0.15) + '" fill="none" stroke="#cfe0ff" stroke-width="' + n1(s * 0.22) + '" opacity="0.5" stroke-linecap="round"/>'; }
    } else if (k < 0.75) {
      g = blob(D, 0, 0, s * 1.1, G_ELL) + blob(D, 0, 0, s * 0.35, [[0, "#ffffff", 0.9], [1, "#ffd790", 0]]);
    } else {
      g = blob(D, -s * 0.4, 0, s * 0.7, G_IRR) + blob(D, s * 0.5, s * 0.2, s * 0.6, G_IRR) + blob(D, 0, -s * 0.4, s * 0.5, G_IRR) + blob(D, s * 0.2, 0, s * 0.18, G_PINK);
    }
    return open + g + "</g>";
  }

  reg("universe", function () {
    var D = mkDefs(), rand = H.rng(555), s = "", d = "", i, sz, bgId = H.uid("sc");
    for (i = 0; i < 160; i += 1) { d += dot(rand() * 360, rand() * 205, 0.5 + rand() * 0.5); }
    s += '<g fill="#cfd8ff" opacity="0.5">' + d + "</g>";
    for (i = 0; i < 78; i += 1) {
      sz = i < 12 ? 9 + rand() * 6 : 3 + rand() * 4.5;
      s += miniGal(D, rand, 14 + rand() * 332, 12 + rand() * 188, sz);
    }
    s += '<defs><linearGradient id="' + bgId + '" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="' + C.navy + '" stop-opacity="0"/><stop offset="0.5" stop-color="' + C.navy + '" stop-opacity="0.85"/><stop offset="1" stop-color="' + C.navy + '"/></linearGradient></defs>' +
      '<rect y="190" width="360" height="50" fill="url(#' + bgId + ')"/>' +
      '<text x="180" y="226" font-size="14.5" font-weight="700" text-anchor="middle" font-family="inherit" fill="' + C.ink + '">the universe: everything that exists</text>';
    return H.svg(360, 240, "<defs>" + D.s + "</defs>" + H.space(360, 240, 56, 30) + s,
      "A wide view of the universe with many small galaxies of different shapes scattered through space");
  });

  /* ---------- the four types together ---------- */

  reg("galaxy-gallery", function () {
    var D = mkDefs(), s = "", i, cell, x, y, items = [
      ["spiral", "Spiral", { rot: -25, dots: 40 }],
      ["barred", "Barred spiral", { rot: -22, dots: 40 }],
      ["elliptical", "Elliptical", { ratio: 0.72 }],
      ["irregular", "Irregular", { rot: 8 }]
    ];
    for (i = 0; i < 4; i += 1) {
      x = 6 + (i % 2) * 176; y = 5 + Math.floor(i / 2) * 118; cell = items[i];
      s += '<rect x="' + x + '" y="' + y + '" width="172" height="112" rx="12" fill="#ffffff" opacity="0.05"/>';
      s += drawGalaxy(D, cell[0], x + 86, y + 46, 38, 301 + i, cell[2]);
      s += '<text x="' + (x + 86) + '" y="' + (y + 104) + '" font-size="13.5" font-weight="700" text-anchor="middle" font-family="inherit" fill="' + C.ink + '">' + cell[1] + "</text>";
    }
    return scene(360, 240, 77, 40, D, s, "Four galaxy shapes: spiral, barred spiral, elliptical and irregular");
  });

  /* ---------- Hubble ---------- */

  reg("hubble", function () {
    var D = mkDefs(), s = "", tube = H.uid("tb"), i, kinds = ["spiral", "barred", "elliptical", "irregular"];
    var defs = '<linearGradient id="' + tube + '" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#d3daf2"/><stop offset="1" stop-color="#58629a"/></linearGradient>';
    for (i = 0; i < 4; i += 1) { s += drawGalaxy(D, kinds[i], 214 + i * 43, 30, 13, 410 + i, { lite: true, rot: -20 }); }
    s += '<path d="M0 218 Q90 204 180 214 T360 210 L360 240 L0 240Z" fill="#080c26"/>';
    /* tripod */
    s += '<g stroke="#4a5590" stroke-width="5" stroke-linecap="round"><line x1="160" y1="122" x2="128" y2="216"/><line x1="160" y1="122" x2="176" y2="220"/><line x1="160" y1="122" x2="212" y2="210"/></g>';
    /* telescope */
    s += '<g transform="translate(160 122) rotate(-35)">' +
      '<rect x="-30" y="-10" width="130" height="20" rx="6" fill="url(#' + tube + ')"/>' +
      '<rect x="80" y="-13" width="26" height="26" rx="5" fill="#7d89b8"/><ellipse cx="106" cy="0" rx="3" ry="11" fill="#bfe6ff"/>' +
      '<rect x="22" y="-11" width="5" height="22" fill="#44507f"/><rect x="-18" y="-11" width="5" height="22" fill="#44507f"/>' +
      '<rect x="10" y="-21" width="46" height="7" rx="3" fill="#6a76a6"/><rect x="18" y="-15" width="3" height="5" fill="#44507f"/><rect x="44" y="-15" width="3" height="5" fill="#44507f"/>' +
      '<rect x="-46" y="-5" width="17" height="10" rx="3" fill="#323c6e"/></g>';
    /* observer */
    s += '<g stroke="#7f8fe0" stroke-width="1.2" stroke-linejoin="round">' +
      '<path d="M96 168 Q94 150 108 148 Q120 148 120 164 L124 214 L106 214 L104 192 L98 214 L84 214 Z" fill="#27327a"/>' +
      '<circle cx="106" cy="138" r="10" fill="#f0c8a0"/></g>' +
      '<path d="M112 156 L124 146" stroke="#27327a" stroke-width="6" stroke-linecap="round"/>';
    s += '<text x="180" y="233" font-size="13" font-weight="700" text-anchor="middle" font-family="inherit" fill="' + C.ink + '">Edwin Hubble sorted galaxies by shape</text>';
    return H.svg(360, 240, "<defs>" + defs + D.s + "</defs>" + H.space(360, 240, 88, 70) + s,
      "A person looking through a big telescope toward four galaxies of different shapes");
  });
}());

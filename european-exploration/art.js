/* European Exploration Quest: hand-drawn SVG pictures. Small, offline, and no copyright worries.
   Every function returns an SVG string made only from fixed shapes (no user or lesson text). */
(function () {
  "use strict";

  var INK = "#14304f", SEA = "#2b7fb0", SEA_DARK = "#1d5d89", FOAM = "#e6f4fb", SAND = "#f4e2b3", WOOD = "#8a5a2b", CREAM = "#fff8e7", GOLD = "#f2b632", RED = "#c8412f", GREEN = "#4d9a5b";

  function svg(w, h, body, extra) {
    return '<svg viewBox="0 0 ' + w + " " + h + '" xmlns="http://www.w3.org/2000/svg" ' + (extra || 'aria-hidden="true"') + ' focusable="false">' + body + "</svg>";
  }

  function waves(y, color, count, w) {
    var d = "M0 " + y, step = w / count, i;
    for (i = 0; i < count; i++) { d += " q" + (step / 4) + " -8 " + (step / 2) + " 0 t" + (step / 2) + " 0"; }
    return '<path d="' + d + " V220 H0 Z\" fill=\"" + color + '"/>';
  }

  function ship(x, y, s) {
    return '<g transform="translate(' + x + " " + y + ") scale(" + s + ')">' +
      '<path d="M-44 0 L44 0 L30 20 L-30 20 Z" fill="' + WOOD + '"/>' +
      '<rect x="-3" y="-66" width="6" height="68" fill="#5a3a1a"/>' +
      '<path d="M-4 -62 Q-44 -40 -38 -8 L-4 -8 Z" fill="' + CREAM + '" stroke="#cdb88a" stroke-width="1.5"/>' +
      '<path d="M4 -62 Q42 -42 36 -10 L4 -10 Z" fill="' + CREAM + '" stroke="#cdb88a" stroke-width="1.5"/>' +
      '<path d="M3 -66 L26 -59 L3 -52 Z" fill="' + RED + '"/></g>';
  }

  function astrolabe(cx, cy, r) {
    var ticks = "", i, a, x1, y1, x2, y2;
    for (i = 0; i < 24; i++) {
      a = i * Math.PI / 12; x1 = cx + Math.sin(a) * (r - 2); y1 = cy - Math.cos(a) * (r - 2);
      x2 = cx + Math.sin(a) * (r - (i % 6 === 0 ? 11 : 6)); y2 = cy - Math.cos(a) * (r - (i % 6 === 0 ? 11 : 6));
      ticks += '<line x1="' + x1.toFixed(1) + '" y1="' + y1.toFixed(1) + '" x2="' + x2.toFixed(1) + '" y2="' + y2.toFixed(1) + '" stroke="#6b4a1a" stroke-width="2"/>';
    }
    return '<g><circle cx="' + cx + '" cy="' + cy + '" r="' + r + '" fill="#e8c368" stroke="#8a5a2b" stroke-width="4"/>' +
      '<circle cx="' + cx + '" cy="' + (cy - r - 7) + '" r="6" fill="none" stroke="#8a5a2b" stroke-width="3"/>' + ticks +
      '<line x1="' + (cx - r + 8) + '" y1="' + (cy + 14) + '" x2="' + (cx + r - 8) + '" y2="' + (cy - 14) + '" stroke="#6b4a1a" stroke-width="5" stroke-linecap="round"/>' +
      '<circle cx="' + cx + '" cy="' + cy + '" r="4" fill="#6b4a1a"/></g>';
  }

  function compass(cx, cy, r, deg) {
    return '<g><circle cx="' + cx + '" cy="' + cy + '" r="' + r + '" fill="#fdf3d4" stroke="' + WOOD + '" stroke-width="4"/>' +
      '<circle cx="' + cx + '" cy="' + cy + '" r="' + (r - 8) + '" fill="none" stroke="#d9c28a" stroke-width="1.5"/>' +
      '<g transform="rotate(' + deg + " " + cx + " " + cy + ')"><path d="M' + cx + " " + (cy - r + 10) + " L" + (cx + 7) + " " + cy + " L" + (cx - 7) + " " + cy + ' Z" fill="' + RED + '"/>' +
      '<path d="M' + cx + " " + (cy + r - 10) + " L" + (cx + 7) + " " + cy + " L" + (cx - 7) + " " + cy + ' Z" fill="#7a8ca0"/></g>' +
      '<circle cx="' + cx + '" cy="' + cy + '" r="4" fill="' + INK + '"/></g>';
  }

  function sun(x, y, r) {
    return '<circle cx="' + x + '" cy="' + y + '" r="' + r + '" fill="' + GOLD + '"/>';
  }

  function bowls() {
    return '<g><ellipse cx="0" cy="12" rx="22" ry="8" fill="#9b5a2a"/><path d="M-22 12 Q0 -14 22 12 Z" fill="#d1492e"/>' +
      '<ellipse cx="36" cy="14" rx="20" ry="7" fill="#9b5a2a"/><path d="M16 14 Q36 -8 56 14 Z" fill="#e9a23b"/>' +
      '<rect x="70" y="-2" width="34" height="18" rx="6" fill="#b04a8f"/><rect x="70" y="3" width="34" height="3" fill="#e3a2cf"/></g>';
  }

  var SCENES = {
    people: function () {
      var corn = "", i;
      for (i = 0; i < 4; i++) { corn += '<g transform="translate(' + (215 + i * 22) + ' 128)"><rect x="-1.5" y="-30" width="3" height="32" fill="#4a8a3c"/><ellipse cx="5" cy="-18" rx="4" ry="9" fill="' + GOLD + '"/><path d="M-1 -10 L-14 -22 M1 -14 L14 -28" stroke="#4a8a3c" stroke-width="3" fill="none"/></g>'; }
      return svg(320, 180,
        '<rect width="320" height="180" fill="#cfeaf7"/>' + sun(268, 38, 20) +
        '<rect y="100" width="320" height="80" fill="' + SEA + '"/>' + ship(46, 108, 0.32) +
        '<path d="M0 120 Q80 98 160 118 T320 112 V180 H0 Z" fill="#7fb069"/><path d="M0 150 Q100 132 200 150 T320 146 V180 H0 Z" fill="#6aa357"/>' +
        '<path d="M70 150 L112 150 L91 108 Z" fill="#c68b59"/><path d="M91 150 L85 150 L91 132 L97 150 Z" fill="#6b4226"/>' +
        '<path d="M126 156 L160 156 L143 124 Z" fill="#d9a066"/><path d="M143 156 L138 156 L143 142 L148 156 Z" fill="#6b4226"/>' + corn);
    },
    trade: function () {
      return svg(320, 180,
        '<rect width="320" height="180" fill="#d8eefa"/><rect y="86" width="320" height="94" fill="' + SEA + '"/>' +
        '<path d="M0 88 Q30 70 70 88 L70 100 H0 Z" fill="#b9a36a"/><path d="M250 88 Q280 66 320 84 V100 H250 Z" fill="#c9b27a"/>' +
        '<path d="M60 96 Q160 30 262 90" fill="none" stroke="#fff" stroke-width="3" stroke-dasharray="3 8" stroke-linecap="round"/>' +
        ship(150, 104, 0.5) + '<g transform="translate(240 70) scale(.5)">' + bowls() + "</g>" +
        '<rect x="8" y="66" width="38" height="14" rx="3" fill="#b04a8f"/><rect x="8" y="71" width="38" height="3" fill="#e3a2cf"/>' + waves(150, SEA_DARK, 6, 320));
    },
    columbus: function () {
      return svg(320, 180,
        '<rect width="320" height="180" fill="#f8d9a0"/>' + sun(60, 100, 34) + '<rect y="104" width="320" height="76" fill="' + SEA + '"/>' +
        ship(180, 108, 1) + waves(138, SEA_DARK, 6, 320) +
        '<rect x="232" y="20" width="76" height="30" rx="8" fill="' + CREAM + '" stroke="#cdb88a" stroke-width="2"/><text x="270" y="42" text-anchor="middle" font-family="Georgia,serif" font-weight="700" font-size="20" fill="' + INK + '">1492</text>');
    },
    tools: function () {
      return svg(320, 180,
        '<rect width="320" height="180" fill="#f7ecd0"/>' + astrolabe(80, 92, 52) + compass(238, 92, 46, 0) +
        '<text x="80" y="168" text-anchor="middle" font-family="Georgia,serif" font-size="13" font-weight="700" fill="' + INK + '">astrolabe</text>' +
        '<text x="238" y="168" text-anchor="middle" font-family="Georgia,serif" font-size="13" font-weight="700" fill="' + INK + '">compass</text>');
    },
    flags: function () {
      return svg(320, 180,
        '<rect width="320" height="180" fill="#cfeaf7"/><rect y="124" width="320" height="56" fill="' + SEA + '"/>' + ship(70, 128, 0.5) +
        '<path d="M150 180 Q220 110 320 140 V180 Z" fill="#7fb069"/><rect x="214" y="48" width="5" height="100" fill="#5a3a1a"/>' +
        '<rect x="219" y="52" width="70" height="46" fill="' + CREAM + '" stroke="#cdb88a" stroke-width="2"/>' +
        '<rect x="251" y="56" width="6" height="38" fill="' + RED + '"/><rect x="236" y="70" width="36" height="6" fill="' + RED + '"/>' +
        '<text x="232" y="92" font-family="Georgia,serif" font-size="14" font-weight="700" fill="' + INK + '">F</text><text x="270" y="92" font-family="Georgia,serif" font-size="14" font-weight="700" fill="' + INK + '">Y</text>');
    },
    faith: function () {
      return svg(320, 180,
        '<rect width="320" height="180" fill="#efe6f7"/><path d="M160 150 L160 70 Q110 52 62 66 L62 146 Q110 132 160 150 Z" fill="#fff" stroke="#8a6fb0" stroke-width="3"/>' +
        '<path d="M160 150 L160 70 Q210 52 258 66 L258 146 Q210 132 160 150 Z" fill="#fff" stroke="#8a6fb0" stroke-width="3"/>' +
        '<path d="M78 84 Q110 76 146 88 M78 100 Q110 92 146 104 M78 116 Q110 108 146 120 M174 88 Q210 76 242 84 M174 104 Q210 92 242 100 M174 120 Q210 108 242 116" stroke="#b9a8d4" stroke-width="3" fill="none"/>' +
        '<rect x="156" y="20" width="8" height="34" fill="' + GOLD + '"/><rect x="146" y="29" width="28" height="8" fill="' + GOLD + '"/>');
    },
    metals: function () {
      return svg(320, 180,
        '<rect width="320" height="180" fill="#3a3f4f"/>' +
        '<path d="M60 150 L110 150 L102 128 L68 128 Z" fill="#e3b53c"/><path d="M118 150 L168 150 L160 128 L126 128 Z" fill="#d8a82f"/><path d="M89 126 L139 126 L131 104 L97 104 Z" fill="#f0c653"/>' +
        '<circle cx="214" cy="140" r="20" fill="#c9d0d8" stroke="#9aa4ae" stroke-width="3"/><circle cx="214" cy="140" r="12" fill="none" stroke="#9aa4ae" stroke-width="2"/>' +
        '<circle cx="256" cy="148" r="16" fill="#c9d0d8" stroke="#9aa4ae" stroke-width="3"/><circle cx="256" cy="148" r="9" fill="none" stroke="#9aa4ae" stroke-width="2"/>' +
        '<path d="M20 40 L300 40" stroke="#555c6e" stroke-width="2" stroke-dasharray="4 8"/>');
    },
    foods: function () {
      return svg(320, 180,
        '<rect width="320" height="180" fill="#fdf0d2"/>' +
        '<g transform="translate(48 96) rotate(-20)"><ellipse rx="14" ry="38" fill="' + GOLD + '"/><path d="M-14 36 Q0 -34 14 36 Q0 56 -14 36 Z" fill="' + GREEN + '" opacity=".85"/><ellipse rx="10" ry="30" fill="' + GOLD + '"/></g>' +
        '<ellipse cx="112" cy="110" rx="30" ry="20" fill="#b98550" transform="rotate(-12 112 110)"/><circle cx="104" cy="106" r="2.5" fill="#8a6035"/><circle cx="120" cy="112" r="2.5" fill="#8a6035"/>' +
        '<circle cx="172" cy="108" r="26" fill="' + RED + '"/><path d="M158 88 L172 96 L186 88 L180 100 L172 94 L164 100 Z" fill="#3d8a3f"/>' +
        '<g transform="translate(232 108)"><ellipse rx="22" ry="32" fill="#e69a2e"/><path d="M-14 -26 L0 -60 L14 -26 M-6 -28 L-20 -52 M6 -28 L20 -52" stroke="#3d8a3f" stroke-width="6" fill="none" stroke-linecap="round"/></g>' +
        '<g transform="translate(284 116) rotate(25)"><ellipse rx="14" ry="30" fill="#7a4a3a"/><path d="M0 -30 V30 M-8 -22 Q-9 0 -8 22 M8 -22 Q9 0 8 22" stroke="#5c3428" stroke-width="2" fill="none"/></g>');
    },
    tobacco: function () {
      var plants = "", i;
      for (i = 0; i < 3; i++) {
        plants += '<g transform="translate(' + (70 + i * 90) + ' 160)"><rect x="-3" y="-100" width="6" height="100" fill="#4a7a3a"/>' +
          '<ellipse cx="-22" cy="-22" rx="24" ry="9" fill="' + GREEN + '" transform="rotate(-24 -22 -22)"/><ellipse cx="22" cy="-44" rx="24" ry="9" fill="#5aa466" transform="rotate(24 22 -44)"/>' +
          '<ellipse cx="-22" cy="-66" rx="22" ry="8" fill="' + GREEN + '" transform="rotate(-24 -22 -66)"/><ellipse cx="20" cy="-86" rx="18" ry="7" fill="#5aa466" transform="rotate(24 20 -86)"/></g>';
      }
      return svg(320, 180, '<rect width="320" height="180" fill="#dff0d8"/><rect y="150" width="320" height="30" fill="#a9825a"/>' + plants);
    },
    wreck: function () {
      return svg(320, 180,
        '<rect width="320" height="180" fill="#b9dff2"/><rect y="40" width="320" height="140" fill="#2a79a8"/><rect y="110" width="320" height="70" fill="#1b5a82"/>' +
        '<path d="M0 160 Q80 146 160 158 T320 154 V180 H0 Z" fill="#c9b27a"/>' +
        '<g transform="translate(190 140) rotate(-18)"><path d="M-44 0 L44 0 L30 20 L-30 20 Z" fill="#5a3a1a"/><rect x="-3" y="-44" width="6" height="46" fill="#3e2810"/><path d="M-4 -40 Q-30 -26 -26 -6 L-4 -6 Z" fill="#cdb88a" opacity=".7"/></g>' +
        '<ellipse cx="70" cy="34" rx="26" ry="10" fill="#5a3a1a"/><path d="M60 40 L52 52 H88 L80 40 Z" fill="#8a5a2b"/>' +
        '<g fill="none" stroke="#fff" stroke-width="3" stroke-linecap="round" opacity=".8"><path d="M52 66 Q70 78 88 66"/><path d="M42 80 Q70 100 98 80"/><path d="M32 94 Q70 122 108 94"/></g>' +
        '<path d="M20 20 H300 M20 60 H300 M20 100 H300 M20 140 H300 M60 20 V180 M140 20 V180 M220 20 V180 M300 20 V180" stroke="#fff" stroke-width="1" opacity=".18"/>');
    },
    astrolabe: function () {
      return svg(320, 180, '<rect width="320" height="180" fill="#f7ecd0"/>' + astrolabe(160, 98, 66));
    },
    compass: function () {
      return svg(320, 180, '<rect width="320" height="180" fill="#f7ecd0"/>' + compass(160, 92, 70, 12) +
        '<text x="160" y="24" text-anchor="middle" font-family="Georgia,serif" font-size="16" font-weight="700" fill="' + INK + '">N</text>');
    },
    chart: function () {
      return svg(320, 180,
        '<rect width="320" height="180" fill="#f4e6bf"/><path d="M20 20 H300 V160 H20 Z" fill="#ecd9a0" stroke="#bfa25a" stroke-width="3"/>' +
        '<path d="M20 120 Q60 80 100 104 T170 96 L190 130 Q120 150 80 140 T20 160 Z" fill="#c9b27a"/><circle cx="104" cy="94" r="5" fill="' + RED + '"/>' +
        '<path d="M200 50 q20 -14 40 0 t40 0 M200 74 q20 -14 40 0 t40 0" stroke="' + SEA + '" stroke-width="3" fill="none"/>' +
        '<path d="M232 108 l8 -6 l8 6 m-8 -6 v18" stroke="' + INK + '" stroke-width="2" fill="none"/><text x="244" y="144" text-anchor="middle" font-family="Georgia,serif" font-size="12" fill="' + INK + '">safe port</text>');
    },
    blank: function () {
      return svg(320, 180,
        '<rect width="320" height="180" fill="#f4e6bf"/><path d="M20 20 H300 V160 H20 Z" fill="#ecd9a0" stroke="#bfa25a" stroke-width="3"/>' +
        '<path d="M20 110 Q60 80 100 98 T150 94 L150 160 H20 Z" fill="#c9b27a"/>' +
        '<path d="M170 50 H290 V120 H170 Z" fill="none" stroke="#bfa25a" stroke-width="3" stroke-dasharray="6 6"/><text x="230" y="92" text-anchor="middle" font-family="Georgia,serif" font-size="30" fill="#9c8142">?</text>' +
        '<path d="M170 148 q10 -26 24 -8 t24 -8 t24 -8 t24 -8 t24 -4" fill="none" stroke="#3c7a4a" stroke-width="7" stroke-linecap="round"/><circle cx="288" cy="102" r="3" fill="#3c7a4a"/>');
    },
    home: function () {
      return svg(640, 240,
        '<rect width="640" height="240" fill="#0f4c75"/>' +
        '<circle cx="520" cy="88" r="32" fill="#f2b632" opacity=".95"/>' +
        '<path d="M30 160 Q80 110 150 140 T250 130" fill="none" stroke="#f4e2b3" stroke-width="4" stroke-dasharray="3 10" stroke-linecap="round" opacity=".7"/>' +
        '<g class="ee-ship">' + ship(330, 140, 1.2) + "</g>" +
        waves(176, "#1f6a9a", 10, 640) + waves(204, "#164f78", 8, 640),
        'aria-hidden="true" preserveAspectRatio="xMidYMid slice"');
    },
    sun: function () {
      return svg(320, 180,
        '<rect width="320" height="180" fill="#cfeaf7"/>' + sun(246, 56, 20) + '<rect y="120" width="320" height="60" fill="' + SEA + '"/>' +
        '<line x1="40" y1="120" x2="300" y2="120" stroke="' + INK + '" stroke-width="3"/>' +
        '<path d="M110 120 A70 70 0 0 1 148 58" fill="none" stroke="' + RED + '" stroke-width="4"/>' +
        '<line x1="70" y1="120" x2="246" y2="56" stroke="#b98a30" stroke-width="2" stroke-dasharray="5 5"/>' +
        '<g transform="translate(70 118) scale(.5)">' + '<path d="M-44 0 L44 0 L30 20 L-30 20 Z" fill="' + WOOD + '"/><rect x="-3" y="-60" width="6" height="62" fill="#5a3a1a"/></g>' +
        '<text x="92" y="108" font-family="Georgia,serif" font-size="14" font-weight="700" fill="' + RED + '">angle</text>' +
        '<text x="40" y="150" font-family="Georgia,serif" font-size="12" fill="#fff">horizon</text>', 'role="img" aria-label="A sailor on a ship measures the angle between the horizon and the sun"');
    }
  };

  var DIRS = { 0: "north", 90: "east", 180: "south", 270: "west" };

  window.EE_ART = {
    scene: function (name) { return (SCENES[name] || SCENES.home)(); },
    /* Compass with N, E, S, W labels and a ship arrow pointing at `deg` (0 = up). */
    compassArrow: function (deg) {
      var label = 'role="img" aria-label="A compass with N at the top, E on the right, S at the bottom, and W on the left. The ship’s arrow points toward the ' + (DIRS[deg] || "north") + '"';
      var body = '<circle cx="160" cy="92" r="74" fill="#fdf3d4" stroke="' + WOOD + '" stroke-width="5"/><circle cx="160" cy="92" r="64" fill="none" stroke="#d9c28a" stroke-width="2"/>' +
        '<g font-family="Georgia,serif" font-size="20" font-weight="700" fill="' + INK + '" text-anchor="middle"><text x="160" y="44">N</text><text x="216" y="100">E</text><text x="160" y="158">S</text><text x="104" y="100">W</text></g>' +
        '<g transform="rotate(' + deg + ' 160 92)"><path d="M160 54 L172 92 L148 92 Z" fill="' + RED + '"/><rect x="156" y="92" width="8" height="28" rx="3" fill="' + RED + '"/></g><circle cx="160" cy="92" r="6" fill="' + INK + '"/>';
      return svg(320, 184, body, label);
    },
    /* A round badge with initials for an explorer card. */
    medal: function (hue, initials) {
      return svg(120, 120, '<circle cx="60" cy="60" r="56" fill="hsl(' + hue + ',55%,88%)" stroke="hsl(' + hue + ',50%,38%)" stroke-width="5"/>' +
        '<circle cx="60" cy="60" r="44" fill="hsl(' + hue + ',50%,38%)"/>' +
        '<text x="60" y="72" text-anchor="middle" font-family="Georgia,serif" font-size="34" font-weight="700" fill="#fff">' + initials + "</text>");
    }
  };
})();

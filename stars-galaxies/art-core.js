/* Cosmic Quest art registry. Each art-*.js file calls SG_ART.register(name, fn).
   fn(spec, H) returns an SVG string; spec is {name, arg, ...params}. */
(function () {
  var reg = {};
  var counter = 0;
  var C = {
    navy: "#0b1030", deep: "#141b45", panel: "#1b2459", ink: "#eef2ff", dim: "#a9b4e6",
    cyan: "#5ee7ff", gold: "#ffd166", pink: "#ff6bd6", green: "#5be3a0", amber: "#ffb347",
    star: { blue: "#7fb2ff", white: "#f4f7ff", yellow: "#ffd84d", orange: "#ff9d3c", red: "#ff5a4a" }
  };

  function esc(s) { return String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;"); }
  function uid(p) { counter += 1; return (p || "g") + counter; }
  function rng(seed) {
    var s = (seed || 1) >>> 0;
    return function () { s = (s * 1664525 + 1013904223) >>> 0; return s / 4294967296; };
  }
  /* Wrap inner SVG markup. w,h = viewBox size. label = accessible description. */
  function svg(w, h, inner, label, cls) {
    return '<svg class="art ' + (cls || "") + '" viewBox="0 0 ' + w + " " + h + '" role="img" aria-label="' + esc(label || "") +
      '" preserveAspectRatio="xMidYMid meet" xmlns="http://www.w3.org/2000/svg">' + inner + "</svg>";
  }
  /* Dark space backdrop rect plus scattered tiny stars. */
  function space(w, h, seed, n, r) {
    var rand = rng(seed || 7), out = '<rect width="' + w + '" height="' + h + '" rx="' + (r == null ? 14 : r) + '" fill="' + C.navy + '"/>';
    var i, x, y, s, o;
    for (i = 0; i < (n == null ? 40 : n); i += 1) {
      x = rand() * w; y = rand() * h; s = 0.4 + rand() * 1.1; o = 0.35 + rand() * 0.65;
      out += '<circle cx="' + x.toFixed(1) + '" cy="' + y.toFixed(1) + '" r="' + s.toFixed(2) + '" fill="#fff" opacity="' + o.toFixed(2) + '"/>';
    }
    return out;
  }
  /* Radial glow gradient definition; returns {id, ref, def}. */
  function glow(color, inner, outer) {
    var id = uid("gl");
    return {
      id: id, ref: "url(#" + id + ")",
      def: '<radialGradient id="' + id + '"><stop offset="0" stop-color="' + (inner || "#fff") + '"/><stop offset="0.45" stop-color="' + color +
        '"/><stop offset="1" stop-color="' + color + '" stop-opacity="' + (outer == null ? 0 : outer) + '"/></radialGradient>'
    };
  }
  var H = { C: C, esc: esc, uid: uid, rng: rng, svg: svg, space: space, glow: glow };

  function parse(spec) {
    if (typeof spec === "string") {
      var i = spec.indexOf(":");
      return i < 0 ? { name: spec } : { name: spec.slice(0, i), arg: spec.slice(i + 1) };
    }
    return spec || {};
  }
  function register(name, fn) { reg[name] = fn; }
  function has(name) { return !!reg[name]; }
  function names() { return Object.keys(reg); }
  function render(spec) {
    var s = parse(spec), fn = reg[s.name];
    if (!fn) { return svg(200, 80, '<rect width="200" height="80" rx="10" fill="' + C.deep + '"/><text x="100" y="45" fill="' + C.dim + '" font-size="12" text-anchor="middle">picture coming soon</text>', "picture"); }
    return fn(s, H);
  }
  window.SG_ART = { register: register, render: render, has: has, names: names, parse: parse, H: H };
}());

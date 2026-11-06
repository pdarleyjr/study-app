/* Math Mission: the game engine. One screen at a time is drawn into #app.
   Questions come from gen.js. Everything here is closed-book: no lookups, no notes. */
(function () {
  "use strict";
  var MM = window.MM, app = document.getElementById("app");
  if (!MM || !app) { return; }

  var GAME_ID = "math-mission";
  var KEY = "studyquest:math-mission:v1";
  var MAX_RECENT = 8;
  var STAGE = { warm: "Warm-up", core: "Mission", check: "Final check", scaffold: "Try one like it", retest: "Quick re-check", game: "Practice",
    challenge: "Test Ready Challenge", quick: "5-minute review", misses: "Practice my misses" };
  var round = null, cur = null;

  /* ---------- helpers ---------- */
  function el(tag, attrs, kids) {
    var n = document.createElement(tag), k;
    for (k in (attrs || {})) {
      if (attrs[k] === null || attrs[k] === undefined || attrs[k] === false) { continue; }
      if (k === "class") { n.className = attrs[k]; }
      else if (k === "text") { n.textContent = attrs[k]; }
      else if (k.slice(0, 2) === "on") { n.addEventListener(k.slice(2), attrs[k]); }
      else { n.setAttribute(k, attrs[k]); }
    }
    (kids || []).forEach(function (c) { if (c) { n.appendChild(typeof c === "string" ? document.createTextNode(c) : c); } });
    return n;
  }
  function shuffle(list) { return MM.shuffle(Math.random, list); }
  function pickOne(list) { return list[Math.floor(Math.random() * list.length)]; }
  function reduceMotion() { return !!(window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches); }
  function fracNode(n, d) {
    return el("span", { class: "frac", role: "img", "aria-label": n + " over " + d }, [
      el("span", { class: "fn", text: String(n), "aria-hidden": "true" }), el("span", { class: "fd", text: String(d), "aria-hidden": "true" })]);
  }
  /* text with {n/d} tokens -> nodes with stacked fractions */
  function rich(text) {
    var frag = document.createDocumentFragment();
    String(text).split(/(\{[0-9?]+\/[0-9?]+\})/).forEach(function (part) {
      var m = /^\{([0-9?]+)\/([0-9?]+)\}$/.exec(part);
      if (m) { frag.appendChild(fracNode(m[1], m[2])); } else if (part) { frag.appendChild(document.createTextNode(part)); }
    });
    return frag;
  }
  function richEl(tag, cls, text) { var n = el(tag, { class: cls }); n.appendChild(rich(text)); return n; }

  /* ---------- saved progress (local only, never throws) ---------- */
  function obj(v) { return v && typeof v === "object" && !Array.isArray(v) ? v : {}; }
  function loadStore() {
    var d = null, out = { obj: {}, recent: {}, runs: { morning: 0, quick: 0, challenge: 0, game: 0 }, bestChallenge: 0 }, n, o;
    try { d = JSON.parse(localStorage.getItem(KEY)); } catch (e) { d = null; }
    d = obj(d);
    for (n = 1; n <= 15; n++) {
      o = obj(obj(d.obj)[n]);
      out.obj[n] = { seen: Number(o.seen) || 0, indep: Number(o.indep) || 0, fixed: Number(o.fixed) || 0, miss: Number(o.miss) || 0, last: typeof o.last === "string" ? o.last : "" };
      out.recent[n] = Array.isArray(obj(d.recent)[n]) ? d.recent[n].slice(-MAX_RECENT) : [];
    }
    ["morning", "quick", "challenge", "game"].forEach(function (k) { out.runs[k] = Number(obj(d.runs)[k]) || 0; });
    out.bestChallenge = Number(d.bestChallenge) || 0;
    return out;
  }
  var store = loadStore();
  function saveStore() { try { localStorage.setItem(KEY, JSON.stringify(store)); } catch (e) { /* private mode: progress just won't be saved */ } }

  /* ---------- skill state and priorities ---------- */
  function lastOf(n) { return store.obj[n].last; }
  function prio(n) {
    var o = store.obj[n], l = o.last;
    if (l === "again") { return 100; }
    if (l === "pending") { return 90; }
    if (!o.seen) { return 60; }
    if (l === "aided") { return 45; }
    if (l === "fixed") { return 35; }
    return Math.max(0, 20 - o.indep * 5);
  }
  function prioNow(n) {
    var s = round && round.ses[n], base = prio(n) + Math.random() * 4;
    if (!s) { return base; }
    if (s.state === "again") { return 130; }
    if (s.state === "pending") { return 120; }
    if (s.state === "fixed") { return 60 + Math.random() * 4; }
    return s.state === "indep" ? Math.random() * 4 : base;
  }
  function missedSkills() { var out = []; for (var n = 1; n <= 15; n++) { if (lastOf(n) === "pending" || lastOf(n) === "again") { out.push(n); } } return out; }

  /* ---------- building questions and rounds ---------- */
  function mk(n, tier, style, extraAvoid) {
    var q = MM.gen(n, { tier: tier, style: style || "choice", avoid: store.recent[n].concat(extraAvoid || []) }), r = store.recent[n];
    r.push(q.key); if (r.length > MAX_RECENT) { r.shift(); }
    return q;
  }
  function item(q, tag) { return { k: "q", q: q, tag: tag, aided: q.style === "ladder" || q.style === "forge" || tag === "scaffold" }; }
  function newRound(kind, title, queue, opt) {
    var r = { kind: kind, title: title, queue: queue, i: 0, log: [], ses: {}, tries: (opt && opt.tries) || 2, adapt: !!(opt && opt.adapt), game: opt && opt.game };
    return r;
  }
  function buildMorning() {
    var q = [];
    [[1, "tiles"], [10], [3], [5]].forEach(function (w) { q.push(item(mk(w[0], "easy", w[1] || "choice"), "warm")); });
    [2, 8, 13, 4, 11, 7, 14, 9, 12, 6, 15].forEach(function (n) { q.push(item(mk(n, "std", "choice"), "core")); });
    q.push({ k: "finalcheck" });
    return newRound("morning", "Morning Mission", q, { adapt: true });
  }
  function pickByArea(counts) {
    var out = [];
    ["prime", "lcm", "frac"].forEach(function (area) {
      MM.AREAS[area].slice().sort(function (a, b) { return prioNow(b) - prioNow(a); }).slice(0, counts[area]).forEach(function (n) { out.push(n); });
    });
    return out;
  }
  function buildQuick() {
    var objs = pickByArea({ prime: 2, lcm: 2, frac: 3 }), q = shuffle(objs).map(function (n) {
      return item(mk(n, "std", n === 1 ? "tiles" : "choice"), "quick");
    });
    return newRound("quick", "5-minute review", [].concat(q), { adapt: false });
  }
  function expandFinal() {
    var objs = shuffle(pickByArea({ prime: 2, lcm: 2, frac: 2 }));
    return objs.map(function (n) { return item(mk(n, "std", n === 1 || n === 12 ? (n === 1 ? "tiles" : "choice") : "choice"), "check"); });
  }
  function buildGame(id) {
    var plans = {
      prime: [[1, "tiles"], [3], [2], [1, "tiles"], [15], [3], [2], [1]],
      match: [[4, "ladder"], [5, "ladder"], [6, "ladder"], [7, "ladder"], [8], [9], [5], [7]],
      forge: [[10, "forge"], [12, "forge"], [11], [13, "forge"], [14, "forge"], [10], [13], [14]]
    }, g = MM.GAMES[id];
    return newRound("game", g.title, plans[id].map(function (p) { return item(mk(p[0], "std", p[1] || "choice"), "game"); }), { adapt: true, game: id });
  }
  function buildChallenge() {
    var q = [], n;
    for (n = 1; n <= 15; n++) { q.push(item(mk(n, "std", "choice"), "challenge")); }
    return newRound("challenge", "Test Ready Challenge", q, { tries: 1 });
  }
  function buildMisses() {
    var objs = missedSkills().slice(0, 6);
    if (!objs.length) { return null; }
    return newRound("misses", "Practice my misses", shuffle(objs).map(function (n) { return item(mk(n, "std", "choice"), "misses"); }), { adapt: true });
  }

  /* ---------- screens ---------- */
  function show(node) {
    app.innerHTML = "";
    app.appendChild(node);
    var h = node.querySelector("h1, h2");
    if (h) { h.setAttribute("tabindex", "-1"); try { h.focus({ preventScroll: true }); } catch (e) { /* focus is a nicety */ } }
    window.scrollTo(0, 0);
  }
  function goHome() { round = null; cur = null; renderHome(); }
  function go(r) { if (!r) { goHome(); return; } round = r; r.i = 0; step(); }
  function topbar(label) {
    return el("div", { class: "top" }, [el("button", { class: "ghost", type: "button", text: "← Home", onclick: goHome }), el("span", { class: "label", text: label || "" })]);
  }
  function skillState(n) {
    var l = lastOf(n);
    if (l === "indep") { return { s: "★", c: "s-ok", t: "got it on my own" }; }
    if (l === "fixed") { return { s: "✔", c: "s-fix", t: "fixed it" }; }
    if (l === "aided") { return { s: "◔", c: "s-help", t: "practiced with help" }; }
    if (l === "pending" || l === "again") { return { s: "◐", c: "s-try", t: "needs one more try" }; }
    return { s: "·", c: "s-new", t: "not practiced yet" };
  }
  function skillGrid() {
    var ul = el("ul", { class: "skills" });
    MM.OBJECTIVES.forEach(function (o) {
      if (!o) { return; }
      var s = skillState(o.n);
      ul.appendChild(el("li", { class: s.c, "aria-label": o.title + ": " + s.t }, [el("b", { text: s.s, "aria-hidden": "true" }), el("span", { text: o.title })]));
    });
    return ul;
  }
  function renderHome() {
    var misses = missedSkills().length;
    var cards = [
      ["prime", "🛡️", "Prime Patrol", "Spot primes, count multiples."],
      ["match", "🪜", "Multiple Match", "LCM, LCD and schedules."],
      ["forge", "🔥", "Fraction Forge", "Simplify and build equal fractions."]
    ];
    var list = el("ul", { class: "cards" });
    cards.forEach(function (c) {
      list.appendChild(el("li", null, [el("button", { class: "card", type: "button", onclick: function () { go(buildGame(c[0])); } }, [
        el("span", { class: "ic", text: c[1], "aria-hidden": "true" }), el("span", null, [el("strong", { text: c[2] }), el("small", { text: c[3] })])])]));
    });
    list.appendChild(el("li", null, [el("button", { class: "card gold", type: "button", onclick: function () { go(buildChallenge()); } }, [
      el("span", { class: "ic", text: "🏆", "aria-hidden": "true" }),
      el("span", null, [el("strong", { text: "Test Ready Challenge" }), el("small", { text: "15 questions, one try each, like the real test." + (store.bestChallenge ? " Best: " + store.bestChallenge + "%" : "") })])])]));
    show(el("div", null, [
      el("header", { class: "hero" }, [el("div", { class: "bot", text: "🤖", "aria-hidden": "true" }),
        el("div", null, [el("h1", { text: "Math Mission" }), el("p", { text: "Prime & Fraction Power-Up" })])]),
      el("button", { class: "btn big go", type: "button", text: "START MY MORNING MISSION", onclick: function () { go(buildMorning()); } }),
      el("p", { class: "note", text: "About 10 minutes. No book needed, no timer." }),
      el("button", { class: "btn big alt", type: "button", text: "ONLY HAVE 5 MINUTES?", onclick: function () { go(buildQuick()); } }),
      misses ? el("button", { class: "btn gold", type: "button", text: "PRACTICE MY MISSES (" + misses + ")", onclick: function () { go(buildMisses()); } }) : null,
      el("section", { class: "panel" }, [el("h2", { text: "More practice" }), list]),
      el("section", { class: "panel" }, [el("h2", { text: "My 15 skills" }),
        el("p", { class: "note", text: "★ on my own   ✔ fixed it   ◔ practiced with help   ◐ one more try   · not yet" }), skillGrid()]),
      el("p", null, [el("a", { class: "ghost", href: "../", text: "← Study Quest home" })])
    ]));
  }

  /* ---------- running a round ---------- */
  function step() {
    var it = round.queue[round.i];
    cur = null;
    if (!it) { finish(); return; }
    if (it.k === "finalcheck") {
      var fin = expandFinal();
      round.queue.splice.apply(round.queue, [round.i, 1].concat(fin));
      it = round.queue[round.i];
    }
    if (it.k === "teach") { renderTeach(it); } else { renderQuestion(it); }
  }
  function next() { round.i += 1; step(); }
  function stageInfo(it) {
    var tag = it.tag, q = round.queue.filter(function (x) { return x.k === "q" && x.tag === tag; }), idx = q.indexOf(it) + 1;
    if (tag === "scaffold" || tag === "retest") { return STAGE[tag]; }
    return (round.game ? MM.GAMES[round.game].title : STAGE[tag]) + " · " + idx + " of " + q.length;
  }
  function progress() {
    var all = round.queue.filter(function (x) { return x.k === "q"; }).length, done = round.queue.slice(0, round.i).filter(function (x) { return x.k === "q"; }).length;
    var extra = round.kind === "morning" && round.queue.some(function (x) { return x.k === "finalcheck"; }) ? 6 : 0;
    return el("div", { class: "bar", role: "progressbar", "aria-label": "Progress", "aria-valuemin": "0", "aria-valuemax": "100", "aria-valuenow": String(Math.round(100 * done / (all + extra))) },
      [el("i", { style: "width:" + Math.round(100 * done / (all + extra)) + "%" })]);
  }

  /* visual aids: number ladders, fraction bars, factor chips */
  function ladderRow(label, n, upto, shared, reveal) {
    var row = el("div", { class: "lrow" }, [el("span", { class: "llabel", text: label })]), chips = el("span", { class: "chips" }), m;
    for (m = n; m <= upto; m += n) { chips.appendChild(el("span", { class: "chip" + (reveal && shared === m ? " hit" : ""), text: String(m) })); }
    row.appendChild(chips);
    return row;
  }
  function ladders(v, reveal) {
    var shared = MM.lcm(v.a, v.b);
    return el("div", { class: "ladders", role: "group", "aria-label": "Counting lists for " + v.a + " and " + v.b }, [
      ladderRow(v.a + "s", v.a, v.upto, shared, reveal), ladderRow(v.b + "s", v.b, v.upto, shared, reveal)]);
  }
  function bar(n, d, cls) {
    var b = el("span", { class: "fbar " + (cls || ""), role: "img", "aria-label": n + " of " + d + " parts" }), i;
    for (i = 0; i < d; i++) { b.appendChild(el("i", { class: i < n ? "on" : "" })); }
    return b;
  }
  function bars(v) {
    return el("div", { class: "bars" }, [el("div", { class: "brow" }, [fracNode(v.n, v.d), bar(v.n, v.d, "a")]), el("div", { class: "eq", text: "=", "aria-hidden": "true" }),
      el("div", { class: "brow" }, [fracNode(v.n2, v.d2), bar(v.n2, v.d2, "b")])]);
  }
  function factorsVisual(v) {
    var box = el("div", { class: "factors" });
    v.nums.forEach(function (n) {
      var f = MM.factors(n), ok = MM.isPrime(n);
      box.appendChild(el("div", { class: "frow" }, [el("strong", { text: String(n) }), el("span", { class: "chips" }, f.map(function (x) { return el("span", { class: "chip", text: String(x) }); })),
        el("span", { class: "tag " + (ok ? "yes" : "no"), text: n === 1 ? "only 1 factor" : ok ? "prime ✓" : "not prime" })]));
    });
    return box;
  }
  function visualNode(v, reveal) {
    if (!v) { return null; }
    var node = v.t === "ladders" ? ladders(v, reveal || v.reveal) : v.t === "bars" ? bars(v) : v.t === "factors" ? factorsVisual(v) : null;
    return node ? el("div", { class: "visual" }, [node]) : null;
  }

  function renderTeach(it) {
    var t = MM.TEACH[it.obj], ready = false, o = MM.OBJECTIVES[it.obj];
    setTimeout(function () { ready = true; }, 400);
    show(el("div", null, [topbar("Quick trick"), progress(), el("section", { class: "panel teach" }, [
      el("h2", { text: t.title }),
      el("div", { class: "lines" }, t.lines.map(function (l) { return richEl("p", "", l); })),
      visualNode(t.visual, true),
      el("p", { class: "note", text: "Now try one with different numbers!" }),
      el("button", { class: "btn big go", type: "button", text: "Got it — let me try", onclick: function () { if (ready) { next(); } } })
    ])]));
    cur = null;
    void o;
  }

  function renderQuestion(it) {
    var q = it.q, si = 0, tries = 0, wrongAny = false, revealed = false, done = false, selected = {}, tried = {}, live, optsBox, visualBox;

    function stepObj() { return q.steps[si]; }
    function byId(id) { var r = null; stepObj().options.forEach(function (o) { if (o.id === id) { r = o; } }); return r; }
    function btnFor(id) { return optsBox.querySelector('[data-id="' + id + '"]'); }
    function say(cls, nodes) { live.innerHTML = ""; var d = el("div", { class: cls, tabindex: "-1" }, nodes); live.appendChild(d); try { d.focus({ preventScroll: true }); } catch (e) { /* nicety */ } return d; }
    function lockAll() { Array.prototype.forEach.call(optsBox.querySelectorAll("button"), function (b) { b.disabled = true; }); }
    function result() { return revealed ? "miss" : wrongAny ? "second" : "first"; }

    function finishQuestion() {
      var res = result(), nodes = [], good = res !== "miss";
      done = true; lockAll();
      if (visualBox && q.visual && q.visual.t === "ladders") { visualBox.replaceWith(visualBox = visualNode(q.visual, true)); }
      record(it, res);
      nodes.push(el("h3", { text: res === "first" ? "Yes! Nice work." : res === "second" ? "You fixed it. Nice." : "Here is how it works" }));
      nodes.push(richEl("p", "", q.why));
      nodes.push(el("div", { class: "row" }, [el("button", { class: "btn go", type: "button", text: round.i === round.queue.length - 1 ? "See results" : "Next →", onclick: next })]));
      say("feedback " + (good ? "good" : "reveal"), nodes);
      if (!reduceMotion() && res === "first") { app.classList.add("pop"); setTimeout(function () { app.classList.remove("pop"); }, 600); }
    }
    function nextStep() { si += 1; tries = 0; tried = {}; selected = {}; draw(); }
    function stepDone() {
      var last = si === q.steps.length - 1;
      if (last || revealed) { finishQuestion(); return; }
      say("feedback good", [el("h3", { text: "Right!" }), richEl("p", "", stepObj().why), el("div", { class: "row" }, [el("button", { class: "btn go", type: "button", text: "Next step →", onclick: nextStep })])]);
      lockAll();
    }
    function reveal() {
      revealed = true;
      stepObj().options.forEach(function (o) { var b = btnFor(o.id); if (o.ok && b) { b.classList.add("good"); } });
      stepDone();
    }
    function wrong() {
      tries += 1; wrongAny = true;
      if (tries >= round.tries) { reveal(); return; }
      say("hint", [el("strong", { text: "Almost! " }), richEl("span", "", stepObj().hint + " Try again.")]);
      var b = optsBox.querySelector(".opt:not([disabled])");
      if (b) { try { b.focus(); } catch (e) { /* nicety */ } }
    }
    function choose(o) {
      var b = btnFor(o.id);
      if (done || tried[o.id]) { return; }
      if (o.ok) { b.classList.add("good"); stepDone(); return; }
      tried[o.id] = 1; b.classList.add("tried"); b.disabled = true;
      wrong();
    }
    function check() {
      var s = stepObj(), exact = s.options.every(function (o) { return !!selected[o.id] === !!o.ok; });
      if (exact) { s.options.forEach(function (o) { var b = btnFor(o.id); if (o.ok && b) { b.classList.add("good"); } }); stepDone(); return; }
      tries += 1; wrongAny = true;
      if (tries >= round.tries) { reveal(); return; }
      say("hint", [el("strong", { text: "Almost! " }), richEl("span", "", s.hint + " Change your picks and check again.")]);
    }

    function draw() {
      var s = stepObj(), kids = [], prompt, checkBtn = null;
      cur = { q: q, step: si };
      optsBox = el("div", { class: "opts" + (q.style === "tiles" ? " tiles" : "") + (s.options.some(function (o) { return o.t.length > 14; }) ? " wide" : "") });
      s.options.forEach(function (o, i) {
        var b = el("button", { class: "opt" + (q.style === "tiles" ? " tile" : ""), type: "button", "data-id": o.id, "aria-pressed": s.multi ? "false" : null });
        if (!s.multi) { b.appendChild(el("span", { class: "letter", text: "ABCD".charAt(i), "aria-hidden": "true" })); }
        b.appendChild(el("span", { class: "otext" }, [rich(o.t)]));
        b.addEventListener("click", function () {
          if (s.multi) { if (done) { return; } selected[o.id] = !selected[o.id]; b.classList.toggle("sel", !!selected[o.id]); b.setAttribute("aria-pressed", selected[o.id] ? "true" : "false"); }
          else { choose(o); }
        });
        optsBox.appendChild(b);
      });
      live = el("div", { class: "live", "aria-live": "polite" });
      visualBox = q.visual ? visualNode(q.visual, false) : null;
      prompt = richEl("p", "stem", q.prompt);
      if (q.style === "forge" || q.steps.length > 1) { kids.push(el("p", { class: "stepno", text: "Step " + (si + 1) + " of " + q.steps.length })); }
      kids.push(prompt);
      if (s.prompt) { kids.push(richEl("p", "stem sub", s.prompt)); }
      if (visualBox) { kids.push(visualBox); }
      kids.push(optsBox);
      if (s.multi) { checkBtn = el("button", { class: "btn go", type: "button", text: "Check my picks", onclick: check }); kids.push(el("div", { class: "row" }, [checkBtn])); }
      kids.push(live);
      show(el("div", null, [topbar(stageInfo(it)), progress(), el("section", { class: "panel q" }, kids)]));
    }
    draw();
  }

  /* ---------- recording results and adapting ---------- */
  function record(it, res) {
    var q = it.q, n = q.obj, o = store.obj[n], s = round.ses[n], prev, next, aided = it.aided;
    if (!s) { round.ses[n] = s = { state: lastOf(n) === "pending" || lastOf(n) === "again" ? "pending" : "" }; }
    prev = s.state; next = prev;
    if (res === "first") {
      if (aided) { if (prev === "") { next = "aided"; } }
      else if (prev === "pending" || prev === "again") { next = "fixed"; o.fixed += 1; }
      else if (prev === "" || prev === "aided") { next = "indep"; o.indep += 1; }
    } else {
      o.miss += (it.tag === "scaffold" ? 0 : 1);
      if (it.tag === "scaffold" && prev === "pending") { next = prev; }
      else if (prev === "pending" || prev === "again" || prev === "fixed") { next = "again"; }
      else { next = "pending"; }
    }
    s.state = next; o.seen += 1; o.last = next;
    round.log.push({ obj: n, res: res, tag: it.tag, counted: it.tag !== "scaffold" });
    saveStore();
    if (res !== "first" && round.adapt && it.tag !== "scaffold" && it.tag !== "retest" && it.tag !== "check") { adapt(it); }
  }
  function adapt(it) {
    var n = it.q.obj, t = MM.TEACH[n], style = n >= 4 && n <= 7 ? "ladder" : (n === 10 || n === 12 || n === 13 || n === 14) ? "forge" : "choice";
    var scaffold = item(mk(n, "easy", style, [it.q.key].concat(t.avoid || [])), "scaffold"), i = round.i + 1, finalAt, at, retest;
    round.queue.splice(i, 0, { k: "teach", obj: n }, scaffold);
    retest = item(mk(n, "std", "choice", [it.q.key, scaffold.q.key]), "retest");
    at = i + 2 + 3;
    finalAt = -1;
    round.queue.forEach(function (x, idx) { if (x.k === "finalcheck" && finalAt < 0) { finalAt = idx; } });
    if (finalAt >= 0) { at = Math.min(at, finalAt); }
    at = Math.min(at, round.queue.length);
    round.queue.splice(at, 0, retest);
  }

  /* ---------- results ---------- */
  function sessionGroups() {
    var g = { indep: [], fixed: [], aided: [], again: [] };
    Object.keys(round.ses).forEach(function (k) {
      var st = round.ses[k].state, n = Number(k);
      if (st === "indep") { g.indep.push(n); } else if (st === "fixed") { g.fixed.push(n); } else if (st === "aided") { g.aided.push(n); } else { g.again.push(n); }
    });
    return g;
  }
  function groupBlock(title, cls, list) {
    if (!list.length) { return null; }
    return el("div", { class: "grp " + cls }, [el("h3", { text: title }), el("ul", { class: "pills" }, list.sort(function (a, b) { return a - b; }).map(function (n) { return el("li", { text: MM.OBJECTIVES[n].title }); }))]);
  }
  function finish() {
    var r = round, counted = r.log.filter(function (x) { return x.counted; }), firsts = counted.filter(function (x) { return x.res === "first"; }).length, pct = counted.length ? Math.round(100 * firsts / counted.length) : 0;
    cur = null;
    if (r.kind === "morning") { store.runs.morning += 1; } else if (r.kind === "quick") { store.runs.quick += 1; } else if (r.kind === "game") { store.runs.game += 1; }
    if (r.kind === "challenge") { store.runs.challenge += 1; store.bestChallenge = Math.max(store.bestChallenge, pct); }
    saveStore();
    if (r.kind !== "misses" && window.StudyQuest && window.StudyQuest.record) { window.StudyQuest.record(GAME_ID, pct); }
    if (r.kind === "challenge") { renderChallengeResults(pct, firsts, counted.length); } else { renderResults(pct); }
  }
  function renderResults(pct) {
    var r = round, g = sessionGroups(), again = missedSkills(), kids = [], kind = r.kind;
    kids.push(el("h2", { text: kind === "morning" ? "MISSION COMPLETE!" : kind === "quick" ? "5-MINUTE REVIEW DONE!" : kind === "misses" ? "NICE PRACTICE!" : "ROUND COMPLETE!" }));
    kids.push(el("p", { class: "big", text: kind === "morning" || kind === "quick" ? "You're getting ready for your math test." : "Good work. Every try helps your brain remember." }));
    kids.push(el("p", { class: "note", text: "Right on the first try: " + pct + "%. First tries count most, and fixing a mistake counts too." }));
    kids.push(groupBlock("Got it on my own", "ok", g.indep));
    kids.push(groupBlock("Fixed it after a quick lesson", "fix", g.fixed));
    kids.push(groupBlock("Practiced with help", "help", g.aided));
    kids.push(groupBlock("Could use one more try", "try", g.again));
    if (kind === "quick") { kids.push(el("p", { class: "note", text: "This was a quick refresher. If you have more time, the full Morning Mission covers every skill." })); }
    kids.push(el("p", { class: "calm", text: "Take a deep breath. You practiced the right things. A good night's sleep and a good breakfast help your brain do its best." }));
    kids.push(el("div", { class: "stack" }, [
      again.length ? el("button", { class: "btn big gold", type: "button", text: "PRACTICE MY MISSES", onclick: function () { go(buildMisses()); } }) : null,
      el("a", { class: "btn big alt", href: "../", text: "ALL DONE — BACK TO STUDY QUEST" }),
      el("button", { class: "ghost", type: "button", text: "Back to Math Mission", onclick: goHome })
    ]));
    show(el("div", null, [el("section", { class: "panel result" }, kids)]));
  }
  function renderChallengeResults(pct, firsts, total) {
    var list = el("ul", { class: "pills long" });
    round.log.filter(function (x) { return x.tag === "challenge"; }).forEach(function (x) {
      list.appendChild(el("li", { class: x.res === "first" ? "okp" : "badp", "aria-label": MM.OBJECTIVES[x.obj].title + (x.res === "first" ? ": correct" : ": missed") }, [el("b", { text: x.res === "first" ? "✓" : "✗", "aria-hidden": "true" }), " " + MM.OBJECTIVES[x.obj].title]));
    });
    show(el("div", null, [el("section", { class: "panel result" }, [
      el("h2", { text: "TEST READY CHALLENGE" }), el("p", { class: "score", text: firsts + " of " + total }),
      el("p", { class: "note", text: "That is " + pct + "%. This is practice, not a prediction. Check the skills below." }), list,
      el("div", { class: "stack" }, [
        missedSkills().length ? el("button", { class: "btn big gold", type: "button", text: "PRACTICE MY MISSES", onclick: function () { go(buildMisses()); } }) : null,
        el("button", { class: "btn big", type: "button", text: "Play again with new numbers", onclick: function () { go(buildChallenge()); } }),
        el("a", { class: "btn big alt", href: "../", text: "ALL DONE — BACK TO STUDY QUEST" }),
        el("button", { class: "ghost", type: "button", text: "Back to Math Mission", onclick: goHome })])])]));
  }

  window.__MM_TEST = {
    current: function () {
      if (!cur) { return null; }
      var s = cur.q.steps[cur.step];
      return { key: cur.q.key, obj: cur.q.obj, style: cur.q.style, step: cur.step, steps: cur.q.steps.length, multi: s.multi, correctIds: s.options.filter(function (o) { return o.ok; }).map(function (o) { return o.id; }),
        wrongIds: s.options.filter(function (o) { return !o.ok; }).map(function (o) { return o.id; }) };
    },
    state: function () { return round ? { kind: round.kind, i: round.i, len: round.queue.length, ses: round.ses } : null; }
  };

  renderHome();
}());

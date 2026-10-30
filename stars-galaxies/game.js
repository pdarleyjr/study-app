/* Cosmic Quest: the game engine.
   One screen at a time is drawn into #app. Missions are lists of steps (lesson, question) defined in data.js.
   Every wrong answer gets a hint and a second try, then a plain explanation. Only the Chapter Detective is open-book. */
(function () {
  "use strict";
  var D = window.SG_DATA, ART = window.SG_ART, app = document.getElementById("app");
  if (!D || !ART || !app) { return; }

  var GAME_ID = "stars-galaxies";
  var KEY = "studyquest:stars-galaxies:v1"; /* detailed local progress; the shared best score goes through StudyQuest.record */
  var LETTERS = ["A", "B", "C", "D", "E"];
  var BENCH_FRESH_MIN = 6; /* each benchmark run uses at least this many new-example questions */
  var MAX_PRACTICE = 8;
  var canSpeak = "speechSynthesis" in window && "SpeechSynthesisUtterance" in window;
  var round = null, cur = null;

  /* ---------- small helpers ---------- */
  function el(tag, attrs, kids) {
    var n = document.createElement(tag), k;
    for (k in (attrs || {})) {
      if (attrs[k] === null || attrs[k] === undefined || attrs[k] === false) { continue; }
      if (k === "class") { n.className = attrs[k]; }
      else if (k === "text") { n.textContent = attrs[k]; }
      else if (k === "html") { n.innerHTML = attrs[k]; } /* only used for our own SVG art */
      else if (k.slice(0, 2) === "on") { n.addEventListener(k.slice(2), attrs[k]); }
      else { n.setAttribute(k, attrs[k]); }
    }
    (kids || []).forEach(function (c) { if (c) { n.appendChild(typeof c === "string" ? document.createTextNode(c) : c); } });
    return n;
  }
  function shuffle(list) {
    var a = list.slice(), i, j, t;
    for (i = a.length - 1; i > 0; i--) { j = Math.floor(Math.random() * (i + 1)); t = a[i]; a[i] = a[j]; a[j] = t; }
    return a;
  }
  function pickOne(list) { return list[Math.floor(Math.random() * list.length)]; }
  function reduceMotion() { return !!(window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches); }
  function art(spec) {
    var s = ART.render(spec);
    if (reduceMotion()) { s = s.replace(/<animate\w*\b[^>]*\/>/g, "").replace(/<animate\w*\b[^>]*>[\s\S]*?<\/animate\w*>/g, "").replace(/<set\b[^>]*\/>/g, ""); }
    return s;
  }
  function artBox(spec, cls) { return el("div", { class: "artbox" + (cls ? " " + cls : ""), html: art(spec) }); }
  function stop() { if (canSpeak) { try { window.speechSynthesis.cancel(); } catch (e) { /* optional feature */ } } }
  function speakBtn(getText) {
    if (!canSpeak) { return null; }
    return el("button", { class: "ghost", type: "button", text: "🔊 Read to me", onclick: function () {
      stop();
      try { window.speechSynthesis.speak(new window.SpeechSynthesisUtterance(getText())); } catch (e) { /* optional feature */ }
    } });
  }

  /* ---------- saved progress (local only, never throws) ---------- */
  function obj(v) { return v && typeof v === "object" && !Array.isArray(v) ? v : {}; }
  function loadStore() {
    var d = null;
    try { d = JSON.parse(localStorage.getItem(KEY)); } catch (e) { d = null; }
    d = obj(d);
    return { done: obj(d.done), lvl: obj(d.lvl), last: obj(d.last), missed: Array.isArray(d.missed) ? d.missed : [],
      bench: { runs: Number(obj(d.bench).runs) || 0, best: Number(obj(d.bench).best) || 0, last: Number(obj(d.bench).last) || 0 },
      detective: { runs: Number(obj(d.detective).runs) || 0, best: Number(obj(d.detective).best) || 0 } };
  }
  var store = loadStore();
  function setStore(patch) {
    var next = {}, k;
    for (k in store) { next[k] = store[k]; }
    for (k in patch) { next[k] = patch[k]; }
    store = next;
    try { localStorage.setItem(KEY, JSON.stringify(store)); } catch (e) { /* private mode or full storage: progress just won't be saved */ }
  }
  function withKey(o, k, v) { var c = {}, i; for (i in o) { c[i] = o[i]; } c[k] = v; return c; }

  /* ---------- question bank ---------- */
  var bank = {}, byObj = {}, byTopic = {}, objInfo = {}, missionById = {};
  D.questions.forEach(function (q) {
    bank[q.id] = q;
    if (q.obj > 0) { (byObj[q.obj] = byObj[q.obj] || []).push(q); }
    else { (byTopic[q.topic] = byTopic[q.topic] || []).push(q); }
  });
  D.objectives.forEach(function (o) { objInfo[o.n] = o; });
  D.missions.forEach(function (m) { missionById[m.id] = m; });
  var allSupport = D.questions.filter(function (q) { return !(q.obj > 0); });

  function pickVariant(n, used) {
    var list = byObj[n] || [], free = list.filter(function (q) { return !used[q.id]; });
    if (!free.length) { free = list; }
    var pool = free.filter(function (q) { return q.id !== store.last[n]; });
    return pickOne(pool.length ? pool : free);
  }
  function pickSupport(topic, n, used) {
    var pool = (byTopic[topic] || []).filter(function (q) { return !used[q.id]; });
    if (pool.length < n) { pool = pool.concat(allSupport.filter(function (q) { return !used[q.id] && pool.indexOf(q) < 0; })); }
    return shuffle(pool).slice(0, n);
  }

  /* ---------- building rounds ---------- */
  function qStep(q) { return { k: "q", id: q.id }; }
  function expand(m) {
    var used = {}, out = [{ k: "intro" }];
    m.steps.forEach(function (s) {
      var q;
      if (s.lesson) { out.push({ k: "lesson", id: s.lesson }); }
      else if (s.obj) { q = pickVariant(s.obj, used); if (q) { used[q.id] = 1; out.push(qStep(q)); } }
      else if (s.q) { used[s.q] = 1; out.push({ k: "q", id: s.q }); }
      else if (s.topic) { pickSupport(s.topic, s.n || 1, used).forEach(function (sq) { used[sq.id] = 1; out.push(qStep(sq)); }); }
    });
    return out;
  }
  function buildBench() {
    var picks = [], n, fresh, order;
    for (n = 1; n <= 15; n++) { picks.push(pickVariant(n, {})); }
    fresh = picks.filter(function (q) { return q.kind === "fresh"; }).length;
    order = shuffle(picks.map(function (q, i) { return i; }));
    order.forEach(function (i) {
      var alts;
      if (fresh >= BENCH_FRESH_MIN || picks[i].kind === "fresh") { return; }
      alts = (byObj[i + 1] || []).filter(function (q) { return q.kind === "fresh"; });
      if (!alts.length) { return; }
      picks[i] = pickOne(alts.filter(function (q) { return q.id !== store.last[i + 1]; }).length ? alts.filter(function (q) { return q.id !== store.last[i + 1]; }) : alts);
      fresh += 1;
    });
    return { kind: "bench", title: "Benchmark Challenge", steps: [{ k: "intro" }].concat(picks.map(qStep)), i: 0, items: [] };
  }
  function buildPractice(then) {
    var seen = {}, count = 0, steps = [{ k: "intro" }];
    store.missed.forEach(function (id) {
      var q = bank[id], skip = {}, pick, key;
      if (!q) { return; }
      key = q.obj > 0 ? "o" + q.obj : id;
      if (seen[key] || count >= MAX_PRACTICE) { return; }
      seen[key] = 1; count += 1; skip[id] = 1;
      pick = q.obj > 0 ? pickVariant(q.obj, skip) : q;
      steps.push(qStep(pick || q));
    });
    if (steps.length < 2) { return null; }
    return { kind: "practice", title: "Power-up round", steps: steps, i: 0, items: [], then: then || null };
  }
  function buildDetective() {
    var steps = [{ k: "intro" }];
    D.openBook.tasks.forEach(function (t) { steps.push({ k: "q", task: t }); });
    return { kind: "detective", title: D.openBook.title, steps: steps, i: 0, items: [] };
  }
  function buildMission(m) { return { kind: "mission", m: m, title: m.title, steps: expand(m), i: 0, items: [] }; }

  /* ---------- screen plumbing ---------- */
  function show(node) {
    stop();
    app.innerHTML = "";
    app.appendChild(node);
    var h = node.querySelector("h1, h2");
    if (h) { h.setAttribute("tabindex", "-1"); try { h.focus({ preventScroll: true }); } catch (e) { /* focus is a nicety */ } }
    window.scrollTo(0, 0);
  }
  function goHome() { round = null; cur = null; renderHome(); }
  function topbar(label) {
    return el("div", { class: "top" }, [
      el("button", { class: "ghost", type: "button", text: "← Home", onclick: goHome }),
      el("span", { class: "label", text: label || "" })
    ]);
  }
  function progressBar(done, total) {
    return el("div", { class: "bar", role: "progressbar", "aria-label": "Progress", "aria-valuemin": "0", "aria-valuemax": String(total), "aria-valuenow": String(done) },
      [el("i", { style: "width:" + Math.round(100 * done / Math.max(1, total)) + "%" })]);
  }
  function srcChip(src) {
    if (!src) { return null; }
    if (/^p\./.test(src)) { return el("span", { class: "chip book", text: "📖 Your book " + src }); }
    if (/extra/i.test(src)) { return el("span", { class: "chip", text: "✨ Extra science" }); }
    return null;
  }

  /* ---------- mastery ---------- */
  function lvlSymbol(n) {
    var v = store.lvl[n];
    if (v === 1) { return { s: "★", c: "m1", t: "got it" }; }
    if (v === 0.5) { return { s: "◐", c: "m5", t: "almost" }; }
    if (v === 0) { return { s: "○", c: "m0", t: "keep practicing" }; }
    return { s: "·", c: "mn", t: "not yet seen" };
  }
  function masteryMap() {
    var list = el("ul", { class: "map" });
    D.objectives.forEach(function (o) {
      var sy = lvlSymbol(o.n);
      list.appendChild(el("li", { class: sy.c, "aria-label": o.title + ": " + sy.t }, [el("b", { text: sy.s, "aria-hidden": "true" }), el("span", { text: o.title })]));
    });
    return list;
  }
  function starsFor(pct) { return pct >= 90 ? 3 : pct >= 70 ? 2 : 1; }
  function starText(n) { return "★★★".slice(0, n) + "☆☆☆".slice(0, 3 - n); }

  /* ---------- home ---------- */
  function missionCard(m, idx, isNext) {
    var stars = store.done[m.id];
    return el("li", null, [el("button", { class: "card" + (isNext ? " next" : ""), type: "button", onclick: function () { startRound(buildMission(m)); } }, [
      el("div", { class: "ic", html: art(m.icon || "icon-star") }),
      el("div", null, [el("h3", { text: "Mission " + (idx + 1) + ": " + m.title }), el("p", { text: m.blurb })]),
      el("span", { class: "go", text: stars ? starText(stars) + " Replay" : (isNext ? "Start here ▶" : "Start ▶") })
    ])]);
  }
  function renderHome() {
    var nextIdx = -1, i, ms = D.missions, path = el("ul", { class: "path" }), cta, ctaText;
    for (i = 0; i < ms.length; i++) { if (!store.done[ms[i].id]) { nextIdx = i; break; } }
    ms.forEach(function (m, idx) { path.appendChild(missionCard(m, idx, idx === nextIdx)); });

    path.appendChild(el("li", null, [el("button", { class: "card open", type: "button", onclick: function () { startRound(buildDetective()); } }, [
      el("div", { class: "ic", html: art("icon-book") }),
      el("div", null, [el("h3", null, [D.openBook.title + " ", el("span", { class: "chip open", text: "OPEN BOOK" })]),
        el("p", { text: "The only open-book game. Get your science book and learn how to find answers in it." })]),
      el("span", { class: "go", text: store.detective.runs ? "Best " + store.detective.best + "% ▶" : "Start ▶" })
    ])]));
    path.appendChild(el("li", null, [el("button", { class: "card bench" + (nextIdx < 0 && !store.bench.runs ? " next" : ""), type: "button", onclick: startBenchFlow }, [
      el("div", { class: "ic", html: art("icon-trophy") }),
      el("div", null, [el("h3", { text: "Benchmark Challenge" }), el("p", { text: "15 questions, one for every Unit 3 benchmark skill. No book, no timer." })]),
      el("span", { class: "go", text: store.bench.runs ? "Best " + store.bench.best + "% ▶" : "Final test ▶" })
    ])]));

    if (nextIdx >= 0) { ctaText = (nextIdx > 0 ? "Continue: " : "Start: ") + ms[nextIdx].title; cta = function () { startRound(buildMission(ms[nextIdx])); }; }
    else { ctaText = "Take the Benchmark Challenge"; cta = startBenchFlow; }

    var node = el("div", null, [
      el("section", { class: "hero" }, [el("div", { html: art("hero") }), el("div", { class: "words" }, [el("h1", { text: "Cosmic Quest" }), el("p", { text: "Stars & Galaxies space missions" })])]),
      el("div", { class: "row" }, [el("button", { class: "btn gold big", type: "button", text: "🚀 " + ctaText, onclick: cta })]),
      el("h2", { text: "Your mission path" }),
      path,
      store.missed.length ? el("button", { class: "btn alt", type: "button", text: "💪 Practice what I missed (" + store.missed.length + ")", onclick: function () { var r = buildPractice(null); if (r) { startRound(r); } } }) : null,
      el("section", { class: "panel" }, [el("h2", { text: "Your 15 skills" }),
        el("p", { class: "muted", text: "★ got it   ◐ almost   ○ keep practicing   · not yet seen" }), masteryMap()]),
      el("p", null, [el("a", { class: "ghost", href: "../", text: "← Study Quest home" })])
    ]);
    show(node);
  }
  function startBenchFlow() {
    var weak = D.objectives.filter(function (o) { return store.lvl[o.n] !== undefined && store.lvl[o.n] < 1; });
    if (weak.length && store.missed.length) { renderBenchGate(weak); return; }
    startRound(buildBench());
  }
  function renderBenchGate(weak) {
    var node = el("div", null, [topbar("Benchmark Challenge"), el("section", { class: "panel" }, [
      el("h2", { text: "Quick power-up first?" }),
      el("p", { text: "A few skills could use one more try: " + weak.slice(0, 4).map(function (o) { return o.title; }).join(", ") + (weak.length > 4 ? ", and more" : "") + "." }),
      el("p", { class: "muted", text: "A short power-up round takes about two minutes, then you go straight into the benchmark." }),
      el("div", { class: "row" }, [
        el("button", { class: "btn gold", type: "button", text: "Power up first", onclick: function () { var r = buildPractice("bench"); startRound(r || buildBench()); } }),
        el("button", { class: "btn alt", type: "button", text: "Go to the benchmark", onclick: function () { startRound(buildBench()); } })
      ])
    ])]);
    show(node);
  }

  /* ---------- rounds ---------- */
  function startRound(r) { round = r; r.i = 0; renderStep(); }
  function totalQ() { return round.steps.length - 1; }
  function advance() { round.i += 1; if (round.i >= round.steps.length) { finishRound(); } else { renderStep(); } }
  function renderStep() {
    var s = round.steps[round.i];
    cur = null;
    if (s.k === "intro") { renderIntro(); }
    else if (s.k === "lesson") { renderLesson(s); }
    else { renderQuestion(s); }
  }
  function renderIntro() {
    var r = round, nq = r.steps.filter(function (s) { return s.k === "q"; }).length, nl = r.steps.filter(function (s) { return s.k === "lesson"; }).length;
    var icon = r.kind === "mission" ? r.m.icon : r.kind === "bench" ? "icon-trophy" : r.kind === "detective" ? "icon-book" : "icon-rocket";
    var text = r.kind === "mission" ? r.m.intro : r.kind === "bench" ? "This practices every skill from your Unit 3 benchmark: words, diagrams, and star-chart reading. One question per skill. Wrong answers get a hint and a second try." :
      r.kind === "practice" ? "A short round on the skills that need one more try. These are fresh examples, so you will think it through." : "";
    var kids = [el("div", { class: "artbox", style: "max-width:140px", html: art(icon) }), el("h2", { text: r.title }), el("p", { text: text })];
    if (r.kind === "detective") {
      kids = [el("div", { class: "artbox", style: "max-width:140px", html: art(icon) }), el("h2", { text: D.openBook.title }),
        el("p", null, [el("span", { class: "chip open", text: "OPEN BOOK" }), " This is the only open-book game."]), el("p", { text: D.openBook.intro }),
        el("p", { class: "tip", text: "Each task shows a little map of the page. Find that spot in your book, read it, then pick your answer." })];
    }
    kids.push(el("p", { class: "muted", text: (nl ? nl + " short lessons · " : "") + nq + " questions · no timer" }));
    kids.push(el("button", { class: "btn gold big", type: "button", text: r.kind === "detective" ? "I have my book — start" : "Launch", onclick: advance }));
    show(el("div", null, [topbar(r.title), el("section", { class: "panel result" }, kids)]));
  }

  /* ---------- lessons ---------- */
  function twinsWidget() {
    var box = el("div", { class: "widget" }), view = el("div", { class: "artbox" }), out = el("p", { class: "readout", "aria-live": "polite" });
    var input = el("input", { type: "range", min: "12", max: "56", step: "1", value: "24", id: "twinsize" });
    function draw() {
      var v = Number(input.value);
      view.innerHTML = art({ name: "twins", color: "yellow", size: v, meter: true });
      out.textContent = v < 24 ? "A small star gives off only a little light." : v < 40 ? "A medium star gives off a medium amount of light." : "A big star gives off a LOT of light.";
    }
    input.addEventListener("input", draw);
    box.appendChild(el("label", { for: "twinsize", text: "Slide to make the star bigger or smaller" }));
    box.appendChild(view); box.appendChild(input); box.appendChild(out);
    draw();
    return box;
  }
  function renderLesson(s) {
    var l = D.lessons[s.id], ready = false, kids = [], last = round.i === round.steps.length - 1;
    if (!l) { advance(); return; }
    setTimeout(function () { ready = true; }, 350); /* a quick double-tap should not skip a lesson */
    kids.push(el("h2", { text: l.title }));
    if (l.widget === "twins") { kids.push(twinsWidget()); } else if (l.art) { kids.push(artBox(l.art)); }
    l.text.forEach(function (t) { kids.push(el("p", { text: t })); });
    if (l.tip) { kids.push(el("p", { class: "tip", text: "💡 " + l.tip })); }
    kids.push(el("div", { class: "row" }, [
      el("button", { class: "btn", type: "button", text: last ? "Finish" : "Got it →", onclick: function () { if (ready) { advance(); } } }),
      speakBtn(function () { return l.title + ". " + l.text.join(" "); })
    ]));
    show(el("div", null, [topbar(round.title), progressBar(round.i - 1, totalQ()), el("section", { class: "panel lesson" }, kids)]));
  }

  /* ---------- questions ---------- */
  function openQuestion(t) {
    return { id: t.id, obj: -1, type: "choice", text: t.prompt, options: t.options, open: true, find: t.find, page: t.page, region: t.region,
      hint: "Look again at the spot on the map. Read it slowly and compare each choice with what the page says.", why: t.why, src: t.src };
  }
  function prepare(step) {
    var q = step.task ? openQuestion(step.task) : bank[step.id], c = {}, k;
    for (k in q) { c[k] = q[k]; }
    c.options = shuffle(q.options);
    return c;
  }
  function correctText(q) {
    var i, o;
    for (i = 0; i < q.options.length; i++) {
      o = q.options[i];
      if (o.ok) { return o.t || ("picture " + LETTERS[i]); }
    }
    return "";
  }
  function recordResult(q, credit) {
    var next = store.missed.slice();
    round.items.push({ id: q.id, obj: q.obj, credit: credit });
    if (q.open) { return; }
    if (credit === 1) {
      next = next.filter(function (id) { var b = bank[id]; return id !== q.id && !(q.obj > 0 && b && b.obj === q.obj); });
    } else if (next.indexOf(q.id) < 0) { next.push(q.id); }
    if (q.obj > 0) { setStore({ missed: next, lvl: withKey(store.lvl, q.obj, credit), last: withKey(store.last, q.obj, q.id) }); }
    else { setStore({ missed: next }); }
  }
  function renderQuestion(step) {
    var q = prepare(step), st = { attempts: 0, done: false, tried: {} }, qn = round.i, byId = {}, opts, live, node, stem;
    q.options.forEach(function (o) { byId[o.id] = o; });
    cur = q;

    function mark(id, cls) {
      var nodes = app.querySelectorAll('[data-id="' + id + '"], [data-opt="' + id + '"]'), i;
      for (i = 0; i < nodes.length; i++) {
        nodes[i].classList.add(cls);
        if (nodes[i].tagName === "BUTTON") {
          nodes[i].disabled = true;
          nodes[i].setAttribute("aria-label", (byId[id].t || "Picture") + (cls === "tried" ? " — not quite" : cls === "good" ? " — correct" : ""));
        } else { nodes[i].setAttribute("aria-disabled", "true"); }
      }
    }
    function lockAll() {
      var b = app.querySelectorAll(".opt, .hot"), i;
      for (i = 0; i < b.length; i++) { if (b[i].tagName === "BUTTON") { b[i].disabled = true; } b[i].setAttribute("aria-disabled", "true"); }
    }
    function nextBtn() {
      var last = round.i === round.steps.length - 1;
      return el("button", { class: "btn", type: "button", text: last ? "See results" : "Next →", onclick: advance });
    }
    function feedback(credit) {
      var title = credit === 1 ? "Yes! ✓" : credit === 0.5 ? "Got it on the second try ✓" : "Here is how it works", kids = [], fb;
      kids.push(el("h3", { text: title }));
      if (credit === 0) { kids.push(el("p", null, [el("strong", { text: "Answer: " }), correctText(q)])); }
      kids.push(el("p", { text: q.why }));
      if (q.open) {
        kids.push(el("div", { class: "find" }, [el("div", { class: "openmap", html: art({ name: "page-map", region: q.region }) }),
          el("div", null, [el("strong", { text: "How to find it: " }), q.find])]));
      }
      kids.push(el("div", { class: "row" }, [nextBtn(), srcChip(q.src)]));
      fb = el("div", { class: credit > 0 ? "feedback good" : "feedback reveal", tabindex: "-1" }, kids);
      live.innerHTML = ""; live.appendChild(fb);
      try { fb.focus({ preventScroll: true }); } catch (e) { /* nicety */ }
      fb.scrollIntoView({ block: "nearest", behavior: reduceMotion() ? "auto" : "smooth" });
    }
    function answer(id) {
      if (st.done || st.tried[id]) { return; }
      var o = byId[id], left, firstEnabled, credit;
      if (o.ok) {
        st.done = true; mark(id, "good"); lockAll();
        credit = st.attempts === 0 ? 1 : 0.5;
        recordResult(q, credit); feedback(credit);
        return;
      }
      st.attempts += 1; st.tried[id] = 1; mark(id, "tried");
      left = q.options.filter(function (x) { return !st.tried[x.id]; });
      if (st.attempts >= 2 || left.length <= 1) {
        st.done = true; q.options.forEach(function (x) { if (x.ok) { mark(x.id, "good"); } }); lockAll();
        recordResult(q, 0); feedback(0);
        return;
      }
      live.innerHTML = "";
      live.appendChild(el("div", { class: "hint", role: "status" }, [el("strong", { text: "Not quite, and that's okay. " }), "Hint: " + q.hint + " Try another answer."]));
      firstEnabled = app.querySelector(".opt:not([disabled])");
      if (firstEnabled) { try { firstEnabled.focus(); } catch (e) { /* nicety */ } }
    }

    opts = el("ul", { class: "opts" + (q.type === "picture" ? " pics" + (q.options.length === 3 ? " three" : "") : "") });
    q.options.forEach(function (o, i) {
      opts.appendChild(el("li", null, [el("button", { class: "opt" + (q.type === "picture" ? " pic" : ""), type: "button", "data-id": o.id,
        "aria-label": q.type === "picture" ? (o.t ? o.t : "Picture " + LETTERS[i]) : null, onclick: function () { answer(o.id); } }, [
        el("span", { class: "letter", text: LETTERS[i], "aria-hidden": "true" }),
        o.art ? el("span", { class: "optart", html: art(o.art) }) : null,
        o.t ? el("span", { class: "opttext", text: o.t }) : null
      ])]));
    });
    live = el("div", { "aria-live": "polite" });

    stem = [];
    if (q.open) { stem.push(el("span", { class: "pagebadge", text: "Page " + q.page }), " ", el("span", { class: "chip open", text: "OPEN BOOK" })); }
    if (q.art && !q.open) {
      if (q.type === "hotspot") {
        var hotWrap = el("div", { class: "artbox hotbox", html: art(q.art) });
        Array.prototype.forEach.call(hotWrap.querySelectorAll("[data-opt]"), function (h) {
          var id = h.getAttribute("data-opt"), o = byId[id];
          if (!o) { return; }
          h.setAttribute("tabindex", "0"); h.setAttribute("role", "button"); h.setAttribute("aria-label", o.t || id);
          h.addEventListener("click", function () { answer(id); });
          h.addEventListener("keydown", function (e) { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); answer(id); } });
        });
        stem.push(hotWrap);
      } else { stem.push(artBox(q.art)); }
    }
    stem.push(el("p", { class: "stem", text: q.text }));
    if (q.open) { stem.push(el("div", { class: "openmap", html: art({ name: "page-map", region: q.region }) })); }

    node = el("div", null, [topbar(round.title + " · " + qn + " of " + totalQ()), progressBar(qn - 1, totalQ()),
      el("section", { class: "panel" }, stem.concat([
        q.type === "hotspot" ? el("p", { class: "muted", text: "Tap a star on the chart, or pick a name below." }) : null,
        el("div", { class: q.type === "hotspot" ? "hotlist" : "" }, [opts]), live,
        el("div", { class: "row" }, [speakBtn(function () { return q.text; })])
      ]))]);
    show(node);
  }

  /* ---------- results ---------- */
  function sumCredits(items) { return items.reduce(function (a, b) { return a + b.credit; }, 0); }
  function objChips(list, creditOf) {
    var ul = el("ul", { class: "chips" });
    list.forEach(function (o) {
      var c = creditOf(o), sym = c === 1 ? ["★", "c1", "got it"] : c === 0.5 ? ["◐", "c5", "second try"] : ["○", "c0", "keep practicing"];
      ul.appendChild(el("li", { class: sym[1], "aria-label": o.title + ": " + sym[2] }, [el("b", { text: sym[0], "aria-hidden": "true" }), el("span", { text: o.title })]));
    });
    return ul;
  }
  function itemCredit(n) {
    var found = null;
    round.items.forEach(function (it) { if (it.obj === n) { found = it.credit; } });
    return found;
  }
  function finishRound() {
    var r = round, n = r.items.length, pct = n ? Math.round(100 * sumCredits(r.items) / n) : 0, stars = starsFor(pct), kids, missedNow, nextM, idx, buttons = [];
    missedNow = r.items.filter(function (it) { return it.credit < 1; }).length;
    cur = null;

    if (r.kind === "mission") { setStore({ done: withKey(store.done, r.m.id, Math.max(stars, store.done[r.m.id] || 0)) }); }
    if (r.kind === "bench") {
      setStore({ bench: { runs: store.bench.runs + 1, best: Math.max(store.bench.best, pct), last: pct } });
      if (window.StudyQuest && window.StudyQuest.record) { window.StudyQuest.record(GAME_ID, pct); }
    }
    if (r.kind === "detective") { setStore({ detective: { runs: store.detective.runs + 1, best: Math.max(store.detective.best, pct) } }); }

    kids = [el("h2", { text: r.kind === "bench" ? "Benchmark Challenge results" : r.kind === "detective" ? "Case closed!" : r.kind === "practice" ? "Power-up complete!" : "Mission complete!" }),
      el("div", { class: "stars", "aria-label": stars + " of 3 stars", text: starText(stars) }),
      el("div", { class: "score", text: pct + "%" }),
      el("p", { class: "muted", text: r.kind === "bench" ? "First try = full credit, second try = half. Best so far: " + store.bench.best + "%." : "Great effort. Wrong answers just show where to look next." })];

    if (r.kind === "bench") { kids.push(el("h3", { text: "Your 15 benchmark skills" })); kids.push(objChips(D.objectives, function (o) { var c = itemCredit(o.n); return c === null ? 0 : c; })); }
    else if (r.kind === "mission") { kids.push(el("h3", { text: "Skills in this mission" })); kids.push(objChips(D.objectives.filter(function (o) { return r.m.objectives.indexOf(o.n) >= 0; }), function (o) { return store.lvl[o.n] === undefined ? 0 : store.lvl[o.n]; })); }
    else if (r.kind === "detective") {
      kids.push(el("p", { class: "tip", text: "Finding answers fast means knowing where to look: headings, bold words, captions, diagram labels, and callout boxes." }));
    }

    if (r.kind === "mission") {
      idx = D.missions.indexOf(r.m); nextM = D.missions[idx + 1];
      buttons.push(nextM ? el("button", { class: "btn gold", type: "button", text: "Next: " + nextM.title, onclick: function () { startRound(buildMission(nextM)); } })
        : el("button", { class: "btn gold", type: "button", text: "Try the Benchmark Challenge", onclick: startBenchFlow }));
    }
    if (r.kind === "practice" && r.then === "bench") { buttons.push(el("button", { class: "btn gold", type: "button", text: "Start the Benchmark", onclick: function () { startRound(buildBench()); } })); }
    if (missedNow && r.kind !== "detective" && store.missed.length) {
      buttons.push(el("button", { class: "btn alt", type: "button", text: "💪 Practice what I missed", onclick: function () { var p = buildPractice(null); if (p) { startRound(p); } else { goHome(); } } }));
    }
    if (r.kind === "bench") { buttons.push(el("button", { class: "btn", type: "button", text: "Play again (new examples)", onclick: function () { startRound(buildBench()); } })); }
    if (r.kind === "detective") { buttons.push(el("button", { class: "btn", type: "button", text: "Play again", onclick: function () { startRound(buildDetective()); } })); }
    buttons.push(el("button", { class: "btn alt", type: "button", text: "Home", onclick: goHome }));
    kids.push(el("div", { class: "row", style: "justify-content:center" }, buttons));
    show(el("div", null, [el("section", { class: "panel result" }, kids)]));
  }

  window.__SG_TEST = {
    current: function () {
      return cur ? { id: cur.id, obj: cur.obj, open: !!cur.open, correctIds: cur.options.filter(function (o) { return o.ok; }).map(function (o) { return o.id; }) } : null;
    },
    state: function () { return round ? { kind: round.kind, i: round.i, total: round.steps.length } : null; }
  };

  renderHome();
}());

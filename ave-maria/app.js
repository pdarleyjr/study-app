/* Ave María Quest — router, dashboard, Tonight's Plan, prayer card, game frame.
   Games live in games-learn.js / games-challenge.js and are called as AM_GAMES.<name>(mount, ctx, opts) -> { destroy() }. */
(function () {
  "use strict";
  var QK = window.QuestKit, D = window.AveMariaData;
  var appEl = document.getElementById("app");
  if (!QK || !D || !appEl) { return; } // the static loading panel with its working links stays
  var h = QK.h;
  var ART = window.AM_ART || { render: function () { return ""; } };
  var SP = window.AM_SPEECH || { canSpeak: function () { return false; }, say: function () {}, stop: function () {}, onChange: function () {}, voiceName: function () { return ""; } };
  var store = QK.store("studyquest:ave-maria:v1");
  var BREAK_MS = 10 * 60 * 1000;
  var RESULTS = ["right", "hint", "wrong"];

  /* ---------- storage (tolerates corrupt or missing data) ---------- */
  function isObj(x) { return x && typeof x === "object" && !Array.isArray(x); }
  function normalize(d) {
    d = isObj(d) ? d : {};
    var o = { v: 1, points: Math.max(0, Math.floor(+d.points || 0)), words: {}, plan: {}, breakStart: null, games: {},
      tests: { best: null, last: null, attempts: [] }, lastRoute: typeof d.lastRoute === "string" ? d.lastRoute : "home" };
    if (isObj(d.words)) {
      Object.keys(d.words).forEach(function (k) {
        var i = +k;
        if (i >= 0 && i < 31 && i % 1 === 0 && Array.isArray(d.words[k])) {
          o.words[i] = d.words[k].filter(function (r) { return RESULTS.indexOf(r) >= 0; }).slice(-4);
        }
      });
    }
    if (isObj(d.plan)) { Object.keys(d.plan).forEach(function (k) { if (typeof d.plan[k] === "number" && d.plan[k] > 0) { o.plan[k] = d.plan[k]; } }); }
    if (typeof d.breakStart === "number" && d.breakStart > 0) { o.breakStart = d.breakStart; }
    if (isObj(d.games)) { o.games = d.games; }
    if (isObj(d.tests)) {
      o.tests.best = isObj(d.tests.best) ? d.tests.best : null;
      o.tests.last = isObj(d.tests.last) ? d.tests.last : null;
      o.tests.attempts = Array.isArray(d.tests.attempts) ? d.tests.attempts.filter(isObj).slice(-30) : [];
    }
    return o;
  }
  function get() { return normalize(store.get()); }
  function save(fn) { var d = get(); fn(d); store.set(d); return d; }

  /* ---------- derived values ---------- */
  function strength(i) {
    var a = get().words[i] || [];
    if (!a.length) { return "new"; }
    if (a.length >= 2 && a[a.length - 1] === "right" && a[a.length - 2] === "right") { return "strong"; }
    return "shaky";
  }
  function rankFor(points) {
    var R = D.RANKS, idx = 0, k;
    for (k = 0; k < R.length; k++) { if (points >= R[k].min) { idx = k; } }
    var next = R[idx + 1] || null;
    return { i: idx, rank: R[idx], next: next, pct: next ? Math.min(100, Math.round((points - R[idx].min) / (next.min - R[idx].min) * 100)) : 100,
      toNext: next ? next.min - points : 0 };
  }
  function fmtTime(ms) { try { return new Date(ms).toLocaleTimeString([], { hour: "numeric", minute: "2-digit" }); } catch (e) { return ""; } }
  function icon(name, extra, opts) { return h("span", { class: "am-icon " + (extra || ""), "aria-hidden": "true", html: ART.render(name, opts) }); }
  function planStep(id) { return D.PLAN.filter(function (s) { return s.id === id; })[0] || null; }

  /* ---------- plan <-> routes ---------- */
  var QUEUES = { meet: [["meet"]], learnAB: [["learn", "A"], ["learn", "B"]], learnCD: [["learn", "C"], ["learn", "D"]], vanish: [["vanish"]],
    "break": [["break"]], recall: [["next"], ["slip"], ["blanks"]], test: [["test"]], bedtime: [["bedtime"]] };
  function href(name, arg, planId) { return "#" + name + (arg ? "/" + arg : "") + (planId ? "?plan=" + planId : ""); }
  function stepHref(step) { var q = QUEUES[step.id]; return q ? href(q[0][0], q[0][1], step.id) : "#plan"; }
  function nextStep() { var p = get().plan; return D.PLAN.filter(function (s) { return !p[s.id]; })[0] || null; }
  function parseHash() {
    var raw = (location.hash || "").replace(/^#/, ""), q = raw.split("?"), parts = q[0].split("/"), plan = null;
    var m = /(?:^|&)plan=([A-Za-z]+)/.exec(q[1] || "");
    if (m && QUEUES[m[1]]) { plan = m[1]; }
    return { name: parts[0] || "home", arg: parts[1] || "", plan: plan };
  }
  function partTitle(id) { var p = D.PARTS.filter(function (x) { return x.id === id; })[0]; return p; }
  var GAME_TITLES = { meet: "Meet the prayer", vanish: "Disappearing words", build: "Word builder", next: "What comes next?", slip: "Spot the slip", blanks: "Fill in the blank",
    match: "Meaning match", test: "Test-day practice", bedtime: "Bedtime lock-in", morning: "Morning warm-up" };
  function titleFor(name, arg) {
    if (name === "learn") { var p = partTitle(arg); return p ? "Learn " + arg + ": " + p.title : "Learn the prayer"; }
    return GAME_TITLES[name] || "Ave María Quest";
  }

  /* ---------- toasts, chips, points ---------- */
  var toastBox = h("div", { class: "am-toasts", "aria-live": "polite", role: "status" });
  document.body.appendChild(toastBox);
  function toast(msg, pts) {
    var t = h("div", { class: "am-toast" }, pts ? h("b", null, "+" + pts + " ") : null, msg);
    toastBox.appendChild(t);
    while (toastBox.children.length > 3) { toastBox.removeChild(toastBox.firstChild); }
    setTimeout(function () { if (t.parentNode) { t.parentNode.removeChild(t); } }, 2000);
  }
  function refreshChips() {
    var d = get(), r = rankFor(d.points);
    Array.prototype.forEach.call(document.querySelectorAll(".am-pchip-pts"), function (el) { el.textContent = d.points + " pts"; });
    Array.prototype.forEach.call(document.querySelectorAll(".am-pchip-rank"), function (el) { el.textContent = r.rank.title; });
  }
  function award(points, label) {
    points = Math.round(+points || 0);
    if (points <= 0) { return get().points; }
    var d = save(function (x) { x.points += points; });
    toast(label || "points", points);
    refreshChips();
    return d.points;
  }

  /* ---------- routing core ---------- */
  var cur = null, timers = [], curScreen = "", spokenOk = null;
  function clearTimers() { timers.forEach(function (t) { clearInterval(t); clearTimeout(t); }); timers = []; }
  function teardown() {
    if (cur && cur.destroy) { try { cur.destroy(); } catch (e) { /* a game must not block navigation */ } }
    cur = null; clearTimers(); SP.stop();
  }
  function show(nodes, title, screen) {
    appEl.replaceChildren.apply(appEl, [].concat(nodes));
    document.title = title + " — Ave María Quest — Study Quest";
    document.body.classList.toggle("am-inner", screen !== "home");
    curScreen = screen;
    var hd = appEl.querySelector("h1[tabindex]");
    window.scrollTo(0, 0);
    if (hd) { try { hd.focus({ preventScroll: true }); } catch (e) { /* ignore */ } }
  }
  function chipsEl() {
    var d = get(), r = rankFor(d.points);
    return h("div", { class: "am-chips" }, h("span", { class: "am-pchip" }, "⭐ ", h("b", { class: "am-pchip-pts" }, d.points + " pts")),
      h("span", { class: "am-pchip" }, "🏅 ", h("b", { class: "am-pchip-rank" }, r.rank.title)));
  }

  /* ---------- home ---------- */
  var TILES = [
    { n: "meet", t: "Meet the prayer", d: "What each line means and how it sounds.", i: "icon-meet", href: "#meet" },
    { n: "learn", a: "A", i: "icon-learn", d: "Listen, echo, build: lines 1–2." },
    { n: "learn", a: "B", i: "icon-learn", d: "Add the blessing: lines 3–4." },
    { n: "learn", a: "C", i: "icon-learn", d: "Add the request: lines 5–6." },
    { n: "learn", a: "D", i: "icon-learn", d: "Finish it and join all four parts." },
    { n: "vanish", t: "Disappearing words", d: "Words fade until you say it from memory.", i: "icon-vanish", href: "#vanish" },
    { n: "blanks", t: "Fill in the blank", d: "Type or pick the missing words.", i: "icon-blanks", href: "#blanks" },
    { n: "build", t: "Word builder", d: "Rebuild a line from shuffled words.", i: "icon-build", href: "#build" },
    { n: "next", t: "What comes next?", d: "Nail the spots where people stumble.", i: "icon-next", href: "#next" },
    { n: "slip", t: "Spot the slip", d: "Find the one wrong word.", i: "icon-slip", href: "#slip" },
    { n: "match", t: "Meaning match", d: "Pair the Latin with its English.", i: "icon-match", href: "#match" },
    { n: "bedtime", t: "Bedtime lock-in", d: "Say it once before sleep.", i: "icon-plan", href: "#bedtime", art: "moon" }
  ];

  function leadCard() {
    var d = get(), nx = nextStep(), done = D.PLAN.filter(function (s) { return d.plan[s.id]; }).length;
    var title, text, label, link;
    if (!nx) { title = "Tonight's plan is complete ✓"; text = "Nice work. Sleep locks it in. Check the plan or play any game below."; label = "See my plan"; link = "#plan"; }
    else if (done === 0) { title = "Tonight's plan"; text = D.PLAN.length + " short steps, about " + D.PLAN.reduce(function (a, s) { return a + s.minutes; }, 0) + " minutes, with a real break."; label = "Start tonight's plan"; link = stepHref(nx); }
    else { title = "Tonight's plan · " + done + " of " + D.PLAN.length + " done"; text = "Next up: " + nx.title + " (" + nx.minutes + " min)."; label = "Continue: " + nx.title; link = stepHref(nx); }
    return h("section", { class: "am-card am-lead", "aria-labelledby": "am-lead-h" },
      h("span", { class: "am-icon", style: "width:64px;height:64px", "aria-hidden": "true", html: ART.render("icon-plan") }),
      h("div", { class: "am-lead-text" }, h("h2", { id: "am-lead-h" }, title), h("p", { class: "am-muted" }, text)),
      h("a", { class: "qk-btn qk-btn-primary", href: link }, label, " →"));
  }
  function testCard() {
    var t = get().tests, best = t.best, last = t.last;
    return h("section", { class: "am-card", "aria-labelledby": "am-test-h" },
      h("div", { class: "am-card-head" }, icon("icon-test"), h("h2", { id: "am-test-h" }, "Test-day practice /31")),
      best ? h("div", { class: "am-stat" },
        h("div", null, h("b", null, best.score + "/" + best.total), h("span", null, "Best score")),
        last ? h("div", null, h("b", null, last.score + "/" + last.total), h("span", null, "Last · attempt " + (last.attempt || "?"))) : null,
        h("div", null, h("b", null, String(t.attempts.length)), h("span", null, "Tries")))
        : h("p", { class: "am-muted" }, "Say the whole prayer, then score it out of 31 like the real sheet. Up to 3 tries."),
      h("div", { class: "am-btn-row" }, h("a", { class: "qk-btn qk-btn-primary", href: "#test" }, best ? "Try again" : "Start a practice test")));
  }
  function morningCard() {
    var m = D.MORNING, at = get().plan.morning;
    return h("section", { class: "am-card", "aria-labelledby": "am-morn-h" },
      h("div", { class: "am-card-head" }, icon("sun"), h("h2", { id: "am-morn-h" }, "Morning warm-up")),
      h("p", { class: "am-muted" }, m.minutes + " minutes · " + m.text), at ? h("p", { class: "am-done-at" }, "✓ Done " + fmtTime(at)) : null,
      h("div", { class: "am-btn-row" }, h("a", { class: "qk-btn qk-btn-ghost", href: "#morning" }, "Open the warm-up")));
  }
  function rankCard() {
    var d = get(), r = rankFor(d.points);
    return h("section", { class: "am-card", "aria-labelledby": "am-rank-h" },
      h("h2", { id: "am-rank-h", class: "qk-sr" }, "Your rank"),
      h("div", { class: "am-rank" }, icon("badge", "", { text: r.rank.title.charAt(0) }),
        h("div", { class: "am-rank-body" },
          h("div", { class: "am-rank-title am-latin" }, r.rank.title, h("small", null, r.rank.en)),
          h("div", { class: "am-bar", role: "progressbar", "aria-valuemin": "0", "aria-valuemax": "100", "aria-valuenow": String(r.pct), "aria-label": "Progress to next rank" }, h("span", { style: "width:" + r.pct + "%" })),
          h("p", { class: "am-muted", style: "margin:0" }, d.points + " points" + (r.next ? " · " + r.toNext + " more to " + r.next.title + " (" + r.next.en + ")" : " · top rank reached!")))));
  }
  var heatSel = -1;
  function heatCard() {
    var cnt = { strong: 0, shaky: 0, "new": 0 }, SYM = { strong: "✓", shaky: "~", "new": "○" }, LBL = { strong: "strong", shaky: "shaky", "new": "not practiced yet" };
    var detail = h("div", { class: "am-word-detail", "aria-live": "polite" }, h("span", { class: "am-muted" }, "Tap any word to see what it means and how to say it."));
    var chips = {};
    function pick(i) {
      var w = D.WORDS[i]; heatSel = i;
      Object.keys(chips).forEach(function (k) { chips[k].setAttribute("aria-pressed", String(+k === i)); });
      detail.replaceChildren(h("div", { class: "row" }, h("span", { class: "w am-latin" }, w.word), h("span", null, h("b", null, "= " + w.en), h("br"), "say it: ", h("b", null, w.pron)),
        SP.canSpeak() ? h("button", { type: "button", class: "am-say", "aria-label": "Hear " + w.word, onclick: function () { SP.say(w.word, { slow: true }); } }, "🔊") : null,
        h("span", { class: "am-pchip", style: "background:#fff;color:inherit;border:2px solid var(--am-line)" }, SYM[strength(i)] + " " + LBL[strength(i)])));
    }
    var lines = D.LINES.map(function (l, li) {
      var row = h("div", { class: "am-heat-line" }, h("div", { class: "am-heat-lbl" }, "Line " + (li + 1)));
      D.WORDS.filter(function (w) { return w.line === l.id; }).forEach(function (w) {
        var s = strength(w.i); cnt[s]++;
        var b = h("button", { type: "button", class: "am-chip is-" + s, "aria-pressed": "false", "aria-label": w.word + ", " + LBL[s], onclick: function () { pick(w.i); } },
          h("i", { "aria-hidden": "true" }, SYM[s]), h("span", null, w.word));
        chips[w.i] = b; row.appendChild(b);
      });
      return row;
    });
    var card = h("section", { class: "am-card", "aria-labelledby": "am-heat-h" },
      h("h2", { id: "am-heat-h" }, "Word heat map"),
      h("p", { class: "am-muted" }, "All 31 words, in the order of the prayer. " + cnt.strong + " strong · " + cnt.shaky + " shaky · " + cnt["new"] + " not practiced yet."),
      lines,
      h("ul", { class: "am-legend", "aria-label": "Legend" },
        h("li", { class: "s" }, h("i", { "aria-hidden": "true" }, "✓"), "Strong: right twice in a row"), h("li", { class: "k" }, h("i", { "aria-hidden": "true" }, "~"), "Shaky: needs more practice"), h("li", { class: "n" }, h("i", { "aria-hidden": "true" }, "○"), "Not practiced yet")),
      detail,
      h("div", { class: "am-btn-row" }, h("a", { class: "qk-btn qk-btn-primary", href: "#vanish" }, "Practice my shaky words →"),
        h("a", { class: "qk-btn qk-btn-ghost", href: "#prayer" }, "Read the whole prayer")));
    if (heatSel >= 0) { pick(heatSel); }
    return card;
  }
  function gridCard() {
    var tiles = TILES.map(function (t) {
      var title = t.t, link = t.href, ic = t.i;
      if (t.n === "learn") { var p = partTitle(t.a); title = "Learn " + t.a + ": " + p.title; link = href("learn", t.a); }
      return h("a", { class: "am-tile", href: link }, h("span", { class: "am-icon", "aria-hidden": "true", html: ART.render(t.art || ic) }), h("span", null, h("b", null, title), h("small", null, t.d)));
    });
    return h("section", { class: "am-card", "aria-labelledby": "am-games-h" }, h("h2", { id: "am-games-h" }, "All the games"), h("div", { class: "am-grid" }, tiles));
  }
  function home() {
    spokenOk = SP.canSpeak();
    show([
      h("header", { class: "am-hero" },
        h("span", { class: "qk-eyebrow" }, "Latin prayer · test Tue Nov 17"),
        h("h1", { tabindex: "-1" }, "Ave María Quest"),
        h("p", null, "Learn the Hail Mary in Latin — test Tuesday"),
        h("div", { class: "am-hero-art", "aria-hidden": "true", html: ART.render("hero") })),
      leadCard(),
      h("div", { class: "am-cols" }, morningCard(), testCard()),
      rankCard(), heatCard(), gridCard(),
      h("div", { class: "qk-row am-no-print", style: "justify-content:center" }, h("a", { class: "qk-btn qk-btn-ghost", href: "#prayer" }, "📜 The full prayer card"), h("a", { class: "qk-btn qk-btn-ghost", href: "#plan" }, "✅ Tonight's plan"))
    ], "Home", "home");
  }

  /* ---------- plan ---------- */
  function plan() {
    var d = get(), nx = nextStep(), total = D.PLAN.reduce(function (a, s) { return a + s.minutes; }, 0), done = D.PLAN.filter(function (s) { return d.plan[s.id]; }).length;
    var list = h("ol", { class: "am-plan" });
    D.PLAN.forEach(function (s, idx) {
      var at = d.plan[s.id], isCur = nx && nx.id === s.id;
      var label = at ? "Do it again" : (isCur && done > 0 ? "Continue" : "Start");
      var tick = h("button", { type: "button", class: "qk-btn qk-btn-ghost", "aria-pressed": at ? "true" : "false", onclick: function () {
        save(function (x) { if (x.plan[s.id]) { delete x.plan[s.id]; } else { x.plan[s.id] = Date.now(); } });
        plan();
        var again = appEl.querySelector('[data-step="' + s.id + '"] button'); if (again) { try { again.focus({ preventScroll: true }); } catch (e) { /* ignore */ } }
      } }, at ? "Undo tick" : "Mark done");
      list.appendChild(h("li", { class: "am-step" + (at ? " is-done" : "") + (isCur ? " is-current" : ""), "data-step": s.id, "aria-current": isCur ? "step" : null },
        h("span", { class: "am-step-num", "aria-hidden": "true" }, at ? "✓" : String(idx + 1)),
        h("div", null, h("h3", null, s.title, h("small", null, s.minutes + " min")), h("p", null, s.text),
          at ? h("p", { class: "am-done-at" }, "✓ Done at " + fmtTime(at)) : null),
        h("div", { class: "am-step-act" }, h("a", { class: "qk-btn " + (at ? "qk-btn-ghost" : "qk-btn-primary"), href: stepHref(s) }, label, at ? "" : " →"), tick)));
    });
    var m = D.MORNING, mAt = d.plan.morning;
    show([
      h("div", { class: "am-bar-top" }, h("a", { class: "am-back", href: "#home" }, "← Home"), h("h1", { tabindex: "-1" }, "Tonight's plan"), chipsEl()),
      h("section", { class: "am-card", "aria-labelledby": "am-plan-h" },
        h("h2", { id: "am-plan-h" }, done + " of " + D.PLAN.length + " steps done · about " + total + " min"),
        h("div", { class: "am-bar", role: "progressbar", "aria-valuemin": "0", "aria-valuemax": String(D.PLAN.length), "aria-valuenow": String(done), "aria-label": "Plan progress" }, h("span", { style: "width:" + Math.round(done / D.PLAN.length * 100) + "%" })),
        h("p", { class: "am-muted" }, nx ? "Next: " + nx.title + ". You can stop and come back any time; your ticks are saved." : "All done. Sleep locks it in. Good luck tomorrow!")),
      list,
      h("section", { class: "am-card", "aria-labelledby": "am-tm-h" },
        h("div", { class: "am-card-head" }, icon("sun"), h("h2", { id: "am-tm-h" }, "Tomorrow morning")),
        h("h3", null, m.title, h("small", { class: "am-muted" }, " · " + m.minutes + " min")), h("p", { class: "am-muted" }, m.text),
        mAt ? h("p", { class: "am-done-at" }, "✓ Done at " + fmtTime(mAt)) : null,
        h("div", { class: "am-btn-row" }, h("a", { class: "qk-btn qk-btn-ghost", href: "#morning" }, mAt ? "Do it again" : "Start the warm-up")))
    ], "Tonight's plan", "plan");
  }

  /* ---------- break ---------- */
  function breakScreen(planId) {
    var start = get().breakStart;
    if (!start || start > Date.now() + 5000) { start = Date.now(); save(function (x) { x.breakStart = start; }); }
    var end = start + BREAK_MS, announced = false, asked = false;
    var clock = h("div", { class: "am-clock", "aria-hidden": "true" }, "10:00");
    var clockSr = h("p", { class: "qk-sr" }, "Break timer running. Come back at " + fmtTime(end));
    var status = h("p", { "aria-live": "polite", style: "font-weight:800;font-size:1.1rem" }, "Come back at " + fmtTime(end));
    var note = h("p", { "aria-live": "polite", style: "font-weight:700;min-height:1.5em" });
    function rem() { return Math.max(0, end - Date.now()); }
    function tick() {
      var r = rem(), s = Math.ceil(r / 1000);
      clock.textContent = Math.floor(s / 60) + ":" + (s % 60 < 10 ? "0" : "") + (s % 60);
      if (r === 0 && !announced) { announced = true; status.textContent = "Break complete! Come back and keep going."; QK.announce("Break complete. Come back and keep going."); }
    }
    var back = h("button", { type: "button", class: "qk-btn qk-btn-primary", onclick: function () {
      if (rem() > 0 && !asked) { asked = true; var s = Math.ceil(rem() / 1000); note.textContent = "Still " + Math.floor(s / 60) + ":" + (s % 60 < 10 ? "0" : "") + (s % 60) + " left. The break helps memory. Tap again if you are really ready."; return; }
      var full = rem() === 0;
      save(function (x) { x.plan["break"] = x.plan["break"] || Date.now(); x.breakStart = null; });
      if (full) { award(5, "Brain break"); }
      var nx = nextStep();
      location.hash = nx ? stepHref(nx).slice(1) : "plan";
    } }, "I'm back →");
    show([
      h("div", { class: "am-bar-top" }, h("a", { class: "am-back", href: "#plan" }, "← Plan"), h("h1", { tabindex: "-1" }, "Brain break"), chipsEl()),
      h("section", { class: "am-card am-break" }, icon("moon"), h("h2", { style: "color:#fff" }, "Step away for 10 minutes"), clock, clockSr, status,
        h("ul", { class: "am-ideas", "aria-label": "Ideas" }, h("li", null, "🙆 Stretch"), h("li", null, "💧 Get some water"), h("li", null, "🪟 Look out a window")),
        h("p", null, "Put the iPad down. Your brain files the prayer away while you rest."), note,
        h("div", { class: "am-btn-row", style: "justify-content:center" }, back))
    ], "Brain break", "break");
    tick();
    timers.push(setInterval(tick, 1000));
    var vis = function () { if (!document.hidden) { tick(); } };
    document.addEventListener("visibilitychange", vis);
    cur = { destroy: function () { document.removeEventListener("visibilitychange", vis); } };
  }

  /* ---------- prayer card ---------- */
  var prayerOpts = { pron: true, en: false, es: false, slow: false };
  function prayer() {
    var playing = false, playToken = 0;
    spokenOk = SP.canSpeak();
    var box = h("div", { class: "am-prayer" + (prayerOpts.pron ? " show-pron" : "") + (prayerOpts.en ? " show-en" : "") + (prayerOpts.es ? " show-es" : "") });
    var rows = D.LINES.map(function (l, i) {
      var say = SP.canSpeak() ? h("button", { type: "button", class: "am-say", "aria-label": "Listen to line " + (i + 1), onclick: function () { stopAll(); SP.say(l.text, { slow: prayerOpts.slow }); mark(i); setTimeout(function () { mark(-1); }, 900); } }, "🔊") : null;
      var row = h("div", { class: "am-pline" }, h("span", { class: "am-pline-n", "aria-hidden": "true" }, String(i + 1)),
        h("div", { class: "am-pline-body" }, h("p", { class: "am-pline-lat" }, l.text), h("p", { class: "am-pline-sub pron" }, l.pron), h("p", { class: "am-pline-sub en" }, l.en), h("p", { class: "am-pline-sub es" }, l.es)), say);
      box.appendChild(row); return row;
    });
    function mark(i) { rows.forEach(function (r, k) { r.classList.toggle("is-playing", k === i); }); if (i >= 0) { try { rows[i].scrollIntoView({ block: "nearest", behavior: QK.reducedMotion() ? "auto" : "smooth" }); } catch (e) { /* ignore */ } } }
    function stopAll() { playing = false; playToken++; SP.stop(); mark(-1); if (playBtn) { playBtn.textContent = "▶ Play all"; playBtn.setAttribute("aria-pressed", "false"); } }
    function playAll() {
      if (playing) { stopAll(); return; }
      playing = true; var my = ++playToken; playBtn.textContent = "■ Stop"; playBtn.setAttribute("aria-pressed", "true");
      (function go(i) {
        if (my !== playToken) { return; }
        if (i >= D.LINES.length) { stopAll(); return; }
        mark(i); SP.say(D.LINES[i].text, { slow: prayerOpts.slow, onend: function () { go(i + 1); } });
      })(0);
    }
    var playBtn = SP.canSpeak() ? h("button", { type: "button", class: "am-toggle", "aria-pressed": "false", onclick: playAll }, "▶ Play all") : null;
    function tog(key, label) {
      return h("button", { type: "button", class: "am-toggle", "aria-pressed": String(!!prayerOpts[key]), onclick: function (e) {
        prayerOpts[key] = !prayerOpts[key]; e.currentTarget.setAttribute("aria-pressed", String(prayerOpts[key]));
        if (key !== "slow") { box.classList.toggle("show-" + key, prayerOpts[key]); }
      } }, label);
    }
    show([
      h("div", { class: "am-bar-top" }, h("a", { class: "am-back", href: "#home" }, "← Home"), h("h1", { tabindex: "-1" }, "The Ave María"), chipsEl()),
      h("div", { class: "am-toggles am-no-print", role: "group", "aria-label": "Show under each line" },
        tog("pron", "How to say it"), tog("en", "English"), tog("es", "Español"), playBtn, SP.canSpeak() ? tog("slow", "🐢 Slow") : null,
        h("button", { type: "button", class: "am-toggle", onclick: function () { window.print(); } }, "🖨 Print")),
      SP.canSpeak() ? null : h("p", { class: "am-note" }, "This device has no voice for listening, so use the “how to say it” spelling under each line."),
      box,
      h("p", { class: "am-muted am-no-print", style: "text-align:center" }, "31 words in 8 lines. Capital letters in the spelling are the stressed beat.")
    ], "The prayer", "prayer");
    cur = { destroy: stopAll };
  }

  /* ---------- game frame, finish card ---------- */
  function backFor(r, plannable) { return plannable ? { href: "#plan", label: "← Plan" } : { href: "#home", label: "← Home" }; }
  function inPlan(r) {
    if (!r.plan) { return null; }
    var q = QUEUES[r.plan], k;
    for (k = 0; k < q.length; k++) { if (q[k][0] === r.name && (q[k][1] || "") === (r.arg || "")) { return { id: r.plan, idx: k, last: k === q.length - 1, queue: q }; } }
    return null;
  }
  function finishCard(sum, r, pl) {
    sum = isObj(sum) ? sum : {};
    var total = +sum.total || 0, correct = +sum.correct || 0, pts = Math.max(0, Math.round(+sum.points || 0));
    var pct = total ? correct / total : 1, stars = pct >= 0.9 ? 3 : pct >= 0.6 ? 2 : 1;
    if (pl && pl.last) { save(function (x) { x.plan[pl.id] = x.plan[pl.id] || Date.now(); }); }
    if (r.name === "morning") { save(function (x) { x.plan.morning = x.plan.morning || Date.now(); }); }
    var btns = [];
    if (pl) {
      if (!pl.last) { var q = pl.queue[pl.idx + 1]; btns.push(h("a", { class: "qk-btn qk-btn-primary", href: href(q[0], q[1], pl.id) }, "Next: " + titleFor(q[0], q[1]) + " →")); }
      else {
        var nx = nextStep();
        btns.push(nx ? h("a", { class: "qk-btn qk-btn-primary", href: stepHref(nx) }, "Next: " + nx.title + " →") : h("a", { class: "qk-btn qk-btn-primary", href: "#plan" }, "Tonight's plan is done ✓"));
      }
      btns.push(h("a", { class: "qk-btn qk-btn-ghost", href: "#plan" }, "Back to the plan"));
    } else {
      btns.push(h("button", { type: "button", class: "qk-btn qk-btn-primary", onclick: function () { route(); } }, "Play again"));
      btns.push(h("a", { class: "qk-btn qk-btn-ghost", href: "#home" }, "Home"));
    }
    var note = sum.note || (stars === 3 ? "Excellent. That is the prayer getting into your memory." : stars === 2 ? "Good work. One more round will make it stick." : "Good effort. Every try makes it stronger.");
    var card = h("section", { class: "am-card am-finish", "aria-labelledby": "am-fin-h" },
      icon("badge", "", { text: String(stars === 3 ? "★" : "") }),
      h("h2", { id: "am-fin-h", tabindex: "-1" }, sum.title || "Well done!"),
      total ? h("p", { class: "am-score" }, correct + "/" + total) : null,
      h("div", { class: "am-finish-stars", role: "img", "aria-label": stars + " of 3 stars" }, "★★★".slice(0, stars) + "☆☆☆".slice(0, 3 - stars)),
      pts ? h("p", null, h("b", null, "+" + pts + " points")) : null,
      h("p", { class: "am-muted" }, note),
      h("div", { class: "am-btn-row" }, btns));
    if (pct >= 0.8 && total) { QK.celebrate(sum.title || "Well done!"); } else { QK.announce((sum.title || "Finished") + ". " + note); }
    return card;
  }

  function gameScreen(r) {
    var pl = inPlan(r), mode = pl ? "plan" : "free", frame = h("div", { class: "am-game-frame" }), mount = h("div", { class: "am-game-mount" });
    var title = titleFor(r.name, r.arg), bk = backFor(r, !!pl), finished = false, game = null, earned = 0;
    var ctx = {
      D: D, speech: window.AM_SPEECH, mode: mode, reduced: QK.reducedMotion(),
      word: function (i, result) {
        i = +i; if (!(i >= 0 && i < 31) || i % 1 || RESULTS.indexOf(result) < 0) { return; }
        save(function (x) { var a = x.words[i] || []; a.push(result); x.words[i] = a.slice(-4); });
      },
      strength: strength,
      /* games may award points while playing (challenge games) or only report them in ctx.done (learn games);
         count what was awarded so the finish only credits the difference and nothing is lost or doubled */
      award: function (points, label) { earned += Math.max(0, Math.round(+points || 0)); return award(points, label); },
      save: function (name, value) { save(function (x) { x.games[String(name)] = value; }); },
      load: function (name) { var v = get().games[String(name)]; return v === undefined ? null : v; },
      done: function (summary) {
        if (finished) { return; }
        finished = true;
        try { if (game && game.destroy) { game.destroy(); } } catch (e) { /* ignore */ }
        game = null; SP.stop();
        var extra = Math.round(+((summary || {}).points) || 0) - earned;
        if (extra > 0) { award(extra, "round finished"); }
        mount.replaceChildren(finishCard(summary, r, pl));
        window.scrollTo(0, 0);
        var fh = document.getElementById("am-fin-h"); if (fh) { try { fh.focus({ preventScroll: true }); } catch (e) { /* ignore */ } }
        refreshChips();
      },
      exit: function () { location.hash = bk.href.slice(1); },
      recordTest: function (result) {
        result = isObj(result) ? result : {};
        var rec = { score: +result.score || 0, total: +result.total || 31, pct: +result.pct || 0, missed: Array.isArray(result.missed) ? result.missed : [], attempt: +result.attempt || 1, at: Date.now() };
        save(function (x) {
          x.tests.attempts.push(rec); x.tests.attempts = x.tests.attempts.slice(-30); x.tests.last = rec;
          if (!x.tests.best || rec.score >= (+x.tests.best.score || 0)) { x.tests.best = rec; }
        });
        try { if (window.StudyQuest && window.StudyQuest.record) { window.StudyQuest.record("ave-maria", rec.pct); } } catch (e) { /* ignore */ }
      }
    };
    frame.appendChild(h("div", { class: "am-bar-top" }, h("a", { class: "am-back", href: bk.href }, bk.label), h("h1", { tabindex: "-1" }, title), chipsEl()));
    frame.appendChild(mount);
    show([frame], title, "game");
    var fn = window.AM_GAMES && window.AM_GAMES[r.name];
    if (typeof fn === "function") {
      try { game = fn(mount, ctx, r.name === "learn" ? { part: r.arg } : {}) || null; }
      catch (e) { game = null; if (window.console) { console.error("Game failed:", r.name, e); } mount.replaceChildren(fallback()); }
    } else { mount.replaceChildren(fallback()); }
    cur = { destroy: function () { try { if (game && game.destroy) { game.destroy(); } } catch (e) { /* ignore */ } game = null; } };
  }
  function fallback() {
    return h("section", { class: "am-card am-fallback", role: "status" }, h("h2", null, "This game is loading — try again"),
      h("p", { class: "am-muted" }, "Give it a second, then tap the button. Your progress is safe."),
      h("div", { class: "am-btn-row", style: "justify-content:center" }, h("button", { type: "button", class: "qk-btn qk-btn-primary", onclick: function () { route(); } }, "Try again"), h("a", { class: "qk-btn qk-btn-ghost", href: "#home" }, "Home")));
  }

  /* ---------- router ---------- */
  var GAME_ROUTES = { meet: 1, learn: 1, vanish: 1, build: 1, next: 1, slip: 1, blanks: 1, match: 1, test: 1, bedtime: 1, morning: 1 };
  function route() {
    teardown();
    var r = parseHash();
    if (r.name === "learn" && !partTitle(r.arg)) { r.arg = "A"; }
    try {
      if (r.name === "plan") { plan(); }
      else if (r.name === "prayer") { prayer(); }
      else if (r.name === "break") { breakScreen(r.plan); }
      else if (GAME_ROUTES[r.name]) { gameScreen(r); }
      else { r.name = "home"; home(); }
    } catch (e) {
      if (window.console) { console.error(e); }
      show([h("section", { class: "am-card" }, h("h1", { tabindex: "-1" }, "Something went wrong"), h("p", null, "Your progress is saved."), h("a", { class: "qk-btn qk-btn-primary", href: "#home" }, "Go home"))], "Oops", "home");
    }
    save(function (x) { x.lastRoute = r.name; });
  }
  window.addEventListener("hashchange", route);
  SP.onChange(function () { if ((curScreen === "home" || curScreen === "prayer") && spokenOk !== SP.canSpeak()) { route(); } });
  route();
})();

/* European Exploration Quest: the game engine.
   One screen at a time is drawn into #app. Missions are lists of steps (lesson, question, sort, meet, match)
   defined in data.js. Every wrong answer gets a hint and a second try, then a plain explanation. */
(function () {
  "use strict";
  var D = window.EE_DATA, ART = window.EE_ART, app = document.getElementById("app");
  if (!D || !ART || !app) { return; }

  var GAME_ID = "european-exploration";
  var KEY = "studyquest:european-exploration:v1"; /* detailed local-only progress; the shared score goes through StudyQuest.record */
  var LETTERS = ["A", "B", "C", "D"];
  var MAX_MISSED = 30;
  var FINAL = { id: "final", title: "Final Explorer Challenge", short: "Final", icon: "🏆", minutes: "About 4 min",
    blurb: "12 mixed questions from the whole adventure. Finish with a score and a review of anything you missed." };
  var ALL = D.missions.concat([FINAL]);
  var canSpeak = "speechSynthesis" in window && "SpeechSynthesisUtterance" in window;
  var round = null;

  /* ---------- small helpers ---------- */
  function el(tag, attrs, kids) {
    var n = document.createElement(tag), k;
    for (k in (attrs || {})) {
      if (attrs[k] === null || attrs[k] === undefined || attrs[k] === false) { continue; }
      if (k === "class") { n.className = attrs[k]; }
      else if (k === "text") { n.textContent = attrs[k]; }
      else if (k === "html") { n.innerHTML = attrs[k]; } /* only used for the fixed SVG art in art.js */
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
  function sample(list, n) { return shuffle(list).slice(0, n); }
  function sum(list) { return list.reduce(function (a, b) { return a + b; }, 0); }
  function reduceMotion() { return window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches; }

  /* ---------- saved progress (local only, never throws) ---------- */
  function loadStore() {
    var d = null;
    try { d = JSON.parse(localStorage.getItem(KEY)); } catch (e) { d = null; }
    d = d && typeof d === "object" ? d : {};
    return { done: d.done && typeof d.done === "object" ? d.done : {}, missed: Array.isArray(d.missed) ? d.missed : [] };
  }
  var store = loadStore();
  function setStore(patch) {
    store = { done: patch.done || store.done, missed: patch.missed || store.missed };
    try { localStorage.setItem(KEY, JSON.stringify(store)); } catch (e) { /* private mode or full storage: progress just won't be saved */ }
  }

  /* ---------- question bank (written questions + ones built from the explorer facts) ---------- */
  var bank = {};
  D.questions.forEach(function (q) { bank[q.id] = q; });

  (function addExplorerQuestions() {
    var COUNTRIES = ["Spain", "England", "France", "Netherlands"];
    var AVOID = { coronado: ["cortes"], cortes: ["coronado"], cartier: ["cabot"], cabot: ["cartier"] }; /* places that could confuse two answers */
    function add(id, e, text, answer, wrong, hint, why) {
      bank[id] = { id: id, topic: "explorers", src: e.src, text: text, answer: answer, wrong: wrong, hint: hint, why: why };
    }
    D.explorers.forEach(function (e) {
      var others = D.explorers.filter(function (o) { return o.id !== e.id; });
      add("ex-who-" + e.id, e, "Who " + e.clue + "?", e.name, others.map(function (o) { return o.name; }), e.hint, e.name + " " + e.clue + ".");
      if (e.country) {
        add("ex-country-" + e.id, e, "Which country did " + e.name + " explore for?", e.country,
          COUNTRIES.filter(function (c) { return c !== e.country; }), "Think about which kingdom's flag " + e.short + " carried.", e.countryWhy);
      }
      if (e.place) {
        add("ex-place-" + e.id, e, "Which place goes with " + e.name + "?", e.place,
          others.filter(function (o) { return o.place && (AVOID[e.id] || []).indexOf(o.id) < 0; }).map(function (o) { return o.place; }), e.hint, e.placeWhy);
      }
    });
  })();

  function sortSpec(sid, idx) {
    var s = D.sorts[sid], item = s && s.items[idx];
    if (!item) { return null; }
    var labels = s.buckets.map(function (b) { return b.label; }), bk = s.buckets[item.b];
    return { id: "sort:" + sid + ":" + idx, topic: bk.topic || s.topic, src: s.src, text: s.prompt, card: item.t, answer: bk.label,
      wrong: labels.filter(function (l) { return l !== bk.label; }), fixed: labels, buckets: s.buckets,
      hint: "Read each group's description, then try another group.", why: item.why };
  }
  function specFor(id) {
    var m = /^sort:(\w+):(\d+)$/.exec(id);
    return m ? sortSpec(m[1], Number(m[2])) : bank[id] || null;
  }
  function makeQuestion(id) {
    var spec = specFor(id);
    if (!spec) { return null; }
    var q = { id: spec.id, topic: spec.topic, src: spec.src, text: spec.text, card: spec.card, visual: spec.visual, answer: spec.answer,
      hint: spec.hint, why: spec.why, buckets: spec.buckets };
    q.choices = spec.fixed || shuffle([spec.answer].concat(sample(spec.wrong, Math.min(3, spec.wrong.length))));
    return q;
  }
  function topicIds(topic) { return Object.keys(bank).filter(function (k) { return bank[k].topic === topic; }); }

  /* ---------- building a round from a mission ---------- */
  function expandSort(sid) {
    var s = D.sorts[sid], chosen = [];
    s.buckets.forEach(function (b, bi) {
      var idxs = [];
      s.items.forEach(function (it, ii) { if (it.b === bi) { idxs.push(ii); } });
      chosen = chosen.concat(sample(idxs, s.pick[bi]));
    });
    return shuffle(chosen).map(function (ii) { return { k: "q", id: "sort:" + sid + ":" + ii, banner: "Sorting game" }; });
  }
  function expand(mission) {
    var used = {}, out = [];
    function take(ids, n) {
      var fresh = ids.filter(function (i) { return !used[i]; });
      return sample(fresh.length >= n ? fresh : ids, n);
    }
    mission.steps.forEach(function (s) {
      if (s.k === "q") {
        var pool = (s.from || topicIds(s.topic)).filter(function (id) { return !s.exclude || id.indexOf(s.exclude) !== 0; });
        (s.id ? [s.id] : take(pool, s.n || 1)).forEach(function (id) {
          used[id] = true; out.push({ k: "q", id: id, banner: s.banner });
        });
      } else if (s.k === "sort") { out = out.concat(expandSort(s.id)); }
      else { out.push(s); }
    });
    return out;
  }
  function buildFinal() {
    var ids = [];
    Object.keys(D.finalMix).forEach(function (t) { ids = ids.concat(sample(topicIds(t), D.finalMix[t])); });
    return shuffle(ids).map(function (id) { return { k: "q", id: id }; });
  }
  function startMission(mission) {
    var steps = mission.id === "final" ? buildFinal() : mission.id === "review" ? mission.steps : expand(mission);
    round = { mission: mission, steps: steps, i: 0, items: [], recorded: false };
    showStep();
  }
  function startReview(ids) {
    var good = ids.filter(function (id) { return specFor(id); }).slice(0, 10);
    if (!good.length) { renderHome(); return; }
    startMission({ id: "review", title: "Practice what I missed", steps: good.map(function (id) { return { k: "q", id: id, banner: "Second chance" }; }) });
  }
  function next() { round = { mission: round.mission, steps: round.steps, i: round.i + 1, items: round.items, recorded: round.recorded }; showStep(); }
  function addItem(item) { round = { mission: round.mission, steps: round.steps, i: round.i, items: round.items.concat([item]), recorded: round.recorded }; }
  function noteResult(id, credit) {
    var rest = store.missed.filter(function (x) { return x !== id; });
    setStore({ missed: credit === 0 ? [id].concat(rest).slice(0, MAX_MISSED) : rest });
  }

  /* ---------- screen plumbing ---------- */
  function stopSpeech() { if (canSpeak) { try { window.speechSynthesis.cancel(); } catch (e) { /* ignore */ } } }
  function mount(nodes) {
    stopSpeech();
    while (app.firstChild) { app.removeChild(app.firstChild); }
    nodes.forEach(function (n) { app.appendChild(n); });
    window.scrollTo(0, 0);
    var f = app.querySelector("[data-focus]");
    if (f) { try { f.focus({ preventScroll: true }); } catch (e) { f.focus(); } }
  }
  function goHome() { stopSpeech(); renderHome(); }
  function speakBtn(text) {
    if (!canSpeak) { return null; }
    return el("button", { class: "speak", type: "button", "aria-label": "Read this out loud", text: "🔊 Read to me", onclick: function () {
      var s = window.speechSynthesis;
      if (s.speaking) { s.cancel(); return; }
      var u = new SpeechSynthesisUtterance(text); u.rate = 0.95; s.speak(u);
    } });
  }
  function topBar() {
    var pct = Math.round(round.i / round.steps.length * 100);
    return [
      el("div", { class: "bar" }, [
        el("button", { class: "home-btn", type: "button", onclick: goHome, text: "← Home" }),
        el("div", { class: "bar-title", text: round.mission.title }),
        el("div", { class: "bar-count", text: (round.i + 1) + " of " + round.steps.length })
      ]),
      el("div", { class: "progress", role: "progressbar", "aria-label": "Mission progress", "aria-valuemin": "0", "aria-valuemax": "100", "aria-valuenow": String(pct) }, [el("i", { style: "width:" + pct + "%" })])
    ];
  }
  function nextBtn() {
    var last = round.i + 1 >= round.steps.length;
    return el("button", { class: "btn gold grow", type: "button", onclick: next, text: last ? "See my results →" : "Next →" });
  }
  function showStep() {
    if (round.i >= round.steps.length) { renderResults(); return; }
    var s = round.steps[round.i];
    var body = s.k === "lesson" ? renderLesson(s) : s.k === "meet" ? renderMeet() : s.k === "match" ? renderMatch(s) : renderQuestion(s);
    mount(topBar().concat([body]));
  }

  /* ---------- home ---------- */
  function firstUndone() {
    for (var i = 0; i < ALL.length; i++) { if (!store.done[ALL[i].id]) { return ALL[i]; } }
    return FINAL;
  }
  function renderHome() {
    round = null;
    var live = store.missed.filter(function (id) { return specFor(id); });
    if (live.length !== store.missed.length) { setStore({ missed: live }); } /* forget ids that no longer exist */
    var nextM = firstUndone(), doneCount = ALL.filter(function (m) { return store.done[m.id]; }).length;
    var trail = el("ol", { class: "trail", "aria-label": "Your voyage: " + doneCount + " of " + ALL.length + " stops reached" }, ALL.map(function (m) {
      var done = !!store.done[m.id], isNext = m.id === nextM.id && doneCount < ALL.length;
      return el("li", { class: done ? "done" : isNext ? "next" : "" }, [el("span", { class: "node", "aria-hidden": "true", text: done ? "✓" : m.icon }), m.short + (done ? " (done)" : "")]);
    }));
    var cards = ALL.map(function (m) {
      var d = store.done[m.id];
      return el("button", { class: "mcard" + (m.id === "final" ? " final" : ""), type: "button", onclick: function () { startMission(m); } }, [
        el("span", { class: "mi", "aria-hidden": "true", text: m.icon }),
        el("span", {}, [el("h3", { text: m.title }), el("p", { text: m.blurb }), el("span", { class: "status" + (d ? " ok" : ""), text: d ? "✓ Best score " + d.best + "%" : m.minutes })])
      ]);
    });
    var nodes = [
      el("div", { class: "bar" }, [el("a", { class: "home-btn", href: "../", text: "← Study Quest home" })]),
      el("section", { class: "hero" }, [
        el("div", { class: "sea", html: ART.scene("home") }),
        el("div", { class: "hero-body" }, [
          el("span", { class: "chip", text: "Social Studies adventure" }),
          el("h1", { tabindex: "-1", "data-focus": "1", text: "European Exploration Quest" }),
          el("p", { text: "Sail across the Atlantic, meet nine explorers, and learn what changed when Europeans and Native Americans met." }),
          el("button", { class: "btn gold big", type: "button", onclick: function () { startMission(nextM); }, text: (doneCount ? "Continue Adventure" : "Start Adventure") + " ⛵" }),
          el("div", { class: "hero-next", text: "Next stop: " + nextM.title })
        ])
      ]),
      trail
    ];
    if (store.missed.length) {
      nodes.push(el("div", { class: "missed-box" }, [
        el("span", { text: "📌 " + store.missed.length + " question" + (store.missed.length === 1 ? "" : "s") + " to practice" }),
        el("button", { class: "btn gold", type: "button", onclick: function () { startReview(store.missed); }, text: "Practice what I missed" })
      ]));
    }
    nodes.push(el("div", { class: "section-title" }, [el("h2", { text: "Pick a mission" }), el("span", { text: "Any order is fine" })]));
    nodes.push(el("div", { class: "mcards" }, cards));
    mount(nodes);
  }

  /* ---------- lesson ---------- */
  function renderLesson(s) {
    var L = D.lessons[s.id], shownAt = Date.now();
    /* A quick double-tap on the previous Next must not skip this lesson. */
    var go = el("button", { class: "btn gold grow", type: "button", text: round.i + 1 >= round.steps.length ? "See my results →" : "Next →",
      onclick: function () { if (Date.now() - shownAt > 350) { next(); } } });
    return el("section", { class: "panel" }, [
      el("div", { class: "art", html: ART.scene(L.art) }),
      el("h2", { class: "title", tabindex: "-1", "data-focus": "1", text: L.title }),
      el("p", { class: "lead", text: L.text }),
      el("div", { class: "example" }, [el("b", { "aria-hidden": "true", text: "💡" }), el("span", { text: L.example })]),
      el("p", { class: "src", text: "From handout photo " + L.src }),
      el("div", { class: "row" }, [speakBtn(L.title + ". " + L.text + " " + L.example), go])
    ]);
  }

  /* ---------- question (also used for the sorting cards) ---------- */
  function descFor(q, label) {
    var hit = q.buckets.filter(function (b) { return b.label === label; })[0];
    return hit ? hit.desc : "";
  }
  function renderQuestion(s) {
    var q = makeQuestion(s.id);
    if (!q) { return el("section", { class: "panel" }, [el("p", { class: "lead", text: "Let's keep sailing!" }), el("div", { class: "row" }, [nextBtn()])]); }
    var attempts = 0, finished = false, buttons = [];
    var feedback = el("div", { role: "status", "aria-live": "polite" });
    var actions = el("div", { class: "row" });
    var list = el("div", { class: q.buckets ? "buckets" : "choices" });

    function say(kind, text) { feedback.className = "feedback " + kind; feedback.textContent = text; try { feedback.scrollIntoView({ block: "nearest", behavior: reduceMotion() ? "auto" : "smooth" }); } catch (e) { /* ignore */ } }
    function mark(btn, kind, sign) { btn.classList.add(kind); var m = btn.querySelector(".mark"); if (m) { m.textContent = sign; } }
    function lock() { buttons.forEach(function (b) { b.disabled = true; }); }
    function focusIt(n) { try { n.focus({ preventScroll: true }); } catch (e) { n.focus(); } }
    function done(credit) {
      finished = true; lock();
      addItem({ id: q.id, topic: q.topic, credit: credit, text: q.card ? q.card + " goes with " + q.answer : q.text, answer: q.answer, why: q.why });
      noteResult(q.id, credit);
      actions.appendChild(nextBtn());
      feedback.setAttribute("tabindex", "-1"); focusIt(feedback); /* read the explanation first; Next is one Tab away */
    }
    function pick(btn, choice) {
      if (finished) { return; }
      attempts++;
      if (choice === q.answer) {
        mark(btn, "correct", "✓");
        say("good", (attempts === 1 ? "✅ You got it! " : "✅ You got it on your second try. That is how learning works! ") + q.why);
        done(attempts === 1 ? 1 : 0.5);
      } else if (attempts === 1) {
        mark(btn, "try", "↺"); btn.disabled = true;
        say("try", "Not quite yet, and that is okay. Hint: " + q.hint + " Tap another answer.");
        var again = buttons.filter(function (b) { return !b.disabled; })[0];
        if (again) { focusIt(again); } /* keep keyboard focus on the choices */
      } else {
        mark(btn, "try", "↺");
        buttons.forEach(function (b, i) { if (q.choices[i] === q.answer) { mark(b, "correct", "✓"); } });
        say("try", "The answer is “" + q.answer + "”. " + q.why + " We will practice this one again later.");
        done(0);
      }
    }
    q.choices.forEach(function (c, i) {
      var kids = q.buckets
        ? [el("span", { class: "bl", text: c }), el("span", { class: "bd", text: descFor(q, c) })]
        : [el("span", { class: "ltr", "aria-hidden": "true", text: LETTERS[i] }), el("span", { class: "tx", text: c }), el("span", { class: "mark", "aria-hidden": "true" })];
      var b = el("button", { class: "choice" + (q.buckets ? " bucket" : ""), type: "button", onclick: function () { pick(b, c); } }, kids);
      buttons.push(b); list.appendChild(b);
    });
    var read = q.text + (q.card ? " " + q.card : "") + (q.buckets ? "" : " " + q.choices.map(function (c, i) { return LETTERS[i] + ": " + c; }).join(". "));
    return el("section", { class: "panel", "data-qid": q.id }, [
      el("div", { class: "chips" }, [
        el("span", { class: "chip", text: D.topics[q.topic].icon + " " + D.topics[q.topic].label }),
        s.banner ? el("span", { class: "chip gold", text: s.banner }) : null
      ]),
      q.visual ? el("div", { class: "art", html: q.visual.type === "sun" ? ART.scene("sun") : ART.compassArrow(q.visual.deg) }) : null,
      el("h2", { class: "prompt", tabindex: "-1", "data-focus": "1", text: q.text }),
      q.card ? el("div", { class: "card-item", text: q.card }) : null,
      list, feedback, actions,
      el("div", { class: "row" }, [speakBtn(read)])
    ]);
  }

  /* ---------- meet the explorers (card deck) ---------- */
  function renderMeet() {
    var i = 0, host = el("section", { class: "panel meet" });
    function draw() {
      var e = D.explorers[i], last = i === D.explorers.length - 1;
      stopSpeech();
      while (host.firstChild) { host.removeChild(host.firstChild); }
      var heading = el("h2", { tabindex: "-1", "data-focus": "1", text: e.name });
      [
        el("div", { class: "chips", style: "justify-content:center" }, [el("span", { class: "chip gold", text: "Meet " + (i + 1) + " of " + D.explorers.length })]),
        el("div", { class: "medal", html: ART.medal(e.hue, e.initials) }), heading,
        el("span", { class: "chip", text: "🚩 " + (e.badge || e.country) }),
        el("ul", { class: "facts" }, e.facts.map(function (f) { return el("li", {}, [el("b", { text: f[0] }), f[1]]); })),
        el("div", { class: "dots", "aria-hidden": "true" }, D.explorers.map(function (_, n) { return el("i", { class: n === i ? "on" : "" }); })),
        el("p", { class: "src", text: "From handout photo " + e.src }),
        el("div", { class: "row" }, [
          el("button", { class: "btn soft", type: "button", onclick: function () { i--; draw(); }, text: "← Back", disabled: i === 0 ? "" : null, style: i === 0 ? "visibility:hidden" : null }),
          speakBtn(e.name + ". " + e.facts.map(function (f) { return f[0] + ": " + f[1]; }).join(". ")),
          el("button", { class: "btn gold grow", type: "button", onclick: function () { if (last) { next(); } else { i++; draw(); } }, text: last ? "Play the matching game →" : "Next explorer →" })
        ])
      ].forEach(function (n) { if (n) { host.appendChild(n); } });
      if (host.isConnected) { try { heading.focus({ preventScroll: true }); } catch (err) { heading.focus(); } window.scrollTo(0, 0); }
    }
    draw();
    return host;
  }

  /* ---------- matching board: tap a name, then tap its clue ---------- */
  function renderMatch(s) {
    var pairs = s.pairs.map(function (id) { return D.explorers.filter(function (e) { return e.id === id; })[0]; });
    var selL = null, selR = null, matched = 0, wrongs = {}, btns = { L: {}, R: {} };
    var feedback = el("div", { role: "status", "aria-live": "polite", class: "feedback info", text: "Tap a name, then tap the clue that goes with it." });
    var actions = el("div", { class: "row" });

    function refresh() {
      ["L", "R"].forEach(function (side) {
        Object.keys(btns[side]).forEach(function (id) {
          var sel = (side === "L" ? selL : selR);
          btns[side][id].setAttribute("aria-pressed", sel && sel.id === id ? "true" : "false");
        });
      });
    }
    function say(kind, text) { feedback.className = "feedback " + kind; feedback.textContent = text; }
    function tap(side, e) {
      if (btns[side][e.id].classList.contains("done")) { return; }
      if (side === "L") { selL = e; } else { selR = e; }
      refresh();
      if (!(selL && selR)) { return; }
      var a = selL, b = selR;
      selL = null; selR = null;
      if (a.id === b.id) {
        var w = wrongs[a.id] || 0, credit = w === 0 ? 1 : w <= 2 ? 0.5 : 0; /* mis-taps count against the name that was tapped, never the clue */
        ["L", "R"].forEach(function (sd) { btns[sd][a.id].classList.add("done"); btns[sd][a.id].disabled = true; });
        matched++;
        addItem({ id: "ex-who-" + a.id, topic: "explorers", credit: credit, text: "Who " + a.clue + "?", answer: a.name, why: a.name + " " + a.clue + "." });
        noteResult("ex-who-" + a.id, credit);
        say("good", "✅ " + a.short + ": " + a.pair + ".");
        if (matched === pairs.length) {
          var nb = nextBtn(); actions.appendChild(nb);
          feedback.setAttribute("tabindex", "-1");
          try { feedback.focus({ preventScroll: true }); } catch (err) { feedback.focus(); }
        }
      } else {
        wrongs[a.id] = (wrongs[a.id] || 0) + 1;
        [btns.L[a.id], btns.R[b.id]].forEach(function (x) { x.classList.add("try"); setTimeout(function () { x.classList.remove("try"); }, 450); });
        say("try", wrongs[a.id] >= 2 ? "Hint for " + a.short + ": " + a.hint + " Try another pair." : "Not a match yet, and that is okay. Read the clue again and try another pair.");
      }
      refresh();
    }
    function col(side, label) {
      return el("div", { class: "col", role: "group", "aria-label": label }, shuffle(pairs).map(function (e) {
        var b = el("button", { class: "mbtn", type: "button", "aria-pressed": "false", onclick: function () { tap(side, e); }, text: side === "L" ? e.name : e.pair });
        btns[side][e.id] = b; return b;
      }));
    }
    return el("section", { class: "panel" }, [
      el("div", { class: "chips" }, [el("span", { class: "chip", text: "🧑‍✈️ The explorers" }), el("span", { class: "chip gold", text: "Matching game" })]),
      el("h2", { class: "prompt", tabindex: "-1", "data-focus": "1", text: "Match each person to what they did." }),
      el("div", { class: "match" }, [col("L", "People"), col("R", "What they did")]),
      feedback, actions
    ]);
  }

  /* ---------- results ---------- */
  function recordScore(pct) {
    if (round.mission.id === "review") { return; }
    if (window.StudyQuest) { StudyQuest.record(GAME_ID, pct); }
    var prev = store.done[round.mission.id] || {}, done = {}, k;
    for (k in store.done) { done[k] = store.done[k]; }
    done[round.mission.id] = { best: Math.max(prev.best || 0, pct), last: pct, at: Date.now() };
    setStore({ done: done });
  }
  function renderResults() {
    var items = round.items, total = items.length, isReview = round.mission.id === "review", isFinal = round.mission.id === "final";
    var pct = total ? Math.round(sum(items.map(function (x) { return x.credit; })) / total * 100) : 100;
    if (!round.recorded) { recordScore(pct); round = { mission: round.mission, steps: round.steps, i: round.i, items: items, recorded: true }; }
    var missed = items.filter(function (x) { return x.credit === 0; });
    var stars = pct >= 90 ? 3 : pct >= 65 ? 2 : 1;
    var msg = pct >= 90 ? "Master navigator! You really know this." : pct >= 65 ? "Great sailing! You learned a lot." : pct >= 40 ? "Nice work. Every voyage teaches something new." : "Good effort! Practice makes the map clearer.";
    var topics = {}, order = [];
    items.forEach(function (x) { if (!topics[x.topic]) { topics[x.topic] = { n: 0, ok: 0 }; order.push(x.topic); } topics[x.topic].n++; if (x.credit === 1) { topics[x.topic].ok++; } });
    var learned = el("ul", { class: "learned" }, order.map(function (t) {
      var r = topics[t], good = r.ok === r.n;
      return el("li", {}, [el("span", { "aria-hidden": "true", text: D.topics[t].icon }), el("span", { text: D.topics[t].label }), el("span", { class: good ? "ok" : "more", text: good ? "✓ Got it" : "Keep practicing" })]);
    }));
    var title = isReview ? "Review complete!" : isFinal ? "Final Challenge complete!" : round.mission.title + " complete!";
    var nodes = [
      el("div", { class: "bar" }, [el("button", { class: "home-btn", type: "button", onclick: goHome, text: "← Home" }), el("div", { class: "bar-title", text: round.mission.title })]),
      el("section", { class: "panel results" }, [
        el("div", { class: "confetti", "aria-hidden": "true" }, pct >= 65 && !reduceMotion() ? Array.apply(null, Array(12)).map(function (_, n) {
          return el("i", { style: "left:" + (4 + n * 8) + "%;animation-delay:" + (n % 6) * 0.15 + "s", text: ["⭐", "✨", "⛵", "🧭"][n % 4] });
        }) : []),
        el("div", { class: "stars", role: "img", "aria-label": stars + " out of 3 stars", text: "⭐⭐⭐".slice(0, stars) + "☆☆☆".slice(0, 3 - stars) }),
        el("h2", { class: "title", tabindex: "-1", "data-focus": "1", text: title }),
        el("div", { class: "score", style: "--p:" + pct, role: "img", "aria-label": "Score " + pct + " percent" }, [el("b", { text: pct + "%" })]),
        el("p", { class: "lead", text: msg }),
        el("h3", { text: "What you practiced" }), learned,
        missed.length ? el("details", { class: "review" }, [el("summary", { text: "Look at what to review (" + missed.length + ")" }), el("div", {}, missed.map(function (x) {
          return el("p", {}, [el("b", { text: x.text }), " Answer: " + x.answer + ". " + x.why]);
        }))]) : el("p", { class: "lead", text: "You did not miss a single one. Amazing!" }),
        el("div", { class: "row", style: "justify-content:center" }, [
          missed.length ? el("button", { class: "btn gold big", type: "button", onclick: function () { startReview(missed.map(function (x) { return x.id; })); }, text: "Practice what I missed (" + missed.length + ")" }) : null,
          nextAction(isReview, isFinal),
          el("button", { class: "btn soft", type: "button", onclick: goHome, text: "Back to the map" })
        ])
      ])
    ];
    mount(nodes);
  }
  function nextAction(isReview, isFinal) {
    if (isReview) { return null; }
    if (isFinal) { return el("button", { class: "btn", type: "button", onclick: function () { startMission(FINAL); }, text: "Try the challenge again" }); }
    var idx = ALL.indexOf(round.mission), upcoming = ALL[idx + 1];
    return upcoming ? el("button", { class: "btn", type: "button", onclick: function () { startMission(upcoming); }, text: "Next: " + upcoming.title + " →" }) : null;
  }

  renderHome();
})();

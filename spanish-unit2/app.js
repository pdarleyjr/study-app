/* Spanish Quest: ¿Cómo vivimos? — the student experience, drawn into #app.
   Hash routes: #home #mission #mission/m1..m4 #practice #practice/<topic> #test #warmup #fix #progress #sheet.
   Content comes from SpanishUnit2Data, pictures from SU_ART, widgets from SU_UI, the learning logic from SU_ENGINE
   and the four mission activities from SU_ACT. Everything is saved locally under studyquest:spanish-unit2:v1. */
(function () {
  "use strict";

  var root = document.getElementById("app");
  if (!root) { return; }
  var QK = window.QuestKit, D = window.SpanishUnit2Data, UI = window.SU_UI, ART = window.SU_ART, ENG = window.SU_ENGINE;
  var ACT = window.SU_ACT || {};
  var SP = window.SU_SPEECH || { say: function () { return false; }, stop: function () {}, canSpeak: function () { return false; }, onChange: function () {} };
  var GAME_ID = "spanish-unit2";
  var KEY = "studyquest:spanish-unit2:v1";

  if (!QK || !D || !UI || !ART || !ENG) {
    root.innerHTML = '<section class="qk-panel"><h2>Almost ready…</h2><p>This page could not finish loading. Please refresh. ' +
      '<a href="../fifth-grade/">Back to 5th grade</a></p></section>';
    return;
  }
  var h = QK.h, esc = QK.escapeHtml;
  if (ART.setMap) { try { ART.setMap(D.MAP, D.PLACES); } catch (e) { /* art falls back to its placeholder */ } }

  /* ---------- small helpers ---------- */
  function arr(x) { return Array.isArray(x) ? x : []; }
  function obj(x) { return x && typeof x === "object" && !Array.isArray(x) ? x : {}; }
  function newSeed() { return ((Date.now() ^ Math.floor(Math.random() * 1e9)) >>> 0); }
  function by(list, id) { return arr(list).filter(function (x) { return x && x.id === id; })[0] || null; }
  function getQ(id) { return ENG.getQuestion(D, id); }
  function skillRow(id) { return by(D.SKILLS, id); }
  function skillLabel(id) { var s = skillRow(id); return s ? s.label : id; }
  function placeName(id) {
    if (typeof D.withArticle === "function") { try { return D.withArticle(id); } catch (e) { /* fall through */ } }
    var p = by(D.PLACES, id); return p ? (p.article ? p.article + " " : "") + p.es : String(id);
  }
  function icon(name) { try { return ART.icon ? ART.icon(name) : ""; } catch (e) { return ""; } }
  function art(spec, opts) { try { return ART.render(spec, opts || {}); } catch (e) { return ""; } }
  function el(tag, cls, kids) { return h(tag, cls ? { class: cls } : {}, kids); }
  function sayOrNull(text) {
    if (!text || !SP.canSpeak()) { return undefined; }
    return function () { SP.say(text); };
  }
  function round(n) { return Math.round(n); }

  /* ---------- saved state (tolerates missing or corrupt data) ---------- */
  var store = QK.store(KEY);
  var state;
  function cleanProgress(p) {
    p = obj(p);
    if (!p.items || typeof p.items !== "object" || !p.skills || typeof p.skills !== "object") { return ENG.newProgress(); }
    return { v: 1, items: obj(p.items), skills: obj(p.skills), log: arr(p.log) };
  }
  function load() {
    var raw = obj(store.get()), t = obj(raw.tonight), ms = {};
    arr(D.MISSIONS).forEach(function (m) {
      var o = obj(obj(t.missions)[m.id]);
      ms[m.id] = { learn: !!o.learn, practice: !!o.practice, activity: !!o.activity,
        firstPct: typeof o.firstPct === "number" ? o.firstPct : null, right: Number(o.right) || 0, total: Number(o.total) || 0 };
    });
    return {
      v: 1, progress: cleanProgress(raw.progress),
      tonight: { phase: ["diag", "missions", "test", "fix"].indexOf(t.phase) >= 0 ? t.phase : "diag", diagDone: !!t.diagDone,
        testDone: !!t.testDone, fixDone: !!t.fixDone, missions: ms, diagWeak: arr(t.diagWeak).slice(0, 4) },
      exams: arr(raw.exams).filter(function (x) { return x && typeof x === "object"; }).slice(-20),
      warmups: arr(raw.warmups).filter(function (x) { return x && typeof x === "object"; }).slice(-20)
    };
  }
  function save() { store.set(state); }
  state = load();

  function mission(id) { return by(D.MISSIONS, id); }
  function ms(id) {
    if (!state.tonight.missions[id]) { state.tonight.missions[id] = { learn: false, practice: false, activity: false, firstPct: null, right: 0, total: 0 }; }
    return state.tonight.missions[id];
  }
  function missionsDone() { return arr(D.MISSIONS).every(function (m) { return ms(m.id).activity; }); }
  function nextPhase() {
    if (!state.tonight.diagDone) { return "diag"; }
    if (!missionsDone()) { return "missions"; }
    if (!state.tonight.testDone) { return "test"; }
    return "fix";
  }
  function advance() { state.tonight.phase = nextPhase(); save(); }

  /* ---------- mastery helpers ---------- */
  function aggLevel(skillIds) {
    var ms2 = arr(skillIds).map(function (s) { return ENG.skillMastery(state.progress, s); });
    var seen = ms2.filter(function (m) { return m.n > 0; });
    if (!seen.length) { return "new"; }
    var avg = seen.reduce(function (s, m) { return s + m.score; }, 0) / seen.length;
    if (seen.length === ms2.length && ms2.every(function (m) { return m.level === "mastered"; })) { return "mastered"; }
    return avg >= 0.6 ? "almost" : "learning";
  }
  function recommendMission() {
    var best = null, bestNeed = -1;
    arr(D.MISSIONS).forEach(function (m) {
      if (ms(m.id).activity) { return; }
      var need = arr(m.skills).reduce(function (s, id) {
        var k = ENG.skillMastery(state.progress, id);
        return s + (k.n === 0 ? 0.5 : 1 - k.score);
      }, 0) / Math.max(1, arr(m.skills).length);
      if (need > bestNeed + 1e-9) { best = m; bestNeed = need; }
    });
    return best;
  }
  function missionIndex(id) { return arr(D.MISSIONS).map(function (m) { return m.id; }).indexOf(id) + 1; }

  /* ---------- screen plumbing ---------- */
  function show(node) {
    SP.stop();
    root.innerHTML = "";
    root.appendChild(node);
    var hd = root.querySelector("h1, h2");
    if (hd) { hd.setAttribute("tabindex", "-1"); try { hd.focus({ preventScroll: true }); } catch (e) { /* ignore */ } }
    try { window.scrollTo(0, 0); } catch (e2) { /* ignore */ }
  }
  function go(hash) {
    if (location.hash === hash) { route(); } else { location.hash = hash; }
  }
  function head(o) {
    o.onBack = o.onBack || function () { go("#home"); };
    return UI.screenHead(o);
  }
  function button(label, primary, fn) {
    return h("button", { type: "button", class: "qk-btn " + (primary ? "qk-btn-primary" : "qk-btn-ghost"), onclick: fn }, label);
  }
  function panel(title, textHtml, buttons) {
    var p = h("section", { class: "qk-panel qk-center su-step-panel" });
    if (title) { p.appendChild(h("h3", { tabindex: "-1" }, title)); }
    if (textHtml) { p.appendChild(h("p", { html: textHtml })); }
    if (arr(buttons).length) { p.appendChild(h("div", { class: "qk-row" }, buttons)); }
    return p;
  }
  function focusIn(node) {
    var f = node && node.querySelector && node.querySelector("h3, h2, h1, .qk-btn-primary");
    if (f) { f.setAttribute("tabindex", "-1"); try { f.focus({ preventScroll: true }); } catch (e) { /* ignore */ } }
  }

  /* ---------- the question runner (all modes) ---------- */
  /* cfg: { mode, questions:[id|object], title, enMode, requeue, mount, visualFor(q), extraFor(q, api), onDone(answers, primary) } */
  function recordEv(q, mode, first, hint, corrected) {
    state.progress = ENG.recordAnswer(state.progress, { qid: q.id, skill: q.skill, mode: mode, firstCorrect: !!first,
      hintUsed: !!hint, correctedAfter: !!corrected, at: Date.now() });
  }
  function promptSpeech(q) {
    return String(q.prompt || "").replace(/_{2,}/g, ",").replace(/\s+/g, " ");
  }
  function answerHtml(q, sh) {
    if (q.type === "tap") { return "<b>" + esc(placeName(q.target)) + "</b>"; }
    return sh ? "<b>" + esc(sh.choices[sh.answer]) + "</b>" : "";
  }

  function runSet(cfg) {
    var mode = cfg.mode, exam = mode === "exam";
    var oneTry = exam || mode === "diag" || mode === "warmup";
    var enMode = cfg.enMode || (exam ? "hide" : (mode === "diag" || mode === "warmup") ? "toggle" : "show");
    var rng = ENG.createRng(cfg.seed == null ? newSeed() : cfg.seed);
    var queue = [], usedIds = {}, answers = [], pos = 0, finished = false;
    arr(cfg.questions).forEach(function (x) {
      var q = typeof x === "string" ? getQ(x) : x;
      if (q) { queue.push({ q: q, retry: false }); usedIds[q.id] = true; }
    });
    var host = h("div", { class: "su-run" });

    function render(nodes) { host.innerHTML = ""; arr(nodes).forEach(function (n) { if (n) { host.appendChild(n); } }); }
    function labelFor(e) {
      return (e.retry ? "Same idea, new words · " : "") + (cfg.title ? cfg.title + " · " : "") + "Question " + (pos + 1) + " of " + queue.length;
    }
    function step() {
      if (pos >= queue.length) { return done(); }
      if (exam) { askExam(queue[pos]); } else { ask(queue[pos]); }
      if (pos > 0) { try { host.scrollIntoView({ block: "start" }); } catch (e) { /* ignore */ } }
    }
    function done() {
      if (finished) { return; }
      finished = true;
      if (exam) { answers.forEach(function (a) { recordEv({ id: a.qid, skill: a.skill }, "exam", a.firstCorrect, false, false); }); save(); }
      var primary = answers.filter(function (a) { return !a.retry; });
      if (cfg.onDone) { cfg.onDone(answers, primary); }
    }

    function build(e, sh) {
      var q = e.q, isTap = q.type === "tap", board = null, visualEl = null, visualSvg = null, card;
      var st = { tries: 0, hint: false, done: false, first: null, corrected: false, wrong: {}, selected: null, nextShown: false };
      if (isTap) {
        board = UI.mapBoard({ map: D.MAP, places: D.PLACES, labels: true, interactive: true,
          onPick: function (id) { if (exam) { return; } attemptTap(id); } });
        visualEl = board.el;
      } else {
        if (cfg.visualFor) { visualEl = cfg.visualFor(q); }
        if (!visualEl && q.art) { visualSvg = art(q.art); }
      }
      var showEn = enMode !== "hide" && q.promptEn;
      card = UI.questionCard({
        label: labelFor(e), progress: queue.length ? pos / queue.length : 0,
        promptHtml: esc(q.prompt || ""), promptEn: showEn ? q.promptEn : undefined, enMode: showEn ? enMode : "hide",
        visualSvg: visualSvg || undefined, visualEl: visualEl || undefined,
        layout: sh && sh.choiceArt ? "picture" : "text",
        choices: sh ? sh.choices.map(function (c, i) {
          var o = { text: String(c) };
          if (sh.choiceArt && sh.choiceArt[i]) { o.artSvg = art(sh.choiceArt[i]); }
          return o;
        }) : [],
        hint: !exam && q.hint ? q.hint : undefined,
        onChoose: function (i) { if (!isTap) { choose(i); } },
        onHintRequest: exam ? undefined : function () { st.hint = true; card.showHint(); },
        onSpeak: exam ? undefined : sayOrNull(promptSpeech(q)),
        onEnToggle: exam ? undefined : function () { st.hint = true; }
      });
      var ctl = { q: q, st: st, card: card, board: board, e: e };

      function mark(key, s) { if (board) { board.mark(key, s); } else { card.mark(key, s); } }
      function reveal() { if (board) { board.mark(q.target, "answer"); } else { card.mark(sh.answer, "answer"); } }

      function choose(i) {
        if (st.done) { return; }
        if (exam) {
          if (st.selected != null) { card.mark(st.selected, null); }
          st.selected = i; card.mark(i, "selected");
          if (!st.nextShown) {
            st.nextShown = true;
            card.next(pos + 1 >= queue.length ? "Finish" : "Next →", function () {
              answers.push({ qid: q.id, skill: q.skill, firstCorrect: st.selected === sh.answer, hintUsed: false, correctedAfter: false, retry: false, mode: "exam", picked: st.selected });
              pos++; step();
            });
          }
          return;
        }
        attempt(i, i === sh.answer);
      }
      function attemptTap(id) {
        if (st.done || st.wrong[id]) { return; }
        attempt(id, id === q.target);
      }
      function attempt(key, correct) {
        st.tries++;
        if (correct) {
          mark(key, "right");
          st.first = st.tries === 1; st.corrected = st.tries > 1;
          card.feedback(st.corrected
            ? { tone: "right", title: "Fixed it!", html: q.explain || "" }
            : { tone: "right", title: st.hint ? "Correct — you used a hint" : "Correct!", html: q.explain || "" });
          return resolve();
        }
        mark(key, "wrong"); st.wrong[key] = true;
        if (st.tries === 1) { st.first = false; }
        if (oneTry || st.tries >= 2) {
          reveal();
          card.feedback({ tone: "wrong", title: "Not this one — here's the idea", html: "<b>Answer:</b> " + answerHtml(q, sh).replace(/<\/?b>/g, "") + (q.explain ? "<br>" + q.explain : "") });
          return resolve();
        }
        if (!board) { card.disable(key); }
        card.feedback({ tone: "retry", title: "Not quite — try once more", html: q.hint ? "<b>Hint:</b> " + q.hint : "Look again at the picture and the words." });
      }
      function resolve() {
        st.done = true; card.lock(); if (board) { board.setInteractive(false); }
        var first = !!st.first;
        recordEv(q, mode, first, st.hint, st.corrected); save();
        answers.push({ qid: q.id, skill: q.skill, firstCorrect: first, hintUsed: st.hint, correctedAfter: st.corrected, retry: e.retry, mode: mode });
        if (!first && cfg.requeue && !e.retry && String(q.id).indexOf("gen-") !== 0) { enqueueRetry(q); }
        card.next(pos + 1 >= queue.length ? "Finish" : "Next →", function () { pos++; step(); });
      }
      return ctl;
    }

    function ask(e) {
      var sh = e.q.type === "tap" ? null : ENG.shuffleChoices(e.q, rng);
      var ctl = build(e, sh);
      var extra = cfg.extraFor ? cfg.extraFor(e.q, { useHint: function () { ctl.st.hint = true; }, card: ctl.card }) : null;
      render([ctl.card.el, extra]);
      ctl.card.focusPrompt();
    }
    function askExam(e) {
      var sh = ENG.shuffleChoices(e.q, rng);
      var ctl = build(e, sh);
      render([ctl.card.el]);
      ctl.card.focusPrompt();
    }

    /* a missed item comes back 2-3 questions later, worded differently when the bank has a sibling */
    function enqueueRetry(q) {
      var all = arr(D.QUESTIONS), pick = null, c;
      function choose(list) {
        var same = list.filter(function (x) { return x.type === q.type; });
        var pool = same.length ? same : list;
        return pool.length ? pool[Math.floor(rng() * pool.length)] : null;
      }
      c = all.filter(function (x) { return x.id !== q.id && !usedIds[x.id] && x.family && x.family === q.family; });
      pick = choose(c);
      if (!pick) { pick = choose(all.filter(function (x) { return x.id !== q.id && !usedIds[x.id] && x.skill === q.skill; })); }
      if (!pick) { pick = q; }
      usedIds[pick.id] = true;
      queue.splice(Math.min(queue.length, pos + 1 + (rng() < 0.5 ? 2 : 3)), 0, { q: pick, retry: true });
    }

    var api = { el: host, start: function () { step(); } };
    if (cfg.mount) { cfg.mount.innerHTML = ""; cfg.mount.appendChild(host); api.start(); }
    return api;
  }

  /* ---------- results helper ---------- */
  function missedList(qids) {
    return arr(qids).map(function (id) {
      var q = getQ(id); if (!q) { return null; }
      var ans = q.type === "tap" ? placeName(q.target) : arr(q.choices)[q.answer];
      return { promptHtml: esc(q.prompt || ""), answerHtml: ans ? "<b>" + esc(ans) + "</b>" : "", explainHtml: q.explain || "" };
    }).filter(Boolean);
  }
  function areaRows(sc) {
    return arr(D.AREAS).map(function (a) { var r = sc.byArea[a.id]; return r ? { label: a.label, right: r.right, total: r.total } : null; }).filter(Boolean);
  }
  function resultsNode(title, sc, note, actions, withAreas) {
    return UI.results({ title: title, pct: sc.pct, firstTry: sc.firstTry, total: sc.total, corrected: sc.corrected,
      areas: withAreas === false ? [] : areaRows(sc), note: note, actions: actions, missed: missedList(sc.missed) });
  }

  /* ================= screens ================= */

  /* ---------- home ---------- */
  function nextStop() {
    var t = state.tonight;
    if (!t.diagDone) { return { hash: "#mission", title: "Find your weak spots", text: "12 quick questions to see where to start." }; }
    if (!missionsDone()) {
      var rec = recommendMission();
      if (rec) {
        var s = ms(rec.id), what = !s.learn ? "Start with the lesson cards." : !s.practice ? "Next: practice." : "Next: the activity.";
        return { hash: "#mission/" + rec.id, title: "Mission " + missionIndex(rec.id) + ": " + rec.title, text: what };
      }
    }
    if (!t.testDone) { return { hash: "#test", title: "Test Ready Challenge", text: "24 questions, like a real quiz. Feedback comes at the end." }; }
    if (!t.fixDone) { return { hash: "#fix", title: "Fix My Mistakes", text: "A short round on what was tricky." }; }
    return null;
  }
  function started() {
    var t = state.tonight;
    return t.diagDone || arr(D.MISSIONS).some(function (m) { var s = ms(m.id); return s.learn || s.practice || s.activity; });
  }

  function home() {
    var wrap = h("div", { class: "su-home" });
    wrap.appendChild(h("h2", { class: "su-home-title" }, "What do you want to do?"));
    var cards = h("div", { class: "su-cards" });
    var cont = started() ? nextStop() : null;
    if (cont) {
      cards.appendChild(UI.actionCard({ tone: "mission", icon: icon("mission"), title: "Continue: " + cont.title, text: cont.text,
        meta: [], cta: "Continue →", badge: "Where you left off", onClick: function () { go(cont.hash); } }));
    }
    cards.appendChild(UI.actionCard({ tone: "mission", icon: icon("mission"), title: "Start Tonight's Study Mission",
      text: "Find your weak spots, learn four short missions, then try a practice test.", meta: ["30–40 min", "Best first step"],
      cta: started() ? "Open the mission" : "Start", onClick: function () { go("#mission"); } }));
    cards.appendChild(UI.actionCard({ tone: "practice", icon: icon("practice"), title: "Quick Practice",
      text: "Pick a topic and practice it. Mistakes come back in new words.", meta: ["5–10 min"], cta: "Pick a topic", onClick: function () { go("#practice"); } }));
    cards.appendChild(UI.actionCard({ tone: "test", icon: icon("test"), title: "Practice Test",
      text: "24 multiple-choice questions. You see how you did at the end.", meta: ["8–10 min"], cta: "Try it", onClick: function () { go("#test"); } }));
    cards.appendChild(UI.actionCard({ tone: "warmup", icon: icon("warmup"), title: "Tomorrow Morning 7-Minute Warm-Up",
      text: "Ten easy questions to wake up your Spanish before the quiz.", meta: ["7 min", "Always open"], cta: "Warm up", onClick: function () { go("#warmup"); } }));
    wrap.appendChild(cards);
    wrap.appendChild(h("div", { class: "qk-grid2 su-secondary" },
      UI.actionCard({ tone: "sheet", icon: icon("sheet"), title: "Unit 2 Study Sheet", text: "Words with pictures, the ESTAR chart and direction words.",
        meta: [], cta: "Open", onClick: function () { go("#sheet"); } }),
      UI.actionCard({ tone: "progress", icon: icon("progress"), title: "My Progress", text: "See each skill and what to practice next.",
        meta: [], cta: "Open", onClick: function () { go("#progress"); } })));
    show(wrap);
  }

  /* ---------- Tonight's Study Mission hub ---------- */
  var PHASES = [
    { id: "diag", label: "Find Your Weak Spots", minutes: 5 },
    { id: "missions", label: "Four Missions", minutes: 20 },
    { id: "test", label: "Test Ready Challenge", minutes: 8 },
    { id: "fix", label: "Fix My Mistakes", minutes: 5 }
  ];
  var MISSION_ART = {
    m1: { kind: "place", id: "farmacia" }, m2: { kind: "clothing", item: "camisa", color: "rojo" },
    m3: { kind: "tool", id: "escoba" }, m4: { kind: "person", id: "nosotros" }
  };

  function hub() {
    var wrap = h("div", { class: "su-hub" });
    var body = h("div", { class: "su-hub-body" });
    function phaseList() {
      var t = state.tonight;
      return PHASES.map(function (p) {
        return { id: p.id, label: p.label, minutes: p.minutes,
          done: p.id === "diag" ? t.diagDone : p.id === "missions" ? missionsDone() : p.id === "test" ? t.testDone : t.fixDone };
      });
    }
    function paint() {
      var bar = QK.phaseBar(phaseList(), state.tonight.phase, function (id) { state.tonight.phase = id; save(); paint(); });
      wrap.innerHTML = "";
      wrap.appendChild(head({ eyebrow: "Tonight's Study Mission", title: "Your 30–40 minute plan",
        text: "Four steps. You can stop and come back any time — your place is saved.", onBack: function () { go("#home"); } }));
      wrap.appendChild(bar);
      body = h("div", { class: "su-hub-body" });
      wrap.appendChild(body);
      var p = state.tonight.phase;
      if (p === "diag") { hubDiag(body, paint); } else if (p === "missions") { hubMissions(body); }
      else if (p === "test") { hubTest(body); } else { hubFix(body); }
    }
    paint();
    show(wrap);
  }

  function hubDiag(body, repaint) {
    var t = state.tonight;
    function start() {
      var qids = ENG.buildDiagnostic(D, ENG.createRng(newSeed()));
      body.innerHTML = "";
      var r = runSet({ mode: "diag", questions: qids, title: "Weak spots", onDone: function (ans, primary) {
        var sc = ENG.scoreRun(primary, D);
        t.diagDone = true; t.diagWeak = ENG.weakestSkills(state.progress, D, 3); advance(); state.tonight.phase = "missions"; save();
        body.innerHTML = "";
        var weak = t.diagWeak.map(skillLabel);
        var node = resultsNode("Here's where you are", sc,
          "This is not a grade — it just shows where to start. " + (weak.length ? "Your first practice stops: " + weak.join(", ") + "." : ""),
          [{ label: "On to the four missions →", primary: true, onClick: function () { state.tonight.phase = "missions"; save(); repaint(); } }], true);
        body.appendChild(node); focusIn(node);
      } });
      body.appendChild(r.el); r.start();
    }
    if (t.diagDone) {
      var weak = arr(t.diagWeak).map(skillLabel);
      var pn = panel("Weak spots found ✓", weak.length ? "Start with: <b>" + esc(weak.join(", ")) + "</b>." : "Nice start.",
        [button("Go to the missions →", true, function () { state.tonight.phase = "missions"; save(); repaint(); }), button("Do it again", false, start)]);
      body.appendChild(pn);
    } else {
      body.appendChild(panel("Find your weak spots",
        "12 quick questions, one for each skill. You get <b>one try</b> each, then a short explanation. English help is under “Show English” (it counts as a hint).",
        [button("Start", true, start)]));
    }
  }

  function hubMissions(body) {
    var rec = recommendMission();
    var tiles = h("div", { class: "su-tiles qk-grid2" });
    arr(D.MISSIONS).forEach(function (m) {
      var s = ms(m.id), status = s.activity ? "Complete ✓" : s.practice ? "Next: activity" : s.learn ? "Next: practice" : "Not started";
      var isRec = rec && rec.id === m.id;
      tiles.appendChild(UI.tile({ title: "Mission " + missionIndex(m.id) + ": " + m.title,
        text: status + (isRec ? " · Start here" : ""), artSvg: art(MISSION_ART[m.id] || { kind: "place", id: "tienda" }, { decorative: true }),
        level: aggLevel(m.skills), onClick: function () { go("#mission/" + m.id); } }));
    });
    body.appendChild(UI.notice({ tone: "info", html: rec ? "Suggested first: <b>" + esc(rec.title) + "</b> — it looks like your trickiest one. Any order works." : "All four missions are done. Great work!" }));
    body.appendChild(tiles);
    if (missionsDone()) { body.appendChild(h("div", { class: "qk-row" }, button("Next: Test Ready Challenge →", true, function () { go("#test"); }))); }
  }
  function hubTest(body) {
    body.appendChild(panel("Test Ready Challenge", "24 questions like a real multiple-choice quiz. No hints and no feedback until the end — then you see what to review.",
      [button("Start the challenge", true, function () { go("#test"); })]));
  }
  function hubFix(body) {
    var list = ENG.buildFix(D, state.progress, ENG.createRng(1));
    if (list.length) {
      body.appendChild(panel("Fix My Mistakes", "A short round on the ones that were tricky. You'll see new wording first, then the originals.",
        [button("Start fixing", true, function () { go("#fix"); })]));
    } else {
      body.appendChild(UI.notice({ tone: "good", html: "Nothing to fix right now. Try the Practice Test, or finish with tomorrow's 7-minute warm-up." }));
      body.appendChild(h("div", { class: "qk-row" }, button("Practice Test", true, function () { go("#test"); }), button("Quick Practice", false, function () { go("#practice"); })));
    }
  }

  /* ---------- one mission: learn → practice → activity → recap ---------- */
  var STEP_NAMES = ["Learn", "Practice", "Activity", "Recap"];

  function missionScreen(mid, review) {
    var m = mission(mid);
    if (!m) { return go("#mission"); }
    var s = ms(mid);
    var stepIdx = review ? 0 : !s.learn ? 0 : !s.practice ? 1 : !s.activity ? 2 : 3;
    var wrap = h("div", { class: "su-mission" });
    wrap.appendChild(head({ eyebrow: "Mission " + missionIndex(mid) + " · Step " + (stepIdx + 1) + " of 4: " + STEP_NAMES[stepIdx],
      title: m.title, text: m.titleEs || "", onBack: function () { go("#mission"); }, backLabel: "← Tonight's mission" }));
    var body = h("div", { class: "su-mission-body" });
    wrap.appendChild(body);
    show(wrap);
    if (stepIdx === 0) { learnStep(m, body, review); }
    else if (stepIdx === 1) { practiceStep(m, body); }
    else if (stepIdx === 2) { activityStep(m, body); }
    else { recap(m, body); }
  }

  function learnStep(m, body, review) {
    var cards = arr(m.learn), k = 0;
    function finish() {
      if (review) { go("#mission/" + m.id); return; }
      ms(m.id).learn = true; save(); missionScreen(m.id);
    }
    if (!cards.length) { return finish(); }
    function paint() {
      var c = cards[k];
      body.innerHTML = "";
      var lc = UI.learnCard({ step: (k + 1) + " of " + cards.length, title: c.title, html: c.html,
        artSvgs: arr(c.art).map(function (a) { return art(a); }), say: c.say, onSay: sayOrNull(c.say) });
      body.appendChild(lc);
      var nav = h("div", { class: "qk-row su-learn-nav" });
      if (k > 0) { nav.appendChild(button("← Back", false, function () { k--; paint(); })); }
      var last = k === cards.length - 1;
      nav.appendChild(button(last ? (review ? "Done" : "Practice time →") : "Next →", true, function () { if (last) { finish(); } else { k++; paint(); } }));
      body.appendChild(nav);
      focusIn(lc);
    }
    paint();
  }

  function addTotals(mid, primary) {
    var s = ms(mid), sc = ENG.scoreRun(primary, D);
    s.right += sc.firstTry; s.total += sc.total;
    s.firstPct = s.total ? round(s.right / s.total * 100) : null;
  }

  function practiceStep(m, body) {
    var qids = arr(m.practice).filter(function (id) { return getQ(id); });
    function finishPractice(primary) {
      var s = ms(m.id);
      addTotals(m.id, primary); s.practice = true; save();
      var sc = ENG.scoreRun(primary, D);
      body.innerHTML = "";
      var pn = panel("Practice done", "You got <b>" + sc.firstTry + " of " + sc.total + "</b> on the first try. Missed ones came back in new words. Next: a hands-on activity.",
        [button("Activity →", true, function () { missionScreen(m.id); })]);
      body.appendChild(pn); focusIn(pn);
    }
    if (!qids.length) { return finishPractice([]); }
    var r = runSet({ mode: "learn", questions: qids, title: "Practice", requeue: true, onDone: function (a, primary) { finishPractice(primary); } });
    body.appendChild(r.el); r.start();
  }

  function activityStep(m, body) {
    var act = obj(m.activity), type = act.type;
    var ctx = { mount: body, data: D, UI: UI, ART: ART, ENG: ENG, speech: SP, mission: m,
      run: function (opts) {
        opts = opts || {}; opts.mode = "activity"; opts.mount = opts.mount || body;
        if (opts.requeue == null) { opts.requeue = true; }
        return runSet(opts);
      },
      finish: function (primary) {
        var s = ms(m.id);
        addTotals(m.id, arr(primary)); s.activity = true; advance();
        QK.celebrate("Mission complete");
        missionScreen(m.id);
      } };
    if (ACT && typeof ACT.run === "function" && ACT.types && ACT.types.indexOf(type) >= 0) {
      try { ACT.run(type, m, ctx); return; } catch (e) { body.innerHTML = ""; }
    }
    /* fallback: just run the activity's tasks */
    ctx.run({ questions: arr(act.tasks), title: "Activity", onDone: function (a, primary) { ctx.finish(primary); } });
  }

  function recap(m, body) {
    var s = ms(m.id), rec = recommendMission();
    var pn = h("section", { class: "qk-panel su-recap" });
    pn.appendChild(h("h3", { tabindex: "-1" }, "Mission complete ✓"));
    pn.appendChild(h("p", null, s.total ? "On the first try you got " + s.right + " of " + s.total + " in this mission. What you missed will come back in Fix My Mistakes." : "Nice work finishing this mission."));
    var list = h("ul", { class: "su-recap-skills" });
    arr(m.skills).forEach(function (id) {
      list.appendChild(h("li", null, h("span", { class: "su-recap-label" }, skillLabel(id) + " "), UI.masteryChip(ENG.skillMastery(state.progress, id).level)));
    });
    pn.appendChild(list);
    var row = h("div", { class: "qk-row" });
    if (!missionsDone() && rec) { row.appendChild(button("Next: " + rec.title + " →", true, function () { go("#mission/" + rec.id); })); }
    else if (missionsDone()) { row.appendChild(button("Next: Test Ready Challenge →", true, function () { go("#test"); })); }
    row.appendChild(button("Back to tonight's mission", false, function () { go("#mission"); }));
    row.appendChild(button("Review the lesson", false, function () { missionScreen(m.id, "learn"); }));
    pn.appendChild(row);
    body.appendChild(pn); focusIn(pn);
  }

  /* ---------- Quick Practice ---------- */
  function practicePicker() {
    var wrap = h("div", { class: "su-practice" });
    wrap.appendChild(head({ eyebrow: "Quick Practice", title: "Pick a topic", text: "10 questions. If you miss one, it comes back a little later in new words." }));
    var grid = h("div", { class: "su-tiles qk-grid2" });
    arr(D.TOPICS).forEach(function (t) {
      grid.appendChild(UI.tile({ title: t.label, text: t.text, artSvg: icon("practice"), level: aggLevel(t.skills),
        onClick: function () { go("#practice/" + t.id); } }));
    });
    wrap.appendChild(grid);
    show(wrap);
  }
  function practiceRun(topicId) {
    var skills, title;
    if (topicId.indexOf("skill-") === 0) {
      var sid = topicId.slice(6);
      if (!skillRow(sid)) { return go("#practice"); }
      skills = [sid]; title = skillLabel(sid);
    } else {
      var t = by(D.TOPICS, topicId);
      if (!t) { return go("#practice"); }
      skills = t.skills; title = t.label;
    }
    var wrap = h("div", { class: "su-practice" });
    wrap.appendChild(head({ eyebrow: "Quick Practice", title: title, onBack: function () { go("#practice"); }, backLabel: "← Topics" }));
    var body = h("div", { class: "su-run-wrap" });
    wrap.appendChild(body);
    show(wrap);
    var rng = ENG.createRng(newSeed());
    var qids = ENG.buildPractice(D, state.progress, { skills: skills, count: 10, rng: rng });
    var r = runSet({ mode: "practice", questions: qids, title: title, requeue: true, onDone: function (a, primary) {
      var sc = ENG.scoreRun(primary, D);
      body.innerHTML = "";
      var node = resultsNode("Round finished", sc, sc.missed.length ? "The ones you missed will be waiting in Fix My Mistakes." : "Every one on the first try. Try another topic!",
        [{ label: "Another round", primary: true, onClick: function () { go("#practice/" + topicId); } },
         { label: "Pick another topic", onClick: function () { go("#practice"); } },
         { label: "Home", onClick: function () { go("#home"); } }], false);
      body.appendChild(node); focusIn(node);
    } });
    if (!qids.length) { body.appendChild(UI.notice({ tone: "info", html: "No questions for this topic yet." })); return; }
    body.appendChild(r.el); r.start();
  }

  /* ---------- Practice Test (Test Ready Challenge) ---------- */
  function testScreen(skipIntro) {
    var wrap = h("div", { class: "su-test" });
    wrap.appendChild(head({ eyebrow: "Practice Test", title: "Test Ready Challenge", text: "Like the real quiz: pick one answer for each question. No hints, and no right or wrong until the end." }));
    var body = h("div", { class: "su-run-wrap" });
    wrap.appendChild(body);
    show(wrap);
    function start() {
      body.innerHTML = "";
      var qids = ENG.buildExam(D, ENG.createRng(newSeed()));
      var recorded = false;
      var r = runSet({ mode: "exam", questions: qids, title: "Test", onDone: function (answers, primary) {
        var sc = ENG.scoreRun(primary, D);
        if (!recorded) {
          recorded = true;
          if (window.StudyQuest && typeof window.StudyQuest.record === "function") { window.StudyQuest.record("spanish-unit2", sc.pct); }
          state.exams.push({ at: Date.now(), pct: sc.pct, firstTry: sc.firstTry, total: sc.total, byArea: sc.byArea });
          state.exams = state.exams.slice(-20);
          state.tonight.testDone = true; advance();
        }
        body.innerHTML = "";
        var node = resultsNode("Test Ready Challenge finished", sc,
          sc.missed.length ? "Look at what you missed below, then press “Practice my misses”. That is how you get ready." : "Every answer right on the first try. Keep it fresh with tomorrow's warm-up.",
          [{ label: "Practice my misses", primary: sc.missed.length > 0, onClick: function () { go("#fix"); } },
           { label: "New test", primary: sc.missed.length === 0, onClick: function () { start(); } },
           { label: "Home", onClick: function () { go("#home"); } }], true);
        body.appendChild(node); focusIn(node);
        if (sc.pct >= 80) { QK.celebrate("Test finished"); } else { QK.announce("Test finished"); }
      } });
      body.appendChild(r.el); r.start();
    }
    if (skipIntro) { return start(); }
    var intro = panel("Ready?", "24 questions, about 8–10 minutes. You can change your pick before pressing Next.", [button("Start the test", true, start)]);
    body.appendChild(intro);
  }

  /* ---------- Morning warm-up ---------- */
  function warmupScreen() {
    var wrap = h("div", { class: "su-warmup" });
    wrap.appendChild(head({ eyebrow: "Tomorrow morning", title: "7-Minute Warm-Up", text: "Ten easy questions to wake up your Spanish. It is always here when you need it." }));
    var body = h("div", { class: "su-run-wrap" });
    wrap.appendChild(body);
    show(wrap);
    function chartFor(q, api) {
      if (q.skill !== "s4-estar") { return null; }
      var holder = h("div", { class: "su-peek" });
      var chart = null;
      var b = h("button", { type: "button", class: "qk-btn qk-btn-ghost", "aria-expanded": "false" }, "Peek at the ESTAR chart (counts as a hint)");
      b.addEventListener("click", function () {
        if (!chart) {
          api.useHint();
          chart = UI.estarChart({ rows: D.ESTAR, highlight: null, onSay: SP.canSpeak() ? function (t) { SP.say(t); } : undefined });
          holder.appendChild(chart);
          b.setAttribute("aria-expanded", "true"); b.textContent = "Chart is open";
        }
      });
      holder.appendChild(b);
      return holder;
    }
    function start() {
      body.innerHTML = "";
      var qids = ENG.buildWarmup(D, state.progress, ENG.createRng(newSeed()));
      var r = runSet({ mode: "warmup", questions: qids, title: "Warm-up", extraFor: chartFor, onDone: function (a, primary) {
        var sc = ENG.scoreRun(primary, D);
        state.warmups.push({ at: Date.now(), firstTry: sc.firstTry, total: sc.total }); state.warmups = state.warmups.slice(-20); save();
        body.innerHTML = "";
        var node = resultsNode("Warm-up finished", sc, "Nice. You're ready to go!",
          [{ label: "Again", onClick: function () { start(); } }, { label: "Home", primary: true, onClick: function () { go("#home"); } }], false);
        body.appendChild(node);
        body.appendChild(rememberCard());
        focusIn(node);
      } });
      if (!qids.length) { body.appendChild(UI.notice({ tone: "info", html: "No warm-up questions yet." })); return; }
      body.appendChild(r.el); r.start();
    }
    body.appendChild(panel("Ready to warm up?", "About 7 minutes. One try for each question, with a quick explanation. You can show English help or peek at the ESTAR chart — those count as hints.",
      [button("Start the warm-up", true, start)]));
  }
  function rememberCard() {
    return h("section", { class: "qk-panel su-remember", "aria-label": "Remember" },
      h("h3", null, "Remember 3 things"),
      h("ol", null,
        h("li", { html: "<b>ESTAR</b> changes with the person: <i>yo estoy, tú estás, él/ella está, nosotros estamos, ellos están</i>." }),
        h("li", { html: "<b>Colors</b> match the thing: <i>camisa roja</i>, <i>pantalón rojo</i>. <i>Azul</i>, <i>verde</i> and <i>marrón</i> don't change." }),
        h("li", { html: "<b>Left and right</b>: look at the map the way you see it. <i>a la izquierda de</i> = left of, <i>a la derecha de</i> = right of." })));
  }

  /* ---------- Fix My Mistakes ---------- */
  function fixScreen() {
    var wrap = h("div", { class: "su-fix" });
    wrap.appendChild(head({ eyebrow: "Fix My Mistakes", title: "Let's fix the tricky ones", text: "New wording first, then the ones you missed. Fixing mistakes is how it sticks." }));
    var body = h("div", { class: "su-run-wrap" });
    wrap.appendChild(body);
    show(wrap);
    var qids = ENG.buildFix(D, state.progress, ENG.createRng(newSeed()));
    if (!qids.length) {
      body.appendChild(UI.notice({ tone: "good", html: "Nothing to fix right now — nice! Try a Practice Test or Quick Practice to find new tricky spots." }));
      body.appendChild(h("div", { class: "qk-row" }, button("Practice Test", true, function () { go("#test"); }), button("Quick Practice", false, function () { go("#practice"); })));
      return;
    }
    var r = runSet({ mode: "fix", questions: qids, title: "Fix", onDone: function (a, primary) {
      var sc = ENG.scoreRun(primary, D);
      state.tonight.fixDone = true; save();
      body.innerHTML = "";
      var node = resultsNode("Fix round finished", sc, sc.missed.length ? "Some are still tricky. Do another fix round, or practice that topic." : "All fixed. That's real progress.",
        [{ label: "Fix more", primary: sc.missed.length > 0, onClick: function () { go("#fix"); } },
         { label: "Quick Practice", onClick: function () { go("#practice"); } },
         { label: "Home", primary: sc.missed.length === 0, onClick: function () { go("#home"); } }], false);
      body.appendChild(node); focusIn(node);
    } });
    body.appendChild(r.el); r.start();
  }

  /* ---------- My Progress ---------- */
  function progressScreen() {
    var wrap = h("div", { class: "su-progress" });
    wrap.appendChild(head({ eyebrow: "My Progress", title: "Skill by skill", text: "A skill is “mastered” after three clean answers in a row. Hints and mistakes just mean: practice it more." }));
    var rows = arr(D.SKILLS).map(function (s) {
      var m = ENG.skillMastery(state.progress, s.id);
      return { label: s.label, week: s.week, level: m.level, score: m.score, onPractice: function () { go("#practice/skill-" + s.id); } };
    });
    var any = arr(D.SKILLS).some(function (s) { return ENG.skillMastery(state.progress, s.id).n > 0; });
    var weak = ENG.weakestSkills(state.progress, D, 1)[0];
    var next = h("div", { class: "su-next" });
    if (!any) {
      next.appendChild(UI.notice({ tone: "info", html: "<b>Next step:</b> start Tonight's Study Mission. It finds your weak spots first." }));
      next.appendChild(h("div", { class: "qk-row" }, button("Start Tonight's Study Mission", true, function () { go("#mission"); })));
    } else if (weak && ENG.skillMastery(state.progress, weak).level !== "mastered") {
      next.appendChild(UI.notice({ tone: "info", html: "<b>Next step:</b> practice <b>" + esc(skillLabel(weak)) + "</b> — about 5 minutes." }));
      next.appendChild(h("div", { class: "qk-row" }, button("Practice " + skillLabel(weak), true, function () { go("#practice/skill-" + weak); })));
    } else {
      next.appendChild(UI.notice({ tone: "good", html: "<b>Next step:</b> keep it fresh with the 7-Minute Warm-Up tomorrow morning." }));
      next.appendChild(h("div", { class: "qk-row" }, button("Open the warm-up", true, function () { go("#warmup"); })));
    }
    wrap.appendChild(next);
    wrap.appendChild(UI.masteryPanel({ rows: rows }));
    if (state.exams.length) {
      var ul = h("ul", { class: "su-history" });
      state.exams.slice(-5).reverse().forEach(function (x) {
        ul.appendChild(h("li", null, new Date(x.at || 0).toLocaleDateString() + ": " + x.firstTry + " of " + x.total + " on the first try"));
      });
      wrap.appendChild(h("section", { class: "qk-panel" }, h("h3", null, "Recent practice tests"), ul));
    }
    show(wrap);
  }

  /* ---------- Study Sheet ---------- */
  var DIRECTIONS = [
    { es: "a la izquierda de", en: "to the left of" }, { es: "a la derecha de", en: "to the right of" },
    { es: "enfrente de", en: "across from, in front of" }, { es: "detrás de", en: "behind" },
    { es: "cerca de", en: "near" }, { es: "lejos de", en: "far from" }
  ];
  function sheetScreen() {
    var wrap = h("div", { class: "su-sheet" });
    wrap.appendChild(head({ eyebrow: "Study Sheet", title: "Unit 2 words and rules", text: "Look, say it out loud, then go practice." }));
    var say = SP.canSpeak() ? function (t) { SP.say(t); } : null;
    arr(D.WEEKS).forEach(function (w) {
      var items = arr(D.VOCAB).filter(function (v) { return v.week === w.week; }).map(function (v) {
        return { es: v.es, en: v.en, artSvg: v.art ? art(v.art, { decorative: true }) : "", onSay: say ? function () { say(v.es); } : undefined };
      });
      if (items.length) { wrap.appendChild(UI.vocabGrid({ title: "Week " + w.week + " · " + w.title + (w.en ? " (" + w.en + ")" : ""), items: items })); }
    });
    wrap.appendChild(h("section", { class: "qk-panel" }, h("h3", null, "ESTAR: to be (where someone is)"),
      UI.estarChart({ rows: D.ESTAR, highlight: null, onSay: say ? function (t) { say(t); } : undefined })));
    wrap.appendChild(UI.vocabGrid({ title: "Direction words", items: DIRECTIONS.map(function (d) {
      return { es: d.es, en: d.en, artSvg: "", onSay: say ? function () { say(d.es); } : undefined };
    }) }));
    wrap.appendChild(h("div", { class: "qk-row" }, button("Practice now", true, function () { go("#practice"); }), button("Home", false, function () { go("#home"); })));
    show(wrap);
  }

  /* ---------- router ---------- */
  function route() {
    var parts = String(location.hash || "#home").replace(/^#/, "").split("/");
    var name = parts[0] || "home", arg = parts[1];
    try {
      if (name === "mission") { return arg ? missionScreen(arg) : hub(); }
      if (name === "practice") { return arg ? practiceRun(arg) : practicePicker(); }
      if (name === "test") { return testScreen(false); }
      if (name === "warmup") { return warmupScreen(); }
      if (name === "fix") { return fixScreen(); }
      if (name === "progress") { return progressScreen(); }
      if (name === "sheet") { return sheetScreen(); }
      return home();
    } catch (err) {
      SP.stop();
      root.innerHTML = "";
      root.appendChild(panel("Something went wrong", "Your progress is saved. Let's go back to the start.",
        [button("Back home", true, function () { go("#home"); })]));
    }
  }
  window.addEventListener("hashchange", route);
  route();
})();

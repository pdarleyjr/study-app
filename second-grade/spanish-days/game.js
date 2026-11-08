/* Spanish Days of the Week Adventure: screens and navigation.
   Screens: menu, meet, train, next, before, missing, listen, say, challenge, quick, parent (parent.js).
   URL hash picks the screen (#quick opens the Monday Morning Quick Review directly). */
(function () {
  "use strict";
  var SD = window.SD = window.SD || {};
  var app = document.getElementById("app");
  if (!SD.data || !SD.speech || !SD.store || !SD.ui || !SD.quiz || !app) { return; }
  var D = SD.data, ui = SD.ui, el = ui.el, btn = ui.btn, speech = SD.speech, store = SD.store, quiz = SD.quiz;
  var PREF_KEY = "studyquest:spanish-days:prefs";

  /* ---------- read-aloud preference (on by default) ---------- */
  var prefs = (function () { try { return JSON.parse(localStorage.getItem(PREF_KEY)) || {}; } catch (e) { return {}; } })();
  SD.prefs = {
    read: function () { return prefs.read !== false && speech.canSpeak(); },
    toggle: function () { prefs.read = prefs.read === false; try { localStorage.setItem(PREF_KEY, JSON.stringify(prefs)); } catch (e) { /* ignore */ } }
  };

  var ACT = {
    meet: { n: 1, icon: "👋", title: "Meet the Days", sub: "Tap, listen, move", es: "Conoce los días" },
    train: { n: 2, icon: "🚂", title: "Days Train", sub: "Put the week in order", es: "El tren" },
    next: { n: 3, icon: "➡️", title: "What Comes Next?", sub: "después del…", es: "¿Qué sigue?" },
    before: { n: 4, icon: "⏪", title: "Time Traveler", sub: "antes del…", es: "¿Qué viene antes?" },
    missing: { n: 5, icon: "🔍", title: "Missing Day Mystery", sub: "Find the gap", es: "El día que falta" },
    listen: { n: 6, icon: "👂", title: "Listen & Find", sub: "Hear it, find it", es: "Escucha" },
    say: { n: 7, icon: "🎤", title: "Say It Like a Champion", sub: "Say all 7 out loud", es: "¡Dilo!" }
  };
  var LEVELED = ["train", "next", "before", "missing", "listen"];

  /* ---------- navigation ---------- */
  var current = "";
  function go(name, push) {
    speech.stop();
    current = name || "menu";
    if (push !== false) {
      var h = current === "menu" ? location.pathname + location.search : "#" + current;
      try { history.pushState(null, "", h); } catch (e) { /* file:// */ }
    }
    render();
    window.scrollTo(0, 0);
    var f = app.querySelector("h1, h2"); if (f) { f.setAttribute("tabindex", "-1"); f.focus({ preventScroll: true }); }
  }
  function fromHash() { var h = location.hash.replace("#", ""); return Object.prototype.hasOwnProperty.call(SCREENS, h) ? h : "menu"; }
  window.addEventListener("popstate", function () { go(fromHash(), false); });

  function render() { app.textContent = ""; (SCREENS[current] || menu)(); }
  function backBar(label) {
    return el("div", { class: "qbar" }, [btn("ghost-btn", "← Train", function () { go("menu"); }, { "aria-label": "Back to the activity train" }), el("span", { class: "qtitle", text: label }), el("span")]);
  }

  /* ---------- menu ---------- */
  function menu() {
    var c = store.get(), firstTodo = null;
    Object.keys(ACT).forEach(function (k) { if (!firstTodo && !c.acts[k]) { firstTodo = k; } });
    app.appendChild(el("header", { class: "hero" }, [
      mascot(),
      el("div", { class: "bubble" }, [
        el("h1", null, ["Spanish Days ", el("span", { class: "nowrap", text: "of the Week" })]),
        el("p", { lang: "es", class: "hola" }, ["¡Hola! Let's learn ", el("i", { text: "los días de la semana" }), "!"]),
        el("div", { class: "hero-tools" }, [weekChant()])
      ])
    ]));
    app.appendChild(soundNote());
    app.appendChild(el("a", { class: "quick-card", href: "#quick", onclick: function (e) { e.preventDefault(); go("quick"); } }, [
      el("span", { class: "qc-icon", "aria-hidden": "true", text: "☀️" }),
      el("span", { class: "qc-text" }, [el("b", { text: "Monday Morning Quick Review" }), el("span", { text: "3 short steps · about 4 minutes" })]),
      el("span", { class: "qc-go", "aria-hidden": "true", text: "▶" })
    ]));
    var train = el("ol", { class: "act-train", "aria-label": "Seven activities" });
    Object.keys(ACT).forEach(function (k) {
      var a = ACT[k], done = c.acts[k] > 0;
      train.appendChild(el("li", null, [el("a", { class: "act-car" + (done ? " done" : "") + (k === firstTodo ? " todo" : ""), href: "#" + k, style: ui.dayStyle(a.n - 1),
        onclick: function (e) { e.preventDefault(); go(k); } }, [
        el("span", { class: "act-n", text: String(a.n) }),
        el("span", { class: "act-icon", "aria-hidden": "true", text: a.icon }),
        el("b", { text: a.title }),
        el("span", { class: "act-sub", text: a.sub }),
        done ? el("span", { class: "act-star", text: "⭐ Done" }) : k === firstTodo ? el("span", { class: "act-star go", text: "Start here!" }) : null
      ])]));
    });
    app.appendChild(el("h2", { class: "sec", text: "Your activity train" }));
    app.appendChild(train);
    app.appendChild(el("a", { class: "challenge-card", href: "#challenge", onclick: function (e) { e.preventDefault(); go("challenge"); } }, [
      el("span", { class: "qc-icon", "aria-hidden": "true", text: "🏆" }),
      el("span", { class: "qc-text" }, [el("b", { text: "Spanish Days Challenge" }), el("span", { text: c.best.challenge ? "Practice test · best " + c.best.challenge + "% first try" : "Practice test · 12 questions + say the week" })]),
      el("span", { class: "qc-go", "aria-hidden": "true", text: "▶" })
    ]));
    var tricky = trickyKeys();
    var foot = el("div", { class: "menu-foot" });
    if (tricky.length) { foot.appendChild(btn("big-btn alt", "🔁 Practice my tricky days", function () { practiceTricky(); })); }
    foot.appendChild(el("a", { class: "big-btn alt", href: "#parent", onclick: function (e) { e.preventDefault(); go("parent"); } }, ["👪 Grown-ups: progress & tips"]));
    foot.appendChild(readToggle());
    app.appendChild(foot);
  }
  function mascot() {
    return el("div", { class: "mascot", "aria-hidden": "true" }, [svg('<svg viewBox="0 0 170 130" focusable="false"><circle cx="38" cy="16" r="9" fill="#e9eef7"/><circle cx="52" cy="8" r="6" fill="#e9eef7"/><rect x="28" y="24" width="20" height="26" rx="5" fill="#2c3e73"/><rect x="18" y="46" width="96" height="50" rx="16" fill="#ff6b5b"/><rect x="104" y="26" width="52" height="70" rx="12" fill="#ffb627"/><rect x="114" y="36" width="32" height="24" rx="6" fill="#d9f0ff"/><circle cx="52" cy="66" r="6" fill="#18264b"/><circle cx="78" cy="66" r="6" fill="#18264b"/><circle cx="54" cy="64" r="2" fill="#fff"/><circle cx="80" cy="64" r="2" fill="#fff"/><path d="M54 80 q11 10 22 0" stroke="#18264b" stroke-width="4" fill="none" stroke-linecap="round"/><circle cx="40" cy="78" r="5" fill="#ffb3c1"/><circle cx="92" cy="78" r="5" fill="#ffb3c1"/><circle cx="40" cy="104" r="14" fill="#18264b"/><circle cx="40" cy="104" r="5" fill="#ffd166"/><circle cx="88" cy="104" r="14" fill="#18264b"/><circle cx="88" cy="104" r="5" fill="#ffd166"/><circle cx="134" cy="104" r="14" fill="#18264b"/><circle cx="134" cy="104" r="5" fill="#ffd166"/><path d="M6 96 l14 0 l-6 -14 z" fill="#2c3e73"/></svg>')]);
  }
  function svg(markup) { var t = document.createElement("template"); t.innerHTML = markup; return t.content.firstChild; }
  function weekChant() {
    var b = btn("chip-btn", "▶ Hear the whole week", function () { speech.sayList(D.DAYS.map(function (d) { return d.es; }), { gap: 250 }); });
    b.hidden = !speech.canSpeak();
    speech.onChange(function () { b.hidden = !speech.canSpeak(); });
    return b;
  }
  function readToggle() {
    var b = btn("tiny-btn", "", function () { SD.prefs.toggle(); draw(); }, { "aria-pressed": "true" });
    function draw() {
      var on = SD.prefs.read();
      b.textContent = speech.canSpeak() ? (on ? "🔊 Read questions to me: ON" : "🔇 Read questions to me: OFF") : "🔇 Spanish voice not available";
      b.setAttribute("aria-pressed", on ? "true" : "false");
      b.disabled = !speech.canSpeak();
    }
    draw(); speech.onChange(function () { if (b.isConnected) { draw(); } });
    return b;
  }
  function soundNote() {
    var box = el("div", { class: "sound-note", role: "status" });
    function draw() {
      var s = speech.state();
      box.textContent = "";
      box.hidden = s === "ready" || s === "loading";
      if (s === "none") { box.appendChild(el("p", null, ["🔇 This device has no Spanish voice, so the game shows sound-it-out spellings (like ", el("b", { text: "LOO-nehs" }), ") instead of audio. A grown-up can read the words aloud. Tips for adding a voice are on the grown-ups page."])); }
      if (s === "maybe") { box.appendChild(el("p", { text: "🔊 Sound uses this device's own voice. If the words don't sound Spanish, use the sound-it-out spellings on each card." })); }
    }
    draw(); speech.onChange(function () { if (box.isConnected) { draw(); } });
    return box;
  }
  function trickyKeys() {
    var s = store.get().stats;
    return Object.keys(s).filter(function (k) { return k.indexOf("day:") !== 0 && s[k].miss > 0 && s[k].miss + s[k].hint * 0.5 >= s[k].first * 0.5; });
  }
  function practiceTricky() {
    current = "tricky"; /* not a static screen: a late voice event must not redraw over the round */
    var keys = trickyKeys().sort(function (a, b) { return store.weightOf(b) - store.weightOf(a); }).slice(0, 8);
    var items = keys.map(function (k) {
      var p = k.split(":"), i = D.idxOf(p[1]);
      if (p[0] === "missing") { return D.missingQ(Math.random, { start: D.before(i), len: 3, blankAt: 1, n: 3 }); }
      return D.relQ(Math.random, p[0], i, { n: 3 });
    });
    runRound("tricky", "Tricky days", D.shuffle(Math.random, items), null);
  }

  /* ---------- 1. Meet the Days ---------- */
  var spot = -1;
  function meet() {
    app.appendChild(backBar("Meet the Days"));
    if (spot >= 0) { spotlight(spot); return; }
    app.appendChild(el("h2", { class: "screen-title", text: "👋 Meet the seven days!" }));
    app.appendChild(el("p", { class: "lead", text: "Tap a day to hear it and learn its move." }));
    var grid = el("ol", { class: "meet-grid" });
    var seen = store.get().meetSeen;
    D.DAYS.forEach(function (d, i) {
      grid.appendChild(el("li", null, [btn("meet-card" + (seen.indexOf(d.es) >= 0 ? " seen" : ""), [
        el("span", { class: "m-num", text: "día " + (i + 1) }),
        el("span", { class: "m-em", "aria-hidden": "true", text: d.emoji }),
        el("span", { class: "m-es", lang: "es", text: d.es }),
        el("span", { class: "m-en", text: d.en })
      ], function () { speech.say(d.es); spot = i; render(); }, { style: ui.dayStyle(i), "data-day": d.es, "aria-label": "Day " + (i + 1) + ": " + d.es + ", " + d.en })]));
    });
    app.appendChild(grid);
    if (speech.canSpeak()) {
      var row = el("div", { class: "btn-row" });
      function chant(slow) {
        speech.sayList(D.DAYS.map(function (d) { return d.es; }), { slow: slow, gap: slow ? 500 : 300,
          onItem: function (k) { grid.querySelectorAll(".meet-card").forEach(function (c, j) { c.classList.toggle("sing", j === k); }); },
          onend: function () { grid.querySelectorAll(".meet-card").forEach(function (c) { c.classList.remove("sing"); }); } });
      }
      row.appendChild(btn("big-btn", "▶ Sing the whole week", function () { chant(false); }));
      row.appendChild(btn("big-btn alt", "🐢 Slow", function () { chant(true); }));
      app.appendChild(row);
    } else {
      app.appendChild(el("p", { class: "lead", text: "Grown-up: read the days aloud in order, then have your child repeat them." }));
    }
    app.appendChild(el("p", { class: "tip", text: "👏 Clap each part: lu·nes (2 claps), miér·co·les (3 claps)!" }));
  }
  function spotlight(i) {
    var d = D.DAYS[i], n = store.meetSeen(d.es);
    if (n >= 7 && !store.get().acts.meet) { store.finishActivity("meet"); }
    var claps = el("span", { class: "claps", "aria-label": d.syl.length + " claps" }, d.syl.map(function () { return el("span", { "aria-hidden": "true", text: "👏" }); }));
    var yourTurn = el("p", { class: "your-turn", role: "status", "aria-live": "polite" });
    var card = el("section", { class: "spot", style: ui.dayStyle(i) }, [
      el("p", { class: "m-num", text: "día " + (i + 1) + " de 7" }),
      el("p", { class: "spot-em", "aria-hidden": "true", text: d.emoji }),
      el("h2", { class: "spot-es", lang: "es", text: d.es }),
      el("p", { class: "spot-en", text: d.en }),
      el("p", { class: "spot-syl" }, [ui.syllables(i), " ", claps]),
      el("p", { class: "say-it", text: "Sounds like: " + d.say }),
      ui.soundButtons(d.es, null, { big: true }),
      speech.canSpeak() ? btn("big-btn", "🗣️ Say it with me", function () {
        yourTurn.textContent = "Listen…";
        speech.say(d.es, { slow: true, onend: function () { yourTurn.textContent = "Your turn! Say: " + d.es + " 🎉"; } });
      }) : el("p", { class: "your-turn", text: "Say it out loud: " + d.say }),
      yourTurn,
      el("div", { class: "hook" }, [el("p", { text: "💡 " + d.hook }), el("p", { text: "🙆 Move: " + d.move })])
    ]);
    var nav = el("div", { class: "spot-nav" }, [
      btn("big-btn alt", ["← antes: ", el("b", { lang: "es", text: D.DAYS[D.before(i)].es })], function () { spot = D.before(i); speech.say(D.DAYS[spot].es); render(); }),
      btn("big-btn alt", ["después: ", el("b", { lang: "es", text: D.DAYS[D.after(i)].es }), " →"], function () { spot = D.after(i); speech.say(D.DAYS[spot].es); render(); })
    ]);
    app.appendChild(card);
    app.appendChild(nav);
    app.appendChild(el("p", { class: "lead small" }, [n >= 7 ? "⭐ You met all seven days!" : "You've met " + n + " of 7 days."]));
    app.appendChild(btn("big-btn alt wide", "▦ See all seven days", function () { spot = -1; render(); }));
  }

  /* ---------- level picker shared by train / next / before / missing / listen ---------- */
  function levelPick(act, start) {
    var a = ACT[act], rec = store.level(act);
    app.appendChild(backBar(a.title));
    app.appendChild(el("h2", { class: "screen-title", text: a.icon + " " + a.title }));
    app.appendChild(el("p", { class: "lead", lang: "es", text: a.es }));
    var row = el("div", { class: "levels" });
    [1, 2, 3].forEach(function (lv) {
      row.appendChild(btn("level" + (lv === rec ? " rec" : ""), [
        el("span", { class: "lv-n", text: "Level " + lv }), el("b", { lang: "es", text: D.LEVELS[lv].name }), el("span", { text: D.LEVELS[lv].en }),
        lv === rec ? el("span", { class: "act-star go", text: "⭐ Try this one" }) : null
      ], function () { start(lv); }));
    });
    app.appendChild(row);
  }

  function runRound(act, title, items, lv) {
    quiz.run({ app: app, title: title, act: act, items: items, test: false, onExit: function () { go("menu"); },
      onDone: function (sum) {
        var r = quiz.rate(sum), up = false;
        if (ACT[act]) { store.finishActivity(act, sum); }
        if (lv && r >= 0.85 && lv < 3 && store.level(act) <= lv) { store.setLevel(act, lv + 1); up = true; }
        quiz.results({ app: app, sum: sum, menu: function () { go("menu"); },
          again: function () { if (ACT[act]) { go(act); } else { practiceTricky(); } },
          practiceMisses: function (items2) { runRound("tricky", "Tricky ones", items2, null); } });
        if (up) { app.querySelector(".results").insertBefore(el("p", { class: "level-up", text: "🔓 Level " + (lv + 1) + " unlocked for next time!" }), app.querySelector(".res-facts")); }
      } });
  }

  /* ---------- 2. Days Train ---------- */
  function trainScreen() {
    levelPick("train", function (lv) {
      app.textContent = "";
      app.appendChild(backBar("Days Train · Level " + lv));
      var start = lv === 3 ? 1 + Math.floor(Math.random() * 6) : 0;
      app.appendChild(el("h2", { class: "screen-title", text: lv === 3 ? "🚂 Start at " + D.DAYS[start].es + " and keep going!" : "🚂 Put the week in order!" }));
      app.appendChild(el("p", { class: "lead", text: lv === 1 ? "Tap the words. The faint words show where they go." : lv === 2 ? "No helpers this time. Start with lunes!" : "The week is a circle: after domingo comes lunes." }));
      var done = el("div", { class: "btn-row", hidden: true });
      app.appendChild(ui.orderBoard({ start: start, pre: lv === 3, hints: lv === 1 ? "ghost" : "none", test: lv > 1,
        onPlace: function (ok, slotDay, after) { if (ok && !after) { /* counted below */ } },
        onDone: function (r) {
          store.finishActivity("train", { first: r.first, total: r.slots });
          if (r.first === r.slots && lv < 3 && store.level("train") <= lv) { store.setLevel("train", lv + 1); }
          done.hidden = false;
          done.insertBefore(el("p", { class: "fb ok", text: (r.first === r.slots ? "🏆 Perfect train! " : "🚂 All aboard! ") + r.first + " of " + r.slots + " cars right the first time." }), done.firstChild);
          ui.confetti(app);
          var f = done.querySelector("button"); if (f) { f.focus(); }
        } }));
      done.appendChild(btn("big-btn", "▶ Again", function () { go("train"); }));
      done.appendChild(btn("big-btn alt", "🚂 Back to the train", function () { go("menu"); }));
      app.appendChild(done);
    });
  }

  /* ---------- 3-6. question games ---------- */
  function relScreen(dir) {
    return function () {
      levelPick(dir === "after" ? "next" : "before", function (lv) {
        var act = dir === "after" ? "next" : "before";
        runRound(act, ACT[act].title + " · Level " + lv, D.relRound(Math.random, dir, lv, store.weightOf), lv);
      });
    };
  }
  function missingScreen() { levelPick("missing", function (lv) { runRound("missing", "Missing Day · Level " + lv, D.missingRound(Math.random, lv), lv); }); }
  function listenScreen() {
    levelPick("listen", function (lv) { runRound("listen", "Listen & Find · Level " + lv, D.listenRound(Math.random, lv, speech.canSpeak()), lv); });
    if (!speech.canSpeak()) { app.appendChild(el("p", { class: "tip", text: "🔇 No Spanish voice on this device, so this game uses English ↔ Spanish questions instead of listening ones." })); }
  }

  /* ---------- 7. Say It Like a Champion (grown-up checks; no microphone) ---------- */
  function sayScreen() {
    app.appendChild(backBar("Say It Like a Champion"));
    app.appendChild(el("h2", { class: "screen-title", text: "🎤 Say It Like a Champion!" }));
    var stepper = el("ol", { class: "steps" }, [
      el("li", null, [el("b", { text: "Listen " }), "to the whole week."]),
      el("li", null, [el("b", { text: "Echo: " }), "say each day after me."]),
      el("li", null, [el("b", { text: "Champion: " }), "say all 7 with no list!"])
    ]);
    app.appendChild(stepper);
    var s = ui.strip({});
    app.appendChild(s);
    var chips = s.querySelectorAll(".chip");
    function hl(k) { chips.forEach(function (c, j) { c.classList.toggle("sing", j === k); }); }
    if (speech.canSpeak()) {
      var row = el("div", { class: "btn-row" }, [
        btn("big-btn", "1 ▶ Listen", function () { speech.sayList(D.DAYS.map(function (d) { return d.es; }), { gap: 300, onItem: hl, onend: function () { hl(-1); } }); }),
        btn("big-btn", "2 🗣️ Echo", function () { speech.sayList(D.DAYS.map(function (d) { return d.es; }), { slow: true, gap: 1900, onItem: hl, onend: function () { hl(-1); } }); })
      ]);
      app.appendChild(row);
    } else {
      app.appendChild(el("p", { class: "lead", text: "Grown-up: say each day, and your child says it back." }));
    }
    app.appendChild(btn("big-btn champion", "3 🏆 Champion time!", function () {
      app.textContent = ""; app.appendChild(backBar("Champion time"));
      oralCheck("say", function () { go("menu"); });
    }));
  }

  /* Hidden cards; a grown-up taps each day the child says correctly, in order. Peeking is allowed and counted. */
  function oralCheck(where, done, opts) {
    opts = opts || {};
    var said = 0, helped = 0, pos = 0, marks = [];
    app.appendChild(el("h2", { class: "screen-title", text: "🏆 Say all seven days in order!" }));
    app.appendChild(el("p", { class: "lead", text: "No peeking at a list. Start with lunes!" }));
    app.appendChild(el("p", { class: "grown", text: "👪 Grown-up: listen, and tap each card when the day is said right and in order. Stuck? Tap 👀 Peek. No microphone and nothing is recorded." }));
    var cards = el("ol", { class: "oral" });
    var cardEls = D.DAYS.map(function (d, i) {
      var b = btn("oral-card", [el("span", { class: "num", text: String(i + 1) }), el("span", { class: "w", text: "?" })], function () { if (i === pos) { mark("said"); } }, { "aria-label": "Day " + (i + 1) + ": tap when said correctly" });
      cards.appendChild(el("li", null, [b]));
      return b;
    });
    var tools = el("div", { class: "btn-row" });
    var peek = btn("big-btn alt", "👀 Peek", function () { mark("helped"); });
    var undo = btn("big-btn alt", "↩ Undo", function () { unmark(); }, { disabled: true });
    tools.appendChild(peek); tools.appendChild(undo);
    var finishRow = el("div", { class: "btn-row", hidden: true }, [
      btn("big-btn", "✓ A grown-up listened", function () { save("grown-up"); }),
      btn("big-btn alt", "I checked myself", function () { save("self"); })
    ]);
    var status = el("p", { class: "fb", role: "status", "aria-live": "polite" });
    app.appendChild(cards); app.appendChild(status); app.appendChild(tools); app.appendChild(finishRow);
    if (opts.skip) { app.appendChild(btn("tiny-btn", "No grown-up here right now? Skip this step", function () { done(null); })); }
    focusNow();
    function focusNow() { cardEls.forEach(function (c, j) { c.classList.toggle("now", j === pos); }); }
    function mark(kind) {
      if (pos >= 7) { return; }
      var c = cardEls[pos], d = D.DAYS[pos];
      c.classList.add(kind === "said" ? "said" : "peek"); c.setAttribute("style", kind === "said" ? "--day-bg:" + d.bg + ";--day-ink:" + d.ink : "");
      c.querySelector(".w").textContent = (kind === "said" ? "✓ " : "👀 ") + d.es;
      c.setAttribute("aria-label", "Day " + (pos + 1) + ": " + d.es + (kind === "said" ? ", said" : ", peeked"));
      if (kind === "said") { said++; } else { helped++; speech.say(d.es); }
      marks.push(kind); pos++; undo.disabled = false; focusNow();
      if (pos >= 7) { tools.querySelector("button").disabled = true; finishRow.hidden = false; status.className = "fb ok"; status.textContent = said === 7 ? "🏆 ¡Campeón! All seven, no peeking!" : "Great job! " + said + " of 7 on your own."; ui.confetti(app); finishRow.querySelector("button").focus(); }
    }
    function unmark() {
      if (!marks.length) { return; }
      var kind = marks.pop(); pos--;
      if (kind === "said") { said--; } else { helped--; }
      var c = cardEls[pos]; c.className = "oral-card"; c.removeAttribute("style"); c.querySelector(".w").textContent = "?";
      finishRow.hidden = true; tools.querySelector("button").disabled = false; status.textContent = ""; undo.disabled = !marks.length; focusNow();
    }
    function save(by) {
      var r = { said: said, helped: helped, by: by, where: where };
      store.addOral(r);
      if (where === "say") { store.finishActivity("say"); }
      done(r);
    }
  }

  /* ---------- Challenge ---------- */
  function challengeScreen() {
    app.appendChild(backBar("Spanish Days Challenge"));
    app.appendChild(el("section", { class: "qcard intro" }, [
      el("p", { class: "big-emoji", "aria-hidden": "true", text: "🏆" }),
      el("h2", { text: "Spanish Days Challenge" }),
      el("p", { class: "lead", text: "12 questions in Spanish, then say the whole week. No hints this time. Just do your best!" }),
      el("p", { class: "tip", text: "If you miss one, we'll show the answer and keep going. Only your first try counts for the score." }),
      btn("big-btn", "▶ Start the Challenge", function () {
        quiz.run({ app: app, title: "Challenge", act: "challenge", items: D.challenge(Math.random), test: true, onExit: function () { go("menu"); },
          after: function (sum, next) { app.textContent = ""; app.appendChild(backBar("Challenge · last step")); oralCheck("challenge", function (r) { sum.oral = r; next(); }, { skip: true }); },
          onDone: function (sum) {
            var total = sum.total + 1, first = sum.first + sum.orderFirst / Math.max(1, sum.orderSlots);
            store.finishActivity("challenge", { first: first, total: total, fixed: sum.fixed, hint: 0 });
            quiz.results({ app: app, sum: sum, menu: function () { go("menu"); }, again: function () { go("challenge"); },
              practiceMisses: function (items) { runRound("tricky", "Tricky ones", items, null); } });
            var res = app.querySelector(".res-facts");
            res.appendChild(el("li", null, [sum.oral ? el("b", { text: sum.oral.said + " of 7" }) : el("b", { text: "Skipped" }), sum.oral ? " days said in order (" + (sum.oral.by === "grown-up" ? "checked by a grown-up" : "self-checked") + ")" : ": say-the-week step"]));
          } });
      })
    ]));
  }

  /* ---------- Monday Morning Quick Review ---------- */
  function quickScreen() {
    app.appendChild(backBar("Quick Review"));
    app.appendChild(el("section", { class: "qcard intro sunny" }, [
      el("p", { class: "big-emoji", "aria-hidden": "true", text: "☀️" }),
      el("h2", { lang: "es", text: "¡Buenos días!" }),
      el("p", { class: "lead", text: "Three quick steps: 1 train, 6 questions, then say the week." }),
      btn("big-btn", "▶ Let's go!", quickTrain)
    ]));
  }
  function quickTrain() {
    app.textContent = "";
    app.appendChild(backBar("Quick Review · step 1 of 3"));
    app.appendChild(el("h2", { class: "screen-title", text: "🚂 Warm-up: put the week in order" }));
    var nextRow = el("div", { class: "btn-row", hidden: true }, [btn("big-btn", "Next: 6 questions →", quickQs)]);
    var warm = { first: 0, slots: 7 };
    app.appendChild(ui.orderBoard({ start: 0, hints: "none", test: true, onDone: function (r) { warm = r; nextRow.hidden = false; nextRow.querySelector("button").focus(); } }));
    app.appendChild(nextRow);
    function quickQs() {
      quiz.run({ app: app, title: "Quick Review · step 2 of 3", act: "quick", items: D.quickReview(Math.random, store.weightOf), test: true, onExit: function () { go("menu"); },
        after: function (sum, next) { app.textContent = ""; app.appendChild(backBar("Quick Review · step 3 of 3")); oralCheck("quick", function (r) { sum.oral = r; next(); }, { skip: true }); },
        onDone: function (sum) { quickDone(sum, warm); } });
    }
  }
  function quickDone(sum, warm) {
    store.finishActivity("quick", { first: sum.first, total: sum.total, fixed: sum.fixed });
    app.textContent = "";
    var kids = [
      el("p", { class: "big-emoji", "aria-hidden": "true", text: "🌟" }),
      el("h2", { lang: "es", text: "¡Estás listo! You're ready to do your best!" }),
      el("ul", { class: "res-facts" }, [
        el("li", null, [el("b", { text: warm.first + " of " + warm.slots }), " train cars right the first time"]),
        el("li", null, [el("b", { text: sum.first + " of " + sum.total }), " before/after questions right the first time"]),
        el("li", null, [sum.oral ? el("b", { text: sum.oral.said + " of 7" }) : el("b", { text: "—" }), sum.oral ? " days said out loud in order" : " say-the-week step skipped"])
      ]),
      el("p", { class: "lead", lang: "es", text: "lunes · martes · miércoles · jueves · viernes · sábado · domingo" }),
      el("p", { class: "tip", text: "Remember: después = after ➡️   antes = before ⬅️" }),
      el("div", { class: "btn-row" }, [btn("big-btn", "🚂 Back to the train", function () { go("menu"); })])
    ];
    app.appendChild(el("section", { class: "qcard results" }, kids));
    ui.confetti(app.querySelector(".results"));
    app.querySelector(".results button").focus();
  }

  var SCREENS = { menu: menu, meet: meet, train: trainScreen, next: relScreen("after"), before: relScreen("before"), missing: missingScreen,
    listen: listenScreen, say: sayScreen, challenge: challengeScreen, quick: quickScreen,
    parent: function () { if (SD.parent) { SD.parent(app, backBar, go); } } };
  SD.go = go;

  /* Voices often arrive a moment after load (Chrome). Redraw the static screens once so
     sound buttons appear; quiz rounds in progress are left alone. */
  speech.onChange(function (s) {
    if ((s === "ready" || s === "maybe") && (current === "menu" || current === "meet" || current === "say") && !app.querySelector(".oral")) { render(); }
  });

  current = fromHash();
  render();
})();

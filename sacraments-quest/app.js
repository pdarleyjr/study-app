/* Religion Quest: Sacraments — rendering. Content lives in data.js. */
(function () {
  "use strict";
  var QK = window.QuestKit, D = window.SacramentsData, h = QK && QK.h;
  var main = document.getElementById("main");
  if (!QK || !D) return; // the loading panel (with a link home) stays

  var st = QK.store(D.storeKey);
  var PHASES = [
    { id: "homework", label: "Check My Homework", minutes: 5 },
    { id: "review", label: "Review", minutes: 7 },
    { id: "quiz", label: "Quiz", minutes: 10 },
    { id: "missed", label: "Review Missed", minutes: 3 }
  ];
  var current = "homework";
  var active = null; // current timer

  function phaseDone(id) { var p = (st.get().phases || {}); return !!p[id]; }
  function markDone(id) { st.update(function (d) { d.phases = d.phases || {}; d.phases[id] = Date.now(); return d; }); }
  function lastQuiz() { var q = (st.get().quiz || {}).quiz; return q && q.last ? q : null; }
  function vocabById(id) { return D.vocab.filter(function (v) { return v.id === id; })[0]; }

  /* ---------- original SVG art ---------- */
  var ART = {
    dove: '<svg viewBox="0 0 120 90" aria-hidden="true"><path fill="#fff" d="M18 52c14-2 22-10 30-20 6-8 16-14 28-10-6 2-8 6-8 10 12-4 22-2 30 6-10 0-16 4-20 8 4 14-8 30-26 30-16 0-26-8-34-24zM76 22c4-8 14-12 22-8-6 0-10 2-12 6z"/><circle cx="84" cy="28" r="2.5" fill="#5a1230"/><path fill="#ffd9a0" d="M96 28l10 3-10 3z"/></svg>',
    water: '<svg viewBox="0 0 40 40" aria-hidden="true"><path fill="#2f8de4" d="M20 3C12 14 7 20 7 26a13 13 0 0026 0c0-6-5-12-13-23z"/><path fill="#fff" opacity=".55" d="M14 25a6 6 0 004 6" stroke="#fff" stroke-width="2" fill="none"/></svg>',
    flame: '<svg viewBox="0 0 40 40" aria-hidden="true"><path fill="#e8421f" d="M20 3c2 8 11 12 11 22a11 11 0 01-22 0c0-5 3-8 5-11 1 3 2 4 4 4-1-5 0-10 2-15z"/><path fill="#ffd23f" d="M20 20c1 4 5 6 5 11a5 5 0 01-10 0c0-3 3-5 5-11z"/></svg>',
    chalice: '<svg viewBox="0 0 40 40" aria-hidden="true"><path fill="#d89800" d="M8 5h24c0 10-4 15-12 16-8-1-12-6-12-16z"/><rect x="18" y="20" width="4" height="9" fill="#a86f00"/><path fill="#d89800" d="M10 35c0-4 5-6 10-6s10 2 10 6z"/></svg>'
  };
  function svg(name) { var s = h("span", { "aria-hidden": "true" }); s.innerHTML = ART[name]; return s.firstChild; }

  /* ---------- shell ---------- */
  function render() {
    if (active) { active.stop(); active = null; }
    main.innerHTML = "";
    var hero = h("section", { class: "qk-hero" },
      h("span", { class: "qk-eyebrow" }, "Unit 1 Review • pages 45–47"),
      h("h1", null, "Religion Quest: Sacraments"),
      h("p", null, "Check your homework, review the Sacraments of Initiation, then show what you know. About 25 minutes."));
    var art = h("div", { class: "sq-hero-art", "aria-hidden": "true" }); art.innerHTML = ART.dove; hero.appendChild(art);
    main.appendChild(h("div", { class: "qk-top" }, h("a", { class: "qk-back", href: "../fifth-grade/" }, "← 5th grade")));
    main.appendChild(hero);
    var phases = PHASES.map(function (p) { return { id: p.id, label: p.label, minutes: p.minutes, done: phaseDone(p.id) }; });
    main.appendChild(QK.phaseBar(phases, current, function (id) { current = id; render(); }));
    var box = h("div", { id: "phase-box" });
    main.appendChild(box);
    ({ homework: homework, review: review, quiz: quiz, missed: missed })[current](box);
    main.appendChild(h("p", { class: "qk-footer" }, "Study Quest • Religion • no sound, works offline"));
  }
  function go(id) { current = id; render(); window.scrollTo(0, 0); var hd = main.querySelector("#phase-box h2"); if (hd) hd.focus(); }
  function timerRow(min) { var t = QK.timer(min, { label: min + " minute timer" }); active = t; return h("div", { class: "sq-timer-row" }, t.el); }

  /* ---------- 1. Check My Homework ---------- */
  function homework(box) {
    var panel = h("section", { class: "qk-panel", "aria-labelledby": "hw-h" },
      h("h2", { id: "hw-h", tabindex: "-1" }, "1 · Check My Homework"),
      h("div", { class: "qk-callout" }, "Compare your answers letter by letter with the red answers. Fix any that are different. Then say the meaning of each word out loud."),
      h("ol", { class: "sq-steps-list" },
        h("li", null, "Tap a page to open it. Pinch or use + to zoom."),
        h("li", null, "Look at each red word next to yours."),
        h("li", null, "Fix any letters that differ, then explain the word to yourself.")),
      timerRow(5),
      h("div", { class: "sq-homework-tiles", id: "hw-tiles" },
        QK.imageCard({ src: D.images.p46, alt: "Page 46, About the Sacraments acrostic, completed with red answers", title: "Page 46 — About the Sacraments", caption: "Acrostic: S-A-C-R-A-M-E-N-T-S" }),
        QK.imageCard({ src: D.images.p47, alt: "Page 47, Sacraments in Review crossword, completed with red answers", title: "Page 47 — Sacraments in Review crossword", caption: "Across and Down clues" })));
    var checks = [["c46", "Page 46 checked"], ["c47a", "Page 47 Across checked"], ["c47d", "Page 47 Down checked"]];
    var saved = st.get().checks || {};
    var ul = h("ul", { class: "sq-checks" });
    var done = h("button", { type: "button", class: "qk-btn qk-btn-primary", onclick: function () { markDone("homework"); go("review"); } }, "Done checking →");
    checks.forEach(function (c) {
      var cb = h("input", { type: "checkbox", id: c[0] }); cb.checked = !!saved[c[0]];
      cb.addEventListener("change", function () { st.update(function (d) { d.checks = d.checks || {}; d.checks[c[0]] = cb.checked; return d; }); });
      ul.appendChild(h("li", null, h("label", { for: c[0] }, cb, c[1])));
    });
    panel.appendChild(h("h3", null, "My checklist"));
    panel.appendChild(ul);
    panel.appendChild(h("div", { class: "qk-row" }, done));
    box.appendChild(panel);
    box.appendChild(h("section", { class: "qk-panel sq-small-card", "aria-label": "Optional reading" },
      h("h3", null, "Read again (optional)"),
      QK.imageCard({ src: D.images.p45, alt: "Page 45, Unit 1 Review, Looking Back at Unit 1", title: "Read again: page 45 Unit 1 Review", caption: "Looking Back at Unit 1" })));
  }

  /* ---------- 2. Review ---------- */
  function review(box) {
    box.appendChild(timerRow(7));
    var sacs = h("section", { class: "qk-panel", "aria-labelledby": "rv-a" }, h("h2", { id: "rv-a", tabindex: "-1" }, "2 · Review"),
      h("h3", null, "The three Sacraments of Initiation"),
      h("p", null, "They enable us to work with Christ for the salvation of the whole world."));
    var grid = h("div", { class: "sq-sacs" });
    D.initiation.forEach(function (s) {
      grid.appendChild(h("article", { class: "sq-sac" }, h("h3", null, svg(s.icon), s.name),
        h("ul", null, s.facts.map(function (f) { return h("li", null, f); }))));
    });
    sacs.appendChild(grid);
    box.appendChild(sacs);

    var vp = h("section", { class: "qk-panel", "aria-labelledby": "rv-b" }, h("h3", { id: "rv-b" }, "Word cards — tap to reveal the meaning"));
    var vg = h("div", { class: "sq-vocab" });
    D.vocab.forEach(function (v, i) {
      var defId = "def-" + v.id;
      var def = h("span", { class: "sq-def", id: defId, hidden: true }, v.def);
      var b = h("button", { type: "button", class: "qk-reveal", "aria-expanded": "false", "aria-controls": defId }, h("strong", null, v.term), def);
      b.addEventListener("click", function () {
        var open = b.getAttribute("aria-expanded") === "true";
        b.setAttribute("aria-expanded", open ? "false" : "true"); def.hidden = open;
      });
      vg.appendChild(b);
    });
    vp.appendChild(vg); box.appendChild(vp);

    box.appendChild(sortGame());
    box.appendChild(h("div", { class: "qk-row" }, h("button", { type: "button", class: "qk-btn qk-btn-primary", onclick: function () { markDone("review"); go("quiz"); } }, "On to the quiz →")));
  }

  function sortGame() {
    var order = QK.shuffle(D.sortClues), i = 0, right = 0;
    var panel = h("section", { class: "qk-panel", "aria-labelledby": "rv-c" }, h("h3", { id: "rv-c" }, "Quick sort: which sacrament?"));
    var body = h("div");
    panel.appendChild(body);
    function show() {
      body.innerHTML = "";
      if (i >= order.length) {
        body.appendChild(h("p", { class: "qk-callout", role: "status" }, "Sorted! " + right + " of " + order.length + " on the first tap."));
        body.appendChild(h("button", { type: "button", class: "qk-btn qk-btn-ghost", onclick: function () { order = QK.shuffle(D.sortClues); i = 0; right = 0; show(); } }, "Play again"));
        return;
      }
      var c = order[i], answered = false;
      body.appendChild(h("p", { class: "sq-sort-score" }, "Clue " + (i + 1) + " of " + order.length));
      body.appendChild(h("div", { class: "sq-sort-clue" }, c.clue));
      var fb = h("div", { class: "qk-feedback", role: "status", "aria-live": "polite" });
      var next = h("button", { type: "button", class: "qk-btn qk-btn-primary", hidden: true, onclick: function () { i++; show(); } }, "Next clue →");
      var btns = h("div", { class: "sq-sort-btns" });
      D.initiation.forEach(function (s) {
        var b = h("button", { type: "button", class: "qk-btn qk-btn-ghost" }, s.name);
        b.addEventListener("click", function () {
          if (b.disabled) return;
          var ok = s.id === c.answer;
          if (ok) {
            if (!answered) right++;
            Array.prototype.forEach.call(btns.children, function (x) { x.disabled = true; });
            b.classList.add("is-answer");
            fb.className = "qk-feedback is-right"; fb.textContent = "✅ Yes! " + c.why;
            next.hidden = false; next.focus();
          } else {
            answered = true; b.disabled = true;
            fb.className = "qk-feedback is-wrong"; fb.textContent = "💡 Not that one — try another sacrament.";
          }
        });
        btns.appendChild(b);
      });
      body.appendChild(btns); body.appendChild(fb); body.appendChild(next);
    }
    show();
    return panel;
  }

  /* ---------- 3. Quiz ---------- */
  function buildQuiz() {
    return D.quiz.map(function (q) {
      if (q.type !== "mc") return q;
      var idx = QK.shuffle(q.choices.map(function (_, k) { return k; }));
      var copy = Object.assign({}, q);
      copy.choices = idx.map(function (k) { return q.choices[k]; });
      copy.answer = idx.indexOf(q.answer);
      return copy;
    });
  }
  function quiz(box) {
    box.appendChild(h("h2", { class: "qk-sr", tabindex: "-1" }, "3 · Quiz"));
    box.appendChild(timerRow(10));
    var host = h("div", { id: "quiz-host" });
    box.appendChild(host);
    var opts = {
      id: "sacraments-quest", storeKey: D.storeKey, quizName: "quiz", title: "Sacraments Quiz",
      reshuffle: buildQuiz,
      onFinish: function (result, panel) {
        markDone("quiz");
        panel.appendChild(h("div", { class: "qk-row" }, h("button", { type: "button", class: "qk-btn qk-btn-primary", onclick: function () { go("missed"); } }, "Review Missed →")));
      }
    };
    QK.runQuiz(host, buildQuiz(), opts);
  }

  /* ---------- 4. Review Missed ---------- */
  function missed(box) {
    var q = lastQuiz();
    var panel = h("section", { class: "qk-panel", "aria-labelledby": "ms-h" }, h("h2", { id: "ms-h", tabindex: "-1" }, "4 · Review Missed"));
    if (!q) {
      panel.appendChild(h("p", null, "Take the quiz first. Then the words behind any missed questions will show up here."));
      panel.appendChild(h("button", { type: "button", class: "qk-btn qk-btn-primary", onclick: function () { go("quiz"); } }, "Go to the quiz →"));
    } else {
      var l = q.last;
      panel.appendChild(h("p", { class: "qk-big" }, l.pct + "%"));
      panel.appendChild(h("p", null, "First-try score: " + l.firstTry + " of " + l.total + ". Best so far: " + q.best + "%."));
      var ids = [], seen = {};
      l.missed.forEach(function (qid) {
        D.quiz.filter(function (x) { return x.id === qid; }).forEach(function (x) { x.vocab.forEach(function (v) { if (!seen[v]) { seen[v] = 1; ids.push(v); } }); });
      });
      if (!ids.length) panel.appendChild(h("p", { class: "qk-callout" }, "No misses on your last try. Wonderful! 🌟"));
      else {
        panel.appendChild(h("h3", null, "Words to look at again"));
        var ul = h("ul", { class: "sq-missed-list" });
        ids.forEach(function (id) { var v = vocabById(id); if (v) ul.appendChild(h("li", null, h("strong", null, v.term + ": "), v.def)); });
        panel.appendChild(ul);
      }
      markDone("missed");
    }
    panel.appendChild(h("div", { class: "qk-row" },
      h("a", { class: "qk-btn qk-btn-primary", href: "../fifth-grade/" }, "Back to 5th grade"),
      h("button", { type: "button", class: "qk-btn qk-btn-ghost", onclick: function () { go("homework"); } }, "Look at my homework pages again"),
      h("button", { type: "button", class: "qk-btn qk-btn-ghost", onclick: function () { go("quiz"); } }, "Try the quiz again")));
    box.appendChild(panel);
  }

  render();
})();

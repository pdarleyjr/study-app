/* Wild Robot Quest: rendering. Content is in data.js, shared widgets in ../assets/quest-kit.js */
(function () {
  "use strict";
  var QK = window.QuestKit, D = window.WildRobotData;
  var main = document.getElementById("main");
  if (!QK || !D || !main) return; // the "loading" panel with a link home stays
  var h = QK.h, store = QK.store(D.storeKey);

  /* ---------- original little pictures (simple shapes, no book art) ---------- */
  function svg(inner, label) {
    return '<svg viewBox="0 0 80 80" aria-hidden="true" focusable="false">' + inner + "</svg>";
  }
  var robot = '<circle cx="40" cy="46" r="22" fill="#8fb8c9" stroke="#2c5a6e" stroke-width="3"/><line x1="40" y1="24" x2="40" y2="13" stroke="#2c5a6e" stroke-width="3"/><circle cx="40" cy="12" r="4" fill="#ffb354"/><circle cx="32" cy="44" r="4" fill="#18264b"/><circle cx="48" cy="44" r="4" fill="#18264b"/><path d="M31 54q9 7 18 0" fill="none" stroke="#18264b" stroke-width="3" stroke-linecap="round"/>';
  var goose = '<ellipse cx="38" cy="54" rx="22" ry="13" fill="#fff" stroke="#6b7a8c" stroke-width="3"/><path d="M52 50q10-4 8-20" fill="none" stroke="#6b7a8c" stroke-width="9" stroke-linecap="round"/><path d="M52 50q10-4 8-20" fill="none" stroke="#fff" stroke-width="5" stroke-linecap="round"/><circle cx="60" cy="26" r="7" fill="#fff" stroke="#6b7a8c" stroke-width="3"/><path d="M66 25l10 3-10 4z" fill="#f08a24"/><circle cx="62" cy="24" r="1.8" fill="#18264b"/><path d="M26 54q10 6 20 0" fill="none" stroke="#c9d3de" stroke-width="3"/>';
  var heart = '<path d="M40 66C14 48 12 28 26 22c8-3 13 2 14 7 1-5 6-10 14-7 14 6 12 26-14 44z" fill="#ff6b8b" stroke="#b83657" stroke-width="3" stroke-linejoin="round"/>';
  var SCENES = {
    barn: '<rect width="80" height="80" fill="#d9eefb"/><rect x="0" y="62" width="80" height="18" fill="#7fb85a"/><rect x="14" y="32" width="52" height="34" fill="#c4452f" stroke="#7a2418" stroke-width="3"/><path d="M9 34L40 11l31 23z" fill="#8a2d1f" stroke="#7a2418" stroke-width="3" stroke-linejoin="round"/><rect x="31" y="46" width="18" height="20" fill="#fff3d6" stroke="#7a2418" stroke-width="3"/><path d="M31 46l18 20M49 46L31 66" stroke="#7a2418" stroke-width="2"/>',
    robot: '<rect width="80" height="80" fill="#eaf4ef"/>' + robot,
    goose: '<rect width="80" height="80" fill="#e8f3fb"/>' + goose,
    lock: '<rect width="80" height="80" fill="#fff3d6"/><path d="M26 38v-8a14 14 0 0 1 28 0v8" fill="none" stroke="#6b5a2e" stroke-width="6" stroke-linecap="round"/><rect x="18" y="38" width="44" height="32" rx="7" fill="#ffb354" stroke="#8a5a14" stroke-width="3"/><circle cx="40" cy="52" r="5" fill="#8a5a14"/><rect x="38" y="54" width="4" height="9" fill="#8a5a14"/>',
    heart: '<rect width="80" height="80" fill="#fff0f3"/>' + heart,
    family: '<rect width="80" height="80" fill="#eaf4ef"/><g transform="translate(-6 8) scale(.62)">' + robot + '</g><g transform="translate(26 24) scale(.62)">' + goose + '</g><path d="M40 12c-8-6-14 4-6 10l6 5 6-5c8-6 2-16-6-10z" fill="#ff6b8b"/>',
    island: '<rect width="80" height="80" fill="#cfe9f7"/><rect y="54" width="80" height="26" fill="#4fa3d8"/><path d="M6 56q34-24 68 0z" fill="#e9d28a"/><path d="M14 56q26-18 52 0z" fill="#6fb35a"/><rect x="38" y="30" width="4" height="22" fill="#7a5530"/><circle cx="40" cy="27" r="11" fill="#3f8f3a"/><circle cx="12" cy="14" r="6" fill="#ffd23f"/>',
    warning: '<rect width="80" height="80" fill="#fff6e6"/><path d="M40 10L72 66H8z" fill="#ffd23f" stroke="#8a5a14" stroke-width="4" stroke-linejoin="round"/><rect x="37" y="30" width="6" height="20" rx="3" fill="#18264b"/><circle cx="40" cy="58" r="3.6" fill="#18264b"/>',
    question: '<rect width="80" height="80" fill="#efeaff"/><circle cx="40" cy="40" r="28" fill="#fff" stroke="#6452cb" stroke-width="4"/><path d="M29 33c0-14 22-14 22 0 0 9-11 8-11 18" fill="none" stroke="#6452cb" stroke-width="6" stroke-linecap="round"/><circle cx="40" cy="62" r="4" fill="#6452cb"/>',
    map: '<rect width="80" height="80" fill="#fff3d6"/><path d="M10 16l20-6 20 6 20-6v54l-20 6-20-6-20 6z" fill="#f4e3b0" stroke="#8a5a14" stroke-width="3" stroke-linejoin="round"/><path d="M18 56q10-24 22-10t20-26" fill="none" stroke="#c4452f" stroke-width="3" stroke-dasharray="5 5" stroke-linecap="round"/><path d="M56 24l10 10M66 24L56 34" stroke="#c4452f" stroke-width="4" stroke-linecap="round"/>',
    geese: '<rect width="80" height="80" fill="#cfe5fb"/><path d="M8 24q8-8 14 0q6-8 14 0M30 42q8-8 14 0q6-8 14 0M44 18q7-7 12 0q5-7 12 0" fill="none" stroke="#18264b" stroke-width="3.5" stroke-linecap="round"/><path d="M40 52v22m-9-9l9 10 9-10" fill="none" stroke="#2f7d32" stroke-width="5" stroke-linecap="round" stroke-linejoin="round"/>',
    spring: '<rect width="80" height="80" fill="#dff1fb"/><circle cx="62" cy="18" r="9" fill="#ffd23f"/><path d="M0 60q25-22 50-6t30-8v34H0z" fill="#7fc15a"/><g stroke="#2f7d32" stroke-width="3"><path d="M20 72V54M38 74V58M56 72V60"/></g><circle cx="20" cy="51" r="6" fill="#ff6b8b"/><circle cx="38" cy="55" r="6" fill="#fff"/><circle cx="56" cy="57" r="6" fill="#ff9f3f"/><circle cx="20" cy="51" r="2" fill="#ffd23f"/><circle cx="38" cy="55" r="2" fill="#ffd23f"/><circle cx="56" cy="57" r="2" fill="#fff3d6"/>'
  };
  function scene(key) { return svg(SCENES[key] || SCENES.robot); }
  var HERO = '<svg viewBox="0 0 240 150" aria-hidden="true" focusable="false"><g transform="translate(6 12) scale(1.45)">' + robot + '</g><g transform="translate(112 40) scale(1.4)">' + goose + '</g><path d="M178 20c-8-8-18 4-8 12l8 7 8-7c10-8 0-20-8-12z" fill="#ff6b8b"/></svg>';

  /* ---------- saved state ---------- */
  function saved() { var d = store.get(); d.review = d.review || {}; return d; }
  function patchReview(fn) { store.update(function (d) { d.review = d.review || {}; fn(d.review); return d; }); }
  var state = { step: "chapters", beats: 0, opened: {}, vocab: {} };
  (function load() {
    var r = saved().review;
    state.beats = Math.min(D.beats.length, Math.max(0, +r.beats || 0));
  })();

  function stepsDone() {
    var r = saved().review, q = ((saved().quiz || {}).quiz) || {};
    var done = {};
    (r.steps || []).forEach(function (s) { done[s] = true; });
    if (q.attempts) done.quiz = true;
    return done;
  }
  function markStep(id) { patchReview(function (r) { r.steps = r.steps || []; if (r.steps.indexOf(id) < 0) r.steps.push(id); }); }
  function reviewDone() { return !!saved().review.done; }

  /* ---------- page frame ---------- */
  function go(id, focusHeading) {
    state.step = id;
    render();
    if (focusHeading !== false) {
      var t = document.getElementById("wr-step-title");
      if (t) { t.focus({ preventScroll: true }); t.scrollIntoView({ block: "start", behavior: QK.reducedMotion() ? "auto" : "smooth" }); }
    }
  }
  function nextBtn(label, target, mark) {
    return h("button", { type: "button", class: "qk-btn qk-btn-primary", onclick: function () { if (mark) markStep(mark); go(target); } }, label);
  }
  function stepTitle(text) { return h("h2", { id: "wr-step-title", tabindex: "-1" }, text); }

  function render() {
    main.innerHTML = "";
    var done = stepsDone();
    main.appendChild(h("div", { class: "qk-top" }, h("a", { class: "qk-back", href: "../fifth-grade/" }, "← 5th grade")));
    var q = (saved().quiz || {}).quiz;
    var hero = h("header", { class: "qk-hero wr-hero" },
      h("span", { class: "qk-eyebrow" }, "Reading • ~" + D.totalMinutes() + " minutes"),
      h("h1", null, D.title),
      h("p", null, "Review Chapters 38–39 of The Wild Robot Escapes, then take a 6-question quiz. You don't need to read the pages first."),
      h("div", { class: "wr-mins" },
        reviewDone() ? h("span", { class: "qk-pill" }, "✓ Review done") : null,
        q && q.attempts ? h("span", { class: "qk-pill" }, "✓ Quiz best: " + q.best + "%") : null),
      h("div", { class: "wr-hero-art", html: HERO }));
    main.appendChild(hero);
    var phases = D.steps.map(function (s) { return { id: s.id, label: s.label, minutes: s.minutes, done: !!done[s.id] }; });
    main.appendChild(QK.phaseBar(phases, state.step, function (id) { go(id); }));
    var body = h("div", { class: "wr-body-wrap" });
    main.appendChild(body);
    ({ chapters: viewChapters, timeline: viewTimeline, ideas: viewIdeas, remember: viewRemember, quiz: viewQuiz })[state.step](body);
    main.appendChild(h("p", { class: "qk-footer" }, "Study Quest • " + D.book + " • " + D.covers));
  }

  /* ---------- 1. chapter cards ---------- */
  function viewChapters(body) {
    var p = h("section", { class: "qk-panel" }, stepTitle("Two chapters, two big moments"));
    var grid = h("div", { class: "qk-grid2" });
    D.chapters.forEach(function (c) {
      grid.appendChild(h("article", { class: "qk-panel wr-chapter" },
        h("h3", null, "Chapter " + c.num + " — " + c.title),
        h("span", { class: "wr-hook" }, c.hook),
        h("p", null, c.summary)));
    });
    p.appendChild(grid);
    p.appendChild(h("div", { class: "wr-nav" }, nextBtn("See the story timeline →", "timeline", "chapters")));
    body.appendChild(p);
  }

  /* ---------- 2. tap-through timeline ---------- */
  function viewTimeline(body) {
    var total = D.beats.length;
    var p = h("section", { class: "qk-panel" }, stepTitle("What happens, step by step"));
    var prog = h("div", { class: "wr-prog" }), list = h("ol", { class: "wr-beats", "aria-label": "Story beats so far" });
    var btnWrap = h("div", { class: "wr-nav" });
    function beatEl(b, i, animate) {
      var li = h("li", { class: "wr-beat is-ch" + b.ch, tabindex: "-1" },
        h("div", { html: scene(b.scene) }),
        h("div", null, h("small", null, "Chapter " + b.ch + " • part " + b.n + " of " + (b.ch === 38 ? 5 : 8)), h("p", null, b.text)));
      if (!animate) li.style.animation = "none";
      return li;
    }
    function paintProgress() {
      prog.innerHTML = "";
      prog.appendChild(h("span", null, state.beats + " of " + total + " seen"));
      prog.appendChild(h("div", { class: "qk-bar", role: "progressbar", "aria-valuemin": "0", "aria-valuemax": String(total), "aria-valuenow": String(state.beats), "aria-label": "Story beats seen" },
        h("span", { style: "width:" + Math.round(state.beats / total * 100) + "%" })));
    }
    function paintButton() {
      btnWrap.innerHTML = "";
      if (state.beats < total) {
        var b = h("button", { type: "button", class: "qk-btn qk-btn-primary", onclick: reveal }, state.beats === 0 ? "Start the story ▶" : "What happens next? ▶");
        btnWrap.appendChild(b);
      } else {
        btnWrap.appendChild(nextBtn("On to the big ideas →", "ideas", "timeline"));
      }
    }
    function reveal() {
      var b = D.beats[state.beats], li = beatEl(b, state.beats, true);
      list.appendChild(li);
      state.beats++;
      patchReview(function (r) { r.beats = Math.max(r.beats || 0, state.beats); });
      paintProgress(); paintButton();
      QK.announce("Part " + state.beats + " of " + total + ": " + b.text);
      li.scrollIntoView({ block: "nearest", behavior: QK.reducedMotion() ? "auto" : "smooth" });
      var nb = btnWrap.querySelector("button"); if (nb) nb.focus({ preventScroll: true });
    }
    for (var i = 0; i < state.beats; i++) list.appendChild(beatEl(D.beats[i], i, false));
    p.appendChild(prog); p.appendChild(list); p.appendChild(btnWrap);
    paintProgress(); paintButton();
    body.appendChild(p);
  }

  /* ---------- 3. big ideas + vocabulary ---------- */
  function revealCard(item, cls, store_, key, titleHtml, bodyText) {
    var detail = h("span", { class: cls, hidden: !store_[key] }, bodyText);
    var btn = h("button", { type: "button", class: "qk-reveal", "aria-expanded": store_[key] ? "true" : "false" },
      h("span", null, titleHtml), detail);
    btn.addEventListener("click", function () {
      var open = btn.getAttribute("aria-expanded") !== "true";
      btn.setAttribute("aria-expanded", open ? "true" : "false");
      detail.hidden = !open; store_[key] = open;
    });
    return btn;
  }
  function viewIdeas(body) {
    var p = h("section", { class: "qk-panel" }, stepTitle("Big ideas"));
    p.appendChild(h("p", { class: "qk-hint" }, "Tap each card to open it."));
    var grid = h("div", { class: "wr-ideas" });
    D.ideas.forEach(function (it) { grid.appendChild(revealCard(it, "wr-body", state.opened, it.id, it.icon + " " + it.label, it.text)); });
    p.appendChild(grid);
    p.appendChild(h("h3", { style: "margin-top:18px" }, "4 words to know"));
    var vg = h("div", { class: "wr-vocab" });
    D.vocab.forEach(function (v) { vg.appendChild(revealCard(v, "wr-def", state.vocab, v.word, v.word, v.def)); });
    p.appendChild(vg);
    p.appendChild(h("div", { class: "wr-nav" }, nextBtn("Remember this! →", "remember", "ideas")));
    body.appendChild(p);
  }

  /* ---------- 4. remember ---------- */
  function hooksBlock() {
    var w = h("div", { class: "wr-hooks" });
    D.remember.hooks.forEach(function (t) { w.appendChild(h("div", null, t)); });
    return w;
  }
  function viewRemember(body) {
    var p = h("section", { class: "qk-panel" }, stepTitle("Remember this!"));
    p.appendChild(hooksBlock());
    p.appendChild(h("div", { class: "qk-callout wr-takeaway" }, "⭐ Biggest takeaway: " + D.remember.takeaway));
    p.appendChild(h("div", { class: "wr-nav" }, h("button", { type: "button", class: "qk-btn qk-btn-primary wr-bigbtn", onclick: function () {
      patchReview(function (r) { r.done = true; r.at = Date.now(); r.steps = r.steps || []; ["chapters", "timeline", "ideas", "remember"].forEach(function (s) { if (r.steps.indexOf(s) < 0) r.steps.push(s); }); });
      go("quiz");
    } }, "Take the 6-question quiz →")));
    body.appendChild(p);
  }

  /* ---------- 5. quiz ---------- */
  function viewQuiz(body) {
    var p = h("section", { class: "qk-panel" }, stepTitle("Quick quiz: 6 questions"));
    var box = h("div", { class: "wr-quiz" });
    p.appendChild(box); body.appendChild(p);
    QK.runQuiz(box, D.quiz.questions, {
      id: D.quiz.id, storeKey: D.storeKey, quizName: D.quiz.quizName, title: D.quiz.title,
      onFinish: function (result, panel) {
        panel.appendChild(h("h3", { style: "margin-top:14px" }, "Remember the hooks"));
        panel.appendChild(hooksBlock());
        panel.appendChild(h("div", { class: "qk-row" }, h("a", { class: "qk-btn qk-btn-primary", href: "../fifth-grade/", style: "text-decoration:none" }, "Back to 5th grade")));
      }
    });
  }

  render();
})();

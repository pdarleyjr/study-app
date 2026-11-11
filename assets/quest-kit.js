/* Quest Kit: small shared toolkit for the newer Study Quest guides
   (Fractions Quick Review, Sacraments Quest, Matter Lab, Wild Robot Quest, Today's Plan).
   Plain browser JavaScript, no dependencies. Load after assets/app.js:
     <link rel="stylesheet" href="../assets/quest-kit.css">
     <script defer src="../assets/app.js"></script>
     <script defer src="../assets/quest-kit.js"></script>
   Everything lives on window.QuestKit. See docs/new-guides-contract.md. */
(function (root) {
  "use strict";

  /* ---------- storage: namespaced, versioned, never throws ---------- */
  function store(key) {
    // key is the full localStorage key, for example "studyquest:fractions-review:v1"
    function get() {
      try { var v = JSON.parse(root.localStorage.getItem(key)); return v && typeof v === "object" ? v : {}; }
      catch (e) { return {}; }
    }
    function set(v) {
      try { root.localStorage.setItem(key, JSON.stringify(v)); return true; }
      catch (e) { return false; } // private mode, storage full or disabled: keep playing
    }
    function update(fn) { var next = fn(Object.assign({}, get())); set(next); return next; }
    return { key: key, get: get, set: set, update: update };
  }

  /* ---------- tiny DOM builder (text is always escaped; use {html:...} for trusted author markup) ---------- */
  function h(tag, attrs) {
    var el = document.createElement(tag);
    attrs = attrs || {};
    Object.keys(attrs).forEach(function (k) {
      var v = attrs[k];
      if (v == null || v === false) return;
      if (k === "class") el.className = v;
      else if (k === "html") el.innerHTML = v;
      else if (k === "text") el.textContent = v;
      else if (k.slice(0, 2) === "on" && typeof v === "function") el.addEventListener(k.slice(2), v);
      else el.setAttribute(k, v === true ? "" : v);
    });
    for (var i = 2; i < arguments.length; i++) append(el, arguments[i]);
    return el;
  }
  function append(el, c) {
    if (c == null || c === false) return;
    if (Array.isArray(c)) { c.forEach(function (x) { append(el, x); }); return; }
    el.appendChild(typeof c === "object" && c.nodeType ? c : document.createTextNode(String(c)));
  }

  /* ---------- fractions as stacked HTML (author content only) ---------- */
  function frac(n, d) {
    return '<span class="qk-frac" role="math" aria-label="' + n + " over " + d + '"><span class="qk-num">' + n +
      '</span><span class="qk-den">' + d + "</span></span>";
  }
  function mixed(w, n, d) {
    return '<span class="qk-mixed" role="math" aria-label="' + w + " and " + n + " over " + d + '">' + w + frac(n, d) + "</span>";
  }

  /* ---------- motion & celebration ---------- */
  function reducedMotion() {
    return !!(root.matchMedia && root.matchMedia("(prefers-reduced-motion: reduce)").matches);
  }
  function celebrate(message) {
    if (message) announce(message);
    if (reducedMotion() || !document.body) return;
    var layer = h("div", { class: "qk-confetti", "aria-hidden": "true" });
    var colors = ["#ffb354", "#6452cb", "#25b07a", "#ff6b8b", "#2f8de4", "#ffd23f"];
    for (var i = 0; i < 36; i++) {
      var p = h("i");
      p.style.left = Math.round(Math.random() * 100) + "%";
      p.style.background = colors[i % colors.length];
      p.style.animationDelay = (Math.random() * 0.35).toFixed(2) + "s";
      p.style.setProperty("--drift", Math.round(Math.random() * 160 - 80) + "px");
      layer.appendChild(p);
    }
    document.body.appendChild(layer);
    setTimeout(function () { layer.remove(); }, 2200);
  }

  /* one polite live region for screen readers */
  var liveEl = null;
  function announce(text) {
    if (!document.body) return;
    if (!liveEl) { liveEl = h("div", { class: "qk-sr", "aria-live": "polite", role: "status" }); document.body.appendChild(liveEl); }
    liveEl.textContent = "";
    setTimeout(function () { liveEl.textContent = text; }, 40);
  }

  /* ---------- gentle optional timer ---------- */
  function timer(minutes, opts) {
    opts = opts || {};
    var total = Math.round(minutes * 60), left = total, id = null, running = false;
    var label = h("span", { class: "qk-timer-time", "aria-live": "off" });
    var btn = h("button", { type: "button", class: "qk-btn qk-btn-ghost qk-timer-btn" });
    var wrap = h("div", { class: "qk-timer", role: "timer", "aria-label": (opts.label || "Study timer") }, h("span", { "aria-hidden": "true" }, "⏱️"), label, btn);
    function fmt(s) { var m = Math.floor(s / 60), r = s % 60; return m + ":" + (r < 10 ? "0" : "") + r; }
    function paint() {
      label.textContent = left > 0 ? fmt(left) + " left" : "Time's up — finish at your own pace";
      btn.textContent = running ? "Pause" : (left === total ? "Start timer" : (left > 0 ? "Resume" : "Restart"));
    }
    function tick() { left = Math.max(0, left - 1); paint(); if (left === 0) { stop(); announce("Timer finished. Great focus! Finish at your own pace."); } }
    function start() { if (left === 0) left = total; running = true; id = setInterval(tick, 1000); paint(); }
    function stop() { running = false; clearInterval(id); id = null; paint(); }
    btn.addEventListener("click", function () { running ? stop() : start(); });
    paint();
    return { el: wrap, start: start, stop: stop };
  }

  /* ---------- image viewer: full-screen, zoom + pan (pinch, drag, wheel, buttons, keyboard) ---------- */
  function openImage(src, alt, title) {
    var opener = document.activeElement;
    var scale = 1, x = 0, y = 0, MIN = 1, MAX = 6;
    var img = h("img", { src: src, alt: alt || "", draggable: "false", class: "qk-viewer-img" });
    var stage = h("div", { class: "qk-viewer-stage" }, img);
    var pct = h("span", { class: "qk-viewer-pct", "aria-live": "polite" }, "100%");
    function btn(label, aria, fn) { return h("button", { type: "button", class: "qk-btn qk-viewer-btn", "aria-label": aria, onclick: fn }, label); }
    var closeBtn = btn("✕ Close", "Close picture and go back", close);
    var bar = h("div", { class: "qk-viewer-bar" },
      h("strong", { class: "qk-viewer-title" }, title || alt || "Picture"),
      h("div", { class: "qk-viewer-tools" },
        btn("−", "Zoom out", function () { zoomBy(1 / 1.5); }),
        pct,
        btn("+", "Zoom in", function () { zoomBy(1.5); }),
        btn("Fit", "Fit whole page on screen", reset),
        closeBtn));
    var hint = h("p", { class: "qk-viewer-hint" }, "Pinch or use + to zoom. Drag to move around.");
    var dlg = h("div", { class: "qk-viewer", role: "dialog", "aria-modal": "true", "aria-label": title || alt || "Picture" }, bar, stage, hint);

    function clamp() {
      var r = stage.getBoundingClientRect(), iw = img.offsetWidth * scale, ih = img.offsetHeight * scale;
      var mx = Math.max(0, (iw - r.width) / 2), my = Math.max(0, (ih - r.height) / 2);
      x = Math.min(mx, Math.max(-mx, x)); y = Math.min(my, Math.max(-my, y));
    }
    function paint() { clamp(); img.style.transform = "translate(" + x + "px," + y + "px) scale(" + scale + ")"; pct.textContent = Math.round(scale * 100) + "%"; }
    function zoomTo(s, cx, cy) {
      var r = stage.getBoundingClientRect();
      var ox = (cx == null ? r.width / 2 : cx - r.left) - r.width / 2, oy = (cy == null ? r.height / 2 : cy - r.top) - r.height / 2;
      var ns = Math.min(MAX, Math.max(MIN, s)), k = ns / scale;
      x = ox - (ox - x) * k; y = oy - (oy - y) * k; scale = ns; paint();
    }
    function zoomBy(f, cx, cy) { zoomTo(scale * f, cx, cy); }
    function reset() { scale = 1; x = 0; y = 0; paint(); }

    var pointers = {}, startDist = 0, startScale = 1, last = null;
    stage.addEventListener("pointerdown", function (e) { stage.setPointerCapture(e.pointerId); pointers[e.pointerId] = e; last = { x: e.clientX, y: e.clientY };
      var ids = Object.keys(pointers); if (ids.length === 2) { startDist = dist(); startScale = scale; } });
    stage.addEventListener("pointermove", function (e) {
      if (!pointers[e.pointerId]) return; pointers[e.pointerId] = e;
      var ids = Object.keys(pointers);
      if (ids.length === 2 && startDist) { var a = pointers[ids[0]], b = pointers[ids[1]]; zoomTo(startScale * dist() / startDist, (a.clientX + b.clientX) / 2, (a.clientY + b.clientY) / 2); }
      else if (ids.length === 1 && last) { x += e.clientX - last.x; y += e.clientY - last.y; last = { x: e.clientX, y: e.clientY }; paint(); }
    });
    function up(e) { delete pointers[e.pointerId]; startDist = 0; var ids = Object.keys(pointers); last = ids.length ? { x: pointers[ids[0]].clientX, y: pointers[ids[0]].clientY } : null; }
    stage.addEventListener("pointerup", up); stage.addEventListener("pointercancel", up);
    function dist() { var ids = Object.keys(pointers), a = pointers[ids[0]], b = pointers[ids[1]]; return Math.hypot(a.clientX - b.clientX, a.clientY - b.clientY) || 1; }
    stage.addEventListener("wheel", function (e) { e.preventDefault(); zoomBy(e.deltaY < 0 ? 1.15 : 1 / 1.15, e.clientX, e.clientY); }, { passive: false });
    stage.addEventListener("dblclick", function (e) { scale > 1.4 ? reset() : zoomTo(2.5, e.clientX, e.clientY); });

    function key(e) {
      if (e.key === "Escape") { e.preventDefault(); close(); }
      else if (e.key === "+" || e.key === "=") zoomBy(1.5);
      else if (e.key === "-" || e.key === "_") zoomBy(1 / 1.5);
      else if (e.key === "0") reset();
      else if (/^Arrow/.test(e.key) && scale > 1) { e.preventDefault(); var d = 60; if (e.key === "ArrowLeft") x += d; if (e.key === "ArrowRight") x -= d; if (e.key === "ArrowUp") y += d; if (e.key === "ArrowDown") y -= d; paint(); }
      else if (e.key === "Tab") { // keep focus inside the dialog
        var f = dlg.querySelectorAll("button"); if (!f.length) return;
        if (e.shiftKey && document.activeElement === f[0]) { e.preventDefault(); f[f.length - 1].focus(); }
        else if (!e.shiftKey && document.activeElement === f[f.length - 1]) { e.preventDefault(); f[0].focus(); }
      }
    }
    function close() {
      document.removeEventListener("keydown", key); root.removeEventListener("resize", paint);
      dlg.remove(); document.documentElement.classList.remove("qk-noscroll");
      if (opener && opener.focus) opener.focus();
    }
    document.addEventListener("keydown", key); root.addEventListener("resize", paint);
    document.documentElement.classList.add("qk-noscroll");
    document.body.appendChild(dlg);
    img.addEventListener("load", paint);
    closeBtn.focus();
    return { close: close };
  }

  /* A tappable thumbnail card that opens the viewer. Returns the element. */
  function imageCard(opts) {
    // opts: { src, alt, title, caption }
    return h("button", { type: "button", class: "qk-imgcard", "aria-label": "Open " + (opts.title || opts.alt) + " full screen", onclick: function () { openImage(opts.src, opts.alt, opts.title); } },
      h("img", { src: opts.src, alt: opts.alt || "", loading: "lazy" }),
      h("span", { class: "qk-imgcard-label" }, h("strong", null, opts.title || ""), opts.caption ? h("span", null, opts.caption) : null, h("span", { class: "qk-imgcard-cta" }, "🔍 Tap to open & zoom")));
  }

  /* ---------- quiz runner ----------
     questions: array of
       { id, type:"mc", prompt|promptHtml, visualHtml?, choices:[text|{html}], answer:index, explain }
       { id, type:"tf", prompt|promptHtml, answer:true|false, explain }
       { id, type:"short", prompt|promptHtml, check:function(str)->bool, placeholder?, inputmode?, answerText, explain }
       { id, type:"match", prompt, pairs:[[left,right],...], explain }
     opts: { id (StudyQuest game id), storeKey, title, onFinish(result), introHtml? }
     Score = correct on FIRST attempt. After the run, missed questions get one "fix it" retry;
     fixes are saved as corrected but never raise the score. */
  function runQuiz(container, questions, opts) {
    opts = opts || {};
    var results = {}; // id -> { first: bool, fixed: bool }
    var order = questions.slice(), i = 0, phase = "main", retryList = [];
    container.innerHTML = "";
    var head = h("div", { class: "qk-quiz-head" });
    var body = h("div", { class: "qk-quiz-body" });
    container.appendChild(head); container.appendChild(body);

    function progress(list, idx, label) {
      head.innerHTML = "";
      var pctDone = Math.round(idx / list.length * 100);
      head.appendChild(h("div", { class: "qk-quiz-progress-label" }, h("strong", null, label), h("span", null, "Question " + (idx + 1) + " of " + list.length)));
      head.appendChild(h("div", { class: "qk-bar", role: "progressbar", "aria-valuemin": "0", "aria-valuemax": "100", "aria-valuenow": String(pctDone), "aria-label": label + " progress" }, h("span", { style: "width:" + pctDone + "%" })));
    }

    function show() {
      var list = phase === "main" ? order : retryList;
      if (i >= list.length) return phase === "main" ? summary() : finish();
      progress(list, i, phase === "main" ? (opts.title || "Quiz") : "Fix-it round");
      renderQuestion(list[i], function (ok) {
        var q = list[i], r = results[q.id] || (results[q.id] = { first: false, fixed: false });
        if (phase === "main") r.first = ok; else r.fixed = ok;
      }, function () { i++; show(); });
    }

    function renderQuestion(q, record, next) {
      body.innerHTML = "";
      var card = h("section", { class: "qk-q", "aria-labelledby": "qk-q-" + q.id });
      var prompt = h("h3", { class: "qk-q-prompt", id: "qk-q-" + q.id, tabindex: "-1" });
      if (q.promptHtml) prompt.innerHTML = q.promptHtml; else prompt.textContent = q.prompt;
      card.appendChild(prompt);
      if (q.visualHtml) card.appendChild(h("div", { class: "qk-q-visual", html: q.visualHtml }));
      var feedback = h("div", { class: "qk-feedback", role: "status", "aria-live": "polite" });
      var nextBtn = h("button", { type: "button", class: "qk-btn qk-btn-primary qk-next", hidden: true }, "Next →");
      nextBtn.addEventListener("click", next);
      var answered = false;
      function done(ok, correctHtml) {
        if (answered) return; answered = true; record(ok);
        feedback.className = "qk-feedback " + (ok ? "is-right" : "is-wrong");
        feedback.innerHTML = "";
        feedback.appendChild(h("strong", null, ok ? pick(["✅ Correct!", "✅ Nice work!", "✅ You got it!"]) : "💡 Not quite — here's the idea:"));
        if (!ok && correctHtml) feedback.appendChild(h("p", { class: "qk-correct", html: "Answer: " + correctHtml }));
        if (q.explain) feedback.appendChild(h("p", { html: q.explain }));
        nextBtn.hidden = false; nextBtn.focus();
        if (ok) announce("Correct");
      }
      var area = h("div", { class: "qk-q-area" });
      card.appendChild(area);
      if (q.type === "mc" || q.type === "tf") {
        var choices = q.type === "tf" ? [{ text: "True" }, { text: "False" }] : q.choices.map(function (c) { return typeof c === "string" ? { text: c } : c; });
        var answerIdx = q.type === "tf" ? (q.answer ? 0 : 1) : q.answer;
        var grid = h("div", { class: "qk-choices" + (q.type === "tf" ? " is-tf" : ""), role: "group", "aria-label": "Answer choices" });
        choices.forEach(function (c, ci) {
          var b = h("button", { type: "button", class: "qk-choice" }, h("span", { class: "qk-choice-letter", "aria-hidden": "true" }, "ABCDEF"[ci]), h("span", c.html ? { class: "qk-choice-text", html: c.html } : { class: "qk-choice-text", text: c.text }));
          b.addEventListener("click", function () {
            if (answered) return;
            var ok = ci === answerIdx;
            Array.prototype.forEach.call(grid.children, function (x, xi) { x.disabled = true; if (xi === answerIdx) x.classList.add("is-answer"); });
            b.classList.add(ok ? "is-right" : "is-wrong");
            b.setAttribute("aria-label", (ok ? "Correct: " : "Your answer, not correct: ") + b.textContent);
            done(ok, ok ? null : (choices[answerIdx].html || escapeHtml(choices[answerIdx].text)));
          });
          grid.appendChild(b);
        });
        area.appendChild(grid);
      } else if (q.type === "short") {
        var input = h("input", { type: "text", class: "qk-input", autocomplete: "off", autocapitalize: "off", spellcheck: "false", inputmode: q.inputmode || "text", placeholder: q.placeholder || "Type your answer", "aria-label": "Your answer" });
        var check = h("button", { type: "submit", class: "qk-btn qk-btn-primary" }, "Check");
        var form = h("form", { class: "qk-short", onsubmit: function (e) { e.preventDefault(); if (answered || !input.value.trim()) { input.focus(); return; } input.readOnly = true; check.disabled = true; var ok = !!q.check(input.value); input.classList.add(ok ? "is-right" : "is-wrong"); done(ok, ok ? null : q.answerText); } }, input, check);
        area.appendChild(form);
        if (q.hint) area.appendChild(h("p", { class: "qk-hint", html: q.hint }));
      } else if (q.type === "match") {
        area.appendChild(matcher(q, function (ok) { done(ok, ok ? null : q.pairs.map(function (p) { return escapeHtml(p[0]) + " → " + escapeHtml(p[1]); }).join("<br>")); }));
      }
      card.appendChild(feedback);
      card.appendChild(nextBtn);
      body.appendChild(card);
      prompt.focus({ preventScroll: true });
      if (container.scrollIntoView && i > 0) container.scrollIntoView({ block: "start", behavior: reducedMotion() ? "auto" : "smooth" });
    }

    /* Save the first-try score as soon as the main round ends (before any fix-it round), so closing the
       page early never loses it. finish() later only adds the "corrected" count; it never changes the score. */
    var saved = false;
    function tally() {
      var total = questions.length;
      var first = questions.filter(function (q) { return results[q.id] && results[q.id].first; }).length;
      var fixed = questions.filter(function (q) { return results[q.id] && !results[q.id].first && results[q.id].fixed; }).length;
      var missedIds = questions.filter(function (q) { return !(results[q.id] && results[q.id].first); }).map(function (q) { return q.id; });
      return { firstTry: first, total: total, pct: Math.round(first / total * 100), corrected: fixed, missed: missedIds, at: Date.now() };
    }
    function persist(result) {
      var name = opts.quizName || "quiz";
      if (opts.storeKey) store(opts.storeKey).update(function (d) {
        d.quiz = d.quiz || {};
        var prev = d.quiz[name] || { best: 0, attempts: 0 };
        d.quiz[name] = { best: Math.max(prev.best || 0, result.pct), attempts: (prev.attempts || 0) + (saved ? 0 : 1), last: result };
        return d;
      });
      if (!saved && opts.id && root.StudyQuest) root.StudyQuest.record(opts.id, result.pct);
      saved = true;
    }

    function summary() {
      var missed = questions.filter(function (q) { return !results[q.id] || !results[q.id].first; });
      persist(tally());
      if (!missed.length) return finish();
      head.innerHTML = ""; body.innerHTML = "";
      var right = questions.length - missed.length;
      body.appendChild(h("section", { class: "qk-panel qk-center" },
        h("p", { class: "qk-big" }, right + " / " + questions.length),
        h("h3", null, "First try score saved!"),
        h("p", null, "You missed " + missed.length + ". Let's fix " + (missed.length === 1 ? "it" : "them") + " now — fixing mistakes is how brains grow. (Your score stays the same, but you'll remember better.)"),
        h("button", { type: "button", class: "qk-btn qk-btn-primary", onclick: function () { phase = "retry"; retryList = missed; i = 0; show(); } }, "Fix my misses →"),
        h("button", { type: "button", class: "qk-btn qk-btn-ghost", onclick: finish }, "Skip and see results")));
      body.querySelector(".qk-btn-primary").focus();
    }

    function finish() {
      var result = tally();
      persist(result);
      var total = result.total, first = result.firstTry, fixed = result.corrected, missedIds = result.missed, pct = result.pct;
      head.innerHTML = ""; body.innerHTML = "";
      var msg = pct >= 90 ? "Outstanding! 🌟" : pct >= 70 ? "Great job! 💪" : "Good effort — practice makes progress! 🌱";
      var panel = h("section", { class: "qk-panel qk-center qk-result" },
        h("p", { class: "qk-big" }, pct + "%"),
        h("h3", { tabindex: "-1" }, msg),
        h("p", null, "First-try score: " + first + " of " + total + (fixed ? " • Fixed afterward: " + fixed : "")));
      if (missedIds.length) {
        var ul = h("ul", { class: "qk-review-list" });
        questions.forEach(function (q) { if (missedIds.indexOf(q.id) >= 0) ul.appendChild(h("li", { html: "<strong>" + (q.promptHtml || escapeHtml(q.prompt)) + "</strong><br>" + (q.explain || "") })); });
        panel.appendChild(h("details", { class: "qk-review" }, h("summary", null, "Review what to remember (" + missedIds.length + ")"), ul));
      }
      var again = h("button", { type: "button", class: "qk-btn qk-btn-ghost", onclick: function () { runQuiz(container, opts.reshuffle ? opts.reshuffle() : questions, opts); } }, "Try the quiz again");
      panel.appendChild(h("div", { class: "qk-row" }, again));
      body.appendChild(panel);
      panel.querySelector("h3").focus();
      if (pct >= 70) celebrate("Quiz complete. " + pct + " percent.");
      else announce("Quiz complete. " + pct + " percent.");
      if (opts.onFinish) opts.onFinish(result, panel);
    }

    show();
    return { results: results };
  }

  /* tap-to-pair matching: tap an item on the left, then its partner on the right */
  function matcher(q, done) {
    var rights = shuffle(q.pairs.map(function (p, idx) { return { text: p[1], idx: idx }; }));
    var chosen = {}; // leftIdx -> rightIdx
    var active = null;
    var wrap = h("div", { class: "qk-match" });
    var L = h("div", { class: "qk-match-col", role: "group", "aria-label": "Items" });
    var R = h("div", { class: "qk-match-col", role: "group", "aria-label": "Matches" });
    var leftBtns = q.pairs.map(function (p, li) {
      var b = h("button", { type: "button", class: "qk-match-item", "aria-pressed": "false" }, h("span", { class: "qk-tag", "aria-hidden": "true" }, String(li + 1)), h("span", null, p[0]));
      b.addEventListener("click", function () { active = li; paint(); });
      L.appendChild(b); return b;
    });
    var rightBtns = rights.map(function (r) {
      var b = h("button", { type: "button", class: "qk-match-item is-right-col" }, h("span", { class: "qk-tag", "aria-hidden": "true" }, "?"), h("span", null, r.text));
      b.addEventListener("click", function () {
        if (active == null) { announce("First tap an item on the left."); return; }
        Object.keys(chosen).forEach(function (k) { if (chosen[k] === r.idx) delete chosen[k]; });
        chosen[active] = r.idx;
        var nextFree = leftBtns.findIndex(function (_, li) { return chosen[li] == null; });
        active = nextFree >= 0 ? nextFree : null; paint();
      });
      R.appendChild(b); return b;
    });
    var check = h("button", { type: "button", class: "qk-btn qk-btn-primary", disabled: true }, "Check matches");
    check.addEventListener("click", function () {
      var ok = q.pairs.every(function (_, li) { return chosen[li] === li; });
      leftBtns.concat(rightBtns).forEach(function (b) { b.disabled = true; });
      leftBtns.forEach(function (b, li) { b.classList.add(chosen[li] === li ? "is-right" : "is-wrong"); });
      check.disabled = true; done(ok);
    });
    function paint() {
      leftBtns.forEach(function (b, li) { b.classList.toggle("is-active", active === li); b.setAttribute("aria-pressed", active === li ? "true" : "false");
        b.setAttribute("aria-label", q.pairs[li][0] + (chosen[li] != null ? ", matched with " + q.pairs[chosen[li]][1] : ", not matched yet")); });
      rightBtns.forEach(function (b, ri) {
        var owner = Object.keys(chosen).filter(function (k) { return chosen[k] === rights[ri].idx; })[0];
        b.querySelector(".qk-tag").textContent = owner != null ? String(+owner + 1) : "?";
        b.classList.toggle("is-paired", owner != null);
        b.setAttribute("aria-label", rights[ri].text + (owner != null ? ", matched with " + q.pairs[owner][0] : ""));
      });
      check.disabled = Object.keys(chosen).length !== q.pairs.length;
    }
    active = 0; paint();
    wrap.appendChild(h("p", { class: "qk-hint" }, "Tap an item on the left, then tap its match on the right. Numbers show your pairs."));
    wrap.appendChild(h("div", { class: "qk-match-grid" }, L, R));
    wrap.appendChild(check);
    return wrap;
  }

  /* ---------- small utils ---------- */
  function shuffle(a) { a = a.slice(); for (var i = a.length - 1; i > 0; i--) { var j = Math.floor(Math.random() * (i + 1)); var t = a[i]; a[i] = a[j]; a[j] = t; } return a; }
  function pick(a) { return a[Math.floor(Math.random() * a.length)]; }
  function escapeHtml(s) { return String(s).replace(/[&<>"']/g, function (c) { return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]; }); }

  /* ---------- phase tabs: a simple "1 Check homework · 2 Review · 3 Quiz" step bar ---------- */
  function phaseBar(phases, current, onPick) {
    // phases: [{ id, label, minutes }]
    var nav = h("nav", { class: "qk-phases", "aria-label": "Steps" });
    phases.forEach(function (p, idx) {
      var b = h("button", { type: "button", class: "qk-phase" + (p.id === current ? " is-current" : "") + (p.done ? " is-done" : ""), "aria-current": p.id === current ? "step" : null, onclick: function () { onPick(p.id); } },
        h("span", { class: "qk-phase-num", "aria-hidden": "true" }, p.done ? "✓" : String(idx + 1)),
        h("span", { class: "qk-phase-label" }, p.label, p.minutes ? h("small", null, p.minutes + " min") : null));
      nav.appendChild(b);
    });
    return nav;
  }

  root.QuestKit = {
    store: store, h: h, frac: frac, mixed: mixed, celebrate: celebrate, announce: announce,
    timer: timer, openImage: openImage, imageCard: imageCard, runQuiz: runQuiz, phaseBar: phaseBar,
    shuffle: shuffle, escapeHtml: escapeHtml, reducedMotion: reducedMotion
  };
})(typeof window !== "undefined" ? window : this);

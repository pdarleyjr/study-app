/* Spanish Days: the question runner used by Next, Before, Missing Day, Listen & Find,
   the Challenge and the Monday Morning Quick Review.
   Practice mode: a wrong tap gets a gentle nudge and the week map, then a second try, then the answer.
   Missed questions come back 2-3 questions later (a same-session re-check, not spaced practice).
   Test mode (Challenge, Quick Review): no hints or week map; one try is scored, then the answer is shown.
   Outcomes are kept apart: first try / used help / fixed after feedback. */
(function () {
  "use strict";
  var SD = window.SD = window.SD || {};
  var D = SD.data, ui = SD.ui, el = ui.el, btn = ui.btn, speech = SD.speech, store = SD.store;

  /* opts: app, title, act, items, test, onDone(summary), onExit(), after (optional extra step before results) */
  function run(opts) {
    var queue = opts.items.map(function (q) { return { q: q, retest: false }; });
    var pos = 0, sum = { first: 0, hint: 0, fixed: 0, total: 0, missed: [], retests: 0, retestsOk: 0, orderFirst: 0, orderSlots: 0, hasOrder: false };
    opts.items.forEach(function (q) { if (q.kind !== "order") { sum.total++; } });

    function frame(kids) {
      var app = opts.app, real = queue.filter(function (x) { return !x.retest; }).length, done = queue.slice(0, pos).filter(function (x) { return !x.retest; }).length;
      app.textContent = "";
      var bar = el("div", { class: "qbar" }, [
        btn("ghost-btn", "✕ Stop", function () { speech.stop(); opts.onExit(); }, { "aria-label": "Stop and go back to the train" }),
        el("span", { class: "qtitle", text: opts.title }),
        el("span", { class: "count", text: Math.min(done + 1, real) + " / " + real })
      ]);
      var prog = el("div", { class: "progress", role: "progressbar", "aria-valuemin": "0", "aria-valuemax": String(real), "aria-valuenow": String(done), "aria-label": "Questions done" }, [
        el("span", { style: { width: Math.round(100 * done / Math.max(1, real)) + "%" } })
      ]);
      var card = el("section", { class: "qcard" + (opts.test ? " test" : "") }, kids);
      app.appendChild(bar); app.appendChild(prog); app.appendChild(card);
      return card;
    }

    function next() {
      if (pos >= queue.length) { finish(); return; }
      var item = queue[pos];
      if (item.q.kind === "order") { showOrder(item.q); } else { showQ(item); }
    }

    function finish() {
      speech.stop();
      if (opts.after) { opts.after(sum, function () { opts.onDone(sum); }); } else { opts.onDone(sum); }
    }

    /* ---------- one multiple-choice / missing-day question ---------- */
    function showQ(item) {
      var q = item.q, wrong = 0, blankWrong = 0, usedHelp = !!q.strip, blank = 0, settled = false, isMissing = q.kind === "missing";
      var practice = !opts.test;
      var fb = el("div", { class: "fb", role: "status", "aria-live": "polite" });
      var helpBox = el("div", { class: "help-box" });
      var choices = el("div", { class: "choices" + (q.choices.length > 4 ? " five" : ""), role: "group", "aria-label": "Answers" });
      var nextBtn = btn("big-btn next", pos + 1 >= queue.length ? "Finish ✓" : "Next →", function () { pos++; next(); speakCurrent(); }, { hidden: true });

      var head = [];
      if (item.retest) { head.push(el("p", { class: "retest-tag", text: "🔁 Let's try this one again" })); }
      var prompt = el("h2", { class: "prompt", lang: "es", text: q.promptEs });
      head.push(el("div", { class: "prompt-row" }, [prompt, q.listen ? null : ui.soundButtons(q.speak, null, { noSlow: true })]));
      if (q.listen) { head.push(el("div", { class: "listen-big" }, [ui.soundButtons(q.speak, q.answerLabel ? D.DAYS[q.answer].say : null, { big: true })])); }
      if (!q.spanishOnly) { head.push(el("p", { class: "prompt-en", text: q.promptEn })); }
      else if (practice) {
        var enHelp = btn("tiny-btn", "🇺🇸 English help", function () { usedHelp = true; enHelp.replaceWith(el("p", { class: "prompt-en", text: q.promptEn })); });
        head.push(enHelp);
      }
      if (isMissing) { head.push(missingRow()); }
      if (q.strip) { helpBox.appendChild(ui.strip({ mark: q.target, dir: q.kind, small: true })); }

      q.choices.forEach(function (c) {
        var pretty = practice && (q.kind !== "es2en");
        var b = btn("choice" + (pretty ? " tinted" : ""), [pretty ? el("span", { class: "em", "aria-hidden": "true", text: D.DAYS[c.idx].emoji }) : null, el("span", { text: c.label })],
          function () { answer(c, b); }, { style: pretty ? ui.dayStyle(c.idx) : null, "data-idx": String(c.idx), lang: q.kind === "es2en" ? "en" : "es" });
        choices.appendChild(b);
      });

      var tools = el("div", { class: "tools" });
      if (practice && !q.strip && (q.kind === "after" || q.kind === "before" || isMissing)) {
        tools.appendChild(btn("tiny-btn", "💡 Pista (hint)", function () { usedHelp = true; showHelp(); this.disabled = true; }));
      }

      frame(head.concat([helpBox, choices, fb, tools, nextBtn]));

      function missingRow() {
        var row = el("ol", { class: "seq", "aria-label": "Days in order with a gap" });
        q.seq.forEach(function (d, k) {
          var b = q.blanks.indexOf(k);
          row.appendChild(el("li", { class: "chip" + (b >= 0 ? " blank" + (b === blank ? " now" : "") : ""), style: q.colors && b < 0 ? ui.dayStyle(d) : null, "data-k": String(k) },
            b >= 0 ? [el("span", { text: "?" })] : [el("span", { text: D.DAYS[d].es })]));
          if (k < q.seq.length - 1) { row.appendChild(el("li", { class: "arrow", "aria-hidden": "true", text: "→" })); }
        });
        return row;
      }
      function fillBlank(k) {
        var li = opts.app.querySelector('.seq [data-k="' + q.blanks[k] + '"]');
        if (!li) { return; }
        li.className = "chip filled";
        li.textContent = D.DAYS[q.answers[k]].es;
        var nx = opts.app.querySelector('.seq [data-k="' + q.blanks[k + 1] + '"]');
        if (nx) { nx.classList.add("now"); }
      }
      function showHelp() {
        helpBox.textContent = "";
        if (isMissing) { helpBox.appendChild(ui.strip({ small: true })); return; }
        helpBox.appendChild(ui.strip({ mark: q.target, dir: q.kind, small: true }));
        helpBox.appendChild(el("p", { class: "help-tip", text: "Find " + D.DAYS[q.target].es + ". Then go one step " + (q.kind === "after" ? "→ forward." : "← back.") }));
      }
      function want() { return isMissing ? q.answers[blank] : q.answer; }
      function wantLabel() { return q.kind === "es2en" ? D.DAYS[q.answer].en : D.DAYS[want()].es; }

      function answer(c, b) {
        if (settled) { return; }
        if (c.idx === want()) {
          b.classList.add("right");
          if (isMissing && blank < q.answers.length - 1) {
            fillBlank(blank); blank++; blankWrong = 0;
            b.disabled = true;
            choices.querySelectorAll(".choice").forEach(function (x) { x.classList.remove("show"); if (!x.classList.contains("right")) { x.disabled = false; x.classList.remove("nope"); } });
            fb.className = "fb ok"; fb.textContent = ui.praise() + " Now the next gap.";
            speech.say(D.DAYS[c.idx].es);
            return;
          }
          if (isMissing) { fillBlank(blank); }
          settle(wrong ? "fixed" : usedHelp ? "hint" : "first");
          return;
        }
        wrong++; blankWrong++;
        b.classList.add("nope"); b.disabled = true;
        b.classList.remove("shake"); void b.offsetWidth; b.classList.add("shake");
        if (practice && blankWrong === 1) {
          fb.className = "fb try";
          fb.textContent = ui.casi() + " Try again." + (q.kind === "after" || q.kind === "before" ? " Use the week map." : "");
          if (!isMissing && (q.kind === "after" || q.kind === "before")) { showHelp(); }
          else if (isMissing) { showHelp(); }
          else { fb.textContent = ui.casi() + " Try again. Think of the picture: " + D.DAYS[want()].emoji; }
          return;
        }
        reveal();
      }
      function reveal() {
        var right = choices.querySelector('[data-idx="' + want() + '"]');
        if (right) { right.classList.add("show"); right.disabled = false; }
        fb.className = "fb try";
        fb.textContent = "It's " + wantLabel() + ". Tap " + wantLabel() + ".";
        speech.say(D.DAYS[want()].es);
        choices.querySelectorAll(".choice").forEach(function (x) { if (x !== right) { x.disabled = true; } });
      }
      function settle(outcome) {
        settled = true;
        store.mark(q.key, outcome);
        if (item.retest) { sum.retests++; if (outcome !== "fixed") { sum.retestsOk++; } }
        else {
          sum[outcome]++;
          if (outcome !== "first") { sum.missed.push(q); }
        }
        if (practice && outcome !== "first" && !item.retest) {
          var at = Math.min(queue.length, pos + 3);
          queue.splice(at, 0, { q: D.remake(Math.random, q), retest: true });
        }
        choices.querySelectorAll(".choice").forEach(function (x) { x.disabled = true; });
        fb.className = "fb ok";
        fb.textContent = "";
        fb.appendChild(el("strong", { text: (outcome === "first" ? ui.praise() : "¡Eso es! That's it!") + " " }));
        fb.appendChild(el("span", { text: explain() }));
        speech.say(q.kind === "es2en" ? D.DAYS[q.answer].es : D.DAYS[q.answer].es + (q.kind === "missing" && q.answers.length > 1 ? ", " + D.DAYS[q.answers[1]].es : ""));
        if (outcome === "first") { ui.confetti(opts.app.querySelector(".qcard")); }
        nextBtn.hidden = false;
        nextBtn.textContent = pos + 1 >= queue.length ? "Finish ✓" : "Next →";
        nextBtn.focus({ preventScroll: false });
      }
      function explain() {
        var t = D.DAYS[q.target], a = D.DAYS[q.answer];
        if (q.kind === "after") { return "Después del " + t.es + " viene " + a.es + "."; }
        if (q.kind === "before") { return "Antes del " + t.es + " viene " + a.es + "."; }
        if (q.kind === "missing") { return q.seq.map(function (d) { return D.DAYS[d].es; }).join(" → "); }
        if (q.kind === "es2en") { return t.es + " = " + t.en + "."; }
        return t.en + " = " + t.es + ".";
      }
    }

    /* ---------- put the week in order (Challenge) ---------- */
    function showOrder(q) {
      var nextBtn = btn("big-btn next", "Finish ✓", function () { pos++; next(); }, { hidden: true });
      var board = ui.orderBoard({ start: q.start, hints: "none", test: true, onDone: function (r) {
        sum.hasOrder = true; sum.orderFirst = r.first; sum.orderSlots = r.slots;
        nextBtn.hidden = false; nextBtn.textContent = pos + 1 >= queue.length ? "Finish ✓" : "Next →"; nextBtn.focus();
      } });
      frame([el("div", { class: "prompt-row" }, [el("h2", { class: "prompt", lang: "es", text: q.promptEs }), ui.soundButtons(q.speak, null, { noSlow: true })]),
        opts.test ? null : el("p", { class: "prompt-en", text: q.promptEn }), board, nextBtn]);
    }

    function speakCurrent() {
      var item = queue[pos];
      if (!item || !SD.prefs || !SD.prefs.read()) { return; }
      if (item.q.listen) { speech.say(item.q.speak); return; }
      speech.say(item.q.speak);
    }

    next();
    speakCurrent();
  }

  /* Share right on the first try (order board counts as one question with partial credit). */
  function rate(sum) {
    var total = sum.total + (sum.hasOrder ? 1 : 0);
    var got = sum.first + (sum.hasOrder ? sum.orderFirst / Math.max(1, sum.orderSlots) : 0);
    return total ? got / total : 0;
  }

  /* opts: app, title, sum, act, again(), menu(), practiceMisses(items) */
  function results(opts) {
    var sum = opts.sum, r = rate(sum), app = opts.app;
    app.textContent = "";
    var kids = [
      el("p", { class: "big-emoji", "aria-hidden": "true", text: r >= 0.9 ? "🏆" : r >= 0.6 ? "🌟" : "💪" }),
      el("h2", { class: "res-title", text: r >= 0.9 ? "¡Campeón! Super job!" : r >= 0.6 ? "¡Muy bien! You are learning fast!" : "Good practice! Every try helps your brain." }),
      ui.stars(r)
    ];
    var facts = el("ul", { class: "res-facts" }, [
      el("li", null, [el("b", { text: String(sum.first) }), " of " + sum.total + " right on the first try"]),
      sum.hint ? el("li", null, [el("b", { text: String(sum.hint) }), " right with a little help (hint or English)"]) : null,
      sum.fixed ? el("li", null, [el("b", { text: String(sum.fixed) }), " fixed after a second look"]) : null,
      sum.hasOrder ? el("li", null, [el("b", { text: sum.orderFirst + " of " + sum.orderSlots }), " train cars placed right the first time"]) : null,
      sum.retests ? el("li", null, [el("b", { text: sum.retestsOk + " of " + sum.retests }), " tricky ones right when they came back"]) : null
    ]);
    kids.push(facts);
    if (sum.missed.length) {
      var list = el("ul", { class: "tricky" });
      sum.missed.forEach(function (q) { list.appendChild(el("li", { lang: "es" }, [trickyLine(q), ui.soundButtons(D.DAYS[q.answer].es, D.DAYS[q.answer].say, { noSlow: true })])); });
      kids.push(el("h3", { text: "Tricky ones to practice" }), list);
    }
    var row = el("div", { class: "btn-row" });
    if (sum.missed.length && opts.practiceMisses) { row.appendChild(btn("big-btn", "🔁 Practice the tricky ones", function () { opts.practiceMisses(sum.missed.map(function (q) { return D.remake(Math.random, q); })); })); }
    if (opts.again) { row.appendChild(btn("big-btn alt", "▶ Play again", opts.again)); }
    row.appendChild(btn("big-btn alt", "🚂 Back to the train", opts.menu));
    kids.push(row);
    app.appendChild(el("section", { class: "qcard results" }, kids));
    if (r >= 0.6) { ui.confetti(app.querySelector(".results")); }
    var f = row.querySelector("button"); if (f) { f.focus({ preventScroll: true }); }
  }
  function trickyLine(q) {
    var t = D.DAYS[q.target], a = D.DAYS[q.answer];
    if (q.kind === "after") { return el("span", { text: "después del " + t.es + " → " + a.es }); }
    if (q.kind === "before") { return el("span", { text: "antes del " + t.es + " → " + a.es }); }
    if (q.kind === "missing") { return el("span", { text: q.seq.map(function (d) { return D.DAYS[d].es; }).join(" → ") }); }
    return el("span", { text: t.en + " = " + t.es });
  }

  SD.quiz = { run: run, results: results, rate: rate };
})();

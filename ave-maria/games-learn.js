/* Ave María Quest: learning games (meet, learn parts, disappearing words, bedtime, morning).
   Exposes G.meet / G.learn / G.vanish / G.bedtime / G.morning on window.AM_GAMES.
   Each game: function (mount, ctx, opts) { ...; return { destroy } }. Renders only inside mount.
   Methods: meaning first, chunking + cumulative build-up, listen/echo/say, word-order building,
   retrieval with fading cues (disappearing words), sleep consolidation. Class prefix: aml-. */
var G = window.AM_GAMES = window.AM_GAMES || {};
(function () {
  "use strict";
  var QK = window.QuestKit, h = QK.h;

  /* ---------- small helpers ---------- */
  function shuffle(a, r) {
    a = a.slice(); r = r || Math.random;
    for (var i = a.length - 1; i > 0; i--) { var j = Math.floor(r() * (i + 1)); var t = a[i]; a[i] = a[j]; a[j] = t; }
    return a;
  }
  function lineWords(D, id) { return D.WORDS.filter(function (w) { return w.line === id; }); }
  function punctOf(w) { return w.token.slice(w.word.length); }
  function btn(label, fn, cls, attrs) {
    var a = { type: "button", class: "qk-btn " + (cls || "qk-btn-ghost") + " aml-btn", onclick: fn };
    if (attrs) Object.keys(attrs).forEach(function (k) { a[k] = attrs[k]; });
    return h("button", a, label);
  }
  function blankText(w, cue) {
    var n = Math.max(w.word.length, 3), s;
    if (cue === "letter") { s = w.word.charAt(0) + new Array(Math.min(n - 1, 7) + 1).join("_"); return s + punctOf(w); }
    return new Array(Math.min(n, 8) + 1).join("_");
  }
  function blankLabel(w, cue) {
    return cue === "letter" ? "Hidden word starting with " + w.word.charAt(0) : "Hidden word, " + w.word.length + " letters";
  }

  /* ---------- per-game environment ---------- */
  function Env(mount, ctx, cls) {
    var e = { ctx: ctx, D: ctx.D || window.AveMariaData, timers: [], points: 0, dead: false };
    mount.textContent = "";
    e.root = h("div", { class: "aml " + cls + (ctx.reduced ? " aml-reduced" : "") });
    e.stage = h("div", { class: "aml-stage" });
    e.fbEl = h("p", { class: "aml-fb", role: "status", "aria-live": "polite" });
    e.root.appendChild(e.stage); e.root.appendChild(e.fbEl);
    mount.appendChild(e.root);
    e.later = function (fn, ms) {
      var id = setTimeout(function () { if (!e.dead) fn(); }, ms); e.timers.push(id); return id;
    };
    e.fb = function (text, kind) { e.fbEl.className = "aml-fb" + (kind ? " aml-fb-" + kind : ""); e.fbEl.textContent = text || ""; };
    e.word = function (i, kind) {
      try { if (ctx.word) ctx.word(i, kind); } catch (x) { /* shell problem must not stop the game */ }
      e.points += kind === "right" ? 10 : kind === "hint" ? 4 : 0;
    };
    e.award = function (n, label) {
      try { if (ctx.award) ctx.award(n, label); } catch (x) { /* ignore */ }
      e.points += n;
    };
    e.strength = function (i) { try { return ctx.strength ? ctx.strength(i) : "new"; } catch (x) { return "new"; } };
    e.canSpeak = function () { try { return !!(ctx.speech && ctx.speech.canSpeak && ctx.speech.canSpeak()); } catch (x) { return false; } };
    e.say = function (t, slow) { if (e.canSpeak()) { try { ctx.speech.say(t, { slow: !!slow }); } catch (x) { /* ignore */ } } };
    e.save = function (name, v) { try { if (ctx.save) ctx.save(name, v); } catch (x) { /* ignore */ } };
    e.load = function (name) { try { return ctx.load ? ctx.load(name) : null; } catch (x) { return null; } };
    e.celebrate = function (msg) { if (!ctx.reduced) QK.celebrate(msg); else if (msg) QK.announce ? QK.announce(msg) : null; };
    e.focusHead = function () { var t = e.stage.querySelector("[data-aml-head]"); if (t) { try { t.focus({ preventScroll: false }); } catch (x) { t.focus(); } } };
    e.destroy = function () {
      e.dead = true; e.timers.forEach(clearTimeout); e.timers = [];
      try { if (ctx.speech && ctx.speech.stop) ctx.speech.stop(); } catch (x) { /* ignore */ }
      if (e.root.parentNode) e.root.parentNode.removeChild(e.root);
    };
    return e;
  }

  function head(text) { return h("h2", { class: "aml-h", tabindex: "-1", "data-aml-head": "1" }, text); }
  function listenRow(e, text) {
    if (!e.canSpeak()) return null;
    return h("div", { class: "aml-listen" },
      btn("🔊 Listen", function () { e.say(text, false); }, "qk-btn-ghost", { "aria-label": "Listen" }),
      btn("🐢 Slow", function () { e.say(text, true); }, "qk-btn-ghost", { "aria-label": "Listen slowly" }));
  }
  function stepper(labels, cur) {
    return h("ol", { class: "aml-stepper", "aria-label": "Steps" }, labels.map(function (t, k) {
      return h("li", { class: "aml-step" + (k < cur ? " is-done" : k === cur ? " is-cur" : ""), "aria-current": k === cur ? "step" : null },
        h("span", { class: "aml-stepn", "aria-hidden": "true" }, k < cur ? "✓" : String(k + 1)),
        h("span", { class: "aml-stept" }, t, k < cur ? h("span", { class: "qk-sr" }, " (done)") : null));
    }));
  }
  function dots(n, cur, label) {
    var d = h("div", { class: "aml-dots", role: "img", "aria-label": label });
    for (var k = 0; k < n; k++) d.appendChild(h("span", { class: "aml-dot" + (k < cur ? " is-done" : k === cur ? " is-cur" : "") }));
    return d;
  }
  function lineBlock(e, l) {
    return h("div", { class: "aml-lineblock" },
      h("p", { class: "aml-latin", lang: "la" }, l.text),
      h("p", { class: "aml-pron" }, l.pron),
      h("p", { class: "aml-en" }, l.en));
  }

  /* ---------- recall round: hidden words, peek, check me ----------
     o.lineIds, o.hidden (array of 31 booleans), o.cue ("none"|"letter"), o.scored (word indexes recorded; default = hidden),
     o.sayText, o.checkLabel, o.onDone({wrong, right, total, peeked}) */
  function recallRound(e, parent, o) {
    var D = e.D, lines = o.lineIds.map(D.lineById), cue = o.cue || "none";
    var scored = {}, peeked = {}, wrong = {}, phase = "say", finished = false, els = {};
    (o.scored || D.WORDS.filter(function (w) { return o.hidden[w.i]; }).map(function (w) { return w.i; })).forEach(function (i) { scored[i] = true; });
    var box = h("div", { class: "aml-recall" });
    parent.appendChild(box);

    function wrongCount() { return Object.keys(wrong).length; }
    function peek(w, el) {
      if (scored[w.i] && !peeked[w.i]) { peeked[w.i] = true; e.word(w.i, "hint"); }
      el.className = "aml-w aml-peek"; el.textContent = w.token; el.setAttribute("aria-label", w.token);
      e.fb("Peek: “" + w.word + "” (" + w.pron + "). Say it again.", "hint");
      e.later(function () {
        if (phase !== "say") return;
        el.className = "aml-w aml-blank"; el.textContent = blankText(w, cue); el.setAttribute("aria-label", blankLabel(w, cue));
      }, 2000);
    }
    function render() {
      box.textContent = "";
      var board = h("div", { class: "aml-board" });
      lines.forEach(function (l) {
        var row = h("div", { class: "aml-rline", lang: "la" });
        lineWords(D, l.id).forEach(function (w) {
          var hid = !!o.hidden[w.i], el;
          if (phase === "say") {
            if (hid) {
              el = h("button", { type: "button", class: "aml-w aml-blank", "aria-label": blankLabel(w, cue) }, blankText(w, cue));
              el.addEventListener("click", function () { peek(w, el); });
            } else el = h("span", { class: "aml-w aml-plain" }, w.token);
          } else if (hid && scored[w.i]) {
            el = h("button", { type: "button", class: "aml-w aml-tog", "aria-pressed": "false" });
            (function (btnEl) {
              function paint() {
                var bad = !!wrong[w.i];
                btnEl.className = "aml-w aml-tog" + (bad ? " is-bad" : " is-ok");
                btnEl.setAttribute("aria-pressed", bad ? "true" : "false");
                btnEl.setAttribute("aria-label", w.word + (bad ? ": missed" : ": right"));
                btnEl.textContent = "";
                btnEl.appendChild(h("span", { class: "aml-ico", "aria-hidden": "true" }, bad ? "✗" : "✓"));
                btnEl.appendChild(document.createTextNode(w.token));
              }
              paint();
              btnEl.addEventListener("click", function () {
                if (wrong[w.i]) delete wrong[w.i]; else wrong[w.i] = true;
                paint(); updateDone();
              });
            })(el);
          } else el = h("span", { class: "aml-w aml-plain" }, w.token);
          els[w.i] = el; row.appendChild(el);
        });
        board.appendChild(row);
      });
      if (phase === "say") {
        box.appendChild(h("p", { class: "aml-say" }, o.sayText || "Say it out loud. Tap a blank to peek."));
        box.appendChild(board);
        box.appendChild(h("div", { class: "aml-nav" }, btn("Check me ✓", function () { phase = "check"; e.fb(""); render(); e.focusHeadIn(box); }, "qk-btn-primary")));
      } else {
        box.appendChild(h("p", { class: "aml-say", tabindex: "-1", "data-aml-head": "1" }, "Here is the prayer. A word with ✓ means you said it. Tap a word you missed to mark it ✗."));
        box.appendChild(board);
        var doneBtn = btn("", finish, "qk-btn-primary");
        doneBtn.id = "aml-done-" + Math.floor(Math.random() * 1e6);
        box.appendChild(h("div", { class: "aml-nav" }, doneBtn));
        box._doneBtn = doneBtn; updateDone();
      }
    }
    function updateDone() {
      var n = wrongCount(), b = box._doneBtn; if (!b) return;
      b.textContent = n === 0 ? "I got it all ✓" : "Save: I missed " + n + " ✗";
      e.fb(n === 0 ? "All ✓. Tap any word you missed." : n + (n === 1 ? " word" : " words") + " marked ✗. That is fine, we will practise them.", n ? "hint" : "");
    }
    function finish() {
      if (finished) return; finished = true;
      var right = 0, total = 0, miss = [];
      Object.keys(scored).forEach(function (k) {
        var i = +k; if (!o.hidden[i]) return;
        total++;
        if (wrong[i]) { e.word(i, "wrong"); miss.push(i); }
        else if (peeked[i]) { /* already recorded as a hint */ }
        else { e.word(i, "right"); right++; }
      });
      o.onDone({ wrong: miss, right: right, total: total, peeked: Object.keys(peeked).length });
    }
    e.focusHeadIn = function (b) { var t = b.querySelector("[data-aml-head]"); if (t) t.focus(); };
    render();
    return box;
  }

  /* ---------- fill the gaps (blank tap -> choose from 3) ---------- */
  function pickGaps(D, lineIds, seed) {
    var r = D.rng(seed), hidden = {};
    lineIds.forEach(function (id) {
      var ws = lineWords(D, id), order = shuffle(ws.map(function (w) { return w.i; }), r);
      order.slice(0, Math.ceil(ws.length / 2)).forEach(function (i) { hidden[i] = true; });
    });
    return hidden;
  }
  function gapOptions(D, w) {
    var pool = D.WORDS.filter(function (x) { return x.key !== w.key; }), seen = {}, out = [w];
    seen[w.key] = 1;
    var same = shuffle(pool.filter(function (x) { return x.key.charAt(0) === w.key.charAt(0); }));
    var rest = shuffle(pool);
    [same[0]].concat(rest).forEach(function (x) { if (x && out.length < 3 && !seen[x.key]) { seen[x.key] = 1; out.push(x); } });
    return shuffle(out);
  }
  function fillGaps(e, parent, lineIds, seed, st, onComplete) {
    var D = e.D, hid = pickGaps(D, lineIds, seed), idxs = D.WORDS.filter(function (w) { return hid[w.i]; }).map(function (w) { return w.i; });
    var filled = {}, missed = {}, opts = {}, active = idxs[0], blankEls = {}, wrongKeys = {}, complete = false;
    var box = h("div", { class: "aml-gaps" }), board = h("div", { class: "aml-board" }), panel = h("div", { class: "aml-choices-wrap" });
    parent.appendChild(box); box.appendChild(board); box.appendChild(panel);
    lineIds.forEach(function (id) {
      var l = D.lineById(id), row = h("div", { class: "aml-rline", lang: "la" });
      lineWords(D, id).forEach(function (w) {
        var el;
        if (hid[w.i]) {
          el = h("button", { type: "button", class: "aml-w aml-blank" }, blankText(w, "letter"));
          el.addEventListener("click", function () { if (!filled[w.i]) { active = w.i; paint(); } });
        } else el = h("span", { class: "aml-w aml-plain" }, w.token);
        blankEls[w.i] = el; row.appendChild(el);
      });
      board.appendChild(h("div", { class: "aml-gapline" }, row, h("p", { class: "aml-en aml-small" }, l.en)));
    });
    function paint() {
      idxs.forEach(function (i) {
        var w = D.WORDS[i], el = blankEls[i];
        if (filled[i]) { el.className = "aml-w aml-filled"; el.textContent = w.token; el.disabled = true; el.setAttribute("aria-label", w.token + ", filled"); }
        else { el.className = "aml-w aml-blank" + (i === active ? " is-active" : ""); el.setAttribute("aria-label", blankLabel(w, "letter") + (i === active ? ", chosen" : "")); }
      });
      panel.textContent = "";
      var left = idxs.filter(function (i) { return !filled[i]; });
      if (!left.length) return;
      var w = D.WORDS[active], n = idxs.indexOf(active) + 1;
      if (!opts[active]) opts[active] = gapOptions(D, w);
      panel.appendChild(h("p", { class: "aml-say" }, "Blank " + n + " of " + idxs.length + ": it starts with “" + w.word.charAt(0) + "”. Which word fits?"));
      var row = h("div", { class: "aml-choices" });
      opts[active].forEach(function (o) {
        var bad = wrongKeys[active + ":" + o.key];
        var b = h("button", { type: "button", class: "aml-choice" + (bad ? " is-bad" : ""), lang: "la", disabled: bad ? "disabled" : null },
          bad ? h("span", { class: "aml-ico", "aria-hidden": "true" }, "✗") : null, o.word);
        b.addEventListener("click", function () { choose(o); });
        row.appendChild(b);
      });
      panel.appendChild(row);
    }
    function choose(o) {
      var w = D.WORDS[active];
      if (o.key === w.key) {
        if (!missed[w.i]) { e.word(w.i, "right"); st.right++; st.total++; }
        filled[w.i] = true;
        e.fb("✓ Yes! “" + w.word + "” = " + w.en + ".", "good");
        var next = idxs.filter(function (i) { return !filled[i]; })[0];
        if (next === undefined) { paint(); if (!complete) { complete = true; onComplete(); } return; }
        active = next; paint();
        var first = panel.querySelector(".aml-choice"); if (first && !e.ctx.reduced) { /* keep focus flow natural */ }
      } else {
        wrongKeys[active + ":" + o.key] = true;
        if (!missed[w.i]) { missed[w.i] = true; e.word(w.i, "hint"); st.total++; }
        e.fb("✗ Not that one. Look at the first letter: “" + w.word.charAt(0) + "”.", "hint");
        paint();
      }
    }
    paint();
    return box;
  }

  /* ---------- 1. Meet the prayer ---------- */
  G.meet = function (mount, ctx, opts) {
    var e = Env(mount, ctx, "aml-meet"), D = e.D, L = D.LINES, idx = 0, solved = {}, tried = {}, firstTry = 0, choices = {};
    function choicesFor(k) {
      if (choices[k]) return choices[k];
      var others = shuffle(L.filter(function (x, j) { return j !== k && x.en !== L[k].en; })).slice(0, 2);
      return (choices[k] = shuffle([L[k]].concat(others)));
    }
    function render() {
      var l = L[idx], st = e.stage; st.textContent = "";
      st.appendChild(head("Line " + (idx + 1) + " of " + L.length));
      st.appendChild(dots(L.length, idx, "Line " + (idx + 1) + " of " + L.length));
      var card = h("div", { class: "aml-card" },
        h("span", { class: "qk-pill" }, "Part " + l.part + ": " + D.PARTS.filter(function (p) { return p.id === l.part; })[0].title),
        h("p", { class: "aml-latin aml-big", lang: "la" }, l.text),
        listenRow(e, l.text),
        h("p", { class: "aml-pron" }, h("span", { class: "aml-tag" }, "Say it: "), l.pron),
        h("p", { class: "aml-en" }, h("span", { class: "aml-tag" }, "In English: "), l.en),
        h("p", { class: "aml-es" }, h("span", { class: "aml-tag" }, "En español: "), l.es),
        h("div", { class: "aml-hook", html: "<b>💡 Memory trick:</b> " + l.hook }));
      st.appendChild(card);
      var q = h("div", { class: "aml-card aml-quiz" }, h("h3", null, "Quick check: which English matches this Latin line?"));
      var row = h("div", { class: "aml-choices aml-stack" });
      choicesFor(idx).forEach(function (o) {
        var isRight = o === l, b = h("button", { type: "button", class: "aml-choice aml-wide" }, o.en);
        if (solved[idx] && isRight) { b.className += " is-good"; b.insertBefore(h("span", { class: "aml-ico", "aria-hidden": "true" }, "✓"), b.firstChild); b.disabled = true; }
        b.addEventListener("click", function () {
          if (solved[idx]) return;
          if (isRight) {
            solved[idx] = true;
            var first = !tried[idx]; if (first) firstTry++;
            e.award(first ? 10 : 4, "Meet line " + (idx + 1));
            e.fb("✓ Yes! " + l.en, "good"); render();
            var nx = e.stage.querySelector(".aml-next"); if (nx) nx.focus();
          } else {
            tried[idx] = true; b.disabled = true; b.className += " is-bad";
            b.insertBefore(h("span", { class: "aml-ico", "aria-hidden": "true" }, "✗"), b.firstChild);
            e.fb("✗ Not that one. Check the memory trick above and try again.", "hint");
          }
        });
        row.appendChild(b);
      });
      q.appendChild(row); st.appendChild(q);
      var last = idx === L.length - 1;
      var next = btn(last ? "Finish ✓" : "Next →", function () {
        if (last) { ctx.done({ title: "Meet the prayer", correct: firstTry, total: L.length, points: e.points, note: "Now you know what every line means. Next: learn it in parts." }); return; }
        idx++; e.fb(""); render(); e.focusHead();
      }, "qk-btn-primary aml-next", { disabled: solved[idx] ? null : "disabled" });
      st.appendChild(h("div", { class: "aml-nav" },
        btn("← Back", function () { if (idx > 0) { idx--; e.fb(""); render(); e.focusHead(); } }, "qk-btn-ghost", { disabled: idx === 0 ? "disabled" : null }),
        next));
    }
    render();
    return { destroy: e.destroy };
  };

  /* ---------- 2. Learn a part ---------- */
  G.learn = function (mount, ctx, opts) {
    opts = opts || {};
    var e = Env(mount, ctx, "aml-learn"), D = e.D, pid = String(opts.part || "A").toUpperCase();
    var part = D.PARTS.filter(function (p) { return p.id === pid; })[0] || D.PARTS[0]; pid = part.id;
    var lines = part.lines.map(D.lineById), partIdx = D.PARTS.indexOf(part);
    var labels = ["Listen & echo", "Build it", "Fill the gaps", "Join up"], key = "learn" + pid;
    var saved = e.load(key), step = saved && typeof saved.step === "number" && saved.step >= 0 && saved.step < 4 ? saved.step : 0;
    var st = { right: 0, total: 0 };

    function go(n) { step = n; e.save(key, { step: n }); e.fb(""); render(); e.focusHead(); }
    function frame(title) {
      e.stage.textContent = "";
      e.stage.appendChild(h("p", { class: "aml-kicker" }, "Part " + pid + ": " + part.title));
      e.stage.appendChild(stepper(labels, step));
      e.stage.appendChild(head(title));
    }
    function render() { [stepListen, stepBuild, stepGaps, stepJoin][step](); }

    function stepListen() {
      frame("1. Listen, then say it out loud 2 times");
      var tapped = {}, total = lines.length * 2, count = 0;
      var go2 = btn("Next: build it →", function () { go(1); }, "qk-btn-primary", { disabled: "disabled" });
      lines.forEach(function (l) {
        var circles = h("div", { class: "aml-circles", role: "group", "aria-label": "Say it out loud 2 times" });
        [1, 2].forEach(function (n) {
          var c = h("button", { type: "button", class: "aml-circle", "aria-pressed": "false", "aria-label": "Said it, time " + n }, String(n));
          c.addEventListener("click", function () {
            var on = c.getAttribute("aria-pressed") !== "true";
            c.setAttribute("aria-pressed", on ? "true" : "false"); c.className = "aml-circle" + (on ? " is-on" : "");
            c.textContent = on ? "✓" : String(n); count += on ? 1 : -1;
            if (count >= total) { go2.disabled = false; e.fb("✓ Great echo! Now build it.", "good"); } else { go2.disabled = true; e.fb(""); }
          });
          circles.appendChild(c);
        });
        e.stage.appendChild(h("div", { class: "aml-card" }, lineBlock(e, l), listenRow(e, l.text),
          h("p", { class: "aml-say" }, "Say it out loud 2 times:"), circles));
      });
      e.stage.appendChild(h("div", { class: "aml-nav" }, go2));
    }

    function stepBuild() {
      frame("2. Build it: tap the words in order");
      var li = 0, holder = h("div", { class: "aml-buildwrap" });
      e.stage.appendChild(holder);
      function showLine() {
        holder.textContent = "";
        var l = lines[li], ws = lineWords(D, l.id), placed = 0, hinted = {}, used = {}, finishedLine = false;
        var order = ws.map(function (w, k) { return k; });
        for (var tries = 0; tries < 6; tries++) { order = shuffle(order); if (ws.length < 2 || order.some(function (v, k) { return v !== k; })) break; }
        var slotsEl = h("div", { class: "aml-slots", lang: "la", "aria-label": "Your line so far" }),
          tilesEl = h("div", { class: "aml-tiles", lang: "la" }), slots = [], tiles = {};
        ws.forEach(function (w, k) { var s = h("span", { class: "aml-slot" + (k === 0 ? " is-next" : "") }, "·"); slots.push(s); slotsEl.appendChild(s); });
        var nextBtn = btn(li === lines.length - 1 ? "Next: fill the gaps →" : "Next line →", function () { if (li === lines.length - 1) go(2); else { li++; e.fb(""); showLine(); } }, "qk-btn-primary", { hidden: "hidden" });
        order.forEach(function (k) {
          var t = h("button", { type: "button", class: "aml-tile", lang: "la" }, ws[k].token);
          tiles[k] = t;
          t.addEventListener("click", function () {
            if (finishedLine || used[k]) return;
            var want = ws[placed];
            if (ws[k].key === want.key) {
              used[k] = true; t.hidden = true;
              slots[placed].textContent = want.token; slots[placed].className = "aml-slot is-filled";
              if (!hinted[placed]) { e.word(want.i, "right"); st.right++; st.total++; }
              placed++;
              if (placed >= ws.length) {
                finishedLine = true; nextBtn.hidden = false; tilesEl.hidden = true;
                e.fb("✓ Line built! Read it out loud once.", "good"); nextBtn.focus();
              } else {
                slots[placed].className = "aml-slot is-next"; e.fb("");
                var rem = tilesEl.querySelector(".aml-tile:not([hidden])"); if (rem) rem.focus();
              }
            } else {
              if (!ctx.reduced) { t.classList.remove("aml-shake"); void t.offsetWidth; t.classList.add("aml-shake"); }
              if (!hinted[placed]) { hinted[placed] = true; e.word(want.i, "hint"); st.total++; }
              slots[placed].textContent = want.word.charAt(0) + "…"; slots[placed].className = "aml-slot is-next is-hint";
              e.fb("✗ Not that one. The next word starts with “" + want.word.charAt(0) + "”.", "hint");
            }
          });
          tilesEl.appendChild(t);
        });
        holder.appendChild(h("p", { class: "aml-say" }, "Line " + (li + 1) + " of " + lines.length + ". Meaning: " + l.en));
        var lst = listenRow(e, l.text); if (lst) holder.appendChild(lst);
        holder.appendChild(slotsEl); holder.appendChild(tilesEl);
        holder.appendChild(h("div", { class: "aml-nav" }, nextBtn));
      }
      showLine();
    }

    function stepGaps() {
      frame("3. Fill the gaps");
      e.stage.appendChild(h("p", { class: "aml-say" }, "Some words are hidden. Tap a blank, then pick the right word."));
      var nav = h("div", { class: "aml-nav" }, btn("Next: join up →", function () { go(3); }, "qk-btn-primary", { hidden: "hidden" }));
      fillGaps(e, e.stage, part.lines, partIdx * 17 + 5, st, function () {
        nav.firstChild.hidden = false; e.fb("✓ All filled! Great job.", "good"); nav.firstChild.focus();
      });
      e.stage.appendChild(nav);
    }

    function stepJoin() {
      frame("4. Join up");
      var upTo = D.PARTS.slice(0, partIdx + 1), ids = [];
      upTo.forEach(function (p) { ids = ids.concat(p.lines); });
      var scored = D.partWords(pid).map(function (w) { return w.i; });
      var msg = partIdx === 0
        ? "Say Part A from memory, out loud. The first letters help you."
        : "Say everything from the start up to the end of Part " + pid + ", out loud. Only the first letters show. You can do it!";
      var hidden = D.WORDS.map(function (w) { return ids.indexOf(w.line) >= 0; });
      var wrap = h("div", null); e.stage.appendChild(wrap);
      if (partIdx > 0) wrap.appendChild(h("p", { class: "aml-small" }, "Parts shown: " + upTo.map(function (p) { return p.id; }).join(" + ") + ". Part " + pid + " is the new one: that is where you tap if you miss words."));
      recallRound(e, wrap, {
        lineIds: ids, hidden: hidden, cue: "letter", scored: scored, sayText: msg,
        onDone: function (r) {
          st.right += r.right; st.total += r.total;
          wrap.textContent = "";
          var miss = r.wrong.length, nextNote = partIdx < 3 ? "Next: learn Part " + D.PARTS[partIdx + 1].id + "." : "Next: Disappearing words.";
          wrap.appendChild(h("div", { class: "aml-card aml-result" },
            h("h3", { class: "aml-h", tabindex: "-1", "data-aml-head": "1" }, miss === 0 ? "✓ You said it all from memory!" : "✓ Nice work. You will practise " + miss + (miss === 1 ? " word" : " words") + " again."),
            h("p", null, partIdx > 0 ? "You joined Part " + pid + " to everything before it." : "Part A is in your head."),
            h("p", null, nextNote),
            h("div", { class: "aml-nav" }, btn("Finish ✓", function () {
              e.save(key, null);
              ctx.done({ title: "Part " + pid + ": " + part.title, correct: st.right, total: st.total, points: e.points, note: nextNote });
            }, "qk-btn-primary"))));
          e.celebrate(miss === 0 ? "Part " + pid + " done!" : "");
          e.focusHead();
        }
      });
    }
    render();
    return { destroy: e.destroy };
  };

  /* ---------- 3. Disappearing words ---------- */
  G.vanish = function (mount, ctx, opts) {
    var e = Env(mount, ctx, "aml-vanish"), D = e.D, all = D.LINES.map(function (l) { return l.id; });
    var saved = e.load("vanish"), level = saved && typeof saved.level === "number" && saved.level >= 0 && saved.level <= 4 ? saved.level : 0;
    var seed = saved && saved.seed ? saved.seed : 1 + Math.floor(Math.random() * 9000);
    var hasShaky = D.WORDS.some(function (w) { return e.strength(w.i) === "shaky"; });
    function persist() { e.save("vanish", { level: level, seed: seed }); }

    function maskFor(lv) {
      var m = D.vanishMask(lv, seed), hidden = m.hidden.slice();
      if ((lv === 1 || lv === 2) && hasShaky) {
        var n = hidden.filter(Boolean).length, rank = { shaky: 2, "new": 1, strong: 0 };
        var order = D.WORDS.map(function (w) { return w.i; }).sort(function (a, b) {
          var ra = rank[e.strength(a)], rb = rank[e.strength(b)];
          if (ra === undefined) ra = 1; if (rb === undefined) rb = 1;
          if (rb !== ra) return rb - ra;
          return (hidden[b] ? 1 : 0) - (hidden[a] ? 1 : 0) || a - b;
        });
        hidden = D.WORDS.map(function () { return false; });
        order.slice(0, n).forEach(function (i) { hidden[i] = true; });
      }
      return { hidden: hidden, cue: m.cue, title: m.title };
    }
    function go(lv) { level = Math.max(0, Math.min(4, lv)); persist(); e.fb(""); render(); e.focusHead(); }
    function render() {
      var st = e.stage, info = D.VANISH_LEVELS[level]; st.textContent = "";
      st.appendChild(h("p", { class: "aml-kicker" }, "Disappearing words"));
      st.appendChild(h("div", { class: "aml-levelbar" },
        dots(5, level, "Level " + level + " of 4"),
        btn("↓ Easier level", function () { go(level - 1); }, "qk-btn-ghost aml-small-btn", { disabled: level === 0 ? "disabled" : null })));
      st.appendChild(head("Level " + level + " of 4: " + info.title));
      var body = h("div", null); st.appendChild(body);
      if (level === 0) {
        var board = h("div", { class: "aml-board" });
        D.LINES.forEach(function (l) { board.appendChild(h("div", { class: "aml-rline", lang: "la" }, lineWords(D, l.id).map(function (w) { return h("span", { class: "aml-w aml-plain" }, w.token); }))); });
        body.appendChild(h("p", { class: "aml-say" }, "Read the whole prayer out loud one time. Next, words start to vanish."));
        var lr = listenRow(e, D.TEXT); if (lr) body.appendChild(lr);
        body.appendChild(board);
        body.appendChild(h("div", { class: "aml-nav" }, btn("I said it → Level 1", function () { go(1); }, "qk-btn-primary")));
        return;
      }
      var m = maskFor(level), count = m.hidden.filter(Boolean).length;
      recallRound(e, body, {
        lineIds: all, hidden: m.hidden, cue: m.cue,
        sayText: level === 4 ? "Say the whole prayer out loud. Nothing shows. Tap a blank only if you are stuck."
          : "Say the whole prayer out loud. " + (m.cue === "letter" ? "Each blank shows its first letter. " : "") + "Tap a blank to peek for 2 seconds.",
        onDone: function (r) {
          body.textContent = "";
          var ok = r.total - r.wrong.length, good = r.wrong.length <= Math.round(count * 0.2), top = level === 4;
          var res = h("div", { class: "aml-card aml-result" },
            h("h3", { class: "aml-h", tabindex: "-1", "data-aml-head": "1" }, top ? "🌟 Level 4 done! You said it from memory." : good ? "✓ Level " + level + " cleared!" : "Good try. Let’s do this level once more."),
            h("p", null, "You knew " + ok + " of " + count + " hidden words" + (r.peeked ? " (you peeked at " + r.peeked + ")" : "") + "."),
            r.wrong.length ? h("p", { class: "aml-small" }, "Words to watch: " + r.wrong.map(function (i) { return D.WORDS[i].word; }).join(", ")) : null);
          var nav = h("div", { class: "aml-nav" });
          if (top) {
            nav.appendChild(btn("Finish ✓", function () {
              e.save("vanish", null);
              ctx.done({ title: "Disappearing words", correct: r.right, total: r.total, points: e.points,
                note: r.wrong.length ? "Say the shaky words again, then keep going." : "From memory! That is the whole prayer." });
            }, "qk-btn-primary"));
            nav.appendChild(btn("Try level 4 again", function () { go(4); }, "qk-btn-ghost"));
            e.celebrate("Level 4 done! Amazing!");
          } else {
            var nextB = btn("Next level →", function () { go(level + 1); }, good ? "qk-btn-primary" : "qk-btn-ghost");
            var againB = btn("Try this level again", function () { go(level); }, good ? "qk-btn-ghost" : "qk-btn-primary");
            if (good) { nav.appendChild(nextB); nav.appendChild(againB); } else { nav.appendChild(againB); nav.appendChild(nextB); }
          }
          res.appendChild(nav); body.appendChild(res); e.focusHead();
        }
      });
    }
    persist(); render();
    return { destroy: e.destroy };
  };

  /* ---------- first-letters view (bedtime / morning) ---------- */
  function lettersView(e, intro, btnLabel, onNext) {
    var D = e.D, fl = D.firstLetters(), wrap = h("div", { class: "aml-card" });
    wrap.appendChild(h("p", { class: "aml-say" }, intro));
    var board = h("div", { class: "aml-letters", lang: "la" });
    fl.forEach(function (t) { board.appendChild(h("p", { class: "aml-letterline" }, t)); });
    wrap.appendChild(board);
    wrap.appendChild(h("div", { class: "aml-nav" }, btn(btnLabel, onNext, "qk-btn-primary")));
    return wrap;
  }
  function skyArt() {
    var svg = '<svg class="aml-sky" viewBox="0 0 220 90" aria-hidden="true" focusable="false"><path d="M62 12a30 30 0 1 0 28 40A24 24 0 0 1 62 12z" fill="#ffe9a8"/><g fill="#fff4d6"><circle cx="120" cy="20" r="2.2" class="aml-star"/><circle cx="150" cy="44" r="1.8" class="aml-star s2"/><circle cx="178" cy="16" r="2.4" class="aml-star s3"/><circle cx="196" cy="58" r="1.6" class="aml-star"/><circle cx="24" cy="66" r="1.8" class="aml-star s2"/><circle cx="110" cy="70" r="1.6" class="aml-star s3"/></g></svg>';
    return h("div", { class: "aml-skywrap", html: svg });
  }

  /* ---------- 4. Bedtime lock-in ---------- */
  G.bedtime = function (mount, ctx, opts) {
    var e = Env(mount, ctx, "aml-night"), D = e.D, all = D.LINES.map(function (l) { return l.id; });
    var labels = ["Look", "Say it", "Sleep"];
    function frame(step, title) {
      e.stage.textContent = ""; e.stage.appendChild(skyArt());
      e.stage.appendChild(h("p", { class: "aml-kicker" }, "Bedtime lock-in"));
      e.stage.appendChild(stepper(labels, step)); e.stage.appendChild(head(title));
    }
    function s1() {
      frame(0, "Look at the first letters once");
      e.stage.appendChild(lettersView(e, "Each letter starts a word. Read it slowly in your head. Look just once.", "I’m ready →", function () { e.fb(""); s2(); e.focusHead(); }));
    }
    function s2() {
      frame(1, "Now say it from memory");
      var wrap = h("div", null); e.stage.appendChild(wrap);
      recallRound(e, wrap, {
        lineIds: all, hidden: D.WORDS.map(function () { return true; }), cue: "none",
        sayText: "Say the whole prayer out loud, slowly and calmly. Tap a blank only if you are stuck.",
        onDone: function (r) { e.fb(""); s3(r); e.focusHead(); }
      });
    }
    function s3(r) {
      frame(2, "Sleep now");
      var miss = r.wrong.length, note = "Sleep now: your brain saves it overnight. Do the Morning warm-up tomorrow.";
      e.stage.appendChild(h("div", { class: "aml-card aml-result" },
        h("p", { class: "aml-big-note" }, miss === 0 ? "✓ All 31 words. Lovely." : "✓ " + (31 - miss) + " of 31 words. Good enough for tonight."),
        miss ? h("p", { class: "aml-small" }, "Words to look at in the morning: " + r.wrong.map(function (i) { return D.WORDS[i].word; }).join(", ")) : null,
        h("p", null, "😴 " + note),
        h("div", { class: "aml-nav" }, btn("Good night 🌙", function () {
          ctx.done({ title: "Bedtime lock-in", correct: 31 - miss, total: 31, points: e.points, note: note });
        }, "qk-btn-primary"))));
      e.celebrate("");
    }
    s1();
    return { destroy: e.destroy };
  };

  /* ---------- 5. Morning warm-up ---------- */
  G.morning = function (mount, ctx, opts) {
    var e = Env(mount, ctx, "aml-morning"), D = e.D, all = D.LINES.map(function (l) { return l.id; });
    var labels = ["First letters", "Shaky lines", "From memory", "Done"], st = { right: 0, total: 0 }, final = null;
    function frame(step, title) {
      e.stage.textContent = ""; e.stage.appendChild(h("p", { class: "aml-kicker" }, "Morning warm-up"));
      e.stage.appendChild(stepper(labels, step)); e.stage.appendChild(head(title));
    }
    function s1() {
      frame(0, "1. First letters, then say it");
      e.stage.appendChild(lettersView(e, "Say the whole prayer out loud. The first letters help you.", "I said it → next", function () { e.fb(""); s2(); e.focusHead(); }));
    }
    function shakiest(n) {
      var sc = { shaky: 2, "new": 1, strong: 0 }, tricky = {};
      D.TRICKY.forEach(function (t) { t.words.forEach(function (i) { tricky[i] = 1; }); });
      var rows = D.LINES.map(function (l, k) {
        var ws = lineWords(D, l.id), s = 0, tr = 0;
        ws.forEach(function (w) { var v = sc[e.strength(w.i)]; s += v === undefined ? 1 : v; if (tricky[w.i]) tr++; });
        return { id: l.id, k: k, s: s / ws.length + tr * 0.3 };
      });
      rows.sort(function (a, b) { return b.s - a.s || a.k - b.k; });
      return rows.slice(0, n).sort(function (a, b) { return a.k - b.k; }).map(function (r) { return r.id; });
    }
    function s2() {
      frame(1, "2. Your 3 shakiest lines");
      var ids = shakiest(3);
      e.stage.appendChild(h("p", { class: "aml-say" }, "These lines need the most love today. Tap a blank, then pick the right word."));
      var nav = h("div", { class: "aml-nav" }, btn("Next: say it all →", function () { e.fb(""); s3(); e.focusHead(); }, "qk-btn-primary", { hidden: "hidden" }));
      fillGaps(e, e.stage, ids, 91, st, function () { nav.firstChild.hidden = false; e.fb("✓ All filled! Great job.", "good"); nav.firstChild.focus(); });
      e.stage.appendChild(nav);
    }
    function s3() {
      frame(2, "3. The whole prayer from memory");
      var wrap = h("div", null); e.stage.appendChild(wrap);
      recallRound(e, wrap, {
        lineIds: all, hidden: D.WORDS.map(function () { return true; }), cue: "none",
        sayText: "Say the whole prayer out loud. Nothing shows. Tap a blank only if you are stuck.",
        onDone: function (r) { final = r; e.fb(""); s4(); e.focusHead(); }
      });
    }
    function s4() {
      frame(3, "You warmed up!");
      var miss = final ? final.wrong.length : 0, note = "Now do one Test-day practice.";
      e.stage.appendChild(h("div", { class: "aml-card aml-result" },
        h("p", { class: "aml-big-note" }, miss === 0 ? "🌟 All 31 words from memory!" : "✓ " + (31 - miss) + " of 31 words from memory."),
        h("p", null, "You are ready. " + note),
        h("div", { class: "aml-nav" }, btn("Finish ✓", function () {
          ctx.done({ title: "Morning warm-up", correct: 31 - miss, total: 31, points: e.points, note: note });
        }, "qk-btn-primary"))));
      e.celebrate(miss === 0 ? "Ready for the test!" : "");
    }
    s1();
    return { destroy: e.destroy };
  };
})();

var G = window.AM_GAMES = window.AM_GAMES || {};
/* Ave María Quest — challenge games: G.next, G.slip, G.match, G.build, G.test.
   Each: function (mount, ctx, opts) -> { destroy }. Renders only inside mount. */
(function () {
  "use strict";
  var h = QuestKit.h;

  function clear(el) { while (el.firstChild) el.removeChild(el.firstChild); }
  function shuffle(a, r) {
    a = a.slice();
    for (var i = a.length - 1; i > 0; i--) { var j = Math.floor((r || Math.random)() * (i + 1)); var t = a[i]; a[i] = a[j]; a[j] = t; }
    return a;
  }
  function seed() { return (Date.now() ^ (Math.random() * 1e9)) >>> 0; }
  function fmt(s) { s = Math.max(0, Math.round(s)); return Math.floor(s / 60) + ":" + (s % 60 < 10 ? "0" : "") + (s % 60); }
  function load(ctx, k, d) { try { var v = ctx.load(k); return v == null ? d : v; } catch (e) { return d; } }
  function save(ctx, k, v) { try { ctx.save(k, v); } catch (e) { /* ignore */ } }

  /* ---------- shared game frame: title, streak, points, feedback line, timers ---------- */
  function Base(mount, ctx, title, sub) {
    var B = { timers: [], points: 0, streak: 0, first: 0, dead: false, ctx: ctx, D: ctx.D };
    B.root = h("section", { class: "amc" + (ctx.reduced ? " amc-reduced" : ""), "aria-label": title });
    B.streakEl = h("span", { class: "amc-chip amc-streak" });
    B.pointsEl = h("span", { class: "amc-chip amc-points" });
    B.extraEl = h("span", { class: "amc-chip amc-extra" });
    B.progEl = h("span", { class: "amc-prog" });
    B.bar = h("span", { class: "amc-barfill" });
    B.fb = h("div", { class: "amc-fb", role: "status", "aria-live": "polite" });
    B.body = h("div", { class: "amc-body" });
    B.root.appendChild(h("div", { class: "amc-head" },
      h("div", { class: "amc-titles" }, h("h2", { class: "amc-title" }, title), sub ? h("p", { class: "amc-sub" }, sub) : null),
      h("div", { class: "amc-hud" }, B.extraEl, B.streakEl, B.pointsEl)));
    B.root.appendChild(h("div", { class: "amc-progwrap" }, B.progEl, h("span", { class: "amc-bar", "aria-hidden": "true" }, B.bar)));
    B.root.appendChild(B.body);
    B.root.appendChild(B.fb);
    mount.appendChild(B.root);

    B.hud = function (bump) {
      B.streakEl.textContent = "🔥 " + B.streak + " in a row";
      B.pointsEl.textContent = "⭐ " + B.points + " pts";
      if (bump && !ctx.reduced) {
        B.streakEl.classList.remove("amc-bump"); void B.streakEl.offsetWidth; B.streakEl.classList.add("amc-bump");
      }
    };
    B.progress = function (label, frac) { B.progEl.textContent = label; B.bar.style.width = Math.round(Math.max(0, Math.min(1, frac)) * 100) + "%"; };
    B.later = function (fn, ms) { var t = setTimeout(function () { if (!B.dead) fn(); }, ms); B.timers.push(t); return t; };
    B.every = function (fn, ms) { var t = setInterval(function () { if (!B.dead) fn(); }, ms); B.timers.push(t); return t; };
    /* a right answer: first try = 10, after a hint/second try = 4, +2 for every 5 in a row. */
    B.hit = function (first, label, extra, defer) {
      var pts = first ? 10 : 4;
      if (first) { B.streak++; B.first++; if (B.streak % 5 === 0) pts += 2; } else { B.streak = 0; }
      pts += extra || 0;
      B.points += pts; B.hud(true);
      if (!defer) { try { ctx.award(pts, label); } catch (e) { /* ignore */ } } else { B.pending = (B.pending || 0) + pts; }
      return pts;
    };
    B.flush = function (label) { if (B.pending) { try { ctx.award(B.pending, label); } catch (e) { /* ignore */ } B.pending = 0; } };
    B.miss = function () { B.streak = 0; B.hud(false); };
    /* feedback: kind good | bad | hint. Icon + words, never colour alone. */
    B.say = function (kind, text, htmlExtra) {
      clear(B.fb);
      B.fb.className = "amc-fb amc-fb-" + kind;
      var icon = kind === "good" ? "✓" : kind === "bad" ? "✗" : "💡";
      var p = h("p", { class: "amc-fbtext" }, h("span", { class: "amc-fbicon", "aria-hidden": "true" }, icon), " ", text);
      B.fb.appendChild(p);
      if (htmlExtra) B.fb.appendChild(h("div", { class: "amc-why", html: htmlExtra }));
    };
    B.nofb = function () { clear(B.fb); B.fb.className = "amc-fb"; };
    B.speakBtn = function (text, label) {
      var ok = false; try { ok = !!(ctx.speech && ctx.speech.canSpeak()); } catch (e) { ok = false; }
      if (!ok) return null;
      return h("button", { type: "button", class: "amc-listen", "aria-label": "Listen: " + (label || text), onclick: function () { try { ctx.speech.say(text, {}); } catch (e) { /* ignore */ } } }, "🔊", h("span", { class: "amc-listen-t" }, " Listen"));
    };
    B.word = function (i, state) { try { ctx.word(i, state); } catch (e) { /* ignore */ } };
    B.finish = function (res) { B.destroy(); try { ctx.done(res); } catch (e) { /* ignore */ } };
    B.destroy = function () {
      if (B.dead) return; B.dead = true;
      B.timers.forEach(function (t) { clearTimeout(t); clearInterval(t); });
      try { ctx.speech && ctx.speech.stop && ctx.speech.stop(); } catch (e) { /* ignore */ }
      if (B.root.parentNode) B.root.parentNode.removeChild(B.root);
    };
    B.hud(false);
    return B;
  }

  function nextBtn(B, label, fn) {
    var b = h("button", { type: "button", class: "qk-btn qk-btn-primary amc-next", onclick: fn }, label);
    return b;
  }
  function focusSoon(el) { setTimeout(function () { try { el.focus({ preventScroll: false }); } catch (e) { /* ignore */ } }, 30); }

  /* word indexes for each phrase in D.PHRASES (they cover all 31 words in order) */
  function phraseWords(D) {
    var out = [], c = 0;
    D.PHRASES.forEach(function (p) { var n = p.split(" ").length, a = []; for (var k = 0; k < n; k++) a.push(c + k); c += n; out.push(a); });
    return out;
  }

  /* =====================================================================
     1. WHAT COMES NEXT?
     ===================================================================== */
  G.next = function (mount, ctx, opts) {
    var D = ctx.D, P = D.PHRASES, PW = phraseWords(D), r = D.rng(seed());
    var B = Base(mount, ctx, "What comes next?", "Pick the part that comes next. The tricky joins are in here!");
    var hard = ["grátia plena,", "Iesus.", "peccatoribus"].map(function (p) { return P.indexOf(p); });
    var pool = []; for (var i = 0; i < P.length - 1; i++) if (hard.indexOf(i) < 0) pool.push(i);
    var rounds = hard.concat(shuffle(pool, r).slice(0, 6));
    rounds = shuffle(rounds, r).map(function (f) { return { type: "p", from: f, retry: false }; });
    rounds.push({ type: "last", retry: false });
    var total = rounds.length, queue = rounds, pos = 0, resolved = 0, speed = false, startedAt = 0, locked = false;

    var speedBtn = h("button", { type: "button", class: "amc-toggle", "aria-pressed": "false", onclick: function () {
      speed = !speed; speedBtn.setAttribute("aria-pressed", speed ? "true" : "false");
      speedBtn.textContent = speed ? "⚡ Speed bonus: ON (answer in 6 s for +3)" : "⚡ Speed bonus: off";
    } }, "⚡ Speed bonus: off");
    B.extraEl.appendChild(speedBtn);

    function options(rd) {
      var correct, near = [], ctxIdx = [];
      if (rd.type === "last") {
        return { prompt: null, correct: "Amen", opts: shuffle(["Amen", "nostrae", "Dei"], r), words: [30] };
      }
      correct = P[rd.from + 1];
      ctxIdx = [rd.from - 1, rd.from].filter(function (k) { return k >= 0; });
      [-2, -1, 1, 2, 3].forEach(function (d) { var k = rd.from + 1 + d; if (k >= 0 && k < P.length && ctxIdx.indexOf(k) < 0 && k !== rd.from + 1) near.push(P[k]); });
      near = shuffle(near, r);
      var all = P.filter(function (p, k) { return k !== rd.from + 1 && ctxIdx.indexOf(k) < 0 && near.indexOf(p) < 0; });
      near = near.concat(shuffle(all, r));
      return { ctxIdx: ctxIdx, correct: correct, opts: shuffle([correct, near[0], near[1]], r), words: PW[rd.from + 1] };
    }

    function show() {
      if (pos >= queue.length) return end();
      var rd = queue[pos], o = options(rd); locked = false; B.nofb();
      B.progress("Round " + Math.min(resolved + 1, total) + " of " + total + (rd.retry ? " · second chance" : ""), resolved / total);
      clear(B.body);
      var card = h("div", { class: "amc-card" });
      if (rd.type === "last") {
        card.appendChild(h("p", { class: "amc-q" }, "What is the LAST word of the prayer?"));
        card.appendChild(h("p", { class: "amc-big amc-latin" }, "nunc et in hora mortis nostrae. ", h("span", { class: "amc-blank", "aria-label": "missing word" }, "?")));
      } else {
        card.appendChild(h("p", { class: "amc-q" }, "What comes next?"));
        var soFar = o.ctxIdx.slice(0, -1).map(function (k) { return P[k]; }).join(" ");
        if (soFar) card.appendChild(h("p", { class: "amc-ctx amc-latin" }, "…" + soFar));
        card.appendChild(h("p", { class: "amc-big amc-latin" }, P[rd.from] + " ", h("span", { class: "amc-blank", "aria-label": "missing part" }, "?")));
      }
      var list = h("div", { class: "amc-opts", role: "group", "aria-label": "Choose the next part" });
      var btns = o.opts.map(function (txt) {
        var b = h("button", { type: "button", class: "amc-opt amc-latin" }, h("span", { class: "amc-mark", "aria-hidden": "true" }), h("span", null, txt));
        b.addEventListener("click", function () { pick(rd, o, txt, b, btns); });
        list.appendChild(b); return b;
      });
      card.appendChild(list);
      B.body.appendChild(card);
      startedAt = Date.now();
    }

    function pick(rd, o, txt, btn, btns) {
      if (locked) return; locked = true;
      var right = txt === o.correct, fast = Date.now() - startedAt < 6000;
      btns.forEach(function (b) { b.disabled = true; b.classList.add("is-done"); });
      var correctBtn = btns.filter(function (b) { return b.lastChild.textContent === o.correct; })[0];
      correctBtn.classList.add("is-right"); correctBtn.firstChild.textContent = "✓";
      var sp = B.speakBtn(o.correct, o.correct);
      var fullPhrase = rd.type === "last" ? "Amen." : P[rd.from] + " " + o.correct;
      if (right) {
        var first = !rd.retry, pts = B.hit(first, "What comes next?", first && speed && fast ? 3 : 0);
        o.words.forEach(function (w) { B.word(w, first ? "right" : "hint"); });
        if (first) { resolved++; }
        else resolved++;
        B.say("good", (first ? "Yes! " : "Got it this time. ") + "+" + pts + (first && speed && fast ? " ⚡" : ""));
      } else {
        btn.classList.add("is-wrong"); btn.firstChild.textContent = "✗";
        B.miss();
        o.words.forEach(function (w) { B.word(w, "wrong"); });
        var again = { type: rd.type, from: rd.from, retry: true };
        queue.splice(Math.min(pos + 3, queue.length), 0, again);
        B.say("bad", "Not that one. It is “" + o.correct + "”. This one will come back.");
      }
      var row = h("div", { class: "amc-row" }, nextBtn(B, pos + 1 >= queue.length ? "See results" : "Next ➜", function () { pos++; show(); }), sp);
      B.body.firstChild.appendChild(row);
      focusSoon(row.firstChild);
    }

    function end() {
      B.progress("Done!", 1);
      B.finish({ title: "What comes next?", correct: B.first, total: total, points: B.points,
        note: B.first === total ? "Every join right on the first try!" : "Review the joins you missed, then play again." });
    }
    show();
    return { destroy: B.destroy };
  };

  /* =====================================================================
     2. SPOT THE SLIP
     ===================================================================== */
  G.slip = function (mount, ctx, opts) {
    var D = ctx.D, r = D.rng(seed());
    var B = Base(mount, ctx, "Spot the slip", "One word in each line is wrong. Tap it!");
    var rounds = shuffle(D.SLIPS, r).slice(0, 8), idx = 0, wrongTaps = 0, solved = false;

    function wordIndex(slip) { var line = D.lineById(slip.line), n = 0; for (var i = 0; i < D.WORDS.length; i++) if (D.WORDS[i].line === slip.line && D.WORDS[i].at === slip.at) { n = i; break; } return n; }

    function show() {
      if (idx >= rounds.length) { B.progress("Done!", 1); return B.finish({ title: "Spot the slip", correct: B.first, total: rounds.length, points: B.points, note: B.first === rounds.length ? "You caught every slip!" : "Read the “why” notes again. They show how to tell the words apart." }); }
      var slip = rounds[idx], sl = D.slipLine(slip), wi = wordIndex(slip);
      wrongTaps = 0; solved = false; B.nofb();
      B.progress("Slip " + (idx + 1) + " of " + rounds.length, idx / rounds.length);
      clear(B.body);
      var line = h("div", { class: "amc-line", role: "group", "aria-label": "The line with one wrong word" });
      var btns = sl.tokens.map(function (tok, k) {
        var b = h("button", { type: "button", class: "amc-tok amc-latin" }, h("span", { class: "amc-mark", "aria-hidden": "true" }), h("span", { class: "amc-tt" }, tok));
        b.addEventListener("click", function () { tap(k, b); });
        line.appendChild(b); return b;
      });
      var card = h("div", { class: "amc-card" }, h("p", { class: "amc-q" }, "Which word is the slip?"), line);
      B.body.appendChild(card);

      function reveal(foundIt) {
        solved = true;
        var fixed = D.lineById(slip.line).text.split(" ")[slip.at];
        btns.forEach(function (b, k) { b.disabled = true; if (k === slip.at) { b.classList.add("is-right"); b.firstChild.textContent = "✓"; b.lastChild.textContent = fixed; } });
        var sp = B.speakBtn(D.lineById(slip.line).text, D.lineById(slip.line).text);
        var row = h("div", { class: "amc-row" }, nextBtn(B, idx + 1 >= rounds.length ? "See results" : "Next ➜", function () { idx++; show(); }), sp);
        card.appendChild(row); focusSoon(row.firstChild);
      }
      function tap(k, b) {
        if (solved) return;
        if (k === slip.at) {
          var first = wrongTaps === 0, pts = B.hit(first, "Spot the slip");
          B.word(wi, wrongTaps === 0 ? "right" : wrongTaps === 1 ? "hint" : "wrong");
          B.say("good", "Found it! The right word is “" + sl.right + "”. +" + pts, slip.why);
          reveal(true);
        } else {
          wrongTaps++; b.disabled = true; b.classList.add("is-wrong"); b.firstChild.textContent = "✗";
          if (!ctx.reduced) { b.classList.add("amc-shake"); }
          if (wrongTaps === 1) {
            B.miss(); B.word(wi, "hint");
            var half = slip.at < sl.tokens.length / 2 ? "first half" : "second half";
            if (sl.tokens.length === 1) half = "word";
            B.say("hint", "Not that word. Look again at the " + half + " of the line.");
          } else {
            B.word(wi, "wrong"); B.miss(); // revealed: no points
            B.say("bad", "The slip was “" + sl.wrong + "”. It should be “" + sl.right + "”.", slip.why);
            reveal(false);
          }
        }
      }
      if (btns[0]) focusSoon(btns[0]);
    }
    show();
    return { destroy: B.destroy };
  };

  /* =====================================================================
     3. MEANING MATCH
     ===================================================================== */
  G.match = function (mount, ctx, opts) {
    var D = ctx.D, r = D.rng(seed());
    var B = Base(mount, ctx, "Meaning match", "Tap a Latin phrase, then its English meaning.");
    var pairs = shuffle(D.MEANINGS, r), rounds = [pairs.slice(0, 4), pairs.slice(4, 8)], ri = 0;
    var totalPairs = 8, matched = 0, firstTry = 0;

    function wordsOfPhrase(lat) {
      var keys = lat.split(" ").map(D.norm), W = D.WORDS;
      for (var i = 0; i + keys.length <= W.length; i++) {
        var ok = true; for (var k = 0; k < keys.length; k++) if (W[i + k].key !== keys[k]) { ok = false; break; }
        if (ok) { var a = []; for (var j = 0; j < keys.length; j++) a.push(i + j); return a; }
      }
      return [];
    }

    function show() {
      var set = rounds[ri], sel = null, number = 0, left = set.length, missed = {};
      B.nofb(); clear(B.body);
      B.progress("Round " + (ri + 1) + " of 2 · " + matched + " of " + totalPairs + " matched", matched / totalPairs);
      var L = h("div", { class: "amc-col", role: "group", "aria-label": "Latin" }, h("h3", { class: "amc-colh" }, "Latin"));
      var R = h("div", { class: "amc-col", role: "group", "aria-label": "English" }, h("h3", { class: "amc-colh" }, "English"));
      var rightOrder = shuffle(set.map(function (p, k) { return { t: p[1], k: k }; }), r);
      function mkBtn(text, side, k, latin) {
        var b = h("button", { type: "button", class: "amc-card-btn" + (latin ? " amc-latin" : ""), "aria-pressed": "false" },
          h("span", { class: "amc-tag", "aria-hidden": "true" }, "•"), h("span", { class: "amc-bt" }, text));
        b.dataset.side = side; b.dataset.k = k; return b;
      }
      var lb = set.map(function (p, k) { var b = mkBtn(p[0], "L", k, true); L.appendChild(b); return b; });
      var rb = rightOrder.map(function (o) { var b = mkBtn(o.t, "R", o.k, false); R.appendChild(b); return b; });
      var all = lb.concat(rb);
      function clearSel() { all.forEach(function (b) { b.classList.remove("is-active"); b.setAttribute("aria-pressed", "false"); }); sel = null; }
      all.forEach(function (b) {
        b.addEventListener("click", function () {
          if (b.disabled) return;
          var side = b.dataset.side, k = +b.dataset.k;
          if (!sel || sel.side === side) { clearSel(); sel = { side: side, k: k, b: b }; b.classList.add("is-active"); b.setAttribute("aria-pressed", "true"); B.nofb(); return; }
          var lk = side === "L" ? k : sel.k, rk = side === "R" ? k : sel.k, other = sel.b;
          if (lk === rk) {
            var first = !missed[lk], pts = B.hit(first, "Meaning match");
            if (first) firstTry++;
            wordsOfPhrase(set[lk][0]).forEach(function (w) { B.word(w, first ? "right" : "hint"); });
            number++; matched++; left--;
            [b, other].forEach(function (x) { x.disabled = true; x.classList.remove("is-active"); x.classList.add("is-right"); x.setAttribute("aria-pressed", "false"); x.firstChild.textContent = "✓" + number; });
            sel = null;
            B.say("good", "Match! " + set[lk][0] + " = " + set[lk][1] + ". +" + pts);
            B.progress("Round " + (ri + 1) + " of 2 · " + matched + " of " + totalPairs + " matched", matched / totalPairs);
            if (left === 0) {
              var last = ri === rounds.length - 1;
              var nb = nextBtn(B, last ? "See results" : "Next round ➜", function () { if (last) { B.progress("Done!", 1); B.finish({ title: "Meaning match", correct: firstTry, total: totalPairs, points: B.points, note: firstTry === totalPairs ? "All eight on the first try!" : "Look at the pairs you missed, then play again." }); } else { ri++; show(); } });
              B.body.appendChild(h("div", { class: "amc-row" }, nb)); focusSoon(nb);
            }
          } else {
            missed[lk] = true; missed[rk] = true; B.miss();
            wordsOfPhrase(set[lk][0]).forEach(function (w) { B.word(w, "wrong"); });
            [b, other].forEach(function (x) { x.classList.add("is-wrong"); if (!ctx.reduced) x.classList.add("amc-shake"); x.firstChild.textContent = "✗"; });
            var xs = [b, other]; clearSel();
            B.say("bad", "Not a match. Try again.");
            B.later(function () { xs.forEach(function (x) { x.classList.remove("is-wrong", "amc-shake"); x.firstChild.textContent = "•"; }); }, 900);
          }
        });
      });
      B.body.appendChild(h("div", { class: "amc-match" }, L, R));
      focusSoon(lb[0]);
    }
    show();
    return { destroy: B.destroy };
  };

  /* =====================================================================
     4. WORD BUILDER
     ===================================================================== */
  G.build = function (mount, ctx, opts) {
    var D = ctx.D, r = D.rng(seed());
    var B = Base(mount, ctx, "Word builder", "Build the whole prayer, one line at a time, from the word tiles.");
    var best = load(ctx, "amc_buildBest", null), started = Date.now(), elapsed = 0, stopped = false;
    var timerEl = h("span", { class: "amc-chip amc-clock" }); B.extraEl.appendChild(timerEl);
    function tick() { if (!stopped) elapsed = (Date.now() - started) / 1000; timerEl.textContent = "⏱ " + fmt(elapsed) + (best != null ? " · best " + fmt(best) : ""); }
    tick(); B.every(tick, 500);

    var prayer = h("div", { class: "amc-prayer", "aria-label": "Your prayer so far" });
    var work = h("div", { class: "amc-work" });
    B.body.appendChild(h("div", { class: "amc-card" }, prayer, work));
    var li = 0, firstWords = 0;

    function lineWords(l) { return D.WORDS.filter(function (w) { return w.line === l.id; }); }

    function startLine() {
      if (li >= D.LINES.length) return finish();
      var line = D.LINES[li], words = lineWords(line), pos = 0, hinted = false, state = {};
      B.progress("Line " + (li + 1) + " of " + D.LINES.length, li / D.LINES.length);
      var lineKeys = words.map(function (w) { return w.key; });
      var decoyPool = D.WORDS.filter(function (w) { return lineKeys.indexOf(w.key) < 0; });
      var seen = {}, decoys = [];
      shuffle(decoyPool, r).forEach(function (w) { if (decoys.length < 2 && !seen[w.key]) { seen[w.key] = 1; decoys.push(w); } });
      var tiles = shuffle(words.map(function (w) { return { w: w, real: true }; }).concat(decoys.map(function (w) { return { w: w, real: false }; })), r);
      var cur = h("p", { class: "amc-cur amc-latin", "aria-label": "Line being built" });
      var tileBox = h("div", { class: "amc-tiles", role: "group", "aria-label": "Word tiles" });
      clear(work); work.appendChild(h("p", { class: "amc-q" }, "Line " + (li + 1) + ": tap the words in order")); work.appendChild(cur); work.appendChild(tileBox);
      var placed = [];
      function paintCur() {
        clear(cur);
        placed.forEach(function (t) { cur.appendChild(h("span", { class: "amc-placed" }, t + " ")); });
        cur.appendChild(h("span", { class: "amc-blank", "aria-hidden": "true" }, "…"));
      }
      paintCur();
      var tileEls = tiles.map(function (t) {
        var b = h("button", { type: "button", class: "amc-tile amc-latin" }, t.w.word);
        b.addEventListener("click", function () { tap(t, b); });
        tileBox.appendChild(b); return b;
      });
      function tap(t, b) {
        var exp = words[pos];
        if (t.w.key === exp.key && t.real) {
          var first = !hinted_for(exp.i);
          B.word(exp.i, first ? "right" : "hint");
          if (first) firstWords++;
          B.hit(first, "Word builder", 0, true);
          placed.push(line.text.split(" ")[pos]); pos++;
          b.remove(); paintCur(); B.nofb();
          if (pos >= words.length) {
            B.flush("Word builder: line " + (li + 1));
            tileBox.innerHTML = "";
            addLine(line);
            B.say("good", "Line " + (li + 1) + " built!");
            li++; B.later(startLine, ctx.reduced ? 0 : 450);
          }
        } else {
          B.miss(); state[exp.i] = true;
          if (!ctx.reduced) { b.classList.remove("amc-shake"); void b.offsetWidth; b.classList.add("amc-shake"); }
          B.word(exp.i, "hint");
          B.say("hint", "Not that one. Hint: the next word starts with “" + line.text.split(" ")[pos].charAt(0) + "”.");
        }
      }
      function hinted_for(i) { return !!state[i]; }
    }
    function addLine(line) {
      prayer.appendChild(h("p", { class: "amc-done amc-latin" }, h("span", { class: "amc-mark", "aria-hidden": "true" }, "✓ "), line.text));
      clear(work);
    }
    function finish() {
      stopped = true; elapsed = (Date.now() - started) / 1000; tick();
      B.progress("The whole prayer!", 1);
      var isBest = best == null || elapsed < best;
      if (isBest) { save(ctx, "amc_buildBest", Math.round(elapsed)); }
      if (ctx.reduced) QuestKit.announce("You built the whole prayer."); else QuestKit.celebrate("You built the whole prayer!");
      B.say("good", "You built the whole Ave María in " + fmt(elapsed) + (isBest ? " — a new best time!" : " (best " + fmt(best) + ")."));
      var nb = nextBtn(B, "See results", function () {
        B.finish({ title: "Word builder", correct: firstWords, total: 31, points: B.points,
          note: "Time " + fmt(elapsed) + (isBest ? " (new best!)" : " (best " + fmt(best) + ")") + ". Words without a hint: " + firstWords + " of 31." });
      });
      work.appendChild(h("div", { class: "amc-row" }, nb)); focusSoon(nb);
    }
    startLine();
    return { destroy: B.destroy };
  };

  /* =====================================================================
     5. TEST-DAY PRACTICE /31
     ===================================================================== */
  G.test = function (mount, ctx, opts) {
    var D = ctx.D;
    var B = Base(mount, ctx, "Test-day practice", "Just like the class sheet: say it all, then score it out of 31.");
    B.streakEl.style.display = "none"; B.root.querySelector(".amc-progwrap").style.display = "none";
    B.pointsEl.style.display = "none";
    var done = 0, ended = false;

    function attempt() { done = +load(ctx, "amc_testAttempts", 0) || 0; if (done < 0) done = 0; return done; }

    function intro() {
      attempt(); B.nofb(); clear(B.body);
      if (done >= 3) {
        B.body.appendChild(h("div", { class: "amc-card amc-center" },
          h("p", { class: "amc-attempt" }, "All 3 attempts done"),
          h("p", { class: "amc-instr" }, "Great work. Start a new set of 3 if you want more practice."),
          h("div", { class: "amc-row amc-rowc" },
            h("button", { type: "button", class: "qk-btn qk-btn-primary", id: "amc-newset", onclick: function () { save(ctx, "amc_testAttempts", 0); intro(); } }, "Start a new set of 3"))));
        focusSoon(document.getElementById("amc-newset")); return;
      }
      var go = h("button", { type: "button", class: "qk-btn qk-btn-primary amc-bigbtn", onclick: step1 }, "Start attempt " + (done + 1));
      B.body.appendChild(h("div", { class: "amc-card amc-center" },
        h("p", { class: "amc-attempt" }, "Attempt " + (done + 1) + " of 3"),
        h("p", { class: "amc-instr" }, "Say the whole prayer out loud from memory. A grown-up can listen and mark, or check yourself honestly."),
        h("p", { class: "amc-small" }, "One point for every word you say right. Perfect is 31 / 31."),
        h("div", { class: "amc-row amc-rowc" }, go)));
      focusSoon(go);
    }

    function step1() {
      clear(B.body); B.nofb();
      var btn = h("button", { type: "button", class: "qk-btn qk-btn-primary amc-bigbtn", onclick: step2 }, "I’m done saying it");
      B.body.appendChild(h("div", { class: "amc-card amc-center amc-sheet" },
        h("p", { class: "amc-attempt" }, "Attempt " + (done + 1) + " of 3"),
        h("h3", { class: "amc-sheet-title amc-latin" }, "AVE MARIA ", h("span", { class: "amc-sheet-sub" }, "(Latin Prayer)")),
        h("p", { class: "amc-hidden-note" }, "🙈 The prayer is hidden. Say it out loud now, from memory."),
        h("div", { class: "amc-row amc-rowc" }, btn)));
      focusSoon(btn);
    }

    function step2() {
      clear(B.body); B.nofb();
      var missed = {};
      var scoreEl = h("span", { class: "amc-score", "aria-live": "polite" });
      var save1 = h("button", { type: "button", class: "qk-btn qk-btn-primary", onclick: function () { finish(); } }, "Save score");
      var save2 = h("button", { type: "button", class: "qk-btn qk-btn-primary", onclick: function () { finish(); } }, "Save score");
      var clr = h("button", { type: "button", class: "qk-btn qk-btn-ghost amc-clr", onclick: function () { missed = {}; paint(); } }, "Clear marks");
      var bar = h("div", { class: "amc-scorebar" }, scoreEl, h("div", { class: "amc-scorebtns" }, clr, save1));
      var board = h("div", { class: "amc-board" });
      var btns = {};
      D.LINES.forEach(function (line) {
        var row = h("div", { class: "amc-brow" });
        D.WORDS.filter(function (w) { return w.line === line.id; }).forEach(function (w) {
          var b = h("button", { type: "button", class: "amc-w amc-latin", "aria-pressed": "false" }, h("span", { class: "amc-x", "aria-hidden": "true" }, "✗"), h("span", { class: "amc-wt" }, w.token));
          b.addEventListener("click", function () { if (missed[w.i]) delete missed[w.i]; else missed[w.i] = true; paint(); });
          btns[w.i] = b; row.appendChild(b);
        });
        board.appendChild(row);
      });
      function paint() {
        var n = Object.keys(missed).length;
        D.WORDS.forEach(function (w) {
          var m = !!missed[w.i], b = btns[w.i];
          b.classList.toggle("is-missed", m); b.setAttribute("aria-pressed", m ? "true" : "false");
          b.setAttribute("aria-label", w.word + ", " + (m ? "marked missed" : "counted correct"));
        });
        scoreEl.textContent = "Score: " + (31 - n) + " / 31";
        clr.disabled = n === 0;
      }
      paint();
      function finish() {
        var res = D.scoreRecital(Object.keys(missed).map(Number));
        res.attempt = done + 1;
        try { ctx.recordTest(res); } catch (e) { /* ignore */ }
        D.WORDS.forEach(function (w) { B.word(w.i, res.missed.indexOf(w.i) >= 0 ? "wrong" : "right"); });
        done = done + 1; save(ctx, "amc_testAttempts", done);
        try { ctx.award(res.score, "Test-day practice"); } catch (e) { /* ignore */ }
        results(res);
      }
      B.body.appendChild(h("div", { class: "amc-card" },
        h("p", { class: "amc-q" }, "Tap every word that was missed or said wrong."),
        h("p", { class: "amc-small" }, "Everything starts as correct. A tapped word shows ✗ and a line through it. Tap again to undo."),
        bar, board,
        h("div", { class: "amc-row amc-rowc" }, save2)));
      focusSoon(board.querySelector("button"));
    }

    function results(res) {
      clear(B.body); B.nofb();
      var perfect = res.score === 31;
      var cheer = perfect ? "Optime!" : res.score >= 27 ? "Bene!" : "Perge!";
      var cheerEn = perfect ? "Excellent!" : res.score >= 27 ? "Well done!" : "Keep going! You are getting there.";
      var card = h("div", { class: "amc-card amc-center amc-results" },
        h("p", { class: "amc-attempt" }, "Attempt " + res.attempt + " of 3"),
        h("p", { class: "amc-bigscore", "aria-label": res.score + " out of 31" }, res.score + " / 31"),
        h("p", { class: "amc-cheer" }, cheer + " ", h("span", { class: "amc-cheer-en" }, cheerEn)));
      if (perfect) {
        card.appendChild(h("p", { class: "amc-instr" }, "Word-perfect! Every one of the 31 words. 🎉"));
        if (ctx.reduced) QuestKit.announce("Optime! 31 out of 31."); else QuestKit.celebrate("Optime! 31 out of 31.");
      } else {
        var list = h("ul", { class: "amc-fix" });
        res.missed.forEach(function (i) {
          var w = D.WORDS[i], sp = B.speakBtn(w.word, w.word);
          list.appendChild(h("li", { class: "amc-fixitem" },
            h("span", { class: "amc-fixw amc-latin" }, w.word),
            h("span", { class: "amc-fixm" }, "means “" + w.en + "” · say “" + w.pron + "”"), sp));
        });
        card.appendChild(h("p", { class: "amc-q" }, "Words to fix (" + res.missed.length + "):"));
        card.appendChild(list);
      }
      var again = h("button", { type: "button", class: "qk-btn qk-btn-primary", onclick: function () { if (done >= 3) { save(ctx, "amc_testAttempts", 0); done = 0; intro(); } else { attempt(); step1(); } } },
        done >= 3 ? "Start a new set of 3" : "Try attempt " + (done + 1));
      var names = res.missed.map(function (i) { return D.WORDS[i].word + " (" + D.WORDS[i].en + ")"; });
      var prac = h("button", { type: "button", class: "qk-btn qk-btn-ghost", onclick: function () {
        B.finish({ title: "Test-day practice", correct: res.score, total: 31, points: res.score,
          note: res.missed.length ? "Practice these words: " + names.join(", ") + "." : "Word-perfect, optime!" }); } },
        perfect ? "Finish" : "Practice those words");
      card.appendChild(h("div", { class: "amc-row amc-rowc" }, again, prac));
      B.body.appendChild(card); focusSoon(again);
    }

    intro();
    return { destroy: B.destroy };
  };
})();

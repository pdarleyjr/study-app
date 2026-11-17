var G = window.AM_GAMES = window.AM_GAMES || {};
/* Ave María Quest — Lantern Catch (G.catch). Prefix amk-.
   Three paper lanterns float up a night sky: the next word of the prayer + two near-miss decoys.
   Tap the right one to write it on the scroll. Gentle: wrong lanterns just fade, no lives, no game over.
   G.catch(mount, ctx, opts) -> { destroy } — renders only inside mount; every timer/rAF/listener is cleaned up. */
(function () {
  "use strict";
  var h = QuestKit.h;

  /* words people mix up: key -> keys of look-alike or sound-alike words */
  var CONFUSE = {
    benedicta: ["benedictus"], benedictus: ["benedicta"], maria: ["mater", "sancta"], mater: ["maria", "mortis"],
    tecum: ["nobis", "tui"], nobis: ["tecum", "nostrae"], hora: ["ora", "mortis"], ora: ["hora", "pro"],
    dominus: ["dei", "iesus"], dei: ["dominus", "iesus"], iesus: ["dei", "dominus"], tui: ["tu", "tecum"], tu: ["tui", "tecum"],
    gratia: ["plena", "sancta"], plena: ["gratia", "mulieribus"], peccatoribus: ["mulieribus", "nobis"],
    mulieribus: ["peccatoribus", "plena"], nostrae: ["nobis", "mortis"], mortis: ["hora", "mater"], nunc: ["et", "in"],
    ventris: ["fructus", "mortis"], fructus: ["ventris", "tui"], ave: ["amen", "maria"], amen: ["ave", "nostrae"],
    sancta: ["gratia", "maria"], pro: ["ora", "in"], "in": ["et", "pro"], et: ["in", "nunc"]
  };
  var STARS = 16;
  var TOWER = '<svg viewBox="0 0 400 170" preserveAspectRatio="xMidYMax meet" focusable="false" aria-hidden="true">' +
    '<path d="M0 170V150Q70 128 140 146T260 140T400 148V170Z" fill="#081633"/>' +
    '<g fill="#0a1b3d"><rect x="228" y="92" width="96" height="62"/><path d="M220 94L276 58 332 94Z"/>' +
    '<rect x="108" y="62" width="40" height="92"/><path d="M104 64L128 22 152 64Z"/><rect x="126" y="6" width="4" height="18"/><rect x="121" y="11" width="14" height="4"/></g>' +
    '<g fill="#f4c65a" opacity=".9"><path d="M120 76h16v18a8 8 0 0 1-16 0z" transform="translate(0 -2)"/><path d="M240 112h12v22H240zM264 112h12v22H264zM288 112h12v22H288z"/><path d="M270 80h12v10h-12z"/></g></svg>';

  function shuffle(a, r) {
    a = a.slice();
    for (var i = a.length - 1; i > 0; i--) { var j = Math.floor(r() * (i + 1)), t = a[i]; a[i] = a[j]; a[j] = t; }
    return a;
  }
  function load(ctx, k, d) { try { var v = ctx.load(k); return v == null ? d : v; } catch (e) { return d; } }
  function save(ctx, k, v) { try { ctx.save(k, v); } catch (e) { /* ignore */ } }

  G.catch = function (mount, ctx, opts) {
    var D = ctx.D, WORDS = D.WORDS, N = WORDS.length, r = D.rng((Date.now() ^ (Math.random() * 1e9)) >>> 0);
    var mq = null; try { mq = window.matchMedia("(prefers-reduced-motion: reduce)"); } catch (e) { mq = null; }
    var moving = !(ctx.reduced || (mq && mq.matches));
    var saved = load(ctx, "catch", null);
    var speedName = saved && saved.speed === "normal" ? "normal" : "calm";
    var SPEEDS = { calm: { base: 9, fast: 6, label: "🐢 Calm" }, normal: { base: 7, fast: 4.5, label: "🏃 Normal" } };

    var dead = false, paused = false, finished = false, busy = false;
    var timers = [], raf = 0, last = 0, round = 0, ro = null;
    var idx = 0, hinted = false, wrongs = 0, justAdded = -1;
    var streak = 0, best = 0, first = 0, points = 0, pending = 0, lastLevel = 0;
    var lanterns = [], W = 320, H = 360, LW = 90, LH = 88, laneW = 100;

    /* ---------- skeleton ---------- */
    var root = h("section", { class: "amk" + (moving ? "" : " amk-reduced"), "aria-label": "Lantern catch" });
    var streakEl = h("span", { class: "amk-chip" }), pointsEl = h("span", { class: "amk-chip" });
    var progEl = h("span", { class: "amk-prog" }), barFill = h("span", { class: "amk-barfill" });
    var fb = h("div", { class: "amk-fb", role: "status", "aria-live": "polite" });
    var doneBox = h("div", { class: "amk-done", tabindex: "-1" });
    var curLine = h("p", { class: "amk-cur" });
    var scroll = h("div", { class: "amk-scroll", "aria-label": "Your prayer so far" }, doneBox, curLine);
    var stage = h("div", { class: "amk-stage" + (moving ? "" : " amk-static") });
    var speedBtn = h("button", { type: "button", class: "amk-ctl", onclick: function () {
      speedName = speedName === "calm" ? "normal" : "calm"; paintSpeed(); save(ctx, "catch", { speed: speedName });
      say("hint", speedName === "calm" ? "Calm speed: lanterns float slowly." : "Normal speed: lanterns float a bit faster.");
    } });
    var pauseBtn = moving ? h("button", { type: "button", class: "amk-ctl", onclick: function () { setPaused(!paused); } }) : null;
    var listenBtn = null;
    try { if (ctx.speech && ctx.speech.canSpeak()) {
      listenBtn = h("button", { type: "button", class: "amk-ctl", "aria-label": "Hear this line", onclick: function () {
        try { ctx.speech.say(D.LINES[WORDS[Math.min(idx, N - 1)].lineIndex].text, {}); } catch (e) { /* ignore */ }
      } }, "🔊 Hear line");
    } } catch (e) { listenBtn = null; }

    var sky = h("div", { class: "amk-sky", "aria-hidden": "true" });
    var sr = D.rng(11), s;
    for (s = 0; s < STARS; s++) {
      sky.appendChild(h("i", { class: "amk-star", style: "left:" + Math.round(sr() * 96 + 2) + "%;top:" + Math.round(sr() * 62) + "%;animation-delay:" + (sr() * 3).toFixed(1) + "s;" + (sr() > .7 ? "width:4px;height:4px;" : "") }));
    }
    sky.appendChild(h("i", { class: "amk-moon" }));
    sky.appendChild(h("div", { class: "amk-tower", html: TOWER }));
    stage.appendChild(sky);
    var pauseVeil = h("div", { class: "amk-veil", hidden: true }, h("p", null, "Paused"),
      h("button", { type: "button", class: "qk-btn qk-btn-primary", onclick: function () { setPaused(false); } }, "▶ Keep going"));
    stage.appendChild(pauseVeil);

    root.appendChild(h("div", { class: "amk-head" },
      h("div", { class: "amk-titles" }, h("h2", { class: "amk-title" }, "Lantern catch"), h("p", { class: "amk-sub" }, "Catch the next word of the prayer, in order.")),
      h("div", { class: "amk-hud" }, streakEl, pointsEl)));
    root.appendChild(h("div", { class: "amk-ctls" }, speedBtn, pauseBtn, listenBtn));
    root.appendChild(h("div", { class: "amk-progwrap" }, progEl, h("span", { class: "amk-bar", "aria-hidden": "true" }, barFill)));
    root.appendChild(scroll);
    root.appendChild(fb);
    root.appendChild(stage);
    mount.appendChild(root);

    /* ---------- small helpers ---------- */
    function later(fn, ms) { var t = setTimeout(function () { if (!dead) { fn(); } }, ms); timers.push(t); return t; }
    function say(kind, text) {
      fb.className = "amk-fb amk-fb-" + kind;
      fb.replaceChildren(h("p", { class: "amk-fbtext" }, h("span", { class: "amk-fbicon", "aria-hidden": "true" }, kind === "good" ? "✓" : kind === "bad" ? "✗" : "💡"), " ", text));
    }
    function hud(bump) {
      streakEl.textContent = "🔥 " + streak + " in a row"; pointsEl.textContent = "⭐ " + points + " pts";
      if (bump && moving) { streakEl.classList.remove("amk-bump"); void streakEl.offsetWidth; streakEl.classList.add("amk-bump"); }
    }
    function paintSpeed() {
      speedBtn.textContent = SPEEDS[speedName].label;
      speedBtn.setAttribute("aria-label", "Speed: " + (speedName === "calm" ? "Calm" : "Normal") + ". Tap to change.");
    }
    function word(i, st) { try { ctx.word(i, st); } catch (e) { /* ignore */ } }
    function award(pts, label) { try { ctx.award(pts, label); } catch (e) { /* ignore */ } }
    function riseTime() {
      var S = SPEEDS[speedName], lvl = Math.min(4, Math.floor(streak / 5));
      return S.base - (S.base - S.fast) * lvl / 4;
    }

    /* ---------- the prayer scroll ---------- */
    function paintScroll() {
      var done = idx >= N, curLi = done ? D.LINES.length : WORDS[idx].lineIndex, li, rows = [];
      for (li = 0; li < curLi; li++) { rows.push(h("p", { class: "amk-dline" }, D.LINES[li].text)); }
      doneBox.replaceChildren.apply(doneBox, rows);
      doneBox.hidden = rows.length === 0;
      doneBox.scrollTop = doneBox.scrollHeight;
      scroll.classList.toggle("amk-complete", done);
      var kids = [];
      if (!done) {
        WORDS.forEach(function (w) {
          if (w.lineIndex !== curLi || w.i >= idx) { return; }
          var sp = h("span", { class: "amk-w" + (w.i === justAdded && moving ? " amk-new" : "") }, w.token, " ");
          if (w.i === justAdded && moving) { sp.appendChild(h("span", { class: "amk-burst", "aria-hidden": "true" })); }
          kids.push(sp);
        });
        kids.push(h("span", { class: "amk-blank", id: "amk-blank", role: "img", "aria-label": hinted ? "next word, starts with " + WORDS[idx].word.charAt(0) : "the next word" },
          hinted ? WORDS[idx].word.charAt(0) + "…" : "    "));
      }
      curLine.replaceChildren.apply(curLine, kids);
      curLine.hidden = done;
      progEl.textContent = done ? "All 31 words!" : "Word " + (idx + 1) + " of " + N;
      barFill.style.width = Math.round(idx / N * 100) + "%";
    }

    /* ---------- decoys ---------- */
    function nearestIdx(key, from) {
      var best = -1, d = 99, j;
      for (j = 0; j < N; j++) { if (WORDS[j].key === key && Math.abs(j - from) < d) { d = Math.abs(j - from); best = j; } }
      return best;
    }
    /* returns word indexes, near-misses first; never a word whose norm equals the right word or an excluded key */
    function pickDecoys(i, count, exclude) {
      var key = WORDS[i].key, ban = {}, out = [], pool = [], j;
      ban[key] = 1; (exclude || []).forEach(function (k) { ban[k] = 1; });
      (CONFUSE[key] || []).forEach(function (k) { var n = nearestIdx(k, i); if (n >= 0) { pool.push({ n: n, s: -50 + r() * 6 }); } });
      for (j = 0; j < N; j++) { if (j !== i) { pool.push({ n: j, s: Math.abs(j - i) + r() * 4 }); } }
      pool.sort(function (a, b) { return a.s - b.s; });
      pool.forEach(function (p) {
        var k = WORDS[p.n].key;
        if (out.length >= count || ban[k]) { return; }
        ban[k] = 1; out.push(p.n);
      });
      return out;
    }
    function activeKeys() { return lanterns.map(function (l) { return WORDS[l.w].key; }); }

    /* ---------- lanterns ---------- */
    function measure() {
      W = stage.clientWidth || 320; H = stage.clientHeight || 360; laneW = W / 3;
      var narrow = W < 460;
      LW = Math.max(58, Math.min(150, Math.floor(laneW - (narrow ? 6 : 16))));
      LH = W >= 700 ? 98 : narrow ? 84 : 92;
    }
    function fontFor(len) {
      var top = W >= 700 ? 30 : W >= 460 ? 26 : 24;
      return Math.max(13, Math.min(top, Math.floor((LW - 22) / (Math.max(4, len) * 0.54))));
    }
    function size(l) {
      l.el.style.width = LW + "px"; l.el.style.height = LH + "px";
      l.el.firstChild.style.fontSize = fontFor(WORDS[l.w].word.length) + "px";
      if (!moving) { l.el.style.gridColumn = String(l.lane + 1); }
      else { l.x = l.lane * laneW + (laneW - LW) / 2; }
    }
    function place(l) {
      if (!moving) { return; }
      var rot = Math.sin(l.t * 1.3 + l.phase) * 2.5, dx = Math.sin(l.t * 0.9 + l.phase) * Math.min(6, Math.max(0, (laneW - LW) / 2 - 1));
      l.el.style.transform = "translate3d(" + (l.x + dx).toFixed(1) + "px," + l.y.toFixed(1) + "px,0) rotate(" + rot.toFixed(2) + "deg)";
    }
    function addLantern(lane, w, isCorrect, yOff, slow) {
      var l = { lane: lane, w: w, correct: isCorrect, y: 0, x: 0, t: 0, phase: r() * 6.28, slow: (slow || 1) * (0.95 + r() * 0.1), gone: false };
      l.el = h("button", { type: "button", class: "amk-lantern" + (moving ? "" : " amk-lantern-static"), "aria-label": "Lantern: " + WORDS[w].word },
        h("span", { class: "amk-lw amk-latin" }, WORDS[w].word));
      if (isCorrect && wrongs >= 2) { l.el.classList.add("amk-help"); l.el.appendChild(h("span", { class: "amk-spark", "aria-hidden": "true" }, "✨")); }
      l.el.addEventListener("click", function () { onTap(l); });
      measure(); size(l);
      l.y = H - LH - 3 - (yOff || 0);
      place(l);
      /* keep DOM (Tab) order left to right */
      var after = null;
      lanterns.forEach(function (o) { if (o.lane > lane && (!after || o.lane < after.lane)) { after = o; } });
      if (after && after.el.parentNode === stage) { stage.insertBefore(l.el, after.el); } else { stage.insertBefore(l.el, pauseVeil); }
      if (paused) { l.el.disabled = true; }
      lanterns.push(l);
      return l;
    }
    function removeLantern(l) {
      l.gone = true;
      lanterns = lanterns.filter(function (o) { return o !== l; });
      if (l.el.parentNode) { l.el.parentNode.removeChild(l.el); }
    }
    function clearLanterns() { lanterns.slice().forEach(removeLantern); }

    function startRound() {
      busy = false; hinted = false; wrongs = 0; round++;
      paintScroll();
      var ds = pickDecoys(idx, 2), lanes = shuffle([0, 1, 2], r), offs = shuffle([0, 0.17, 0.34], r);
      measure();
      if (offs[0] > 0.2) { var z = offs.indexOf(0); offs[z] = offs[0]; offs[0] = 0; }
      [idx, ds[0], ds[1]].forEach(function (w, k) { addLantern(lanes[k], w, k === 0, offs[k] * H, 1); });
      startLoop();
    }
    function focusFirst() {
      var f = lanterns.slice().sort(function (a, b) { return a.lane - b.lane; })[0];
      if (f) { try { f.el.focus({ preventScroll: true }); } catch (e) { /* ignore */ } }
    }
    function refillDecoy(lane) {
      var tok = round;
      later(function () {
        if (tok !== round || busy || finished) { return; }
        if (lanterns.some(function (o) { return o.lane === lane; })) { return; }
        var d = pickDecoys(idx, 1, activeKeys());
        if (d.length) { addLantern(lane, d[0], false, 0, 1); }
      }, moving ? 250 : 0);
    }

    /* ---------- taps ---------- */
    function onTap(l) {
      if (dead || busy || paused || l.gone || finished) { return; }
      if (l.correct) { caught(l); } else { wrongTap(l); }
    }
    function wrongTap(l) {
      var lane = l.lane;
      streak = 0; wrongs++; hud(false);
      if (!hinted) { hinted = true; word(idx, "hint"); }
      var letter = WORDS[idx].word.charAt(0);
      paintScroll();
      if (wrongs >= 2 && !hasHelp()) { markHelp(); say("bad", "Not that one. Try the lantern with ✨. The word starts with “" + letter + "”."); }
      else { say("bad", "Not that one. The next word starts with “" + letter + "”. Try again!"); }
      var tok = round;
      if (moving) {
        l.el.disabled = true; l.el.classList.add("amk-pop");
        later(function () { if (tok === round) { removeLantern(l); refillDecoy(lane); } else { removeLantern(l); } }, 330);
        l.dying = true;
      } else {
        removeLantern(l); refillDecoy(lane);
      }
    }
    function hasHelp() { return lanterns.some(function (o) { return o.correct && o.el.classList.contains("amk-help"); }); }
    function markHelp() {
      lanterns.forEach(function (o) {
        if (o.correct && !o.el.classList.contains("amk-help")) { o.el.classList.add("amk-help"); o.el.appendChild(h("span", { class: "amk-spark", "aria-hidden": "true" }, "✨")); }
      });
    }

    function caught(l) {
      busy = true;
      var wasFirst = !hinted, w = WORDS[idx], pts = wasFirst ? 10 : 4, combo = false, hadFocus = root.contains(document.activeElement) && document.activeElement !== document.body;
      if (wasFirst) { streak++; first++; word(idx, "right"); if (streak > best) { best = streak; } if (streak % 5 === 0) { pts += 5; combo = true; } }
      else { streak = 0; }
      points += pts; pending += pts; hud(true);
      var lineEnd = idx === N - 1 || WORDS[idx + 1].lineIndex !== w.lineIndex;
      if (lineEnd && pending) { award(pending, "line " + (w.lineIndex + 1)); pending = 0; }
      var fromRect = l.el.getBoundingClientRect(), tapped = l.el;
      lanterns.slice().forEach(function (o) { if (o !== l) { o.el.disabled = true; if (moving) { o.el.classList.add("amk-pop"); } } });
      l.el.disabled = true;
      var newLevel = Math.min(4, Math.floor(streak / 5));
      var msg = (wasFirst ? "Yes! “" + w.word + "” (+" + pts + ")" : "You got it: “" + w.word + "” (+" + pts + ")");
      if (combo) { msg = "Combo! " + streak + " in a row. +5 bonus! " + msg; }
      if (combo && moving && newLevel > lastLevel && newLevel < 4) { msg += " The lanterns float a little faster."; }
      lastLevel = newLevel;
      say("good", msg);
      var tok = round;
      function after() {
        if (dead || tok !== round) { return; }
        clearLanterns();
        justAdded = idx; idx++;
        if (idx >= N) { paintScroll(); finishGame(); return; }
        paintScroll();
        later(function () { if (tok === round) { startRound(); if (hadFocus) { focusFirst(); } } }, moving ? 120 : 0);
      }
      if (moving) {
        var blank = document.getElementById("amk-blank");
        flyTo(tapped, fromRect, blank, after);
        tapped.style.visibility = "hidden";
        later(function () { lanterns.slice().forEach(function (o) { if (o !== l) { removeLantern(o); } }); }, 340);
      } else { after(); }
    }
    function flyTo(src, from, blank, done) {
      var to = blank ? blank.getBoundingClientRect() : null;
      if (!to) { later(done, 0); return; }
      var clone = src.cloneNode(true);
      clone.removeAttribute("id"); clone.setAttribute("aria-hidden", "true"); clone.tabIndex = -1; clone.disabled = true;
      clone.className = "amk-lantern amk-fly";
      clone.style.cssText = "left:" + from.left + "px;top:" + from.top + "px;width:" + from.width + "px;height:" + from.height + "px;";
      root.appendChild(clone);
      var dx = (to.left + to.width / 2) - (from.left + from.width / 2), dy = (to.top + to.height / 2) - (from.top + from.height / 2);
      var sc = Math.max(0.28, Math.min(0.6, 44 / from.height));
      requestAnimationFrame(function () { requestAnimationFrame(function () {
        clone.style.transform = "translate3d(" + dx.toFixed(0) + "px," + dy.toFixed(0) + "px,0) scale(" + sc.toFixed(2) + ")";
        clone.style.opacity = "0.15";
      }); });
      later(function () { if (clone.parentNode) { clone.parentNode.removeChild(clone); } done(); }, 520);
    }

    /* the right lantern drifted off the top: it comes back slower, with the first letter shown */
    function floatedAway(l) {
      var lane = l.lane;
      removeLantern(l);
      streak = 0; hud(false);
      if (!hinted) { hinted = true; word(idx, "hint"); }
      paintScroll();
      say("hint", "It floated away. Here it comes again! The word starts with “" + WORDS[idx].word.charAt(0) + "”.");
      var tok = round;
      later(function () {
        if (tok !== round || busy || finished) { return; }
        measure();
        addLantern(lane, idx, true, 0, 0.75);
        startLoop();
      }, 450);
    }

    /* ---------- motion ---------- */
    function step(dt) {
      var T = riseTime(), vBase = (H + 12) / T;
      lanterns.slice().forEach(function (l) {
        if (l.gone) { return; }
        l.t += dt; l.y -= vBase * l.slow * dt;
        place(l);
        if (l.y < -LH - 8 && !l.dying) {
          if (l.correct && !busy) { floatedAway(l); }
          else if (!busy) { var lane = l.lane; removeLantern(l); refillDecoy(lane); }
        }
      });
    }
    function frame(ts) {
      raf = 0;
      if (dead || paused || document.hidden || !moving) { return; }
      var dt = last ? Math.min(0.05, (ts - last) / 1000) : 0;
      last = ts; step(dt);
      raf = requestAnimationFrame(frame);
    }
    function startLoop() { if (!moving || raf || dead || paused || document.hidden || finished) { return; } last = 0; raf = requestAnimationFrame(frame); }
    function stopLoop() { if (raf) { cancelAnimationFrame(raf); } raf = 0; }
    function setPaused(p) {
      if (!moving || finished) { return; }
      paused = p;
      stage.classList.toggle("amk-paused", p);
      pauseVeil.hidden = !p;
      pauseBtn.textContent = p ? "▶ Play" : "⏸ Pause";
      pauseBtn.setAttribute("aria-label", p ? "Play again" : "Pause");
      lanterns.forEach(function (l) { if (!l.dying) { l.el.disabled = p; } });
      if (p) { stopLoop(); say("hint", "Paused. Take your time."); try { pauseVeil.lastChild.focus({ preventScroll: true }); } catch (e) { /* ignore */ } }
      else { startLoop(); say("hint", "Back to it!"); }
    }
    function onVis() { if (document.hidden) { stopLoop(); } else { startLoop(); } }
    function onResize() {
      measure();
      lanterns.forEach(function (l) { size(l); place(l); });
    }
    document.addEventListener("visibilitychange", onVis);
    window.addEventListener("resize", onResize);
    window.addEventListener("orientationchange", onResize);
    if (window.ResizeObserver) { try { ro = new ResizeObserver(onResize); ro.observe(stage); } catch (e) { ro = null; } }

    /* ---------- finish ---------- */
    function finishGame() {
      finished = true; busy = true; stopLoop(); clearLanterns();
      if (pending) { award(pending, "last line"); pending = 0; }
      stage.classList.add("amk-finished");
      if (pauseBtn) { pauseBtn.disabled = true; }
      speedBtn.disabled = true;
      progEl.textContent = "All 31 words!"; barFill.style.width = "100%";
      var msg = "You caught the whole prayer! " + first + " of 31 on the first try.";
      say("good", msg);
      var deco = h("div", { class: "amk-deco", "aria-hidden": "true" });
      for (var k = 0; k < 6; k++) { deco.appendChild(h("i", { class: "amk-dlantern", style: "left:" + (8 + k * 16) + "%;animation-delay:" + (k * 0.7).toFixed(1) + "s" })); }
      var btn = h("button", { type: "button", class: "qk-btn qk-btn-primary amk-results", onclick: function () {
        var note = "You caught all 31 words in order. " + first + " on the first try. Best streak: " + best + ".";
        try { ctx.done({ title: "Lantern catch", correct: first, total: N, points: points, note: note }); } catch (e) { /* ignore */ }
      } }, "See results");
      stage.appendChild(h("div", { class: "amk-finale" }, deco, h("p", { class: "amk-finale-t" }, "🏮 31 of 31!"), btn));
      try { if (!ctx.reduced && !(mq && mq.matches)) { QuestKit.celebrate("Lantern catch complete. You caught all 31 words."); } else { QuestKit.announce("Lantern catch complete. You caught all 31 words."); } } catch (e) { /* ignore */ }
      later(function () { try { btn.focus({ preventScroll: true }); } catch (e) { /* ignore */ } }, 60);
    }

    /* ---------- go ---------- */
    paintSpeed(); hud(false);
    if (pauseBtn) { pauseBtn.textContent = "⏸ Pause"; pauseBtn.setAttribute("aria-label", "Pause"); }
    say("hint", moving ? "Tap the lantern with the next word of the prayer." : "Tap the button with the next word of the prayer.");
    measure(); startRound();

    return { destroy: function () {
      if (dead) { return; }
      dead = true; stopLoop();
      timers.forEach(function (t) { clearTimeout(t); }); timers = [];
      document.removeEventListener("visibilitychange", onVis);
      window.removeEventListener("resize", onResize);
      window.removeEventListener("orientationchange", onResize);
      if (ro) { try { ro.disconnect(); } catch (e) { /* ignore */ } ro = null; }
      try { ctx.speech && ctx.speech.stop && ctx.speech.stop(); } catch (e) { /* ignore */ }
      if (root.parentNode) { root.parentNode.removeChild(root); }
    } };
  };
})();

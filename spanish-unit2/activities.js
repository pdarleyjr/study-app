/* Spanish Quest: ¿Cómo vivimos? — the four mission activities (SU_ACT).
   app.js calls SU_ACT.run(type, mission, ctx). ctx gives: mount (element), data, UI, ART, ENG, speech,
   run(opts) (the shared question runner; every answer goes through SU_ENGINE.recordAnswer) and finish(primaryAnswers). */
(function () {
  "use strict";

  var QK = window.QuestKit;
  function arr(x) { return Array.isArray(x) ? x : []; }
  function by(list, id) { return arr(list).filter(function (x) { return x && x.id === id; })[0] || null; }
  function h() { return QK.h.apply(null, arguments); }

  /* Put a heading + one short line above a sub-mount for the runner. */
  function layout(ctx, title, text) {
    var sub = h("div", { class: "su-act-run" });
    ctx.mount.innerHTML = "";
    ctx.mount.appendChild(h("section", { class: "su-act-intro" }, h("h3", null, title), text ? h("p", null, text) : null));
    ctx.mount.appendChild(sub);
    return sub;
  }

  /* Run a list of question ids / objects; call next(primaryAnswers) when done (or at once if the list is empty). */
  function phase(ctx, list, opts, next) {
    var qs = arr(list);
    if (!qs.length) { next([]); return; }
    opts.questions = qs;
    opts.onDone = function (all, primary) { next(primary); };
    ctx.run(opts);
  }

  function art(ctx, spec, o) { try { return ctx.ART.render(spec, o || {}); } catch (e) { return ""; } }
  function placeLabel(ctx, id) {
    var D = ctx.data;
    if (typeof D.withArticle === "function") { try { return D.withArticle(id); } catch (e) { /* fall back */ } }
    var p = by(D.PLACES, id);
    return p ? (p.article ? p.article + " " : "") + p.es : String(id);
  }

  /* ---------- 1. Neighborhood map ---------- */
  function exploreMap(ctx, done) {
    var D = ctx.data, UI = ctx.UI, SP = ctx.speech;
    var seen = {}, count = 0, NEED = 5;
    var info = h("div", { class: "qk-panel su-explore-info", "aria-live": "polite" }, h("p", null, "Tap a building to see its name."));
    var counter = h("p", { class: "su-explore-count" });
    var go = h("button", { type: "button", class: "qk-btn qk-btn-primary", disabled: true }, "Start the map tasks →");
    var skip = h("button", { type: "button", class: "qk-btn qk-btn-ghost" }, "Skip");
    var board = UI.mapBoard({ map: D.MAP, places: D.PLACES, labels: true, interactive: true, onPick: pick });

    function paintCount() {
      counter.textContent = count >= NEED ? "Buildings explored: " + count + " ✓" : "Buildings explored: " + count + " of " + NEED;
      go.disabled = count < NEED;
    }
    function pick(id) {
      var p = by(D.PLACES, id);
      if (!p) { return; }
      if (!seen[id]) { seen[id] = true; count++; }
      board.mark(id, "selected");
      var name = placeLabel(ctx, id);
      info.innerHTML = "";
      info.appendChild(h("p", { class: "su-explore-name" }, h("b", null, name), " — ", p.en || ""));
      if (p.need) { info.appendChild(h("p", null, "You go here for: ", h("i", null, p.need), p.needEn ? " (" + p.needEn + ")" : "")); }
      if (SP && SP.canSpeak()) {
        info.appendChild(h("button", { type: "button", class: "qk-btn qk-btn-ghost", "aria-label": "Hear " + name, onclick: function () { SP.say(name); } }, "🔊 Listen"));
      }
      paintCount();
    }
    go.addEventListener("click", done);
    skip.addEventListener("click", done);
    ctx.mount.innerHTML = "";
    ctx.mount.appendChild(h("section", { class: "su-act-intro" }, h("h3", null, "Explore the neighborhood"),
      h("p", null, "Tap at least " + NEED + " buildings to learn their names. Then we use the map.")));
    ctx.mount.appendChild(board.el);
    ctx.mount.appendChild(info);
    ctx.mount.appendChild(counter);
    ctx.mount.appendChild(h("div", { class: "qk-row" }, go, skip));
    paintCount();
  }

  function runMap(m, ctx) {
    var act = m.activity || {};
    function tasks() {
      var sub = layout(ctx, "Map tasks", "Use the map. Left and right are as you look at it.");
      phase(ctx, act.tasks, { title: "Map", mount: sub }, function (primary) { ctx.finish(primary); });
    }
    if (act.explore === false) { tasks(); } else { exploreMap(ctx, tasks); }
  }

  /* ---------- 2. Closet ---------- */
  function runCloset(m, ctx) {
    var sub = layout(ctx, "Open the closet", "Look closely. In Spanish the color word matches the clothing word: camisa roja, pantalón rojo.");
    phase(ctx, (m.activity || {}).tasks, { title: "Closet", mount: sub }, function (primary) { ctx.finish(primary); });
  }

  /* ---------- 3. Clean-up crew ---------- */
  function runCleanup(m, ctx) {
    var sub = layout(ctx, "Clean-up time", "Look at each scene, then pick the best tool, action or clothes.");
    phase(ctx, (m.activity || {}).tasks, { title: "Clean-up", mount: sub }, function (primary) { ctx.finish(primary); });
  }

  /* ---------- 4. ESTAR lab ---------- */
  var PERSON_ART = ["yo", "tu", "el", "ella", "usted", "nosotros", "nosotras", "ellos", "ellas", "ustedes"];
  function personArt(ctx, subjectId) {
    if (PERSON_ART.indexOf(subjectId) >= 0) { return subjectId; }
    var s = by(ctx.data.SUBJECTS, subjectId);
    if (s && s.key) { return s.key === "ellos" ? "ellos" : s.key; }
    return "el";
  }

  function runEstarLab(m, ctx) {
    var D = ctx.data, UI = ctx.UI, SP = ctx.speech, act = m.activity || {};
    var rounds = arr(act.rounds), collected = [];
    function say(t) { if (SP && SP.canSpeak()) { SP.say(t); } }
    function chartNode() {
      return UI.estarChart({ rows: D.ESTAR, highlight: null, onSay: SP && SP.canSpeak() ? say : undefined });
    }

    function nextRound(ri) {
      if (ri >= rounds.length) { return tasks(); }
      var r = rounds[ri];
      var qs = ctx.ENG.estarRound(D, r).map(function (q, i) {
        var o = {}, k;
        for (k in q) { if (Object.prototype.hasOwnProperty.call(q, k)) { o[k] = q[k]; } }
        o._subject = r.subjects[i]; o._place = r.place; o._round = ri;
        return o;
      });
      var sub = layout(ctx, "Round " + (ri + 1) + " of " + rounds.length + ": " + placeLabel(ctx, r.place),
        "Who is it? Where are they? The person changes every time, so the form of ESTAR changes too.");
      phase(ctx, qs, {
        title: "ESTAR lab " + (ri + 1), mount: sub, requeue: false,
        visualFor: function (q) {
          if (!q._subject) { return null; }
          return h("div", { class: "su-estar-scene", style: "display:flex;gap:12px;justify-content:center;align-items:center;flex-wrap:wrap" },
            h("div", { style: "flex:1 1 120px;max-width:200px", html: art(ctx, { kind: "person", id: personArt(ctx, q._subject) }) }),
            h("div", { style: "flex:1 1 120px;max-width:200px", html: art(ctx, { kind: "place", id: q._place }) }));
        },
        extraFor: function (q, api) {
          if (!q._subject) { return null; }
          if (ri === 0) { return h("div", { class: "su-estar-chart" }, chartNode()); }
          var holder = h("div", { class: "su-peek" }), opened = false;
          var b = h("button", { type: "button", class: "qk-btn qk-btn-ghost", "aria-expanded": "false" }, "Peek at the chart (counts as a hint)");
          b.addEventListener("click", function () {
            if (opened) { return; }
            opened = true; api.useHint();
            holder.appendChild(chartNode());
            b.setAttribute("aria-expanded", "true"); b.textContent = "Chart is open";
          });
          holder.appendChild(b);
          return holder;
        }
      }, function (primary) { collected = collected.concat(primary); nextRound(ri + 1); });
    }

    function tasks() {
      var sub = layout(ctx, "Who works where?", "Workers, places and ESTAR together.");
      phase(ctx, act.tasks, { title: "Community", mount: sub }, function (primary) { ctx.finish(collected.concat(primary)); });
    }
    nextRound(0);
  }

  var RUNNERS = { map: runMap, closet: runCloset, cleanup: runCleanup, "estar-lab": runEstarLab };

  window.SU_ACT = {
    types: Object.keys(RUNNERS),
    run: function (type, mission, ctx) {
      var fn = RUNNERS[type];
      if (!fn) { throw new Error("unknown activity"); }
      fn(mission, ctx);
    }
  };
})();

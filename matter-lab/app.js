/* Matter Lab rendering: particle engine, four lab stations (Part A) and the Science Challenge (Part B). */
(function () {
  "use strict";
  var QK = window.QuestKit, D = window.MatterLabData;
  var h = QK.h;
  var KEY = "studyquest:matter-lab:v1";
  var st = QK.store(KEY);
  var app = document.getElementById("app");
  var homeLink = document.getElementById("ml-home");
  var current = { dispose: null };
  var lessonView = null; // station id or "recap"
  var debug = window.__matterLab = { frames: 0, running: false, engines: 0 };

  function lessonDone() { return (st.get().lesson) || {}; }
  function markDone(id) { st.update(function (d) { d.lesson = d.lesson || {}; d.lesson[id] = true; return d; }); }
  function best() { var q = (st.get().quiz || {}).challenge; return q ? q.best : null; }

  /* =============== particle engine (canvas, rAF, pauses when hidden) =============== */
  var COLORS = { solid: "#2f6fdb", liquid: "#0f8a7a", gas: "#e46a12" };
  var BASE_SPEED = { liquid: 42, gas: 170 };
  var R = 5, COLS = 6;

  function Engine(canvas, W, H, N, getCfg) {
    var ctx = canvas.getContext("2d"), ps = [], t = 0, raf = 0, last = 0, running = false, lastState = null, scale = 1, destroyed = false;
    var mq = window.matchMedia ? window.matchMedia("(prefers-reduced-motion: reduce)") : null;
    function reduced() { return QK.reducedMotion(); }
    var c0 = getCfg();
    for (var i = 0; i < N; i++) {
      var a = Math.random() * 6.283;
      ps.push({ x: c0.box.x + R + Math.random() * (c0.box.w - 2 * R), y: c0.box.y + R + Math.random() * (c0.box.h - 2 * R), vx: Math.cos(a), vy: Math.sin(a), hx: 0, hy: 0, ph: Math.random() * 6.283 });
    }
    function resize() {
      var rect = canvas.getBoundingClientRect(); if (!rect.width) return;
      var dpr = Math.min(window.devicePixelRatio || 1, 2);
      canvas.width = Math.round(rect.width * dpr); canvas.height = Math.round(rect.width * H / W * dpr);
      scale = canvas.width / W; if (!running) draw();
    }
    function homes(cfg) {
      var rows = Math.ceil(N / COLS), x0 = cfg.block.cx - (COLS - 1) * 13 / 2, yb = cfg.block.floor - 7;
      ps.forEach(function (p, i) { p.hx = x0 + (i % COLS) * 13; p.hy = yb - (rows - 1 - Math.floor(i / COLS)) * 13; });
    }
    function step(dt, cfg) {
      var s = cfg.state, k;
      if (s !== lastState) { if (s === "solid") homes(cfg); lastState = s; }
      if (s === "solid") {
        k = Math.min(1, 8 * dt);
        ps.forEach(function (p) { p.x += (p.hx - p.x) * k; p.y += (p.hy - p.y) * k; });
        return;
      }
      var reg = s === "gas" ? cfg.box : cfg.liquid, target = BASE_SPEED[s] * cfg.speed;
      var minx = reg.x + R, maxx = reg.x + reg.w - R, miny = reg.y + R, maxy = reg.y + reg.h - R;
      ps.forEach(function (p) {
        var sp = Math.hypot(p.vx, p.vy);
        if (sp < 0.01) { var a = Math.random() * 6.283; p.vx = Math.cos(a); p.vy = Math.sin(a); sp = 1; }
        if (s === "liquid") { p.vx += (Math.random() - 0.5) * 500 * dt; p.vy += (Math.random() - 0.5) * 500 * dt; sp = Math.hypot(p.vx, p.vy) || 1; }
        var ns = sp + (target - sp) * Math.min(1, 4 * dt);
        p.vx *= ns / sp; p.vy *= ns / sp;
        p.x += p.vx * dt; p.y += p.vy * dt;
        var pull = Math.min(1, 6 * dt);
        if (p.x < minx) { p.x += (minx - p.x) * pull; if (p.vx < 0) p.vx = -p.vx; }
        if (p.x > maxx) { p.x += (maxx - p.x) * pull; if (p.vx > 0) p.vx = -p.vx; }
        if (p.y < miny) { p.y += (miny - p.y) * pull; if (p.vy < 0) p.vy = -p.vy; }
        if (p.y > maxy) { p.y += (maxy - p.y) * pull; if (p.vy > 0) p.vy = -p.vy; }
      });
      if (s === "liquid") { // keep liquid particles from piling on top of each other
        for (var i = 0; i < ps.length; i++) for (var j = i + 1; j < ps.length; j++) {
          var dx = ps[j].x - ps[i].x, dy = ps[j].y - ps[i].y, d2 = dx * dx + dy * dy, m = 2 * R;
          if (d2 < m * m && d2 > 0.01) { var d = Math.sqrt(d2), o = (m - d) / 2 / d; ps[i].x -= dx * o; ps[i].y -= dy * o; ps[j].x += dx * o; ps[j].y += dy * o; }
        }
      }
    }
    function arrow(x, y, vx, vy, len) {
      var sp = Math.hypot(vx, vy) || 1, ux = vx / sp, uy = vy / sp, ex = x + ux * len, ey = y + uy * len;
      ctx.beginPath(); ctx.moveTo(x + ux * R, y + uy * R); ctx.lineTo(ex, ey);
      ctx.moveTo(ex, ey); ctx.lineTo(ex - ux * 5 - uy * 3, ey - uy * 5 + ux * 3);
      ctx.moveTo(ex, ey); ctx.lineTo(ex - ux * 5 + uy * 3, ey - uy * 5 - ux * 3); ctx.stroke();
    }
    function draw() {
      var cfg = getCfg(), still = reduced(), tt = still ? 0 : t;
      ctx.setTransform(scale, 0, 0, scale, 0, 0); ctx.clearRect(0, 0, W, H);
      if (cfg.back) cfg.back(ctx, tt, still);
      var vib = cfg.state === "solid" ? 1.3 * cfg.speed : 0, col = COLORS[cfg.state];
      ctx.fillStyle = col;
      ps.forEach(function (p) {
        var x = p.x + (vib ? Math.sin(tt * 28 + p.ph) * vib : 0), y = p.y + (vib ? Math.cos(tt * 31 + p.ph * 2) * vib : 0);
        ctx.beginPath(); ctx.arc(x, y, R, 0, 6.283); ctx.fill();
      });
      if (cfg.arrows || still) {
        ctx.strokeStyle = "#18264b"; ctx.lineWidth = 1.6; ctx.lineCap = "round";
        ps.forEach(function (p, i) {
          if (cfg.state === "solid") { if (i % 2) return; ctx.beginPath(); ctx.moveTo(p.x - 7, p.y); ctx.lineTo(p.x - 5, p.y); ctx.moveTo(p.x + 5, p.y); ctx.lineTo(p.x + 7, p.y); ctx.stroke(); }
          else if (cfg.state === "liquid") { if (i % 2) return; arrow(p.x, p.y, p.vx, p.vy, 11); }
          else arrow(p.x, p.y, p.vx, p.vy, 24);
        });
      }
      if (cfg.front) cfg.front(ctx, tt, still);
    }
    function frame(ts) {
      if (!running) return;
      var dt = Math.min(0.05, (ts - last) / 1000); last = ts; t += dt;
      step(dt, getCfg()); draw(); debug.frames++;
      raf = requestAnimationFrame(frame);
    }
    function start() { if (running || destroyed || reduced() || document.hidden) return; running = true; debug.running = true; last = performance.now(); raf = requestAnimationFrame(frame); }
    function stop() { running = false; debug.running = false; cancelAnimationFrame(raf); }
    function settle() { var cfg = getCfg(); lastState = null; for (var i = 0; i < 150; i++) step(1 / 30, cfg); draw(); }
    function refresh() { // call after the config changed
      if (reduced()) { stop(); settle(); } else { start(); }
    }
    function vis() { if (document.hidden) stop(); else if (!reduced()) start(); }
    function mqChange() { refresh(); }
    document.addEventListener("visibilitychange", vis);
    if (mq && mq.addEventListener) mq.addEventListener("change", mqChange);
    var ro = window.ResizeObserver ? new ResizeObserver(resize) : null; if (ro) ro.observe(canvas); else window.addEventListener("resize", resize);
    resize(); debug.engines++;
    refresh();
    return {
      refresh: refresh, settle: settle, stop: stop, redraw: function () { if (!running) draw(); },
      destroy: function () { destroyed = true; stop(); document.removeEventListener("visibilitychange", vis); if (mq && mq.removeEventListener) mq.removeEventListener("change", mqChange); if (ro) ro.disconnect(); else window.removeEventListener("resize", resize); debug.engines--; }
    };
  }

  function openTop(ctx, x, y, w, hgt, line) { // container with an open top
    ctx.beginPath(); ctx.moveTo(x, y); ctx.lineTo(x, y + hgt - 8); ctx.quadraticCurveTo(x, y + hgt, x + 8, y + hgt);
    ctx.lineTo(x + w - 8, y + hgt); ctx.quadraticCurveTo(x + w, y + hgt, x + w, y + hgt - 8); ctx.lineTo(x + w, y);
    ctx.lineWidth = line || 4; ctx.strokeStyle = "#173c6b"; ctx.lineJoin = "round"; ctx.lineCap = "round"; ctx.stroke();
  }

  /* =============== small UI helpers =============== */
  function seg(label, pressed, onclick, extra) { return h("button", { type: "button", class: "ml-seg", "aria-pressed": pressed ? "true" : "false", onclick: onclick }, label); }
  function setPressed(btns, idxOrFn) { btns.forEach(function (b, i) { b.setAttribute("aria-pressed", (typeof idxOrFn === "function" ? idxOrFn(i) : i === idxOrFn) ? "true" : "false"); }); }

  /* one-tap "check for understanding" prompt; calls onCorrect once */
  function checkPrompt(o) {
    var fb = h("div", { class: "ml-fb", role: "status", "aria-live": "polite" });
    var finished = false;
    var opts = h("div", { class: "ml-opts", role: "group", "aria-label": "Answer choices" });
    o.choices.forEach(function (c, i) {
      var b = h("button", { type: "button", class: "ml-opt" }, c);
      b.addEventListener("click", function () {
        if (finished) return;
        if (i === o.answer) {
          finished = true; b.classList.add("is-right");
          Array.prototype.forEach.call(opts.children, function (x) { x.disabled = true; });
          fb.className = "ml-fb is-right"; fb.textContent = "✅ Yes! " + o.explain;
          QK.celebrate("Correct. Station complete."); if (o.onCorrect) o.onCorrect();
        } else {
          b.classList.add("is-wrong"); b.disabled = true;
          fb.className = "ml-fb is-wrong"; fb.textContent = "💡 Not quite. Look at the lab above and try another answer. Hint: " + o.hint;
        }
      });
      opts.appendChild(b);
    });
    return h("section", { class: "ml-check", "aria-label": "Check your understanding" }, h("h3", null, "✅ Quick check"), h("p", null, o.prompt), opts, fb);
  }

  /* =============== Station 1: Particle Explorer =============== */
  function stationParticles(host, onDone) {
    var S = { mode: "solid", container: "jar", arrows: false };
    var geo = {
      jar: { box: { x: 125, y: 30, w: 110, h: 250 }, liquid: { x: 125, y: 170, w: 110, h: 110 } },
      dish: { box: { x: 70, y: 155, w: 220, h: 125 }, liquid: { x: 70, y: 225, w: 220, h: 55 } }
    };
    var canvas = h("canvas", { class: "ml-canvas", width: 360, height: 300, role: "img", "aria-label": "Animated box of particles. A text description is below." });
    function cfg() {
      var g = geo[S.container];
      return { state: S.mode, box: g.box, liquid: g.liquid, speed: 1, arrows: S.arrows, block: { cx: g.box.x + g.box.w / 2, floor: g.box.y + g.box.h - 3 },
        back: function (ctx, t, still) {
          var b = g.box, l = g.liquid;
          if (S.mode === "liquid") { ctx.fillStyle = "rgba(15,138,122,.16)"; ctx.fillRect(l.x, l.y, l.w, l.h); ctx.setLineDash([6, 5]); ctx.strokeStyle = "#0a5c51"; ctx.lineWidth = 2; ctx.beginPath(); ctx.moveTo(l.x, l.y); ctx.lineTo(l.x + l.w, l.y); ctx.stroke(); ctx.setLineDash([]); }
          if (S.mode === "gas") { ctx.fillStyle = "rgba(228,106,18,.09)"; ctx.fillRect(b.x, b.y, b.w, b.h); }
          if (S.mode === "solid") { var rows = Math.ceil(40 / COLS), bw = COLS * 13 + 4, bh = rows * 13 + 4, cx = b.x + b.w / 2, fl = b.y + b.h - 3; ctx.fillStyle = "rgba(47,111,219,.14)"; ctx.strokeStyle = "#1d4ea3"; ctx.lineWidth = 2; ctx.beginPath(); ctx.roundRect ? ctx.roundRect(cx - bw / 2, fl - bh, bw, bh, 6) : ctx.rect(cx - bw / 2, fl - bh, bw, bh); ctx.fill(); ctx.stroke(); }
          openTop(ctx, b.x, b.y, b.w, b.h);
        } };
    }
    var eng = Engine(canvas, 360, 300, 40, cfg);
    var rows = {};
    var props = h("dl", { class: "ml-props" });
    [["shape", "Shape?"], ["volume", "Volume?"], ["spacing", "Particle spacing?"], ["motion", "Particle motion?"]].forEach(function (r) {
      var dd = h("dd"); rows[r[0]] = dd; props.appendChild(h("div", null, h("dt", null, r[1]), dd));
    });
    var live = h("p", { class: "ml-live", "aria-live": "polite" });
    var memory = h("div", { class: "ml-memory", "aria-label": "Memory trick" });
    var memSpans = ["solid", "liquid", "gas"].map(function (k) { var s = h("span", null, D.STATES[k].label.toUpperCase() + " = " + D.STATES[k].memory); memory.appendChild(s); return s; });
    var note = h("p", { class: "ml-note" });
    function paint(announce) {
      var s = D.STATES[S.mode];
      rows.shape.textContent = s.shape; rows.volume.textContent = s.volume; rows.spacing.textContent = s.spacing; rows.motion.textContent = s.motion;
      memSpans.forEach(function (m, i) { m.classList.toggle("is-on", ["solid", "liquid", "gas"][i] === S.mode); });
      var cont = S.container === "jar" ? "tall jar" : "wide dish", text = s.live;
      if (S.mode === "liquid") text += " It is in the " + cont + ": the level is " + (S.container === "jar" ? "tall and narrow" : "low and wide") + ", but the amount of liquid is the same.";
      if (S.mode === "gas") text += " It fills the " + cont + ".";
      if (S.mode === "solid") text += " The solid keeps the same shape in the " + cont + ".";
      live.textContent = text;
      note.textContent = QK.reducedMotion() ? "Reduced motion is on, so you see a still picture. The arrows show how the particles move." : (S.arrows ? "Arrows show the direction each particle is moving." : "");
      canvas.setAttribute("aria-label", "Particle box, " + s.label + " in a " + cont + ". " + s.spacing + ". " + s.motion + ".");
      eng.refresh();
    }
    var modeBtns = ["solid", "liquid", "gas"].map(function (k) { return seg(D.STATES[k].label, k === S.mode, function () { S.mode = k; setPressed(modeBtns, function (i) { return ["solid", "liquid", "gas"][i] === k; }); paint(); }); });
    var contBtns = [["jar", "Tall jar"], ["dish", "Wide dish"]].map(function (c) { return seg(c[1], c[0] === S.container, function () { S.container = c[0]; setPressed(contBtns, function (i) { return ["jar", "dish"][i] === c[0]; }); paint(); }); });
    var arrowBtn = seg("Show motion arrows", false, function () { S.arrows = !S.arrows; arrowBtn.setAttribute("aria-pressed", S.arrows ? "true" : "false"); paint(); });
    if (QK.reducedMotion()) arrowBtn.hidden = true;
    host.appendChild(h("p", { class: "ml-lead" }, "Everything is made of tiny particles. How close they are, and how they move, decides whether matter is a solid, a liquid or a gas. Pick a state and watch. Then switch the container to see what changes and what stays the same."));
    host.appendChild(h("div", { class: "ml-stage" },
      h("div", null, h("div", { class: "ml-canvas-wrap" }, canvas),
        h("div", { class: "ml-toggle", role: "group", "aria-label": "State of matter" }, h("span", { class: "ml-tlabel" }, "State:"), modeBtns),
        h("div", { class: "ml-toggle", role: "group", "aria-label": "Container" }, h("span", { class: "ml-tlabel" }, "Container:"), contBtns, arrowBtn)),
      h("div", null, props, memory, live, note)));
    host.appendChild(h("p", { class: "ml-note" }, "Try it: choose Liquid, then switch between the jar and the dish. The liquid level changes, but the amount of liquid does not. Then try Gas."));
    host.appendChild(checkPrompt({
      prompt: "Which state has particles that slide past each other and rest at the bottom of the container?",
      choices: ["Solid", "Liquid", "Gas"], answer: 1,
      explain: "Liquid particles are close together but slide past each other, so a liquid flows, settles at the bottom, and takes the shape of its container.",
      hint: "Look at the Liquid button again. Which state fills only the bottom?", onCorrect: onDone
    }));
    paint();
    return function () { eng.destroy(); };
  }

  /* =============== Station 2: Heat & Cool Lab =============== */
  function stationHeat(host, onDone) {
    var L = { temp: D.LAB.start, shown: D.stateAt(D.LAB.start), boiling: false, dir: 0 };
    var seen = {}, boilTimer = null;
    var beaker = { box: { x: 110, y: 40, w: 140, h: 230 }, liquid: { x: 110, y: 180, w: 140, h: 90 } };
    var canvas = h("canvas", { class: "ml-canvas", width: 360, height: 300, role: "img", "aria-label": "Beaker of water" });
    function factor() { return 0.4 + (L.temp - D.LAB.min) / (D.LAB.max - D.LAB.min) * 1.6; }
    function cfg() {
      return { state: L.shown, box: beaker.box, liquid: beaker.liquid, speed: factor(), arrows: false, block: { cx: 180, floor: 267 },
        back: function (ctx, t, still) {
          var l = beaker.liquid, b = beaker.box;
          if (L.shown === "liquid") { ctx.fillStyle = "rgba(15,138,122,.16)"; ctx.fillRect(l.x, l.y, l.w, l.h); }
          if (L.shown === "gas") { ctx.fillStyle = "rgba(160,170,190,.18)"; ctx.fillRect(b.x, b.y, b.w, b.h); }
          if (L.shown === "solid") { var rows = Math.ceil(40 / COLS), bw = COLS * 13 + 4, bh = rows * 13 + 4; ctx.fillStyle = "rgba(190,225,255,.55)"; ctx.strokeStyle = "#1d4ea3"; ctx.lineWidth = 2; ctx.beginPath(); ctx.rect(180 - bw / 2, 267 - bh, bw, bh); ctx.fill(); ctx.stroke(); }
          openTop(ctx, b.x, b.y, b.w, b.h);
          ctx.strokeStyle = "rgba(23,60,107,.5)"; ctx.lineWidth = 2; [90, 140, 190].forEach(function (yy) { ctx.beginPath(); ctx.moveTo(b.x + b.w, yy); ctx.lineTo(b.x + b.w - 12, yy); ctx.stroke(); });
          ctx.font = "26px system-ui, sans-serif"; ctx.textAlign = "center"; ctx.fillStyle = "#000";
          if (L.dir > 0) ctx.fillText("🔥", 180, 296); else if (L.dir < 0) ctx.fillText("❄️", 180, 296);
        },
        front: function (ctx, t, still) {
          var l = beaker.liquid, i, y, x;
          ctx.strokeStyle = "#173c6b"; ctx.lineWidth = 2;
          if (L.boiling) { // bubbles all through the liquid
            for (i = 0; i < 9; i++) { x = l.x + 14 + (i * 37) % (l.w - 28); y = still ? l.y + l.h - 12 - (i * 23) % (l.h - 20) : l.y + l.h - 8 - ((t * 45 + i * 29) % (l.h - 6)); ctx.beginPath(); ctx.arc(x, y, 3 + i % 3, 0, 6.283); ctx.stroke(); }
          } else if (D.isEvaporating(L.temp) && L.shown === "liquid") { // slow escape at the surface only
            ctx.strokeStyle = "#0a5c51";
            for (i = 0; i < 3; i++) { x = l.x + 30 + i * 40; y = still ? l.y - 12 - i * 3 : l.y - ((t * 10 + i * 9) % 26); ctx.beginPath(); ctx.moveTo(x, y + 8); ctx.lineTo(x, y); ctx.moveTo(x - 3, y + 3); ctx.lineTo(x, y); ctx.lineTo(x + 3, y + 3); ctx.stroke(); }
          }
        } };
    }
    var eng = Engine(canvas, 360, 300, 40, cfg);
    var thermo = h("div", { class: "ml-thermo" });
    thermo.innerHTML = '<svg viewBox="0 0 96 260" role="img" aria-label="Thermometer"><rect x="26" y="14" width="18" height="206" rx="9" fill="#fff" stroke="#173c6b" stroke-width="3"/><rect id="ml-th" x="30" y="100" width="10" height="126" rx="5" fill="#d9480f"/><circle cx="35" cy="232" r="17" fill="#d9480f" stroke="#173c6b" stroke-width="3"/><g stroke="#173c6b" stroke-width="2"><line x1="46" y1="192" x2="56" y2="192"/><line x1="46" y1="54" x2="56" y2="54"/></g><g font-size="10" fill="#173c6b" font-weight="700"><text x="58" y="196">0°</text><text x="58" y="58">100°</text></g></svg>';
    var th = thermo.querySelector("#ml-th");
    var readout = h("p", { class: "ml-readout", "aria-live": "polite" });
    var stateLbl = h("p", { class: "ml-lead" });
    var energy = h("div", { class: "ml-energy", "aria-live": "polite" }, "Tap a button to add or remove heat energy.");
    var happening = h("div", { class: "ml-happening", "aria-live": "polite" }, h("strong", null, "Ready"), "The water is liquid at 20 °C. Add heat or remove heat and watch the particles.");
    var transList = h("ul", { class: "ml-trans", "aria-label": "State changes you have seen" });
    var transItems = {}; D.TRANSITION_ORDER.forEach(function (id) { var li = h("li", null, D.TRANSITIONS[id].label); transItems[id] = li; transList.appendChild(li); });
    var hint = h("p", { class: "ml-note" });
    function mark(id) { if (seen[id]) return; seen[id] = true; transItems[id].classList.add("is-seen"); transItems[id].setAttribute("aria-label", D.TRANSITIONS[id].label + ", seen"); }
    function describe(tr, energyDir) {
      var e = tr.energy === "in" ? "takes in energy" : "releases energy";
      happening.innerHTML = ""; happening.appendChild(h("strong", null, tr.label + ": " + tr.from + " → " + tr.to + " (" + e + ")")); happening.appendChild(document.createTextNode(tr.says + " Example: " + tr.example));
    }
    function paint(tr) {
      var shownT = L.temp;
      readout.innerHTML = "";
      readout.appendChild(document.createTextNode(shownT + " °C ")); readout.appendChild(h("small", null, "(" + D.toF(shownT) + " °F)"));
      var frac = (shownT - D.LAB.min) / (D.LAB.max - D.LAB.min), mh = 6 + frac * 194; th.setAttribute("y", String(226 - mh)); th.setAttribute("height", String(mh));
      stateLbl.innerHTML = "<strong>" + D.stateName(L.boiling ? "liquid" : L.shown) + "</strong> · it is still water (H₂O) in every state!";
      if (L.dir > 0) { energy.className = "ml-energy is-in"; energy.textContent = "🔥 Water is gaining energy → particles move faster → temperature goes up."; }
      else if (L.dir < 0) { energy.className = "ml-energy is-out"; energy.textContent = "❄️ Water is losing energy → particles move slower → temperature goes down."; }
      if (tr) { mark(tr.id); describe(tr); }
      else if (D.isEvaporating(L.temp) && L.shown === "liquid") { mark("evaporation"); happening.innerHTML = ""; happening.appendChild(h("strong", null, "Evaporation is happening (slowly, at the surface)")); happening.appendChild(document.createTextNode(D.TRANSITIONS.evaporation.says + " Example: " + D.TRANSITIONS.evaporation.example)); }
      hint.textContent = D.labNote(L.temp);
      var s = L.shown;
      canvas.setAttribute("aria-label", "Beaker: " + D.stateName(L.boiling ? "liquid" : s) + " at " + L.temp + " degrees Celsius." + (L.boiling ? " Bubbles are forming all through the water: boiling." : ""));
      eng.refresh();
    }
    function press(dir) {
      var r = D.labStep(L.temp, dir);
      if (!r.moved) { happening.innerHTML = ""; happening.appendChild(h("strong", null, dir > 0 ? "That's as hot as this lab goes" : "That's as cold as this lab goes")); happening.appendChild(document.createTextNode("Try the other button.")); return; }
      clearTimeout(boilTimer); L.boiling = false;
      L.temp = r.tempC; L.dir = dir; L.shown = r.to;
      if (r.transition && r.transition.id === "boiling") { L.shown = "liquid"; L.boiling = true; boilTimer = setTimeout(function () { L.boiling = false; L.shown = D.stateAt(L.temp); paint(null); happening.innerHTML = ""; happening.appendChild(h("strong", null, "All steam now")); happening.appendChild(document.createTextNode("The liquid water became a gas (water vapor). Same water, new state. Gas particles are far apart and zoom around.")); }, QK.reducedMotion() ? 600 : 2200); }
      paint(r.transition);
      if (Object.keys(seen).length >= 5 && !finished) { finished = true; }
    }
    var finished = false;
    var coolBtn = h("button", { type: "button", class: "qk-btn ml-btn-cool", onclick: function () { press(-1); } }, "❄️ Remove heat");
    var heatBtn = h("button", { type: "button", class: "qk-btn ml-btn-heat", onclick: function () { press(1); } }, "🔥 Add heat");
    var lab = h("div", { class: "ml-lab" }, h("div", { class: "ml-canvas-wrap" }, canvas), thermo);
    var cheat = h("details", { class: "qk-review" }, h("summary", null, "All 5 state changes (cheat sheet)"), h("ul", { class: "qk-review-list" },
      D.TRANSITION_ORDER.map(function (id) { var t = D.TRANSITIONS[id]; return h("li", null, h("strong", null, t.label + ": "), t.says + " (" + (t.energy === "in" ? "takes in energy" : "releases energy") + ")"); })));
    host.appendChild(h("p", { class: "ml-lead" }, "Temperature measures how fast the particles move. Add heat energy and they speed up. Take energy away and they slow down. Enough change, and the water switches state. It is always still water."));
    host.appendChild(h("div", { class: "ml-stage" },
      h("div", { role: "group", "aria-label": "Heat and cool lab", onkeydown: function (e) {
        if (e.key === "ArrowUp" || e.key === "+" || e.key === "=") { e.preventDefault(); press(1); }
        else if (e.key === "ArrowDown" || e.key === "-" || e.key === "_") { e.preventDefault(); press(-1); }
      } }, lab,
        h("div", { class: "ml-heat-btns" }, coolBtn, heatBtn),
        h("p", { class: "ml-kbd" }, "Keyboard: ↑ or + adds heat, ↓ or − removes heat. Each tap is 10 °C.")),
      h("div", null, readout, stateLbl, energy, happening, hint,
        h("p", { class: "ml-note" }, "Find all five state changes (water boils at 100 °C at normal, sea-level air pressure):"), transList, cheat)));
    host.appendChild(checkPrompt({
      prompt: "Water vapor touches a cold glass and turns into drops of water. Which state change is that?",
      choices: ["Melting", "Boiling", "Condensation"], answer: 2,
      explain: "A gas that releases enough energy condenses into a liquid, like dew or drops on a cold glass.",
      hint: "The vapor is a gas becoming a liquid. Remove heat in the lab to see it.", onCorrect: onDone
    }));
    paint(null);
    return function () { clearTimeout(boilTimer); eng.destroy(); };
  }

  /* =============== Station 3: Density Detective =============== */
  function cupSvg(it, filled) {
    return '<svg viewBox="0 0 84 100" aria-hidden="true"><path d="M10 8h64l-6 84H16z" fill="#fff" stroke="#173c6b" stroke-width="4" stroke-linejoin="round"/><path d="M13 26h58l-4.5 64H17.5z" fill="' + it.color + '" stroke="#173c6b" stroke-width="2"/><text x="42" y="60" text-anchor="middle" font-size="13" font-weight="800" fill="#173c6b">100</text><text x="42" y="75" text-anchor="middle" font-size="10" font-weight="800" fill="#173c6b">cm³</text></svg>';
  }
  function stationDensity(host, onDone) {
    var weighed = {}, shown = {}, stepN = 0;
    var cupsWrap = h("div", { class: "ml-cups" });
    var work = h("div", { class: "qk-panel" });
    var pickWrap = h("div");
    var massEls = {}, rowEls = {};
    D.DENSITY_ITEMS.forEach(function (it) {
      var mass = h("div", { class: "ml-mass", "aria-live": "polite" }, "?");
      var btn = h("button", { type: "button", class: "qk-btn qk-btn-ghost", onclick: function () { weighed[it.id] = true; mass.textContent = "Mass: " + it.mass + " g"; btn.disabled = true; btn.textContent = "Weighed ✓"; update(); } }, "⚖️ Weigh");
      massEls[it.id] = mass;
      var card = h("div", { class: "ml-cup" }, h("div", { html: cupSvg(it) }), h("div", null, h("h3", null, it.name), h("div", null, "Volume: 100 cm³"), mass, btn));
      cupsWrap.appendChild(card);
    });
    function allWeighed() { return D.DENSITY_ITEMS.every(function (i) { return weighed[i.id]; }); }
    var g = D.DENSITY_ITEMS[0];
    function update() {
      work.innerHTML = "";
      if (!allWeighed()) { work.appendChild(h("p", { class: "ml-note" }, "Weigh all three cups to unlock the math. (Weighed " + Object.keys(weighed).length + " of 3.)")); return; }
      work.appendChild(h("h3", null, "Density = mass ÷ volume"));
      work.appendChild(h("p", null, "Density tells you how much mass is packed into a space. Let's work out the gelatin together."));
      var steps = ["Step 1: Write the rule → density = mass ÷ volume", "Step 2: Put in the numbers → " + g.mass + " g ÷ " + g.volume + " cm³", "Step 3: Divide → " + g.mass + " ÷ " + g.volume + " = " + D.density(g.mass, g.volume).toFixed(2) + " g/cm³"];
      var ol = h("ol", { class: "ml-steps", "aria-live": "polite" });
      steps.slice(0, stepN).forEach(function (s, i) { ol.appendChild(h("li", { class: i === 2 ? "ml-eq" : "" }, s)); });
      work.appendChild(ol);
      if (stepN < 3) work.appendChild(h("button", { type: "button", class: "qk-btn qk-btn-primary", onclick: function () { stepN++; update(); } }, stepN === 0 ? "Show step 1" : "Show next step"));
      else {
        work.appendChild(h("p", null, "Now you try. Tap to check the other two:"));
        var row = h("div", { class: "qk-row" });
        D.DENSITY_ITEMS.slice(1).forEach(function (it) {
          if (shown[it.id]) row.appendChild(h("p", { class: "ml-eq" }, it.name + ": " + it.mass + " ÷ " + it.volume + " = " + D.density(it.mass, it.volume).toFixed(2) + " g/cm³"));
          else row.appendChild(h("button", { type: "button", class: "qk-btn qk-btn-ghost", onclick: function () { shown[it.id] = true; update(); } }, "Divide " + it.name + ": " + it.mass + " ÷ " + it.volume));
        });
        work.appendChild(row);
        if (D.DENSITY_ITEMS.slice(1).every(function (i) { return shown[i.id]; })) work.appendChild(buildPick());
      }
    }
    var pickDone = false;
    function buildPick() {
      if (!pickWrap.firstChild) {
        pickWrap.appendChild(checkPrompt({
          prompt: "Which cup is the MOST dense?", choices: D.DENSITY_ITEMS.map(function (i) { return i.name + " (" + D.density(i.mass, i.volume).toFixed(2) + ")"; }),
          answer: D.DENSITY_ITEMS.indexOf(D.mostDense(D.DENSITY_ITEMS)),
          explain: "Pudding is the most dense: 0.90 g/cm³ is the biggest number. It has the most mass in the same space (100 cm³).",
          hint: "The biggest density number wins. Compare 0.75, 0.90 and 0.50.", onCorrect: onDone
        }));
      }
      return pickWrap;
    }
    host.appendChild(h("p", { class: "ml-lead" }, "All three cups hold the same amount (100 cm³), but they do not feel the same. Weigh them to find out why. Mass is how much matter there is; volume is how much space it takes up."));
    host.appendChild(cupsWrap);
    host.appendChild(work);
    host.appendChild(h("div", { class: "qk-callout" }, "🏀🎳 A basketball and a bowling ball are about the same size (volume), but the bowling ball has more mass. So the bowling ball is more dense: more matter packed into the same space."));
    update();
    return function () {};
  }

  /* =============== Station 4: Matter Detective =============== */
  function stationDetective(host, onDone) {
    var idx = 0, firstTry = 0, answered = false, gotFirst = true;
    var card = h("div", { class: "ml-card", "aria-live": "polite" });
    function show() {
      card.innerHTML = ""; answered = false; gotFirst = true;
      if (idx >= D.DETECTIVE.length) {
        card.appendChild(h("h3", null, "🕵️ Case closed!"));
        card.appendChild(h("p", null, "You got " + firstTry + " of " + D.DETECTIVE.length + " on the first try. Read the tricky-facts cards below, then do the quick check."));
        card.appendChild(h("button", { type: "button", class: "qk-btn qk-btn-ghost", onclick: function () { idx = 0; firstTry = 0; show(); } }, "Play again"));
        return;
      }
      var c = D.DETECTIVE[idx], fb = h("div", { class: "ml-fb", role: "status", "aria-live": "polite" });
      var next = h("button", { type: "button", class: "qk-btn qk-btn-primary", hidden: true, onclick: function () { idx++; show(); } }, idx === D.DETECTIVE.length - 1 ? "Finish →" : "Next clue →");
      var opts = h("div", { class: "ml-opts", role: "group", "aria-label": "Answer choices" });
      c.options.forEach(function (o, i) {
        var b = h("button", { type: "button", class: "ml-opt" }, o);
        b.addEventListener("click", function () {
          if (answered) return;
          if (i === c.answer) { answered = true; if (gotFirst) firstTry++; b.classList.add("is-right"); Array.prototype.forEach.call(opts.children, function (x) { x.disabled = true; }); fb.className = "ml-fb is-right"; fb.textContent = "✅ " + c.fact; next.hidden = false; next.focus(); }
          else { gotFirst = false; b.classList.add("is-wrong"); b.disabled = true; fb.className = "ml-fb is-wrong"; fb.textContent = "💡 Not quite. Re-read the clue and try again."; }
        });
        opts.appendChild(b);
      });
      card.appendChild(h("p", { class: "ml-note" }, "Clue " + (idx + 1) + " of " + D.DETECTIVE.length));
      card.appendChild(h("div", { class: "ml-icon", "aria-hidden": "true" }, c.icon));
      card.appendChild(h("h3", null, c.name));
      card.appendChild(h("p", null, c.clue));
      card.appendChild(h("p", null, h("strong", null, c.ask)));
      card.appendChild(opts); card.appendChild(fb); card.appendChild(next);
    }
    var reveals = h("div", { class: "ml-reveals" });
    D.FACTS.forEach(function (f) {
      var ans = h("span", { hidden: true }, f.a);
      var b = h("button", { type: "button", class: "qk-reveal", "aria-expanded": "false" }, "❓ " + f.q, ans);
      b.addEventListener("click", function () { var open = b.getAttribute("aria-expanded") === "true"; b.setAttribute("aria-expanded", open ? "false" : "true"); ans.hidden = open; });
      reveals.appendChild(b);
    });
    host.appendChild(h("p", { class: "ml-lead" }, "Detectives use physical properties as clues: color, texture, odor, temperature, mass, volume, and state. Observing a physical property never changes the matter. Tap the answer for each clue."));
    host.appendChild(card);
    host.appendChild(h("h3", null, "Tricky facts (tap to reveal)"));
    host.appendChild(reveals);
    host.appendChild(checkPrompt({
      prompt: "A student smells an onion and feels sandpaper. What happened to the onion and the sandpaper?",
      choices: ["Nothing changed. Observing physical properties does not change matter.", "They turned into new substances.", "They lost mass."], answer: 0,
      explain: "Odor and texture are physical properties. You can observe them without changing the matter into something new.",
      hint: "Think about the first tricky fact.", onCorrect: onDone
    }));
    show();
    return function () {};
  }

  /* =============== Part A shell =============== */
  var STATION_FN = { particles: stationParticles, heat: stationHeat, density: stationDensity, detective: stationDetective };

  function renderLesson(view) {
    cleanup();
    var done = lessonDone();
    if (!view) { // open at the first unfinished station
      var first = D.STATIONS.filter(function (s) { return !done[s.id]; })[0];
      view = first ? first.id : "recap";
    }
    lessonView = view;
    app.innerHTML = "";
    var phases = D.STATIONS.map(function (s) { return { id: s.id, label: s.label, minutes: s.minutes, done: !!done[s.id] }; });
    phases.push({ id: "recap", label: "Big ideas", done: D.STATIONS.every(function (s) { return done[s.id]; }) });
    app.appendChild(h("p", { class: "qk-eyebrow", style: "background:var(--qk-accent);color:#fff;margin-top:6px" }, "Part A · Interactive Lab · about 10 minutes"));
    app.appendChild(QK.timer(10, { label: "Lab timer" }).el);
    app.appendChild(QK.phaseBar(phases, view, function (id) { renderLesson(id); }));
    var panel = h("section", { class: "qk-panel", "aria-labelledby": "ml-h" });
    app.appendChild(panel);
    var si = D.STATIONS.map(function (s) { return s.id; }).indexOf(view);
    if (view === "recap") {
      panel.appendChild(h("h2", { id: "ml-h", tabindex: "-1" }, "⭐ Big ideas"));
      panel.appendChild(h("ol", { class: "ml-ideas" }, D.BIG_IDEAS.map(function (t) { return h("li", null, t); })));
      var left = D.STATIONS.filter(function (s) { return !done[s.id]; });
      if (left.length) panel.appendChild(h("div", { class: "qk-callout" }, "Still to finish (answer the quick check): " + left.map(function (s) { return s.label; }).join(", ") + "."));
      else panel.appendChild(h("p", { class: "ml-done" }, "✓ All four stations complete. Nice work!"));
      panel.appendChild(h("div", { class: "qk-row" },
        h("a", { class: "qk-btn qk-btn-primary", href: "#challenge", onclick: function (e) { e.preventDefault(); go("challenge"); } }, "Go to the Science Challenge →"),
        left.length ? h("button", { type: "button", class: "qk-btn qk-btn-ghost", onclick: function () { renderLesson(left[0].id); } }, "Finish " + left[0].label) : null,
        h("a", { class: "qk-btn qk-btn-ghost", href: "../fifth-grade/" }, "Back to 5th grade")));
      focusHeading(); return;
    }
    var meta = D.STATIONS[si];
    panel.appendChild(h("h2", { id: "ml-h", tabindex: "-1" }, "Station " + (si + 1) + ": " + meta.label + (done[meta.id] ? "  ✓" : "")));
    var doneNote = h("p", { class: "ml-done", hidden: !done[meta.id] }, "✓ Station complete");
    panel.appendChild(doneNote);
    var body = h("div"); panel.appendChild(body);
    var dispose = STATION_FN[view](body, function () {
      markDone(view); doneNote.hidden = false;
      var bar = app.querySelector(".qk-phases"); if (bar) bar.replaceWith(QK.phaseBar(D.STATIONS.map(function (s) { return { id: s.id, label: s.label, minutes: s.minutes, done: !!lessonDone()[s.id] }; }).concat([{ id: "recap", label: "Big ideas", done: D.STATIONS.every(function (s) { return lessonDone()[s.id]; }) }]), view, function (id) { renderLesson(id); }));
      h2Update(meta, si);
    });
    current.dispose = dispose;
    var nextId = si < D.STATIONS.length - 1 ? D.STATIONS[si + 1].id : "recap";
    panel.appendChild(h("div", { class: "ml-nav" },
      si > 0 ? h("button", { type: "button", class: "qk-btn qk-btn-ghost", onclick: function () { renderLesson(D.STATIONS[si - 1].id); } }, "← Back") : h("span"),
      h("button", { type: "button", class: "qk-btn qk-btn-primary", onclick: function () { renderLesson(nextId); } }, si < D.STATIONS.length - 1 ? "Next station →" : "Big ideas →")));
    focusHeading();
  }
  function h2Update(meta, si) { var el = document.getElementById("ml-h"); if (el && !/✓/.test(el.textContent)) el.textContent = "Station " + (si + 1) + ": " + meta.label + "  ✓"; }
  function focusHeading() { var el = document.getElementById("ml-h"); if (el) el.focus({ preventScroll: true }); }

  /* =============== Part B =============== */
  function renderChallenge() {
    cleanup();
    app.innerHTML = "";
    app.appendChild(h("p", { class: "qk-eyebrow", style: "background:var(--qk-accent);color:#fff;margin-top:6px" }, "Part B · Science Challenge · about 15 minutes"));
    app.appendChild(QK.timer(15, { label: "Challenge timer" }).el);
    app.appendChild(h("p", { class: "ml-lead" }, D.CHALLENGE.length + " questions. Your score counts your first tries. If you miss some, you get a fix-it round."));
    var box = h("div", { id: "ml-quiz" }); app.appendChild(box);
    QK.runQuiz(box, D.CHALLENGE, {
      id: "matter-lab", storeKey: KEY, quizName: "challenge", title: "Science Challenge",
      reshuffle: function () { return D.CHALLENGE; },
      onFinish: function (result, panel) {
        var list = h("ul", { class: "ml-review" });
        var stationIds = [];
        D.CHALLENGE.forEach(function (q) { if (result.missed.indexOf(q.id) >= 0 && stationIds.indexOf(q.station) < 0) stationIds.push(q.station); });
        var wrap = h("section", { class: "ml-review-box" });
        if (stationIds.length) {
          wrap.appendChild(h("h3", null, "What to review"));
          stationIds.forEach(function (sid) {
            var s = D.STATIONS.filter(function (x) { return x.id === sid; })[0];
            list.appendChild(h("li", null, h("button", { type: "button", class: "qk-btn qk-btn-ghost", onclick: function () { go("lesson", sid); } }, "Review: " + s.label)));
          });
          wrap.appendChild(list);
        } else wrap.appendChild(h("p", { class: "ml-done" }, "✓ Nothing to review. You know this!"));
        wrap.appendChild(h("div", { class: "qk-row" }, h("a", { class: "qk-btn qk-btn-primary", href: "../fifth-grade/" }, "Back to 5th grade"), h("a", { class: "qk-btn qk-btn-ghost", href: "#", onclick: function (e) { e.preventDefault(); go("start"); } }, "Matter Lab home")));
        panel.appendChild(wrap);
      }
    });
  }

  /* =============== start screen + routing =============== */
  function renderStart() {
    cleanup(); app.innerHTML = "";
    var done = lessonDone(), n = D.STATIONS.filter(function (s) { return done[s.id]; }).length, b = best();
    app.appendChild(h("div", { class: "qk-grid2 ml-start" },
      h("section", { class: "qk-panel" }, h("span", { class: "qk-pill" }, "Part A · about 10 min"), h("h2", null, "Interactive Lab"),
        h("p", null, "Four short stations: explore particles, heat and cool water, solve a density mystery, and play Matter Detective."),
        h("p", { class: n === 4 ? "ml-done" : "ml-note" }, n === 4 ? "✓ All 4 stations done" : n + " of 4 stations done"),
        h("a", { class: "qk-btn qk-btn-primary", href: "#lesson" }, n ? "Continue the lab →" : "Start the lab →")),
      h("section", { class: "qk-panel" }, h("span", { class: "qk-pill" }, "Part B · about 15 min"), h("h2", null, "Science Challenge"),
        h("p", null, D.CHALLENGE.length + " questions on everything in the lab, with a fix-it round for any misses."),
        h("p", { class: b != null ? "ml-done" : "ml-note" }, b != null ? "Best score: " + b + "%" : "Not tried yet"),
        h("a", { class: "qk-btn qk-btn-primary", href: "#challenge" }, b != null ? "Try the challenge again →" : "Start the challenge →"))));
  }
  function cleanup() { if (current.dispose) { current.dispose(); current.dispose = null; } }

  function go(where, station) {
    var hash = where === "start" ? "" : where;
    if (station) lessonViewPending = station;
    if ((location.hash || "").replace("#", "") === hash) route(); else location.hash = hash;
  }
  var lessonViewPending = null;
  function route() {
    var hsh = (location.hash || "").replace("#", "");
    homeLink.hidden = !(hsh === "lesson" || hsh === "challenge");
    if (hsh === "lesson") { var v = lessonViewPending; lessonViewPending = null; renderLesson(v); }
    else if (hsh === "challenge") renderChallenge();
    else renderStart();
    window.scrollTo(0, 0);
  }
  homeLink.addEventListener("click", function (e) { e.preventDefault(); go("start"); });
  window.addEventListener("hashchange", route);
  function boot() { route(); }
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", boot); else boot();
})();

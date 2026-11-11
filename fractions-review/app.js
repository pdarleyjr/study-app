/* Fractions: Quick Review — rendering. Content and math live in data.js. */
(function () {
  "use strict";
  var QK = window.QuestKit, D = window.FractionsData;
  var main = document.getElementById("main");
  if (!QK || !D || !main) return;
  var h = QK.h, F = QK.frac, M = QK.mixed;
  var KEY = "studyquest:fractions-review:v1";
  var st = QK.store(KEY);
  var SVGNS = "http://www.w3.org/2000/svg";

  function svgEl(tag, attrs) {
    var el = document.createElementNS(SVGNS, tag);
    Object.keys(attrs || {}).forEach(function (k) { el.setAttribute(k, attrs[k]); });
    return el;
  }
  function phasesDone() { return (st.get().phases) || {}; }
  function markPhase(id) {
    st.update(function (d) { d.phases = Object.assign({}, d.phases, (function () { var o = {}; o[id] = true; return o; })()); return d; });
    drawBar();
  }
  // "3 2/3" style readout as html (whole number alone when there is no fraction)
  function mixedOrWhole(w, n, d) { return n === 0 ? String(w) : (w === 0 ? F(n, d) : M(w, n, d)); }
  function card(tag, title, kids) {
    return h("section", { class: "qk-panel fr-card", "aria-labelledby": "fr-h-" + tag },
      h("h2", { id: "fr-h-" + tag }, h("span", { class: "fr-tag", "aria-hidden": "true" }, tag), title), kids);
  }
  function readout() { return h("div", { class: "fr-readout", "aria-live": "polite" }); }
  function select(label, values, value, onchange, fmt) {
    var s = h("select", { "aria-label": label });
    values.forEach(function (v) { s.appendChild(h("option", { value: String(v), selected: v === value ? true : null }, fmt ? fmt(v) : String(v))); });
    s.addEventListener("change", function () { onchange(+s.value); });
    return s;
  }
  function range(label, min, max, value, oninput) {
    var r = h("input", { type: "range", min: min, max: max, value: value, step: 1, "aria-label": label });
    r.addEventListener("input", function () { oninput(+r.value); });
    return r;
  }

  /* ---------- hero art (original) ---------- */
  function heroArt() {
    var s = '<svg class="fr-hero-art qk-hero-art" viewBox="0 0 240 110" aria-hidden="true" focusable="false">';
    [[50, 4], [130, 4]].forEach(function (c) {
      for (var i = 0; i < 3; i++) s += '<path d="' + D.wedgePath(c[0], 55, 40, 3, i) + '" fill="' + (c[1] === 4 && c[0] === 130 && i > 1 ? "rgba(255,255,255,.15)" : "#ffb354") + '" stroke="#fff" stroke-width="3" stroke-linejoin="round"/>';
    });
    s += '<path d="' + D.wedgePath(210, 55, 26, 4, 0) + '" fill="#ffb354" stroke="#fff" stroke-width="3"/>';
    [1, 2, 3].forEach(function (i) { s += '<path d="' + D.wedgePath(210, 55, 26, 4, i) + '" fill="rgba(255,255,255,.15)" stroke="#fff" stroke-width="3" stroke-linejoin="round"/>'; });
    return s + "</svg>";
  }

  /* ---------- page frame ---------- */
  var barSlot = h("div"), timerSlot = h("div", { class: "fr-timer" });
  var panes = {};
  var current = "homework";

  function drawBar() {
    var done = phasesDone();
    var list = D.PHASES.map(function (p) { return { id: p.id, label: p.label, minutes: p.minutes, done: p.id === "finish" ? !!done.quiz : !!done[p.id] }; });
    barSlot.innerHTML = "";
    barSlot.appendChild(QK.phaseBar(list, current, show));
  }
  function show(id) {
    current = id;
    D.PHASES.forEach(function (p) { panes[p.id].hidden = p.id !== id; });
    var p = D.PHASES.filter(function (x) { return x.id === id; })[0];
    timerSlot.innerHTML = "";
    timerSlot.appendChild(QK.timer(p.minutes, { label: p.label + " timer (optional)" }).el);
    if (id === "finish") renderFinish();
    drawBar();
    QK.announce("Step: " + p.label);
    var hd = panes[id].querySelector("h2");
    if (hd) { hd.setAttribute("tabindex", "-1"); hd.focus({ preventScroll: true }); }
    if (panes[id].scrollIntoView) panes[id].scrollIntoView({ block: "start", behavior: QK.reducedMotion() ? "auto" : "smooth" });
  }

  /* ---------- 1. Check my homework ---------- */
  function buildHomework() {
    var sec = h("section", { id: "step-homework" });
    var intro = h("div", { class: "qk-panel" },
      h("h2", null, "Check my homework"),
      h("p", { class: "fr-hw-note" }, "Open the worksheet photo below. Zoom in to read the small red numbers."),
      h("ol", { class: "fr-steps" },
        h("li", null, "The red answers are for the ", h("strong", null, "odd problems"), ": 1, 3, 5 … 41."),
        h("li", null, "Compare each of your odd answers. If one is different, fix it with a pencil."),
        h("li", null, "Look at ", h("em", null, "how"), " the red answer was found: whole shapes + a part, a fraction compared to ½, top = bottom, or top ÷ bottom."),
        h("li", null, "Even problems have no red answers here. Use the next step to practice the same ideas.")));
    var img = QK.imageCard({ src: "homework/mixed-numbers-worksheet-p47.png", alt: "Workbook page 47, Mixed Numbers; Fractions Greater Than or Equal to One, with red answers on the odd-numbered problems", title: "Worksheet page 47", caption: "Mixed Numbers; Fractions Greater Than or Equal to One" });
    var imgWrap = h("div", { class: "qk-panel" }, img);
    var boxes = [["I checked problems 1–13", "c1"], ["I checked problems 15–27", "c2"], ["I checked problems 29–41", "c3"]];
    var list = h("fieldset", { class: "qk-panel", style: "border:2px solid var(--qk-line)" }, h("legend", { class: "qk-key" }, "My check-off list"));
    boxes.forEach(function (b) { list.appendChild(h("label", { class: "fr-check" }, h("input", { type: "checkbox", id: b[1] }), b[0])); });
    list.appendChild(h("div", { class: "qk-row" }, h("button", { type: "button", class: "qk-btn qk-btn-primary", onclick: function () { markPhase("homework"); QK.celebrate("Homework checked."); show("review"); } }, "Done checking →")));
    sec.appendChild(intro); sec.appendChild(imgWrap); sec.appendChild(list);
    return sec;
  }

  /* ---------- 2. Easy review ---------- */
  function buildReview() {
    var sec = h("section", { id: "step-review" });
    sec.appendChild(h("div", { class: "qk-panel" }, h("h2", null, "Easy review"),
      h("p", null, "Seven short cards. Play with each one. A fraction bar means ", h("strong", null, "divide"), "!")));
    sec.appendChild(cardBuilder()); sec.appendChild(cardWords()); sec.appendChild(cardEqualOne()); sec.appendChild(cardGreater());
    sec.appendChild(cardDivide()); sec.appendChild(cardRound()); sec.appendChild(cardCloser());
    sec.appendChild(h("div", { class: "qk-panel qk-center" }, h("button", { type: "button", class: "qk-btn qk-btn-primary", onclick: function () { markPhase("review"); show("quiz"); } }, "I'm ready for the quiz →")));
    return sec;
  }

  // (a) shade the shapes
  function cardBuilder() {
    var d = 4, shaded = {}, out = readout(), art = h("div", { class: "fr-art" });
    function count() { return Object.keys(shaded).length; }
    function key(c, i) { return c + "-" + i; }
    function paint() {
      art.innerHTML = "";
      var svg = svgEl("svg", { viewBox: "0 0 330 108", width: 495, role: "group", "aria-label": "Three circles, each cut into " + d + " equal parts. Tap a part to shade it." });
      for (var c = 0; c < 3; c++) for (var i = 0; i < d; i++) (function (c, i) {
        var on = !!shaded[key(c, i)];
        var p = svgEl("path", { d: D.wedgePath(55 + c * 110, 54, 48, d, i), class: "fr-wedge " + (on ? "on" : "off"), stroke: "#18264b", "stroke-width": 2.5, "stroke-linejoin": "round", tabindex: 0, role: "checkbox", "aria-checked": on ? "true" : "false", "aria-label": "Circle " + (c + 1) + ", part " + (i + 1) + " of " + d + (on ? ", shaded" : ", not shaded") });
        function toggle() { if (shaded[key(c, i)]) delete shaded[key(c, i)]; else shaded[key(c, i)] = 1; paint(); var np = art.querySelector('[aria-label^="Circle ' + (c + 1) + ', part ' + (i + 1) + ' "]'); if (np) np.focus(); }
        p.addEventListener("click", toggle);
        p.addEventListener("keydown", function (e) { if (e.key === " " || e.key === "Enter") { e.preventDefault(); toggle(); } });
        svg.appendChild(p);
      })(c, i);
      art.appendChild(svg);
      var s = count(), m = D.toMixed(s, d);
      if (!s) out.innerHTML = "Tap pieces to shade them.";
      else out.innerHTML = "<span>Shaded pieces: <strong>" + s + "</strong> (each circle has " + d + " parts)</span><span>Mixed number: " + mixedOrWhole(m.w, m.n, m.d) + "</span><span>Improper fraction: " + F(s, d) + "</span>";
    }
    function bump(delta) {
      if (delta > 0) { for (var k = 0; k < 3 * d; k++) { var c = Math.floor(k / d), i = k % d; if (!shaded[key(c, i)]) { shaded[key(c, i)] = 1; break; } } }
      else { for (var j = 3 * d - 1; j >= 0; j--) { var c2 = Math.floor(j / d), i2 = j % d; if (shaded[key(c2, i2)]) { delete shaded[key(c2, i2)]; break; } } }
      paint();
    }
    var sel = select("Cut each circle into this many parts", [3, 4, 6, 8], 4, function (v) { d = v; shaded = {}; paint(); }, function (v) { return v + " parts"; });
    var controls = h("div", { class: "fr-controls" }, h("label", null, "Cut into ", sel),
      h("button", { type: "button", class: "qk-btn qk-btn-ghost", onclick: function () { bump(1); } }, "+ Shade a piece"),
      h("button", { type: "button", class: "qk-btn qk-btn-ghost", onclick: function () { bump(-1); } }, "− Remove a piece"),
      h("button", { type: "button", class: "qk-btn qk-btn-ghost", onclick: function () { shaded = {}; paint(); } }, "Clear"));
    var c = card("a", "What a mixed number means", [
      h("p", null, "Each full circle is ", h("strong", null, "1 whole"), ". Fill whole circles first, then part of the next one. The whole circles are the whole number. The leftover pieces are the fraction."),
      controls, art, out]);
    paint();
    return c;
  }

  // (b) reading and writing
  function cardWords() {
    var w = 3, d = 3, n = 2, out = readout();
    var nSlot = h("span");
    function paint() {
      out.innerHTML = "<span>Say it: <strong>" + D.mixedWords(w, n, d) + "</strong></span><span>Write it: " + M(w, n, d) + "</span>";
      nSlot.innerHTML = ""; nSlot.appendChild(select("Number of parts shaded (numerator)", range1(d - 1), n, function (v) { n = v; paint(); }));
    }
    function range1(max) { var a = []; for (var i = 1; i <= max; i++) a.push(i); return a; }
    var sw = select("Whole number", [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12], w, function (v) { w = v; paint(); });
    var sd = select("Parts in one whole (denominator)", [2, 3, 4, 5, 6, 7, 8, 9, 10], d, function (v) { d = v; if (n >= d) n = d - 1; paint(); });
    var c = card("b", "Reading and writing mixed numbers", [
      h("p", null, "The number before ", h("em", null, "and"), " is the whole number. The fraction words tell the top and bottom: ", h("em", null, "two thirds"), " = 2 over 3."),
      h("div", { class: "fr-controls" }, h("label", null, "Whole ", sw), h("label", null, "Top ", nSlot), h("label", null, "Bottom ", sd)), out]);
    paint();
    return c;
  }

  // (c) equal to 1 — fraction bar with sliders
  function cardEqualOne() {
    var d = 7, n = 7, out = readout(), art = h("div", { class: "fr-art" });
    var nIn, dIn;
    function paint() {
      var rows = Math.max(1, Math.ceil(n / d)), segW = Math.min(36, 300 / d), W = segW * d + 4, H = rows * 36 + 4;
      var svg = svgEl("svg", { viewBox: "0 0 " + W + " " + H, width: W * 1.3, role: "img", "aria-label": n + " of " + d + " parts shaded" });
      for (var r = 0; r < rows; r++) for (var i = 0; i < d; i++) {
        var idx = r * d + i;
        svg.appendChild(svgEl("rect", { x: 2 + i * segW, y: 2 + r * 36, width: segW, height: 32, fill: idx < n ? "#e46a12" : "#fff", stroke: "#18264b", "stroke-width": 2.5 }));
      }
      art.innerHTML = ""; art.appendChild(svg);
      var msg;
      if (n === d) msg = "<strong>Equal to 1.</strong> Top = bottom: all " + d + " pieces make 1 whole. " + F(n, d) + " = 1";
      else if (n < d) msg = "Less than 1. Only " + n + " of " + d + " pieces.";
      else { var m = D.toMixed(n, d); msg = "<strong>Greater than 1.</strong> " + F(n, d) + " = " + mixedOrWhole(m.w, m.n, m.d); }
      out.innerHTML = "<span>" + F(n, d) + "</span><span>" + msg + "</span>";
      nIn.max = 2 * d; nIn.setAttribute("aria-valuetext", n + " out of " + d);
    }
    nIn = range("Top number (numerator)", 0, 14, n, function (v) { n = v; paint(); });
    dIn = range("Bottom number (denominator)", 2, 7 + 5, d, function (v) { d = v; if (n > 2 * d) { n = 2 * d; nIn.value = n; } paint(); });
    dIn.value = d;
    var c = card("c", "Fractions equal to 1", [
      h("p", null, "When the top number is the same as the bottom number, you have every piece. That is exactly 1 whole. Slide the top number to match the bottom."),
      h("div", { class: "fr-controls" }, h("label", null, "Top ", nIn), h("label", null, "Bottom ", dIn)), art, out]);
    paint();
    return c;
  }

  // (d) greater than 1
  function cardGreater() {
    var d = 5, out = readout(), nums = [3, 5, 7, 12];
    out.textContent = "Tap a number to test it.";
    var chips = h("div", { class: "fr-chips", role: "group", "aria-label": "Try a numerator over " + d });
    nums.forEach(function (n) {
      var b = h("button", { type: "button", class: "fr-chip", "aria-pressed": "false", "aria-label": n + " over " + d }, h("span", { html: F(n, d) }));
      b.addEventListener("click", function () {
        Array.prototype.forEach.call(chips.children, function (x) { x.setAttribute("aria-pressed", "false"); });
        b.setAttribute("aria-pressed", "true");
        var m = D.toMixed(n, d);
        out.innerHTML = D.isGreaterThanOne(n, d)
          ? "<strong>" + n + " is bigger than " + d + "</strong> → greater than 1. " + F(n, d) + " = " + mixedOrWhole(m.w, m.n, m.d)
          : (D.equalsOne(n, d) ? "<strong>" + n + " = " + d + "</strong> → exactly 1." : "<strong>" + n + " is smaller than " + d + "</strong> → less than 1.");
      });
      chips.appendChild(b);
    });
    return card("d", "Fractions greater than 1", [
      h("p", null, "When the top is bigger than the bottom, you have more than one whole. These are called ", h("strong", null, "improper fractions"), ". Which of these are greater than 1?"),
      chips, out]);
  }

  // tap-through helper: examples + steps
  function tapThrough(examples, stepsFor, label) {
    var ex = 0, shown = 0, wrap = h("div"), list = h("ol", { class: "fr-sol", "aria-live": "polite" });
    var chips = h("div", { class: "fr-chips", role: "group", "aria-label": label });
    var next = h("button", { type: "button", class: "qk-btn qk-btn-primary" });
    var steps;
    function paint() {
      steps = stepsFor(examples[ex][0], examples[ex][1]);
      list.innerHTML = "";
      for (var i = 0; i < shown; i++) list.appendChild(h("li", { html: steps[i] }));
      var finished = shown >= steps.length;
      next.textContent = finished ? "Start over ↺" : (shown === 0 ? "Show step 1 →" : "Next step →");
      Array.prototype.forEach.call(chips.children, function (b, i) { b.setAttribute("aria-pressed", i === ex ? "true" : "false"); });
    }
    examples.forEach(function (e, i) {
      chips.appendChild(h("button", { type: "button", class: "fr-chip", "aria-pressed": "false", "aria-label": e[0] + " over " + e[1], onclick: function () { ex = i; shown = 0; paint(); } }, h("span", { html: F(e[0], e[1]) })));
    });
    next.addEventListener("click", function () { if (shown >= steps.length) shown = 0; else shown++; paint(); });
    wrap.appendChild(chips); wrap.appendChild(list); wrap.appendChild(h("div", { class: "qk-row" }, next));
    paint();
    return wrap;
  }

  // (e) improper -> mixed
  function cardDivide() {
    function steps(n, d) {
      var m = D.toMixed(n, d), g = D.gcd(m.n, m.d), s = D.toMixedSimplest(n, d), out = [];
      out.push("<strong>Divide</strong> the top by the bottom: " + n + " ÷ " + d + " = " + m.w + (m.n ? " R" + m.n : "") + ".");
      if (!m.n) { out.push("Nothing is left over, so " + F(n, d) + " = <strong>" + m.w + "</strong>, a whole number."); return out; }
      out.push("The quotient " + m.w + " is the <strong>whole number</strong>. The remainder " + m.n + " goes over the same bottom: " + M(m.w, m.n, m.d) + ".");
      out.push(g > 1 ? "<strong>Simplify</strong> the fraction part. Divide " + m.n + " and " + m.d + " by " + g + ": " + F(m.n, m.d) + " = " + F(s.n, s.d) + "." : F(m.n, m.d) + " is already in simplest form.");
      out.push("Answer: " + F(n, d) + " = <strong>" + M(s.w, s.n, s.d) + "</strong>");
      return out;
    }
    return card("e", "Improper fraction → whole or mixed number", [
      h("p", null, "Divide. The quotient is the whole number and the remainder is the new top. Then simplify the fraction part. Pick an example and tap through."),
      tapThrough([[34, 8], [27, 6], [45, 9]], steps, "Pick an improper fraction")]);
  }

  // (f) rounding on a number line
  function cardRound() {
    var w = 7, d = 8, n = 3, out = readout(), art = h("div", { class: "fr-art" }), nIn;
    function paint() {
      var W = 320, x0 = 20, x1 = 300, px = x0 + (x1 - x0) * n / d, r = D.roundMixed(w, n, d);
      var svg = svgEl("svg", { viewBox: "0 0 " + W + " 100", width: W * 1.4, role: "img", "aria-label": "Number line from " + w + " to " + (w + 1) + ". Marker at " + w + " and " + n + " over " + d + "." });
      svg.appendChild(svgEl("line", { x1: x0, y1: 50, x2: x1, y2: 50, stroke: "#18264b", "stroke-width": 4, "stroke-linecap": "round" }));
      [[x0, w, ""], [(x0 + x1) / 2, "", "½"], [x1, w + 1, ""]].forEach(function (t) {
        svg.appendChild(svgEl("line", { x1: t[0], y1: 38, x2: t[0], y2: 62, stroke: "#18264b", "stroke-width": 3 }));
        var tx = svgEl("text", { x: t[0], y: 86, "text-anchor": "middle", "font-size": 18, "font-weight": 800, fill: "#18264b" });
        tx.textContent = t[1] !== "" ? t[1] : "half-way"; svg.appendChild(tx);
      });
      svg.appendChild(svgEl("circle", { cx: px, cy: 50, r: 11, fill: "#e46a12", stroke: "#18264b", "stroke-width": 3 }));
      var arrow = svgEl("text", { x: r === w ? x0 : x1, y: 30, "text-anchor": "middle", "font-size": 20, "font-weight": 900, fill: "#12805a" });
      arrow.textContent = "↓ closer"; svg.appendChild(arrow);
      art.innerHTML = ""; art.appendChild(svg);
      var half = 2 * n === d ? " Exactly ½ rounds <strong>up</strong>." : (2 * n > d ? " More than ½ → round <strong>up</strong>." : " Less than ½ → round <strong>down</strong>.");
      out.innerHTML = "<span>" + M(w, n, d) + " rounds to <strong>" + r + "</strong></span><span>Is " + F(n, d) + " ≥ " + F(1, 2) + "? (" + n + " × 2 = " + 2 * n + (2 * n >= d ? " ≥ " : " < ") + d + ")" + half + "</span>";
      nIn.max = d - 1; nIn.setAttribute("aria-valuetext", n + " over " + d);
    }
    nIn = range("Top number of the fraction part", 0, d - 1, n, function (v) { n = v; paint(); });
    var sd = select("Bottom number", [2, 4, 5, 6, 8, 10], d, function (v) { d = v; if (n > d - 1) n = d - 1; nIn.value = n; paint(); });
    var c = card("f", "Rounding a mixed number", [
      h("p", null, "Look at the fraction part. Less than ½ → round down to the whole number. ", h("strong", null, "½ or more → round up"), " (the book rounds 6½ up to 7). Slide the dot."),
      h("div", { class: "fr-controls" }, h("label", null, "Top ", nIn), h("label", null, "Bottom ", sd)), art, out]);
    paint();
    return c;
  }

  // (g) closer whole number
  function cardCloser() {
    function steps(n, d) {
      var m = D.toMixed(n, d), r = D.nearestWhole(n, d), out = [];
      out.push("<strong>Convert first:</strong> " + n + " ÷ " + d + " = " + m.w + " R" + m.n + ", so " + F(n, d) + " = " + mixedOrWhole(m.w, m.n, m.d) + ".");
      if (!m.n) { out.push("No fraction part, so it is exactly <strong>" + m.w + "</strong>."); return out; }
      out.push("<strong>Compare</strong> " + F(m.n, m.d) + " to " + F(1, 2) + ": " + m.n + " × 2 = " + 2 * m.n + (2 * m.n >= m.d ? " is at least " : " is less than ") + m.d + ", so it is " + (2 * m.n >= m.d ? "½ or more." : "less than ½."));
      out.push(F(n, d) + " is closer to <strong>" + r + "</strong>.");
      return out;
    }
    return card("g", "Which whole number is it closer to?", [
      h("p", null, "Do not guess. Turn the fraction into a mixed number, then compare the fraction part to ½."),
      tapThrough([[38, 9], [23, 4], [25, 2]], steps, "Pick a fraction")]);
  }

  /* ---------- 3. Practice quiz ---------- */
  function prepared() {
    return D.buildQuestions().map(function (q) {
      if (q.type !== "mc") return q;
      var key = q.choices[q.answer].key, copy = Object.assign({}, q);
      copy.choices = QK.shuffle(q.choices);
      copy.answer = copy.choices.map(function (c) { return c.key; }).indexOf(key);
      return copy;
    });
  }
  var quizBox;
  function buildQuiz() {
    var sec = h("section", { id: "step-quiz" });
    sec.appendChild(h("div", { class: "qk-panel" }, h("h2", null, "Practice quiz"),
      h("p", null, "8 questions. Your first try is your score. Wrong answers get a second chance after the quiz.")));
    quizBox = h("div");
    sec.appendChild(quizBox);
    startQuiz();
    return sec;
  }
  function startQuiz() {
    QK.runQuiz(quizBox, prepared(), {
      id: "fractions-review", storeKey: KEY, quizName: "quiz", title: "Practice quiz", reshuffle: prepared,
      onFinish: function (result, panel) {
        markPhase("quiz");
        panel.appendChild(h("div", { class: "qk-row" }, h("button", { type: "button", class: "qk-btn qk-btn-primary", onclick: function () { show("finish"); } }, "Finish & fix →")));
      }
    });
  }

  /* ---------- 4. Finish & fix ---------- */
  var finishBox = h("div");
  function renderFinish() {
    finishBox.innerHTML = "";
    var data = st.get(), q = data.quiz && data.quiz.quiz, last = q && q.last;
    finishBox.appendChild(h("h2", null, "Finish & fix"));
    if (!last) {
      finishBox.appendChild(h("p", null, "Take the practice quiz first. Then come back here to see what to remember."));
      finishBox.appendChild(h("div", { class: "qk-row" }, h("button", { type: "button", class: "qk-btn qk-btn-primary", onclick: function () { show("quiz"); } }, "Go to the quiz →")));
    } else {
      finishBox.appendChild(h("p", { class: "qk-big" }, last.pct + "%"));
      finishBox.appendChild(h("p", null, "First-try score: " + last.firstTry + " of " + last.total + ". Best: " + q.best + "%."));
      var byId = {}; D.buildQuestions().forEach(function (x) { byId[x.id] = x; });
      var seen = {}, any = false;
      if ((last.missed || []).length) finishBox.appendChild(h("p", { class: "qk-callout" }, "Here are the ideas to remember, in plain words:"));
      (last.missed || []).forEach(function (id) {
        var c = byId[id] && D.CONCEPTS[byId[id].concept];
        if (!c || seen[byId[id].concept]) return;
        seen[byId[id].concept] = 1; any = true;
        finishBox.appendChild(h("div", { class: "fr-concept" }, h("h3", null, c.title), h("p", { html: c.html })));
      });
      if (!any) finishBox.appendChild(h("div", { class: "qk-callout" }, "You got every question on the first try. Nice thinking! 🌟"));
    }
    finishBox.appendChild(h("div", { class: "qk-row" },
      h("a", { class: "qk-btn qk-btn-primary", href: "../fifth-grade/" }, "Back to 5th grade"),
      h("button", { type: "button", class: "qk-btn qk-btn-ghost", onclick: function () { show("homework"); } }, "Check homework again")));
  }

  /* ---------- assemble ---------- */
  main.innerHTML = "";
  main.appendChild(h("div", { class: "qk-top" }, h("a", { class: "qk-back", href: "../fifth-grade/" }, "← 5th grade")));
  main.appendChild(h("header", { class: "qk-hero" },
    h("span", { class: "qk-eyebrow" }, "5th grade math · about 25 minutes"),
    h("h1", null, "Fractions: Quick Review"),
    h("p", null, "Mixed Numbers; Fractions Greater Than or Equal to One"),
    h("div", { html: heroArt() })));
  main.appendChild(barSlot); main.appendChild(timerSlot);
  panes.homework = buildHomework(); panes.review = buildReview(); panes.quiz = buildQuiz();
  panes.finish = h("section", { id: "step-finish", class: "qk-panel" }, finishBox);
  D.PHASES.forEach(function (p) { main.appendChild(panes[p.id]); });
  main.appendChild(h("p", { class: "qk-footer" }, "Study Quest · Fractions: Quick Review"));

  var done = phasesDone();
  current = !done.homework ? "homework" : !done.review ? "review" : !done.quiz ? "quiz" : "finish";
  D.PHASES.forEach(function (p) { panes[p.id].hidden = p.id !== current; });
  timerSlot.appendChild(QK.timer(D.PHASES.filter(function (x) { return x.id === current; })[0].minutes, { label: "Step timer (optional)" }).el);
  if (current === "finish") renderFinish();
  drawBar();
})();

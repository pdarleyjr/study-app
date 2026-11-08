/* Spanish Days of the Week: content + question builders.
   Pure functions (no DOM), so the whole question bank can be checked in Node:
   `node --test`. Every builder takes an rng (defaults to Math.random). */
(function (root, factory) {
  var api = factory();
  if (typeof module === "object" && module.exports) { module.exports = api; }
  else { root.SD = root.SD || {}; root.SD.data = api; }
})(typeof self !== "undefined" ? self : this, function () {
  "use strict";

  /* Monday-first order, as taught in school. The week is a circle: domingo -> lunes. */
  var DAYS = [
    { es: "lunes", en: "Monday", syl: ["lu", "nes"], stress: 0, say: "LOO-nehs", emoji: "🌙",
      hook: "lunes sounds like luna, the Moon!", move: "Make a big round Moon over your head.", bg: "#e6e3ff", ink: "#3b2fa8" },
    { es: "martes", en: "Tuesday", syl: ["mar", "tes"], stress: 0, say: "MAR-tehs", emoji: "🚀",
      hook: "martes sounds like Marte, the red planet Mars!", move: "Blast off! Shoot your arms up like a rocket.", bg: "#ffe2de", ink: "#a3261a" },
    { es: "miércoles", en: "Wednesday", syl: ["miér", "co", "les"], stress: 0, say: "mee-EHR-koh-lehs", emoji: "🐫",
      hook: "miércoles is the middle of the week, and the longest day name!", move: "Draw a big camel hump in the air: up and over the middle!", bg: "#ffeacc", ink: "#8f4700" },
    { es: "jueves", en: "Thursday", syl: ["jue", "ves"], stress: 0, say: "HWEH-vehs", emoji: "🪐",
      hook: "jueves sounds a little like Júpiter, the giant planet!", move: "Stand on tiptoes and make yourself GIANT.", bg: "#fff3b5", ink: "#6e5300" },
    { es: "viernes", en: "Friday", syl: ["vier", "nes"], stress: 0, say: "bee-EHR-nehs", emoji: "✨",
      hook: "viernes: the weekend is almost here! Twinkle like the planet Venus.", move: "Wiggle your fingers and twinkle like a star.", bg: "#dcf5e2", ink: "#1b6532" },
    { es: "sábado", en: "Saturday", syl: ["sá", "ba", "do"], stress: 0, say: "SAH-bah-doh", emoji: "🎉",
      hook: "sábado is a play day!", move: "Jump up and cheer: ¡sábado!", bg: "#d9f0ff", ink: "#0b5785" },
    { es: "domingo", en: "Sunday", syl: ["do", "min", "go"], stress: 1, say: "doh-MEEN-goh", emoji: "😴",
      hook: "domingo is a rest day. After domingo the week starts again with lunes!", move: "Rest your head on your hands like a pillow.", bg: "#fde0f2", ink: "#931a66" }
  ];
  var N = DAYS.length;

  function after(i) { return (i + 1) % N; }
  function before(i) { return (i + N - 1) % N; }
  function idxOf(es) { for (var i = 0; i < N; i++) { if (DAYS[i].es === es) { return i; } } return -1; }
  function rnd(rng) { return typeof rng === "function" ? rng : Math.random; }
  function randInt(rng, n) { return Math.floor(rnd(rng)() * n); }
  function shuffle(rng, list) {
    var a = list.slice(), i, j, t;
    for (i = a.length - 1; i > 0; i--) { j = randInt(rng, i + 1); t = a[i]; a[i] = a[j]; a[j] = t; }
    return a;
  }
  function pick(rng, list) { return list[randInt(rng, list.length)]; }
  function range(n) { var a = []; for (var i = 0; i < n; i++) { a.push(i); } return a; }

  /* n unique day indices that include `answer`. `prefer` distractors go in first
     (for example the day on the other side, which catches before/after mix-ups). */
  function choiceIdx(rng, answer, n, prefer) {
    var out = [answer];
    (prefer || []).forEach(function (p) { if (out.length < n && out.indexOf(p) < 0) { out.push(p); } });
    shuffle(rng, range(N)).forEach(function (p) { if (out.length < n && out.indexOf(p) < 0) { out.push(p); } });
    return shuffle(rng, out);
  }
  function toChoices(list, answer, field) {
    return list.map(function (i) { return { idx: i, label: DAYS[i][field || "es"], correct: i === answer }; });
  }

  var AFTER_ES = ["¿Qué día viene después del {d}?", "¿Qué día sigue después del {d}?"];

  /* ---------- question builders ---------- */
  function relQ(rng, dir, target, opts) {
    opts = opts || {};
    var isAfter = dir === "after", answer = isAfter ? after(target) : before(target), d = DAYS[target];
    var other = isAfter ? before(target) : after(target);
    var prefer = rnd(rng)() < 0.5 ? [other, target] : [other];
    var promptEs = isAfter ? pick(rng, AFTER_ES).replace("{d}", d.es) : "¿Qué día viene antes del " + d.es + "?";
    return {
      kind: dir, key: dir + ":" + d.es, target: target, answer: answer, answerLabel: DAYS[answer].es,
      promptEs: promptEs, speak: promptEs,
      promptEn: (isAfter ? "What day comes after " : "What day comes before ") + d.es + " (" + d.en + ")?",
      choices: toChoices(choiceIdx(rng, answer, opts.n || 3, prefer), answer),
      strip: !!opts.strip, spanishOnly: !!opts.spanishOnly
    };
  }

  function transQ(rng, kind, day, opts) {
    opts = opts || {};
    var d = DAYS[day], q = { kind: kind, key: "day:" + d.es, target: day, answer: day, strip: false, spanishOnly: !!opts.spanishOnly };
    if (kind === "en2es") {
      q.promptEs = rnd(rng)() < 0.5 ? "¿Qué día es " + d.en + " en español?" : "¿Cómo se dice " + d.en + " en español?";
      q.promptEn = "What is " + d.en + " in Spanish?";
      q.choices = toChoices(choiceIdx(rng, day, opts.n || 3), day, "es");
      q.answerLabel = d.es;
      q.speak = q.promptEs;
    } else if (kind === "es2en") {
      q.promptEs = "¿Qué día es «" + d.es + "» en inglés?";
      q.promptEn = "What is " + d.es + " in English?";
      q.choices = toChoices(choiceIdx(rng, day, opts.n || 3), day, "en");
      q.answerLabel = d.en;
      q.speak = d.es;
    } else { /* listen */
      q.promptEs = "Escucha. ¿Qué día es?";
      q.promptEn = "Listen. Which day do you hear?";
      q.choices = toChoices(choiceIdx(rng, day, opts.n || 3), day, "es");
      q.answerLabel = d.es;
      q.speak = d.es;
      q.listen = true;
    }
    return q;
  }

  /* A run of `len` days (wrapping round the week) with `blanks` gaps to fill, left to right. */
  function missingQ(rng, opts) {
    opts = opts || {};
    var len = opts.len || 3, nBlanks = opts.blanks || 1, start = opts.start !== undefined ? opts.start : randInt(rng, N);
    var seq = range(len).map(function (k) { return (start + k) % N; });
    var spots = opts.spots ? opts.spots.slice() : opts.blankAt !== undefined ? [opts.blankAt] : shuffle(rng, range(len)).slice(0, nBlanks).sort(function (a, b) { return a - b; });
    var answers = spots.map(function (s) { return seq[s]; });
    var prefer = [];
    answers.forEach(function (a) { prefer.push(before(seq[0]), after(seq[len - 1]), a); });
    var bank = choiceIdx(rng, answers[0], Math.max(opts.n || 3, answers.length + 2), answers.concat(prefer));
    return {
      kind: "missing", key: "missing:" + DAYS[answers[0]].es, seq: seq, blanks: spots, answers: answers,
      answer: answers[0], answerLabel: answers.map(function (a) { return DAYS[a].es; }).join(", "),
      promptEs: "¿Cuál es el día que falta?", promptEn: nBlanks > 1 ? "Which days are missing?" : "Which day is missing?",
      speak: "¿Cuál es el día que falta?",
      choices: toChoices(bank, -1).map(function (c) { c.correct = answers.indexOf(c.idx) >= 0; return c; }),
      colors: !!opts.colors, spanishOnly: !!opts.spanishOnly
    };
  }

  /* ---------- rounds ---------- */
  var LEVELS = {
    1: { name: "Con ayuda", en: "With helpers" },
    2: { name: "Sin mapa", en: "No week map" },
    3: { name: "¡Solo español!", en: "Spanish only" }
  };

  /* Weighted pick: keys with more past misses come back more often. */
  function weightedOrder(rng, keys, weightOf) {
    return keys.map(function (k) { return { k: k, w: -Math.log(1 - rnd(rng)() * 0.999999) / (weightOf ? weightOf(k) : 1) }; })
      .sort(function (a, b) { return a.w - b.w; }).map(function (o) { return o.k; });
  }

  /* After/before practice: all seven days once (shuffled), plus one extra (a tricky one if known). */
  function relRound(rng, dir, level, weightOf) {
    var order = shuffle(rng, range(N)), extra = weightedOrder(rng, range(N), weightOf ? function (t) { return weightOf(dir + ":" + DAYS[t].es); } : null)[0];
    if (extra === order[order.length - 1]) { extra = order[0]; }
    order.push(extra);
    return order.map(function (t, k) {
      var o = { n: level >= 2 ? 4 : 3 };
      if (level === 1) { o.strip = k < 3; }
      if (level === 2) { o.spanishOnly = k >= 4; }
      if (level === 3) { o.spanishOnly = true; }
      return relQ(rng, dir, t, o);
    });
  }

  function missingRound(rng, level) {
    var starts = shuffle(rng, range(N)).slice(0, 6);
    return starts.map(function (s, k) {
      if (level === 1) { return missingQ(rng, { start: s, len: 3, n: 3, colors: true, blankAt: k % 3 }); }
      if (level === 2) { return missingQ(rng, { start: s, len: 4, n: 4, spanishOnly: k >= 3 }); }
      return missingQ(rng, { start: s, len: 7, blanks: 2, n: 5, spanishOnly: true });
    });
  }

  function listenRound(rng, level, canHear) {
    var days = shuffle(rng, range(N)).concat([randInt(rng, N)]), n = level >= 2 ? 4 : 3;
    var kinds = canHear ? ["listen", "en2es", "listen", "es2en"] : ["en2es", "es2en"];
    return days.map(function (d, k) { return transQ(rng, kinds[k % kinds.length], d, { n: n, spanishOnly: level === 3 }); });
  }

  /* The practice test. 11 answer questions + put-in-order (always last, because it shows the
     whole week). The ten Spanish answers cover all seven days, and the Sunday/Monday wrap
     is always asked. Prompts are Spanish only; one attempt is scored. */
  function challenge(rng) {
    var kinds = ["en2es", "en2es", "after", "after", "after", "before", "before", "before", "missing", "missing"];
    var answers = shuffle(rng, range(N)).concat([randInt(rng, N), randInt(rng, N), randInt(rng, N)]);
    var slots = shuffle(rng, range(kinds.length)).map(function (k) { return { kind: kinds[k], a: answers[k] }; });
    var hasWrap = slots.some(function (s) { return (s.kind === "after" && s.a === 0) || (s.kind === "before" && s.a === N - 1); });
    if (!hasWrap) { /* swap lunes into the first "after" slot; keeps every day covered */
      var ai = -1, li = -1;
      slots.forEach(function (s, k) { if (ai < 0 && s.kind === "after") { ai = k; } if (li < 0 && s.a === 0) { li = k; } });
      var tmp = slots[ai].a; slots[ai].a = 0; slots[li].a = tmp;
    }
    var items = slots.map(function (s) {
      if (s.kind === "after") { return relQ(rng, "after", before(s.a), { n: 4, spanishOnly: true }); }
      if (s.kind === "before") { return relQ(rng, "before", after(s.a), { n: 4, spanishOnly: true }); }
      if (s.kind === "missing") {
        var blankAt = randInt(rng, 3);
        return missingQ(rng, { start: (s.a - blankAt + N) % N, len: 3, n: 4, blankAt: blankAt, spanishOnly: true });
      }
      return transQ(rng, "en2es", s.a, { n: 4, spanishOnly: true });
    });
    items.splice(randInt(rng, items.length + 1), 0, transQ(rng, "es2en", randInt(rng, N), { n: 4, spanishOnly: true }));
    items.push({ kind: "order", key: "order", start: 0, promptEs: "Pon los días en orden.", promptEn: "Put the days in order, starting with lunes.", speak: "Pon los días en orden." });
    return items;
  }

  /* Monday Morning Quick Review: 6 Spanish-only before/after questions. Past misses come first,
     at least two of each direction, and the Sunday/Monday wrap is always included. */
  function quickReview(rng, weightOf) {
    var keys = [];
    range(N).forEach(function (t) { keys.push("after:" + DAYS[t].es, "before:" + DAYS[t].es); });
    var ordered = weightedOrder(rng, keys, weightOf), chosen = [];
    var wrap = weightedOrder(rng, ["after:domingo", "before:lunes"], weightOf)[0];
    chosen.push(wrap);
    ["after", "before"].forEach(function (dir) {
      ordered.filter(function (k) { return k.indexOf(dir) === 0 && chosen.indexOf(k) < 0; }).slice(0, 2).forEach(function (k) { chosen.push(k); });
    });
    ordered.forEach(function (k) { if (chosen.length < 6 && chosen.indexOf(k) < 0) { chosen.push(k); } });
    return shuffle(rng, chosen).map(function (k) {
      var p = k.split(":");
      return relQ(rng, p[0], idxOf(p[1]), { n: 3, spanishOnly: true });
    });
  }

  /* Re-check a missed question later in the same round, with freshly shuffled choices. */
  function remake(rng, q) {
    if (q.kind === "after" || q.kind === "before") { return relQ(rng, q.kind, q.target, { n: q.choices.length, spanishOnly: q.spanishOnly }); }
    if (q.kind === "missing") {
      return missingQ(rng, { start: q.seq[0], len: q.seq.length, spots: q.blanks, n: q.choices.length, colors: q.colors, spanishOnly: q.spanishOnly });
    }
    return transQ(rng, q.kind, q.target, { n: q.choices.length, spanishOnly: q.spanishOnly });
  }

  /* Self-check used by the tests: returns a list of problems (empty = good). */
  function validate(q) {
    var errs = [], labels = {}, nCorrect = 0;
    if (q.kind === "order") { return errs; }
    (q.choices || []).forEach(function (c) {
      if (labels[c.label]) { errs.push("duplicate choice " + c.label); }
      labels[c.label] = true;
      if (c.correct) { nCorrect++; }
    });
    var want = q.kind === "missing" ? q.answers.length : 1;
    if (nCorrect !== want) { errs.push("expected " + want + " correct choice(s), found " + nCorrect); }
    if (q.kind === "after" && q.answer !== after(q.target)) { errs.push("after answer wrong"); }
    if (q.kind === "before" && q.answer !== before(q.target)) { errs.push("before answer wrong"); }
    if (q.kind === "missing") {
      q.seq.forEach(function (d, k) { if (k && d !== after(q.seq[k - 1])) { errs.push("sequence not consecutive"); } });
      q.blanks.forEach(function (s, k) { if (q.seq[s] !== q.answers[k]) { errs.push("blank answer mismatch"); } });
    }
    if ((q.kind === "en2es" || q.kind === "es2en" || q.kind === "listen") && q.answer !== q.target) { errs.push("translation answer wrong"); }
    return errs;
  }

  return {
    DAYS: DAYS, N: N, LEVELS: LEVELS, after: after, before: before, idxOf: idxOf, shuffle: shuffle, range: range,
    relQ: relQ, transQ: transQ, missingQ: missingQ, relRound: relRound, missingRound: missingRound, listenRound: listenRound,
    challenge: challenge, quickReview: quickReview, remake: remake, validate: validate
  };
});

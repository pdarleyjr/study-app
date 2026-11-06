/* Math Mission: question generators. Pure functions (no DOM) so they can be tested in Node.
   Every question is built from real numbers, then checked: exactly one correct option, no duplicate options.
   Fractions inside text are written {n/d}; a question mark works too: {?/28}. */
(function (root) {
  "use strict";

  /* ---------- number helpers ---------- */
  function gcd(a, b) { while (b) { var t = a % b; a = b; b = t; } return a; }
  function lcm(a, b) { return a / gcd(a, b) * b; }
  function isPrime(n) { if (n < 2) { return false; } for (var i = 2; i * i <= n; i++) { if (n % i === 0) { return false; } } return true; }
  function factors(n) { var out = [], i; for (i = 1; i <= n; i++) { if (n % i === 0) { out.push(i); } } return out; }
  function smallestFactor(n) { for (var i = 2; i * i <= n; i++) { if (n % i === 0) { return i; } } return n; }
  function fr(n, d) { return "{" + n + "/" + d + "}"; }
  function join(list) { return list.join(", "); }
  function rnd(rng, n) { return Math.floor(rng() * n); }
  function pick(rng, list) { return list[rnd(rng, list.length)]; }
  function shuffle(rng, list) {
    var a = list.slice(), i, j, t;
    for (i = a.length - 1; i > 0; i--) { j = rnd(rng, i + 1); t = a[i]; a[i] = a[j]; a[j] = t; }
    return a;
  }
  function seeded(seed) {
    var s = (seed >>> 0) || 1;
    return function () { s = (s * 1664525 + 1013904223) >>> 0; return s / 4294967296; };
  }

  /* ---------- objectives (the 15 skills from the practice test) ---------- */
  var OBJECTIVES = [null,
    { n: 1, area: "prime", title: "Spot a prime number", test: "Q1" },
    { n: 2, area: "prime", title: "Why 1 is not prime", test: "Q2" },
    { n: 3, area: "prime", title: "List multiples", test: "Q3" },
    { n: 4, area: "prime", title: "Common multiple", test: "Q4" },
    { n: 5, area: "lcm", title: "LCM (no shared factor)", test: "Q5" },
    { n: 6, area: "lcm", title: "LCM (shared factor)", test: "Q6" },
    { n: 7, area: "lcm", title: "Repeating schedules", test: "Q7" },
    { n: 8, area: "lcm", title: "LCD of two fractions", test: "Q8" },
    { n: 9, area: "lcm", title: "LCD when one fits the other", test: "Q9" },
    { n: 10, area: "frac", title: "Simplify a fraction", test: "Q10" },
    { n: 11, area: "frac", title: "Lowest terms", test: "Q11" },
    { n: 12, area: "frac", title: "Simplify a bigger fraction", test: "Q12" },
    { n: 13, area: "frac", title: "Equivalent fraction", test: "Q13" },
    { n: 14, area: "frac", title: "Missing numerator", test: "Q14" },
    { n: 15, area: "prime", title: "Which statement is true?", test: "Q15" }
  ];
  var AREAS = { prime: [1, 2, 3, 4, 15], lcm: [5, 6, 7, 8, 9], frac: [10, 11, 12, 13, 14] };
  var GAMES = {
    prime: { id: "prime", title: "Prime Patrol", objs: [1, 2, 3, 15] },
    match: { id: "match", title: "Multiple Match", objs: [4, 5, 6, 7, 8, 9] },
    forge: { id: "forge", title: "Fraction Forge", objs: [10, 11, 12, 13, 14] }
  };
  var STYLES = { 1: ["choice", "tiles"], 4: ["choice", "ladder"], 5: ["choice", "ladder"], 6: ["choice", "ladder"], 7: ["choice", "ladder"],
    10: ["choice", "forge"], 12: ["choice", "forge"], 13: ["choice", "forge"], 14: ["choice", "forge"] };

  /* ---------- building and checking questions ---------- */
  function choose(rng, correct, wrongs, count) {
    var seen = {}, w = [], all;
    count = count || 4;
    seen[correct.t] = 1;
    shuffle(rng, wrongs).forEach(function (x) { if (!seen[x.t]) { seen[x.t] = 1; w.push(x); } });
    if (w.length < count - 1) { throw new Error("not enough distractors"); }
    all = [{ t: correct.t, v: correct.v, ok: true }].concat(w.slice(0, count - 1).map(function (x) { return { t: x.t, v: x.v, ok: false }; }));
    all = shuffle(rng, all);
    all.forEach(function (o, i) { o.id = "o" + i; });
    return all;
  }
  function num(n) { return { t: String(n), v: n }; }
  function frac(n, d) { return { t: fr(n, d), v: [n, d] }; }
  function step(options, hint, why, prompt, multi) { return { prompt: prompt || null, options: options, multi: !!multi, hint: hint, why: why || "" }; }

  function validate(q) {
    if (!q || !q.steps || !q.steps.length || !q.prompt || !q.why) { return false; }
    return q.steps.every(function (s) {
      var seen = {}, oks = 0, i;
      if (s.options.length < 3) { return false; }
      for (i = 0; i < s.options.length; i++) {
        if (seen[s.options[i].t]) { return false; }
        seen[s.options[i].t] = 1;
        if (s.options[i].ok) { oks += 1; }
      }
      return s.multi ? (oks >= 1 && oks < s.options.length) : oks === 1;
    });
  }
  function ladderSpec(a, b, extra) { return { t: "ladders", a: a, b: b, upto: lcm(a, b) + (extra || 0) }; }

  /* ---------- Obj 1: spot a prime ---------- */
  function gPrime(rng, tier, style) {
    var P = tier === "easy" ? [2, 3, 5, 7, 11, 13] : [11, 13, 17, 19, 23, 29, 31, 37, 41, 43, 47, 53];
    var C = tier === "easy" ? [4, 6, 8, 9, 10, 12, 14, 15, 16, 18, 20, 21, 25] : [9, 15, 21, 25, 27, 33, 35, 39, 45, 49, 51, 55, 57, 63, 77, 91];
    var primes, comps, nums, opts, p, c, key, note;
    function compNote(n) { var f = smallestFactor(n); return n + " = " + f + " × " + (n / f); }
    if (style === "tiles") {
      primes = shuffle(rng, P).slice(0, 2 + rnd(rng, 3));
      comps = shuffle(rng, C).slice(0, 8 - primes.length);
      if (tier !== "easy" && rng() < 0.3) { comps[0] = 1; }
      nums = shuffle(rng, primes.concat(comps));
      opts = nums.map(function (n, i) { return { id: "o" + i, t: String(n), v: n, ok: isPrime(n) }; });
      key = "tiles:" + nums.slice().sort(function (x, y) { return x - y; }).join(",");
      note = comps.filter(function (n) { return n > 1; }).slice(0, 2).map(compNote).join("; ");
      return { obj: 1, key: key, style: "tiles", prompt: "Tap ALL the prime numbers.", meta: { rule: "prime-set" },
        why: "The primes are " + join(primes.slice().sort(function (x, y) { return x - y; })) + ". Each has only 1 and itself as factors. The rest have more: " + note + (comps.indexOf(1) >= 0 ? "; 1 has only one factor." : "."),
        steps: [step(opts, "A prime has exactly two factors: 1 and itself.", "", null, true)] };
    }
    p = pick(rng, P);
    comps = shuffle(rng, C).slice(0, 3);
    if (tier !== "easy" && rng() < 0.25) { comps[0] = 1; }
    c = comps.filter(function (n) { return n > 1; })[0];
    opts = choose(rng, num(p), comps.map(num));
    return { obj: 1, key: "prime:" + p + ":" + comps.join(","), style: "choice", prompt: "Which of these numbers is prime?", meta: { rule: "prime" },
      why: p + " has only two factors: 1 and " + p + ". For example " + compNote(c) + ", so " + c + " has more than two factors.",
      steps: [step(opts, "A prime has exactly two factors: 1 and itself. Try dividing each number by 3 or 5.", "")] };
  }

  /* ---------- Obj 2: why 1 is not prime ---------- */
  var ONE = [
    { prompt: "Why is the number 1 NOT a prime number?", ok: "It has only one factor, and a prime needs exactly two.", bad: ["It is an even number.", "It is a multiple of 2.", "It is too small to count."] },
    { prompt: "Which statement about the number 1 is true?", ok: "It has only one factor, so it is not prime.", bad: ["It is the smallest prime number.", "It is a composite number.", "It has exactly two factors."] },
    { prompt: "A prime has exactly 2 factors. How many factors does 1 have?", ok: "1 factor", bad: ["0 factors", "2 factors", "3 factors"] },
    { prompt: "Which number is neither prime nor composite?", ok: "1", bad: ["2", "9", "11"] },
    { prompt: "Which number has exactly one factor?", ok: "1", bad: ["2", "3", "4"] },
    { prompt: "Is 1 a prime number? Why or why not?", ok: "No. It has only one factor, but primes have exactly two.", bad: ["Yes. It is the first counting number.", "Yes. It can be divided by 1.", "No. It is an even number."] }
  ];
  function gOne(rng) {
    var i = rnd(rng, ONE.length), v = ONE[i], opts = choose(rng, { t: v.ok, v: v.ok }, v.bad.map(function (t) { return { t: t, v: t }; }));
    return { obj: 2, key: "one:" + i, style: "choice", prompt: v.prompt, meta: { rule: "static" },
      why: "A prime number has exactly two factors. The number 1 has just one factor (itself), so 1 is not prime. It is not composite either.",
      steps: [step(opts, "Count the factors of 1. How many does a prime number need?", "")] };
  }

  /* ---------- Obj 3: list multiples ---------- */
  function gMultiples(rng, tier) {
    var N = tier === "easy" ? [3, 4, 5, 6] : [6, 7, 8, 9, 11, 12], n = pick(rng, N), kind = pick(rng, ["list", "next", "which"]), correct, wrongs, opts, s, k;
    function L(arr) { return { t: join(arr), v: arr }; }
    if (kind === "list") {
      s = n === 3 ? 2 : 3;
      correct = L([n, 2 * n, 3 * n, 4 * n]);
      wrongs = [L([2 * n, 3 * n, 4 * n, 5 * n]), L([1, n, 2 * n, 3 * n]), L([n, n + s, n + 2 * s, n + 3 * s]), L([n, 2 * n, 3 * n, 5 * n])];
      opts = choose(rng, correct, wrongs);
      return { obj: 3, key: "mult-list:" + n, style: "choice", prompt: "Which list shows the first four nonzero multiples of " + n + "?", meta: { rule: "multiples-list", n: n },
        why: "Multiples of " + n + " are " + n + " × 1, " + n + " × 2, " + n + " × 3, " + n + " × 4 = " + join(correct.v) + ".",
        steps: [step(opts, "Count by " + n + "s, starting at " + n + " (not at 1).", "")] };
    }
    if (kind === "next") {
      correct = num(4 * n);
      wrongs = [num(5 * n), num(3 * n + 1), num(4 * n - 1), num(4 * n + 1), num(3 * n + 3), num(3 * n + 2)];
      opts = choose(rng, correct, wrongs);
      return { obj: 3, key: "mult-next:" + n, style: "choice", prompt: "Complete the pattern of multiples: " + join([n, 2 * n, 3 * n]) + ", ___", meta: { rule: "next-multiple", n: n, shown: 3 },
        why: "The pattern adds " + n + " each time: " + (3 * n) + " + " + n + " = " + (4 * n) + ".",
        steps: [step(opts, "How much is added each step? Add that to the last number.", "")] };
    }
    k = 3 + rnd(rng, 6);
    correct = num(n * k);
    wrongs = [num(n * k + 1), num(n * k - 1), num(n * k + 2), num(n * k - 2), num(n * (k - 1) + 1)].filter(function (o) { return o.v % n !== 0; });
    opts = choose(rng, correct, wrongs);
    return { obj: 3, key: "mult-which:" + n + ":" + k, style: "choice", prompt: "Which number is a multiple of " + n + "?", meta: { rule: "is-multiple", n: n },
      why: n + " × " + k + " = " + (n * k) + ", so " + (n * k) + " is a multiple of " + n + ". The others are not in the " + n + "s counting pattern.",
      steps: [step(opts, "A multiple of " + n + " is " + n + " times a whole number.", "")] };
  }

  /* ---------- Obj 4: common multiple ---------- */
  var CM_EASY = [[2, 3], [3, 4], [3, 5], [2, 5], [4, 6]], CM_STD = [[4, 6], [6, 8], [6, 9], [4, 10], [8, 12], [5, 6], [3, 8], [4, 5], [6, 10]];
  function gCommonMultiple(rng, tier, style) {
    var pr = pick(rng, tier === "easy" ? CM_EASY : CM_STD), a = pr[0], b = pr[1], L = lcm(a, b), cor = L * (tier === "easy" || style === "ladder" ? 1 : 1 + rnd(rng, 2)), wrongs = [], m, opts;
    for (m = 2; m <= 8; m++) {
      if ((a * m) % b !== 0 && a * m !== cor) { wrongs.push(num(a * m)); }
      if ((b * m) % a !== 0 && b * m !== cor) { wrongs.push(num(b * m)); }
    }
    wrongs = wrongs.filter(function (o) { return o.v <= 60; });
    opts = choose(rng, num(cor), wrongs);
    return { obj: 4, key: "cm:" + a + "," + b + ":" + cor, style: style === "ladder" ? "ladder" : "choice", visual: style === "ladder" ? ladderSpec(a, b, a === b ? 0 : Math.max(a, b)) : null,
      prompt: "Which number is a common multiple of both " + a + " and " + b + "?", meta: { rule: "common-multiple", a: a, b: b },
      why: cor + " is in the " + a + "s list (" + a + " × " + (cor / a) + ") AND in the " + b + "s list (" + b + " × " + (cor / b) + "). The others miss one list.",
      steps: [step(opts, "A common multiple is in BOTH counting lists. Is it a multiple of " + a + "? Of " + b + "?", "")] };
  }

  /* ---------- Obj 5 and 6: LCM ---------- */
  var L5E = [[2, 3], [3, 4], [2, 5], [3, 5], [4, 5]], L5S = [[4, 5], [3, 7], [5, 6], [4, 7], [3, 8], [5, 7], [2, 9], [5, 8], [3, 10], [5, 9], [2, 7], [4, 9]];
  var L6E = [[4, 6], [6, 9], [4, 10], [6, 10]], L6S = [[6, 8], [8, 12], [10, 15], [9, 12], [12, 18], [4, 14], [6, 15], [8, 10], [6, 14], [9, 15], [4, 6], [6, 9]];
  function lcmWrongs(a, b, L) {
    var c = [num(a * b), num(a + b), num(Math.max(a, b)), num(L * 2), num(L + Math.min(a, b)), num(L - Math.min(a, b)), num(Math.max(a, b) * 2)];
    return c.filter(function (o) { return o.v !== L && o.v > 1; });
  }
  function gLcm(rng, tier, style, obj) {
    var list = obj === 5 ? (tier === "easy" ? L5E : L5S) : (tier === "easy" ? L6E : L6S), pr = pick(rng, list), a = pr[0], b = pr[1], L = lcm(a, b), opts;
    opts = choose(rng, num(L), lcmWrongs(a, b, L));
    return { obj: obj, key: "lcm:" + a + "," + b, style: style === "ladder" ? "ladder" : "choice", visual: style === "ladder" ? ladderSpec(a, b, Math.max(a, b)) : null,
      prompt: "What is the Least Common Multiple (LCM) of " + a + " and " + b + "?", meta: { rule: "lcm", a: a, b: b },
      why: "The first number in both lists is " + L + ". Multiples of " + a + ": " + join(multiplesUpTo(a, L)) + ". Multiples of " + b + ": " + join(multiplesUpTo(b, L)) + ".",
      steps: [step(opts, "List multiples of each number. Which is the FIRST one that appears in both lists?", "")] };
  }
  function multiplesUpTo(n, top) { var out = [], m; for (m = n; m <= top; m += n) { out.push(m); } return out; }

  /* ---------- Obj 7: repeating schedule ---------- */
  var STORY = [
    "Liam practices piano every {a} days and swims every {b} days. If he did both today, in how many days will he do both on the same day again?",
    "A robot waters plants every {a} days. Another robot cleans the pool every {b} days. If both worked today, in how many days will both work on the same day again?",
    "Mia goes to the library every {a} days and to soccer every {b} days. If she did both today, in how many days will she do both on the same day again?",
    "A light blinks every {a} seconds and a bell rings every {b} seconds. They both went off together just now. In how many seconds will they go off together again?"
  ];
  var S_EASY = [[2, 3], [3, 4], [2, 5], [3, 5], [4, 6]], S_STD = [[4, 6], [6, 9], [4, 10], [6, 8], [3, 4], [8, 12], [5, 6], [10, 15], [4, 14]];
  function gStory(rng, tier, style) {
    var pr = pick(rng, tier === "easy" ? S_EASY : S_STD), a = pr[0], b = pr[1], L = lcm(a, b), si = rnd(rng, STORY.length), unit = si === 3 ? "seconds" : "days", opts;
    opts = choose(rng, num(L), lcmWrongs(a, b, L));
    return { obj: 7, key: "story:" + a + "," + b + ":" + si, style: style === "ladder" ? "ladder" : "choice", visual: style === "ladder" ? ladderSpec(a, b, Math.max(a, b)) : null,
      prompt: STORY[si].replace("{a}", a).replace("{b}", b), meta: { rule: "lcm", a: a, b: b },
      why: "Both happen again at the first number in both counting lists. Every " + a + " and every " + b + " first meet at " + L + " " + unit + ", the LCM of " + a + " and " + b + ".",
      steps: [step(opts, "Count by " + a + "s and by " + b + "s. What is the first " + (unit === "days" ? "day" : "time") + " they both land on?", "")] };
  }

  /* ---------- Obj 8 and 9: LCD ---------- */
  var D8E = [[2, 3], [3, 4], [2, 5], [3, 5], [4, 5]], D8S = [[3, 4], [4, 6], [6, 8], [3, 8], [5, 6], [4, 10], [6, 9], [2, 7], [3, 10], [4, 9], [5, 8], [6, 10]];
  var D9E = [[2, 4], [3, 6], [5, 10], [2, 6]], D9S = [[5, 10], [3, 9], [4, 8], [3, 6], [6, 12], [5, 15], [4, 12], [2, 8], [3, 12], [2, 10], [6, 18], [5, 20]];
  function gLcd(rng, tier, style, obj) {
    var list = obj === 8 ? (tier === "easy" ? D8E : D8S) : (tier === "easy" ? D9E : D9S), pr = pick(rng, list), a = pr[0], b = pr[1], L = lcm(a, b), x, y, opts, wr;
    x = 1 + rnd(rng, a - 1); y = 1 + rnd(rng, b - 1);
    if (rng() < 0.5) { var t = a; a = b; b = t; x = 1 + rnd(rng, a - 1); y = 1 + rnd(rng, b - 1); }
    wr = [num(a * b), num(a + b), num(L * 2), num(Math.min(a, b)), num(L + Math.min(a, b))].filter(function (o) { return o.v !== L && o.v > 1; });
    opts = choose(rng, num(L), wr);
    return { obj: obj, key: "lcd:" + Math.min(a, b) + "," + Math.max(a, b), style: "choice",
      prompt: "What is the Least Common Denominator (LCD) of " + fr(x, a) + " and " + fr(y, b) + "?", meta: { rule: "lcd", a: a, b: b },
      why: "The LCD is the LCM of the denominators " + a + " and " + b + ". The first number in both lists is " + L + (obj === 9 ? ", because " + Math.max(a, b) + " is already a multiple of " + Math.min(a, b) + "." : "."),
      steps: [step(opts, "Look only at the denominators (bottom numbers). Find their least common multiple.", "")] };
  }

  /* ---------- Obj 10, 11, 12: simplify ---------- */
  var LOW = [[1, 2], [1, 3], [2, 3], [1, 4], [3, 4], [1, 5], [2, 5], [3, 5], [4, 5], [1, 6], [5, 6], [1, 7], [2, 7], [3, 7], [1, 8], [3, 8], [5, 8]];
  function simplifyParams(obj, tier) {
    if (obj === 10) { return tier === "easy" ? { gs: [2, 3], maxD: 15 } : { gs: [2, 3, 4], maxD: 20 }; }
    if (obj === 11) { return tier === "easy" ? { gs: [2, 3, 4], maxD: 20 } : { gs: [3, 4, 5], maxD: 30 }; }
    return tier === "easy" ? { gs: [3, 4, 5], maxD: 24 } : { gs: [4, 5, 6, 8], maxD: 36 };
  }
  function pickSimplify(rng, obj, tier) {
    var cfg = simplifyParams(obj, tier), i, lp, g;
    for (i = 0; i < 80; i++) {
      lp = pick(rng, LOW); g = pick(rng, cfg.gs);
      if (lp[1] * g <= cfg.maxD) { return { p: lp[0], q: lp[1], g: g, n: lp[0] * g, d: lp[1] * g }; }
    }
    throw new Error("no simplify pick");
  }
  function properDivisors(g) { return factors(g).filter(function (h) { return h > 1 && h < g; }); }
  function simplifyWrongs(rng, s) {
    var out = [], divs = properDivisors(s.g), h, c;
    if (divs.length) { h = pick(rng, divs); out.push(frac(s.n / h, s.d / h)); }
    c = [frac(s.p + 1, s.q), frac(s.p, s.q + 1), frac(s.q, s.p), frac(s.p + 1, s.q + 1), frac(s.n - s.g, s.d - s.g)];
    c.forEach(function (o) {
      var x = o.v[0], y = o.v[1];
      if (x > 0 && y > 0 && x * s.q !== s.p * y && !(x === s.n && y === s.d)) { out.push(o); }
    });
    return out;
  }
  function gSimplify(rng, tier, style, obj) {
    var s = pickSimplify(rng, obj, tier), correct = frac(s.p, s.q), qd, opts, why, hint;
    why = "The biggest number that goes into both " + s.n + " and " + s.d + " is " + s.g + ". Divide the top AND bottom by " + s.g + ": " + fr(s.n, s.d) + " = " + fr(s.p, s.q) + ".";
    hint = "Divide the top AND the bottom by the same number. Is your answer in lowest terms (nothing but 1 divides both)?";
    if (style === "forge") {
      return { obj: obj, key: "simp:" + s.n + "/" + s.d, style: "forge", prompt: "Simplify " + fr(s.n, s.d) + " to lowest terms.", meta: { rule: "simplify", n: s.n, d: s.d }, why: why,
        steps: [forgeFactor(rng, s), forgeResult(rng, s)] };
    }
    qd = obj === 11 ? "Which of these is " + fr(s.n, s.d) + " written in lowest terms?" : "Simplify the fraction " + fr(s.n, s.d) + " to its lowest terms.";
    opts = choose(rng, correct, simplifyWrongs(rng, s));
    return { obj: obj, key: "simp:" + s.n + "/" + s.d, style: "choice", prompt: qd, meta: { rule: "simplify", n: s.n, d: s.d }, why: why, steps: [step(opts, hint, "")] };
  }
  function forgeFactor(rng, s) {
    var common = factors(s.g).filter(function (h) { return h > 1 && h < s.g; }), wrongs = [], c, i;
    if (common.length) { wrongs.push(num(pick(rng, common))); }
    c = [s.g + 1, s.g + 2, s.g - 1, s.g + 3];
    c.forEach(function (x) { if (x > 1 && (s.n % x !== 0 || s.d % x !== 0)) { wrongs.push(num(x)); } });
    for (i = 2; i < 12; i++) { if (i !== s.g && (s.n % i !== 0 || s.d % i !== 0)) { wrongs.push(num(i)); } }
    return step(choose(rng, num(s.g), wrongs), "Think: which numbers go into BOTH " + s.n + " and " + s.d + "? Pick the biggest one.",
      "The biggest number that divides both " + s.n + " and " + s.d + " is " + s.g + ".", "Pick the biggest number that goes into both " + s.n + " and " + s.d + ".");
  }
  function forgeResult(rng, s) {
    var wrongs = [frac(s.n / s.g, s.d), frac(s.n, s.d / s.g), frac(s.p + 1, s.q), frac(s.p, s.q + 1)], divs = properDivisors(s.g);
    if (divs.length) { wrongs.push(frac(s.n / divs[0], s.d / divs[0])); }
    return step(choose(rng, frac(s.p, s.q), wrongs), "Divide the top AND the bottom by " + s.g + ".",
      fr(s.n, s.d) + " ÷ " + s.g + " on top and bottom = " + fr(s.p, s.q) + ".", "Divide the top and the bottom by " + s.g + ". What fraction do you get?");
  }

  /* ---------- Obj 11: identify lowest terms ---------- */
  var REDUCIBLE = [[4, 6], [6, 9], [10, 15], [8, 12], [6, 8], [9, 12], [6, 10], [12, 16], [15, 20], [14, 21], [10, 14], [8, 10]];
  var ALREADY = [[5, 8], [7, 9], [3, 7], [5, 12], [7, 10], [3, 8], [2, 5], [4, 9], [5, 6], [3, 10]];
  function gLowest(rng, tier, style) {
    var a, bad, opts;
    if (rng() < 0.5) { return gSimplify(rng, tier, style === "forge" ? "choice" : style, 11); }
    a = pick(rng, ALREADY); bad = shuffle(rng, REDUCIBLE).slice(0, 3);
    opts = choose(rng, frac(a[0], a[1]), bad.map(function (x) { return frac(x[0], x[1]); }));
    return { obj: 11, key: "lowest:" + a[0] + "/" + a[1], style: "choice", prompt: "Which fraction is already in lowest terms?", meta: { rule: "lowest-id" },
      why: fr(a[0], a[1]) + " is in lowest terms because 1 is the only number that goes into both " + a[0] + " and " + a[1] + ". In the others, a bigger number goes into both, so they can still be simplified.",
      steps: [step(opts, "Lowest terms means the top and bottom share no factor except 1. Try dividing each by 2, 3, or 5.", "")] };
  }

  /* ---------- Obj 13 and 14: equivalent fractions ---------- */
  function pickEquiv(rng, tier) {
    var i, lp, k;
    for (i = 0; i < 80; i++) {
      lp = pick(rng, LOW); k = tier === "easy" ? 2 + rnd(rng, 3) : 3 + rnd(rng, 4);
      if (lp[1] >= 2 && lp[1] * k <= (tier === "easy" ? 20 : 36) && lp[0] >= 1) { return { a: lp[0], b: lp[1], k: k, D: lp[1] * k, N: lp[0] * k }; }
    }
    throw new Error("no equiv pick");
  }
  function gEquiv(rng, tier, style) {
    var e = pickEquiv(rng, tier), wr, opts;
    wr = [frac(e.a + e.D - e.b, e.D), frac(e.a * (e.k - 1), e.D), frac(e.a * (e.k + 1), e.D), frac(e.N + 1, e.D), frac(e.a + e.k, e.D), frac(e.N - 1, e.D)]
      .filter(function (o) { return o.v[0] > 0 && o.v[0] * e.b !== e.a * e.D; });
    if (style === "forge") {
      return { obj: 13, key: "eq:" + e.a + "/" + e.b + ">" + e.D, style: "forge", prompt: "Make " + fr(e.a, e.b) + " into an equal fraction with " + e.D + " on the bottom.", meta: { rule: "equiv", a: e.a, b: e.b, D: e.D },
        why: whyEquiv(e), steps: [forgeMult(rng, e), forgeNum(rng, e, true)] };
    }
    opts = choose(rng, frac(e.N, e.D), wr);
    return { obj: 13, key: "eq:" + e.a + "/" + e.b + ">" + e.D, style: "choice", prompt: "Which fraction is equal to " + fr(e.a, e.b) + " and has " + e.D + " as its denominator?", meta: { rule: "equiv", a: e.a, b: e.b, D: e.D },
      why: whyEquiv(e), steps: [step(opts, "What do you multiply " + e.b + " by to get " + e.D + "? Do the same to the top.", "")] };
  }
  function whyEquiv(e) { return e.b + " × " + e.k + " = " + e.D + ", so multiply the top by " + e.k + " too: " + e.a + " × " + e.k + " = " + e.N + ". " + fr(e.a, e.b) + " = " + fr(e.N, e.D) + "."; }
  function forgeMult(rng, e) {
    var w = [num(e.k + 1), num(e.k - 1), num(e.D - e.b), num(e.k + 2), num(e.k * 2)].filter(function (o) { return o.v > 1; });
    return step(choose(rng, num(e.k), w), "What number times " + e.b + " makes " + e.D + "?", e.b + " × " + e.k + " = " + e.D + ".", "What do you multiply " + e.b + " by to get " + e.D + "?");
  }
  function forgeNum(rng, e, asFraction) {
    var w = [num(e.k), num(e.a + e.k), num(e.a * e.b), num(e.a + e.D - e.b), num(e.N + 1), num(e.N - 1), num(e.a * (e.k + 1))].filter(function (o) { return o.v > 0 && o.v !== e.N; });
    return step(choose(rng, num(e.N), w), "Multiply the top by the same number you used on the bottom.", e.a + " × " + e.k + " = " + e.N + ".",
      "Do the same to the top. " + fr(e.a, e.b) + " = " + fr("?", e.D));
  }
  function gMissing(rng, tier, style) {
    var e = pickEquiv(rng, tier), wr, opts;
    if (style === "forge") {
      return { obj: 14, key: "mn:" + e.a + "/" + e.b + ">" + e.D, style: "forge", prompt: "Find the missing numerator: " + fr(e.a, e.b) + " = " + fr("?", e.D), meta: { rule: "missing-numerator", a: e.a, b: e.b, D: e.D },
        why: whyEquiv(e), steps: [forgeMult(rng, e), forgeNum(rng, e, false)] };
    }
    wr = [num(e.k), num(e.a + e.k), num(e.a * e.b), num(e.a + e.D - e.b), num(e.N + 1), num(e.N - 1), num(e.a * (e.k + 1))].filter(function (o) { return o.v > 0 && o.v !== e.N; });
    opts = choose(rng, num(e.N), wr);
    return { obj: 14, key: "mn:" + e.a + "/" + e.b + ">" + e.D, style: "choice", prompt: "What is the missing numerator? " + fr(e.a, e.b) + " = " + fr("?", e.D), meta: { rule: "missing-numerator", a: e.a, b: e.b, D: e.D },
      why: whyEquiv(e), steps: [step(opts, "The bottom was multiplied by " + e.k + ". Multiply the top by the same number.", "")] };
  }

  /* ---------- Obj 15: which statement is true ---------- */
  function statements() {
    var S = [];
    function add(t, v) { S.push({ t: t, v: v }); }
    add("The number 2 is the only even prime number.", true);
    add("The number 1 is not a prime number.", true);
    add("A prime number has exactly two factors.", true);
    add("13 is a prime number.", isPrime(13));
    add("The LCM of 4 and 6 is 12.", lcm(4, 6) === 12);
    add("The LCM of 3 and 5 is 15.", lcm(3, 5) === 15);
    add("24 is a common multiple of 4 and 6.", 24 % 4 === 0 && 24 % 6 === 0);
    add("The LCD of " + fr(1, 2) + " and " + fr(1, 5) + " is 10.", lcm(2, 5) === 10);
    add(fr(6, 8) + " in lowest terms is " + fr(3, 4) + ".", 6 / gcd(6, 8) === 3 && 8 / gcd(6, 8) === 4);
    add(fr(10, 15) + " in lowest terms is " + fr(2, 3) + ".", 10 / gcd(10, 15) === 2 && 15 / gcd(10, 15) === 3);
    add(fr(4, 6) + " and " + fr(2, 3) + " are equivalent fractions.", 4 * 3 === 2 * 6);
    add("Every multiple of 5 ends in 0 or 5.", true);
    add("The LCM of 2 and 3 is 5.", lcm(2, 3) === 5);
    add("The LCM of 4 and 6 is 24.", lcm(4, 6) === 24);
    add("The LCM of 6 and 8 is 48.", lcm(6, 8) === 48);
    add("All odd numbers are prime numbers.", false);
    add("All prime numbers are odd.", false);
    add("The number 1 is a prime number.", false);
    add("9 is a prime number.", isPrime(9));
    add("15 is a prime number.", isPrime(15));
    add(fr(6, 8) + " in lowest terms is " + fr(2, 3) + ".", 6 / gcd(6, 8) === 2 && 8 / gcd(6, 8) === 3);
    add(fr(8, 12) + " in lowest terms is " + fr(4, 6) + ".", 8 / gcd(8, 12) === 4 && 12 / gcd(8, 12) === 6);
    add("The LCD of " + fr(1, 3) + " and " + fr(1, 4) + " is 7.", lcm(3, 4) === 7);
    add("20 is a common multiple of 3 and 5.", 20 % 3 === 0 && 20 % 5 === 0);
    add(fr(3, 5) + " = " + fr(12, 15) + ".", 3 * 15 === 5 * 12);
    add("The first four multiples of 7 are 7, 14, 20, 28.", false);
    add("A number with exactly three factors is prime.", false);
    return S;
  }
  var STATEMENTS = statements();
  function gTrue(rng, tier) {
    var T = STATEMENTS.filter(function (s) { return s.v; }), F = STATEMENTS.filter(function (s) { return !s.v; }), t = pick(rng, T), fs = shuffle(rng, F).slice(0, 3), all, opts;
    if (tier === "easy") {
      T = T.filter(function (s) { return /prime|multiple|LCM of 3/.test(s.t); }); t = pick(rng, T);
    }
    all = shuffle(rng, [t].concat(fs));
    opts = all.map(function (s, i) { return { id: "o" + i, t: s.t, v: s.v, ok: s.v === true }; });
    return { obj: 15, key: "true:" + t.t, style: "choice", prompt: "Which of these statements is true?", meta: { rule: "true-statement" },
      why: "This one is true: \"" + t.t + "\" Check each statement with what you know, then pick the one that holds up every time.",
      steps: [step(opts, "Test each statement. Look for an example that breaks it, like an odd number that is not prime.", "")] };
  }

  var GEN = {
    1: gPrime, 2: gOne, 3: gMultiples, 4: gCommonMultiple,
    5: function (r, t, s) { return gLcm(r, t, s, 5); }, 6: function (r, t, s) { return gLcm(r, t, s, 6); }, 7: gStory,
    8: function (r, t, s) { return gLcd(r, t, s, 8); }, 9: function (r, t, s) { return gLcd(r, t, s, 9); },
    10: function (r, t, s) { return gSimplify(r, t, s, 10); }, 11: gLowest, 12: function (r, t, s) { return gSimplify(r, t, s, 12); },
    13: gEquiv, 14: gMissing, 15: gTrue
  };

  /* gen(obj, {tier:'easy'|'std', style:'choice'|'tiles'|'ladder'|'forge', avoid:[keys], rng}) */
  function gen(obj, opt) {
    opt = opt || {};
    var rng = opt.rng || Math.random, tier = opt.tier || "std", style = opt.style || "choice", avoid = opt.avoid || [], q = null, tries, last = null;
    if ((STYLES[obj] || ["choice"]).indexOf(style) < 0) { style = "choice"; }
    for (tries = 0; tries < 80; tries++) {
      try { q = GEN[obj](rng, tier, style); } catch (e) { q = null; }
      if (q && validate(q)) {
        last = q;
        if (avoid.indexOf(q.key) < 0) { return q; }
      }
    }
    if (last) { return last; }
    throw new Error("could not build question for objective " + obj);
  }

  /* ---------- short worked examples shown after a miss ---------- */
  var TEACH = {
    1: { title: "Prime numbers", lines: ["A prime has exactly 2 factors: 1 and itself.", "7: factors 1, 7 → prime ✓", "9: factors 1, 3, 9 → not prime ✗"], visual: { t: "factors", nums: [7, 9] }, avoid: [] },
    2: { title: "Why 1 is not prime", lines: ["A prime needs exactly 2 factors.", "1 has only one factor: 1.", "So 1 is not prime. The first prime is 2."], visual: { t: "factors", nums: [1, 2] }, avoid: [] },
    3: { title: "Multiples", lines: ["Multiples: count by the number.", "Multiples of 6: 6, 12, 18, 24", "Start at 6 × 1. Not 1, not 0."], visual: null, avoid: ["mult-list:6", "mult-next:6"] },
    4: { title: "Common multiples", lines: ["Write the counting lists.", "A common multiple is in BOTH lists.", "3s: 3, 6, 9, 12 and 4s: 4, 8, 12 → 12 is in both."], visual: { t: "ladders", a: 3, b: 4, upto: 12, reveal: true }, avoid: ["cm:3,4:12"] },
    5: { title: "Least Common Multiple", lines: ["LCM = the FIRST number in both lists.", "2s: 2, 4, 6, 8, 10 and 5s: 5, 10 → LCM is 10."], visual: { t: "ladders", a: 2, b: 5, upto: 10, reveal: true }, avoid: ["lcm:2,5"] },
    6: { title: "LCM with a shared factor", lines: ["Count both lists and stop at the first match.", "4s: 4, 8, 12 and 6s: 6, 12 → LCM is 12.", "24 is also in both, but 12 comes first."], visual: { t: "ladders", a: 4, b: 6, upto: 24, reveal: true }, avoid: ["lcm:4,6"] },
    7: { title: "Repeating schedules", lines: ["“Both again” means the LCM.", "Every 2 days and every 3 days: 2, 4, 6 and 3, 6 → both on day 6."], visual: { t: "ladders", a: 2, b: 3, upto: 6, reveal: true }, avoid: ["story:2,3"] },
    8: { title: "Least Common Denominator", lines: ["LCD = the LCM of the denominators.", "{1/2} and {1/3}: 2s: 2, 4, 6 and 3s: 3, 6 → LCD is 6."], visual: { t: "ladders", a: 2, b: 3, upto: 6, reveal: true }, avoid: ["lcd:2,3"] },
    9: { title: "When one fits the other", lines: ["{1/2} and {1/4}: 4 is a multiple of 2.", "So the bigger denominator, 4, is the LCD."], visual: { t: "ladders", a: 2, b: 4, upto: 4, reveal: true }, avoid: ["lcd:2,4"] },
    10: { title: "Simplify a fraction", lines: ["Find the biggest number that goes into both. Divide the top AND bottom by it.", "{6/9}: 3 goes into 6 and 9. 6 ÷ 3 = 2 and 9 ÷ 3 = 3 → {2/3}."], visual: { t: "bars", n: 6, d: 9, n2: 2, d2: 3 }, avoid: ["simp:6/9"] },
    11: { title: "Lowest terms", lines: ["Lowest terms: the top and bottom share no factor except 1.", "{4/6}: both divide by 2 → not lowest.", "{2/3}: only 1 divides both → lowest ✓"], visual: { t: "bars", n: 4, d: 6, n2: 2, d2: 3 }, avoid: ["simp:4/6", "lowest:2/3"] },
    12: { title: "Simplify a bigger fraction", lines: ["Look for the biggest number that goes into both.", "{12/18}: 6 goes into 12 and 18. 12 ÷ 6 = 2, 18 ÷ 6 = 3 → {2/3}."], visual: { t: "bars", n: 12, d: 18, n2: 2, d2: 3 }, avoid: ["simp:12/18"] },
    13: { title: "Equivalent fractions", lines: ["Multiply the top AND the bottom by the same number.", "{2/3} → × 4 on top and bottom → {8/12}. Same amount, new name."], visual: { t: "bars", n: 2, d: 3, n2: 8, d2: 12 }, avoid: ["eq:2/3>12"] },
    14: { title: "Missing numerator", lines: ["Find what the bottom was multiplied by, then do the same to the top.", "{3/4} = {?/12}: 4 × 3 = 12, so 3 × 3 = 9 → {9/12}."], visual: { t: "bars", n: 3, d: 4, n2: 9, d2: 12 }, avoid: ["mn:3/4>12"] },
    15: { title: "True statements", lines: ["Test each statement. One example that breaks it makes it false.", "Facts: 2 is the only even prime. 1 is not prime. The LCM is the first number in both lists."], visual: null, avoid: [] }
  };

  root.MM = { gcd: gcd, lcm: lcm, isPrime: isPrime, factors: factors, OBJECTIVES: OBJECTIVES, AREAS: AREAS, GAMES: GAMES, STYLES: STYLES, TEACH: TEACH,
    gen: gen, validate: validate, seeded: seeded, shuffle: shuffle };
  if (typeof module !== "undefined" && module.exports) { module.exports = root.MM; }
}(typeof window !== "undefined" ? window : globalThis));

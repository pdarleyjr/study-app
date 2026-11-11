/* Fractions: Quick Review — pure data + pure functions (testable in Node).
   Topic: Mixed Numbers; Fractions Greater Than or Equal to One.
   Every quiz answer and distractor is computed here, never typed by hand. */
(function (root) {
  "use strict";

  /* ---------- core math ---------- */
  function gcd(a, b) { a = Math.abs(a); b = Math.abs(b); while (b) { var t = a % b; a = b; b = t; } return a; }
  function simplify(n, d) { var g = gcd(n, d) || 1; return { n: n / g, d: d / g }; }
  // improper fraction -> whole + remainder over the SAME denominator (not simplified)
  function toMixed(n, d) { return { w: Math.floor(n / d), n: n % d, d: d }; }
  function toMixedSimplest(n, d) {
    var m = toMixed(n, d);
    if (m.n === 0) return { w: m.w, n: 0, d: 1 };
    var s = simplify(m.n, m.d);
    return { w: m.w, n: s.n, d: s.d };
  }
  function fromMixed(w, n, d) { return { n: w * d + n, d: d }; }
  // the book rounds exactly one half UP (6 1/2 -> 7)
  function roundMixed(w, n, d) { return 2 * n >= d ? w + 1 : w; }
  function nearestWhole(n, d) { var m = toMixed(n, d); return roundMixed(m.w, m.n, m.d); }
  function isGreaterThanOne(n, d) { return n > d; }
  function equalsOne(n, d) { return n === d; }

  var ONES = ["zero", "one", "two", "three", "four", "five", "six", "seven", "eight", "nine", "ten", "eleven", "twelve",
    "thirteen", "fourteen", "fifteen", "sixteen", "seventeen", "eighteen", "nineteen"];
  var TENS = ["", "", "twenty", "thirty", "forty", "fifty", "sixty", "seventy", "eighty", "ninety"];
  function numberWord(n) {
    if (n < 20) return ONES[n];
    var t = Math.floor(n / 10), o = n % 10;
    return TENS[t] + (o ? "-" + ONES[o] : "");
  }
  var DEN_WORDS = { 2: "half", 3: "third", 4: "fourth", 5: "fifth", 6: "sixth", 7: "seventh", 8: "eighth", 9: "ninth", 10: "tenth", 11: "eleventh", 12: "twelfth" };
  function denWord(n, d) {
    if (d === 2) return n === 1 ? "half" : "halves";
    var w = DEN_WORDS[d] || (numberWord(d) + "th");
    return n === 1 ? w : w + "s";
  }
  function fracWords(n, d) { return numberWord(n) + " " + denWord(n, d); }
  function mixedWords(w, n, d) { return n ? numberWord(w) + " and " + fracWords(n, d) : numberWord(w); }

  /* ---------- reading what a child types ---------- */
  // Returns { type:"int"|"frac"|"mixed", w, n, d } or null.
  function parseAnswer(str) {
    if (str == null) return null;
    var s = String(str).toLowerCase().replace(/[⁄∕]/g, "/").replace(/\band\b/g, " ").replace(/[-_,]/g, " ");
    s = s.replace(/\s*\/\s*/g, "/").replace(/\s+/g, " ").trim();
    var m;
    if ((m = /^(\d+)$/.exec(s))) return { type: "int", w: +m[1], n: 0, d: 1 };
    if ((m = /^(\d+)\/(\d+)$/.exec(s))) { if (+m[2] === 0) return null; return { type: "frac", w: 0, n: +m[1], d: +m[2] }; }
    if ((m = /^(\d+) (\d+)\/(\d+)$/.exec(s))) { if (+m[3] === 0) return null; return { type: "mixed", w: +m[1], n: +m[2], d: +m[3] }; }
    return null;
  }
  function valueOf(p) { return fromMixed(p.w, p.n, p.d); }
  function sameValue(a, b) { return a.n * b.d === b.n * a.d; }

  // Grade a typed mixed number against the expected mixed number in simplest form.
  // status: "correct" | "unsimplified" | "improper" | "wrong" | "invalid"
  function gradeMixed(input, w, n, d) {
    var p = parseAnswer(input);
    if (!p) return "invalid";
    var want = fromMixed(w, n, d), got = valueOf(p);
    if (!sameValue(want, got)) return "wrong";
    if (n === 0) return p.type === "int" ? "correct" : (p.type === "mixed" && p.n === 0 ? "correct" : "improper");
    if (p.type !== "mixed") return "improper";
    if (p.n >= p.d) return "improper";
    if (p.w === w && p.n === n && p.d === d) return "correct";
    return "unsimplified";
  }
  // Grade a whole-number answer (also accepts k/1).
  function gradeWhole(input, k) {
    var p = parseAnswer(input);
    if (!p) return "invalid";
    if (p.type === "int") return p.w === k ? "correct" : "wrong";
    if (p.type === "frac" && p.d === 1) return p.n === k ? "correct" : "wrong";
    return "wrong";
  }

  /* ---------- visuals ---------- */
  function wedgePath(cx, cy, r, d, i) {
    var a1 = -Math.PI / 2 + (2 * Math.PI * i) / d, a2 = -Math.PI / 2 + (2 * Math.PI * (i + 1)) / d;
    var x1 = cx + r * Math.cos(a1), y1 = cy + r * Math.sin(a1), x2 = cx + r * Math.cos(a2), y2 = cy + r * Math.sin(a2);
    function f(v) { return Math.round(v * 100) / 100; }
    return "M" + cx + " " + cy + "L" + f(x1) + " " + f(y1) + "A" + r + " " + r + " 0 " + (d === 1 ? 1 : 0) + " 1 " + f(x2) + " " + f(y2) + "Z";
  }
  // circles: array of shaded-piece counts, all cut into d parts
  function circlesSvg(counts, d, label) {
    var r = 44, gap = 12, w = counts.length * (2 * r + gap) + gap, parts = "";
    counts.forEach(function (c, ci) {
      var cx = gap + r + ci * (2 * r + gap), cy = r + 8;
      for (var i = 0; i < d; i++) {
        parts += '<path d="' + wedgePath(cx, cy, r, d, i) + '" fill="' + (i < c ? "#e46a12" : "#fff") + '" stroke="#18264b" stroke-width="2.5" stroke-linejoin="round"/>';
      }
    });
    return '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ' + w + " " + (2 * r + 16) + '" width="' + w * 1.5 + '" role="img" aria-label="' + label + '">' + parts + "</svg>";
  }

  /* ---------- worksheet p.47 problems (so the quiz never repeats them) ---------- */
  var WORKSHEET = {
    mixed: ["2 1/4", "5 3/10", "8 1/5", "10 6/7", "3 7/12", "2 9/11", "15 2/3", "3 2/3", "3 4/8", "3 1/2"],
    rounding: ["7 9/10", "4 3/4", "6 1/2", "8 1/3", "9 3/8"],
    equalOneDen: ["18", "20", "12", "21", "17", "19", "16"],
    greaterDen: ["3", "5", "6", "12", "9", "15", "20"],
    improper: ["28/8", "17/5", "20/5", "11/6", "14/3", "54/6", "16/3", "36/4", "37/7", "7/4"],
    closer: ["14/5", "19/3", "62/7", "94/8", "83/9"]
  };

  /* ---------- quiz ---------- */
  function mc(id, concept, ref, o) {
    // o: { promptHtml|prompt, visualHtml, choices:[{key,html|text}], correctKey, explain }
    var choices = o.choices, seen = {}, answer = -1;
    choices.forEach(function (c, i) {
      if (seen[c.key]) throw new Error("duplicate choice " + c.key + " in " + id);
      seen[c.key] = 1;
      if (c.key === o.correctKey) answer = i;
    });
    return { id: id, type: "mc", concept: concept, ref: ref, promptHtml: o.promptHtml, prompt: o.prompt, visualHtml: o.visualHtml,
      choices: choices, answer: answer, correctKey: o.correctKey, explain: o.explain };
  }
  function mixedChoice(w, n, d) { return { key: w + " " + n + "/" + d, html: mixedHtml(w, n, d), text: w + " " + n + "/" + d }; }
  function fracHtml(n, d) { return '<span class="qk-frac" role="math" aria-label="' + n + " over " + d + '"><span class="qk-num">' + n + '</span><span class="qk-den">' + d + "</span></span>"; }
  function mixedHtml(w, n, d) { return '<span class="qk-mixed" role="math" aria-label="' + w + " and " + n + " over " + d + '">' + w + fracHtml(n, d) + "</span>"; }
  function numChoice(v) { return { key: String(v), text: String(v) }; }

  function shortQ(id, concept, ref, o) {
    // o: { promptHtml, answerHtml, grade:function(str)->status, explain:function(status)->html, hint, inputmode, placeholder }
    var q = { id: id, type: "short", concept: concept, ref: ref, promptHtml: o.promptHtml, answerText: o.answerHtml,
      hint: o.hint, inputmode: o.inputmode || "text", placeholder: o.placeholder, lastStatus: "" };
    q.check = function (s) { q.lastStatus = o.grade(s); return q.lastStatus === "correct"; };
    // read by the quiz AFTER check(), so the feedback can react to what was typed
    Object.defineProperty(q, "explain", { enumerable: true, get: function () { return o.explain(q.lastStatus); } });
    q.grade = o.grade;
    return q;
  }

  function buildQuestions() {
    var qs = [];

    // 1. shaded shapes -> mixed number (mc, SVG)
    var s1 = { w: 2, n: 5, d: 6 };
    var q1Choices = [mixedChoice(2, 5, 6), mixedChoice(2, 1, 6), mixedChoice(3, 5, 6), mixedChoice(2, 5, 12)];
    qs.push(mc("q1", "shade", { cat: "mixed", key: "2 5/6" }, {
      promptHtml: "Which mixed number shows the shaded part?",
      visualHtml: circlesSvg([6, 6, 5], 6, "Three circles, each cut into 6 equal parts. Two circles are completely shaded. The third has 5 of its 6 parts shaded."),
      choices: q1Choices, correctKey: s1.w + " " + s1.n + "/" + s1.d,
      explain: "2 whole circles are shaded, plus 5 of the 6 parts of the last circle: " + mixedHtml(2, 5, 6) + "."
    }));

    // 2. words -> mixed number (short)
    var s2 = { w: 6, n: 5, d: 8 };
    qs.push(shortQ("q2", "words", { cat: "mixed", key: "6 5/8" }, {
      promptHtml: "Write <strong>" + mixedWords(s2.w, s2.n, s2.d) + "</strong> as a mixed number.",
      answerHtml: mixedHtml(s2.w, s2.n, s2.d), hint: "Type it like <strong>3 1/2</strong>.", placeholder: "Example: 3 1/2",
      grade: function (s) { return gradeMixed(s, s2.w, s2.n, s2.d); },
      explain: function () { return "The word before <em>and</em> is the whole number (" + s2.w + "). The rest is the fraction: " + fracWords(s2.n, s2.d) + " is " + fracHtml(s2.n, s2.d) + "."; }
    }));

    // 3. rounding a mixed number (mc)
    var s3 = { w: 12, n: 5, d: 9 }, r3 = roundMixed(s3.w, s3.n, s3.d);
    var q3vals = [s3.w, s3.w + 1, s3.w - 1, s3.w + 2].filter(function (v, i, a) { return a.indexOf(v) === i; });
    qs.push(mc("q3", "round", { cat: "rounding", key: "12 5/9" }, {
      promptHtml: "Round " + mixedHtml(s3.w, s3.n, s3.d) + " to the nearest whole number.",
      choices: q3vals.map(numChoice), correctKey: String(r3),
      explain: fracHtml(s3.n, s3.d) + " is more than " + fracHtml(1, 2) + " (" + s3.n + " × 2 = " + 2 * s3.n + ", and " + 2 * s3.n + " is more than " + s3.d + "), so round <strong>up</strong> to " + r3 + "."
    }));

    // 4. numerator that makes a fraction equal to 1 (short, only one answer)
    var d4 = 13;
    qs.push(shortQ("q4", "equal1", { cat: "equalOneDen", key: String(d4) }, {
      promptHtml: "Write the numerator so this fraction equals 1: <span class=\"qk-frac\" role=\"math\" aria-label=\"blank over " + d4 + "\"><span class=\"qk-num\">&nbsp;?&nbsp;</span><span class=\"qk-den\">" + d4 + "</span></span>",
      answerHtml: fracHtml(d4, d4), inputmode: "numeric", hint: "Type just the number.", placeholder: "Numerator",
      grade: function (s) { var p = parseAnswer(s); return p && p.type === "int" && equalsOne(p.w, d4) ? "correct" : "wrong"; },
      explain: function () { return "A fraction equals 1 when the top and bottom are the same: " + fracHtml(d4, d4) + " = 1. All " + d4 + " pieces make one whole."; }
    }));

    // 5. numerator greater than 1 (mc, exactly one valid choice)
    var d5 = 7, q5vals = [9, 7, 4, 6];
    var valid5 = q5vals.filter(function (n) { return isGreaterThanOne(n, d5); });
    if (valid5.length !== 1) throw new Error("q5 must have exactly one valid choice");
    qs.push(mc("q5", "greater1", { cat: "greaterDen", key: String(d5) }, {
      promptHtml: "Which numerator makes <span class=\"qk-frac\" role=\"math\" aria-label=\"blank over " + d5 + "\"><span class=\"qk-num\">&nbsp;?&nbsp;</span><span class=\"qk-den\">" + d5 + "</span></span> <strong>greater than 1</strong>?",
      choices: q5vals.map(numChoice), correctKey: String(valid5[0]),
      explain: "Greater than 1 means the top is bigger than the bottom (" + d5 + "). Only " + valid5[0] + " is bigger than " + d5 + ". " + fracHtml(7, 7) + " is exactly 1, and the others are less than 1."
    }));

    // 6. improper -> whole number (short)
    var n6 = 63, d6 = 9, a6 = n6 / d6;
    qs.push(shortQ("q6", "whole", { cat: "improper", key: n6 + "/" + d6 }, {
      promptHtml: "Write " + fracHtml(n6, d6) + " as a whole number.",
      answerHtml: String(a6), inputmode: "numeric", hint: "Divide the top by the bottom.", placeholder: "Whole number",
      grade: function (s) { return gradeWhole(s, a6); },
      explain: function () { return n6 + " ÷ " + d6 + " = " + a6 + " with nothing left over, so " + fracHtml(n6, d6) + " = " + a6 + "."; }
    }));

    // 7. improper -> mixed number in simplest form (short)
    var n7 = 26, d7 = 8, m7 = toMixed(n7, d7), s7 = toMixedSimplest(n7, d7);
    qs.push(shortQ("q7", "simplest", { cat: "improper", key: n7 + "/" + d7 }, {
      promptHtml: "Write " + fracHtml(n7, d7) + " as a mixed number in <strong>simplest form</strong>.",
      answerHtml: mixedHtml(s7.w, s7.n, s7.d), hint: "Type it like <strong>3 1/2</strong>.", placeholder: "Example: 3 1/2",
      grade: function (s) { return gradeMixed(s, s7.w, s7.n, s7.d); },
      explain: function (status) {
        var base = n7 + " ÷ " + d7 + " = " + m7.w + " R" + m7.n + ", so " + fracHtml(n7, d7) + " = " + mixedHtml(m7.w, m7.n, m7.d) + ". Simplify " + fracHtml(m7.n, m7.d) + " by dividing both by " + gcd(m7.n, m7.d) + ": " + fracHtml(s7.n, s7.d) + ". Answer: " + mixedHtml(s7.w, s7.n, s7.d) + ".";
        if (status === "unsimplified") return "<strong>Your answer is equal, but the fraction part must be simplified.</strong> " + base;
        if (status === "improper") return "<strong>That is equal, but write it as a mixed number</strong> (a whole number and a fraction less than 1). " + base;
        return base;
      }
    }));

    // 8. which whole number is an improper fraction closer to (mc)
    var n8 = 29, d8 = 4, m8 = toMixed(n8, d8), r8 = nearestWhole(n8, d8);
    var q8vals = [r8 - 1, r8, r8 + 1, r8 + 2];
    qs.push(mc("q8", "nearest", { cat: "closer", key: n8 + "/" + d8 }, {
      promptHtml: "Which whole number is " + fracHtml(n8, d8) + " closer to?",
      choices: q8vals.map(numChoice), correctKey: String(r8),
      explain: n8 + " ÷ " + d8 + " = " + m8.w + " R" + m8.n + ", so " + fracHtml(n8, d8) + " = " + mixedHtml(m8.w, m8.n, m8.d) + ". " + fracHtml(m8.n, m8.d) + " is less than " + fracHtml(1, 2) + ", so it is closer to <strong>" + r8 + "</strong>."
    }));

    return qs;
  }

  var CONCEPTS = {
    shade: { title: "Reading shaded shapes", html: "Count the <strong>whole</strong> shapes that are completely shaded. Then count the shaded parts in the last shape and write them over the number of equal parts in one shape." },
    words: { title: "Words to mixed numbers", html: "The number before <em>and</em> is the whole number. The words after it are the fraction: <em>five eighths</em> means 5 over 8." },
    round: { title: "Rounding a mixed number", html: "Look only at the fraction part. Less than <strong>½</strong> → keep the whole number. <strong>½ or more</strong> → go up one. (The book rounds exactly ½ up.) Test: double the top. If it is at least the bottom, round up." },
    equal1: { title: "Fractions equal to 1", html: "When the top and the bottom are the <strong>same number</strong>, you have all the pieces, which is exactly one whole." },
    greater1: { title: "Fractions greater than 1", html: "When the top is <strong>bigger</strong> than the bottom, you have more than one whole. Same top and bottom is exactly 1, and a smaller top is less than 1." },
    whole: { title: "Improper fraction → whole number", html: "A fraction bar means divide. Top ÷ bottom. If nothing is left over (no remainder), the answer is a whole number." },
    simplest: { title: "Mixed number in simplest form", html: "Divide top ÷ bottom. The answer is the whole number and the remainder goes over the same bottom number. Then simplify that fraction by dividing the top and bottom by the same number, such as 2 or 4." },
    nearest: { title: "Closer whole number", html: "Turn the fraction into a mixed number first. Then compare the fraction part to ½: smaller than ½ → closer to the whole number; ½ or more → closer to the next whole number." }
  };

  var DATA = {
    gcd: gcd, simplify: simplify, toMixed: toMixed, toMixedSimplest: toMixedSimplest, fromMixed: fromMixed,
    roundMixed: roundMixed, nearestWhole: nearestWhole, isGreaterThanOne: isGreaterThanOne, equalsOne: equalsOne,
    numberWord: numberWord, fracWords: fracWords, mixedWords: mixedWords,
    parseAnswer: parseAnswer, gradeMixed: gradeMixed, gradeWhole: gradeWhole,
    wedgePath: wedgePath, circlesSvg: circlesSvg, fracHtml: fracHtml, mixedHtml: mixedHtml,
    WORKSHEET: WORKSHEET, CONCEPTS: CONCEPTS, buildQuestions: buildQuestions,
    PHASES: [
      { id: "homework", label: "Check homework", minutes: 5 },
      { id: "review", label: "Easy review", minutes: 7 },
      { id: "quiz", label: "Practice quiz", minutes: 10 },
      { id: "finish", label: "Finish & fix", minutes: 3 }
    ]
  };
  if (typeof module !== "undefined" && module.exports) module.exports = DATA; else root.FractionsData = DATA;
})(typeof window !== "undefined" ? window : this);

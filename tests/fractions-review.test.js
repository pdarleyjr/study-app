"use strict";
const test = require("node:test");
const assert = require("node:assert");
const fs = require("node:fs");
const path = require("node:path");
const D = require("../fractions-review/data.js");

test("gcd / simplify / toMixed / fromMixed", () => {
  assert.strictEqual(D.gcd(12, 18), 6);
  assert.strictEqual(D.gcd(7, 5), 1);
  assert.deepStrictEqual(D.simplify(4, 8), { n: 1, d: 2 });
  assert.deepStrictEqual(D.toMixed(28, 8), { w: 3, n: 4, d: 8 });
  assert.deepStrictEqual(D.toMixedSimplest(28, 8), { w: 3, n: 1, d: 2 });
  assert.deepStrictEqual(D.toMixedSimplest(45, 9), { w: 5, n: 0, d: 1 });
  assert.deepStrictEqual(D.fromMixed(3, 4, 8), { n: 28, d: 8 });
});

test("rounding: exactly half rounds up; nearestWhole converts first", () => {
  assert.strictEqual(D.roundMixed(6, 1, 2), 7);
  assert.strictEqual(D.roundMixed(6, 2, 4), 7);
  assert.strictEqual(D.roundMixed(4, 1, 3), 4);
  assert.strictEqual(D.roundMixed(12, 5, 9), 13);
  assert.strictEqual(D.nearestWhole(29, 4), 7);
  assert.strictEqual(D.nearestWhole(25, 2), 13);
  assert.strictEqual(D.nearestWhole(38, 9), 4);
  assert.strictEqual(D.nearestWhole(45, 9), 5);
});

test("parseAnswer accepts equivalent formats", () => {
  for (const s of ["3 1/2", "3-1/2", "3 and 1/2", "  3   1/2 ", "3 1 / 2", "3 And 1/2"]) {
    assert.deepStrictEqual(D.parseAnswer(s), { type: "mixed", w: 3, n: 1, d: 2 }, s);
  }
  assert.strictEqual(D.parseAnswer("7").type, "int");
  assert.strictEqual(D.parseAnswer("1/0"), null);
  assert.strictEqual(D.parseAnswer("abc"), null);
  assert.strictEqual(D.parseAnswer(""), null);
});

test("simplest-form grading rejects unsimplified and improper answers", () => {
  assert.strictEqual(D.gradeMixed("3 1/4", 3, 1, 4), "correct");
  assert.strictEqual(D.gradeMixed("3-1/4", 3, 1, 4), "correct");
  assert.strictEqual(D.gradeMixed("3 and 1/4", 3, 1, 4), "correct");
  assert.strictEqual(D.gradeMixed("3 2/8", 3, 1, 4), "unsimplified");
  assert.strictEqual(D.gradeMixed("13/4", 3, 1, 4), "improper");
  assert.strictEqual(D.gradeMixed("3 1/3", 3, 1, 4), "wrong");
  assert.strictEqual(D.gradeMixed("x", 3, 1, 4), "invalid");
  assert.strictEqual(D.gradeWhole("7", 7), "correct");
  assert.strictEqual(D.gradeWhole("63/9", 7), "wrong");
});

test("words helpers", () => {
  assert.strictEqual(D.mixedWords(6, 5, 8), "six and five eighths");
  assert.strictEqual(D.mixedWords(3, 2, 3), "three and two thirds");
  assert.strictEqual(D.mixedWords(4, 1, 2), "four and one half");
});

const qs = D.buildQuestions();

test("exactly 8 questions covering the skill list, at most one true/false", () => {
  assert.strictEqual(qs.length, 8);
  const concepts = qs.map(q => q.concept).sort();
  assert.deepStrictEqual(concepts, ["equal1", "greater1", "nearest", "round", "shade", "simplest", "whole", "words"]);
  assert.ok(qs.filter(q => q.type === "tf").length <= 1);
  assert.ok(qs.some(q => q.type === "mc") && qs.some(q => q.type === "short"));
  assert.ok(qs[0].visualHtml && qs[0].visualHtml.includes("<svg"));
  assert.strictEqual(new Set(qs.map(q => q.id)).size, 8);
  for (const c of new Set(qs.map(q => q.concept))) assert.ok(D.CONCEPTS[c], c);
});

test("every mc question: exactly one correct choice, unique choices, stored answer matches pure functions", () => {
  const expected = {
    q1: "2 5/6",
    q3: String(D.roundMixed(12, 5, 9)),
    q5: String(9),
    q8: String(D.nearestWhole(29, 4)),
  };
  for (const q of qs.filter(x => x.type === "mc")) {
    const keys = q.choices.map(c => c.key);
    assert.strictEqual(new Set(keys).size, keys.length, q.id + " duplicate choices");
    assert.strictEqual(keys.filter(k => k === q.correctKey).length, 1, q.id);
    assert.strictEqual(q.choices[q.answer].key, q.correctKey);
    assert.strictEqual(q.correctKey, expected[q.id], q.id);
    assert.ok(q.choices.length >= 3);
  }
  const q5 = qs.find(q => q.id === "q5");
  assert.strictEqual(q5.choices.filter(c => D.isGreaterThanOne(+c.key, 7)).length, 1);
  assert.ok(D.isGreaterThanOne(+q5.choices[q5.answer].key, 7));
  const q1 = qs.find(q => q.id === "q1");
  for (const c of q1.choices) assert.ok(c.html.includes("qk-mixed"));
});

test("short-answer questions grade the pure-function answers", () => {
  const q = id => qs.find(x => x.id === id);
  assert.ok(q("q2").check("6 5/8") && q("q2").check("6-5/8") && q("q2").check("6 and 5/8"));
  assert.ok(!q("q2").check("5 6/8"));
  assert.ok(q("q4").check("13") && !q("q4").check("14") && !q("q4").check("1"));
  assert.ok(q("q6").check(String(63 / 9)) && !q("q6").check("6"));
  const s = D.toMixedSimplest(26, 8);
  assert.deepStrictEqual(s, { w: 3, n: 1, d: 4 });
  assert.ok(q("q7").check(`${s.w} ${s.n}/${s.d}`));
  assert.ok(q("q7").check("3 and 1/4"));
  assert.ok(!q("q7").check("3 2/8"));
  assert.match(q("q7").explain, /equal, but the fraction part must be simplified/);
  assert.ok(!q("q7").check("13/4"));
  assert.match(q("q7").explain, /mixed number/);
  assert.ok(q("q7").check("3 1/4"));
});

test("no quiz number duplicates a worksheet problem", () => {
  for (const q of qs) {
    assert.ok(q.ref && D.WORKSHEET[q.ref.cat], q.id);
    assert.ok(!D.WORKSHEET[q.ref.cat].includes(q.ref.key), q.id + " repeats worksheet " + q.ref.key);
  }
  // also guard the other direction: the worksheet list is the transcribed one
  assert.ok(D.WORKSHEET.improper.includes("28/8") && D.WORKSHEET.closer.includes("94/8"));
  assert.ok(D.WORKSHEET.rounding.includes("6 1/2"));
});

test("page references the original worksheet photo and the 5th grade link", () => {
  const html = fs.readFileSync(path.join(__dirname, "../fractions-review/index.html"), "utf8");
  const js = fs.readFileSync(path.join(__dirname, "../fractions-review/app.js"), "utf8");
  assert.ok(html.includes("homework/mixed-numbers-worksheet-p47.png"));
  assert.ok(js.includes("homework/mixed-numbers-worksheet-p47.png"));
  assert.ok(html.includes('class="qk qk-math"'));
  assert.ok(html.includes("../fifth-grade/"));
  assert.ok(fs.existsSync(path.join(__dirname, "../fractions-review/homework/mixed-numbers-worksheet-p47.png")));
});

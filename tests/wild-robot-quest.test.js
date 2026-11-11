"use strict";
const test = require("node:test");
const assert = require("node:assert");
const fs = require("node:fs");
const path = require("node:path");
const D = require("../wild-robot-quest/data.js");

test("both chapters are present with their memory hooks", () => {
  const c38 = D.chapters.find((c) => c.num === 38), c39 = D.chapters.find((c) => c.num === 39);
  assert.ok(c38 && c39);
  assert.match(c38.hook, /SECRET REVEALED/);
  assert.match(c39.hook, /ESCAPE PLANNED/);
  assert.match(c38.title, /Truth/); assert.match(c39.title, /Allies/);
  [c38, c39].forEach((c) => assert.ok(c.summary.split(/[.!?]\s/).length >= 2));
});

test("timeline covers all 5 chapter 38 points and 8 chapter 39 points in order", () => {
  const b38 = D.beats.filter((b) => b.ch === 38), b39 = D.beats.filter((b) => b.ch === 39);
  assert.deepStrictEqual(b38.map((b) => b.n), [1, 2, 3, 4, 5]);
  assert.deepStrictEqual(b39.map((b) => b.n), [1, 2, 3, 4, 5, 6, 7, 8]);
  assert.deepStrictEqual(D.beats.map((b) => b.ch), [38, 38, 38, 38, 38, 39, 39, 39, 39, 39, 39, 39, 39]);
  const keys38 = [/noises.*barn/i, /stories.*island/i, /Brightbill/, /factory.*destroyed/i, /compassion.*promise not to tell/i];
  const keys39 = [/miss their own mother/i, /belongs on her island/i, /track.*defective/i, /different/i, /being different/i, /saved his life/i, /spring/i, /trusts/i];
  keys38.forEach((re, i) => assert.match(b38[i].text, re, "38." + (i + 1)));
  keys39.forEach((re, i) => assert.match(b39[i].text, re, "39." + (i + 1)));
  D.beats.forEach((b) => assert.ok(b.scene));
});

test("exactly 6 well-formed multiple-choice questions", () => {
  const qs = D.quiz.questions;
  assert.strictEqual(qs.length, 6);
  assert.strictEqual(D.quiz.id, "wild-robot-quest");
  assert.strictEqual(D.storeKey, "studyquest:wild-robot-quest:v1");
  qs.forEach((q) => {
    assert.strictEqual(q.type, "mc");
    assert.ok(q.choices.length >= 3 && q.choices.length <= 4);
    assert.strictEqual(new Set(q.choices).size, q.choices.length);
    assert.ok(Number.isInteger(q.answer) && q.answer >= 0 && q.answer < q.choices.length);
    assert.ok(q.explain && q.explain.length > 10);
  });
  assert.strictEqual(new Set(qs.map((q) => q.id)).size, 6);
});

test("each correct answer matches its learning target", () => {
  const right = D.quiz.questions.map((q) => q.choices[q.answer]);
  assert.match(right[0], /barn/i); assert.match(right[0], /noises/i);
  assert.match(right[1], /goose son/i);
  assert.match(D.quiz.questions[2].choices[D.quiz.questions[2].answer] + D.quiz.questions[2].explain, /destroyed/i);
  assert.match(right[3], /different/i); assert.match(right[3], /defective/i);
  assert.match(D.quiz.questions[4].choices[D.quiz.questions[4].answer], /saved his life/i);
  assert.match(right[5], /spring/i);
  // wrong choices must not also contain the key idea
  assert.doesNotMatch(D.quiz.questions[3].choices.filter((_, i) => i !== 2).join(" "), /not mean/i);
});

test("nothing mentions page 108 and total time is 10 minutes or less", () => {
  assert.doesNotMatch(JSON.stringify(D), /108/);
  assert.doesNotMatch(fs.readFileSync(path.join(__dirname, "../wild-robot-quest/data.js"), "utf8"), /108/);
  const total = D.steps.reduce((s, x) => s + x.minutes, 0);
  assert.ok(total <= 10 && total >= 8, "total " + total);
  assert.strictEqual(D.totalMinutes(), total);
});

test("vocabulary and ideas are present", () => {
  assert.deepStrictEqual(D.vocab.map((v) => v.word), ["compassion", "allies", "defective", "migrate"]);
  assert.strictEqual(D.ideas.length, 4);
});

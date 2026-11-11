"use strict";
const test = require("node:test");
const assert = require("node:assert");
const fs = require("node:fs");
const path = require("node:path");

const root = path.join(__dirname, "..");
const D = require("../sacraments-quest/data.js");
const norm = (s) => s.toLowerCase().replace(/\s+/g, " ").replace(/[.,;]+$/g, "").trim();
const notes = fs.readFileSync(path.join(root, "docs/sources/math-religion-sources.md"), "utf8").replace(/\s+/g, " ");
const notesLower = notes.toLowerCase();
const html = fs.readFileSync(path.join(root, "sacraments-quest/index.html"), "utf8");
const appJs = fs.readFileSync(path.join(root, "sacraments-quest/app.js"), "utf8");

test("vocabulary definitions match the source notes", () => {
  const required = ["Holy Spirit", "Pentecost", "Chrism", "Bishop", "Catechumen", "OCIA", "Monstrance", "Benediction",
    "Sacraments", "Sacramentals", "Grace", "Liturgy", "Worship", "Altar", "Fast", "Christ", "Christian witness"];
  required.forEach((t) => assert.ok(D.vocab.some((v) => v.term === t), "missing term " + t));
  D.vocab.forEach((v) => {
    assert.ok(notesLower.includes(v.book.toLowerCase()), v.term + ": book wording not in source notes: " + v.book);
    assert.ok(norm(v.def).includes(norm(v.book)), v.term + ": definition does not contain the book wording");
  });
});

test("p46 acrostic answers match the source notes", () => {
  assert.strictEqual(D.homework.p46.length, 10);
  assert.strictEqual(D.homework.p46.map((r) => r.letter).join(""), "SACRAMENTS");
  D.homework.p46.forEach((r) => assert.ok(notes.includes(r.letter + " — " + r.clue + " → " + r.answer), "p46 " + r.answer));
});

test("p47 crossword answers match the source notes", () => {
  assert.strictEqual(D.homework.p47across.length, 7);
  assert.strictEqual(D.homework.p47down.length, 6);
  D.homework.p47across.concat(D.homework.p47down).forEach((r) =>
    assert.ok(notes.includes(r.clue + " → " + r.answer), "p47 " + r.answer));
});

test("quiz has exactly 10 unique questions with required mix", () => {
  assert.strictEqual(D.quiz.length, 10);
  assert.strictEqual(new Set(D.quiz.map((q) => q.id)).size, 10);
  assert.ok(D.quiz.some((q) => q.type === "match"));
  assert.ok(D.quiz.some((q) => q.type === "tf"));
  assert.ok(D.quiz.filter((q) => q.kind === "id").length >= 3);
  D.quiz.forEach((q) => {
    assert.ok(q.explain && q.explain.length > 10, q.id + " explain");
    assert.ok(q.vocab && q.vocab.length, q.id + " vocab");
    q.vocab.forEach((v) => assert.ok(D.vocab.some((x) => x.id === v), q.id + " unknown vocab " + v));
  });
});

test("multiple-choice questions have one in-range answer and unique choices", () => {
  D.quiz.filter((q) => q.type === "mc").forEach((q) => {
    assert.ok(Number.isInteger(q.answer) && q.answer >= 0 && q.answer < q.choices.length, q.id);
    assert.ok(q.choices.length >= 3);
    assert.strictEqual(new Set(q.choices.map(norm)).size, q.choices.length, q.id + " duplicate choices");
  });
  D.quiz.filter((q) => q.type === "tf").forEach((q) => assert.strictEqual(typeof q.answer, "boolean"));
});

test("match pairs are unique on both sides", () => {
  D.quiz.filter((q) => q.type === "match").forEach((q) => {
    assert.strictEqual(q.pairs.length, 4);
    assert.strictEqual(new Set(q.pairs.map((p) => norm(p[0]))).size, q.pairs.length);
    assert.strictEqual(new Set(q.pairs.map((p) => norm(p[1]))).size, q.pairs.length);
  });
});

test("sort clues point at real sacraments", () => {
  const ids = D.initiation.map((s) => s.id);
  assert.deepStrictEqual(ids, ["baptism", "confirmation", "eucharist"]);
  D.sortClues.forEach((c) => assert.ok(ids.includes(c.answer)));
});

test("page references all three homework images, p46 and p47 in Check My Homework", () => {
  assert.strictEqual(D.storeKey, "studyquest:sacraments-quest:v1");
  Object.values(D.images).forEach((p) => assert.ok(fs.existsSync(path.join(root, "sacraments-quest", p)), p));
  assert.ok(html.includes('class="qk qk-religion"'));
  const dataSrc = fs.readFileSync(path.join(root, "sacraments-quest/data.js"), "utf8");
  ["homework/unit1-review-p45.jpg", "homework/about-the-sacraments-p46.jpg", "homework/sacraments-in-review-p47.png"].forEach((p) =>
    assert.ok(dataSrc.includes(p), p));
  const m = appJs.match(/function homework\(box\) \{([\s\S]*?)\n  \/\* ---------- 2\./);
  assert.ok(m, "homework function");
  assert.ok(m[1].includes("D.images.p46") && m[1].includes("D.images.p47"));
  assert.ok(D.images.p46.endsWith("about-the-sacraments-p46.jpg") && D.images.p47.endsWith("sacraments-in-review-p47.png"));
  assert.ok(m[1].includes("Page 46 checked") && m[1].includes("Page 47 Across checked") && m[1].includes("Page 47 Down checked"));
  assert.ok(/opts|id: "sacraments-quest"/.test(appJs) && appJs.includes('quizName: "quiz"'));
});

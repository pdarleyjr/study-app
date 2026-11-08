/* Content checks for second-grade/spanish-days/data.js.
   Run from the repo root: node --test   (Node 18+, no installs needed) */
"use strict";
const test = require("node:test");
const assert = require("node:assert/strict");
const SD = require("../second-grade/spanish-days/data.js");

/* Small seeded RNG so failures can be reproduced. */
function rng(seed) { let s = seed >>> 0; return () => { s = (s * 1664525 + 1013904223) >>> 0; return s / 4294967296; }; }
const ES = ["lunes", "martes", "miércoles", "jueves", "viernes", "sábado", "domingo"];
const EN = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];

test("seven days, Monday first, exact spelling and accents", () => {
  assert.equal(SD.DAYS.length, 7);
  assert.deepEqual(SD.DAYS.map((d) => d.es), ES);
  assert.deepEqual(SD.DAYS.map((d) => d.en), EN);
  assert.equal(SD.DAYS[2].es.normalize("NFC"), "miércoles");
  assert.equal(SD.DAYS[5].es.normalize("NFC"), "sábado");
  SD.DAYS.forEach((d) => {
    assert.equal(d.es, d.es.toLowerCase(), "Spanish day names are lowercase");
    assert.equal(d.syl.join("").normalize("NFC"), d.es.normalize("NFC"), "syllables spell the word: " + d.es);
    assert.ok(d.stress >= 0 && d.stress < d.syl.length);
  });
  assert.equal(new Set(SD.DAYS.map((d) => d.es)).size, 7, "one Spanish word per English day");
});

test("before/after relationships, including the domingo/lunes wrap", () => {
  const nameAfter = (es) => ES[SD.after(SD.idxOf(es))];
  const nameBefore = (es) => ES[SD.before(SD.idxOf(es))];
  assert.equal(nameAfter("martes"), "miércoles");
  assert.equal(nameBefore("viernes"), "jueves");
  assert.equal(nameAfter("domingo"), "lunes");
  assert.equal(nameBefore("lunes"), "domingo");
  for (let i = 0; i < 7; i++) {
    assert.equal(SD.before(SD.after(i)), i);
    assert.equal(SD.after(SD.before(i)), i);
  }
});

test("every before/after question is valid for every day, both directions", () => {
  for (let seed = 1; seed <= 40; seed++) {
    for (let t = 0; t < 7; t++) {
      for (const dir of ["after", "before"]) {
        for (const n of [3, 4]) {
          const q = SD.relQ(rng(seed * 97 + t), dir, t, { n });
          assert.deepEqual(SD.validate(q), [], JSON.stringify(q));
          assert.equal(q.choices.length, n);
          const right = q.choices.filter((c) => c.correct);
          assert.equal(right.length, 1);
          assert.equal(right[0].label, ES[dir === "after" ? (t + 1) % 7 : (t + 6) % 7]);
          assert.match(q.promptEs, dir === "after" ? /después del / : /antes del /);
          assert.ok(q.promptEs.includes(ES[t]));
        }
      }
    }
  }
});

test("translation and listening questions", () => {
  for (let seed = 1; seed <= 30; seed++) {
    for (let d = 0; d < 7; d++) {
      for (const kind of ["en2es", "es2en", "listen"]) {
        const q = SD.transQ(rng(seed + d * 13), kind, d, { n: 4 });
        assert.deepEqual(SD.validate(q), []);
        const right = q.choices.find((c) => c.correct);
        assert.equal(right.label, kind === "es2en" ? EN[d] : ES[d]);
        if (kind === "en2es") { assert.ok(q.promptEs.includes(EN[d]) && /en español\?$/.test(q.promptEs)); }
      }
    }
  }
});

test("missing-day questions: consecutive runs, right answers, unique choices", () => {
  for (let seed = 1; seed <= 200; seed++) {
    const r = rng(seed);
    for (const o of [{ len: 3, n: 3 }, { len: 4, n: 4 }, { len: 7, blanks: 2, n: 5 }]) {
      const q = SD.missingQ(r, o);
      assert.deepEqual(SD.validate(q), [], JSON.stringify(q));
      assert.equal(q.blanks.length, o.blanks || 1);
      q.answers.forEach((a) => assert.ok(q.choices.some((c) => c.correct && c.idx === a)));
    }
  }
});

test("practice rounds cover all seven days and stay valid", () => {
  for (let seed = 1; seed <= 50; seed++) {
    for (const lv of [1, 2, 3]) {
      for (const dir of ["after", "before"]) {
        const round = SD.relRound(rng(seed * 7 + lv), dir, lv);
        assert.equal(round.length, 8);
        assert.equal(new Set(round.map((q) => q.target)).size, 7);
        round.forEach((q) => assert.deepEqual(SD.validate(q), []));
        if (lv === 3) { assert.ok(round.every((q) => q.spanishOnly)); }
      }
      SD.missingRound(rng(seed), lv).forEach((q) => assert.deepEqual(SD.validate(q), []));
      const lr = SD.listenRound(rng(seed), lv, true);
      assert.equal(new Set(lr.map((q) => q.target)).size, 7);
      lr.forEach((q) => assert.deepEqual(SD.validate(q), []));
      assert.ok(SD.listenRound(rng(seed), lv, false).every((q) => q.kind !== "listen"), "no listening items without a voice");
    }
  }
});

test("challenge: 12 items, all 7 days, wrap always asked, order last, Spanish only", () => {
  for (let seed = 1; seed <= 500; seed++) {
    const items = SD.challenge(rng(seed));
    assert.equal(items.length, 12);
    assert.equal(items[items.length - 1].kind, "order");
    const answered = new Set();
    let wrap = false;
    const kinds = {};
    items.forEach((q) => {
      kinds[q.kind] = (kinds[q.kind] || 0) + 1;
      if (q.kind === "order") { return; }
      assert.deepEqual(SD.validate(q), [], "seed " + seed + " " + JSON.stringify(q));
      assert.ok(q.spanishOnly);
      if (q.kind !== "es2en") { answered.add(q.answer); }
      if ((q.kind === "after" && q.target === 6) || (q.kind === "before" && q.target === 0)) { wrap = true; }
    });
    assert.equal(answered.size, 7, "seed " + seed + ": every day is an answer");
    assert.ok(wrap, "seed " + seed + ": domingo/lunes wrap asked");
    assert.deepEqual(kinds, { en2es: 2, es2en: 1, after: 3, before: 3, missing: 2, order: 1 });
  }
});

test("quick review: 6 questions, both directions, wrap, past misses first", () => {
  for (let seed = 1; seed <= 300; seed++) {
    const qs = SD.quickReview(rng(seed));
    assert.equal(qs.length, 6);
    assert.equal(new Set(qs.map((q) => q.key)).size, 6, "no repeats");
    assert.ok(qs.filter((q) => q.kind === "after").length >= 2);
    assert.ok(qs.filter((q) => q.kind === "before").length >= 2);
    assert.ok(qs.some((q) => q.key === "after:domingo" || q.key === "before:lunes"));
    qs.forEach((q) => { assert.deepEqual(SD.validate(q), []); assert.ok(q.spanishOnly); });
  }
  /* a heavily missed relationship should almost always be chosen */
  const weight = (k) => (k === "before:jueves" ? 50 : 1);
  let hits = 0;
  for (let seed = 1; seed <= 200; seed++) { if (SD.quickReview(rng(seed), weight).some((q) => q.key === "before:jueves")) { hits++; } }
  assert.ok(hits >= 190, "missed item prioritised (" + hits + "/200)");
});

test("remake keeps the same question but reshuffles", () => {
  const r = rng(5);
  const qs = [SD.relQ(r, "after", 3, { n: 4 }), SD.relQ(r, "before", 0, { n: 3 }), SD.transQ(r, "es2en", 2, { n: 4 }),
    SD.missingQ(r, { start: 6, len: 3, blankAt: 1, n: 3 }), SD.missingQ(r, { len: 7, blanks: 2, n: 5 })];
  qs.forEach((q) => {
    const again = SD.remake(r, q);
    assert.equal(again.kind, q.kind);
    assert.equal(again.key, q.key);
    assert.equal(again.choices.length, q.choices.length);
    assert.deepEqual(SD.validate(again), []);
  });
});

test("an incorrect choice is never marked correct", () => {
  for (let seed = 1; seed <= 100; seed++) {
    const q = SD.relQ(rng(seed), seed % 2 ? "after" : "before", seed % 7, { n: 4 });
    q.choices.filter((c) => c.idx !== q.answer).forEach((c) => assert.equal(c.correct, false));
  }
});

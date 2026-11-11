"use strict";
const test = require("node:test");
const assert = require("node:assert");
const fs = require("node:fs");
const path = require("node:path");
const D = require("../matter-lab/data.js");

const html = fs.readFileSync(path.join(__dirname, "../matter-lab/index.html"), "utf8");
const appJs = fs.readFileSync(path.join(__dirname, "../matter-lab/app.js"), "utf8");

test("stateAt(tempC) for water", () => {
  assert.strictEqual(D.stateAt(-5), "solid");
  assert.strictEqual(D.stateAt(0), "solid");
  assert.strictEqual(D.stateAt(25), "liquid");
  assert.strictEqual(D.stateAt(99), "liquid");
  assert.strictEqual(D.stateAt(105), "gas");
});

test("state-change table: from, to and energy direction", () => {
  const T = D.TRANSITIONS;
  const expect = { melting: ["solid", "liquid", "in"], freezing: ["liquid", "solid", "out"], evaporation: ["liquid", "gas", "in"], boiling: ["liquid", "gas", "in"], condensation: ["gas", "liquid", "out"] };
  assert.deepStrictEqual(Object.keys(T).sort(), Object.keys(expect).sort());
  for (const [id, [from, to, energy]] of Object.entries(expect)) {
    assert.strictEqual(T[id].from, from, id); assert.strictEqual(T[id].to, to, id); assert.strictEqual(T[id].energy, energy, id);
  }
  assert.strictEqual(T.evaporation.where, "surface");
  assert.strictEqual(T.boiling.where, "throughout");
  assert.match(T.boiling.says, /sea-level/);
});

test("heat lab steps produce the right transitions", () => {
  let r = D.labStep(0, 1); assert.strictEqual(r.tempC, 10); assert.strictEqual(r.transition.id, "melting"); assert.strictEqual(r.energy, "in");
  r = D.labStep(10, -1); assert.strictEqual(r.transition.id, "freezing"); assert.strictEqual(r.energy, "out");
  r = D.labStep(90, 1); assert.strictEqual(r.transition.id, "boiling");
  r = D.labStep(100, -1); assert.strictEqual(r.transition.id, "condensation");
  r = D.labStep(20, 1); assert.strictEqual(r.transition, null);
  r = D.labStep(D.LAB.max, 1); assert.strictEqual(r.moved, false);
  assert.strictEqual(D.isEvaporating(40), true); assert.strictEqual(D.isEvaporating(5), false); assert.strictEqual(D.isEvaporating(110), false);
  assert.strictEqual(D.toF(100), 212); assert.strictEqual(D.toF(0), 32);
});

test("densities and the most dense pick", () => {
  const byId = Object.fromEntries(D.DENSITY_ITEMS.map((i) => [i.id, D.density(i.mass, i.volume)]));
  assert.deepStrictEqual(byId, { gelatin: 0.75, pudding: 0.9, cream: 0.5 });
  assert.strictEqual(D.mostDense(D.DENSITY_ITEMS).id, "pudding");
  assert.ok(D.DENSITY_ITEMS.every((i) => i.volume === 100));
});

test("every quiz density answer equals mass / volume", () => {
  const shorts = D.CHALLENGE.filter((q) => q.type === "short");
  assert.strictEqual(shorts.length, 1);
  for (const q of shorts) {
    assert.ok(Math.abs(q.numericAnswer - q.mass / q.volume) < 1e-9);
    assert.ok(q.check(String(q.numericAnswer)) && q.check(q.numericAnswer + " g/cm³") && !q.check("6"));
  }
  assert.ok(D.checkNumber(".6", 0.6)); assert.ok(!D.checkNumber("", 0.6));
});

test("challenge has 9-10 questions, one correct answer each, unique choices", () => {
  const Q = D.CHALLENGE;
  assert.ok(Q.length >= 9 && Q.length <= 10);
  assert.strictEqual(new Set(Q.map((q) => q.id)).size, Q.length);
  for (const q of Q) {
    assert.ok(q.explain, q.id);
    assert.ok(["mc", "tf", "short", "match"].includes(q.type));
    if (q.type === "mc") {
      assert.ok(Number.isInteger(q.answer) && q.answer >= 0 && q.answer < q.choices.length, q.id);
      const keys = q.choices.map((c) => (typeof c === "string" ? c : c.html || c.text));
      assert.strictEqual(new Set(keys).size, keys.length, q.id + " unique choices");
      assert.ok(keys.length >= 3);
    }
    if (q.type === "tf") assert.strictEqual(typeof q.answer, "boolean");
    if (q.type === "match") {
      assert.strictEqual(new Set(q.pairs.map((p) => p[0])).size, q.pairs.length);
      assert.strictEqual(new Set(q.pairs.map((p) => p[1])).size, q.pairs.length);
    }
  }
  assert.ok(Q.some((q) => q.type === "match"));
  assert.ok(Q.some((q) => q.type === "tf"));
  assert.ok(Q.some((q) => q.type === "mc" && /<svg/.test(JSON.stringify(q.choices) + (q.visualHtml || ""))));
});

test("challenge covers every target tag, and every question points at a station", () => {
  const covered = new Set(D.CHALLENGE.flatMap((q) => q.tags));
  for (const tag of D.CHALLENGE_TAGS) assert.ok(covered.has(tag), "missing tag " + tag);
  const stations = new Set(D.STATIONS.map((s) => s.id));
  for (const q of D.CHALLENGE) assert.ok(stations.has(q.station), q.id);
});

test("no challenge question is copied from the review PDF quiz", () => {
  const pdf = [
    "Sunlight is not matter",
    "A liquid has a fixed volume but no fixed shape",
    "Water vapor cooling into droplets is called condensation",
    "What is the density of 80 g in 100 cm3",
    "A balloon can be squeezed because gas can be compressed"
  ];
  const norm = (s) => String(s).toLowerCase().replace(/[^a-z0-9]+/g, " ").trim();
  for (const q of D.CHALLENGE) {
    const p = norm(q.prompt || "");
    for (const bad of pdf) assert.notStrictEqual(p, norm(bad));
    assert.ok(!/80 g/.test(q.prompt || ""), q.id);
  }
});

test("state definitions carry the accuracy rules", () => {
  assert.match(D.STATES.gas.shape, /container/); assert.match(D.STATES.gas.volume, /fill/);
  assert.match(D.STATES.liquid.volume, /Keeps its volume/); assert.match(D.STATES.liquid.shape, /container/);
  assert.match(D.STATES.solid.motion, /Vibrate/);
  assert.strictEqual(D.STATES.solid.memory + D.STATES.liquid.memory + D.STATES.gas.memory, "STAYSFLOWSFILLS");
});

test("detective cards, big ideas and stations are well formed", () => {
  for (const c of D.DETECTIVE) { assert.ok(c.answer >= 0 && c.answer < c.options.length); assert.strictEqual(new Set(c.options).size, c.options.length); }
  assert.strictEqual(D.BIG_IDEAS.length, 6);
  assert.deepStrictEqual(D.STATIONS.map((s) => s.id), ["particles", "heat", "density", "detective"]);
});

test("index.html handles #lesson and #challenge deep links, local files only", () => {
  assert.match(html, /href="#lesson"/); assert.match(html, /href="#challenge"/);
  assert.match(appJs, /"lesson"/); assert.match(appJs, /"challenge"/); assert.match(appJs, /hashchange/);
  assert.match(html, /class="qk qk-science/);
  assert.match(html, /\.\.\/fifth-grade\//);
  assert.match(html, /Matter Lab: Solids, Liquids &amp; Gases/);
  assert.ok(!/(src|href)="https?:/.test(html));
  assert.match(appJs, /studyquest:matter-lab:v1/); assert.match(appJs, /runQuiz/); assert.match(appJs, /"matter-lab"/);
  assert.match(appJs, /visibilitychange/); assert.match(appJs, /requestAnimationFrame/);
});

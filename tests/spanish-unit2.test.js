/* QA for Spanish Quest: ¿Cómo vivimos? (spanish-unit2/). Written strictly from docs/spanish-unit2-contract.md.
   Run from the repo root: node --test tests/spanish-unit2.test.js  (Node 18+, no installs) */
"use strict";
const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");

const D = require("../spanish-unit2/data.js");
const ART = require("../spanish-unit2/art.js");
const E = require("../spanish-unit2/engine.js");
const SU_DIR = path.join(__dirname, "..", "spanish-unit2");

/* ---------- helpers ---------- */
const norm = (s) => String(s).normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase();
const stripTags = (s) => String(s).replace(/<[^>]*>/g, " ");
const esc = (s) => s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
const wholeWord = (text, word) => new RegExp("(^|[^\\p{L}\\p{N}])" + esc(word) + "([^\\p{L}\\p{N}]|$)", "iu").test(text);
const Q = D.QUESTIONS;
const mcs = Q.filter((q) => q.type === "mc");
const placeIds = D.PLACES.map((p) => p.id);
const mapXY = {};
D.MAP.places.forEach((p) => { mapXY[p.id] = p; });
const dist = (a, b) => Math.hypot(mapXY[a].col - mapXY[b].col, mapXY[a].row - mapXY[b].row);
const skillOf = (id) => D.SKILLS.find((s) => s.id === id);
const areaOfSkill = (id) => D.AREAS.find((a) => a.skills.includes(id));
const qLabel = (q) => "[" + q.id + "]";
function deepFreeze(o) { if (o && typeof o === "object" && !Object.isFrozen(o)) { Object.freeze(o); Object.keys(o).forEach((k) => deepFreeze(o[k])); } return o; }
function ev(qid, skill, o) { return Object.assign({ qid, skill, mode: "practice", firstCorrect: true, hintUsed: false, correctedAfter: false, at: 1000 }, o || {}); }
function recordAll(p, evs) { return evs.reduce((acc, e) => E.recordAnswer(acc, e), p); }

/* ---------- art spec validation (contract 4.1) ---------- */
const CL_ITEMS = ["camisa", "camiseta", "blusa", "falda", "pantalon", "pantalon-corto", "pantalon-largo", "vestido", "traje", "corbata"];
const CL_COLORS = ["rojo", "amarillo", "negro", "blanco", "azul", "verde", "marron", "anaranjado", "rosado"];
const ART_IDS = {
  place: ["hotel", "farmacia", "panaderia", "hospital", "parque", "tienda", "mercado", "centro-comercial", "teatro", "estacion", "apartamento", "casa"],
  tool: ["escoba", "trapeador", "aspiradora", "jabon", "agua"],
  thing: ["alfombra", "piso", "pan", "medicinas", "libros", "comida", "ropa", "tren", "dinero", "moneda", "balon"],
  scene: ["piso-sucio", "piso-mojado", "ropa-sucia", "alfombra-sucia", "dormitorio-sucio", "ropa-nueva", "teatro-noche", "parque-futbol"],
  person: ["yo", "tu", "el", "ella", "usted", "nosotros", "nosotras", "ellos", "ellas", "ustedes"],
  worker: ["vendedor", "vendedora", "panadero", "farmaceutico", "farmaceutica", "escritor"],
  room: ["sala", "comedor", "cocina", "dormitorio", "bano"],
  home: ["casa-grande", "casa-pequena", "apartamento-grande", "apartamento-pequeno"],
};
function specError(s) {
  if (!s || typeof s !== "object") return "spec is not an object: " + JSON.stringify(s);
  const k = s.kind;
  if (ART_IDS[k]) return ART_IDS[k].includes(s.id) ? null : "unknown " + k + " id " + JSON.stringify(s.id);
  if (k === "clothing") {
    if (!CL_ITEMS.includes(s.item)) return "unknown clothing item " + JSON.stringify(s.item);
    if (!CL_COLORS.includes(s.color)) return "unknown clothing color " + JSON.stringify(s.color);
    if (s.state !== undefined && !["sucia", "limpia"].includes(s.state)) return "unknown clothing state " + JSON.stringify(s.state);
    return null;
  }
  if (k === "outfit") {
    if (!Array.isArray(s.items) || s.items.length < 1 || s.items.length > 3) return "outfit needs 1-3 items";
    for (const it of s.items) { const e = specError(Object.assign({ kind: "clothing" }, it)); if (e) return "outfit item: " + e; }
    return null;
  }
  if (k === "money") {
    if (![5, 50, 100, 500, 1000].includes(s.amount)) return "unknown money amount " + JSON.stringify(s.amount);
    if (!["USD", "PYG"].includes(s.currency)) return "unknown currency " + JSON.stringify(s.currency);
    return null;
  }
  if (k === "map") {
    for (const h of s.highlight || []) if (!placeIds.includes(h)) return "map highlight unknown place " + h;
    for (const m of s.markers || []) {
      if (!placeIds.includes(m.place)) return "map marker unknown place " + m.place;
      if (!ART_IDS.person.includes(m.person)) return "map marker unknown person " + m.person;
    }
    return null;
  }
  return "unknown art kind " + JSON.stringify(k);
}
/* every art spec used in data, with a location label */
function collectSpecs() {
  const out = [];
  Q.forEach((q) => {
    if (q.art) out.push({ where: qLabel(q) + " art", spec: q.art });
    if (q.choiceArt) q.choiceArt.forEach((s, i) => out.push({ where: qLabel(q) + " choiceArt[" + i + "]", spec: s }));
  });
  D.MISSIONS.forEach((m) => (m.learn || []).forEach((c, i) => (c.art || []).forEach((s, j) => out.push({ where: m.id + " learn[" + i + "].art[" + j + "]", spec: s }))));
  D.VOCAB.forEach((v) => { if (v.art) out.push({ where: "VOCAB " + v.es, spec: v.art }); });
  return out;
}
/* Spanish words an aria-label must not reveal */
function spanishWords(spec) {
  const words = new Set();
  const add = (w) => { w = norm(w); if (w.length >= 4 && !["hotel", "hospital"].includes(w)) words.add(w); };
  const addId = (id) => String(id).split("-").forEach(add);
  if (["place", "tool", "thing", "scene", "worker", "room", "home"].includes(spec.kind)) addId(spec.id);
  if (spec.kind === "clothing") { addId(spec.item); addId(spec.color); }
  if (spec.kind === "outfit") spec.items.forEach((i) => { addId(i.item); addId(i.color); });
  [D.PLACES, D.WORKERS, D.CLOTHING].forEach((list) => list.forEach((e) => { if (e.id === spec.id || e.id === spec.item) norm(e.es).split(/\s+/).forEach(add); }));
  return [...words];
}
function labelOf(svg) { const m = /aria-label="([^"]*)"/.exec(svg); return m ? m[1] : null; }

/* ============================ DATA ============================ */
test("META, WEEKS, SKILLS, AREAS, EXAM, TOPICS shape", () => {
  const M = D.META;
  assert.equal(M.title, "Spanish Quest: ¿Cómo vivimos?");
  assert.equal(M.subtitle, "Unit 2 Grammar Adventure");
  assert.equal(M.book, "Descubre el español con Santillana E");
  assert.equal(M.unit, "Unidad 2 ¿Cómo vivimos?");
  assert.equal(M.pages, "19–32");
  assert.equal(M.quizDate, "2026-11-16");

  const skillTable = {
    "s1-house": [1, "neighborhood"], "s1-places": [1, "neighborhood"], "s1-directions": [1, "neighborhood"],
    "s2-clothes": [2, "clothing"], "s2-colors": [2, "clothing"], "s2-shopping": [2, "community"],
    "s3-cleaning": [3, "household"], "s3-commands": [3, "household"], "s3-clothes-desc": [3, "household"],
    "s4-estar": [4, "estar"], "s4-workers": [4, "community"], "s4-community": [4, "community"],
  };
  assert.deepEqual(D.SKILLS.map((s) => s.id).sort(), Object.keys(skillTable).sort(), "SKILLS must be exactly the 12 contract ids");
  D.SKILLS.forEach((s) => {
    assert.equal(s.week, skillTable[s.id][0], "skill " + s.id + " week");
    assert.equal(s.area, skillTable[s.id][1], "skill " + s.id + " area");
    assert.ok(s.label && s.labelEs, "skill " + s.id + " needs label and labelEs");
  });
  assert.equal(D.WEEKS.length, 4);
  D.WEEKS.forEach((w, i) => {
    assert.equal(w.week, i + 1);
    assert.ok(w.title && w.en && Array.isArray(w.pages) && w.pages.length, "week " + w.week + " fields");
    assert.deepEqual([...w.skills].sort(), D.SKILLS.filter((s) => s.week === w.week).map((s) => s.id).sort(), "week " + w.week + " skills");
  });
  assert.deepEqual(D.WEEKS[0].pages, [19, 20, 21]);

  const areas = { estar: [7, ["s4-estar"]], neighborhood: [5, ["s1-house", "s1-places", "s1-directions"]], clothing: [5, ["s2-clothes", "s2-colors"]], household: [4, ["s3-cleaning", "s3-commands", "s3-clothes-desc"]], community: [3, ["s4-workers", "s4-community", "s2-shopping"]] };
  assert.deepEqual(D.AREAS.map((a) => a.id).sort(), Object.keys(areas).sort());
  D.AREAS.forEach((a) => {
    assert.equal(a.examCount, areas[a.id][0], "area " + a.id + " examCount");
    assert.deepEqual([...a.skills].sort(), [...areas[a.id][1]].sort(), "area " + a.id + " skills");
    assert.ok(a.label);
  });
  assert.equal(D.EXAM.total, 24);
  assert.equal(D.AREAS.reduce((n, a) => n + a.examCount, 0), D.EXAM.total, "examCounts must sum to EXAM.total");

  assert.deepEqual(D.TOPICS.map((t) => t.id).sort(), ["clothing", "community", "estar", "household", "mixed", "neighborhood"]);
  const tp = (id) => D.TOPICS.find((t) => t.id === id).skills.slice().sort();
  assert.deepEqual(tp("neighborhood"), ["s1-directions", "s1-house", "s1-places"]);
  assert.deepEqual(tp("clothing"), ["s2-clothes", "s2-colors", "s2-shopping"]);
  assert.deepEqual(tp("household"), ["s3-cleaning", "s3-clothes-desc", "s3-commands"]);
  assert.deepEqual(tp("community"), ["s4-community", "s4-workers"]);
  assert.deepEqual(tp("estar"), ["s4-estar"]);
  assert.deepEqual(tp("mixed"), Object.keys(skillTable).sort());
  D.TOPICS.forEach((t) => assert.ok(t.label && t.text, "topic " + t.id + " label/text"));
});

test("question ids: unique, well-formed, prefix = skill, week matches", () => {
  const seen = new Set();
  Q.forEach((q) => {
    assert.ok(!seen.has(q.id), "duplicate question id " + q.id);
    seen.add(q.id);
    assert.match(q.id, /^s[1-4]-[a-z-]+-\d{3}$/, "bad id format " + q.id);
    const sk = skillOf(q.skill);
    assert.ok(sk, qLabel(q) + " unknown skill " + q.skill);
    assert.equal(q.id.replace(/-\d{3}$/, ""), q.skill, qLabel(q) + " id prefix must equal skill " + q.skill);
    assert.equal(q.week, sk.week, qLabel(q) + " week " + q.week + " != skill week " + sk.week);
    assert.ok([1, 2, 3].includes(q.difficulty), qLabel(q) + " difficulty " + q.difficulty);
    assert.ok(["mc", "tap"].includes(q.type), qLabel(q) + " type " + q.type);
    assert.equal(typeof q.exam, "boolean", qLabel(q) + " exam must be boolean");
    assert.ok(typeof q.family === "string" && q.family.length, qLabel(q) + " family");
    assert.ok(typeof q.prompt === "string" && q.prompt.trim().length, qLabel(q) + " prompt");
  });
});

test("every mc item: 4 unique choices, valid answer, hint/explain rules, source", () => {
  mcs.forEach((q) => {
    const L = qLabel(q);
    assert.ok(Array.isArray(q.choices) && q.choices.length === 4, L + " needs exactly 4 choices, got " + JSON.stringify(q.choices));
    q.choices.forEach((c, i) => assert.ok(typeof c === "string" && c.trim().length, L + " choice " + i + " empty: " + JSON.stringify(c)));
    assert.equal(new Set(q.choices).size, 4, L + " duplicate choices " + JSON.stringify(q.choices));
    assert.ok(Number.isInteger(q.answer) && q.answer >= 0 && q.answer < 4, L + " answer index " + q.answer);
    assert.ok(typeof q.hint === "string" && q.hint.trim(), L + " hint empty");
    assert.ok(typeof q.explain === "string" && q.explain.trim(), L + " explain empty");
    const right = q.choices[q.answer];
    assert.ok(!wholeWord(stripTags(q.hint), right), L + " hint gives away the answer " + JSON.stringify(right) + ": " + q.hint);
    const tags = (q.explain.match(/<[^>]*>/g) || []);
    tags.forEach((t) => assert.match(t, /^<\/?(b|i|br)\s*\/?>$/i, L + " explain uses a disallowed tag " + t));
    if (q.choiceArt !== undefined) assert.ok(Array.isArray(q.choiceArt) && q.choiceArt.length === 4, L + " choiceArt must have length 4");
    if (q.exam) assert.equal(q.type, "mc", L + " exam items must be mc");
  });
});

test("every item has a valid source (workbook pp. 19-32 or extension with note)", () => {
  Q.forEach((q) => {
    const s = q.source;
    assert.ok(s && typeof s === "object", qLabel(q) + " source missing");
    if (s.kind === "workbook") {
      assert.ok(Array.isArray(s.pages) && s.pages.length, qLabel(q) + " workbook source needs pages");
      s.pages.forEach((p) => assert.ok(Number.isInteger(p) && p >= 19 && p <= 32, qLabel(q) + " page out of range: " + p));
    } else {
      assert.equal(s.kind, "extension", qLabel(q) + " source.kind must be workbook or extension, got " + s.kind);
      assert.ok(typeof s.note === "string" && s.note.trim(), qLabel(q) + " extension source needs a note");
    }
  });
});

test("MAP matches the contract exactly; distance/satisfies/relPhrase", () => {
  assert.equal(D.MAP.cols, 5);
  assert.equal(D.MAP.rows, 3);
  assert.equal(D.MAP.street, "Calle Principal");
  assert.equal(D.MAP.note, "Left and right mean your left and right as you look at the map.");
  const want = { apartamento: [1, 0], casa: [3, 0], hotel: [0, 1], farmacia: [1, 1], panaderia: [2, 1], tienda: [3, 1], hospital: [4, 1], estacion: [0, 2], mercado: [1, 2], parque: [2, 2], teatro: [3, 2], "centro-comercial": [4, 2] };
  assert.equal(D.MAP.places.length, 12);
  D.MAP.places.forEach((p) => {
    assert.ok(want[p.id], "unexpected MAP place " + p.id);
    assert.deepEqual([p.col, p.row], want[p.id], "MAP coordinates for " + p.id);
  });
  assert.deepEqual(D.PLACES.map((p) => p.id).sort(), Object.keys(want).sort());

  const S = D.satisfies;
  assert.equal(S("izquierda", "hotel", "farmacia"), true, "hotel izquierda farmacia");
  assert.equal(S("enfrente", "farmacia", "mercado"), true, "farmacia enfrente mercado");
  assert.equal(S("detras", "apartamento", "farmacia"), true, "apartamento detras farmacia");
  assert.equal(S("lejos", "teatro", "hotel"), true, "teatro lejos hotel");
  assert.equal(S("cerca", "estacion", "mercado"), true, "estacion cerca mercado");
  assert.equal(S("derecha", "hotel", "farmacia"), false, "hotel derecha farmacia must be false");
  assert.equal(S("derecha", "farmacia", "hotel"), true, "farmacia derecha hotel");
  assert.equal(S("detras", "farmacia", "apartamento"), false, "farmacia is not behind apartamento");
  assert.equal(S("enfrente", "apartamento", "farmacia"), false, "row 0 is not enfrente of row 1");
  assert.equal(S("izquierda", "apartamento", "tienda"), false, "different rows are never izquierda");
  ["izquierda", "derecha", "enfrente", "detras", "cerca", "lejos"].forEach((r) => assert.equal(typeof S(r, "hotel", "farmacia"), "boolean", "satisfies returns boolean for " + r));
  assert.equal(S("cerca", "hotel", "teatro"), false);
  assert.equal(S("lejos", "hotel", "farmacia"), false);
  /* never both cerca and lejos */
  placeIds.forEach((a) => placeIds.forEach((b) => { if (a !== b) assert.ok(!(S("cerca", a, b) && S("lejos", a, b)), a + "/" + b + " both cerca and lejos"); }));

  assert.ok(Math.abs(D.distance("hotel", "farmacia") - 1) < 1e-9, "distance hotel-farmacia = 1");
  assert.ok(Math.abs(D.distance("hotel", "teatro") - Math.hypot(3, 1)) < 1e-9, "distance hotel-teatro");
  assert.deepEqual(["izquierda", "derecha", "enfrente", "detras", "cerca", "lejos"].map(D.relPhrase),
    ["a la izquierda", "a la derecha", "enfrente", "detrás", "cerca", "lejos"]);
});

test("geo items: exactly one right answer, at the answer index", () => {
  const geo = Q.filter((q) => q.geo);
  assert.ok(geo.length >= 20, "expected many geo items, got " + geo.length);
  geo.forEach((q) => {
    const L = qLabel(q), g = q.geo;
    assert.ok(["rel", "place", "tap"].includes(g.ask), L + " geo.ask " + g.ask);
    if (g.ask === "tap") {
      assert.equal(q.type, "tap", L + " tap geo needs type tap");
      assert.equal(q.exam, false, L + " tap items must have exam:false");
      assert.ok(!q.choices, L + " tap item must not have choices");
      assert.ok(placeIds.includes(q.target), L + " target unknown " + q.target);
      assert.ok(placeIds.includes(g.ref), L + " ref unknown " + g.ref);
      const hits = placeIds.filter((p) => p !== g.ref && D.satisfies(g.rel, p, g.ref));
      assert.deepEqual(hits, [q.target], L + " target " + q.target + " must be the ONLY place that is " + g.rel + " of " + g.ref + "; matches: " + JSON.stringify(hits));
      return;
    }
    assert.equal(q.type, "mc", L + " rel/place geo must be mc");
    assert.ok(q.art && q.art.kind === "map", L + " direction mc items must show the map (art.kind map)");
    if (g.ask === "rel") {
      assert.ok(placeIds.includes(g.a) && placeIds.includes(g.b) && g.a !== g.b, L + " bad a/b " + g.a + "," + g.b);
      assert.equal(g.rels.length, 4, L + " rels length");
      assert.equal(new Set(g.rels).size, 4, L + " duplicate rels");
      const truth = g.rels.map((r) => D.satisfies(r, g.a, g.b));
      assert.equal(truth.filter(Boolean).length, 1, L + " exactly one rel must hold for (" + g.a + "," + g.b + "); truth=" + JSON.stringify(g.rels.map((r, i) => r + ":" + truth[i])));
      assert.equal(truth.indexOf(true), q.answer, L + " answer index " + q.answer + " but the true rel is " + g.rels[truth.indexOf(true)] + " at " + truth.indexOf(true));
      g.rels.forEach((r, i) => assert.ok(norm(q.choices[i]).includes(norm(D.relPhrase(r))), L + " choice " + i + " " + JSON.stringify(q.choices[i]) + " is not aligned with rel " + r));
    } else {
      assert.ok(placeIds.includes(g.ref), L + " ref unknown " + g.ref);
      assert.equal(g.places.length, 4, L + " places length");
      assert.ok(g.places.every((p) => placeIds.includes(p)), L + " unknown place in " + JSON.stringify(g.places));
      assert.ok(!g.places.includes(g.ref), L + " ref must not be one of the choices");
      const truth = g.places.map((p) => D.satisfies(g.rel, p, g.ref));
      assert.equal(truth.filter(Boolean).length, 1, L + " exactly one place must be " + g.rel + " of " + g.ref + "; truth=" + JSON.stringify(g.places.map((p, i) => p + ":" + truth[i])));
      assert.equal(truth.indexOf(true), q.answer, L + " answer index " + q.answer + " but the true place is at " + truth.indexOf(true));
      g.places.forEach((p, i) => {
        if (g.rel === "cerca" && i !== q.answer) assert.ok(dist(p, g.ref) >= 3, L + " wrong place " + p + " must be lejos (>=3) from " + g.ref + ", distance " + dist(p, g.ref));
        if (g.rel === "lejos" && i !== q.answer) assert.ok(dist(p, g.ref) <= 1.5, L + " wrong place " + p + " must be cerca (<=1.5) of " + g.ref + ", distance " + dist(p, g.ref));
        const es = D.PLACES.find((x) => x.id === p).es;
        assert.ok(norm(q.choices[i]).includes(norm(es)), L + " choice " + i + " " + JSON.stringify(q.choices[i]) + " does not name place " + p + " (" + es + ")");
      });
    }
  });
});

test("minimum counts and blueprint coverage", () => {
  assert.ok(Q.length >= 100, "need >= 100 questions, have " + Q.length);
  const estar = Q.filter((q) => q.skill === "s4-estar");
  assert.ok(estar.length >= 24, "need >= 24 s4-estar items, have " + estar.length);
  D.ESTAR_FORMS.forEach((f) => {
    const n = estar.filter((q) => q.type === "mc" && q.choices[q.answer] === f).length;
    assert.ok(n >= 4, "form " + f + " is the answer only " + n + " times (need >= 4)");
  });
  D.SKILLS.forEach((s) => {
    const items = Q.filter((q) => q.skill === s.id);
    assert.ok(items.length >= 5, s.id + " has " + items.length + " items (need >= 5)");
    const easy = items.filter((q) => q.exam && q.difficulty <= 2).length;
    assert.ok(easy >= 3, s.id + " has " + easy + " exam items with difficulty <= 2 (need >= 3)");
  });
  assert.ok(Q.filter((q) => q.type === "tap").length >= 6, "need >= 6 tap items");
  D.AREAS.forEach((a) => {
    const n = Q.filter((q) => q.exam && a.skills.includes(q.skill)).length;
    assert.ok(n >= 2 * a.examCount, "area " + a.id + " has " + n + " exam items (need >= " + 2 * a.examCount + ")");
  });
  const fam = {};
  Q.forEach((q) => { (fam[q.family] = fam[q.family] || new Set()).add(q.skill); });
  Object.keys(fam).forEach((f) => assert.equal(fam[f].size, 1, "family " + f + " mixes skills " + [...fam[f]].join(",")));
});

test("ESTAR table, forms, SUBJECTS and s4-estar answers", () => {
  assert.deepEqual(D.ESTAR, [
    { key: "yo", pronouns: "yo", form: "estoy", en: "I am" },
    { key: "tu", pronouns: "tú", form: "estás", en: "you are (a friend)" },
    { key: "el", pronouns: "él / ella / usted", form: "está", en: "he / she is, you are (polite)" },
    { key: "nosotros", pronouns: "nosotros / nosotras", form: "estamos", en: "we are" },
    { key: "ellos", pronouns: "ellos / ellas / ustedes", form: "están", en: "they are, you all are" },
  ]);
  assert.deepEqual(D.ESTAR_FORMS, ["estoy", "estás", "está", "estamos", "están"]);
  const want = { yo: "estoy", tu: "estás", el: "está", ella: "está", usted: "está", nosotros: "estamos", nosotras: "estamos", ellos: "están", ellas: "están", ustedes: "están" };
  Object.keys(want).forEach((id) => {
    const s = D.SUBJECTS.find((x) => x.id === id);
    assert.ok(s, "SUBJECTS missing pronoun " + id);
    assert.equal(s.form, want[id], "SUBJECTS " + id + " form");
  });
  assert.equal(D.SUBJECTS.find((s) => s.id === "tu").es.toLowerCase(), "tú", "SUBJECTS tu must be spelled with the accent");
  assert.ok(D.SUBJECTS.some((s) => s.id === "mi-familia-y-yo" && s.form === "estamos"), "SUBJECTS needs mi-familia-y-yo -> estamos");
  D.SUBJECTS.forEach((s) => {
    const row = D.ESTAR.find((r) => r.key === s.key);
    assert.ok(row, "subject " + s.id + " has unknown key " + s.key);
    assert.equal(s.form, row.form, "subject " + s.id + " form " + s.form + " must match ESTAR key " + s.key + " (" + row.form + ")");
    assert.ok(s.es && s.en, "subject " + s.id + " es/en");
  });
  const fm = { yo: "estoy", tú: "estás", él: "está", ella: "está", usted: "está", nosotros: "estamos", nosotras: "estamos", ellos: "están", ellas: "están", ustedes: "están" };
  const re = /^(Yo|Tú|Él|Ella|Usted|Nosotros|Nosotras|Ellos|Ellas|Ustedes)(?![\p{L}])/u;
  let checked = 0;
  Q.filter((q) => q.skill === "s4-estar" && q.type === "mc").forEach((q) => {
    const m = re.exec(q.prompt);
    if (!m || /^\s+y\s/.test(q.prompt.slice(m[0].length))) return;
    checked++;
    assert.equal(q.choices[q.answer], fm[m[1].toLowerCase()], qLabel(q) + " prompt starts with " + m[1] + " so the answer must be " + fm[m[1].toLowerCase()] + ", got " + q.choices[q.answer] + " :: " + q.prompt);
  });
  assert.ok(checked >= 8, "expected >= 8 pronoun-led estar prompts, checked " + checked);
});

test("makeEstarQuestion for every SUBJECTS x PLACES pair", () => {
  assert.ok(D.SUBJECTS.length >= 10 && D.PLACES.length === 12);
  D.SUBJECTS.forEach((s) => D.PLACES.forEach((p) => {
    const L = "makeEstarQuestion(" + s.id + "," + p.id + ")";
    const q = D.makeEstarQuestion(s.id, p.id);
    assert.equal(q.id, "gen-estar-" + s.id + "-" + p.id, L + " id");
    assert.equal(q.skill, "s4-estar", L);
    assert.equal(q.family, "estar-" + s.key, L + " family");
    assert.equal(q.type, "mc", L);
    assert.equal(q.exam, false, L + " exam must be false");
    const subject = s.es.charAt(0).toUpperCase() + s.es.slice(1); // sentence-initial capital ("yo" -> "Yo")
    assert.equal(q.prompt, subject + " ___ " + D.enPlace(p.id) + ".", L + " prompt");
    assert.equal(q.choices.length, 4, L + " choices");
    assert.equal(new Set(q.choices).size, 4, L + " unique choices " + JSON.stringify(q.choices));
    q.choices.forEach((c) => assert.ok(D.ESTAR_FORMS.includes(c), L + " choice " + c + " not in ESTAR_FORMS"));
    assert.equal(q.choices[q.answer], s.form, L + " answer must be " + s.form + ", got " + q.choices[q.answer]);
    assert.ok(q.explain && q.hint, L + " hint/explain");
    assert.deepEqual(D.makeEstarQuestion(s.id, p.id), q, L + " must be deterministic");
    assert.deepEqual(D.byId(q.id), q, L + " byId");
  }));
  assert.equal(D.byId(Q[0].id), Q[0]);
  assert.ok(!D.byId("nope-000"), "byId of an unknown id must be falsy");
  const sk = D.bySkill("s4-estar");
  assert.ok(sk.length >= 24 && sk.every((q) => q.skill === "s4-estar"));
});

test("COLORS, CLOTHING, PLACES, WORKERS and helpers", () => {
  assert.deepEqual(D.COLORS.map((c) => c.id).sort(), CL_COLORS.slice().sort());
  const fixed = ["azul", "verde", "marron"];
  D.COLORS.forEach((c) => {
    assert.ok(c.hex && c.en, "color " + c.id + " hex/en");
    if (fixed.includes(c.id)) { assert.equal(c.changes, false, c.id + " must not change"); assert.equal(c.m, c.f, c.id + " m===f"); }
    else { assert.equal(c.changes, true, c.id + " must change"); assert.notEqual(c.m, c.f, c.id + " m!==f"); }
  });
  const col = (id) => D.COLORS.find((c) => c.id === id);
  assert.equal(col("marron").m, "marrón");
  assert.deepEqual([col("rojo").m, col("rojo").f], ["rojo", "roja"]);
  assert.deepEqual([col("amarillo").m, col("amarillo").f], ["amarillo", "amarilla"]);
  assert.deepEqual([col("negro").m, col("negro").f], ["negro", "negra"]);
  assert.deepEqual([col("blanco").m, col("blanco").f], ["blanco", "blanca"]);
  assert.deepEqual([col("anaranjado").m, col("anaranjado").f], ["anaranjado", "anaranjada"]);
  assert.deepEqual([col("rosado").m, col("rosado").f], ["rosado", "rosada"]);
  assert.equal(col("azul").m, "azul"); assert.equal(col("verde").m, "verde");

  assert.deepEqual(D.CLOTHING.map((c) => c.id).sort(), CL_ITEMS.slice().sort());
  const cl = (id) => D.CLOTHING.find((c) => c.id === id);
  assert.notEqual(cl("camisa").gender, cl("pantalon").gender, "camisa and pantalon must have different genders");
  assert.equal(cl("falda").gender, cl("camisa").gender);
  assert.equal(cl("traje").gender, cl("pantalon").gender);
  const f = cl("camisa").gender, m = cl("pantalon").gender;
  assert.equal(D.colorFor("rojo", f), "roja");
  assert.equal(D.colorFor("rojo", m), "rojo");
  assert.equal(D.colorFor("azul", f), "azul");
  assert.equal(D.colorFor("verde", m), "verde");
  assert.equal(D.colorFor("marron", f), "marrón");
  assert.equal(D.colorFor("rosado", f), "rosada");
  assert.equal(D.colorFor("anaranjado", m), "anaranjado");

  assert.equal(D.withArticle("farmacia"), "la farmacia");
  assert.equal(D.withArticle("mercado"), "el mercado");
  assert.equal(D.withArticle("centro-comercial"), "el centro comercial");
  assert.equal(D.withArticle("estacion"), "la estación de ferrocarril");
  assert.equal(D.dePlace("mercado"), "del mercado");
  assert.equal(D.dePlace("farmacia"), "de la farmacia");
  assert.equal(D.dePlace("hotel"), "del hotel");
  assert.equal(D.enPlace("hotel"), "en el hotel");
  assert.equal(D.enPlace("farmacia"), "en la farmacia");
  assert.equal(D.enPlace("panaderia"), "en la panadería");
  const pl = (id) => D.PLACES.find((p) => p.id === id);
  assert.equal(pl("estacion").es, "estación de ferrocarril");
  assert.equal(pl("centro-comercial").es, "centro comercial");
  assert.equal(pl("panaderia").es, "panadería");
  D.PLACES.forEach((p) => assert.ok(p.es && p.article && p.en, "place " + p.id + " fields"));

  const wk = (id) => D.WORKERS.find((w) => w.id === id);
  assert.deepEqual(D.WORKERS.map((w) => w.id).sort(), ["escritor", "farmaceutica", "farmaceutico", "panadero", "vendedor", "vendedora"]);
  const wp = { vendedora: "tienda", panadero: "panaderia", escritor: "apartamento", farmaceutica: "farmacia", farmaceutico: "farmacia", vendedor: "mercado" };
  Object.keys(wp).forEach((id) => assert.equal(wk(id).place, wp[id], "worker " + id + " place"));
  assert.equal(wk("farmaceutica").es, "farmacéutica");
  assert.equal(wk("farmaceutico").es, "farmacéutico");
});

/* collect every learner-visible text, with a location */
function textFields() {
  const out = [];
  const push = (where, s) => { if (typeof s === "string" && s) out.push({ where, text: stripTags(s) }); };
  Q.forEach((q) => {
    ["prompt", "promptEn", "hint", "explain"].forEach((k) => push(qLabel(q) + " " + k, q[k]));
    (q.choices || []).forEach((c, i) => push(qLabel(q) + " choice[" + i + "]", c));
  });
  D.MISSIONS.forEach((m) => {
    push(m.id + " title", m.title); push(m.id + " titleEs", m.titleEs);
    (m.learn || []).forEach((c, i) => { push(m.id + " learn[" + i + "].title", c.title); push(m.id + " learn[" + i + "].html", c.html); push(m.id + " learn[" + i + "].say", c.say); });
  });
  D.VOCAB.forEach((v) => { push("VOCAB es", v.es); push("VOCAB en", v.en); });
  D.PLACES.forEach((p) => { push("PLACES " + p.id + " es", p.es); push("PLACES " + p.id + " need", p.need); });
  D.WORKERS.forEach((w) => { push("WORKERS " + w.id + " es", w.es); push("WORKERS " + w.id + " thing", w.thing); });
  D.CLOTHING.forEach((c) => push("CLOTHING " + c.id, c.es));
  D.COLORS.forEach((c) => { push("COLORS " + c.id + " m", c.m); push("COLORS " + c.id + " f", c.f); });
  D.SUBJECTS.forEach((s) => push("SUBJECTS " + s.id, s.es));
  D.ESTAR.forEach((r) => { push("ESTAR " + r.key + " pronouns", r.pronouns); push("ESTAR " + r.key + " form", r.form); });
  return out;
}

test("Spanish orthography: required accents are never dropped", () => {
  const banned = ["panaderia", "farmaceutica", "farmaceutico", "jabon", "pantalon", "marron", "dolares", "guaranies", "estacion", "detras"];
  const subj = "(?:Yo|Tú|Él|Ella|Usted|Nosotros|Nosotras|Ellos|Ellas|Ustedes)";
  const bad = new RegExp("(?<![\\p{L}])" + subj + "\\s+(?:esta|estan|estas)(?![\\p{L}])", "iu");
  textFields().forEach(({ where, text }) => {
    banned.forEach((w) => assert.ok(!wholeWord(text, w), where + ": unaccented \"" + w + "\" in " + JSON.stringify(text)));
    assert.ok(!bad.test(text), where + ": estar verb after a subject pronoun is missing its accent: " + JSON.stringify(text));
  });
  Q.forEach((q) => {
    /* "¿Cuál palabra está bien escrita?" items teach the accent on purpose: unaccented forms may appear only as
       wrong choices there, and the right answer must carry the accent. Everywhere else they are banned. */
    const spelling = /bien escrita/i.test(q.prompt || "");
    (q.choices || []).forEach((c, i) => {
      const unaccented = /^(esta|estan|estas)$/i.test(c.trim());
      if (spelling) assert.ok(!(unaccented && i === q.answer), qLabel(q) + " the right answer must be accented, got " + JSON.stringify(c));
      else assert.ok(!unaccented, qLabel(q) + " choice " + i + " " + JSON.stringify(c) + " is an unaccented estar form");
    });
  });
  D.VOCAB.forEach((v) => assert.ok(!/^(esta|estan|estas|estas en)$/i.test(v.es.trim()), "VOCAB " + v.es + " missing accent"));
});

test("Repaso: all 8 workbook review objectives are covered", () => {
  const blob = (q) => norm([q.prompt, q.promptEn || "", q.explain || "", ...(q.choices || [])].join(" | "));
  const hasMoney50 = (q) => [q.art].concat(q.choiceArt || []).some((s) => s && s.kind === "money" && s.amount === 50 && s.currency === "USD");
  const find = (name, fn) => assert.ok(Q.some(fn), "no question covers Repaso objective: " + name);
  find("apartamento pequeño", (q) => /apartamento/.test(blob(q)) && /peque/.test(blob(q)));
  find("ropa -> tienda", (q) => /\bropa\b/.test(blob(q)) && /tienda/.test(blob(q)));
  find("camisa y falda", (q) => /camisa/.test(blob(q)) && /falda/.test(blob(q)));
  find("$50 / cincuenta dólares", (q) => (/cincuenta/.test(blob(q)) && /dolares/.test(blob(q))) || hasMoney50(q) || /\$\s?50/.test(blob(q)));
  find("agua y jabón", (q) => /\bagua\b/.test(blob(q)) && /jabon/.test(blob(q)));
  find("traje y corbata", (q) => /traje/.test(blob(q)) && /corbata/.test(blob(q)));
  find("yo -> estoy", (q) => q.skill === "s4-estar" && q.type === "mc" && /^yo(?![\p{L}])/iu.test(q.prompt) && q.choices[q.answer] === "estoy");
  find("farmacéutica -> medicinas / farmacia", (q) => /farmaceutica/.test(blob(q)) && /medicina/.test(blob(q)) && /farmacia/.test(blob(q)));
});

test("MISSIONS: ids, learn cards, qids exist, weeks 1-4, estar-lab rounds", () => {
  assert.deepEqual(D.MISSIONS.map((m) => m.id), ["m1", "m2", "m3", "m4"]);
  assert.deepEqual(D.MISSIONS.map((m) => m.week), [1, 2, 3, 4], "missions must cover weeks 1-4");
  const types = { m1: "map", m2: "closet", m3: "cleanup", m4: "estar-lab" };
  D.MISSIONS.forEach((m) => {
    assert.ok(m.title && m.titleEs, m.id + " titles");
    assert.ok(m.skills.length && m.skills.every((s) => skillOf(s) && skillOf(s).week === m.week), m.id + " skills must belong to week " + m.week);
    assert.ok(m.learn.length >= 4 && m.learn.length <= 6, m.id + " needs 4-6 learn cards, has " + m.learn.length);
    m.learn.forEach((c, i) => {
      assert.ok(c.title && c.html && c.html.trim(), m.id + " learn[" + i + "] title/html");
      (c.html.match(/<[^>]*>/g) || []).forEach((t) => assert.match(t, /^<\/?(b|i|br|ul|li)\s*\/?>$/i, m.id + " learn[" + i + "] disallowed tag " + t));
      assert.ok(Array.isArray(c.art), m.id + " learn[" + i + "].art must be an array");
    });
    assert.ok(m.practice.length >= 6 && m.practice.length <= 8, m.id + " practice must have 6-8 items, has " + m.practice.length);
    assert.equal(new Set(m.practice).size, m.practice.length, m.id + " practice duplicates");
    m.practice.forEach((id) => {
      const q = Q.find((x) => x.id === id);
      assert.ok(q, m.id + " practice qid " + id + " is not in QUESTIONS");
      assert.ok(m.skills.includes(q.skill), m.id + " practice " + id + " skill " + q.skill + " is not a mission skill");
    });
    assert.equal(m.activity.type, types[m.id], m.id + " activity.type");
    (m.activity.tasks || []).forEach((id) => assert.ok(Q.some((x) => x.id === id), m.id + " activity task " + id + " is not in QUESTIONS"));
    if (m.id === "m1") { assert.equal(m.activity.explore, true); assert.equal(m.activity.tasks.length, 6); }
    if (m.id === "m2") assert.equal(m.activity.tasks.length, 8);
    if (m.id === "m3") assert.ok(m.activity.tasks.length >= 6 && m.activity.tasks.length <= 8);
    if (m.id === "m4") {
      assert.ok(m.activity.rounds && m.activity.rounds.length >= 3, "m4 needs estar-lab rounds");
      m.activity.rounds.forEach((r) => {
        assert.ok(placeIds.includes(r.place), "m4 round place " + r.place);
        assert.ok(r.subjects.length >= 3, "m4 round " + r.place + " subjects");
        r.subjects.forEach((s) => { assert.ok(D.SUBJECTS.some((x) => x.id === s), "m4 round subject " + s); assert.ok(D.byId("gen-estar-" + s + "-" + r.place), "gen item " + s + "/" + r.place); });
      });
      assert.ok(m.activity.tasks.every((id) => /^s4-(workers|community)-/.test(id)), "m4 tasks should be s4-workers / s4-community items");
    }
  });
});

test("every art spec used in data is a legal contract 4.1 spec", () => {
  const specs = collectSpecs();
  assert.ok(specs.length > 50, "expected many art specs, found " + specs.length);
  specs.forEach(({ where, spec }) => { const e = specError(spec); assert.equal(e, null, where + ": " + e + " :: " + JSON.stringify(spec)); });
  D.VOCAB.forEach((v) => {
    assert.ok(v.es && v.en, "VOCAB entry fields " + JSON.stringify(v));
    assert.ok(v.week >= 1 && v.week <= 4 && skillOf(v.skill) && skillOf(v.skill).week === v.week, "VOCAB " + v.es + " week/skill mismatch");
  });
  const all = norm(D.VOCAB.map((v) => v.es).join(" | "));
  ["casa", "hogar", "apartamento", "sala", "comedor", "cocina", "dormitorio", "bano", "grande", "pequeno", "hotel", "farmacia", "panaderia", "hospital", "parque", "tienda", "mercado", "centro comercial", "teatro", "estacion", "vecindario",
    "derecha", "izquierda", "enfrente", "detras", "cerca", "lejos", "camisa", "camiseta", "blusa", "falda", "pantalon corto", "pantalon largo", "vestido", "traje", "corbata", "ropa",
    "rojo", "amarillo", "negro", "blanco", "azul", "verde", "marron", "anaranjado", "rosado", "dinero", "precio", "moneda", "comprar", "vender", "caro", "barato", "dolares", "guaranies", "cincuenta", "cien", "quinientos", "mil",
    "limpiar", "lavar", "secar", "cuidar", "agua", "jabon", "escoba", "trapeador", "aspiradora", "alfombra", "piso", "elegante", "informal", "limpia", "sucia", "estoy", "estas", "esta", "estamos", "estan",
    "vendedor", "panadero", "farmaceutic", "escritor"].forEach((w) => assert.ok(all.includes(w), "VOCAB is missing the word: " + w));
  D.SKILLS.filter((s) => !["s3-commands", "s4-community"].includes(s.id)).forEach((s) => assert.ok(D.VOCAB.some((v) => v.skill === s.id), "VOCAB has no entries for skill " + s.id));
  [1, 2, 3, 4].forEach((w) => assert.ok(D.VOCAB.some((v) => v.week === w), "VOCAB has no entries for week " + w));
});

/* ============================ ART ============================ */
test("art: module loads in Node, renders valid labelled SVG for every spec in data", () => {
  assert.equal(typeof ART.render, "function");
  assert.equal(typeof ART.map, "function");
  if (typeof ART.setMap === "function") ART.setMap(D.MAP, D.PLACES);
  collectSpecs().forEach(({ where, spec }) => {
    const svg = ART.render(spec);
    assert.equal(typeof svg, "string", where + " render must return a string");
    assert.ok(svg.startsWith("<svg"), where + " must start with <svg, got " + svg.slice(0, 30));
    assert.ok(/role="img"/.test(svg), where + " missing role=\"img\"");
    const label = labelOf(svg);
    assert.ok(label && label.trim(), where + " missing/empty aria-label :: " + JSON.stringify(spec));
    if (spec.kind !== "map") {
      spanishWords(spec).forEach((w) => assert.ok(!new RegExp("\\b" + esc(w) + "\\b").test(norm(label)), where + ": aria-label " + JSON.stringify(label) + " reveals the Spanish word \"" + w + "\""));
    }
  });
});

test("art: every id in the 4.1 table renders and is labelled without the Spanish noun", () => {
  if (typeof ART.setMap === "function") ART.setMap(D.MAP, D.PLACES);
  const specs = [];
  Object.keys(ART_IDS).forEach((k) => ART_IDS[k].forEach((id) => specs.push({ kind: k, id })));
  CL_ITEMS.forEach((item) => CL_COLORS.forEach((color) => specs.push({ kind: "clothing", item, color })));
  specs.push({ kind: "clothing", item: "camisa", color: "rojo", state: "sucia" }, { kind: "clothing", item: "blusa", color: "blanco", state: "limpia" });
  specs.push({ kind: "outfit", items: [{ item: "camisa", color: "azul" }, { item: "pantalon-corto", color: "marron" }, { item: "corbata", color: "rojo", state: "limpia" }] });
  [5, 50, 100, 500, 1000].forEach((amount) => ["USD", "PYG"].forEach((currency) => specs.push({ kind: "money", amount, currency })));
  specs.push({ kind: "map" }, { kind: "map", highlight: ["hotel", "farmacia"], markers: [{ place: "tienda", person: "yo" }] });
  specs.forEach((spec) => {
    const svg = ART.render(spec);
    const w = JSON.stringify(spec);
    assert.ok(typeof svg === "string" && svg.startsWith("<svg"), w + " must render an <svg string");
    assert.ok(/role="img"/.test(svg), w + " missing role=img");
    const label = labelOf(svg);
    assert.ok(label && label.trim().length > 2, w + " missing aria-label");
    if (spec.kind !== "map") spanishWords(spec).forEach((word) => assert.ok(!new RegExp("\\b" + esc(word) + "\\b").test(norm(label)), w + ": aria-label " + JSON.stringify(label) + " reveals \"" + word + "\""));
    const dec = ART.render(spec, { decorative: true });
    assert.ok(/aria-hidden="true"/.test(dec) && !/role="img"/.test(dec), w + " decorative render must be aria-hidden and not role=img");
  });
  const sized = ART.render({ kind: "place", id: "hotel" }, { size: 64 });
  assert.ok(/width="64"/.test(sized) && /height="\d+"/.test(sized), "opts.size sets width (and a proportional height)");
  assert.ok(/viewBox=/.test(ART.render({ kind: "place", id: "hotel" })), "viewBox present");
});

test("art: unknown specs never throw; map(), hero(), icon()", () => {
  [null, undefined, {}, { kind: "nope" }, { kind: "place", id: "zzz" }, { kind: "clothing", item: "zzz", color: "zzz" }, "string", 42].forEach((s) => {
    let svg;
    assert.doesNotThrow(() => { svg = ART.render(s); }, "render must not throw for " + JSON.stringify(s));
    assert.ok(typeof svg === "string" && svg.startsWith("<svg"), "placeholder svg for " + JSON.stringify(s));
  });
  const svg = ART.map(D.MAP, D.PLACES, { interactive: true });
  assert.ok(svg.startsWith("<svg") && /viewBox="0 0 1000 700"/.test(svg), "map viewBox 0 0 1000 700");
  assert.ok(/Calle Principal/.test(svg), "map shows the street name");
  D.PLACES.forEach((p) => assert.ok(new RegExp('data-place="' + p.id + '"').test(svg), "interactive map missing data-place for " + p.id));
  assert.ok(/role="button"/.test(svg), "interactive map needs role=\"button\"");
  assert.equal((svg.match(/role="button"/g) || []).length, D.PLACES.length, "one role=button per building");
  assert.ok((svg.match(/tabindex="0"/g) || []).length >= D.PLACES.length, "buildings need tabindex=0");
  const flat = ART.map(D.MAP, D.PLACES, {});
  assert.ok(!/role="button"/.test(flat), "non-interactive map has no buttons");
  D.PLACES.forEach((p) => assert.ok(new RegExp('data-place="' + p.id + '"').test(flat), "static map missing data-place " + p.id));
  const hl = ART.map(D.MAP, D.PLACES, { highlight: ["hotel"] });
  assert.notEqual(hl, flat, "highlight must change the map");
  ["hero"].forEach((f) => assert.equal(typeof ART[f], "function", "SU_ART." + f));
  assert.ok(String(ART.hero()).startsWith("<svg"));
  ["mission", "practice", "test", "warmup", "sheet", "progress"].forEach((n) => assert.ok(String(ART.icon(n)).startsWith("<svg"), "icon " + n));
});

/* ============================ ENGINE ============================ */
test("engine: createRng is deterministic, in [0,1), seed-dependent", () => {
  const a = E.createRng(42), b = E.createRng(42), c = E.createRng(43);
  const sa = [], sb = [], sc = [];
  for (let i = 0; i < 50; i++) { sa.push(a()); sb.push(b()); sc.push(c()); }
  assert.deepEqual(sa, sb);
  assert.notDeepEqual(sa, sc);
  sa.forEach((v) => assert.ok(v >= 0 && v < 1, "rng out of range " + v));
  assert.ok(new Set(sa).size > 45, "rng should not repeat");
});

test("engine: newProgress shape and recordAnswer immutability/semantics", () => {
  assert.deepEqual(E.newProgress(), { v: 1, items: {}, skills: {}, log: [] });
  const p0 = deepFreeze(E.newProgress());
  let p1;
  assert.doesNotThrow(() => { p1 = E.recordAnswer(p0, ev("s4-estar-001", "s4-estar", { at: 5 })); }, "recordAnswer must not mutate a frozen input");
  assert.deepEqual(p0, { v: 1, items: {}, skills: {}, log: [] }, "input changed");
  assert.notEqual(p1, p0);
  assert.equal(p1.items["s4-estar-001"].seen, 1);
  assert.equal(p1.items["s4-estar-001"].firstRight, 1);
  assert.equal(p1.items["s4-estar-001"].last, "right");
  assert.deepEqual(p1.skills["s4-estar"].recent, [1]);
  assert.equal(p1.skills["s4-estar"].n, 1);
  deepFreeze(p1);
  assert.doesNotThrow(() => E.recordAnswer(p1, ev("s4-estar-001", "s4-estar")));

  const hint = E.recordAnswer(E.newProgress(), ev("a-001", "s4-estar", { hintUsed: true }));
  assert.deepEqual(hint.skills["s4-estar"].recent, [0.5], "first try with hint scores 0.5");
  assert.equal(hint.items["a-001"].hints, 1);
  assert.equal(hint.items["a-001"].last, "hint");
  assert.equal(hint.skills["s4-estar"].hinted, 1);

  const fixed = E.recordAnswer(E.newProgress(), ev("a-002", "s4-estar", { firstCorrect: false, correctedAfter: true }));
  assert.deepEqual(fixed.skills["s4-estar"].recent, [0], "wrong first scores 0 even when corrected");
  assert.equal(fixed.items["a-002"].firstWrong, 1);
  assert.equal(fixed.items["a-002"].corrected, 1);
  assert.equal(fixed.items["a-002"].last, "wrong");
  assert.equal(fixed.skills["s4-estar"].wrong, 1);
  assert.equal(fixed.skills["s4-estar"].corrected, 1);

  let p = E.newProgress();
  for (let i = 0; i < 9; i++) p = E.recordAnswer(p, ev("a-00" + i, "s1-house"));
  assert.deepEqual(p.skills["s1-house"].recent, [1, 1, 1, 1, 1, 1], "recent keeps the last 6");
  let big = E.newProgress();
  for (let i = 0; i < 320; i++) big = E.recordAnswer(big, ev("b-" + i, "s1-house", { at: i }));
  assert.equal(big.log.length, 300, "log keeps the last 300 events");
});

test("engine: scoreRun counts only first-try no-hint answers", () => {
  const ans = [
    { qid: "s4-estar-001", skill: "s4-estar", firstCorrect: true, hintUsed: false, correctedAfter: false },
    { qid: "s4-estar-002", skill: "s4-estar", firstCorrect: false, hintUsed: false, correctedAfter: true },
    { qid: "s1-house-001", skill: "s1-house", firstCorrect: true, hintUsed: true, correctedAfter: false },
    { qid: "s1-house-002", skill: "s1-house", firstCorrect: false, hintUsed: false, correctedAfter: false },
  ];
  const r = E.scoreRun(ans, D);
  assert.equal(r.total, 4);
  assert.equal(r.firstTry, 1, "only firstCorrect && !hintUsed counts");
  assert.equal(r.pct, 25, "pct ignores corrections and hints");
  assert.equal(r.corrected, 1);
  assert.equal(r.hinted, 1);
  assert.deepEqual(r.byArea.estar, { right: 1, total: 2 });
  assert.deepEqual(r.byArea.neighborhood, { right: 0, total: 2 });
  assert.deepEqual(r.bySkill["s4-estar"], { right: 1, total: 2 });
  assert.deepEqual(r.missed.slice().sort(), ["s1-house-001", "s1-house-002", "s4-estar-002"], "missed = every item not right first try with no hint");
});

test("engine: skillMastery thresholds", () => {
  const run = (scores) => {
    let p = E.newProgress();
    scores.forEach((s, i) => {
      const e = s === 1 ? {} : s === 0.5 ? { hintUsed: true } : { firstCorrect: false, correctedAfter: true };
      p = E.recordAnswer(p, ev("k-" + i, "s2-colors", e));
    });
    return E.skillMastery(p, "s2-colors");
  };
  assert.equal(E.skillMastery(E.newProgress(), "s2-colors").level, "new");
  assert.equal(E.skillMastery(E.newProgress(), "s2-colors").n, 0);
  assert.equal(run([0, 0, 1]).level, "learning", "score .33 -> learning");
  assert.equal(run([0]).level, "learning");
  assert.equal(run([1, 1]).level, "almost", "fewer than 3 recent can not be mastered; score 1 -> almost");
  assert.equal(run([1, 0, 1, 1, 0, 1]).level, "almost", "score .67 -> almost");
  assert.equal(run([0, 0, 1, 1, 1, 1]).level, "almost", "last 3 right but score .67 < .8 -> almost");
  assert.equal(run([1, 1, 1, 1, 1, 1]).level, "mastered");
  assert.equal(run([0, 1, 1, 1, 1, 1]).level, "mastered", "score .83, last 3 all 1");
  assert.equal(run([1, 1, 1, 1, 1, 0.5]).level, "almost", "last score .5 breaks the last-3 rule");
  const s = run([1, 1, 1, 1, 1, 1]);
  assert.equal(s.n, 6);
  assert.ok(Math.abs(s.score - 1) < 1e-9);
  assert.ok(Math.abs(run([1, 0, 1, 1, 0, 1]).score - 4 / 6) < 1e-6, "score = mean of recent");
});

test("engine: weakestSkills ordering", () => {
  let p = E.newProgress();
  for (let i = 0; i < 3; i++) p = E.recordAnswer(p, ev("w-" + i, "s1-house", { firstCorrect: false, correctedAfter: true }));
  for (let i = 0; i < 6; i++) p = E.recordAnswer(p, ev("m-" + i, "s1-places"));
  const all = E.weakestSkills(p, D, 12);
  assert.equal(all.length, 12);
  assert.equal(new Set(all).size, 12);
  assert.equal(all[0], "s1-house", "learning skill first");
  assert.equal(all[11], "s1-places", "mastered skill last");
  assert.equal(E.weakestSkills(p, D, 3).length, 3);
});

function distinctSets(fn, n) { const set = new Set(); for (let s = 1; s <= n; s++) set.add(fn(s).slice().sort().join(",")); return set.size; }

test("engine: buildExam blueprint", () => {
  const P = E.newProgress();
  for (let seed = 1; seed <= 10; seed++) {
    const ids = E.buildExam(D, E.createRng(seed));
    assert.equal(ids.length, D.EXAM.total, "seed " + seed + " exam length");
    assert.equal(new Set(ids).size, ids.length, "seed " + seed + " duplicate ids");
    const qs = ids.map((id) => { const q = D.byId(id); assert.ok(q, "seed " + seed + " unknown id " + id); return q; });
    qs.forEach((q) => { assert.equal(q.exam, true, "seed " + seed + " " + q.id + " is not an exam item"); assert.equal(q.type, "mc", q.id + " must be mc"); });
    D.AREAS.forEach((a) => assert.equal(qs.filter((q) => a.skills.includes(q.skill)).length, a.examCount, "seed " + seed + " area " + a.id + " count"));
    assert.deepEqual([...new Set(qs.map((q) => q.week))].sort(), [1, 2, 3, 4], "seed " + seed + " must cover weeks 1-4");
    /* ESTAR has 5 pronoun families but 7 exam slots, so an ESTAR family may appear twice (two different
       sentences); every other family appears at most once. */
    const famCount = {};
    qs.forEach((q) => { famCount[q.family] = (famCount[q.family] || 0) + 1; });
    Object.keys(famCount).forEach((f) => {
      const estar = qs.find((q) => q.family === f).skill === "s4-estar";
      assert.ok(famCount[f] <= (estar ? 2 : 1), "seed " + seed + " family " + f + " used " + famCount[f] + " times: " + qs.map((q) => q.family).join(","));
    });
    D.AREAS.forEach((a) => { if (a.examCount >= a.skills.length) a.skills.forEach((s) => assert.ok(qs.some((q) => q.skill === s), "seed " + seed + " area " + a.id + " missing skill " + s)); });
  }
  assert.deepEqual(E.buildExam(D, E.createRng(7)), E.buildExam(D, E.createRng(7)), "same seed -> same exam");
  assert.ok(distinctSets((s) => E.buildExam(D, E.createRng(s)), 10) >= 8, "different seeds must give different exams");
  assert.ok(P);
});

test("engine: buildDiagnostic", () => {
  for (let seed = 1; seed <= 10; seed++) {
    const ids = E.buildDiagnostic(D, E.createRng(seed));
    assert.equal(ids.length, 12);
    assert.equal(new Set(ids).size, 12);
    const qs = ids.map((id) => D.byId(id));
    qs.forEach((q, i) => { assert.ok(q, "unknown id " + ids[i]); assert.ok(q.exam && q.difficulty <= 2, "seed " + seed + " " + q.id + " must be exam & difficulty<=2"); });
    assert.deepEqual(qs.map((q) => q.skill).sort(), D.SKILLS.map((s) => s.id).sort(), "seed " + seed + " must cover all 12 skills once");
    for (let i = 1; i < qs.length; i++) assert.notEqual(areaOfSkill(qs[i].skill).id, areaOfSkill(qs[i - 1].skill).id, "seed " + seed + " adjacent items " + qs[i - 1].id + "," + qs[i].id + " share an area");
  }
  assert.deepEqual(E.buildDiagnostic(D, E.createRng(3)), E.buildDiagnostic(D, E.createRng(3)));
});

test("engine: buildWarmup", () => {
  let weak = E.newProgress();
  for (let i = 0; i < 4; i++) weak = E.recordAnswer(weak, ev("x-" + i, "s3-commands", { firstCorrect: false }));
  [E.newProgress(), weak].forEach((P, k) => {
    for (let seed = 1; seed <= 10; seed++) {
      const ids = E.buildWarmup(D, P, E.createRng(seed));
      const L = "progress#" + k + " seed " + seed;
      assert.equal(ids.length, 10, L + " length");
      assert.equal(new Set(ids).size, 10, L + " duplicates");
      const qs = ids.map((id) => D.byId(id));
      qs.forEach((q, i) => { assert.ok(q, L + " unknown id " + ids[i]); assert.ok(q.exam === true && q.difficulty <= 2, L + " " + q.id + " must be exam & difficulty<=2"); assert.equal(q.type, "mc"); });
      const n = (s) => qs.filter((q) => q.skill === s).length;
      assert.ok(n("s4-estar") >= 3, L + " needs >= 3 s4-estar, has " + n("s4-estar"));
      assert.ok(n("s1-directions") >= 2, L + " needs >= 2 s1-directions, has " + n("s1-directions"));
      assert.ok(n("s2-colors") >= 2, L + " needs >= 2 s2-colors, has " + n("s2-colors"));
    }
  });
  const w = E.buildWarmup(D, weak, E.createRng(2));
  assert.ok(w.some((id) => D.byId(id).skill === "s3-commands"), "weak skill s3-commands should be drawn into the warm-up");
});

test("engine: buildFix returns a sibling first, the original later", () => {
  const byFam = {};
  Q.filter((q) => q.type === "mc").forEach((q) => { (byFam[q.family] = byFam[q.family] || []).push(q); });
  const fams = Object.keys(byFam).filter((f) => byFam[f].length >= 2).slice(0, 12);
  assert.ok(fams.length >= 6, "expected several families with >= 2 mc items");
  fams.forEach((f) => {
    const orig = byFam[f][0];
    let p = E.recordAnswer(E.newProgress(), ev(orig.id, orig.skill, { firstCorrect: false, correctedAfter: true }));
    for (let seed = 1; seed <= 4; seed++) {
      const ids = E.buildFix(D, p, E.createRng(seed), 12);
      const L = "family " + f + " seed " + seed;
      assert.ok(ids.length >= 1 && ids.length <= 12, L + " length " + ids.length);
      assert.equal(new Set(ids).size, ids.length, L + " duplicates");
      const io = ids.indexOf(orig.id);
      assert.ok(io >= 0, L + " original " + orig.id + " must appear in the fix list " + JSON.stringify(ids));
      const sibIdx = ids.findIndex((id) => id !== orig.id && D.byId(id) && D.byId(id).family === f);
      assert.ok(sibIdx >= 0, L + " needs a family sibling (different id) in " + JSON.stringify(ids));
      assert.ok(sibIdx < io, L + " sibling must come before the original " + orig.id + ": " + JSON.stringify(ids));
    }
  });
  assert.deepEqual(E.buildFix(D, E.newProgress(), E.createRng(1), 12), [], "nothing to fix -> empty list");
  let many = E.newProgress();
  Q.slice(0, 30).forEach((q) => { if (q.type === "mc") many = E.recordAnswer(many, ev(q.id, q.skill, { firstCorrect: false })); });
  assert.ok(E.buildFix(D, many, E.createRng(1), 5).length <= 5 + 0, "buildFix respects max");
});

test("engine: buildPractice respects skills, count, interleaving", () => {
  const sets = [["s1-house", "s1-places", "s1-directions"], ["s4-estar", "s2-colors"], ["s3-cleaning", "s3-commands", "s3-clothes-desc"], D.SKILLS.map((s) => s.id)];
  sets.forEach((skills) => {
    for (let seed = 1; seed <= 6; seed++) {
      const ids = E.buildPractice(D, E.newProgress(), { skills, count: 10, rng: E.createRng(seed) });
      const L = "skills " + skills.join("+") + " seed " + seed;
      assert.equal(ids.length, 10, L + " count");
      assert.equal(new Set(ids).size, 10, L + " duplicates");
      const qs = ids.map((id) => D.byId(id));
      qs.forEach((q, i) => { assert.ok(q, L + " unknown id " + ids[i]); assert.ok(skills.includes(q.skill), L + " " + q.id + " skill " + q.skill + " not allowed"); });
      for (let i = 1; i < qs.length; i++) assert.notEqual(qs[i].skill, qs[i - 1].skill, L + " consecutive same skill at " + qs[i - 1].id + "," + qs[i].id);
    }
  });
  const one = E.buildPractice(D, E.newProgress(), { skills: ["s4-estar"], count: 8, rng: E.createRng(1) });
  assert.equal(one.length, 8);
  assert.ok(one.every((id) => D.byId(id).skill === "s4-estar"));
  const dflt = E.buildPractice(D, E.newProgress(), { skills: ["s4-estar", "s4-workers"], rng: E.createRng(2) });
  assert.equal(dflt.length, 10, "count defaults to 10");
  /* fewer-seen items first */
  let seen = E.newProgress();
  const first = E.buildPractice(D, seen, { skills: ["s1-house", "s1-places"], count: 6, rng: E.createRng(5) });
  first.forEach((id) => { seen = E.recordAnswer(seen, ev(id, D.byId(id).skill)); });
  const second = E.buildPractice(D, seen, { skills: ["s1-house", "s1-places"], count: 6, rng: E.createRng(5) });
  assert.ok(second.filter((id) => !first.includes(id)).length >= 4, "fewer-seen items should come first: second run " + JSON.stringify(second) + " first run " + JSON.stringify(first));
});

test("engine: shuffleChoices keeps the correct answer and returns a permutation", () => {
  mcs.forEach((q) => {
    for (let seed = 1; seed <= 3; seed++) {
      const r = E.shuffleChoices(q, E.createRng(seed * 31 + 7));
      const L = qLabel(q) + " seed " + seed;
      assert.equal(r.choices.length, 4, L);
      assert.equal(r.choices[r.answer], q.choices[q.answer], L + " correct choice " + JSON.stringify(q.choices[q.answer]) + " must be at the new answer index " + r.answer + " (choices " + JSON.stringify(r.choices) + ")");
      assert.deepEqual(r.order.slice().sort(), [0, 1, 2, 3], L + " order must be a permutation");
      r.order.forEach((from, i) => assert.equal(r.choices[i], q.choices[from], L + " choices[" + i + "] must equal original[" + from + "]"));
      assert.equal(r.order[r.answer], q.answer, L + " order[answer] must be the original answer index");
      if (q.choiceArt) { assert.equal(r.choiceArt.length, 4, L); r.order.forEach((from, i) => assert.deepEqual(r.choiceArt[i], q.choiceArt[from], L + " choiceArt follows order")); }
    }
  });
  const q = mcs[0];
  assert.deepEqual(E.shuffleChoices(q, E.createRng(9)), E.shuffleChoices(q, E.createRng(9)), "deterministic for a seed");
  const orders = new Set(); for (let s = 1; s <= 20; s++) orders.add(E.shuffleChoices(q, E.createRng(s)).order.join(""));
  assert.ok(orders.size > 3, "shuffle should vary");
});

test("engine: estarRound builds makeEstarQuestion items", () => {
  const round = { place: "panaderia", subjects: ["el", "nosotros", "yo", "ellos", "tu"] };
  const qs = E.estarRound(D, round);
  assert.equal(qs.length, 5);
  qs.forEach((q, i) => {
    assert.deepEqual(q, D.makeEstarQuestion(round.subjects[i], round.place), "estarRound item " + i);
  });
  D.MISSIONS.find((m) => m.id === "m4").activity.rounds.forEach((r) => assert.equal(E.estarRound(D, r).length, r.subjects.length));
});

/* ============================ INTEGRATION ============================ */
const read = (f) => fs.readFileSync(path.join(SU_DIR, f), "utf8");

test("integration: index.html structure and script order", () => {
  assert.ok(fs.existsSync(path.join(SU_DIR, "index.html")), "spanish-unit2/index.html must exist");
  const html = read("index.html");
  const scripts = [...html.matchAll(/<script\b[^>]*>/gi)].map((m) => m[0]);
  const srcs = scripts.map((t) => (/src="([^"]+)"/.exec(t) || [])[1]).filter(Boolean);
  assert.deepEqual(srcs, ["../assets/app.js", "../assets/quest-kit.js", "data.js", "art.js", "ui.js", "speech.js", "engine.js", "activities.js", "app.js"], "script order (contract section 1)");
  scripts.filter((t) => /src=/.test(t)).forEach((t) => assert.ok(/\bdefer\b/.test(t), "script must be deferred: " + t));
  const css = [...html.matchAll(/<link\b[^>]*rel="stylesheet"[^>]*>/gi)].map((m) => /href="([^"]+)"/.exec(m[0])[1]);
  assert.deepEqual(css, ["../assets/quest-kit.css", "styles.css"], "stylesheet order");
  const body = /<body\b[^>]*class="([^"]*)"/i.exec(html);
  assert.ok(body, "<body> needs a class");
  const cls = body[1].split(/\s+/);
  ["qk", "qk-spanish", "su"].forEach((c) => assert.ok(cls.includes(c), "body class missing " + c + " (has " + body[1] + ")"));
  assert.ok(/<a\b[^>]*href="\.\.\/fifth-grade\/"[^>]*>[^<]*← 5th grade/.test(html), "needs the ← 5th grade link to ../fifth-grade/");
  assert.ok(/id="app"/.test(html), "needs <div id=\"app\">");
  ["#mission", "#test", "#warmup"].forEach((h) => assert.ok(html.includes('href="' + h + '"'), "no-script link " + h));
  assert.ok(/Spanish Quest: ¿Cómo vivimos\?/.test(html), "title");
  assert.ok(/Unit 2 Grammar Adventure/.test(html), "subtitle");
});

test("integration: app.js records progress and uses the storage key", () => {
  const app = read("app.js");
  assert.ok(app.includes('StudyQuest.record("spanish-unit2"'), "app.js must call StudyQuest.record(\"spanish-unit2\", ...)");
  assert.ok(app.includes("studyquest:spanish-unit2:v1"), "app.js must use storage key studyquest:spanish-unit2:v1");
  assert.ok(!/\balert\s*\(/.test(app), "no alert()");
});

test("integration: no external script/style/img/font references in spanish-unit2/*", () => {
  const files = fs.readdirSync(SU_DIR).filter((f) => /\.(html|css|js)$/.test(f));
  ["index.html", "styles.css", "data.js", "art.js", "ui.js", "engine.js", "app.js", "activities.js", "speech.js"].forEach((f) => assert.ok(files.includes(f), "missing spanish-unit2/" + f));
  files.forEach((f) => {
    const src = read(f);
    const bad = [
      /\bsrc\s*=\s*["']?(?:https?:)?\/\//i, /<link\b[^>]*\bhref\s*=\s*["']?(?:https?:)?\/\//i, /url\(\s*["']?(?:https?:)?\/\//i,
      /@import\s+(?:url\()?\s*["']?(?:https?:)?\/\//i, /\bimport\s*\(\s*["']https?:/i, /\bimportScripts\s*\(/,
    ];
    bad.forEach((re) => assert.ok(!re.test(src), "spanish-unit2/" + f + " has an external reference matching " + re));
  });
});

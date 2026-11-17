/* Ave María Quest (ave-maria/): the prayer text must match the class test sheet exactly, every helper used by the
   games must be correct, and the page must be wired into the PWA. Run: node --test tests/*.test.js */
"use strict";
const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");

const ROOT = path.join(__dirname, "..");
const D = require("../ave-maria/data.js");
const DIR = path.join(ROOT, "ave-maria");

/* The prayer exactly as printed on the teacher's sheet (accents included), one entry per printed line. */
const SHEET = [
  "Ave María, grátia plena,",
  "Dóminus tecum.",
  "Benedicta tu in muliéribus,",
  "et benedíctus fructus ventris tui, Iesus.",
  "Sancta María, Mater Dei,",
  "ora pro nobis peccatoribus",
  "nunc et in hora mortis nostrae.",
  "Amen."
];

test("prayer text matches the class sheet exactly", () => {
  assert.deepEqual(D.LINES.map((l) => l.text), SHEET);
  assert.equal(D.TEXT, SHEET.join(" "));
  assert.equal(D.TEXT.normalize("NFC"), D.TEXT, "text is NFC-normalized (accents are single code points)");
});

test("31 words, one point each, like the sheet's TOTAL /31", () => {
  assert.equal(D.WORDS.length, 31);
  assert.equal(D.META.totalWords, 31);
  assert.equal(D.WORDS.map((w) => w.token).join(" "), D.TEXT);
  D.WORDS.forEach((w, i) => {
    assert.equal(w.i, i);
    assert.ok(w.word && !/[.,]/.test(w.word), "word " + i + " has no punctuation");
    assert.ok(w.en && w.pron, "word " + i + " (" + w.word + ") has a meaning and a pronunciation");
    assert.equal(w.line, D.LINES[w.lineIndex].id);
    assert.equal(D.LINES[w.lineIndex].words[w.at], w.word);
  });
  assert.equal(D.WORDS[30].word, "Amen");
  assert.equal(D.WORDS[5].word, "tecum");
});

test("every line has pronunciation, English, Spanish and a memory hook; parts cover all lines once", () => {
  D.LINES.forEach((l) => ["pron", "en", "es", "hook"].forEach((k) => assert.ok(l[k] && l[k].trim(), l.id + "." + k)));
  const covered = D.PARTS.flatMap((p) => p.lines);
  assert.deepEqual(covered, D.LINES.map((l) => l.id));
  assert.deepEqual(D.PARTS.map((p) => D.partWords(p.id).length), [6, 10, 8, 7]);
  D.LINES.forEach((l) => assert.equal(D.PARTS.find((p) => p.id === l.part).lines.includes(l.id), true, l.id + " part"));
});

test("phrases cover the prayer in order; meanings are distinct", () => {
  assert.equal(D.PHRASES.join(" "), D.TEXT);
  assert.equal(new Set(D.PHRASES).size, D.PHRASES.length);
  assert.equal(D.MEANINGS.length, 8);
  assert.equal(new Set(D.MEANINGS.map((m) => m[1])).size, 8);
  D.MEANINGS.forEach(([la]) => assert.ok(D.TEXT.includes(la.split(",")[0]), "meaning phrase " + la + " is in the prayer"));
});

test("each slip changes exactly one word to a different word, with an explanation", () => {
  assert.ok(D.SLIPS.length >= 12);
  D.SLIPS.forEach((s) => {
    const line = D.lineById(s.line);
    assert.ok(line, s.line);
    const r = D.slipLine(s);
    assert.equal(r.tokens.length, line.text.split(" ").length);
    const diffs = r.tokens.filter((t, i) => t !== line.text.split(" ")[i]);
    assert.equal(diffs.length, 1, "exactly one word differs in " + r.tokens.join(" "));
    assert.notEqual(D.norm(r.wrong), D.norm(r.right), "slip must really change the word");
    assert.ok(s.why && s.why.length > 10);
  });
});

test("first-letter cues", () => {
  assert.deepEqual(D.firstLetters(), ["A M, g p,", "D t.", "B t i m,", "e b f v t, I.", "S M, M D,", "o p n p", "n e i h m n.", "A."]);
  assert.deepEqual(D.firstLetters(["l2"]), ["D t."]);
});

test("disappearing words: levels hide the right amount, deterministically", () => {
  assert.equal(D.VANISH_LEVELS.length, 5);
  const count = (lvl, seed) => D.vanishMask(lvl, seed).hidden.filter(Boolean).length;
  assert.equal(count(0, 1), 0);
  assert.equal(count(1, 1), 10);
  assert.equal(count(2, 1), 21);
  assert.equal(count(3, 1), 31);
  assert.equal(count(4, 1), 31);
  assert.equal(D.vanishMask(3, 1).cue, "letter");
  assert.equal(D.vanishMask(4, 1).cue, "none");
  assert.deepEqual(D.vanishMask(2, 7), D.vanishMask(2, 7));
  const masks = new Set([1, 2, 3, 4, 5].map((s) => D.vanishMask(1, s).hidden.join("")));
  assert.ok(masks.size >= 4, "different seeds hide different words");
});

test("test-day score is one point per word out of 31", () => {
  assert.deepEqual(D.scoreRecital([]), { score: 31, total: 31, pct: 100, missed: [] });
  const r = D.scoreRecital([5, 0, 5, 99, -1]);
  assert.equal(r.score, 29);
  assert.deepEqual(r.missed, [0, 5]);
  assert.equal(r.pct, 94);
});

test("speech text respells for Italian and Spanish voices without touching the display text", () => {
  const it = D.speechText(D.TEXT, "it-IT");
  assert.match(it, /gràzia/);
  assert.match(it, / ora mortis nostre\./);
  assert.equal(it.split(" ").length, 31);
  assert.equal(D.speechText(D.TEXT, "en-US"), D.TEXT);
  assert.match(D.speechText("nunc et in hora mortis nostrae.", "es"), /in ora mortis nostre\./);
});

test("tricky spots, ranks and the plan are consistent", () => {
  D.TRICKY.forEach((t) => t.words.forEach((i) => assert.ok(i >= 0 && i < 31)));
  assert.equal(D.WORDS[D.TRICKY.find((t) => /tecum/.test(t.title)).words[0]].word, "tecum");
  assert.ok(D.RANKS.every((r, i) => i === 0 || r.min > D.RANKS[i - 1].min));
  assert.deepEqual(D.PLAN.map((p) => p.id), ["meet", "learnAB", "learnCD", "vanish", "break", "recall", "test", "bedtime"]);
  assert.equal(D.MORNING.id, "morning");
});

/* ---------------- integration with the page and the PWA ---------------- */
function read(f) { return fs.readFileSync(path.join(ROOT, f), "utf8"); }

test("page loads its scripts in the contract order and links back to 5th grade", () => {
  const html = read("ave-maria/index.html");
  const order = ["../assets/app.js", "../assets/quest-kit.js", "data.js", "speech.js", "art.js", "games-learn.js", "games-challenge.js", "games-catch.js", "games-window.js", "app.js"];
  const pos = order.map((s) => html.indexOf('src="' + s));
  pos.forEach((p, i) => assert.ok(p > 0, order[i] + " is loaded"));
  assert.deepEqual(pos.slice().sort((a, b) => a - b), pos, "scripts are in order");
  assert.match(html, /class="qk qk-ave am"/);
  assert.ok(html.includes('href="../fifth-grade/"'));
  ["styles.css", "learn.css", "challenge.css", "catch.css", "window.css"].forEach((c) => assert.ok(html.includes('href="' + c), c));
});

test("games register under AM_GAMES and the test result is recorded as ave-maria", () => {
  const learn = read("ave-maria/games-learn.js"), chal = read("ave-maria/games-challenge.js"), app = read("ave-maria/app.js");
  ["meet", "learn", "vanish", "bedtime", "morning"].forEach((g) => assert.match(learn, new RegExp("G\\." + g + "\\s*=")));
  ["next", "slip", "match", "build", "test", "blanks"].forEach((g) => assert.match(chal, new RegExp("G\\." + g + "\\s*=")));
  assert.match(read("ave-maria/games-catch.js"), /G\.catch\s*=/, "Lantern catch registers G.catch");
  assert.match(read("ave-maria/games-window.js"), /G\.window\s*=/, "Light the window registers G.window");
  assert.match(app, /"catch":\s*1/, "#catch is a game route");
  assert.match(app, /"window":\s*1/, "#window is a game route");
  assert.match(app, /vanish:\s*\[\["vanish"\], \["catch"\]\]/, "the plan's vanish step ends with Lantern catch");
  assert.match(app, /blanks:\s*1/, "#blanks is a game route");
  assert.match(app, /recall:\s*\[\["next"\], \["slip"\], \["blanks"\]\]/, "the recall step ends with Fill in the blank");
  assert.match(app, /StudyQuest\.record\(\s*["']ave-maria["']/);
  assert.ok(app.includes("studyquest:ave-maria:v1"));
});

test("no external resources in the guide", () => {
  for (const f of fs.readdirSync(DIR)) {
    const s = fs.readFileSync(path.join(DIR, f), "utf8");
    assert.ok(!/(?:src|href)=["']https?:/i.test(s) && !/url\(\s*["']?https?:/i.test(s) && !/@import\s+["']?https?:/i.test(s), f + " loads nothing from the network");
  }
});

test("the guide is on the 5th grade dashboard and precached for offline use", () => {
  const dash = read("fifth-grade/index.html");
  assert.ok(dash.includes('href="../ave-maria/"'));
  assert.ok(dash.includes('data-best="ave-maria"'));
  const sw = read("sw.js");
  const PRECACHE = JSON.parse(sw.match(/var PRECACHE = (\[[\s\S]*?\]);/)[1]);
  ["", "styles.css", "learn.css", "challenge.css", "catch.css", "window.css", "data.js", "speech.js", "art.js", "games-learn.js",
    "games-challenge.js", "games-catch.js", "games-window.js", "app.js"]
    .forEach((f) => assert.ok(PRECACHE.includes("ave-maria/" + f), "ave-maria/" + f + " precached"));
});

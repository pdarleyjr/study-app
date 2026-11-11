/* Today's Plan data + dashboard checks. Run: node --test tests/*.test.js */
"use strict";
const test = require("node:test");
const assert = require("node:assert");
const fs = require("node:fs");
const path = require("node:path");
const { execFileSync } = require("node:child_process");

const ROOT = path.join(__dirname, "..");
const P = require("../todays-plan/plan-data.js");
const items = P.PLAN.items;
const t = (hm) => "2026-11-11T" + hm + ":00-05:00";

// id, start, end, subject, href, pages, presetDone. Updated 11:20 AM: 20 pages per reading session.
const TABLE = [
  ["misfits-213", "10:00", "10:25", "Reading", null, [213, 232], true],
  ["math", "10:35", "11:00", "Math", "fractions-review/", null, true],
  ["religion", "11:15", "11:40", "Religion", "sacraments-quest/", null, false],
  ["misfits-233", "12:30", "12:55", "Reading", null, [233, 252], false],
  ["wild-robot", "13:10", "13:20", "Reading", "wild-robot-quest/", null, false],
  ["misfits-253", "13:35", "14:00", "Reading", null, [253, 269], false],
  ["science-lab", "14:15", "14:25", "Science", "matter-lab/#lesson", null, false],
  ["science-challenge", "14:25", "14:40", "Science", "matter-lab/#challenge", null, false]
];

test("plan metadata", () => {
  assert.strictEqual(P.PLAN.id, "2026-11-11");
  assert.strictEqual(P.PLAN.storageKey, "studyquest:plan:2026-11-11:v1");
  assert.strictEqual(P.PLAN.timeZone, "America/New_York");
  assert.strictEqual(P.PLAN.targetFinish, "2:40 PM");
  assert.strictEqual(P.PLAN.deadline, "9:00 PM");
});

test("exactly 8 items with unique ids", () => {
  assert.strictEqual(items.length, 8);
  assert.strictEqual(new Set(items.map((i) => i.id)).size, 8);
});

test("times, subjects, hrefs and pages match the table", () => {
  TABLE.forEach((row, n) => {
    const it = items[n];
    assert.strictEqual(it.id, row[0]);
    assert.strictEqual(it.start, t(row[1]));
    assert.strictEqual(it.end, t(row[2]));
    assert.strictEqual(it.subject, row[3]);
    assert.strictEqual(it.href, row[4]);
    assert.deepStrictEqual(it.pages ? [it.pages.from, it.pages.to] : null, row[5]);
    assert.strictEqual(it.kind, row[4] ? "guide" : "reading");
    assert.strictEqual(it.presetDone, row[6], it.id + " presetDone");
  });
});

test("Misfits reading totals 57 pages; no textbook/Wild Robot page reading", () => {
  assert.strictEqual(P.totalPages(), 57);
  assert.strictEqual(items.filter((i) => i.pages).every((i) => i.title === "The Misfits"), true);
  assert.ok(!items.some((i) => /textbook|Wild Robot.*pages/i.test(i.task)));
});

test("chronological, no overlap, end after start", () => {
  items.forEach((it, n) => {
    assert.ok(Date.parse(it.end) > Date.parse(it.start), it.id);
    if (n) assert.ok(Date.parse(it.start) >= Date.parse(items[n - 1].end), it.id);
  });
  assert.strictEqual(P.minutesOf(items[0]), 25);
});

test("guide hrefs present", () => {
  const hrefs = items.map((i) => i.href);
  ["sacraments-quest/", "fractions-review/", "wild-robot-quest/", "matter-lab/#lesson", "matter-lab/#challenge"]
    .forEach((h) => assert.ok(hrefs.includes(h), h));
  assert.strictEqual(P.guideId(items[6]), "matter-lab");
});

test("statusOf / nextItem: any order, preset ticks, undo", () => {
  const at = (hm) => Date.parse(t(hm));
  const byId = (id) => items.find((i) => i.id === id);
  // Math and pages 213-232 start ticked on every device; nothing else does.
  const start = P.effectiveDone({});
  assert.deepStrictEqual(Object.keys(start).sort(), ["math", "misfits-213"]);
  assert.strictEqual(P.statusOf(byId("math"), at("11:25"), start), "done");
  assert.strictEqual(P.statusOf(byId("religion"), at("11:25"), start), "now");
  assert.strictEqual(P.nextItem(at("11:25"), start).id, "religion");
  assert.strictEqual(P.statusOf(byId("misfits-233"), at("11:25"), start), "next");
  // out of order: tick the science lab first
  let s1 = P.withTick({}, "science-lab", true, 1);
  let d1 = P.effectiveDone(s1);
  assert.strictEqual(P.statusOf(byId("science-lab"), at("11:25"), d1), "done");
  assert.strictEqual(P.nextItem(at("11:25"), d1).id, "religion");
  // after religion's slot, a not-done religion is "later" (still to do) and up next moves to what's coming
  assert.strictEqual(P.statusOf(byId("religion"), at("11:50"), d1), "later");
  assert.strictEqual(P.nextItem(at("11:50"), d1).id, "misfits-233");
  // untick a preset item and tick it again
  const s2 = P.withTick(s1, "math", false, 2);
  assert.ok(!P.effectiveDone(s2).math);
  assert.ok(P.effectiveDone(P.withTick(s2, "math", true, 3)).math);
  // ticks from the earlier version of the plan (removed ids) are ignored
  assert.deepStrictEqual(Object.keys(P.effectiveDone({ done: { "misfits-223": 5 } })).sort(), ["math", "misfits-213"]);
  // pages read starts at 20
  const pages = items.reduce((n, i) => n + (start[i.id] ? P.pageCount(i) : 0), 0);
  assert.strictEqual(pages, 20);
  const all = {}; items.forEach((i) => { all[i.id] = 1; });
  assert.strictEqual(P.nextItem(at("20:00"), all), null);
});

test("expiry is clock based", () => {
  assert.strictEqual(P.isExpired(Date.parse("2026-11-12T23:59:59-05:00")), false);
  assert.strictEqual(P.isExpired(Date.parse("2026-11-13T00:00:00-05:00")), true);
  assert.strictEqual(P.isExpired(Date.parse("2027-01-01T00:00:00-05:00")), true);
});

test("formatTime is Eastern even when the process TZ differs", () => {
  assert.strictEqual(P.formatTime(items[3].start), "12:30 PM");
  const code = "const P=require(" + JSON.stringify(path.join(ROOT, "todays-plan/plan-data.js")) + ");process.stdout.write(P.formatTime('2026-11-11T12:30:00-05:00'))";
  for (const tz of [undefined, "Asia/Tokyo", "America/Los_Angeles"]) {
    const env = Object.assign({}, process.env);
    if (tz) env.TZ = tz; else delete env.TZ;
    assert.strictEqual(execFileSync(process.execPath, ["-e", code], { env }).toString(), "12:30 PM", String(tz));
  }
});

test("5th-grade dashboard keeps old cards and has the four new ones", () => {
  const html = fs.readFileSync(path.join(ROOT, "fifth-grade/index.html"), "utf8");
  ["../math-mission/", "../stars-galaxies/", "../european-exploration/", "../northeast-states/", "../spanish/",
    "../social-studies-unit1/", "../map-skills/", "../fractions-review/", "../sacraments-quest/", "../matter-lab/",
    "../wild-robot-quest/"].forEach((h) => assert.ok(html.includes('href="' + h + '"'), h));
  ["fractions-review", "sacraments-quest", "matter-lab", "wild-robot-quest"]
    .forEach((id) => assert.ok(html.includes('data-best="' + id + '"'), id));
  assert.ok(html.includes('id="todays-plan"'));
});

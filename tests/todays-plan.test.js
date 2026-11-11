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

// id, start, end, subject, href, pages — the lead may retime later: edit this table only.
const TABLE = [
  ["misfits-213", "12:45", "13:10", "Reading", null, [213, 222]],
  ["misfits-223", "13:20", "13:45", "Reading", null, [223, 232]],
  ["religion", "13:55", "14:20", "Religion", "sacraments-quest/", null],
  ["misfits-233", "14:35", "15:00", "Reading", null, [233, 242]],
  ["misfits-243", "15:10", "15:35", "Reading", null, [243, 252]],
  ["math", "15:50", "16:15", "Math", "fractions-review/", null],
  ["misfits-253", "16:30", "16:55", "Reading", null, [253, 261]],
  ["misfits-262", "17:10", "17:35", "Reading", null, [262, 269]],
  ["wild-robot", "18:00", "18:10", "Reading", "wild-robot-quest/", null],
  ["science-lab", "18:50", "19:00", "Science", "matter-lab/#lesson", null],
  ["science-challenge", "19:00", "19:15", "Science", "matter-lab/#challenge", null]
];

test("plan metadata", () => {
  assert.strictEqual(P.PLAN.id, "2026-11-11");
  assert.strictEqual(P.PLAN.storageKey, "studyquest:plan:2026-11-11:v1");
  assert.strictEqual(P.PLAN.timeZone, "America/New_York");
  assert.strictEqual(P.PLAN.targetFinish, "7:15 PM");
  assert.strictEqual(P.PLAN.deadline, "9:00 PM");
});

test("exactly 11 items with unique ids", () => {
  assert.strictEqual(items.length, 11);
  assert.strictEqual(new Set(items.map((i) => i.id)).size, 11);
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
  assert.strictEqual(P.guideId(items[9]), "matter-lab");
});

test("statusOf / nextItem with done and undo", () => {
  const at = (hm) => Date.parse(t(hm));
  const none = {};
  assert.strictEqual(P.statusOf(items[0], at("12:00"), none), "next");
  assert.strictEqual(P.statusOf(items[1], at("12:00"), none), "upcoming");
  assert.strictEqual(P.statusOf(items[0], at("12:50"), none), "now");
  assert.strictEqual(P.statusOf(items[1], at("12:50"), none), "next");
  assert.strictEqual(P.statusOf(items[0], at("13:15"), none), "later");
  assert.strictEqual(P.nextItem(at("13:15"), none).id, "misfits-213");
  const done = { "misfits-213": 1 };
  assert.strictEqual(P.statusOf(items[0], at("13:15"), done), "done");
  assert.strictEqual(P.nextItem(at("13:15"), done).id, "misfits-223");
  assert.strictEqual(P.statusOf(items[0], at("13:15"), {}), "later"); // undo
  const all = {}; items.forEach((i) => { all[i.id] = 1; });
  assert.strictEqual(P.nextItem(at("20:00"), all), null);
});

test("expiry is clock based", () => {
  assert.strictEqual(P.isExpired(Date.parse("2026-11-12T23:59:59-05:00")), false);
  assert.strictEqual(P.isExpired(Date.parse("2026-11-13T00:00:00-05:00")), true);
  assert.strictEqual(P.isExpired(Date.parse("2027-01-01T00:00:00-05:00")), true);
});

test("formatTime is Eastern even when the process TZ differs", () => {
  assert.strictEqual(P.formatTime(items[0].start), "12:45 PM");
  const code = "const P=require(" + JSON.stringify(path.join(ROOT, "todays-plan/plan-data.js")) + ");process.stdout.write(P.formatTime('2026-11-11T12:45:00-05:00'))";
  for (const tz of [undefined, "Asia/Tokyo", "America/Los_Angeles"]) {
    const env = Object.assign({}, process.env);
    if (tz) env.TZ = tz; else delete env.TZ;
    assert.strictEqual(execFileSync(process.execPath, ["-e", code], { env }).toString(), "12:45 PM", String(tz));
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

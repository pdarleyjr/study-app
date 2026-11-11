/* Every file the new guides load must be in the service worker's PRECACHE list (so they open offline),
   and every PRECACHE entry must exist. Run: node --test tests/*.test.js */
"use strict";
const test = require("node:test");
const assert = require("node:assert");
const fs = require("node:fs");
const path = require("node:path");

const ROOT = path.join(__dirname, "..");
const sw = fs.readFileSync(path.join(ROOT, "sw.js"), "utf8");
const PRECACHE = JSON.parse(sw.match(/var PRECACHE = (\[[\s\S]*?\]);/)[1]);
const NEW_FOLDERS = ["todays-plan", "fractions-review", "sacraments-quest", "matter-lab", "wild-robot-quest"];

function localRefs(htmlFile) {
  const html = fs.readFileSync(path.join(ROOT, htmlFile), "utf8");
  const dir = path.posix.dirname(htmlFile);
  const refs = [...html.matchAll(/(?:src|href)="([^"#?]+)"/g)].map((m) => m[1])
    .filter((u) => !/^(https?:|mailto:|data:)/.test(u) && /\.(js|css|png|jpe?g|svg|webmanifest)$/.test(u));
  return refs.map((u) => path.posix.normalize(path.posix.join(dir, u)));
}

test("every PRECACHE entry exists in the repo", () => {
  for (const p of PRECACHE) {
    const f = p === "" || p.endsWith("/") ? path.join(ROOT, p, "index.html") : path.join(ROOT, p);
    assert.ok(fs.existsSync(f), "missing: " + p);
  }
});

test("new guide pages and every file they load are precached", () => {
  for (const folder of NEW_FOLDERS) {
    assert.ok(PRECACHE.includes(folder + "/"), folder + "/ page not precached");
    for (const ref of localRefs(folder + "/index.html")) assert.ok(PRECACHE.includes(ref), folder + " loads " + ref + " but it is not precached");
  }
  for (const ref of localRefs("fifth-grade/index.html")) assert.ok(PRECACHE.includes(ref), "dashboard loads " + ref + " but it is not precached");
});

test("homework photos are precached for offline checking", () => {
  for (const folder of ["fractions-review/homework", "sacraments-quest/homework"]) {
    for (const f of fs.readdirSync(path.join(ROOT, folder))) assert.ok(PRECACHE.includes(folder + "/" + f), folder + "/" + f);
  }
});

test("cache name was bumped for this release", () => {
  assert.match(sw, /var CACHE = "studyquest-v6";/);
});

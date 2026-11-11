/* The homework answer photos must stay byte-for-byte identical to the originals the family supplied.
   Run: node --test tests/*.test.js */
"use strict";
const test = require("node:test");
const assert = require("node:assert");
const fs = require("node:fs");
const path = require("node:path");
const crypto = require("node:crypto");

const ROOT = path.join(__dirname, "..");
const ORIGINALS = {
  "fractions-review/homework/mixed-numbers-worksheet-p47.png": "e94f09ddd6b0572c9352556f8420bbe68c37c916feb52d92373b840e44bbc055",
  "sacraments-quest/homework/unit1-review-p45.jpg": "d731e080f6576a7f6f0e6be1f5829f1f77ad8b6248a0fac4f0229e21749c166a",
  "sacraments-quest/homework/about-the-sacraments-p46.jpg": "c56df56521cfa7f6484cc229a9d3665ca56a61f2d4f38abbf0505cd36cf3f441",
  "sacraments-quest/homework/sacraments-in-review-p47.png": "75d0096591ecb5c6ab8e32759077174b978c2a409af3c5f5010da8e03f8148ad"
};

for (const [rel, sha] of Object.entries(ORIGINALS)) {
  test("original homework image is unchanged: " + rel, () => {
    const buf = fs.readFileSync(path.join(ROOT, rel));
    assert.strictEqual(crypto.createHash("sha256").update(buf).digest("hex"), sha);
  });
}

test("homework folders hold only the original photos", () => {
  for (const dir of ["fractions-review/homework", "sacraments-quest/homework"]) {
    const files = fs.readdirSync(path.join(ROOT, dir)).sort();
    const expected = Object.keys(ORIGINALS).filter((k) => k.startsWith(dir + "/")).map((k) => k.slice(dir.length + 1)).sort();
    assert.deepStrictEqual(files, expected);
  }
});

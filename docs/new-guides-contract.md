# New 5th-grade guides — build contract (Nov 11, 2026)

Four new study guides plus a one-day plan. Static HTML/CSS/JS only: no framework, no build step, no server,
no new runtime dependency, no external CDN, no analytics, no notification permission.

## Folders and owners (one owner per file — never edit another part's files)

| Part | Owns | Display name |
| --- | --- | --- |
| plan | `todays-plan/**`, `fifth-grade/index.html`, `tests/todays-plan.test.js` | Today's Plan (dashboard section + full-screen page) |
| math-religion | `fractions-review/**`, `sacraments-quest/**`, `tests/fractions-review.test.js`, `tests/sacraments-quest.test.js` | Fractions: Quick Review · Religion Quest: Sacraments |
| science | `matter-lab/**`, `tests/matter-lab.test.js` | Matter Lab: Solids, Liquids & Gases |
| reading | `wild-robot-quest/**`, `tests/wild-robot-quest.test.js` | Wild Robot Quest: The Truth & The Allies |
| lead | `assets/quest-kit.*`, `sw.js`, `README.md`, `index.html`, `tests/source-images.test.js`, `docs/**` | — |

Do **not** edit `assets/app.js`, `sw.js`, `README.md`, `manifest.webmanifest`, `assets/quest-kit.*`, existing games, or
`second-grade/**`. If the kit needs a change, work around it inside your own folder and say so in your summary.

## Page skeleton (top-level 5th-grade folder, so paths use `../`)

```html
<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">
  <meta name="theme-color" content="#18264b">
  <meta name="apple-mobile-web-app-capable" content="yes">
  <meta name="mobile-web-app-capable" content="yes">
  <meta name="apple-mobile-web-app-title" content="Study Quest">
  <link rel="manifest" href="../manifest.webmanifest">
  <link rel="icon" href="../assets/icon.svg" type="image/svg+xml">
  <link rel="apple-touch-icon" href="../assets/apple-touch-icon.png">
  <link rel="stylesheet" href="../assets/quest-kit.css">
  <link rel="stylesheet" href="styles.css">          <!-- optional, module-only styles -->
  <script defer src="../assets/app.js"></script>
  <script defer src="../assets/quest-kit.js"></script>
  <script defer src="data.js"></script>               <!-- content: pure data + pure functions -->
  <script defer src="app.js"></script>                <!-- rendering -->
  <title>… — Study Quest</title>
</head>
<body class="qk qk-math">   <!-- qk-math | qk-religion | qk-science | qk-reading | qk-plan -->
  <a class="qk-skip" href="#main">Skip to the activity</a>
  <main class="qk-wrap" id="main">…</main>
</body>
</html>
```

Every page has a visible "← 5th grade" link back to `../fifth-grade/` and works with JavaScript loading late
(show a friendly "loading" panel with a link home inside `<main>` until the script replaces it).

## Quest Kit (`assets/quest-kit.js`, `assets/quest-kit.css`)

`window.QuestKit` gives: `store(key)` (safe localStorage get/set/update), `h(tag, attrs, ...children)` (DOM builder;
`html:` attr only for trusted author markup), `frac(n,d)` / `mixed(w,n,d)` (stacked fraction HTML),
`runQuiz(container, questions, opts)` (mc / tf / short / match; first-try scoring, one fix-it round for misses,
result saved to `opts.storeKey` under `quiz[opts.quizName]`, and `StudyQuest.record(opts.id, firstTryPct)`),
`imageCard({src, alt, title, caption})` + `openImage(src, alt, title)` (full-screen viewer: pinch/drag/wheel/
buttons/keyboard zoom & pan, Esc closes, focus returns), `phaseBar(phases, currentId, onPick)`, `timer(minutes)`,
`celebrate(msg)`, `announce(msg)`, `shuffle`, `escapeHtml`, `reducedMotion()`.
CSS classes: `qk-wrap qk-top qk-back qk-hero qk-eyebrow qk-panel qk-grid2 qk-grid3 qk-row qk-btn qk-btn-primary
qk-btn-ghost qk-pill qk-callout qk-reveal qk-bar qk-big qk-center qk-footer`. Read the two files before you start.
Module CSS may add to these; keep subject color via the `qk-*` body theme variables.

## Storage contract (namespaced, versioned, separate from everything that exists)

| Key | Owner | Contents |
| --- | --- | --- |
| `studyquest:progress:v1` | existing `assets/app.js` | best/last/plays per game id — write only via `StudyQuest.record` |
| `studyquest:plan:2026-11-11:v1` | plan | `{ done: { <itemId>: <epoch ms> } }` — checklist ticks only, never quiz results |
| `studyquest:fractions-review:v1` | math | `{ phases:{homework,review,quiz}, quiz:{quiz:{best,attempts,last}} }` |
| `studyquest:sacraments-quest:v1` | religion | same shape |
| `studyquest:matter-lab:v1` | science | `{ lesson:{<stationId>:true}, quiz:{challenge:{…}} }` |
| `studyquest:wild-robot-quest:v1` | reading | `{ review:{…}, quiz:{quiz:{…}} }` |

`StudyQuest.record` ids: `fractions-review`, `sacraments-quest`, `matter-lab` (Science Challenge result),
`wild-robot-quest`. Percent = share correct on the FIRST attempt. Fix-it answers never raise it.
Every storage call must tolerate storage being unavailable (QuestKit.store already does).

## Deep links (the plan checklist links to these)

`../fractions-review/`, `../sacraments-quest/`, `../matter-lab/#lesson`, `../matter-lab/#challenge`,
`../wild-robot-quest/`. Matter Lab must open straight to the right part from those hashes.

## Content data must be testable in Node

Put content in `data.js` as pure data/functions with a UMD-style footer:
```js
if (typeof module !== "undefined" && module.exports) module.exports = DATA; else window.FractionsData = DATA;
```
Tests use `node:test` + `node:assert` (no packages): `node --test tests/*.test.js` from the repo root must pass.

## Quality bar

- 11-year-old reader: short sentences, friendly, never punitive ("Not quite — here's the idea"), no guilt.
- Touch targets ≥ 48 px, readable at 320 px wide, iPad portrait/landscape, desktop. No horizontal scroll.
- Keyboard: everything reachable and operable; visible focus; `prefers-reduced-motion` respected;
  meaning never carried by color, sound or animation alone. No audio.
- Interactivity must teach something. No long intros. No unnecessary clicks.
- Original SVG/CSS illustrations only (inline SVG is great). No external images, fonts or scripts.
- Never alter files under `*/homework/` (original homework photos; byte hashes are tested).
- Verify in a real browser before finishing: Chromium for Playwright is cached in `~/.cache/ms-playwright`
  (chromium-1217). Install Playwright only in a temp folder outside the repo (e.g. `cd /tmp/pw && npm i playwright`),
  serve the repo with `python3 -m http.server`, take screenshots at 390×844, 820×1180 and 1280×800, check the
  console for errors, and click through the whole flow. Do not commit screenshots, node_modules or package files.
- Commit with a conventional message (`feat: …`). Report in your summary: files changed, test command + result,
  what you verified in the browser, and the model you are running as.

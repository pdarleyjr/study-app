# Ave María Quest — build contract (Nov 16, 2026)

A 5th grader must recite the **Ave María in Latin** tomorrow (Tue Nov 17, 2026). The teacher's sheet shows the prayer,
"Attempts: 1 2 3" and "TOTAL: ___ / 31" — the prayer has exactly **31 words**, so it is an oral recitation scored one
point per word, with up to three tries. The guide must get him from "barely knows it" to word-perfect tonight, then a
short morning refresh. Static HTML/CSS/JS only, same rules as `docs/new-guides-contract.md` (no framework, build, CDN,
external fonts/images, analytics; Quest Kit available; original inline SVG art only).

Folder `ave-maria/` · URL `https://pdarleyjr.github.io/study-app/ave-maria/` · StudyQuest id `ave-maria` ·
storage key `studyquest:ave-maria:v1`.

## Ownership

| Part | Owns |
| --- | --- |
| lead | `ave-maria/data.js` (content, done — do not edit), `fifth-grade/index.html`, `sw.js`, `tests/offline-precache.test.js`, `README.md`, `docs/**` |
| app | `ave-maria/index.html`, `ave-maria/styles.css`, `ave-maria/app.js`, `ave-maria/games.js`, `ave-maria/speech.js`, `ave-maria/art.js` |
| qa | `tests/ave-maria.test.js` |

`ave-maria/data.js` → `window.AveMariaData` (read it; everything below refers to its exports): `LINES` (8 lines: text,
pron, en, es, hook, part, words), `PARTS` (A–D), `WORDS` (31: token, word, key, line, lineIndex, at, en, pron),
`TEXT`, `PHRASES` (15 short phrases covering all 31 words in order), `MEANINGS` (8 Latin↔English pairs), `SLIPS`
(single-word mistakes with explanations), `TRICKY`, `RANKS`, `PLAN` (8 tonight steps), `MORNING`, `VANISH_LEVELS`,
helpers `norm`, `stripPunct`, `lineById`, `wordsOfLines`, `partWords`, `firstLetters(lineIds?)`, `rng(seed)`,
`vanishMask(level, seed)`, `scoreRecital(missedIdx)`, `slipLine(slip)`, `speechText(text, lang)`.
The displayed prayer must always be the exact `LINES[].text` (accents as on the teacher's sheet).

Script order in `ave-maria/index.html` (all `defer`): `../assets/app.js`, `../assets/quest-kit.js`, `data.js`,
`speech.js`, `art.js`, `games.js`, `app.js`. Styles: `../assets/quest-kit.css`, `styles.css`.
Body: `<body class="qk qk-ave am">`. `games.js` exposes `window.AM_GAMES`; `app.js` is the router/screens.

## Learning design (evidence-based, short-notice memorization)

1. **Meaning first** (elaborative encoding): each line with its English (he knows the Hail Mary in English), Spanish
   cousin words (he studies Spanish), kid pronunciation and a memory hook.
2. **Chunk + cumulative build-up**: four parts (A Greeting, B Blessing, C Request, D Now and Always); learn A, then
   A+B, then A+B+C, then all — practising each new part joined to what came before (backward/forward chaining).
3. **Listen → echo → say**: hear a line (speech), say it back out loud, self-check.
4. **Retrieval practice with fading cues** (vanishing cues): full text → 1/3 hidden → 2/3 hidden → first letters → nothing.
   Peeking is allowed but counts as a hint.
5. **Word-order building** (generation effect): rebuild a line from shuffled word tiles.
6. **Transitions** ("What comes next?") — the usual place recitations break.
7. **Error detection** ("Spot the slip").
8. **Spacing + sleep**: a real 10-minute break in the plan, a bedtime recitation, a 4-minute morning warm-up.
9. **Test-day simulation**: recite the whole prayer aloud from memory; a grown-up (or he, honestly) taps any word that
   was missed or wrong on the hidden-word board → score **/31** with "Attempt 1/2/3" exactly like the sheet; best and
   last saved; `StudyQuest.record("ave-maria", pct)` on each finished attempt.

## Screens (hash routes)

`#blanks` Fill in the blank (added Nov 16: type the missing words or use a word bank; 8, 16 or all 31 blanks,
shaky words first; capitals/accents ignored when checking but the accented spelling is shown; one retry with the
first letter; last game of the plan's Recall step) · `#home` dashboard · `#plan` Tonight's Plan (the 8 PLAN steps as a checklist that launches each activity, ticks
persist, break step shows a countdown and "come back at HH:MM") · `#meet` · `#learn/A`…`#learn/D` · `#vanish` ·
`#build` · `#next` · `#slip` · `#match` · `#test` (test-day practice) · `#bedtime` · `#morning` · `#prayer` (the full
prayer card: Latin / pronunciation / English toggles, listen, print-friendly).

Dashboard: hero "Ave María Quest" + "Learn the Hail Mary in Latin — test Tuesday", one big **Start tonight's plan**
button (resumes), **Morning warm-up**, **Test-day practice /31** (best score shown), a game grid, a "word heat map" of
the 31 words (strong / shaky / not yet — icon + word, never colour alone), points and the Latin rank (`RANKS`).

## Quality bar

Fun and game-like for a 10–11 year old (points, streaks, ranks, satisfying micro-animations, celebratory moments)
but never babyish, never punishing, no long animations or delays; meaning never by colour alone; ≥ 48 px targets;
iPad first (portrait + landscape), phone 320–390 px, desktop; keyboard operable; `prefers-reduced-motion` respected;
works offline after first load; no console errors; storage failures tolerated; never touch other keys.
Speech: `speech.js` → `window.AM_SPEECH` adapted from `spanish-unit2/speech.js`: prefer an `it-*` voice (Church Latin
sounds like Italian) with `AveMariaData.speechText(text, "it")`, else `es-*` with `speechText(text, "es")`; if no voice,
hide 🔊 and rely on the written pronunciation. Rate options normal / slow. No network, no microphone.

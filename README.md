# Study Quest

Interactive study games for a 5th grader and a 2nd grader, hosted on GitHub Pages:
**https://pdarleyjr.github.io/study-app/**

Everything is plain HTML, CSS and JavaScript. There is no build step and no server. Each game lives in its own folder with an `index.html`.

The home page (`index.html`) shows two big grade cards:

- **5th Grade Study Guides** opens `fifth-grade/index.html`, which lists the seven 5th-grade games below. Those games stay at their original URLs (for example `math-mission/`), so old bookmarks and home-screen links still work.
- **2nd Grade Study Guides** opens `second-grade/index.html`, which lists the 2nd-grade games. New 2nd-grade games live under `second-grade/<guide>/`.

| Game | Folder | What it covers |
| --- | --- | --- |
| Math Mission: Prime & Fraction Power-Up | `math-mission/` | Closed-book 5th-grade math review: primes, multiples, LCM, LCD, simplifying and equivalent fractions. One-tap 10-minute Morning Mission, a 5-minute review, three mini-games, and a 15-question Test Ready Challenge. See `docs/math-mission-rationale.md`. |
| Cosmic Quest: Stars & Galaxies | `stars-galaxies/` | Science Unit 3, Lesson 3 plus the Unit 3 Benchmark Review: stars, galaxies, solar system, comets, planets, star charts and orbit diagrams. Four missions, one open-book Chapter Detective, and a 15-question Benchmark Challenge. Has several files (see below). |
| European Exploration Quest | `european-exploration/` | Unit 4 L.4 and Unit 1 L.5: why Europeans sailed, astrolabe/compass/maps, nine explorers, motives, gold and silver, new foods, tobacco. Four short missions plus a final challenge. Has several files (see below). |
| Northeast States & Capitals | `northeast-states/` | Find the 11 states on a map, match capitals, spell every name, memory match, and a final challenge. Earns passport stamps. |
| Padre Nuestro | `spanish/` | The Our Father in Spanish: missing words, next line, meaning match, and a practice test. |
| First Americans & Cultural Regions | `social-studies-unit1/` | Social Studies Unit 1, Lessons 2 and 3. |
| Map Skills Mission | `map-skills/` | Map parts, map types, symbols, scale, grids, and contour lines. |
| Spanish Days of the Week Adventure | `second-grade/spanish-days/` | 2nd grade: the seven days in Spanish (lunes–domingo), order, before/after, listening, parent-checked oral recitation, Monday Morning Quick Review. See `docs/spanish-days-rationale.md`. |

## Works on iPad, phone, and desktop

- Layouts adapt to tablet (portrait and landscape), phone, and desktop screens.
- Buttons and tap targets are large (48 px or more), text is readable without zooming, and the games respect the "reduce motion" setting.
- After the first visit the games open without Wi-Fi (service worker). On an iPad, use Share → Add to Home Screen to get a Study Quest app icon.
- Progress is saved in the browser on that device only. Each grade page shows a best score for each game, and the home page shows how many 5th-grade games have been played.

## Shared files

- `index.html`: the home page with the two grade cards (5th grade and 2nd grade).
- `fifth-grade/index.html`: the list of 5th-grade games, with a best-score badge on each card.
- `second-grade/index.html`: the list of 2nd-grade games, a one-tap Monday Morning Quick Review button, and a "coming soon" row.
- `assets/app.js`: saves best scores (`StudyQuest.record(gameId, percent)`) and registers the service worker.
- `sw.js`: offline support. Bump `CACHE` in this file when you want every device to refresh its saved copy.
- `manifest.webmanifest` and `assets/icon*.png`: home-screen icon and app name.
- `404.html`: friendly "page not found" screen.

## Adding another study guide

1. Create the folder. A 2nd-grade game goes in `second-grade/my-new-guide/`. A 5th-grade game goes in a top-level folder such as `my-new-guide/`, like the existing ones.
2. In the `<head>`, copy the manifest, icon, and `app.js` lines from any game at the same depth. A top-level game uses `../`; a game in `second-grade/` uses `../../` (for example `<script defer src="../../assets/app.js"></script>`).
3. When a round ends, call `if (window.StudyQuest) StudyQuest.record("my-new-guide", percentCorrect);`.
4. Add a card for it on its grade page: `second-grade/index.html` (copy a `.guide` card, set its `href`, and set `data-best="my-new-guide"`) or `fifth-grade/index.html` (copy a `.card`, use an `href` such as `../my-new-guide/`, and add a `data-best` badge). The root `index.html` only has the two grade cards and does not need a new card.
5. Add the folder (and any extra files it loads) to the `PRECACHE` list in `sw.js` so it works offline, for example `"second-grade/my-new-guide/"`. Bump `CACHE` too.

## Spanish Days of the Week files (2nd grade)

- `second-grade/spanish-days/data.js`: the seven days (Monday first, accents, sound-it-out spelling, picture, move) and every question builder (después/antes, translation, listening, missing day, Challenge, Quick Review). Pure functions; `node --test` from the repo root runs `tests/spanish-days.test.js`, which checks spelling, every before/after pair (including domingo → lunes), unique choices, and that the Challenge always covers all seven days.
- `speech.js`: Spanish audio through the browser's own text-to-speech. It picks an `es-*` voice (preferring ones that work offline). If the device has none, the game shows sound-it-out spellings instead. There is no microphone use.
- `store.js`: progress under its own key `studyquest:spanish-days:v1` (first try, used a hint, and fixed after feedback are kept separately for each question). The Challenge's first-try percent goes to `StudyQuest.record("spanish-days", percent)`.
- `ui.js` (shared pieces and the train ordering board), `quiz.js` (question runner: hints, second try, missed items come back 2-3 questions later), `game.js` (screens; `#quick`, `#parent`, `#meet` and so on open a screen directly), `parent.js` (grown-ups page and printable review card), `styles.css`.
- Spoken recitation is checked by a grown-up tapping each card. It is never scored from a microphone.
- Why it is built this way: `docs/spanish-days-rationale.md`.

## European Exploration Quest files

- `european-exploration/data.js`: all the content. Every lesson and question has the handout photo it came from in `src`. To add another worksheet, add lessons, questions, and a mission here.
- `european-exploration/game.js`: the game engine (missions, questions with a hint and second try, matching, sorting, results).
- `european-exploration/art.js`: hand-drawn SVG pictures. `styles.css`: the look.
- Finished rounds call `StudyQuest.record("european-exploration", percent)`. Missed questions and per-mission scores are kept under the separate local key `studyquest:european-exploration:v1`.
- A few handout lines were reworded on purpose: the Americas are "new to Europeans" (not "discovered"), and the Cortés line avoids saying he killed Montezuma II.

## Math Mission files

- `math-mission/gen.js`: question generators for the 15 skills. Every question is built from numbers, then checked (exactly one correct option, no duplicates). Also holds the short worked examples shown after a miss. Pure functions, so it can be tested in Node.
- `math-mission/game.js`: engine (Morning Mission, 5-minute review, mini-games, Test Ready Challenge, practice-my-misses, skill tracking). `styles.css`: the look.
- Skill tracking (`studyquest:math-mission:v1`) keeps first-try success separate from fixed-after-explanation. Results go to `StudyQuest.record("math-mission", percent)` where percent is the share of questions answered correctly on the first try.
- Everything is closed-book. There is no lookup, notes or open-book mode.

## Cosmic Quest files

- `stars-galaxies/data.js`: all content. 15 benchmark objectives (one per Unit 3 Benchmark Review question), each with several question variants (`real` = reworded test question, `fresh` = new example), plus supporting chapter questions, lessons, missions, and the open-book tasks. Every question has a `src` (book page or "extra context").
- `stars-galaxies/game.js`: engine (missions, hint and second try, picture and tap-the-star questions, Benchmark Challenge, practice-my-misses, open-book Chapter Detective). `art-core.js` plus `art-stars.js`, `art-galaxies.js`, `art-system.js`: original SVG pictures. `styles.css`: the look.
- Only the Chapter Detective is open-book. Every other mode works without the textbook.
- The Benchmark Challenge result goes to `StudyQuest.record("stars-galaxies", percent)`. Mission stars, skill mastery and missed questions live under the local key `studyquest:stars-galaxies:v1`.
- The textbook's galaxy percentages (spiral/irregular/elliptical) are the textbook's claims, labelled that way in the game. Solar-system, comet, planet and model questions come from the benchmark itself and are marked as extra context because pages 137-143 do not teach them.

## Map data

The state outlines in `northeast-states/` come from US Census Bureau boundary data (public domain, via the `us-atlas` package). They were projected with an Albers projection and simplified so the whole game stays one small file.

# Study Quest

Interactive study games for a 4th/5th grader, hosted on GitHub Pages:
**https://pdarleyjr.github.io/study-app/**

Everything is plain HTML, CSS and JavaScript. There is no build step and no server. Each game lives in its own folder as a single `index.html`.

| Game | Folder | What it covers |
| --- | --- | --- |
| Northeast States & Capitals | `northeast-states/` | Find the 11 states on a map, match capitals, spell every name, memory match, and a final challenge. Earns passport stamps. |
| Padre Nuestro | `spanish/` | The Our Father in Spanish: missing words, next line, meaning match, and a practice test. |
| First Americans & Cultural Regions | `social-studies-unit1/` | Social Studies Unit 1, Lessons 2 and 3. |
| Map Skills Mission | `map-skills/` | Map parts, map types, symbols, scale, grids, and contour lines. |

## Works on iPad, phone, and desktop

- Layouts adapt to tablet (portrait and landscape), phone, and desktop screens.
- Buttons and tap targets are large (48 px or more), text is readable without zooming, and the games respect the "reduce motion" setting.
- After the first visit the games open without Wi-Fi (service worker). On an iPad, use Share → Add to Home Screen to get a Study Quest app icon.
- Progress is saved in the browser on that device only. The home page shows a best score for each game.

## Shared files

- `index.html`: the home page that links to every game.
- `assets/app.js`: saves best scores (`StudyQuest.record(gameId, percent)`) and registers the service worker.
- `sw.js`: offline support. Bump `CACHE` in this file when you want every device to refresh its saved copy.
- `manifest.webmanifest` and `assets/icon*.png`: home-screen icon and app name.
- `404.html`: friendly "page not found" screen.

## Adding another study guide

1. Create a folder such as `my-new-guide/` with an `index.html`.
2. In the `<head>`, copy the manifest, icon, and `<script defer src="../assets/app.js">` lines from any existing game.
3. When a round ends, call `if (window.StudyQuest) StudyQuest.record("my-new-guide", percentCorrect);`.
4. Add a card for it in the root `index.html` (copy an existing card and add a `data-best="my-new-guide"` badge).
5. Add the folder to the `PRECACHE` list in `sw.js` so it works offline.

## Map data

The state outlines in `northeast-states/` come from US Census Bureau boundary data (public domain, via the `us-atlas` package). They were projected with an Albers projection and simplified so the whole game stays one small file.

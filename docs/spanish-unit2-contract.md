# Spanish Quest: ¿Cómo vivimos? — build contract (Nov 15, 2026)

Study guide for *Descubre el español con Santillana*, Level E, **Unidad 2 ¿Cómo vivimos?** (Cuaderno de práctica
pp. 19–32). Quiz: **Monday Nov 16, 2026**, multiple choice, "Unit 2 (Chapters 1–4)". Static HTML/CSS/JS only (no
framework, build step, server, CDN, package, analytics, external image/font). Read `docs/new-guides-contract.md`,
`assets/quest-kit.js` and `assets/quest-kit.css` first: the page skeleton, quality bar and Quest Kit rules there apply.

Live URL: `https://pdarleyjr.github.io/study-app/spanish-unit2/`. Folder: `spanish-unit2/`.
StudyQuest id: `spanish-unit2`. Storage key: `studyquest:spanish-unit2:v1`.

## 1. Ownership (one owner per file; never edit another part's files)

| Part | Owns | Global name |
| --- | --- | --- |
| A content | `spanish-unit2/data.js` | `window.SpanishUnit2Data` / `module.exports` |
| B design | `spanish-unit2/index.html`, `spanish-unit2/styles.css`, `spanish-unit2/art.js`, `spanish-unit2/ui.js` | `window.SU_ART` (+ `module.exports`), `window.SU_UI` |
| C engine | `spanish-unit2/engine.js`, `spanish-unit2/app.js`, `spanish-unit2/activities.js`, `spanish-unit2/speech.js` | `window.SU_ENGINE` (+ `module.exports`), `window.SU_SPEECH`, `window.SU_ACT` |
| D QA | `tests/spanish-unit2.test.js` | — |
| lead | `fifth-grade/index.html`, `sw.js`, `tests/offline-precache.test.js`, `README.md`, `docs/**` | — |

Nobody but the lead edits `assets/**`, `sw.js`, `fifth-grade/**`, `second-grade/**`, other guides or other tests.

Script order in `spanish-unit2/index.html` (all `defer`):
`../assets/app.js`, `../assets/quest-kit.js`, `data.js`, `art.js`, `ui.js`, `speech.js`, `engine.js`,
`activities.js`, `app.js`. Stylesheets: `../assets/quest-kit.css`, `styles.css`. Body: `<body class="qk qk-spanish su">`
(`qk-spanish` theme variables are defined in `styles.css`, not in the kit). `data.js`, `art.js` and `engine.js` must
load in Node with `require()` (no DOM access at load time; UMD footer as in the guides contract).

## 2. Verified curriculum (source: school-hosted copy of the Cuaderno de práctica, pp. 19–32)

| Pages | Week | Content verified in the workbook |
| --- | --- | --- |
| 19 | S1 El lugar donde vivimos | word search: pequeño, dormitorios, grande, derecha, casa, izquierda, hogar, comedor, sala, cocina, baño |
| 20 | S1 | A: Aníbal vive en un apartamento; es pequeño; dos dormitorios; la cocina es muy grande; dormitorio a la izquierda del baño. B: map — a la derecha / a la izquierda / enfrente / detrás (panadería, parque, farmacia, tienda, hotel, hospital) |
| 21 | S1 | A: map clues — lejos de, a la derecha de, cerca de, a la izquierda de, detrás de. B: ¿A dónde vas? medicinas→farmacia, tren→estación de ferrocarril, pan→panadería, jugar fútbol→parque, comida→mercado |
| 22 | S2 La ropa y los colores | unscramble: camisa, amarilla, pantalón, anaranjada, camiseta, negro, marrón; "Tengo un pantalón largo blanco"; camiseta verde, blusa azul, falda roja, pantalón corto marrón |
| 23 | S2 | A: r vs rr (rojo, ferrocarril, carro, caro, marrón, gorra, precio…). C: tiendas, guaraníes (Paraguay), precios baratos, precios caros, dólares (Estados Unidos) |
| 24 | S2 | prices: camiseta negra 50, pantalón corto amarillo 100, blusa roja 1.000, falda verde 500, pantalón largo azul 1.000 guaraníes; cognates: comercial, farmacia, medicina |
| 25 | S3 Las actividades en la casa y el vecindario | crossword: lavar, trapeador, agua, escoba, jabón, aspiradora, piso, alfombra ("Por último, Aníbal limpia la alfombra con una aspiradora") |
| 26 | S3 | ropa elegante (traje y corbata, vestido rosado) vs ropa informal (pantalón corto, camiseta sucia, blusa limpia). Commands: ¡Limpia tu dormitorio! ¡Lava tu ropa! ¡Seca el piso! ¡Cuida tu ropa nueva! |
| 27 | S3 | letter: Estimada Sra. Sonia … Atentamente, Sr. Óscar; ropa informal; comprar ropa en el mercado; ropa elegante para el teatro. B: limpiar el piso (escoba, agua, trapeador), lavar la ropa (agua, jabón), limpiar la alfombra (aspiradora), teatro (ropa elegante, ropa limpia) |
| 28 | S4 La comunidad | map: teatro cerca/lejos del hotel; farmacia a la derecha/izquierda del centro comercial; mercado vs teatro; estación de ferrocarril cerca/lejos del mercado |
| 29 | S4 | ESTAR: Nosotros estamos (centro comercial), Tú estás (tienda, vendedora), Él está (panadería, panadero), Yo estoy (farmacia, farmacéutico), Ellos están (mercado), Ella está (lejos de la farmacia). B: fix the place: blusas y pantalones→tienda de ropa; medicinas→farmacia; comida y ropa→centro comercial; llegar en tren→estación de ferrocarril; pan→panadería |
| 30 | S4 | La vendedora vende ropa en la tienda; el panadero vende pan en la panadería; el escritor escribe libros en su apartamento; la farmacéutica vende medicinas en la farmacia; el vendedor vende comida en el mercado. B: Laura… la farmacia; llegan en tren… la estación de ferrocarril; pan… la panadería; comida y ropa… la tienda; ropa elegante… el teatro |
| 31–32 | Repaso | 8 MC review items: apartamento pequeño; ropa→tienda; camisa y falda; $50 = cincuenta dólares; lavar la ropa = agua y jabón; ropa elegante = traje y corbata; Yo estoy; la farmacéutica vende medicinas en la farmacia |

Rules: write **original** questions that test these objectives. Never copy a workbook item word-for-word as a
question (short phrases like "la farmacia" are fine). Never present the workbook review as the teacher's quiz.
Supplemental items (beyond the pages, e.g. `usted`/`ustedes`/`nosotras`, extra colors) get `source.kind: "extension"`.

## 3. Data contract — `spanish-unit2/data.js` (Part A)

`SpanishUnit2Data` exports at least:

```js
META   = { title: "Spanish Quest: ¿Cómo vivimos?", subtitle: "Unit 2 Grammar Adventure",
           book: "Descubre el español con Santillana E", unit: "Unidad 2 ¿Cómo vivimos?", pages: "19–32",
           quizDate: "2026-11-16" }
WEEKS  = [{ week: 1, title: "El lugar donde vivimos", en: "The place where we live", pages: [19,20,21], skills: [...] }, …4]
SKILLS = [{ id, week, area, label, labelEs }]           // exactly the 12 ids below
AREAS  = [{ id, label, skills: [...], examCount }]       // exactly the 5 areas below
EXAM   = { total: 24 }
TOPICS = [{ id, label, text, skills: [...] }]            // Quick Practice menu, 6 topics below
```

Skills (id → week, area):

| id | week | area | covers |
| --- | --- | --- | --- |
| `s1-house` | 1 | neighborhood | casa, hogar, apartamento, sala, comedor, cocina, dormitorio, baño, grande, pequeño/pequeña |
| `s1-places` | 1 | neighborhood | hotel, farmacia, panadería, hospital, parque, tienda, mercado, centro comercial, teatro, estación de ferrocarril, vecindario; need → place |
| `s1-directions` | 1 | neighborhood | a la derecha de, a la izquierda de, enfrente de, detrás de, cerca de, lejos de (on the map) |
| `s2-clothes` | 2 | clothing | camisa, camiseta, blusa, falda, pantalón, pantalón corto, pantalón largo, vestido, traje, corbata, ropa |
| `s2-colors` | 2 | clothing | rojo/a, amarillo/a, negro/a, blanco/a, azul, verde, marrón, anaranjado/a, rosado/a + noun–adjective agreement |
| `s2-shopping` | 2 | community | dinero, precio(s), moneda, comprar, vender, caro/a, barato/a, dólares, guaraníes, cincuenta, cien, quinientos, mil |
| `s3-cleaning` | 3 | household | limpiar, lavar, secar, cuidar, agua, jabón, escoba, trapeador, aspiradora, alfombra, piso |
| `s3-commands` | 3 | household | ¡Limpia…! ¡Lava…! ¡Seca…! ¡Cuida…! in context (recognition only) |
| `s3-clothes-desc` | 3 | household | ropa elegante / informal / limpia / sucia; letter: Estimado/Estimada …, Atentamente |
| `s4-estar` | 4 | estar | yo estoy, tú estás, él/ella/usted está, nosotros/nosotras estamos, ellos/ellas/ustedes están (accents matter) |
| `s4-workers` | 4 | community | vendedor/vendedora, panadero, farmacéutico/farmacéutica, escritor ↔ what they sell/do ↔ where |
| `s4-community` | 4 | community | people + needs + places + estar together ("Laura compra medicinas. Ella está en la farmacia.") |

Areas (exam blueprint; study priorities, not a claim about the teacher's test):

| id | label | skills | examCount |
| --- | --- | --- | --- |
| `estar` | ESTAR (to be) | s4-estar | 7 |
| `neighborhood` | Neighborhood & directions | s1-house, s1-places, s1-directions | 5 |
| `clothing` | Clothing & colors | s2-clothes, s2-colors | 5 |
| `household` | Cleaning & household | s3-cleaning, s3-commands, s3-clothes-desc | 4 |
| `community` | Community, workers & shopping | s4-workers, s4-community, s2-shopping | 3 |

Topics (Quick Practice): `neighborhood` (s1-*), `clothing` (s2-clothes, s2-colors, s2-shopping), `household` (s3-*),
`community` (s4-workers, s4-community), `estar` (s4-estar), `mixed` (all 12).

### 3.1 Reference data

```js
ESTAR = [ { key: "yo", pronouns: "yo", form: "estoy", en: "I am" },
          { key: "tu", pronouns: "tú", form: "estás", en: "you are (a friend)" },
          { key: "el", pronouns: "él / ella / usted", form: "está", en: "he / she is, you are (polite)" },
          { key: "nosotros", pronouns: "nosotros / nosotras", form: "estamos", en: "we are" },
          { key: "ellos", pronouns: "ellos / ellas / ustedes", form: "están", en: "they are, you all are" } ]
ESTAR_FORMS = ["estoy", "estás", "está", "estamos", "están"]
SUBJECTS = [ { id, es, form, key, en } ]   // pronouns yo, tu, el, ella, usted, nosotros, nosotras, ellos, ellas, ustedes
                                           // plus names/groups: e.g. { id:"ana", es:"Ana", form:"está", key:"el" },
                                           // { id:"mi-familia-y-yo", es:"Mi familia y yo", form:"estamos", key:"nosotros" }, …
COLORS   = [ { id, m, f, en, hex, changes } ]  // ids: rojo amarillo negro blanco azul verde marron anaranjado rosado
                                               // marron: m "marrón", f "marrón", changes false; azul/verde changes false
CLOTHING = [ { id, es, article, gender, en } ] // ids: camisa camiseta blusa falda pantalon pantalon-corto pantalon-largo vestido traje corbata
PLACES   = [ { id, es, article, en, need, needEn, worker? } ]
           // ids: hotel farmacia panaderia hospital parque tienda mercado centro-comercial teatro estacion apartamento casa
           // es is the bare noun ("farmacia", "estación de ferrocarril", "centro comercial")
WORKERS  = [ { id, es, article, en, verb, thing, place } ]
           // ids: vendedora (vende ropa, tienda) panadero (vende pan, panaderia) escritor (escribe libros, apartamento)
           //      farmaceutica + farmaceutico (vende medicinas, farmacia) vendedor (vende comida, mercado)
VOCAB    = [ { es, en, week, skill, art } ]    // every word in the skills table, for the Study Sheet
```

Helpers (pure): `withArticle(placeId)` → "la farmacia"; `dePlace(placeId)` → "de la farmacia" / "del mercado";
`enPlace(placeId)` → "en la farmacia" / "en el mercado"; `colorFor(colorId, gender)` → "roja"/"rojo"/"azul".

### 3.2 The neighborhood map (fixed; everything about directions is derived from it)

```js
MAP = { cols: 5, rows: 3, street: "Calle Principal",
        note: "Left and right mean your left and right as you look at the map. For left and right, look only in the same row (the same side of the street).",
        places: [
          { id: "apartamento", col: 1, row: 0 }, { id: "casa", col: 3, row: 0 },
          { id: "hotel", col: 0, row: 1 }, { id: "farmacia", col: 1, row: 1 }, { id: "panaderia", col: 2, row: 1 },
          { id: "tienda", col: 3, row: 1 }, { id: "hospital", col: 4, row: 1 },
          { id: "estacion", col: 0, row: 2 }, { id: "mercado", col: 1, row: 2 }, { id: "parque", col: 2, row: 2 },
          { id: "teatro", col: 3, row: 2 }, { id: "centro-comercial", col: 4, row: 2 } ] }
```

Row 0 is the back row (behind row 1). The street runs left–right between rows 1 and 2, so row 1 and row 2 face each
other across it. Exported pure functions:

- `distance(a, b)` = `Math.hypot(colA - colB, rowA - rowB)` (row units: 0→1 = 1, 1→2 = 1 across the street).
- `satisfies(rel, a, b)` — is place `a` `rel` of place `b`? `rel` ∈ `izquierda` (same row, a.col < b.col),
  `derecha` (same row, a.col > b.col), `enfrente` (same col, rows {1,2}), `detras` (a.row 0, b.row 1, same col),
  `cerca` (distance ≤ 1.5), `lejos` (distance ≥ 3). Pairs between 1.5 and 3 are neither (never ask them).
- `relPhrase(rel)` → "a la izquierda", "a la derecha", "enfrente", "detrás", "cerca", "lejos".

### 3.3 Questions

```js
QUESTIONS = [{
  id: "s4-estar-001",          // unique, /^s[1-4]-[a-z-]+-\d{3}$/, prefix = skill id
  week: 4, skill: "s4-estar",  // skill.week === week
  family: "estar-nosotros",    // concept family: ≥2 items per family where possible (used for "same idea, new wording")
  type: "mc",                  // "mc" (4 text/picture choices) or "tap" (tap a building on the map)
  difficulty: 1,               // 1 easy, 2 medium, 3 harder
  exam: true,                  // eligible for Test Ready / diagnostic / warm-up (all "mc" items can be; never "tap")
  prompt: "Nosotros compramos ropa. Nosotros ___ en la tienda.",  // plain text, "___" = blank. Spanish first.
  promptEn: "We buy clothes. We ___ at the store.",               // optional English help
  art: { kind: "place", id: "tienda" },                           // optional visual, see §4.1
  choices: ["estamos", "están", "estoy", "estás"],                 // mc: exactly 4 unique strings
  choiceArt: [ …4 art specs… ],                                    // optional: picture choices (aligned with choices)
  answer: 0,                   // index into choices (author order; the engine shuffles at run time)
  hint: "Nosotros means we.",  // never gives the answer away
  explain: "We use <b>estamos</b> with <b>nosotros</b> (we).",   // after answering; may use <b> <i> <br> only
  geo: { … },                  // direction items only, see below
  source: { kind: "workbook", pages: [29] }                       // or { kind: "extension", note: "…" }
}]
```

Direction items (`skill: "s1-directions"`, and any item that depends on the map) carry `geo` and show the map
(`art: { kind: "map", highlight: [...] }`):

- relation word: `geo: { ask: "rel", a: "hotel", b: "farmacia", rels: ["izquierda","derecha","enfrente","detras"] }`
  — `rels` aligned with `choices`; **exactly one** rel satisfies `(a, b)`, at `answer`.
- which place: `geo: { ask: "place", rel: "izquierda", ref: "farmacia", places: ["hotel","hospital","teatro","casa"] }`
  — exactly one listed place satisfies, at `answer`. For `cerca` asks every wrong place must be `lejos`, and for
  `lejos` asks every wrong place must be `cerca`.
- tap: `type: "tap"`, `geo: { ask: "tap", rel: "izquierda", ref: "farmacia" }`, `target: "hotel"`, no `choices`;
  `target` must be the **only** place on the whole map that satisfies the relation. `exam: false`.

Minimums (Part D tests these): ≥ 100 questions total; ≥ 24 `s4-estar` (all five forms, each ≥ 4 times as the answer,
mixing pronouns, names and groups like "Mi familia y yo"); every skill ≥ 5 items and ≥ 3 with `exam: true` and
`difficulty ≤ 2`; ≥ 6 `tap` items; every area has ≥ 2 × examCount exam items; families never mix skills.
Picture choices must differ in a way a child can see (shape, not only a subtle shade) and every picture choice has a
caption-free English `alt` from art. Distractors are plausible mistakes (wrong form, wrong gender, wrong place).

Generators (pure, deterministic):
- `makeEstarQuestion(subjectId, placeId)` → a question object like above with `id: "gen-estar-<subject>-<place>"`,
  `skill: "s4-estar"`, `family: "estar-<key>"`, `type: "mc"`, `exam: false`, `prompt: "<Subject> ___ <enPlace>."`,
  4 choices from `ESTAR_FORMS` (correct + 3 wrong, chosen deterministically), explanation naming the pronoun rule.
- `byId(id)` (bank + `gen-estar-*`), `bySkill(skillId)`.

### 3.4 Missions and lessons

```js
MISSIONS = [{
  id: "m1", week: 1, title: "Neighborhood Explorer", titleEs: "Explorador del vecindario",
  skills: ["s1-house","s1-places","s1-directions"],
  learn: [ { title, html, art: [spec, …], say: "la farmacia" } ],   // 4–6 short teaching cards (html: <b><i><br><ul><li> only)
  practice: [qid, …],                                                 // 6–8 bank items for this mission
  activity: { type: "map", explore: true, tasks: [qid, …] }           // see per-mission types below
}, …]
```

- m1 Neighborhood Explorer — `activity.type: "map"`: `explore: true` (tap buildings to learn names) + 6 tasks
  (mix of `tap` and map-based `mc`).
- m2 Clothing & Colors Challenge — `activity.type: "closet"`: 8 tasks: picture identification, color + agreement,
  "pick the outfit that matches the description", prices (`money` art).
- m3 Clean-Up Crew — `activity.type: "cleanup"`: 6–8 tasks with `scene` art: which tool, which action, which command,
  which clothes (elegante/informal/limpia/sucia).
- m4 Community & ESTAR Lab — `activity.type: "estar-lab"`: `rounds: [{ place: "panaderia", subjects: ["el","nosotros","yo","ellos","tu"] }, { place: "mercado", subjects: [...] }, { place: "farmacia", subjects: [...] }]`
  (the engine turns each subject+place into `makeEstarQuestion`) + `tasks: [qid…]` of s4-workers / s4-community.

## 4. Art contract — `spanish-unit2/art.js` (Part B)

`SU_ART.render(spec, opts?)` → an SVG **string** (no DOM needed, works in Node). Original vector art only.
Every SVG has `role="img"` and an English `aria-label` that never contains the Spanish answer word (for example
"a room with a stove and a sink", not "cocina"). `opts.decorative: true` → `aria-hidden="true"` instead.
`opts.size` (px, optional) sets width/height attributes; otherwise the SVG scales to its container (viewBox only).
Unknown specs return a neutral placeholder SVG (never throw).

### 4.1 Art specs (Part A uses only these ids)

| kind | fields | ids |
| --- | --- | --- |
| `place` | `id` | hotel farmacia panaderia hospital parque tienda mercado centro-comercial teatro estacion apartamento casa |
| `clothing` | `item`, `color`, `state?` | items: camisa camiseta blusa falda pantalon pantalon-corto pantalon-largo vestido traje corbata; colors: rojo amarillo negro blanco azul verde marron anaranjado rosado; state: sucia limpia |
| `outfit` | `items: [{ item, color, state? }]` | up to 3 garments side by side |
| `tool` | `id` | escoba trapeador aspiradora jabon agua |
| `thing` | `id` | alfombra piso pan medicinas libros comida ropa tren dinero moneda balon |
| `scene` | `id` | piso-sucio piso-mojado ropa-sucia alfombra-sucia dormitorio-sucio ropa-nueva teatro-noche parque-futbol |
| `person` | `id` | yo tu el ella usted nosotros nosotras ellos ellas ustedes (clear pointing/group cues; `yo` = child pointing at self, `tu` = pointing at the viewer) |
| `worker` | `id` | vendedor vendedora panadero farmaceutico farmaceutica escritor |
| `room` | `id` | sala comedor cocina dormitorio bano |
| `home` | `id` | casa-grande casa-pequena apartamento-grande apartamento-pequeno |
| `money` | `amount`, `currency` | amount 5 50 100 500 1000; currency `USD` ("$50") or `PYG` ("₲ 500") |
| `map` | `highlight?: [ids]`, `markers?: [{ place, person }]`, `labels?: bool` | draws `MAP` (pass `DATA.MAP`/`DATA.PLACES` via `SU_ART.map`) |

`SU_ART.map(MAP, PLACES, opts)` → SVG string of the neighborhood: viewBox `0 0 1000 700`, the five columns left→right,
row 0 at the top (back row), row 1 below it, a street band labelled `Calle Principal` across the middle, row 2 below
the street, so "enfrente" is straight across the street and "detrás" is straight up. Each building is
`<g class="su-bldg" data-place="<id>">` with an icon that is recognizable without its label; Spanish name label under
it when `opts.labels !== false` (with article: "la farmacia"). `opts.highlight` rings those buildings;
`opts.markers` draw a small `person` figure on a building; `opts.interactive` adds `role="button" tabindex="0"
aria-label="<Spanish name> (<English>)"` and a transparent hit rect at least 150×120 viewBox units to every building.
`SU_ART.render({ kind: "map", … })` must also work once `SU_ART.setMap(MAP, PLACES)` was called (data loads first).
Also export `SU_ART.hero()` (decorative hero illustration) and `SU_ART.icon(name)` for dashboard cards
(`mission`, `practice`, `test`, `warmup`, `sheet`, `progress`).

## 5. UI component contract — `spanish-unit2/ui.js` (Part B)

`window.SU_UI` builds DOM with `QuestKit.h`. Every function returns real elements styled by `styles.css` (class
prefix `su-`). Touch targets ≥ 48 px, keyboard operable, visible focus, works at 320 px wide, reduced-motion safe,
meaning never by color alone (always an icon + words such as "✓ Correct" / "✗ Your pick").

1. `screenHead({ eyebrow, title, text, onBack, backLabel = "← Spanish Quest home" })` → `<header>` for a screen.
2. `actionCard({ tone: "mission"|"practice"|"test"|"warmup"|"sheet"|"progress", icon, title, text, meta: [str], cta, badge, onClick })` → one big `<button>` card (icon is an SVG string).
3. `masteryChip(level)` → pill: `new` "○ Not started", `learning` "◐ Learning", `almost` "◕ Almost", `mastered` "★ Mastered".
4. `tile({ title, text, artSvg, level, onClick })` → topic tile button with a mastery chip.
5. `questionCard(opts)` → controller. `opts = { label, progress (0..1), promptHtml, promptEn, enMode: "show"|"toggle"|"hide",
   visualSvg, visualEl, layout: "text"|"picture", choices: [{ text, html, artSvg, caption }], hint, onChoose(i),
   onHintRequest, onSpeak, onEnToggle }`. The `___` in prompts is rendered as a visible blank. Returns
   `{ el, lock(), unlock(), disable(i), mark(i, "right"|"wrong"|"answer"|"selected"|null), feedback({ tone: "right"|"retry"|"wrong"|"info", title, html }),
   clearFeedback(), next(label, onClick), showHint(), focusPrompt() }`. `visualEl` lets the caller place a live element (e.g. a mapBoard) in the visual slot.
6. `mapBoard({ map, places, labels = true, highlight = [], markers = [], interactive = false, onPick(placeId) })` →
   `{ el, mark(placeId, "right"|"wrong"|"answer"|"selected"|null), clear(), setInteractive(bool) }` (uses `SU_ART.map`;
   click + Enter/Space call `onPick`; marked buildings also get an aria-label suffix).
7. `learnCard({ step, title, html, artSvgs: [str], say, onSay })` → teaching card (🔊 button only when `onSay`).
8. `estarChart({ rows, highlight, onSay })` → a real `<table>` of the five ESTAR rows; `highlight` = row key.
9. `vocabGrid({ title, items: [{ es, en, artSvg, onSay }] })` → Study Sheet section.
10. `results({ title, pct, firstTry, total, corrected, areas: [{ label, right, total }], note, actions: [{ label, primary, onClick }], missed: [{ promptHtml, answerHtml, explainHtml }] })`.
11. `masteryPanel({ rows: [{ label, week, level, score, onPractice }] })`.
12. `notice({ tone: "info"|"good"|"warn", html })`.
13. `celebrateSmall(text)` → restrained inline success badge (no blocking animation; QuestKit.celebrate is for finishes).

`index.html`: page skeleton from the guides contract, `← 5th grade` link to `../fifth-grade/`, hero with
`SU_ART.hero()`-style inline SVG, title "Spanish Quest: ¿Cómo vivimos?", subtitle "Unit 2 Grammar Adventure", eyebrow
"5th grade Spanish · Quiz Monday Nov 16", `<div id="app">` with a loading panel (links `#mission`, `#test`, `#warmup`
work even before scripts run), footer naming the book and pages. `styles.css` defines `body.qk-spanish` theme
variables (suggested accent `#c2410c`/shelf `#7c2d12`, hero `#7c2d12`→`#c2410c`, soft `#ffedd5`).

## 6. Engine contract — `spanish-unit2/engine.js` (Part C, pure, Node-testable)

`SU_ENGINE` exports (never mutate inputs; always return new objects):

```js
createRng(seed) -> () => number in [0, 1)                 // mulberry32
newProgress() -> { v: 1, items: {}, skills: {}, log: [] }
recordAnswer(progress, ev) -> newProgress
  // ev = { qid, skill, mode: "diag"|"learn"|"activity"|"practice"|"exam"|"warmup"|"fix",
  //        firstCorrect: bool, hintUsed: bool, correctedAfter: bool, at: number }
  // items[qid]   = { seen, firstRight, firstWrong, hints, corrected, last: "right"|"hint"|"wrong", at }
  // skills[id]   = { n, right, hinted, wrong, corrected, recent: [last 6 scores] }  score 1 = first try no hint,
  //                0.5 = first try with hint, 0 = wrong first (even if corrected after feedback)
  // log keeps the last 300 events
skillMastery(progress, skillId) -> { level, score, n }
  // n 0 → "new"; recent.length ≥ 3, last 3 all 1 and score ≥ 0.8 → "mastered"; score ≥ 0.6 → "almost"; else "learning"
weakestSkills(progress, DATA, count) -> [skillId]     // learning (low score first), new, almost, mastered; ties: area examCount desc
buildDiagnostic(DATA, rng) -> [qid] (12: one per skill, exam & difficulty ≤ 2, no two adjacent of the same area)
buildExam(DATA, rng) -> [qid] (DATA.EXAM.total): per area examCount; every skill of an area at least once when
  examCount ≥ its skill count; only exam items; no family twice (an ESTAR pronoun family may appear twice, since there
  are 5 pronoun families for 7 ESTAR slots); all 4 weeks present; different seeds give different sets
buildPractice(DATA, progress, { skills, count = 10, rng }) -> [qid] (weighted to weaker skills, interleaved:
  no two consecutive items of the same skill when avoidable, fewer-seen items first; "tap" items allowed)
buildFix(DATA, progress, rng, max = 12) -> [qid]      // for items whose last is "wrong" or "hint": first a sibling of
  // the same family (different id, different wording), else the same skill; the original item later in the list
buildWarmup(DATA, progress, rng) -> [qid] (10: 3 s4-estar, 2 s1-directions, 2 s2-colors, 3 from weakest skills;
  exam items, difficulty ≤ 2, no duplicates; nothing new)
estarRound(DATA, round) -> [question objects] via DATA.makeEstarQuestion
shuffleChoices(question, rng) -> { choices, choiceArt, answer, order }
scoreRun(answers, DATA) -> { total, firstTry, pct, corrected, hinted, byArea: { id: { right, total } },
  bySkill: { id: { right, total } }, missed: [qid] }   // firstTry counts firstCorrect && !hintUsed only
```

## 7. App behaviour — `app.js` + `activities.js` (Part C)

Hash routes (all deep-linkable, back button works): `#home` (default), `#mission` (Tonight's Study Mission),
`#mission/m1`…`#mission/m4`, `#practice` (topic picker), `#practice/<topicId>`, `#test`, `#warmup`, `#fix`,
`#progress`, `#sheet` (Unit 2 Study Sheet: vocabulary by week with pictures + ESTAR chart + direction words).

- **Dashboard**: four big action cards (Start Tonight's Study Mission / Quick Practice / Practice Test / Tomorrow
  Morning 7-Minute Warm-Up) + Study Sheet + My Progress. A "Continue" card when a mission is half done. The warm-up
  card is always available (it never expires).
- **Tonight's Study Mission** (≈30–40 min): phase bar (QuestKit.phaseBar) 1 Find Your Weak Spots (buildDiagnostic, one
  try each, short feedback, no fix-it) → 2 Four Missions (each: learn cards → practice with a second chance → the
  activity → mission recap; recommend weakest mission first but allow any order) → 3 Test Ready Challenge → 4 Fix My
  Mistakes (buildFix). Progress persists; reopening resumes at the current phase.
- **Practice / mission questions**: wrong first try → feedback "Not quite — try once more" + the hint, other choices
  stay enabled except the wrong one; second try right → "Fixed it!" (`correctedAfter`), still wrong → show answer +
  explanation. Right first try → short explanation. "Hint" button (counts as `hintUsed`). English help: `show` in
  missions/practice/fix, `toggle` (counts as hint) in diagnostic/warm-up, `hide` in the test. Missed items return 2–3
  questions later in a different wording (family sibling) within practice sets.
- **Test Ready Challenge**: buildExam (24), one answer per question, no correctness shown until the end (a "Next"
  after each pick, ability to change the pick before Next), then results by area, review of every miss with the
  explanation, buttons "Practice my misses" (→ `#fix`) and "New test". Calls
  `StudyQuest.record("spanish-unit2", firstTryPct)` once per finished test.
- **Warm-up**: buildWarmup, ≈7 min, ESTAR chart peek counts as a hint, ends with a 3-line "remember" card.
- Map activity: mapBoard with `interactive`; explore step requires tapping 5 buildings (or "Skip"); tap tasks mark
  the picked building right/wrong and show the target. ESTAR Lab: person + place art, subject changes each step,
  explanation after each, estarChart visible for round 1, behind a "Peek at the chart" button (hint) later.
- Storage `studyquest:spanish-unit2:v1` via `QuestKit.store`: `{ v: 1, progress, tonight: { phase, diagDone,
  missions: { m1: { learn, practice, activity, firstPct } … } }, exams: [ { at, pct, firstTry, total, byArea } ], warmups: [ … ] }`.
  Tolerate missing/corrupt storage. Never touch other keys.
- `speech.js`: optional Spanish text-to-speech copied in spirit from `second-grade/spanish-days/speech.js` (es-* voice,
  no network, no microphone); `SU_SPEECH.say(text)`, `canSpeak()`. If no Spanish voice, hide 🔊 buttons. Never blocks.
- No timers that block, no punishment animations, no `alert()`, no console errors.

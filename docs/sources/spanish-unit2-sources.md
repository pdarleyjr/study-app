# Spanish Quest: ¿Cómo vivimos? — sources and decisions

Developer notes for `spanish-unit2/`. No workbook pages, scans or illustrations are stored in this repository;
every question, teaching card and picture in the guide is original.

## What the student is studying

- **Textbook:** *Descubre el español con Santillana*, Level E (Santillana USA), **Unidad 2 ¿Cómo vivimos?**
- **Workbook:** Cuaderno de práctica, pp. 19–32.
- **Teacher announcement (Google Classroom, Nov 2, 2026):** "Second quarter grammar quiz, Monday 11/16/26, multiple
  choice. Please study Unit 2 (Chapters 1, 2, 3, and 4). Study guide will not be provided. Bring your charged iPad."
- **Family photos** (not committed) showed workbook pp. 20, 21, 22, 24, 25, 27, 31 and 32.

## How the content was verified

A school-hosted PDF of the same workbook unit was found and its text extracted (pdftotext) on Nov 15, 2026:
`https://www.somersetacademyprep.com/ourpages/auto/2025/8/15/43116469/CdeP4gu%20%282%29.pdf`.
Its wording, page numbers, section titles and review items match the family's photos, and it fills the pages the photos
did not include — especially **Semana 4, pp. 28–30**. The page-by-page summary used to build the guide is in
`docs/spanish-unit2-contract.md` §2.

| Pages | Workbook section | Guide mission / skills |
| --- | --- | --- |
| 19–21 | Semana 1 El lugar donde vivimos | Mission 1 Neighborhood Explorer: `s1-house`, `s1-places`, `s1-directions` |
| 22–24 | Semana 2 La ropa y los colores | Mission 2 Clothing & Colors: `s2-clothes`, `s2-colors`, `s2-shopping` |
| 25–27 | Semana 3 Las actividades en la casa y el vecindario | Mission 3 Clean-Up Crew: `s3-cleaning`, `s3-commands`, `s3-clothes-desc` |
| 28–30 | Semana 4 La comunidad | Mission 4 Community & ESTAR Lab: `s4-estar`, `s4-workers`, `s4-community` |
| 31–32 | Repaso (8 multiple-choice items) | Test Ready Challenge objectives (new wordings, never the workbook items) |

Publisher references (scope only, no login used):
- VHL Central support, "Check out the Descubre el español con Santillana materials":
  https://support.vhlcentral.com/hc/en-us/articles/360013151593
- Santillana Level E correlation chart: https://promos.santillanausa.com/PDF/Correlations/DES/SC-Correlation-Chart_DES_Level-E.pdf

## Decisions and known uncertainties

- The teacher says "Chapters 1–4"; the workbook organizes Unit 2 into four weekly lessons (Semanas 1–4). The guide
  treats the four weeks as the four chapters. The real quiz questions and their distribution are **unknown**.
- The Test Ready Challenge blueprint (ESTAR 7, neighborhood 5, clothing 5, household 4, community/shopping 3 of 24) is a
  study priority, not a claim about the teacher's test. The quiz is called a *grammar* quiz, so ESTAR (Semana 4) and
  noun–adjective agreement get extra weight.
- Supplemental items beyond the pages (for example `usted`, `ustedes`, `nosotras` in the ESTAR chart) are marked
  `source.kind: "extension"` in `spanish-unit2/data.js`. Workbook-based items carry `source.pages`.
- The neighborhood map is an original layout. All direction answers are computed from its fixed grid
  (`satisfies()` in `data.js`) and checked by `tests/spanish-unit2.test.js`; "left/right" mean the reader's left and
  right as they look at the map.
- Page 23's r/rr sound exercise is not assessed (low priority for a multiple-choice grammar quiz).

## Learning-science basis

Retrieval before answers, short corrective feedback, a second chance during practice (fixes never raise the
first-try score), missed ideas coming back later in a different wording, increasingly mixed topics, and a short
next-morning review:
- IES practice guide, *Organizing Instruction and Study to Improve Student Learning*: https://ies.ed.gov/ncee/wwc/PracticeGuide/1
- Retrieval practice with feedback in fifth grade: https://pmc.ncbi.nlm.nih.gov/articles/PMC12372469/
- Spacing and interleaving review: https://www.nature.com/articles/s44159-022-00089-1
- Classroom meta-analysis: https://link.springer.com/article/10.1007/s10648-026-10225-5

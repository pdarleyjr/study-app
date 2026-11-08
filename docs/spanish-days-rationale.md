# Spanish Days (Los días de la semana): Implementation Rationale (internal)

Scope: 2nd-grade (age 7) practice for a Spanish assessment on Monday, Nov 9, 2026: the seven days in Monday-first order (lunes, martes, miércoles, jueves, viernes, sábado, domingo; cyclic, so domingo is followed by lunes), plus "¿Qué día viene después / antes del ...?" questions. The child never sees citations. Source checks were done 2026-11-08; "not verified" means the full text could not be opened and the claim rests on the abstract or metadata only.

**How to read this:** the "Evidence" column reports only what the cited study or guide actually tested. Nothing below studied Spanish day names, 2nd graders learning Spanish, or this app. Every link from evidence to game feature is an inference, and the "Label" column says how far that inference reaches.

## Principles, evidence, and where they live in the game

| # | Principle | Evidence (what was actually found) | Game interaction | Label |
|---|-----------|------------------------------------|------------------|-------|
| 1 | Retrieval practice (answering from memory) beats re-exposure | Karpicke, Blunt & Smith 2016 (Front Psychol 7:350, 10.3389/fpsyg.2016.00350): 3 experiments, **4th graders** (mean age 10.0, one Indianapolis school, N = 40, 40, 42). Word lists (24 English words with category cues), retrieval vs repeated study, no feedback, final test after "a brief delay". Retrieval won in all three (free recall d = 0.48 and 0.56, recognition d = 0.64); the effect did not depend on reading comprehension or processing speed. Ophuis-Cox, Catrysse & Camp 2023 (Appl Cogn Psychol 37(6):1463-1469, 10.1002/acp.4141): 48 **2nd graders**, real classroom, within-subjects; flashcard retrieval beat restudy for **multiplication-fact** fluency at 5 minutes and 1 week. IES guide (Pashler et al. 2007) Rec. 5b, "use quizzes to re-expose students to key content": evidence **Strong**. | What Comes Next, Time Traveler, Missing Day, Listen & Find and the Challenge are all answer-first: the child commits to an answer before any help. | Directly studied with children, but on English word lists (grade 4) and multiplication facts (grade 2). **Not Spanish evidence.** Transfer to day names is reasonable but untested |
| 2 | Recite from memory, not read-along | In Ophuis-Cox 2023 the restudy condition the children lost to was **chanting the facts aloud** (per the abstract); retrieval with flashcards won. This does not test reciting day names. | Say It Like a Champion should be done with the word list hidden (child recites, parent listens). If the words are on screen while reciting, it is closer to the restudy condition. | Inference from a math study; design choice |
| 3 | Pictures and gestures paired with spoken foreign-language words | Andrä et al. 2020 (Educ Psychol Rev 32:815-850, 10.1007/s10648-020-09527-z, open access): 3 experiments, German **8-year-olds** (analysed N = 54, 43, 51; one "movement school" in Leipzig) learning **English** nouns (40 or 24, concrete and abstract), trained over **5 consecutive days**, within-subjects. Self-performed iconic gestures and pictures each beat non-enriched learning on recall and translation at 3 days, 2 months and 6 months; gestures did **not** beat pictures (contrary to the authors' adult-based hypothesis). Authors note low absolute scores, especially for abstract words. Tellier 2008 (Gesture 8(2):219-235, 10.1075/gest.8.2.06tel): 20 French children, mean age 5;5, 8 English words; children who reproduced gestures did better than a picture group at **producing** the words. Abstract only. | Meet the Days: each day has a picture and a gesture/clap the child can copy while hearing the word. | Directly studied with young children on L2 vocabulary (English, not Spanish; longer training). **Caveat:** those gestures and pictures depicted the word's meaning. Day names have no picturable meaning, so our pictures/gestures are arbitrary memory hooks, which the studies did not test. The two studies also disagree on gesture vs picture |
| 4 | Combine visuals with words | IES guide Rec. 3, "combine graphics with verbal descriptions": evidence **Moderate** (not specific to young children or languages). | Days Train shows the week as a visible ordered train; the cyclic wrap (domingo to lunes) is drawn, not just stated. | Practice guide, general; reasonable transfer |
| 5 | Spacing across days | Lotfolahi & Salehi 2017 (Cogent Educ 4:1287391, 10.1080/2331186X.2017.1287391; full PDF read): **28** Iranian EFL learners, **grades 2-5, ages 7-11** (mean 9.17), one language institute, 20 English-Farsi word pairs, within-subjects, peer testing with corrective feedback. Spaced study (same words restudied one week later) beat massed on recall at 1 week (64% vs 45%) and 5 weeks (51% vs 29%). Authors flag the small sample and limited time span. IES guide Rec. 1 ("space learning over time"): **Moderate**, reviewing after "several weeks to several months". | The app cannot create real spacing before Monday. The best available is tonight's session plus a short Monday-morning review (an overnight gap, roughly 12 hours). | Studied with children aged 7-11 on L2 words, but with a **1-week** gap. An overnight gap is **not** what was tested; no claim that it delivers the spacing effect |
| 6 | Retest a miss a few items later | Retrieval-after-feedback is supported in general by #1. No source tested a 2-3 item delay. | A missed item returns about 2-3 items later in the same session. | **Same-session retest, NOT spaced practice.** Design choice, no guarantee |
| 7 | Fade scaffolds toward the real test format | No verified source for this specific sequence. The test is Spanish-only, so practice ends Spanish-only. | Bilingual prompts early, Spanish-only later; Days Train goes hinted to unhinted; Missing Day goes multiple choice to harder. | Design choice, no guarantee |
| 8 | Mixed, one-attempt assessment | Retrieval support from #1; the format itself is untested. | Spanish Days Challenge: 12 Spanish-only items (English to Spanish, Spanish to English, después, antes, missing day, then put the week in order last), plus a parent-checked recitation. One scored attempt per item; the full week list is never shown during the test. After a miss the correct answer is shown at once and the child taps it, but only the first try counts toward the score. | Design choice, no guarantee |
| 9 | Morning warm-up | Ophuis-Cox 2023 found retrieval benefits at 5 minutes and 1 week, but did not test a pre-test morning review. | Monday Morning Quick Review: sequence warm-up, about 6 antes/después items weighted toward past misses, one oral recitation. | Design choice, no guarantee |
| 10 | Honest measurement | Measurement design, not a research finding. | Tracking keeps first-try correct, corrected-after-feedback and hint-used separate. Parent view shows per-day and antes/después accuracy, weakest days, and whether the oral recitation was parent-verified. | Design choice |
| 11 | Oral production checked by a person | No source. A multiple-choice score cannot show the child can **say** the days, which is why recitation is parent-verified rather than inferred from taps. Tellier 2008 (#3) separates recognizing from producing words, which supports treating them as different skills. | Say It Like a Champion: child recites all 7 aloud; parent taps a check or cross per day. No microphone or speech recognition. | Design choice; the comprehension/production split is consistent with #3 |

## What we deliberately did NOT do / do not claim

- No guarantee of a test score or grade. All cited results are group averages from other languages (English, Farsi), other content (multiplication facts, word lists) or other ages.
- Activity lengths (about 3-8 minutes each) and the 10-15 minute evening total are design choices for a 7-year-old's attention, not established optima.
- The 2-3 item retest is a same-session retest. It is not spaced repetition, and tonight-plus-Monday-morning is not the 1-week spacing that was studied.
- A multiple-choice or tap score does not prove pronunciation or oral mastery. That is why oral recitation is a separate, parent-verified item.
- Audio uses the browser's built-in text-to-speech (es-* voice). Voice quality, accent and availability vary by device and browser; it is not authentic native-speaker audio and may mispronounce or sound robotic. If no Spanish voice exists on the device, the parent's own voice (or the teacher's materials) is the better model. Slow playback is a design choice, not a tested aid.
- No microphone, no speech recognition, no accounts. Progress stays on the device (local storage); no data leaves it.
- Pictures and gestures for day names are mnemonic hooks we chose. The gesture/picture studies used meaning-based (iconic) gestures and pictures, which day names do not have.
- "Ready" means practiced, not proven mastered. No unverified citations are shown to the child.

## Suggested use before Monday (practical suggestion, not a research claim)

Tonight (Sunday), about 10-15 minutes total, then stop while it is still fun:
1. Meet the Days (hear each day, copy the gesture).
2. Days Train (hinted, then unhinted if it goes well).
3. What Comes Next and Time Traveler (después / antes), a few rounds each.
4. Casually, closer to bedtime, have the child say the days aloud once from memory (in the car, while brushing teeth). No pressure, no score.
5. A normal bedtime. Do not trade sleep for extra practice.

Monday morning, about 3-5 minutes: Monday Morning Quick Review (warm-up, about 6 antes/después items, one oral recitation). If time is tight, just the oral recitation is fine.

## Source verification log

Opened directly:
- Karpicke, Blunt & Smith 2016: full text on frontiersin.org (sample, design, effect sizes, limitations).
- Andrä et al. 2020: Springer article page (open access); abstract and article metadata read; sample sizes, ages, word counts, conditions and test points taken from the article page.
- Lotfolahi & Salehi 2017: full PDF from tandfonline.com (the HTML page returned 403 to one fetcher; the PDF opened).
- IES practice guide (Pashler et al. 2007, NCER 2007-2004): WWC landing page with the recommendation list and evidence ratings. The full PDF was not re-read for this document.

Abstract or metadata only (not full text):
- Ophuis-Cox, Catrysse & Camp 2023: Crossref abstract. Sample (48 second graders), conditions (flashcard retrieval vs chanting aloud) and test points come from the abstract; effect sizes and limitations not verified.
- Tellier 2008: Crossref abstract only; statistics and procedure details not verified.

Not used: no source on browser text-to-speech quality, scaffold fading, or morning-of review was verified, so those features are labelled design choices.

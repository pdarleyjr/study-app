/* Ave María Quest — content (pure data + pure helpers, loads in Node with require()).
   The prayer text matches the teacher's test sheet exactly (accents included): 31 words, scored out of 31.
   window.AveMariaData in the browser, module.exports in Node. */
(function (root) {
  "use strict";

  var META = {
    title: "Ave María Quest",
    subtitle: "Learn the Hail Mary in Latin",
    testDate: "2026-11-17",
    totalWords: 31,
    sheetNote: "The test sheet has 3 attempts and a score out of 31 (one point per word)."
  };

  /* The 8 lines as printed on the test sheet ("et benedíctus fructus ventris / tui, Iesus." is one line that wraps on the sheet). */
  var LINES = [
    { id: "l1", part: "A", text: "Ave María, grátia plena,",
      pron: "AH-vay mah-REE-ah, GRAH-tsee-ah PLEH-nah,",
      en: "Hail Mary, full of grace,",
      es: "Dios te salve, María, llena eres de gracia,",
      hook: "<b>Ave</b> is a happy “hello!”. <b>Grátia</b> sounds like <i>gracias</i> and means <b>grace</b>. <b>Plena</b> means <b>full</b> (think <i>plenty</i>)." },
    { id: "l2", part: "A", text: "Dóminus tecum.",
      pron: "DOH-mee-noos TEH-koom.",
      en: "the Lord is with thee.",
      es: "el Señor es contigo.",
      hook: "<b>Dóminus</b> = the Lord (like <i>Domingo</i>, the Lord’s day). <b>Tecum</b> = <b>te</b> (you) + <b>cum</b> (with): with you. One word, like <i>contigo</i>." },
    { id: "l3", part: "B", text: "Benedicta tu in muliéribus,",
      pron: "beh-neh-DEEK-tah too een moo-lee-EH-ree-boos,",
      en: "Blessed art thou among women,",
      es: "Bendita tú eres entre todas las mujeres,",
      hook: "<b>Bene</b> = good, <b>dicta</b> = said: <b>blessed</b>. It ends in <b>-a</b> because it is about Mary. <b>Muliéribus</b> (5 claps: mu-li-É-ri-bus) sounds like <i>mujeres</i> = <b>women</b>." },
    { id: "l4", part: "B", text: "et benedíctus fructus ventris tui, Iesus.",
      pron: "et beh-neh-DEEK-toos FROOK-toos VEN-trees TOO-ee, YEH-soos.",
      en: "and blessed is the fruit of thy womb, Jesus.",
      es: "y bendito es el fruto de tu vientre, Jesús.",
      hook: "<b>Benedíctus</b> (with <b>-us</b>) is the same word again, now for the fruit. <b>Fructus</b> = fruit, <b>ventris</b> = womb (<i>vientre</i>), <b>tui</b> = your. <b>Iesus</b> = Jesus, said “YEH-soos”." },
    { id: "l5", part: "C", text: "Sancta María, Mater Dei,",
      pron: "SAHNK-tah mah-REE-ah, MAH-tehr DEH-ee,",
      en: "Holy Mary, Mother of God,",
      es: "Santa María, Madre de Dios,",
      hook: "<b>Sancta</b> = holy (<i>Santa</i>). <b>Mater</b> = mother (<i>maternal</i>, <i>madre</i>). <b>Dei</b> = of God (<i>Dios</i>, <i>deity</i>). The second half starts with María again." },
    { id: "l6", part: "C", text: "ora pro nobis peccatoribus",
      pron: "OH-rah proh NOH-bees pek-kah-TOH-ree-boos",
      en: "pray for us sinners,",
      es: "ruega por nosotros, pecadores,",
      hook: "<b>Ora</b> = pray (<i>orar</i>). <b>Pro</b> = for. <b>Nobis</b> = us (<i>nosotros</i>). <b>Peccatoribus</b> (5 claps: pec-ca-TÓ-ri-bus) = sinners (<i>pecadores</i>)." },
    { id: "l7", part: "D", text: "nunc et in hora mortis nostrae.",
      pron: "noonk et een OH-rah MOR-tees NOS-treh.",
      en: "now and at the hour of our death.",
      es: "ahora y en la hora de nuestra muerte.",
      hook: "<b>Nunc</b> = now. <b>Hora</b> = hour (the h is silent: “OH-rah”). <b>Mortis</b> = of death (<i>mortal</i>, <i>muerte</i>). <b>Nostrae</b> = our (<i>nuestra</i>)." },
    { id: "l8", part: "D", text: "Amen.",
      pron: "AH-men.",
      en: "Amen.",
      es: "Amén.",
      hook: "<b>Amen</b> means “so be it”. Don’t forget it: it is word number 31!" }
  ];

  /* The four parts used for learning (cumulative build-up: A, A+B, A+B+C, all). */
  var PARTS = [
    { id: "A", title: "The Greeting", lines: ["l1", "l2"], picture: "angel" },
    { id: "B", title: "The Blessing", lines: ["l3", "l4"], picture: "fruit" },
    { id: "C", title: "The Request", lines: ["l5", "l6"], picture: "hands" },
    { id: "D", title: "Now and Always", lines: ["l7", "l8"], picture: "candle" }
  ];

  /* Meaning of each word (English gloss) and kid pronunciation, in prayer order. */
  var GLOSS = [
    ["Hail", "AH-vay"], ["Mary", "mah-REE-ah"], ["grace", "GRAH-tsee-ah"], ["full", "PLEH-nah"],
    ["the Lord", "DOH-mee-noos"], ["with you", "TEH-koom"],
    ["blessed", "beh-neh-DEEK-tah"], ["you", "too"], ["among", "een"], ["women", "moo-lee-EH-ree-boos"],
    ["and", "et"], ["blessed", "beh-neh-DEEK-toos"], ["fruit", "FROOK-toos"], ["of the womb", "VEN-trees"], ["your", "TOO-ee"], ["Jesus", "YEH-soos"],
    ["Holy", "SAHNK-tah"], ["Mary", "mah-REE-ah"], ["Mother", "MAH-tehr"], ["of God", "DEH-ee"],
    ["pray", "OH-rah"], ["for", "proh"], ["us", "NOH-bees"], ["sinners", "pek-kah-TOH-ree-boos"],
    ["now", "noonk"], ["and", "et"], ["at", "een"], ["the hour", "OH-rah"], ["of death", "MOR-tees"], ["our", "NOS-treh"],
    ["Amen", "AH-men"]
  ];

  /* Short phrases (2–4 words) for "What comes next?" — they cover all 31 words in order. */
  var PHRASES = [
    "Ave María,", "grátia plena,", "Dóminus tecum.", "Benedicta tu", "in muliéribus,", "et benedíctus",
    "fructus ventris tui,", "Iesus.", "Sancta María,", "Mater Dei,", "ora pro nobis", "peccatoribus",
    "nunc et in hora", "mortis nostrae.", "Amen."
  ];

  /* Latin ↔ English meaning pairs for the matching game. */
  var MEANINGS = [
    ["Ave María", "Hail Mary"],
    ["grátia plena", "full of grace"],
    ["Dóminus tecum", "the Lord is with you"],
    ["Benedicta tu in muliéribus", "blessed are you among women"],
    ["fructus ventris tui", "the fruit of your womb"],
    ["Sancta María, Mater Dei", "Holy Mary, Mother of God"],
    ["ora pro nobis peccatoribus", "pray for us sinners"],
    ["nunc et in hora mortis nostrae", "now and at the hour of our death"]
  ];

  /* "Spot the slip": exactly one word in the line is replaced by a plausible mistake.
     line = line id, at = word position inside the line (0-based), wrong = the mistaken word (no punctuation). */
  var SLIPS = [
    { line: "l1", at: 0, wrong: "Sancta", why: "The prayer begins with <b>Ave</b> (hello). <b>Sancta María</b> starts the second half." },
    { line: "l1", at: 3, wrong: "sancta", why: "It is <b>grátia plena</b>: full of grace." },
    { line: "l2", at: 1, wrong: "nobis", why: "<b>Dóminus tecum</b>: the Lord is with <b>you</b>. <i>Nobis</i> means us." },
    { line: "l2", at: 0, wrong: "Dei", why: "<b>Dóminus</b> = the Lord. <i>Dei</i> belongs in <b>Mater Dei</b>." },
    { line: "l3", at: 0, wrong: "Benedíctus", why: "Mary is <b>Benedicta</b> (with -a). <i>Benedíctus</i> comes next, for the fruit." },
    { line: "l3", at: 3, wrong: "peccatoribus", why: "<b>in muliéribus</b> = among women. <i>Peccatoribus</i> (sinners) comes later." },
    { line: "l4", at: 1, wrong: "benedicta", why: "The fruit is <b>benedíctus</b> (with -us)." },
    { line: "l4", at: 4, wrong: "nostrae", why: "<b>ventris tui</b> = of <b>your</b> womb. <i>Nostrae</i> is at the very end." },
    { line: "l4", at: 2, wrong: "mortis", why: "<b>fructus</b> = fruit. <i>Mortis</i> belongs in <b>hora mortis</b>." },
    { line: "l5", at: 3, wrong: "Dóminus", why: "<b>Mater Dei</b> = Mother of God." },
    { line: "l5", at: 0, wrong: "Ave", why: "The second half starts with <b>Sancta María</b>." },
    { line: "l6", at: 2, wrong: "tecum", why: "<b>ora pro nobis</b> = pray for <b>us</b>." },
    { line: "l6", at: 1, wrong: "et", why: "<b>ora pro nobis</b>: pray <b>for</b> us." },
    { line: "l7", at: 5, wrong: "tui", why: "<b>mortis nostrae</b> = of <b>our</b> death." },
    { line: "l7", at: 1, wrong: "pro", why: "<b>nunc et in hora</b> = now <b>and</b> at the hour." },
    { line: "l7", at: 4, wrong: "fructus", why: "<b>hora mortis</b> = the hour of death." }
  ];

  /* The tricky spots most kids trip on (shown in "Tricky spots" and used to pick extra practice). */
  var TRICKY = [
    { words: [5], title: "tecum is one word", text: "Say it as one word: <b>TEH-koom</b> (with you)." },
    { words: [6, 11], title: "Benedicta, then benedíctus", text: "First <b>Benedicta</b> (-a, for Mary), then <b>benedíctus</b> (-us, for the fruit)." },
    { words: [9], title: "muliéribus = 5 claps", text: "Clap it: <b>mu · li · É · ri · bus</b>." },
    { words: [23], title: "peccatoribus = 5 claps", text: "Clap it: <b>pec · ca · TÓ · ri · bus</b>." },
    { words: [3, 4], title: "plena → Dóminus", text: "After <b>grátia plena</b> comes <b>Dóminus tecum</b>." },
    { words: [15, 16], title: "Iesus → Sancta", text: "After <b>Iesus</b> the second half starts: <b>Sancta María</b>." },
    { words: [23, 24], title: "peccatoribus → nunc", text: "After <b>peccatoribus</b> comes <b>nunc et in hora</b>." },
    { words: [27], title: "silent h in hora", text: "<b>hora</b> is said <b>OH-rah</b>." },
    { words: [30], title: "Amen counts!", text: "<b>Amen</b> is word 31. Always finish with it." }
  ];

  /* Latin rank titles for points (fun, not a grade). */
  var RANKS = [
    { min: 0, title: "Discipulus", en: "Student" },
    { min: 250, title: "Lector", en: "Reader" },
    { min: 700, title: "Cantor", en: "Singer" },
    { min: 1300, title: "Custos", en: "Guardian" },
    { min: 2000, title: "Magister", en: "Master" }
  ];

  /* Tonight's plan (spaced, with a real break) and tomorrow morning. */
  var PLAN = [
    { id: "meet", title: "Meet the prayer", minutes: 4, text: "What it means, how to say it." },
    { id: "learnAB", title: "Learn parts 1 & 2", minutes: 8, text: "Listen, echo, build it with word tiles." },
    { id: "learnCD", title: "Learn parts 3 & 4", minutes: 8, text: "Same steps, then join all four parts." },
    { id: "vanish", title: "Disappearing words + Lantern catch", minutes: 8, text: "Words vanish until you can say it from memory, then catch every word in order." },
    { id: "break", title: "Brain break", minutes: 10, text: "Step away for 10 minutes. The break helps memory." },
    { id: "recall", title: "Recall challenge", minutes: 7, text: "What comes next?, Spot the slip, then Fill in the blank." },
    { id: "test", title: "Test-day practice", minutes: 3, text: "Say it all. Scored out of 31, like the real sheet." },
    { id: "bedtime", title: "Bedtime lock-in", minutes: 2, text: "Say it once right before sleep. Sleep locks it in." }
  ];
  var MORNING = { id: "morning", title: "Morning warm-up", minutes: 4, text: "First letters, then the whole prayer, then one test-day try." };

  /* ---------- derived word list ---------- */
  function stripPunct(w) { return String(w).replace(/[.,;:!?¡¿«»“”"]/g, ""); }
  function norm(w) { return stripPunct(w).normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase(); }
  var WORDS = [];
  LINES.forEach(function (l, li) {
    l.text.split(" ").forEach(function (tok, wi) {
      var i = WORDS.length;
      WORDS.push({ i: i, token: tok, word: stripPunct(tok), key: norm(tok), line: l.id, lineIndex: li, at: wi,
        en: GLOSS[i] ? GLOSS[i][0] : "", pron: GLOSS[i] ? GLOSS[i][1] : "" });
    });
    l.words = l.text.split(" ").map(stripPunct);
  });
  var TEXT = LINES.map(function (l) { return l.text; }).join(" ");

  function lineById(id) { for (var i = 0; i < LINES.length; i++) { if (LINES[i].id === id) return LINES[i]; } return null; }
  function wordsOfLines(ids) { return WORDS.filter(function (w) { return ids.indexOf(w.line) >= 0; }); }
  function partWords(partId) { var p = PARTS.filter(function (x) { return x.id === partId; })[0]; return p ? wordsOfLines(p.lines) : []; }
  function firstLetters(ids) {
    return (ids || LINES.map(function (l) { return l.id; })).map(function (id) {
      var l = lineById(id);
      return l.text.split(" ").map(function (tok) { return tok.charAt(0) + tok.replace(/^[^\s]/, "").replace(/[^.,;:!?]/g, ""); }).join(" ");
    });
  }

  /* deterministic random numbers (mulberry32) */
  function rng(seed) {
    var a = seed >>> 0;
    return function () { a = (a + 0x6D2B79F5) >>> 0; var t = a; t = Math.imul(t ^ (t >>> 15), t | 1); t ^= t + Math.imul(t ^ (t >>> 7), t | 61); return ((t ^ (t >>> 14)) >>> 0) / 4294967296; };
  }

  /* Disappearing words: level 0 = all shown, 1 = about 1/3 hidden, 2 = about 2/3 hidden,
     3 = every word hidden but its first letter shown, 4 = nothing shown.
     Returns { hidden: [31 booleans], cue: "none" | "letter" }. Same level + seed => same mask. */
  var VANISH_LEVELS = [
    { level: 0, title: "Read it", frac: 0, cue: "none" },
    { level: 1, title: "A few words vanish", frac: 1 / 3, cue: "none" },
    { level: 2, title: "Most words vanish", frac: 2 / 3, cue: "none" },
    { level: 3, title: "First letters only", frac: 1, cue: "letter" },
    { level: 4, title: "From memory", frac: 1, cue: "none" }
  ];
  function vanishMask(level, seed) {
    var L = VANISH_LEVELS[Math.max(0, Math.min(4, level | 0))];
    var n = WORDS.length, count = Math.round(L.frac * n), hidden = WORDS.map(function () { return false; });
    if (count >= n) { hidden = WORDS.map(function () { return true; }); }
    else if (count > 0) {
      var r = rng((seed | 0) * 31 + L.level * 7 + 1), order = WORDS.map(function (w) { return w.i; });
      for (var i = order.length - 1; i > 0; i--) { var j = Math.floor(r() * (i + 1)); var t = order[i]; order[i] = order[j]; order[j] = t; }
      order.slice(0, count).forEach(function (k) { hidden[k] = true; });
    }
    return { level: L.level, title: L.title, hidden: hidden, cue: L.cue };
  }

  /* Test-day score: one point per word, like the teacher's sheet. missed = array of word indexes (0–30). */
  function scoreRecital(missed) {
    var set = {};
    (missed || []).forEach(function (i) { if (i >= 0 && i < WORDS.length) set[i] = true; });
    var wrong = Object.keys(set).length, score = WORDS.length - wrong;
    return { score: score, total: WORDS.length, pct: Math.round(score / WORDS.length * 100), missed: Object.keys(set).map(Number).sort(function (a, b) { return a - b; }) };
  }

  /* Build a line with one slipped word. Returns { tokens: [...], at, wrong, right, why }. */
  function slipLine(slip) {
    var l = lineById(slip.line), toks = l.text.split(" ");
    var orig = toks[slip.at], punct = orig.replace(/^[^.,;:!?]*/, "");
    var out = toks.slice(); out[slip.at] = slip.wrong + punct;
    return { lineId: l.id, tokens: out, at: slip.at, wrong: slip.wrong, right: stripPunct(orig), why: slip.why };
  }

  /* Text for the browser's speech voice. Ecclesiastical Latin sounds close to Italian, so an Italian voice gets a
     respelled text (grazia = GRAH-tsee-ah, ora = hora with a silent h, nostre = nostrae). A Spanish voice is the
     fallback. Nothing leaves the device. */
  var IT_RESPELL = { "grátia": "gràzia", "Dóminus": "Dòminus", "muliéribus": "mulièribus", "benedíctus": "benedìctus",
    "Benedicta": "Benedìcta", "peccatoribus": "peccatòribus", "hora": "ora", "nostrae": "nostre", "María": "Marìa", "Iesus": "Iesus" };
  var ES_RESPELL = { "grátia": "grátsia", "tecum": "técum", "hora": "ora", "nostrae": "nostre", "Iesus": "Iésus", "peccatoribus": "peccatóribus", "Amen": "Amén" };
  function speechText(text, lang) {
    var map = /^it/i.test(lang || "") ? IT_RESPELL : /^es/i.test(lang || "") ? ES_RESPELL : null;
    if (!map) return text;
    return String(text).split(" ").map(function (tok) {
      var bare = stripPunct(tok), p = tok.slice(bare.length);
      return (map[bare] || bare) + p;
    }).join(" ");
  }

  var DATA = {
    META: META, LINES: LINES, PARTS: PARTS, WORDS: WORDS, TEXT: TEXT, GLOSS: GLOSS, PHRASES: PHRASES, MEANINGS: MEANINGS,
    SLIPS: SLIPS, TRICKY: TRICKY, RANKS: RANKS, PLAN: PLAN, MORNING: MORNING, VANISH_LEVELS: VANISH_LEVELS,
    norm: norm, stripPunct: stripPunct, lineById: lineById, wordsOfLines: wordsOfLines, partWords: partWords,
    firstLetters: firstLetters, rng: rng, vanishMask: vanishMask, scoreRecital: scoreRecital, slipLine: slipLine, speechText: speechText
  };
  if (typeof module !== "undefined" && module.exports) module.exports = DATA; else root.AveMariaData = DATA;
})(typeof window !== "undefined" ? window : this);

/* Spanish Quest: ¿Cómo vivimos? content. Pure data + pure functions (testable in Node). No DOM here.
   Book: Descubre el español con Santillana E, Unidad 2 (Cuaderno de práctica pp. 19-32).
   All questions are original; they test the same objectives as the workbook pages. */
(function (root) {
  "use strict";

  var META = {
    title: "Spanish Quest: ¿Cómo vivimos?", subtitle: "Unit 2 Grammar Adventure",
    book: "Descubre el español con Santillana E", unit: "Unidad 2 ¿Cómo vivimos?", pages: "19–32",
    quizDate: "2026-11-16"
  };

  var WEEKS = [
    { week: 1, title: "El lugar donde vivimos", en: "The place where we live", pages: [19, 20, 21], skills: ["s1-house", "s1-places", "s1-directions"] },
    { week: 2, title: "La ropa y los colores", en: "Clothes and colors", pages: [22, 23, 24], skills: ["s2-clothes", "s2-colors", "s2-shopping"] },
    { week: 3, title: "Las actividades en la casa y el vecindario", en: "Activities at home and in the neighborhood", pages: [25, 26, 27], skills: ["s3-cleaning", "s3-commands", "s3-clothes-desc"] },
    { week: 4, title: "La comunidad", en: "The community", pages: [28, 29, 30], skills: ["s4-estar", "s4-workers", "s4-community"] }
  ];

  var SKILLS = [
    { id: "s1-house", week: 1, area: "neighborhood", label: "Rooms and the size of a home", labelEs: "La casa y los cuartos" },
    { id: "s1-places", week: 1, area: "neighborhood", label: "Places in the neighborhood", labelEs: "Los lugares del vecindario" },
    { id: "s1-directions", week: 1, area: "neighborhood", label: "Directions on the map", labelEs: "Izquierda, derecha, cerca y lejos" },
    { id: "s2-clothes", week: 2, area: "clothing", label: "Clothing words", labelEs: "La ropa" },
    { id: "s2-colors", week: 2, area: "clothing", label: "Colors and agreement", labelEs: "Los colores" },
    { id: "s2-shopping", week: 2, area: "community", label: "Money, prices and big numbers", labelEs: "El dinero y los precios" },
    { id: "s3-cleaning", week: 3, area: "household", label: "Cleaning tools and actions", labelEs: "Limpiar y lavar" },
    { id: "s3-commands", week: 3, area: "household", label: "Commands at home", labelEs: "¡Limpia! ¡Lava! ¡Seca! ¡Cuida!" },
    { id: "s3-clothes-desc", week: 3, area: "household", label: "Elegant, casual, clean, dirty; letters", labelEs: "Ropa elegante e informal" },
    { id: "s4-estar", week: 4, area: "estar", label: "ESTAR (to be)", labelEs: "El verbo estar" },
    { id: "s4-workers", week: 4, area: "community", label: "Workers and what they do", labelEs: "Los trabajadores" },
    { id: "s4-community", week: 4, area: "community", label: "People, needs, places and estar", labelEs: "La comunidad" }
  ];

  var AREAS = [
    { id: "estar", label: "ESTAR (to be)", skills: ["s4-estar"], examCount: 7 },
    { id: "neighborhood", label: "Neighborhood & directions", skills: ["s1-house", "s1-places", "s1-directions"], examCount: 5 },
    { id: "clothing", label: "Clothing & colors", skills: ["s2-clothes", "s2-colors"], examCount: 5 },
    { id: "household", label: "Cleaning & household", skills: ["s3-cleaning", "s3-commands", "s3-clothes-desc"], examCount: 4 },
    { id: "community", label: "Community, workers & shopping", skills: ["s4-workers", "s4-community", "s2-shopping"], examCount: 3 }
  ];

  var EXAM = { total: 24 };

  var ALL_SKILL_IDS = SKILLS.map(function (s) { return s.id; });
  var TOPICS = [
    { id: "neighborhood", label: "Neighborhood", text: "Rooms, places and directions on the map", skills: ["s1-house", "s1-places", "s1-directions"] },
    { id: "clothing", label: "Clothes & colors", text: "Clothing words, colors, prices and money", skills: ["s2-clothes", "s2-colors", "s2-shopping"] },
    { id: "household", label: "Cleaning & home", text: "Tools, actions, commands, elegant or casual", skills: ["s3-cleaning", "s3-commands", "s3-clothes-desc"] },
    { id: "community", label: "Community", text: "Workers, needs and places", skills: ["s4-workers", "s4-community"] },
    { id: "estar", label: "ESTAR", text: "estoy, estás, está, estamos, están", skills: ["s4-estar"] },
    { id: "mixed", label: "Mixed review", text: "A bit of everything", skills: ALL_SKILL_IDS.slice() }
  ];

  /* ---------- ESTAR ---------- */
  var ESTAR = [
    { key: "yo", pronouns: "yo", form: "estoy", en: "I am" },
    { key: "tu", pronouns: "tú", form: "estás", en: "you are (a friend)" },
    { key: "el", pronouns: "él / ella / usted", form: "está", en: "he / she is, you are (polite)" },
    { key: "nosotros", pronouns: "nosotros / nosotras", form: "estamos", en: "we are" },
    { key: "ellos", pronouns: "ellos / ellas / ustedes", form: "están", en: "they are, you all are" }
  ];
  var ESTAR_FORMS = ["estoy", "estás", "está", "estamos", "están"];
  var FORM_OF = { yo: "estoy", tu: "estás", el: "está", nosotros: "estamos", ellos: "están" };
  var RULE = {
    yo: "<b>Yo</b> (I) → <b>estoy</b>.",
    tu: "<b>Tú</b> (you, a friend) → <b>estás</b>.",
    el: "One person (él, ella, usted, or one name) → <b>está</b>.",
    nosotros: "<b>Nosotros / nosotras</b> (we) → <b>estamos</b>. “___ y yo” always means we.",
    ellos: "Two or more other people (ellos, ellas, ustedes) → <b>están</b>."
  };
  function S_(id, es, key, en, person, rule) {
    return { id: id, es: es, form: FORM_OF[key], key: key, en: en, person: person, rule: rule || RULE[key] };
  }
  var SUBJECTS = [
    S_("yo", "yo", "yo", "I", "yo"),
    S_("tu", "tú", "tu", "you (a friend)", "tu"),
    S_("el", "él", "el", "he", "el"),
    S_("ella", "ella", "el", "she", "ella"),
    S_("usted", "usted", "el", "you (polite)", "usted"),
    S_("nosotros", "nosotros", "nosotros", "we", "nosotros"),
    S_("nosotras", "nosotras", "nosotros", "we (girls)", "nosotras"),
    S_("ellos", "ellos", "ellos", "they", "ellos"),
    S_("ellas", "ellas", "ellos", "they (girls)", "ellas"),
    S_("ustedes", "ustedes", "ellos", "you all", "ustedes"),
    S_("ana", "Ana", "el", "Ana", "ella", "<b>Ana</b> is one person, like <b>ella</b> (she) → <b>está</b>."),
    S_("jaime", "Jaime", "el", "Jaime", "el", "<b>Jaime</b> is one person, like <b>él</b> (he) → <b>está</b>."),
    S_("laura", "Laura", "el", "Laura", "ella", "<b>Laura</b> is one person, like <b>ella</b> (she) → <b>está</b>."),
    S_("oscar", "Óscar", "el", "Óscar", "el", "<b>Óscar</b> is one person, like <b>él</b> (he) → <b>está</b>."),
    S_("sonia", "la Sra. Sonia", "el", "Mrs. Sonia", "ella", "<b>La Sra. Sonia</b> is one person, like <b>ella</b> (she) → <b>está</b>."),
    S_("panadero", "el panadero", "el", "the baker", "el", "<b>El panadero</b> is one person, like <b>él</b> (he) → <b>está</b>."),
    S_("farmaceutica", "la farmacéutica", "el", "the pharmacist", "ella", "<b>La farmacéutica</b> is one person, like <b>ella</b> (she) → <b>está</b>."),
    S_("mi-familia-y-yo", "Mi familia y yo", "nosotros", "My family and I", "nosotros", "<b>Mi familia y yo</b> includes me, so it is <b>nosotros</b> (we) → <b>estamos</b>."),
    S_("tu-y-yo", "Tú y yo", "nosotros", "You and I", "nosotros", "<b>Tú y yo</b> includes me, so it is <b>nosotros</b> (we) → <b>estamos</b>."),
    S_("ana-y-luis", "Ana y Luis", "ellos", "Ana and Luis", "ellos", "<b>Ana y Luis</b> are two other people, like <b>ellos</b> (they) → <b>están</b>."),
    S_("rolando-y-su-papa", "Rolando y su papá", "ellos", "Rolando and his dad", "ellos", "<b>Rolando y su papá</b> are two other people, like <b>ellos</b> (they) → <b>están</b>."),
    S_("mis-amigos", "Mis amigos", "ellos", "My friends", "ellos", "<b>Mis amigos</b> are more than one other person, like <b>ellos</b> (they) → <b>están</b>."),
    S_("las-ninas", "Las niñas", "ellos", "The girls", "ellas", "<b>Las niñas</b> are more than one person, like <b>ellas</b> (they) → <b>están</b>."),
    S_("los-vendedores", "Los vendedores", "ellos", "The sellers", "ellos", "<b>Los vendedores</b> are more than one person, like <b>ellos</b> (they) → <b>están</b>.")
  ];

  /* ---------- colors, clothing, places, workers ---------- */
  var COLORS = [
    { id: "rojo", m: "rojo", f: "roja", en: "red", hex: "#dc2626", changes: true },
    { id: "amarillo", m: "amarillo", f: "amarilla", en: "yellow", hex: "#facc15", changes: true },
    { id: "negro", m: "negro", f: "negra", en: "black", hex: "#1f2937", changes: true },
    { id: "blanco", m: "blanco", f: "blanca", en: "white", hex: "#f8fafc", changes: true },
    { id: "azul", m: "azul", f: "azul", en: "blue", hex: "#2563eb", changes: false },
    { id: "verde", m: "verde", f: "verde", en: "green", hex: "#16a34a", changes: false },
    { id: "marron", m: "marrón", f: "marrón", en: "brown", hex: "#92400e", changes: false },
    { id: "anaranjado", m: "anaranjado", f: "anaranjada", en: "orange", hex: "#f97316", changes: true },
    { id: "rosado", m: "rosado", f: "rosada", en: "pink", hex: "#f472b6", changes: true }
  ];

  var CLOTHING = [
    { id: "camisa", es: "camisa", article: "la", gender: "f", en: "shirt" },
    { id: "camiseta", es: "camiseta", article: "la", gender: "f", en: "T-shirt" },
    { id: "blusa", es: "blusa", article: "la", gender: "f", en: "blouse" },
    { id: "falda", es: "falda", article: "la", gender: "f", en: "skirt" },
    { id: "pantalon", es: "pantalón", article: "el", gender: "m", en: "pants" },
    { id: "pantalon-corto", es: "pantalón corto", article: "el", gender: "m", en: "shorts" },
    { id: "pantalon-largo", es: "pantalón largo", article: "el", gender: "m", en: "long pants" },
    { id: "vestido", es: "vestido", article: "el", gender: "m", en: "dress" },
    { id: "traje", es: "traje", article: "el", gender: "m", en: "suit" },
    { id: "corbata", es: "corbata", article: "la", gender: "f", en: "tie" }
  ];

  var PLACES = [
    { id: "hotel", es: "hotel", article: "el", en: "hotel", need: "un cuarto para dormir", needEn: "a room to sleep in" },
    { id: "farmacia", es: "farmacia", article: "la", en: "pharmacy", need: "medicinas", needEn: "medicine", worker: "farmaceutica" },
    { id: "panaderia", es: "panadería", article: "la", en: "bakery", need: "pan", needEn: "bread", worker: "panadero" },
    { id: "hospital", es: "hospital", article: "el", en: "hospital", need: "un médico", needEn: "a doctor" },
    { id: "parque", es: "parque", article: "el", en: "park", need: "jugar fútbol", needEn: "to play soccer" },
    { id: "tienda", es: "tienda", article: "la", en: "store", need: "ropa", needEn: "clothes", worker: "vendedora" },
    { id: "mercado", es: "mercado", article: "el", en: "market", need: "comida", needEn: "food", worker: "vendedor" },
    { id: "centro-comercial", es: "centro comercial", article: "el", en: "mall", need: "comida y ropa", needEn: "food and clothes" },
    { id: "teatro", es: "teatro", article: "el", en: "theater", need: "ver una obra", needEn: "to see a play" },
    { id: "estacion", es: "estación de ferrocarril", article: "la", en: "train station", need: "llegar en tren", needEn: "to arrive by train" },
    { id: "apartamento", es: "apartamento", article: "el", en: "apartment", need: "vivir", needEn: "to live", worker: "escritor" },
    { id: "casa", es: "casa", article: "la", en: "house", need: "vivir", needEn: "to live" }
  ];

  var WORKERS = [
    { id: "vendedora", es: "vendedora", article: "la", en: "saleswoman", verb: "vende", thing: "ropa", place: "tienda" },
    { id: "panadero", es: "panadero", article: "el", en: "baker", verb: "vende", thing: "pan", place: "panaderia" },
    { id: "escritor", es: "escritor", article: "el", en: "writer", verb: "escribe", thing: "libros", place: "apartamento" },
    { id: "farmaceutica", es: "farmacéutica", article: "la", en: "pharmacist (woman)", verb: "vende", thing: "medicinas", place: "farmacia" },
    { id: "farmaceutico", es: "farmacéutico", article: "el", en: "pharmacist (man)", verb: "vende", thing: "medicinas", place: "farmacia" },
    { id: "vendedor", es: "vendedor", article: "el", en: "salesman", verb: "vende", thing: "comida", place: "mercado" }
  ];

  function byIdIn(list, id) { for (var i = 0; i < list.length; i++) if (list[i].id === id) return list[i]; return null; }
  function placeOf(id) { return byIdIn(PLACES, id); }

  function withArticle(placeId) { var p = placeOf(placeId); return p ? p.article + " " + p.es : ""; }
  function dePlace(placeId) {
    var p = placeOf(placeId); if (!p) return "";
    return p.article === "el" ? "del " + p.es : "de " + p.article + " " + p.es;
  }
  function enPlace(placeId) { var p = placeOf(placeId); return p ? "en " + p.article + " " + p.es : ""; }
  function colorFor(colorId, gender) {
    var c = byIdIn(COLORS, colorId); if (!c) return "";
    var g = String(gender || "m").toLowerCase();
    return (g.charAt(0) === "f" || g === "la") ? c.f : c.m;
  }

  /* ---------- the neighborhood map ---------- */
  var MAP = {
    cols: 5, rows: 3, street: "Calle Principal",
    note: "Left and right mean your left and right as you look at the map. For left and right, look only in the same row (the same side of the street).",
    places: [
      { id: "apartamento", col: 1, row: 0 }, { id: "casa", col: 3, row: 0 },
      { id: "hotel", col: 0, row: 1 }, { id: "farmacia", col: 1, row: 1 }, { id: "panaderia", col: 2, row: 1 },
      { id: "tienda", col: 3, row: 1 }, { id: "hospital", col: 4, row: 1 },
      { id: "estacion", col: 0, row: 2 }, { id: "mercado", col: 1, row: 2 }, { id: "parque", col: 2, row: 2 },
      { id: "teatro", col: 3, row: 2 }, { id: "centro-comercial", col: 4, row: 2 }
    ]
  };
  function mp(id) { return byIdIn(MAP.places, id); }
  function distance(a, b) {
    var A = mp(a), B = mp(b); if (!A || !B) return NaN;
    return Math.hypot(A.col - B.col, A.row - B.row);
  }
  function satisfies(rel, a, b) {
    var A = mp(a), B = mp(b); if (!A || !B || a === b) return false;
    var d = distance(a, b);
    switch (rel) {
      case "izquierda": return A.row === B.row && A.col < B.col;
      case "derecha": return A.row === B.row && A.col > B.col;
      case "enfrente": return A.col === B.col && ((A.row === 1 && B.row === 2) || (A.row === 2 && B.row === 1));
      case "detras": return A.row === 0 && B.row === 1 && A.col === B.col;
      case "cerca": return d <= 1.5;
      case "lejos": return d >= 3;
      default: return false;
    }
  }
  var REL_PHRASE = { izquierda: "a la izquierda", derecha: "a la derecha", enfrente: "enfrente", detras: "detrás", cerca: "cerca", lejos: "lejos" };
  function relPhrase(rel) { return REL_PHRASE[rel] || ""; }

  /* ---------- question helpers ---------- */
  var QUESTIONS = [];
  var WEEK_OF = {};
  SKILLS.forEach(function (s) { WEEK_OF[s.id] = s.week; });
  function pad3(n) { return ("000" + n).slice(-3); }
  function W(pages) { return { kind: "workbook", pages: pages }; }
  function X(note) { return { kind: "extension", note: note }; }
  function cap(s) { return s.charAt(0).toUpperCase() + s.slice(1); }
  function push(q) { QUESTIONS.push(q); return q; }

  /* mc item. correct + wrongs are placed so the right answer rotates through positions 0-3 by n. */
  function Q(skill, n, family, diff, prompt, promptEn, correct, wrongs, hint, explain, src, o) {
    o = o || {};
    var pos = n % 4, q = {
      id: skill + "-" + pad3(n), week: WEEK_OF[skill], skill: skill, family: family, type: "mc",
      difficulty: diff, exam: o.exam !== false, prompt: prompt
    };
    if (promptEn) q.promptEn = promptEn;
    if (o.art) q.art = o.art;
    if (o.pics) {
      q.choices = ["Picture 1", "Picture 2", "Picture 3", "Picture 4"];
      var arts = o.pics.slice(1); arts.splice(pos, 0, o.pics[0]);
      q.choiceArt = arts;
    } else {
      var ch = wrongs.slice(); ch.splice(pos, 0, correct);
      q.choices = ch;
    }
    q.answer = pos; q.hint = hint; q.explain = explain; q.source = src;
    return push(q);
  }
  function cl(item, color, state) { var o = { kind: "clothing", item: item, color: color }; if (state) o.state = state; return o; }
  function pl(id) { return { kind: "place", id: id }; }

  /* ---------- s1-house ---------- */
  Q("s1-house", 1, "house-room", 1, "¿Qué cuarto es?", "Which room is it?", "la cocina", ["la sala", "el baño", "el dormitorio"],
    "Look at the things in the room.", "<b>La cocina</b> is the kitchen, the room where we cook.", W([19, 20]), { art: { kind: "room", id: "cocina" } });
  Q("s1-house", 2, "house-room", 1, "¿Qué cuarto es?", "Which room is it?", "el dormitorio", ["la cocina", "el comedor", "la sala"],
    "Think about where you sleep.", "<b>El dormitorio</b> is the bedroom, where we sleep.", W([19, 20]), { art: { kind: "room", id: "dormitorio" } });
  Q("s1-house", 3, "house-room", 1, "¿Qué cuarto es?", "Which room is it?", "el baño", ["la cocina", "el comedor", "el dormitorio"],
    "Look at what is in the room.", "<b>El baño</b> is the bathroom.", W([19, 20]), { art: { kind: "room", id: "bano" } });
  Q("s1-house", 4, "house-room", 1, "Comemos la cena en el ___.", "We eat dinner in the ___.", "comedor", ["baño", "dormitorio", "hospital"],
    "Which room has the table for meals?", "<b>El comedor</b> is the dining room, where we eat.", W([19]));
  Q("s1-house", 5, "house-room", 1, "Mi ___ es el cuarto donde duermo.", "My ___ is the room where I sleep.", "dormitorio", ["comedor", "cocina", "baño"],
    "Which room is for sleeping?", "<b>Dormitorio</b> means bedroom. We sleep there.", W([19, 20]));
  Q("s1-house", 6, "house-room", 1, "¿Cómo se dice «living room» en español?", "How do you say “living room” in Spanish?", "la sala", ["la cocina", "el baño", "el comedor"],
    "It is the room where a family relaxes.", "<b>La sala</b> is the living room.", W([19]));
  Q("s1-house", 7, "house-size", 1, "El apartamento es ___.", "The apartment is ___.", "pequeño", ["pequeña", "grande", "pequeños"],
    "Look at the size of the building. Is <i>apartamento</i> an el-word or a la-word?",
    "The apartment is small. <b>Apartamento</b> is an el-word, so we say <b>pequeño</b>.", W([20]), { art: { kind: "home", id: "apartamento-pequeno" } });
  Q("s1-house", 8, "house-size", 1, "La casa es muy ___.", "The house is very ___.", "grande", ["grandes", "pequeña", "pequeño"],
    "Look at the size of the house.", "The house is big. <b>Grande</b> stays the same for la-words and el-words.", W([20]), { art: { kind: "home", id: "casa-grande" } });
  Q("s1-house", 9, "house-size", 2, "La cocina es muy grande. La cocina no es ___.", "The kitchen is very big. The kitchen is not ___.", "pequeña", ["pequeño", "pequeñas", "grande"],
    "Pick the opposite of <i>grande</i>. <i>Cocina</i> is a la-word.", "<b>Cocina</b> is a la-word, so the opposite of grande is <b>pequeña</b>.", W([20]));
  Q("s1-house", 10, "house-size", 2, "Aníbal vive en un apartamento con solo dos dormitorios. Su apartamento es ___.", "Aníbal lives in an apartment with only two bedrooms. His apartment is ___.", "pequeño", ["grande", "pequeña", "grandes"],
    "Only two bedrooms means not a lot of space.", "Only two bedrooms: a small apartment, <b>pequeño</b> (an el-word).", W([20]), { art: { kind: "home", id: "apartamento-pequeno" } });
  Q("s1-house", 11, "house-room", 1, "«Hogar» significa ___.", "“Hogar” means ___.", "home", ["hotel", "hospital", "kitchen"],
    "It is where a family lives.", "<b>Hogar</b> means home. It is the place where your family lives.", W([19]));

  /* ---------- s1-places ---------- */
  Q("s1-places", 1, "places-need", 1, "Necesito medicinas. Voy a la ___.", "I need medicine. I go to the ___.", "farmacia", ["panadería", "estación de ferrocarril", "casa"],
    "Where do people buy medicine?", "Medicine is sold at <b>la farmacia</b> (the pharmacy).", W([21]), { art: pl("farmacia") });
  Q("s1-places", 2, "places-need", 1, "Quiero comprar pan. Voy a la ___.", "I want to buy bread. I go to the ___.", "panadería", ["farmacia", "estación de ferrocarril", "casa"],
    "Where is bread made and sold?", "Bread is sold at <b>la panadería</b> (the bakery).", W([21]), { art: pl("panaderia") });
  Q("s1-places", 3, "places-need", 1, "Queremos jugar fútbol. Vamos al ___.", "We want to play soccer. We go to the ___.", "parque", ["hotel", "hospital", "teatro"],
    "Where is there grass and room to run?", "We play soccer at <b>el parque</b> (the park).", W([21]), { art: pl("parque") });
  Q("s1-places", 4, "places-need", 1, "Mi mamá compra comida. Ella va al ___.", "My mom buys food. She goes to the ___.", "mercado", ["parque", "hospital", "teatro"],
    "Where do people buy fruit, vegetables and food?", "Food is sold at <b>el mercado</b> (the market).", W([21]), { art: pl("mercado") });
  Q("s1-places", 5, "places-need", 1, "Vamos a viajar en tren. Vamos a la ___.", "We are going to travel by train. We go to the ___.", "estación de ferrocarril", ["farmacia", "panadería", "casa"],
    "Where do trains stop?", "Trains stop at <b>la estación de ferrocarril</b> (the train station).", W([21]), { art: pl("estacion") });
  Q("s1-places", 6, "places-picture", 1, "¿Dónde compras comida y ropa?", "Where do you buy food and clothes?", "el centro comercial", ["el hospital", "el teatro", "el parque"],
    "Think of a big building with many shops inside.", "<b>El centro comercial</b> (the mall) has many stores for food and clothes.", W([29, 30]));
  Q("s1-places", 7, "places-picture", 1, "¿Qué lugar es?", "Which place is it?", "el hospital", ["el hotel", "la casa", "el teatro"],
    "Doctors and nurses work here.", "<b>El hospital</b> is where doctors help sick people.", W([20]), { art: pl("hospital") });
  Q("s1-places", 8, "places-vocab", 1, "«Vecindario» significa ___.", "“Vecindario” means ___.", "neighborhood", ["bakery", "pharmacy", "train station"],
    "It is the area around your home.", "<b>Vecindario</b> means neighborhood: the places and people near your home.", W([19, 20, 21]));
  Q("s1-places", 9, "places-need", 1, "Queremos ver una obra. Vamos al ___.", "We want to see a play. We go to the ___.", "teatro", ["parque", "hospital", "mercado"],
    "Where do actors perform?", "We see a play at <b>el teatro</b> (the theater).", W([28]), { art: pl("teatro") });
  Q("s1-places", 10, "places-need", 1, "Necesito un médico. Voy al ___.", "I need a doctor. I go to the ___.", "hospital", ["hotel", "parque", "teatro"],
    "Where do doctors work?", "Doctors work at <b>el hospital</b>.", W([20]));
  Q("s1-places", 11, "places-need", 2, "Mi familia viaja y necesita un cuarto para dormir. Vamos al ___.", "My family is traveling and needs a room to sleep. We go to the ___.", "hotel", ["parque", "mercado", "teatro"],
    "Travelers rent a room here.", "Travelers sleep at <b>el hotel</b>.", W([20]), { art: pl("hotel") });
  Q("s1-places", 12, "places-vocab", 1, "En la farmacia venden ___.", "At the pharmacy they sell ___.", "medicinas", ["pan", "ropa", "trenes"],
    "Think about what a pharmacy is for.", "A pharmacy sells <b>medicinas</b> (medicine).", W([21]));
  Q("s1-places", 13, "places-need", 1, "Necesito una camisa y un pantalón. Voy a la ___.", "I need a shirt and pants. I go to the ___.", "tienda", ["panadería", "farmacia", "estación de ferrocarril"],
    "Where do people buy clothes?", "Clothes are sold at <b>la tienda</b> (the store).", W([29]), { art: pl("tienda") });

  /* ---------- s1-directions ---------- */
  var REL_ORDER = ["izquierda", "derecha", "enfrente", "detras"];
  var REL_EXPLAIN = {
    izquierda: "On the map they are in the same row, and the first one is on the left side (<b>a la izquierda</b>).",
    derecha: "On the map they are in the same row, and the first one is on the right side (<b>a la derecha</b>).",
    enfrente: "They are in the same column, straight across Calle Principal: <b>enfrente</b>.",
    detras: "The first one is in the back row, straight up from the second one: <b>detrás</b>."
  };
  var REL_EN = { izquierda: "to the left of", derecha: "to the right of", enfrente: "across the street from", detras: "behind", cerca: "near", lejos: "far from" };
  function REL(n, diff, a, b, rel, src) {
    var B = placeOf(b), masc = B.article === "el";
    var choices = REL_ORDER.map(function (r) { return relPhrase(r) + (masc ? (r === "enfrente" || r === "detras" ? " del" : " del") : " de"); });
    var q = {
      id: "s1-directions-" + pad3(n), week: 1, skill: "s1-directions", family: "dir-rel", type: "mc", difficulty: diff, exam: true,
      prompt: cap(withArticle(a)) + " está ___ " + (masc ? B.es : withArticle(b)) + ".",
      promptEn: "Look at the map. Where is the " + placeOf(a).en + " compared to the " + B.en + "?",
      art: { kind: "map", highlight: [a, b] },
      choices: choices, answer: REL_ORDER.indexOf(rel),
      hint: "Find both buildings on the map. Left and right are your left and right as you look at the map, in the same row.",
      explain: cap(withArticle(a)) + " está " + relPhrase(rel) + " " + dePlace(b) + ". " + REL_EXPLAIN[rel] + (masc ? " <i>del</i> = <i>de</i> + <i>el</i>." : ""),
      geo: { ask: "rel", a: a, b: b, rels: REL_ORDER.slice() }, source: src || W([20, 21])
    };
    return push(q);
  }
  function PLC(n, diff, rel, ref, places, answerPlace) {
    var wrongs = places.filter(function (p) { return p !== answerPlace; });
    var pos = n % 4, list = wrongs.slice(); list.splice(pos, 0, answerPlace);
    var near = rel === "cerca", far = rel === "lejos";
    var side = rel === "izquierda" || rel === "derecha";
    var others = near ? "The other places are all far away (<b>lejos</b>)." : far ? "The other places are all near (<b>cerca</b>)." :
      side ? "No other choice is in that row " + REL_EN[rel] + " it." : "None of the other places is " + REL_EN[rel] + " it.";
    var q = {
      id: "s1-directions-" + pad3(n), week: 1, skill: "s1-directions", family: "dir-place", type: "mc", difficulty: diff, exam: true,
      prompt: "¿Qué lugar está " + relPhrase(rel) + " " + dePlace(ref) + "?",
      promptEn: "Which place is " + REL_EN[rel] + " the " + placeOf(ref).en + (side ? ", in the same row?" : "?"),
      art: { kind: "map", highlight: [ref] },
      choices: list.map(withArticle), answer: pos,
      hint: "Find the " + placeOf(ref).en + " on the map first. " + (near ? "Near means just a step away." : far ? "Far means at the other end of the map." : side ? "Then look that way, staying in the same row." : "Then look in that direction."),
      explain: cap(withArticle(answerPlace)) + " está " + relPhrase(rel) + " " + dePlace(ref) + ". " + others,
      geo: { ask: "place", rel: rel, ref: ref, places: list.slice() }, source: W([20, 21, 28])
    };
    return push(q);
  }
  function TAP(n, rel, ref, target) {
    var q = {
      id: "s1-directions-" + pad3(n), week: 1, skill: "s1-directions", family: "dir-tap", type: "tap", difficulty: 1, exam: false,
      prompt: "Toca el lugar que está " + relPhrase(rel) + " " + dePlace(ref) + ".",
      promptEn: "Tap the place that is " + REL_EN[rel] + " the " + placeOf(ref).en + ".",
      art: { kind: "map", highlight: [ref] },
      hint: "Find the " + placeOf(ref).en + " first. Then look " + (rel === "izquierda" ? "to its left, in the same row" : rel === "derecha" ? "to its right, in the same row" : rel === "enfrente" ? "straight across the street" : "straight up, behind it") + ".",
      explain: cap(withArticle(target)) + " está " + relPhrase(rel) + " " + dePlace(ref) + ". It is the only place on the map in that spot.",
      geo: { ask: "tap", rel: rel, ref: ref }, target: target, source: W([20, 21, 28])
    };
    return push(q);
  }
  REL(1, 1, "hotel", "farmacia", "izquierda");
  REL(2, 1, "hospital", "tienda", "derecha");
  REL(3, 1, "mercado", "farmacia", "enfrente");
  REL(4, 2, "apartamento", "farmacia", "detras");
  REL(5, 2, "casa", "tienda", "detras");
  REL(6, 1, "panaderia", "farmacia", "derecha");
  REL(7, 2, "estacion", "mercado", "izquierda");
  REL(8, 2, "teatro", "parque", "derecha");
  REL(9, 2, "centro-comercial", "hospital", "enfrente");
  PLC(10, 2, "cerca", "hotel", ["mercado", "hospital", "teatro", "casa"], "mercado");
  PLC(11, 2, "lejos", "hospital", ["teatro", "tienda", "centro-comercial", "hotel"], "hotel");
  PLC(12, 2, "izquierda", "hospital", ["tienda", "mercado", "casa", "centro-comercial"], "tienda");
  PLC(13, 1, "derecha", "farmacia", ["hotel", "panaderia", "estacion", "apartamento"], "panaderia");
  PLC(14, 1, "enfrente", "teatro", ["tienda", "hospital", "parque", "casa"], "tienda");
  PLC(15, 2, "detras", "tienda", ["casa", "apartamento", "hospital", "parque"], "casa");
  PLC(16, 2, "cerca", "centro-comercial", ["hotel", "teatro", "mercado", "estacion"], "teatro");
  PLC(17, 2, "lejos", "apartamento", ["farmacia", "hotel", "hospital", "panaderia"], "hospital");
  TAP(18, "izquierda", "farmacia", "hotel");
  TAP(19, "derecha", "tienda", "hospital");
  TAP(20, "enfrente", "farmacia", "mercado");
  TAP(21, "detras", "tienda", "casa");
  TAP(22, "izquierda", "mercado", "estacion");
  TAP(23, "derecha", "teatro", "centro-comercial");
  TAP(24, "enfrente", "hospital", "centro-comercial");
  TAP(25, "detras", "farmacia", "apartamento");
  TAP(26, "izquierda", "casa", "apartamento");

  /* ---------- s2-clothes ---------- */
  Q("s2-clothes", 1, "cl-picture", 1, "¿Qué ropa es?", "Which piece of clothing is it?", "la camisa", ["la falda", "el pantalón", "el vestido"],
    "Look at the shape: sleeves and a collar.", "<b>La camisa</b> is the shirt.", W([22]), { art: cl("camisa", "azul") });
  Q("s2-clothes", 2, "cl-picture", 1, "¿Qué ropa es?", "Which piece of clothing is it?", "el vestido", ["la camisa", "la corbata", "el pantalón"],
    "It is one piece that covers the top and the legs.", "<b>El vestido</b> is the dress.", W([26]), { art: cl("vestido", "rosado") });
  Q("s2-clothes", 3, "cl-picture", 1, "¿Cuál dibujo muestra una falda?", "Which picture shows a skirt?", "", [],
    "A skirt hangs from the waist and has no legs.", "<b>La falda</b> is the skirt.", W([22]),
    { pics: [cl("falda", "verde"), cl("camisa", "amarillo"), cl("pantalon-largo", "azul"), cl("corbata", "rojo")] });
  Q("s2-clothes", 4, "cl-picture", 1, "¿Cuál dibujo muestra una corbata?", "Which picture shows a tie?", "", [],
    "You wear it around your neck.", "<b>La corbata</b> is the tie. It goes with a suit.", W([26]),
    { pics: [cl("corbata", "rojo"), cl("vestido", "rosado"), cl("pantalon-corto", "azul"), cl("blusa", "verde")] });
  Q("s2-clothes", 5, "cl-picture", 2, "¿Cuál dibujo muestra un traje?", "Which picture shows a suit?", "", [],
    "A suit has a jacket and long pants.", "<b>El traje</b> is the suit.", W([26]),
    { pics: [cl("traje", "negro"), cl("camiseta", "anaranjado"), cl("falda", "azul"), cl("pantalon-corto", "amarillo")] });
  Q("s2-clothes", 6, "cl-outfit", 1, "Mira el dibujo. ¿Qué ropa ves?", "Look at the picture. What clothes do you see?", "una camisa y una falda",
    ["un vestido y una corbata", "un pantalón largo y un traje", "una camiseta y un pantalón corto"],
    "Name each piece you see, one by one.", "The picture shows <b>una camisa</b> (shirt) and <b>una falda</b> (skirt).", W([22, 31]),
    { art: { kind: "outfit", items: [{ item: "camisa", color: "blanco" }, { item: "falda", color: "azul" }] } });
  Q("s2-clothes", 7, "cl-outfit", 1, "Mira el dibujo. ¿Qué ropa ves?", "Look at the picture. What clothes do you see?", "una blusa y un pantalón largo",
    ["una camisa y una falda", "un traje y una corbata", "un vestido y una corbata"],
    "Name each piece you see, one by one.", "The picture shows <b>una blusa</b> (blouse) and <b>un pantalón largo</b> (long pants).", W([22]),
    { art: { kind: "outfit", items: [{ item: "blusa", color: "verde" }, { item: "pantalon-largo", color: "negro" }] } });
  Q("s2-clothes", 8, "cl-picture", 1, "Es un pantalón ___.", "These are ___ pants.", "corto", ["largo", "corta", "larga"],
    "Look at the length of the pants.", "These are shorts: <b>un pantalón corto</b>. <i>Pantalón</i> is an el-word, so <b>corto</b> (not corta).", W([22]),
    { art: cl("pantalon-corto", "marron") });
  Q("s2-clothes", 9, "cl-article", 1, "___ pantalón es largo.", "___ pants are long.", "El", ["La", "Las", "Una"],
    "Is <i>pantalón</i> a masculine or a feminine word? It does not end in -a.", "<b>Pantalón</b> is an el-word: <b>el pantalón</b>.", W([22]));
  Q("s2-clothes", 10, "cl-article", 1, "___ blusa es nueva.", "___ blouse is new.", "La", ["El", "Los", "Un"],
    "Is <i>blusa</i> a masculine or a feminine word? It ends in -a.", "<b>Blusa</b> is a la-word: <b>la blusa</b>.", W([22]));
  Q("s2-clothes", 11, "cl-meaning", 1, "«Ropa» significa ___.", "“Ropa” means ___.", "clothes", ["food", "money", "medicine"],
    "You wear it.", "<b>Ropa</b> means clothes.", W([22]));
  Q("s2-clothes", 12, "cl-meaning", 1, "¿Cuál es ropa?", "Which one is clothing?", "la camiseta", ["la escoba", "el jabón", "la aspiradora"],
    "Only one of these can be worn.", "<b>La camiseta</b> is a T-shirt, which is clothing. The others are cleaning tools.", W([22, 25]));

  /* ---------- s2-colors ---------- */
  Q("s2-colors", 1, "col-agree", 1, "La camisa es ___.", "The shirt is ___.", "roja", ["rojo", "rojas", "rojos"],
    "<i>Camisa</i> is a la-word. The color must match.", "<b>La camisa roja</b>: with a la-word, the color ends in <b>-a</b>.", W([22, 23]), { art: cl("camisa", "rojo") });
  Q("s2-colors", 2, "col-agree", 1, "El pantalón es ___.", "The pants are ___.", "negro", ["negra", "negras", "negros"],
    "<i>Pantalón</i> is an el-word. The color must match.", "<b>El pantalón negro</b>: with an el-word, the color ends in <b>-o</b>.", W([22]), { art: cl("pantalon", "negro") });
  Q("s2-colors", 3, "col-agree", 1, "La falda es ___.", "The skirt is ___.", "amarilla", ["amarillo", "amarillas", "amarillos"],
    "<i>Falda</i> is a la-word.", "<b>La falda amarilla</b>: la-word, color ends in <b>-a</b>.", W([22]), { art: cl("falda", "amarillo") });
  Q("s2-colors", 4, "col-same", 1, "La blusa es ___.", "The blouse is ___.", "azul", ["azula", "azulo", "azules"],
    "Some colors never change. Think about the last letter of this color.", "<b>Azul</b> never changes: <b>la blusa azul</b> and <b>el pantalón azul</b>.", W([22]), { art: cl("blusa", "azul") });
  Q("s2-colors", 5, "col-same", 1, "La falda es verde. El pantalón también es ___.", "The skirt is green. The pants are also ___.", "verde", ["verda", "verdo", "verdes"],
    "Some colors stay the same for el-words and la-words. Is this one of them?", "<b>Verde</b> never changes: <b>la falda verde</b>, <b>el pantalón verde</b>.", W([22]));
  Q("s2-colors", 6, "col-same", 2, "La camisa es marrón. El pantalón es ___.", "The shirt is brown. The pants are ___.", "marrón", ["marrona", "marrono", "marrones"],
    "One color word, same for both. Do not change it.", "<b>Marrón</b> never changes: <b>la camisa marrón</b>, <b>el pantalón marrón</b>.", W([22]));
  Q("s2-colors", 7, "col-picture", 1, "¿De qué color es la camiseta?", "What color is the T-shirt?", "anaranjada", ["anaranjado", "verde", "negra"],
    "<i>Camiseta</i> is a la-word.", "<b>La camiseta anaranjada</b>: orange is <i>anaranjado</i> for el-words and <b>anaranjada</b> for la-words.", W([22]), { art: cl("camiseta", "anaranjado") });
  Q("s2-colors", 8, "col-picture", 1, "¿De qué color es el pantalón?", "What color are the pants?", "blanco", ["blanca", "negro", "rojo"],
    "<i>Pantalón</i> is an el-word.", "<b>El pantalón blanco</b>: white is <b>blanco</b> with an el-word.", W([22]), { art: cl("pantalon", "blanco") });
  Q("s2-colors", 9, "col-picture", 2, "¿Cuál dibujo muestra una blusa verde?", "Which picture shows a green blouse?", "", [],
    "Check the clothing AND the color.", "<b>Una blusa verde</b>: a blouse (not a skirt) that is green.", W([22]),
    { pics: [cl("blusa", "verde"), cl("blusa", "negro"), cl("falda", "verde"), cl("pantalon-largo", "azul")] });
  Q("s2-colors", 10, "col-picture", 2, "¿Cuál dibujo muestra un pantalón corto amarillo?", "Which picture shows yellow shorts?", "", [],
    "Check the clothing AND the color.", "<b>Un pantalón corto amarillo</b>: short pants that are yellow.", W([22, 24]),
    { pics: [cl("pantalon-corto", "amarillo"), cl("pantalon-corto", "azul"), cl("falda", "amarillo"), cl("camiseta", "amarillo")] });
  Q("s2-colors", 11, "col-agree", 2, "Los dos son blancos: una camisa ___ y un pantalón ___.", "Both are white: a white shirt and white pants.", "blanca / blanco", ["blanco / blanca", "blanca / blanca", "blanco / blanco"],
    "Match each color to its own word: la camisa, el pantalón.", "<b>La camisa blanca</b> (la-word → -a) and <b>el pantalón blanco</b> (el-word → -o).", W([22]));
  Q("s2-colors", 12, "col-agree", 2, "¿Cuál frase está bien?", "Which phrase is correct?", "la falda rosada", ["la falda rosado", "el falda rosada", "el falda rosado"],
    "Check the el/la word AND the ending of the color.", "<b>La falda rosada</b>: <i>falda</i> is a la-word, so the article is <i>la</i> and the color ends in <b>-a</b>.", W([22]));
  Q("s2-colors", 13, "col-same", 2, "El vestido es azul. La corbata es ___.", "The dress is blue. The tie is ___.", "azul", ["azula", "azulo", "azules"],
    "Does this color change?", "<b>Azul</b> never changes, so <b>la corbata azul</b>.", W([22]));
  Q("s2-colors", 14, "col-agree", 2, "El traje es negro. La corbata es ___.", "The suit is black. The tie is ___.", "negra", ["negro", "negros", "negras"],
    "<i>Corbata</i> is a la-word.", "<b>La corbata negra</b>: la-word, so black is <b>negra</b>.", W([26]));

  /* ---------- s2-shopping ---------- */
  function money(amount, cur) { return { kind: "money", amount: amount, currency: cur }; }
  Q("s2-shopping", 1, "shop-money-art", 1, "Esto es ___.", "This is ___.", "cincuenta dólares", ["quinientos dólares", "cien dólares", "mil dólares"],
    "The money has a $ sign. Read the number.", "$50 = <b>cincuenta dólares</b>.", W([23, 24, 31]), { art: money(50, "USD") });
  Q("s2-shopping", 2, "shop-money-art", 1, "Esto es ___.", "This is ___.", "cien dólares", ["cincuenta dólares", "quinientos dólares", "mil dólares"],
    "Read the number on the money.", "$100 = <b>cien dólares</b>. The word is <i>cien</i> (not ciento).", W([24]), { art: money(100, "USD") });
  Q("s2-shopping", 3, "shop-money-art", 2, "Esto es ___.", "This is ___.", "quinientos guaraníes", ["cincuenta guaraníes", "cien guaraníes", "quinientos dólares"],
    "The ₲ sign is the money of Paraguay.", "₲ 500 = <b>quinientos guaraníes</b>.", W([23, 24]), { art: money(500, "PYG") });
  Q("s2-shopping", 4, "shop-money-art", 2, "Esto es ___.", "This is ___.", "mil guaraníes", ["cien guaraníes", "quinientos guaraníes", "mil dólares"],
    "The ₲ sign is the money of Paraguay.", "₲ 1.000 = <b>mil guaraníes</b>.", W([24]), { art: money(1000, "PYG") });
  Q("s2-shopping", 5, "shop-number", 1, "La camiseta cuesta $50. Cuesta ___.", "The T-shirt costs $50. It costs ___.", "cincuenta dólares", ["quinientos dólares", "cien dólares", "cincuenta guaraníes"],
    "Check the number AND the kind of money.", "$50 is <b>cincuenta dólares</b>. A $ sign means dólares.", W([31]));
  Q("s2-shopping", 6, "shop-number", 2, "¿Cuál número es el más grande?", "Which number is the biggest?", "mil", ["quinientos", "cien", "cincuenta"],
    "Remember: 50, 100, 500, 1.000.", "<b>Mil</b> is 1.000, bigger than quinientos (500), cien (100) and cincuenta (50).", W([24]));
  Q("s2-shopping", 7, "shop-number", 1, "El número 500 se dice ___.", "The number 500 is said ___.", "quinientos", ["cincuenta", "cien", "mil"],
    "It is not 50 and not 100.", "500 = <b>quinientos</b>. 50 = cincuenta. 100 = cien. 1.000 = mil.", W([24]));
  Q("s2-shopping", 8, "shop-currency", 2, "En Paraguay usan ___.", "In Paraguay they use ___.", "guaraníes", ["dólares", "pesos", "euros"],
    "Paraguay is in South America. Its money is not the dollar.", "In Paraguay the money is the <b>guaraní</b> (plural: guaraníes).", W([23]));
  Q("s2-shopping", 9, "shop-currency", 1, "En los Estados Unidos usamos ___.", "In the United States we use ___.", "dólares", ["guaraníes", "pesos", "euros"],
    "Think of the $ sign.", "In the United States the money is the <b>dólar</b> (plural: dólares).", W([23, 24]));
  Q("s2-shopping", 10, "shop-price", 2, "Una camiseta cuesta cinco dólares y otra cuesta cincuenta dólares. La camiseta de cinco dólares es ___.", "One T-shirt costs $5 and another costs $50. The $5 T-shirt is ___.", "barata", ["cara", "grande", "sucia"],
    "A low price means you pay little.", "A low price is <b>barato / barata</b> (cheap). <i>Camiseta</i> is a la-word.", W([23, 24]));
  Q("s2-shopping", 11, "shop-price", 1, "Un precio alto es un precio ___.", "A high price is a ___ price.", "caro", ["barato", "pequeño", "limpio"],
    "A high price means you pay a lot.", "<b>Caro</b> means expensive. <b>Barato</b> means cheap.", W([23]));
  Q("s2-shopping", 12, "shop-vocab", 1, "«Dinero» significa ___.", "“Dinero” means ___.", "money", ["price", "store", "clothes"],
    "You pay with it.", "<b>Dinero</b> means money.", W([23]));
  Q("s2-shopping", 13, "shop-vocab", 1, "«Comprar» significa ___.", "“Comprar” means ___.", "to buy", ["to sell", "to wash", "to dry"],
    "Customers do this.", "<b>Comprar</b> = to buy. <b>Vender</b> = to sell.", W([23, 30]));
  Q("s2-shopping", 14, "shop-vocab", 1, "«Vender» significa ___.", "“Vender” means ___.", "to sell", ["to buy", "to wash", "to take care of"],
    "Store workers do this.", "<b>Vender</b> = to sell. <b>Comprar</b> = to buy.", W([30]));
  Q("s2-shopping", 15, "shop-vocab", 2, "«Precio» significa ___.", "“Precio” means ___.", "price", ["money", "clothes", "bread"],
    "It tells you how much something costs.", "<b>Precio</b> means price. <b>Dinero</b> means money.", W([23, 24]));

  /* ---------- s3-cleaning ---------- */
  function tool(id) { return { kind: "tool", id: id }; }
  function scene(id) { return { kind: "scene", id: id }; }
  Q("s3-cleaning", 1, "clean-tool", 1, "Usamos la aspiradora para limpiar la ___.", "We use the vacuum cleaner to clean the ___.", "alfombra", ["camisa", "corbata", "agua"],
    "A vacuum cleaner picks up dirt from something soft on the floor.", "<b>La aspiradora</b> cleans <b>la alfombra</b> (the rug).", W([25, 27]), { art: tool("aspiradora") });
  Q("s3-cleaning", 2, "clean-tool", 1, "¿Qué herramienta es?", "Which cleaning tool is it?", "la aspiradora", ["el jabón", "el trapeador", "el agua"],
    "It is a machine that sucks up dirt.", "<b>La aspiradora</b> is the vacuum cleaner.", W([25]), { art: tool("aspiradora") });
  Q("s3-cleaning", 3, "clean-laundry", 1, "Para lavar la ropa, usamos agua y ___.", "To wash clothes, we use water and ___.", "jabón", ["escoba", "aspiradora", "trapeador"],
    "Think of what makes bubbles.", "To wash clothes: <b>agua y jabón</b> (water and soap).", W([25, 27, 31]), { art: tool("jabon") });
  Q("s3-cleaning", 4, "clean-laundry", 1, "La ropa está sucia. ¿Qué hacemos?", "The clothes are dirty. What do we do?", "Lavamos la ropa con agua y jabón.",
    ["Lavamos la ropa con una escoba.", "Limpiamos la ropa con una aspiradora.", "Secamos la ropa con un trapeador."],
    "Which tools belong with clothes?", "We wash dirty clothes with <b>agua y jabón</b>. A broom, a vacuum and a mop are for floors and rugs.", W([27, 31]), { art: scene("ropa-sucia") });
  Q("s3-cleaning", 5, "clean-tool", 1, "Usamos la escoba y el trapeador para limpiar el ___.", "We use the broom and the mop to clean the ___.", "piso", ["traje", "corbata", "jabón"],
    "Brooms and mops work on the ground.", "<b>El piso</b> is the floor. We clean it with <b>la escoba</b> (broom), <b>agua</b> and <b>el trapeador</b> (mop).", W([25, 27]), { art: scene("piso-sucio") });
  Q("s3-cleaning", 6, "clean-verb", 1, "«Lavar» significa ___.", "“Lavar” means ___.", "to wash", ["to dry", "to buy", "to take care of"],
    "Think of water and soap.", "<b>Lavar</b> = to wash.", W([25, 26]));
  Q("s3-cleaning", 7, "clean-verb", 1, "«Secar» significa ___.", "“Secar” means ___.", "to dry", ["to wash", "to sell", "to buy"],
    "The opposite of wet.", "<b>Secar</b> = to dry.", W([26]));
  Q("s3-cleaning", 8, "clean-verb", 1, "«Cuidar» significa ___.", "“Cuidar” means ___.", "to take care of", ["to dry", "to sell", "to wash"],
    "You do this with something you love or something new.", "<b>Cuidar</b> = to take care of.", W([26]));
  Q("s3-cleaning", 9, "clean-action", 1, "Después de lavar la ropa, la ___.", "After washing the clothes, we ___ them.", "secamos", ["vendemos", "compramos", "escribimos"],
    "Wet clothes need to become...", "After washing we <b>secamos</b> (dry) the clothes.", W([26]));
  Q("s3-cleaning", 10, "clean-action", 1, "Voy a ___ la alfombra con la aspiradora.", "I am going to ___ the rug with the vacuum cleaner.", "limpiar", ["vender", "comprar", "escribir"],
    "What do you do with a vacuum cleaner?", "<b>Limpiar</b> = to clean. We clean the rug with the vacuum.", W([25]), { art: scene("alfombra-sucia") });
  Q("s3-cleaning", 11, "clean-action", 2, "El piso está mojado. Necesito ___ el piso.", "The floor is wet. I need to ___ the floor.", "secar", ["vender", "comprar", "escribir"],
    "What do you do to something wet?", "A wet floor needs to be dried: <b>secar el piso</b>.", W([26]), { art: scene("piso-mojado") });

  /* ---------- s3-commands ---------- */
  Q("s3-commands", 1, "cmd-do", 1, "Mamá dice: «¡Limpia tu dormitorio!» ¿Qué hago?", "Mom says: “Clean your bedroom!” What do I do?", "Limpio mi dormitorio.", ["Lavo mi ropa.", "Seco el piso.", "Cuido mi ropa nueva."],
    "Look at the first word of the command and think what it means.", "<b>¡Limpia!</b> is the command to clean. I clean my bedroom.", W([26]), { art: scene("dormitorio-sucio") });
  Q("s3-commands", 2, "cmd-do", 1, "Mamá dice: «¡Lava tu ropa!» ¿Qué hago?", "Mom says: “Wash your clothes!” What do I do?", "Lavo mi ropa.", ["Limpio mi dormitorio.", "Seco el piso.", "Cuido mi ropa nueva."],
    "Look at the first word of the command and think what it means.", "<b>¡Lava!</b> is the command to wash. I wash my clothes.", W([26]), { art: scene("ropa-sucia") });
  Q("s3-commands", 3, "cmd-do", 1, "Papá dice: «¡Seca el piso!» ¿Qué hago?", "Dad says: “Dry the floor!” What do I do?", "Seco el piso.", ["Limpio mi dormitorio.", "Lavo mi ropa.", "Cuido mi ropa nueva."],
    "Look at the first word of the command and think what it means.", "<b>¡Seca!</b> is the command to dry. I dry the floor.", W([26]), { art: scene("piso-mojado") });
  Q("s3-commands", 4, "cmd-do", 1, "Mamá dice: «¡Cuida tu ropa nueva!» ¿Qué hago?", "Mom says: “Take care of your new clothes!” What do I do?", "Cuido mi ropa nueva.", ["Limpio mi dormitorio.", "Lavo mi ropa.", "Seco el piso."],
    "Look at the first word of the command and think what it means.", "<b>¡Cuida!</b> is the command to take care of. I take care of my new clothes.", W([26]), { art: scene("ropa-nueva") });
  Q("s3-commands", 5, "cmd-say", 1, "El piso está mojado. ¿Qué dice mamá?", "The floor is wet. What does Mom say?", "¡Seca el piso!", ["¡Lava tu ropa!", "¡Cuida tu ropa nueva!", "¡Limpia tu dormitorio!"],
    "What do you do to something wet?", "A wet floor: <b>¡Seca el piso!</b> (Dry the floor!)", W([26]), { art: scene("piso-mojado") });
  Q("s3-commands", 6, "cmd-say", 1, "Tu dormitorio está muy sucio. ¿Qué dice mamá?", "Your bedroom is very dirty. What does Mom say?", "¡Limpia tu dormitorio!", ["¡Lava tu ropa!", "¡Seca el piso!", "¡Cuida tu ropa nueva!"],
    "Which command means to clean?", "A dirty bedroom: <b>¡Limpia tu dormitorio!</b> (Clean your bedroom!)", W([26]), { art: scene("dormitorio-sucio") });
  Q("s3-commands", 7, "cmd-say", 2, "¿Cuál mandato significa «Wash your clothes!»?", "Which command means “Wash your clothes!”?", "¡Lava tu ropa!", ["¡Seca tu ropa!", "¡Limpia tu ropa!", "¡Cuida tu ropa!"],
    "Think of water and soap.", "<b>¡Lava!</b> = wash. <b>¡Seca!</b> = dry. <b>¡Cuida!</b> = take care of. <b>¡Limpia!</b> = clean.", W([26]));

  /* ---------- s3-clothes-desc ---------- */
  Q("s3-clothes-desc", 1, "desc-formal", 1, "Vamos al teatro. Necesito ropa ___.", "We are going to the theater. I need ___ clothes.", "elegante", ["informal", "sucia", "corto"],
    "The theater is a fancy place.", "For the theater we wear <b>ropa elegante</b> (dressy clothes).", W([27, 30]), { art: scene("teatro-noche") });
  Q("s3-clothes-desc", 2, "desc-formal", 1, "Rolando va al teatro. Rolando lleva ___.", "Rolando goes to the theater. Rolando wears ___.", "un traje y una corbata",
    ["un pantalón corto y una camiseta", "una camiseta sucia", "un pantalón corto"],
    "Which clothes are dressy?", "<b>Un traje y una corbata</b> are ropa elegante.", W([26, 31]), { art: { kind: "outfit", items: [{ item: "traje", color: "negro" }, { item: "corbata", color: "rojo" }] } });
  Q("s3-clothes-desc", 3, "desc-state", 2, "Mira la ropa. Esta ropa es ___.", "Look at the clothes. These clothes are ___.", "informal y sucia", ["elegante y limpia", "elegante y sucia", "informal y limpia"],
    "Check two things: is it dressy or casual, and is it clean or dirty?", "Shorts and a T-shirt are <b>ropa informal</b>, and these are <b>sucia</b> (dirty).", W([26]),
    { art: { kind: "outfit", items: [{ item: "pantalon-corto", color: "amarillo", state: "sucia" }, { item: "camiseta", color: "verde", state: "sucia" }] } });
  Q("s3-clothes-desc", 4, "desc-state", 2, "Mi camiseta no está limpia. Está ___.", "My T-shirt is not clean. It is ___.", "sucia", ["limpia", "sucio", "limpio"],
    "Think of the opposite of clean. <i>Camiseta</i> is a la-word.", "Not clean = <b>sucia</b> (dirty). <i>Camiseta</i> is a la-word, so it ends in -a.", W([26]));
  Q("s3-clothes-desc", 5, "desc-state", 1, "La blusa está ___.", "The blouse is ___.", "limpia", ["sucia", "limpio", "sucio"],
    "Look at the picture: is it clean or dirty? <i>Blusa</i> is a la-word.", "A clean blouse: <b>limpia</b>. <i>Blusa</i> is a la-word, so -a.", W([26]), { art: cl("blusa", "verde", "limpia") });
  Q("s3-clothes-desc", 6, "desc-letter", 1, "Escribo una carta a la Sra. Sonia. Empiezo: «___ Sra. Sonia:»", "I write a letter to Mrs. Sonia. I start: “___ Mrs. Sonia:”", "Estimada", ["Estimado", "Atentamente", "Adiós"],
    "Sonia is a woman, so the word ends in -a.", "<b>Estimada</b> (Dear, to a woman) starts the letter. <i>Estimado</i> is for a man.", W([27]));
  Q("s3-clothes-desc", 7, "desc-letter", 1, "Al final de la carta escribo «___» y luego mi nombre.", "At the end of the letter I write “___” and then my name.", "Atentamente", ["Estimada", "Estimado", "Hola"],
    "It means “Sincerely”.", "<b>Atentamente</b> (Sincerely) ends a letter. <i>Estimado/Estimada</i> start it.", W([27]));
  Q("s3-clothes-desc", 8, "desc-formal", 1, "Voy al mercado a comprar comida. Llevo ropa ___.", "I go to the market to buy food. I wear ___ clothes.", "informal", ["elegante", "elegantes", "informales"],
    "The market is an everyday place, not a fancy one. <i>Ropa</i> is singular.", "For everyday places we wear <b>ropa informal</b> (casual). <i>Ropa</i> is singular, so <b>informal</b>.", W([27]));
  Q("s3-clothes-desc", 9, "desc-formal", 2, "¿Cuál es ropa elegante?", "Which one is dressy clothing?", "", [],
    "Which one could you wear to a fancy event?", "<b>El traje</b> is <b>ropa elegante</b>. Shorts and T-shirts are ropa informal.", W([26]),
    { pics: [cl("traje", "negro"), cl("pantalon-corto", "amarillo"), cl("camiseta", "anaranjado", "sucia"), cl("camiseta", "verde")] });

  /* ---------- s4-estar ---------- */
  function E(n, family, diff, prompt, promptEn, correct, wrongs, hint, explain, src, o) {
    return Q("s4-estar", n, family, diff, prompt, promptEn, correct, wrongs, hint, explain, src || W([29]), o);
  }
  var H_P = "Find the subject. Is it I, you, one person, we, or they?";
  var H_G = "Count the people. Is the speaker one of them (we), or are they other people (they)?";
  E(1, "estar-yo", 1, "Yo ___ en la farmacia.", "I ___ at the pharmacy.", "estoy", ["estás", "está", "estamos"], H_P, "<b>Yo</b> (I) → <b>estoy</b>.", W([29]), { art: pl("farmacia") });
  E(2, "estar-yo", 2, "Soy Ana. Yo ___ en el parque.", "I am Ana. I ___ at the park.", "estoy", ["está", "estás", "están"], "Who is talking? Look at the pronoun right before the blank.", "The subject is <b>yo</b> (I), even though the name is Ana → <b>estoy</b>.", W([29]));
  E(3, "estar-yo", 1, "Yo ___ en el mercado y compro comida.", "I ___ at the market and I buy food.", "estoy", ["estás", "estamos", "están"], H_P, "<b>Yo</b> (I) → <b>estoy</b>.", W([29, 30]), { art: pl("mercado") });
  E(4, "estar-yo", 2, "—¿Dónde estás? —Yo ___ en el hotel.", "“Where are you?” “I ___ at the hotel.”", "estoy", ["estás", "está", "estamos"], "The answer is about the person who answers: I.", "The person answering says <b>yo</b> (I) → <b>estoy</b>.", W([29]));
  E(5, "estar-yo", 1, "Hoy yo ___ en el centro comercial.", "Today I ___ at the mall.", "estoy", ["está", "están", "estás"], H_P, "<b>Yo</b> (I) → <b>estoy</b>.", W([29]), { art: pl("centro-comercial") });
  E(6, "estar-yo", 1, "Yo ___ lejos de la estación de ferrocarril.", "I ___ far from the train station.", "estoy", ["está", "estamos", "estás"], H_P, "<b>Yo</b> (I) → <b>estoy</b>.", W([29]));
  E(7, "estar-tu", 1, "Tú ___ en la tienda.", "You ___ at the store.", "estás", ["estoy", "está", "estamos"], H_P, "<b>Tú</b> (you) → <b>estás</b>. It has an accent mark.", W([29]), { art: pl("tienda") });
  E(8, "estar-tu", 1, "Papá, tú ___ en el apartamento.", "Dad, you ___ in the apartment.", "estás", ["estoy", "está", "están"], "“Papá” is who we talk TO. Who is that?", "We talk to Dad, so it is <b>tú</b> (you) → <b>estás</b>.", W([29]));
  E(9, "estar-tu", 2, "—¿Dónde ___ tú? —Yo estoy en el parque.", "“Where are you?” “I am at the park.”", "estás", ["estoy", "está", "están"], "The pronoun in the question is right after the blank.", "The question says <b>tú</b> (you) → <b>estás</b>.", W([29]));
  E(10, "estar-tu", 1, "Tú ___ lejos de la farmacia.", "You ___ far from the pharmacy.", "estás", ["está", "estamos", "están"], H_P, "<b>Tú</b> (you) → <b>estás</b>.", W([29]));
  E(11, "estar-tu", 2, "Hola, Laura. ¿Tú ___ en la estación de ferrocarril?", "Hi, Laura. Are you at the train station?", "estás", ["estoy", "está", "estamos"], "Laura is the person we talk TO: you.", "We speak to Laura, with <b>tú</b> (you) → <b>estás</b>.", W([29]));
  E(12, "estar-tu", 1, "Tú compras pan. Tú ___ en la panadería.", "You buy bread. You ___ at the bakery.", "estás", ["estoy", "está", "estamos"], H_P, "<b>Tú</b> (you) → <b>estás</b>.", W([29]), { art: pl("panaderia") });
  E(13, "estar-el", 1, "Ana ___ en el hotel.", "Ana ___ at the hotel.", "está", ["estoy", "estás", "están"], "A name is one other person. Which pronoun could replace Ana?", "<b>Ana</b> = <b>ella</b> (she) → <b>está</b>.", W([29]));
  E(14, "estar-el", 1, "Jaime ___ en el hospital.", "Jaime ___ at the hospital.", "está", ["estás", "estamos", "están"], "A name is one other person. Which pronoun could replace Jaime?", "<b>Jaime</b> = <b>él</b> (he) → <b>está</b>.", W([29]), { art: pl("hospital") });
  E(15, "estar-el", 1, "La Sra. Sonia ___ en la tienda.", "Mrs. Sonia ___ at the store.", "está", ["estoy", "estás", "estamos"], "One person, not I and not you.", "<b>La Sra. Sonia</b> = <b>ella</b> (she) → <b>está</b>.", W([29, 27]));
  E(16, "estar-el", 1, "El panadero ___ en la panadería.", "The baker ___ at the bakery.", "está", ["estoy", "estamos", "están"], "How many bakers? One.", "<b>El panadero</b> = <b>él</b> (he) → <b>está</b>.", W([29, 30]), { art: { kind: "worker", id: "panadero" } });
  E(17, "estar-el", 1, "Ella ___ lejos de la farmacia.", "She ___ far from the pharmacy.", "está", ["estás", "estamos", "están"], H_P, "<b>Ella</b> (she) → <b>está</b>.", W([29]));
  E(18, "estar-el", 2, "Señor Gómez, usted ___ en el teatro.", "Mr. Gómez, you ___ at the theater.", "está", ["estás", "estamos", "están"], "<i>Usted</i> is the polite way to say “you” to one person.", "<b>Usted</b> (polite you, one person) works like él/ella → <b>está</b>.", X("usted (polite you) is not in the workbook pages"));
  E(19, "estar-el", 1, "Óscar ___ cerca del parque.", "Óscar ___ near the park.", "está", ["estoy", "estás", "están"], "A name is one other person.", "<b>Óscar</b> = <b>él</b> (he) → <b>está</b>.", W([27, 29]));
  E(20, "estar-nosotros", 1, "Nosotros ___ en el centro comercial.", "We ___ at the mall.", "estamos", ["estoy", "estás", "están"], H_P, "<b>Nosotros</b> (we) → <b>estamos</b>.", W([29]), { art: pl("centro-comercial") });
  E(21, "estar-nosotros", 2, "Mi familia y yo ___ en el parque.", "My family and I ___ at the park.", "estamos", ["están", "está", "estoy"], H_G, "<b>Mi familia y yo</b> includes me, so it is <b>nosotros</b> (we) → <b>estamos</b>.", W([29]));
  E(22, "estar-nosotros", 3, "Tú y yo ___ en la panadería.", "You and I ___ at the bakery.", "estamos", ["estás", "están", "está"], "“You and I” together make...?", "<b>Tú y yo</b> includes me, so it is <b>nosotros</b> (we) → <b>estamos</b>. Do not pick estás just because you see <i>tú</i>.", W([29]));
  E(23, "estar-nosotros", 1, "Nosotras ___ en el mercado.", "We (girls) ___ at the market.", "estamos", ["están", "estoy", "estás"], H_P, "<b>Nosotras</b> (we, girls) → <b>estamos</b>.", X("nosotras is not in the workbook pages"));
  E(24, "estar-nosotros", 2, "Mis amigos y yo ___ en el hotel.", "My friends and I ___ at the hotel.", "estamos", ["están", "estoy", "está"], H_G, "<b>Mis amigos y yo</b> includes me, so it is <b>nosotros</b> (we) → <b>estamos</b>.", W([29]));
  E(25, "estar-nosotros", 1, "Mamá y yo ___ en la farmacia.", "Mom and I ___ at the pharmacy.", "estamos", ["están", "está", "estoy"], H_G, "<b>Mamá y yo</b> includes me, so it is <b>nosotros</b> (we) → <b>estamos</b>.", W([29]));
  E(26, "estar-ellos", 1, "Ellos ___ en el mercado.", "They ___ at the market.", "están", ["está", "estamos", "estoy"], H_P, "<b>Ellos</b> (they) → <b>están</b>.", W([29]), { art: pl("mercado") });
  E(27, "estar-ellos", 2, "Rolando y su papá ___ en la estación de ferrocarril.", "Rolando and his dad ___ at the train station.", "están", ["está", "estamos", "estás"], H_G, "<b>Rolando y su papá</b> are two other people (not me) → <b>ellos</b> → <b>están</b>.", W([29]), { art: pl("estacion") });
  E(28, "estar-ellos", 2, "Ana y Luis ___ en el teatro.", "Ana and Luis ___ at the theater.", "están", ["está", "estamos", "estoy"], "Two names joined by <i>y</i> means more than one person.", "<b>Ana y Luis</b> are two people = <b>ellos</b> → <b>están</b>.", W([29]));
  E(29, "estar-ellos", 1, "Las niñas ___ en el parque.", "The girls ___ at the park.", "están", ["está", "estás", "estamos"], "<i>Las</i> shows there is more than one.", "<b>Las niñas</b> = <b>ellas</b> (they) → <b>están</b>.", W([29]));
  E(30, "estar-ellos", 2, "Ustedes ___ en el hospital.", "You all ___ at the hospital.", "están", ["estás", "está", "estamos"], "<i>Ustedes</i> means “you” to more than one person.", "<b>Ustedes</b> (you all) works like ellos → <b>están</b>.", X("ustedes is not in the workbook pages"));
  E(31, "estar-ellos", 1, "Mis amigos ___ en la tienda.", "My friends ___ at the store.", "están", ["estamos", "está", "estoy"], "<i>Mis amigos</i> is more than one person, and I am not included.", "<b>Mis amigos</b> = <b>ellos</b> (they) → <b>están</b>.", W([29]));
  E(32, "estar-ellos", 1, "Ellas ___ en la panadería.", "They (girls) ___ at the bakery.", "están", ["está", "estamos", "estás"], H_P, "<b>Ellas</b> (they, girls) → <b>están</b>.", W([29]));
  E(33, "estar-nosotros", 2, "«Mi familia y yo» significa lo mismo que ___.", "“My family and I” means the same as ___.", "nosotros", ["ellos", "yo", "él"], H_G, "<b>Mi familia y yo</b> = <b>nosotros</b> (we). Any group that includes “yo” is nosotros.", W([29]));
  E(34, "estar-ellos", 2, "«Ana y Luis» significa lo mismo que ___.", "“Ana y Luis” means the same as ___.", "ellos", ["nosotros", "él", "ella"], "Two other people, not including me.", "<b>Ana y Luis</b> = <b>ellos</b> (they), so the verb is <b>están</b>.", W([29]));
  E(35, "estar-el", 2, "Ana ___ en la tienda. ¿Cuál palabra completa bien la oración?", "Ana is at the store. Which word completes the sentence correctly?", "está", ["esta", "estas", "estan"], "Accent marks matter in estar.", "<b>Está</b> (with the accent) means “is”. <i>Esta</i> without it means “this”.", W([29]));
  E(36, "estar-ellos", 2, "Mis amigos ___ en el parque. ¿Cuál palabra completa bien la oración?", "My friends are at the park. Which word completes the sentence correctly?", "están", ["estan", "esta", "estás"], "Accent marks matter in estar. The they-form has one.", "<b>Están</b> (with the accent) is the they-form.", W([29]));

  /* ---------- s4-workers ---------- */
  function wk(id) { return { kind: "worker", id: id }; }
  Q("s4-workers", 1, "work-sells", 1, "La vendedora vende ropa en la ___.", "The saleswoman sells clothes at the ___.", "tienda", ["panadería", "farmacia", "estación de ferrocarril"],
    "Where do people buy clothes?", "<b>La vendedora</b> sells clothes at <b>la tienda</b>.", W([30]), { art: wk("vendedora") });
  Q("s4-workers", 2, "work-sells", 1, "El panadero vende ___ en la panadería.", "The baker sells ___ at the bakery.", "pan", ["medicinas", "ropa", "libros"],
    "A baker bakes...", "<b>El panadero</b> sells <b>pan</b> (bread) at <b>la panadería</b>.", W([30]), { art: wk("panadero") });
  Q("s4-workers", 3, "work-sells", 1, "La farmacéutica vende ___ en la farmacia.", "The pharmacist sells ___ at the pharmacy.", "medicinas", ["pan", "ropa", "libros"],
    "A pharmacy is for health.", "<b>La farmacéutica</b> sells <b>medicinas</b> (medicine) at <b>la farmacia</b>.", W([30, 31]), { art: wk("farmaceutica") });
  Q("s4-workers", 4, "work-sells", 1, "El escritor escribe ___ en su apartamento.", "The writer writes ___ in his apartment.", "libros", ["pan", "ropa", "medicinas"],
    "What does a writer make?", "<b>El escritor</b> writes <b>libros</b> (books).", W([30]), { art: wk("escritor") });
  Q("s4-workers", 5, "work-sells", 1, "El vendedor vende ___ en el mercado.", "The salesman sells ___ at the market.", "comida", ["medicinas", "libros", "trenes"],
    "What do people buy at a market?", "<b>El vendedor</b> sells <b>comida</b> (food) at <b>el mercado</b>.", W([30]), { art: wk("vendedor") });
  Q("s4-workers", 6, "work-who", 1, "¿Quién vende medicinas?", "Who sells medicine?", "la farmacéutica", ["el panadero", "la vendedora", "el escritor"],
    "Think of the pharmacy.", "<b>La farmacéutica</b> sells medicine at the pharmacy.", W([30]), { art: { kind: "thing", id: "medicinas" } });
  Q("s4-workers", 7, "work-who", 1, "¿Quién escribe libros?", "Who writes books?", "el escritor", ["el panadero", "la farmacéutica", "la vendedora"],
    "Think about who works with words and stories.", "<b>El escritor</b> writes books.", W([30]), { art: { kind: "thing", id: "libros" } });
  Q("s4-workers", 8, "work-who", 1, "¿Quién vende pan?", "Who sells bread?", "el panadero", ["la farmacéutica", "el escritor", "la vendedora"],
    "Think about who bakes in a bakery.", "<b>El panadero</b> sells bread at the bakery.", W([30]), { art: { kind: "thing", id: "pan" } });
  Q("s4-workers", 9, "work-sells", 1, "El panadero vende pan en ___.", "The baker sells bread at ___.", "la panadería", ["la farmacia", "el teatro", "el hospital"],
    "Where is bread sold?", "<b>El panadero</b> works in <b>la panadería</b>.", W([30]));
  Q("s4-workers", 10, "work-who", 2, "Una mujer vende medicinas en la farmacia. Ella es ___.", "A woman sells medicine at the pharmacy. She is ___.", "la farmacéutica", ["el farmacéutico", "el panadero", "el escritor"],
    "It is a woman, so use the la-word.", "A woman who sells medicine is <b>la farmacéutica</b>. A man is <i>el farmacéutico</i>.", W([30, 31]));
  Q("s4-workers", 11, "work-who", 2, "La señora vende ropa en una tienda. Ella es ___.", "The lady sells clothes at a store. She is ___.", "la vendedora", ["el vendedor", "el panadero", "la farmacéutica"],
    "She is a woman, so use the la-word.", "A woman who sells clothes is <b>la vendedora</b>. A man is <i>el vendedor</i>.", W([30]));

  /* ---------- s4-community ---------- */
  Q("s4-community", 1, "comm-need", 1, "Laura necesita medicinas. Ella va a la ___.", "Laura needs medicine. She goes to the ___.", "farmacia", ["panadería", "tienda", "estación de ferrocarril"],
    "Where is medicine sold?", "Laura needs medicine, so she goes to <b>la farmacia</b>.", W([30]), { art: pl("farmacia") });
  Q("s4-community", 2, "comm-estar", 1, "Laura compra medicinas. Ella ___ en la farmacia.", "Laura buys medicine. She ___ at the pharmacy.", "está", ["están", "estoy", "estás"],
    "Laura is one person: ella.", "<b>Laura</b> = <b>ella</b> → <b>está</b>. The pharmacy is where she buys medicine.", W([29, 30]));
  Q("s4-community", 3, "comm-need", 1, "Rolando y su papá llegan en tren. Ellos están en ___.", "Rolando and his dad arrive by train. They are at ___.", "la estación de ferrocarril", ["la farmacia", "la panadería", "el teatro"],
    "Where do trains stop?", "People who arrive by train are at <b>la estación de ferrocarril</b>.", W([30]), { art: { kind: "thing", id: "tren" } });
  Q("s4-community", 4, "comm-fix", 2, "Un amigo dice: «Compro blusas y pantalones en la farmacia.» ¿Dónde debe comprar la ropa?", "A friend says: “I buy blouses and pants at the pharmacy.” Where should he buy the clothes?", "en la tienda", ["en la panadería", "en la estación de ferrocarril", "en el parque"],
    "Where are clothes sold?", "Clothes are sold <b>en la tienda</b>. A pharmacy sells medicine.", W([29]));
  Q("s4-community", 5, "comm-need", 1, "Quiero comprar comida y ropa en el mismo lugar. Voy al ___.", "I want to buy food and clothes in the same place. I go to the ___.", "centro comercial", ["teatro", "hospital", "hotel"],
    "Which place has many kinds of stores?", "The <b>centro comercial</b> (mall) has food and clothes.", W([29]), { art: pl("centro-comercial") });
  Q("s4-community", 6, "comm-estar", 1, "Mi familia y yo vamos al teatro. Nosotros ___ en el teatro.", "My family and I go to the theater. We ___ at the theater.", "estamos", ["están", "estoy", "está"],
    "The subject is “my family and I”.", "<b>Nosotros</b> (we) → <b>estamos</b>.", W([29]), { art: pl("teatro") });
  Q("s4-community", 7, "comm-need", 1, "Mi amigo y yo jugamos fútbol. Nosotros estamos en el ___.", "My friend and I play soccer. We are at the ___.", "parque", ["hospital", "hotel", "teatro"],
    "Where do kids play soccer?", "We play soccer at <b>el parque</b>.", W([21, 29]), { art: { kind: "thing", id: "balon" } });
  Q("s4-community", 8, "comm-fix", 2, "Laura vende pan en la farmacia. Debe vender pan en la ___.", "Laura sells bread at the pharmacy. She should sell bread at the ___.", "panadería", ["farmacia", "casa", "estación de ferrocarril"],
    "Where is bread made and sold?", "Bread is sold at <b>la panadería</b>.", W([30]));
  Q("s4-community", 9, "comm-estar", 1, "Los vendedores venden comida. Ellos ___ en el mercado.", "The sellers sell food. They ___ at the market.", "están", ["está", "estamos", "estás"],
    "More than one seller: ellos.", "<b>Los vendedores</b> = <b>ellos</b> → <b>están</b>.", W([29, 30]));
  Q("s4-community", 10, "comm-need", 1, "Necesito ropa elegante para ir al ___.", "I need dressy clothes to go to the ___.", "teatro", ["parque", "mercado", "hospital"],
    "Where do people dress up?", "We wear <b>ropa elegante</b> to <b>el teatro</b>.", W([27, 30]), { art: scene("teatro-noche") });
  Q("s4-community", 11, "comm-estar", 1, "El escritor escribe libros. Él ___ en su apartamento.", "The writer writes books. He ___ in his apartment.", "está", ["están", "estoy", "estamos"],
    "One writer: él.", "<b>El escritor</b> = <b>él</b> → <b>está</b>.", W([30]));
  Q("s4-community", 12, "comm-need", 2, "Mi hermano necesita un médico. Él va al ___.", "My brother needs a doctor. He goes to the ___.", "hospital", ["parque", "teatro", "hotel"],
    "Where do doctors work?", "Doctors work at <b>el hospital</b>.", W([30]));

  /* ---------- vocabulary (Study Sheet) ---------- */
  var VOCAB = [];
  function V(es, en, skill, art) { VOCAB.push({ es: es, en: en, week: WEEK_OF[skill], skill: skill, art: art || null }); }
  function room(id) { return { kind: "room", id: id }; }
  V("la casa", "house", "s1-house", { kind: "home", id: "casa-grande" });
  V("el hogar", "home", "s1-house", { kind: "place", id: "casa" });
  V("el apartamento", "apartment", "s1-house", { kind: "home", id: "apartamento-pequeno" });
  V("la sala", "living room", "s1-house", room("sala"));
  V("el comedor", "dining room", "s1-house", room("comedor"));
  V("la cocina", "kitchen", "s1-house", room("cocina"));
  V("el dormitorio", "bedroom", "s1-house", room("dormitorio"));
  V("el baño", "bathroom", "s1-house", room("bano"));
  V("grande", "big", "s1-house", { kind: "home", id: "casa-grande" });
  V("pequeño / pequeña", "small", "s1-house", { kind: "home", id: "casa-pequena" });
  V("el vecindario", "neighborhood", "s1-places", { kind: "map" });
  V("el hotel", "hotel", "s1-places", pl("hotel"));
  V("la farmacia", "pharmacy", "s1-places", pl("farmacia"));
  V("la panadería", "bakery", "s1-places", pl("panaderia"));
  V("el hospital", "hospital", "s1-places", pl("hospital"));
  V("el parque", "park", "s1-places", pl("parque"));
  V("la tienda", "store", "s1-places", pl("tienda"));
  V("el mercado", "market", "s1-places", pl("mercado"));
  V("el centro comercial", "mall", "s1-places", pl("centro-comercial"));
  V("el teatro", "theater", "s1-places", pl("teatro"));
  V("la estación de ferrocarril", "train station", "s1-places", pl("estacion"));
  V("a la izquierda de", "to the left of", "s1-directions", { kind: "map" });
  V("a la derecha de", "to the right of", "s1-directions", { kind: "map" });
  V("enfrente de", "across from", "s1-directions", { kind: "map" });
  V("detrás de", "behind", "s1-directions", { kind: "map" });
  V("cerca de", "near", "s1-directions", { kind: "map" });
  V("lejos de", "far from", "s1-directions", { kind: "map" });
  V("la camisa", "shirt", "s2-clothes", cl("camisa", "azul"));
  V("la camiseta", "T-shirt", "s2-clothes", cl("camiseta", "anaranjado"));
  V("la blusa", "blouse", "s2-clothes", cl("blusa", "verde"));
  V("la falda", "skirt", "s2-clothes", cl("falda", "rojo"));
  V("el pantalón", "pants", "s2-clothes", cl("pantalon", "negro"));
  V("el pantalón corto", "shorts", "s2-clothes", cl("pantalon-corto", "marron"));
  V("el pantalón largo", "long pants", "s2-clothes", cl("pantalon-largo", "blanco"));
  V("el vestido", "dress", "s2-clothes", cl("vestido", "rosado"));
  V("el traje", "suit", "s2-clothes", cl("traje", "negro"));
  V("la corbata", "tie", "s2-clothes", cl("corbata", "rojo"));
  V("la ropa", "clothes", "s2-clothes", { kind: "thing", id: "ropa" });
  V("rojo / roja", "red", "s2-colors", cl("camisa", "rojo"));
  V("amarillo / amarilla", "yellow", "s2-colors", cl("camisa", "amarillo"));
  V("negro / negra", "black", "s2-colors", cl("camisa", "negro"));
  V("blanco / blanca", "white", "s2-colors", cl("camisa", "blanco"));
  V("azul", "blue (never changes)", "s2-colors", cl("camisa", "azul"));
  V("verde", "green (never changes)", "s2-colors", cl("camisa", "verde"));
  V("marrón", "brown (never changes)", "s2-colors", cl("camisa", "marron"));
  V("anaranjado / anaranjada", "orange", "s2-colors", cl("camisa", "anaranjado"));
  V("rosado / rosada", "pink", "s2-colors", cl("camisa", "rosado"));
  V("el dinero", "money", "s2-shopping", { kind: "thing", id: "dinero" });
  V("el precio", "price", "s2-shopping", money(50, "USD"));
  V("la moneda", "coin / currency", "s2-shopping", { kind: "thing", id: "moneda" });
  V("comprar", "to buy", "s2-shopping", { kind: "thing", id: "dinero" });
  V("vender", "to sell", "s2-shopping", pl("tienda"));
  V("caro / cara", "expensive", "s2-shopping", money(1000, "USD"));
  V("barato / barata", "cheap", "s2-shopping", money(5, "USD"));
  V("los dólares ($)", "dollars (United States)", "s2-shopping", money(50, "USD"));
  V("los guaraníes (₲)", "guaraníes (Paraguay)", "s2-shopping", money(500, "PYG"));
  V("cincuenta (50)", "fifty", "s2-shopping", money(50, "USD"));
  V("cien (100)", "one hundred", "s2-shopping", money(100, "USD"));
  V("quinientos (500)", "five hundred", "s2-shopping", money(500, "PYG"));
  V("mil (1.000)", "one thousand", "s2-shopping", money(1000, "PYG"));
  V("limpiar", "to clean", "s3-cleaning", scene("alfombra-sucia"));
  V("lavar", "to wash", "s3-cleaning", scene("ropa-sucia"));
  V("secar", "to dry", "s3-cleaning", scene("piso-mojado"));
  V("cuidar", "to take care of", "s3-cleaning", scene("ropa-nueva"));
  V("el agua", "water", "s3-cleaning", tool("agua"));
  V("el jabón", "soap", "s3-cleaning", tool("jabon"));
  V("la escoba", "broom", "s3-cleaning", tool("escoba"));
  V("el trapeador", "mop", "s3-cleaning", tool("trapeador"));
  V("la aspiradora", "vacuum cleaner", "s3-cleaning", tool("aspiradora"));
  V("la alfombra", "rug / carpet", "s3-cleaning", { kind: "thing", id: "alfombra" });
  V("el piso", "floor", "s3-cleaning", { kind: "thing", id: "piso" });
  V("¡Limpia tu dormitorio!", "Clean your bedroom!", "s3-commands", scene("dormitorio-sucio"));
  V("¡Lava tu ropa!", "Wash your clothes!", "s3-commands", scene("ropa-sucia"));
  V("¡Seca el piso!", "Dry the floor!", "s3-commands", scene("piso-mojado"));
  V("¡Cuida tu ropa nueva!", "Take care of your new clothes!", "s3-commands", scene("ropa-nueva"));
  V("la ropa elegante", "dressy clothes", "s3-clothes-desc", cl("traje", "negro"));
  V("la ropa informal", "casual clothes", "s3-clothes-desc", cl("pantalon-corto", "amarillo"));
  V("limpio / limpia", "clean", "s3-clothes-desc", cl("blusa", "verde", "limpia"));
  V("sucio / sucia", "dirty", "s3-clothes-desc", cl("camiseta", "anaranjado", "sucia"));
  V("Estimado / Estimada", "Dear (man / woman)", "s3-clothes-desc", null);
  V("Atentamente", "Sincerely", "s3-clothes-desc", null);
  V("estoy", "I am", "s4-estar", { kind: "person", id: "yo" });
  V("estás", "you are", "s4-estar", { kind: "person", id: "tu" });
  V("está", "he / she is", "s4-estar", { kind: "person", id: "ella" });
  V("estamos", "we are", "s4-estar", { kind: "person", id: "nosotros" });
  V("están", "they are", "s4-estar", { kind: "person", id: "ellos" });
  V("la vendedora", "saleswoman (sells clothes)", "s4-workers", wk("vendedora"));
  V("el vendedor", "salesman (sells food)", "s4-workers", wk("vendedor"));
  V("el panadero", "baker (sells bread)", "s4-workers", wk("panadero"));
  V("el / la farmacéutico/a", "pharmacist (sells medicine)", "s4-workers", wk("farmaceutica"));
  V("el escritor", "writer (writes books)", "s4-workers", wk("escritor"));

  /* ---------- generated ESTAR questions ---------- */
  function hashStr(s) { var h = 7; for (var i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) % 1000003; return h; }
  function subjectOf(id) { return byIdIn(SUBJECTS, id); }
  function makeEstarQuestion(subjectId, placeId) {
    var s = subjectOf(subjectId), p = placeOf(placeId);
    if (!s || !p) return null;
    var h = hashStr(subjectId + "|" + placeId);
    var wrongs = ESTAR_FORMS.filter(function (f) { return f !== s.form; });
    wrongs.splice(h % wrongs.length, 1);
    var pos = (h >> 1) % 4, choices = wrongs.slice(); choices.splice(pos, 0, s.form);
    var subj = cap(s.es);
    return {
      id: "gen-estar-" + subjectId + "-" + placeId, week: 4, skill: "s4-estar", family: "estar-" + s.key, type: "mc",
      difficulty: s.id === s.key || s.id === "tu" ? 1 : 2, exam: false,
      prompt: subj + " ___ " + enPlace(placeId) + ".",
      promptEn: cap(s.en) + " ___ at the " + p.en + ".",
      art: { kind: "place", id: placeId },
      choices: choices, answer: pos,
      hint: "Find the subject. Is it I, you, one person, we, or they?",
      explain: s.rule + " So: <b>" + subj + " " + s.form + " " + enPlace(placeId) + "</b>.",
      source: { kind: "extension", note: "generated ESTAR practice" }
    };
  }

  var BY_ID = {}, BY_SKILL = {};
  QUESTIONS.forEach(function (q) { BY_ID[q.id] = q; (BY_SKILL[q.skill] = BY_SKILL[q.skill] || []).push(q); });
  function byId(id) {
    if (BY_ID[id]) return BY_ID[id];
    if (typeof id === "string" && id.indexOf("gen-estar-") === 0) {
      var rest = id.slice(10);
      for (var i = 0; i < SUBJECTS.length; i++) {
        var pre = SUBJECTS[i].id + "-";
        if (rest.indexOf(pre) === 0 && placeOf(rest.slice(pre.length))) return makeEstarQuestion(SUBJECTS[i].id, rest.slice(pre.length));
      }
    }
    return null;
  }
  function bySkill(skillId) { return (BY_SKILL[skillId] || []).slice(); }
  function qid(skill, n) { return skill + "-" + pad3(n); }

  /* ---------- missions ---------- */
  function lst() { return "<ul>" + Array.prototype.map.call(arguments, function (x) { return "<li>" + x + "</li>"; }).join("") + "</ul>"; }
  var MISSIONS = [
    {
      id: "m1", week: 1, title: "Neighborhood Explorer", titleEs: "Explorador del vecindario",
      skills: ["s1-house", "s1-places", "s1-directions"],
      learn: [
        { title: "Rooms in a home", say: "el dormitorio", art: [room("cocina"), room("dormitorio"), room("bano")],
          html: "<b>La casa</b> or <b>el hogar</b> is a home. An <b>apartamento</b> is a home in a building." +
            lst("<b>la sala</b> = living room", "<b>el comedor</b> = dining room (we eat)", "<b>la cocina</b> = kitchen (we cook)", "<b>el dormitorio</b> = bedroom (we sleep)", "<b>el baño</b> = bathroom") },
        { title: "Big or small?", say: "La cocina es muy grande.", art: [{ kind: "home", id: "casa-grande" }, { kind: "home", id: "apartamento-pequeno" }],
          html: "<b>grande</b> = big. It never changes: <i>la casa grande</i>, <i>el apartamento grande</i>.<br><b>pequeño</b> = small for el-words: <i>el apartamento pequeño</i>.<br><b>pequeña</b> = small for la-words: <i>la cocina pequeña</i>." },
        { title: "Places and what you do there", say: "la farmacia", art: [pl("farmacia"), pl("panaderia"), pl("parque"), pl("mercado")],
          html: lst("<b>la farmacia</b>: buy medicinas", "<b>la panadería</b>: buy pan", "<b>la tienda</b>: buy ropa", "<b>el mercado</b>: buy comida", "<b>el centro comercial</b>: comida y ropa", "<b>el parque</b>: jugar fútbol", "<b>la estación de ferrocarril</b>: llegar en tren", "<b>el hospital</b>, <b>el hotel</b>, <b>el teatro</b>") },
        { title: "Where is it? Six direction words", say: "a la derecha de la tienda", art: [{ kind: "map", highlight: ["farmacia"] }],
          html: lst("<b>a la izquierda de</b> = to the left of", "<b>a la derecha de</b> = to the right of", "<b>enfrente de</b> = across the street from", "<b>detrás de</b> = behind (the back row)", "<b>cerca de</b> = near", "<b>lejos de</b> = far from") +
            "<b>Use the map as you see it:</b> left and right are YOUR left and right as you look at the map." },
        { title: "del = de + el", say: "cerca del hotel", art: [pl("hotel"), pl("farmacia")],
          html: "<i>De</i> + <i>el</i> always becomes <b>del</b>.<br>El hotel → <b>cerca del hotel</b> (not “de el hotel”).<br>La farmacia → <b>cerca de la farmacia</b> (no change).<br><b>Tip:</b> el-words use <b>del</b>, la-words use <b>de la</b>." },
        { title: "Near and far", say: "El hospital está lejos del hotel.", art: [{ kind: "map", highlight: ["hotel", "hospital"] }],
          html: "<b>Cerca</b> = about one step away, even straight across the street.<br><b>Lejos</b> = at the other end of the map.<br>On our map the <b>hotel</b> and the <b>hospital</b> are lejos. The <b>hotel</b> and the <b>farmacia</b> are cerca." }
      ],
      practice: [qid("s1-house", 2), qid("s1-house", 7), qid("s1-places", 1), qid("s1-places", 5), qid("s1-places", 13), qid("s1-directions", 1), qid("s1-directions", 10), qid("s1-directions", 13)],
      activity: { type: "map", explore: true, tasks: [qid("s1-directions", 18), qid("s1-directions", 19), qid("s1-directions", 20), qid("s1-directions", 4), qid("s1-directions", 21), qid("s1-directions", 14)] }
    },
    {
      id: "m2", week: 2, title: "Clothing & Colors Challenge", titleEs: "Reto de la ropa y los colores",
      skills: ["s2-clothes", "s2-colors", "s2-shopping"],
      learn: [
        { title: "Clothes: el or la?", say: "la camisa", art: [cl("camisa", "azul"), cl("falda", "rojo"), cl("pantalon", "negro"), cl("vestido", "rosado")],
          html: lst("<b>la camisa</b> shirt, <b>la camiseta</b> T-shirt, <b>la blusa</b> blouse", "<b>la falda</b> skirt, <b>la corbata</b> tie", "<b>el pantalón</b> pants (<i>corto</i> = short, <i>largo</i> = long)", "<b>el vestido</b> dress, <b>el traje</b> suit") + "<b>La ropa</b> = clothes." },
        { title: "Colors", say: "rojo, amarillo, negro, blanco", art: [cl("camisa", "rojo"), cl("camisa", "amarillo"), cl("camisa", "negro"), cl("camisa", "blanco")],
          html: lst("<b>rojo</b> red, <b>amarillo</b> yellow, <b>negro</b> black, <b>blanco</b> white", "<b>anaranjado</b> orange, <b>rosado</b> pink", "<b>azul</b> blue, <b>verde</b> green, <b>marrón</b> brown") },
        { title: "Colors must match", say: "la camisa roja, el pantalón rojo", art: [{ kind: "outfit", items: [{ item: "camisa", color: "rojo" }, { item: "pantalon-largo", color: "rojo" }] }],
          html: "<b>Rule:</b> colors that end in <b>-o</b> (rojo, negro, blanco…) change: la-word → <b>-a</b>, el-word → <b>-o</b>.<br><i>la camisa <b>roja</b></i>, <i>la falda <b>amarilla</b></i><br><i>el pantalón <b>rojo</b></i>, <i>el vestido <b>blanco</b></i><br><b>Never change:</b> <i>azul</i>, <i>verde</i>, <i>marrón</i>. Say <i>la blusa azul</i> and <i>el pantalón azul</i>." },
        { title: "Prices and big numbers", say: "cincuenta, cien, quinientos, mil", art: [money(50, "USD"), money(100, "USD"), money(500, "PYG"), money(1000, "PYG")],
          html: lst("<b>50</b> = <b>cincuenta</b>", "<b>100</b> = <b>cien</b>", "<b>500</b> = <b>quinientos</b>", "<b>1.000</b> = <b>mil</b>") + "<b>$50</b> = <i>cincuenta dólares</i>." },
        { title: "Dollars or guaraníes?", say: "cincuenta dólares", art: [money(50, "USD"), money(500, "PYG")],
          html: lst("<b>dólares ($)</b> are the money of the United States.", "<b>guaraníes (₲)</b> are the money of Paraguay.", "<b>el dinero</b> = money, <b>el precio</b> = price, <b>la moneda</b> = coin / currency", "<b>caro</b> = expensive, <b>barato</b> = cheap", "<b>comprar</b> = to buy, <b>vender</b> = to sell") }
      ],
      practice: [qid("s2-clothes", 1), qid("s2-clothes", 6), qid("s2-colors", 1), qid("s2-colors", 4), qid("s2-colors", 8), qid("s2-shopping", 1), qid("s2-shopping", 5), qid("s2-shopping", 11)],
      activity: { type: "closet", tasks: [qid("s2-clothes", 3), qid("s2-clothes", 7), qid("s2-colors", 9), qid("s2-colors", 10), qid("s2-colors", 11), qid("s2-shopping", 1), qid("s2-shopping", 3), qid("s2-shopping", 10)] }
    },
    {
      id: "m3", week: 3, title: "Clean-Up Crew", titleEs: "El equipo de limpieza",
      skills: ["s3-cleaning", "s3-commands", "s3-clothes-desc"],
      learn: [
        { title: "Cleaning tools", say: "la escoba, el trapeador, la aspiradora", art: [tool("escoba"), tool("trapeador"), tool("aspiradora"), tool("jabon")],
          html: lst("<b>la escoba</b> (broom), <b>el agua</b> (water) and <b>el trapeador</b> (mop) clean <b>el piso</b> (floor)", "<b>la aspiradora</b> (vacuum) cleans <b>la alfombra</b> (rug)", "<b>el agua</b> and <b>el jabón</b> (soap) wash <b>la ropa</b>") },
        { title: "Four action words", say: "limpiar, lavar, secar, cuidar", art: [scene("alfombra-sucia"), scene("ropa-sucia"), scene("piso-mojado"), scene("ropa-nueva")],
          html: lst("<b>limpiar</b> = to clean", "<b>lavar</b> = to wash", "<b>secar</b> = to dry", "<b>cuidar</b> = to take care of") + "<i>Lavar la ropa</i> → agua y jabón. <i>Limpiar el piso</i> → escoba, agua, trapeador." },
        { title: "Commands", say: "¡Limpia tu dormitorio! ¡Lava tu ropa! ¡Seca el piso! ¡Cuida tu ropa nueva!", art: [scene("dormitorio-sucio"), scene("piso-mojado")],
          html: "A command tells someone to do something. You only need to recognize them:" + lst("<b>¡Limpia</b> tu dormitorio!", "<b>¡Lava</b> tu ropa!", "<b>¡Seca</b> el piso!", "<b>¡Cuida</b> tu ropa nueva!") },
        { title: "Elegant, casual, clean, dirty", say: "ropa elegante", art: [cl("traje", "negro"), cl("pantalon-corto", "amarillo"), cl("blusa", "verde", "limpia"), cl("camiseta", "anaranjado", "sucia")],
          html: lst("<b>ropa elegante</b> = dressy: <i>traje y corbata</i>, a dress. We wear it to <b>el teatro</b>.", "<b>ropa informal</b> = casual: <i>pantalón corto</i>, <i>camiseta</i>.", "<b>limpia</b> = clean, <b>sucia</b> = dirty (la-words).") },
        { title: "Writing a letter", say: "Estimada Sra. Sonia", art: [{ kind: "thing", id: "ropa" }],
          html: "<b>Estimada Sra. Sonia:</b> (Dear Mrs. Sonia)<br><i>…your message…</i><br><b>Atentamente,</b> (Sincerely)<br>Sr. Óscar<br><br><b>Estimada</b> is for a woman. <b>Estimado</b> is for a man. <b>Atentamente</b> goes at the end." }
      ],
      practice: [qid("s3-cleaning", 3), qid("s3-cleaning", 4), qid("s3-cleaning", 6), qid("s3-commands", 1), qid("s3-commands", 5), qid("s3-clothes-desc", 1), qid("s3-clothes-desc", 2), qid("s3-clothes-desc", 6)],
      activity: { type: "cleanup", tasks: [qid("s3-cleaning", 4), qid("s3-cleaning", 5), qid("s3-cleaning", 11), qid("s3-commands", 1), qid("s3-commands", 3), qid("s3-clothes-desc", 1), qid("s3-clothes-desc", 3)] }
    },
    {
      id: "m4", week: 4, title: "Community & ESTAR Lab", titleEs: "Laboratorio de la comunidad y ESTAR",
      skills: ["s4-estar", "s4-workers", "s4-community"],
      learn: [
        { title: "ESTAR: to be (where)", say: "yo estoy en la farmacia", art: [{ kind: "person", id: "yo" }, pl("farmacia")],
          html: "<b>Estar</b> tells <b>where</b> someone is.<br><i>Yo <b>estoy</b> en la farmacia.</i> (I am at the pharmacy.)<br>The ending changes with <b>who</b> is doing it." },
        { title: "The ESTAR chart", say: "estoy, estás, está, estamos, están", art: [{ kind: "person", id: "yo" }, { kind: "person", id: "tu" }, { kind: "person", id: "ella" }, { kind: "person", id: "nosotros" }, { kind: "person", id: "ellos" }],
          html: lst("<b>yo</b> → <b>estoy</b> (I am)", "<b>tú</b> → <b>estás</b> (you are)", "<b>él / ella / usted</b> → <b>está</b> (he / she is)", "<b>nosotros / nosotras</b> → <b>estamos</b> (we are)", "<b>ellos / ellas / ustedes</b> → <b>están</b> (they are)") },
        { title: "Three shortcut tips", say: "Mi familia y yo estamos en el parque.", art: [{ kind: "person", id: "nosotros" }],
          html: lst("<b>One name</b> (Ana, Jaime, la Sra. Sonia, el panadero) = él / ella → <b>está</b>.", "<b>“___ y yo”</b> (Mi familia y yo, Tú y yo) includes me = nosotros → <b>estamos</b>.", "<b>Two or more other people</b> (Ana y Luis, Rolando y su papá, las niñas) = ellos → <b>están</b>.") },
        { title: "Accents matter!", say: "estás, está, están", art: [{ kind: "person", id: "tu" }, { kind: "person", id: "el" }, { kind: "person", id: "ellos" }],
          html: "Three forms have an accent mark: <b>estás</b>, <b>está</b>, <b>están</b>.<br><b>Estoy</b> and <b>estamos</b> have none.<br>Watch out: <i>esta</i> (no accent) means “this”, not “is”." },
        { title: "Workers and where they work", say: "la farmacéutica vende medicinas en la farmacia", art: [wk("vendedora"), wk("panadero"), wk("farmaceutica"), wk("escritor")],
          html: lst("<b>la vendedora</b> vende <i>ropa</i> en la tienda", "<b>el panadero</b> vende <i>pan</i> en la panadería", "<b>la farmacéutica / el farmacéutico</b> vende <i>medicinas</i> en la farmacia", "<b>el vendedor</b> vende <i>comida</i> en el mercado", "<b>el escritor</b> escribe <i>libros</i> en su apartamento") },
        { title: "Put it all together", say: "Laura necesita medicinas. Ella está en la farmacia.", art: [{ kind: "person", id: "ella" }, pl("farmacia")],
          html: "<i>Laura necesita medicinas. Ella <b>está</b> en la farmacia.</i><br>1) What does she need? 2) Which place? 3) Who is the subject? Then pick the ESTAR form.<br><br><b>Fix the place:</b> blusas y pantalones → <i>la tienda</i>; pan → <i>la panadería</i>; llegar en tren → <i>la estación de ferrocarril</i>; comida y ropa → <i>el centro comercial</i>." }
      ],
      practice: [qid("s4-estar", 1), qid("s4-estar", 13), qid("s4-estar", 20), qid("s4-estar", 26), qid("s4-workers", 1), qid("s4-workers", 3), qid("s4-community", 1), qid("s4-community", 6)],
      activity: {
        type: "estar-lab",
        rounds: [
          { place: "panaderia", subjects: ["el", "nosotros", "yo", "ellos", "tu"] },
          { place: "mercado", subjects: ["ella", "mi-familia-y-yo", "tu", "rolando-y-su-papa", "yo"] },
          { place: "farmacia", subjects: ["sonia", "tu-y-yo", "tu", "mis-amigos", "yo"] }
        ],
        tasks: [qid("s4-workers", 6), qid("s4-workers", 10), qid("s4-community", 4), qid("s4-community", 8), qid("s4-community", 3), qid("s4-community", 9)]
      }
    }
  ];

  /* "I need X — where do I go?" items must make the student retrieve the place: never show the answer's
     own building as the picture. (Picture-naming items such as "¿Qué lugar es?" keep theirs.) */
  QUESTIONS.forEach(function (q) {
    if (q.family === "places-need" && q.art && q.art.kind === "place") delete q.art;
  });

  var DATA = {
    META: META, WEEKS: WEEKS, SKILLS: SKILLS, AREAS: AREAS, EXAM: EXAM, TOPICS: TOPICS,
    ESTAR: ESTAR, ESTAR_FORMS: ESTAR_FORMS, SUBJECTS: SUBJECTS, COLORS: COLORS, CLOTHING: CLOTHING, PLACES: PLACES, WORKERS: WORKERS, VOCAB: VOCAB,
    withArticle: withArticle, dePlace: dePlace, enPlace: enPlace, colorFor: colorFor,
    MAP: MAP, distance: distance, satisfies: satisfies, relPhrase: relPhrase,
    QUESTIONS: QUESTIONS, makeEstarQuestion: makeEstarQuestion, byId: byId, bySkill: bySkill, MISSIONS: MISSIONS
  };
  if (typeof module !== "undefined" && module.exports) module.exports = DATA; else root.SpanishUnit2Data = DATA;
})(typeof window !== "undefined" ? window : this);

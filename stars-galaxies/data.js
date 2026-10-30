/* Cosmic Quest (Stars & Galaxies): all learning content in one place.
   Built from the Lesson 3 pages and the Unit 3 Benchmark Review. Chapter facts carry their page in the src field;
   facts that come from outside the chapter pages are marked "extra context".
   Questions never mention page numbers or the book: only src strings and the open-book tasks do. */
(function () {
  "use strict";

  /* ---------- helpers (keep the content below short and readable) ---------- */
  var IDS = "abcd";

  /* ch(["*right answer", "wrong", ...]) -> text options; the "*" marks the correct one */
  function ch(list) {
    var out = [], i, t, ok;
    for (i = 0; i < list.length; i += 1) {
      ok = list[i].charAt(0) === "*";
      t = ok ? list[i].slice(1) : list[i];
      out.push(ok ? { id: IDS.charAt(i), t: t, ok: true } : { id: IDS.charAt(i), t: t });
    }
    return out;
  }
  /* pc([[spec, text, true?], ...]) -> picture options */
  function pc(list) {
    var out = [], i, o;
    for (i = 0; i < list.length; i += 1) {
      o = { id: IDS.charAt(i), t: list[i][1], art: list[i][0] };
      if (list[i][2]) { o.ok = true; }
      out.push(o);
    }
    return out;
  }
  /* hs([[starId, text, true?], ...]) -> hotspot options (ids match the chart) */
  function hs(list) {
    var out = [], i, o;
    for (i = 0; i < list.length; i += 1) {
      o = { id: list[i][0], t: list[i][1] };
      if (list[i][2]) { o.ok = true; }
      out.push(o);
    }
    return out;
  }
  function hr(set, label, tap, hl) {
    var s = { name: "hr", set: set };
    if (label) { s.label = label; }
    if (tap) { s.tap = tap; }
    if (hl) { s.hl = hl; }
    return s;
  }
  function dens(kind) { return { name: "density", kind: kind }; }
  function twins(color, a, b, meter) { return { name: "twins", color: color, sizes: [a, b], meter: !!meter }; }
  function orbit(kind, label) { return { name: "comet-orbit", kind: kind, label: label }; }

  var QS = [];
  /* add(id, obj, kind, topic, text, options, hint, why, src, extras) */
  function add(id, obj, kind, topic, text, options, hint, why, src, x) {
    var q = { id: id, obj: obj, kind: kind, topic: topic, text: text, options: options, hint: hint, why: why, src: src };
    var k;
    if (x) { for (k in x) { if (x.hasOwnProperty(k)) { q[k] = x[k]; } } }
    QS.push(q);
  }
  /* sup(id, topic, text, options, hint, why, src, art) : a support question (obj 0) */
  function sup(id, topic, text, options, hint, why, src, art) {
    add(id, 0, "support", topic, text, options, hint, why, src, art ? { art: art } : null);
  }
  var BM = "Benchmark-style";

  /* ---------- objectives ---------- */
  var OBJECTIVES = [
    { n: 1, key: "solar-system", title: "Solar system words", skill: "vocab", bench: "p.151 Q1", source: "extra", note: "star + planets and other objects orbiting it" },
    { n: 2, key: "asteroid", title: "Asteroid words", skill: "vocab", bench: "p.151 Q2", source: "extra", note: "chunk of rock or iron orbiting the Sun" },
    { n: 3, key: "star", title: "Star words", skill: "vocab", bench: "p.151 Q3", source: "chapter", note: "ball of hot glowing gas, makes its own heat and light (p.138)" },
    { n: 4, key: "galaxy", title: "Galaxy words", skill: "vocab", bench: "p.151 Q4", source: "chapter", note: "group of billions of stars held by gravity, sorted by shape (p.141)" },
    { n: 5, key: "comet-picture", title: "Name that comet", skill: "diagram", bench: "p.151 Q5", source: "extra", note: "picture of a comet with a tail" },
    { n: 6, key: "models", title: "Why use models?", skill: "model", bench: "p.151 Q6", source: "extra", note: "models describe how things work" },
    { n: 7, key: "solar-system-diagram", title: "Spot the solar system", skill: "diagram", bench: "p.151 Q7", source: "extra", note: "star with planets on orbits = solar system" },
    { n: 8, key: "galaxy-contents", title: "What is in a galaxy?", skill: "concept", bench: "p.152 Q8", source: "chapter", note: "stars make up most of what we see (p.141, p.144)" },
    { n: 9, key: "star-chart-brightness", title: "Read the star chart", skill: "diagram", bench: "p.152 Q9", source: "chapter", note: "brightness = light produced; highest on chart = most light (p.139)" },
    { n: 10, key: "elliptical-density", title: "Inside elliptical galaxies", skill: "concept", bench: "p.152 Q10", source: "chapter", note: "brightest and most crowded at center, thinning outward (p.142)" },
    { n: 11, key: "same-color-stars", title: "Same-color stars", skill: "scenario", bench: "p.152 Q11", source: "chapter", note: "same color = same temperature; larger gives off more light (p.139)" },
    { n: 12, key: "orbit-length", title: "Long and short orbits", skill: "concept", bench: "p.153 Q12", source: "extra", note: "outer planets take longer to orbit the Sun" },
    { n: 13, key: "orbit-diagram-comet", title: "Orbit picture detective", skill: "diagram", bench: "p.153 Q13", source: "extra", note: "long stretched orbit crossing Earth's = comet" },
    { n: 14, key: "planet-clues", title: "Planet clues", skill: "scenario", bench: "p.153 Q14", source: "extra", note: "size + atmosphere + density point to a planet" },
    { n: 15, key: "milky-way-sky", title: "Milky Way in the sky", skill: "concept", bench: "p.153 Q15", source: "chapter", note: "faint band of clouds among the stars (p.141)" }
  ];

  var TOPICS = {
    starlight: { title: "Stars and telescopes" },
    starbirth: { title: "How stars are born" },
    starcolor: { title: "Star colors" },
    starsize: { title: "Star sizes and light" },
    hrchart: { title: "The star chart" },
    galaxy: { title: "What galaxies are" },
    galtypes: { title: "Galaxy shapes" },
    milkyway: { title: "Our Milky Way" },
    collisions: { title: "Galaxy crashes" },
    solarsys: { title: "Our solar system" },
    smallbodies: { title: "Asteroids and comets" },
    models: { title: "Models" },
    orbits: { title: "Orbits" },
    planets: { title: "Planet clues" }
  };

  /* ---------- lessons ---------- */
  var LESSONS = {
    starlook: {
      id: "starlook", title: "Stars Are Not Tiny", art: "sun-distance",
      text: ["Astronomy is the study of objects in space. Astronomers use many kinds of telescopes to look at stars and planets.",
        "A star is a huge ball of hot, glowing gas. It makes its own heat and light.",
        "Stars look like tiny dots because they are far away. The Sun looks big because it is much closer."],
      tip: "Telescope math: a small telescope magnifies 150 times and a big one 3,300 times, so the big one magnifies 22 times as much.", src: "p.138"
    },
    starbirth: {
      id: "starbirth", title: "A Star Is Born", art: "starbirth",
      text: ["Space has gas and dust. Gravity pulls the gas and dust together, and it is squeezed under great pressure.",
        "At last, energy inside is let out as heat and light. A star is born!",
        "A nebula is a giant cloud of gas and dust, a place where stars can form."],
      tip: "Gravity is the puller that starts every star.", src: "p.137, p.139"
    },
    starcolor: {
      id: "starcolor", title: "Star Colors Tell Temperature", art: "star-colors",
      text: ["A star's color tells us its temperature. Blue stars are the hottest. Red stars are the coolest.",
        "A blue star averages about 15,000 degrees Celsius. Our Sun is a yellow star, in the middle."],
      tip: "Hot to cool: blue, white, yellow, orange, red.", src: "p.139"
    },
    starsize: {
      id: "starsize", title: "Star Size and Light", art: "star-sizes", widget: "twins",
      text: ["The Sun is a medium yellow star. White dwarfs can be planet-size. Supergiants can be over 100 times the Sun's size.",
        "Brightness is how much light a star really gives off. The largest stars are usually the brightest.",
        "Same color means same temperature. So a bigger star, with more glowing surface, gives off more light."],
      tip: "Try the slider: same color, bigger star, more light.", src: "p.139"
    },
    hr: {
      id: "hr", title: "Reading the Star Chart", art: hr("named", ["sun", "spica", "aldebaran"], null, ["sun"]),
      text: ["On this chart, hot stars are on the left and cool stars are on the right. Brighter stars are higher up.",
        "Most stars sit along a slanting line. Big, bright giants are at the top. Small white dwarfs are at the bottom left.",
        "To find which star gives off the most light, find the one highest up."],
      tip: "Brightness here means light the star really makes, not how bright it looks from Earth.", src: "p.139"
    },
    galaxy: {
      id: "galaxy", title: "What Is a Galaxy?", art: "universe",
      text: ["A galaxy is a group of billions of stars, plus gas, dust, and objects that orbit the stars. Gravity holds it together.",
        "There are billions of galaxies, far apart. The universe is everything that exists."],
      tip: "Most of what we can see in a galaxy is stars.", src: "p.140, p.141"
    },
    galtypes: {
      id: "galtypes", title: "Galaxy Shapes", art: "galaxy-gallery",
      text: ["In the 1920s, astronomer Edwin Hubble was the first to study galaxies. He sorted them by shape.",
        "Spirals look like pinwheels, with a bulge of older stars. Barred spirals have a center shaped like a long bar.",
        "Irregular galaxies have no particular shape. Elliptical galaxies are smooth balls or flattened globes."],
      tip: "Four shapes: spiral, barred spiral, elliptical, irregular.", src: "p.141, p.142"
    },
    elliptical: {
      id: "elliptical", title: "Inside an Elliptical Galaxy", art: dens("center-dense"),
      text: ["Elliptical galaxies can be perfect spheres or flattened globes. They are brightest at their center.",
        "Brightest at the center means the most stars are packed there. The crowd thins out farther from the center.",
        "Large ellipticals have old stars and too little gas or dust to form new ones."],
      tip: "Picture a crowd: packed in the middle, spread out toward the edge.", src: "p.142"
    },
    milkyway: {
      id: "milkyway", title: "Our Home Galaxy", art: { name: "milky-way-top", marker: true },
      text: ["Our Sun is one star in the Milky Way galaxy. Recent evidence says the Milky Way is a barred spiral.",
        "People once thought Earth was at the center of everything. Now we know we are not even at our galaxy's center."],
      tip: "Look for the 'You are here' marker, out from the center.", src: "p.140, p.141"
    },
    skyband: {
      id: "skyband", title: "The Milky Way at Night", art: "sky-milky-way",
      text: ["On a cloudless night you might see a faint band of clouds among the stars. That is part of the Milky Way.",
        "It is faint and hazy, not a bright pinwheel. We live inside our galaxy, so we see only part of it.",
        "Most other galaxies can be seen only with powerful telescopes."],
      tip: "Clue words: faint, band, among the stars.", src: "p.141"
    },
    collisions: {
      id: "collisions", title: "Cosmic Crashes", art: "collision-strip",
      text: ["Gravity pulls galaxies toward each other, so sometimes they collide. Single stars and planets almost never crash.",
        "Gas and dust get pressed together. That causes a starburst, the quick birth of many new stars.",
        "A collision can make a large irregular galaxy. Many irregular galaxies were once spirals or ellipticals."],
      tip: "Galaxies are always moving, toward or away from each other.", src: "p.143"
    },
    solarsys: {
      id: "solarsys", title: "A Solar System", art: "solar-system", extra: true,
      text: ["A star and all the planets and other objects that orbit it form a solar system.",
        "In ours, the star is the Sun. Planets, moons, asteroids, and comets travel around it on paths called orbits.",
        "Our solar system is a tiny part of the much larger Milky Way galaxy."],
      tip: "One star in the middle, things circling it: solar system.", src: "extra context"
    },
    asteroid: {
      id: "asteroid", title: "Asteroids", art: "asteroid", extra: true,
      text: ["An asteroid is a chunk of rock or iron that orbits the Sun. Many are lumpy and covered with craters.",
        "Asteroids are much smaller than planets. They are not stars, and they make no light of their own."],
      tip: "Asteroid: a rocky chunk going around the Sun.", src: "extra context"
    },
    comet: {
      id: "comet", title: "Comets", art: "comet", extra: true,
      text: ["A comet is a ball of ice and dust that orbits the Sun. Near the Sun it glows and grows a tail.",
        "The tail streams away from the Sun. A comet's orbit is a long, stretched oval.",
        "A thin, quick streak of light across the sky is a meteor, not a comet."],
      tip: "Comet clue: glowing head and a long tail.", src: "extra context"
    },
    models: {
      id: "models", title: "Why Scientists Use Models", art: "model-vs-real", extra: true,
      text: ["Scientists use models to represent or explain things in the natural world.",
        "A model is usually much smaller than the real thing and cannot be exactly the same. It shows how things work."],
      tip: "A model shows how something works, in a size we can handle.", src: "extra context"
    },
    orbits: {
      id: "orbits", title: "Long Trips and Short Trips", art: "orbit-race", widget: "orbit-race", extra: true,
      text: ["Every planet orbits the Sun. Planets close to the Sun have short paths and finish an orbit quickly.",
        "Planets far from the Sun have long paths and take much longer. Mercury takes 88 days. Neptune takes about 165 years."],
      tip: "Farther from the Sun means a longer trip around it.", src: "extra context"
    },
    orbitmap: {
      id: "orbitmap", title: "Reading Orbit Pictures", art: orbit("planet", "a planet"), extra: true,
      text: ["Orbit pictures give clues. A planet follows a nearly round path around the Sun.",
        "A comet follows a long, stretched oval. It swings in close to the Sun, then far out past Earth's orbit.",
        "An asteroid follows a nearly round path around the Sun. A moon circles a planet."],
      tip: "Long and stretched, crossing Earth's path: think comet.", src: "extra context"
    },
    planets: {
      id: "planets", title: "Planet Clues", art: { name: "planet-group", names: ["mercury", "mars", "jupiter", "saturn"] }, extra: true,
      text: ["Planets differ in size, atmosphere, and density. Mercury and Mars are small, rocky, and dense.",
        "Jupiter and Saturn are huge or very large. They have thick atmospheres and low density.",
        "Uranus and Neptune are large, with thick atmospheres and low density too."],
      tip: "Match all three clues: size, atmosphere, density.", src: "extra context"
    }
  };

  /* ---------- missions ---------- */
  var MISSIONS = [
    { id: "stars", title: "Star Lab", icon: "icon-star", objectives: [3, 9, 11],
      blurb: "What stars are, how they are born, and how to read their colors, sizes, and light.",
      intro: "Let's find out what stars really are.",
      steps: [{ lesson: "starlook" }, { lesson: "starbirth" }, { obj: 3 }, { topic: "starlight", n: 2 }, { lesson: "starcolor" }, { lesson: "starsize" },
        { obj: 11 }, { lesson: "hr" }, { obj: 9 }, { topic: "starcolor", n: 2 }] },
    { id: "galaxies", title: "Galaxy Explorer", icon: "icon-galaxy", objectives: [4, 8, 10, 15],
      blurb: "Galaxies, their shapes, our Milky Way, and what happens when galaxies crash.",
      intro: "Time to zoom out to billions of stars.",
      steps: [{ lesson: "galaxy" }, { obj: 4 }, { lesson: "galtypes" }, { lesson: "elliptical" }, { obj: 10 }, { obj: 8 },
        { lesson: "milkyway" }, { lesson: "skyband" }, { obj: 15 }, { lesson: "collisions" }, { topic: "collisions", n: 2 }] },
    { id: "solar", title: "Solar System Base", icon: "icon-planet", objectives: [1, 2, 5, 6, 7],
      blurb: "Solar systems, asteroids, comets, and why scientists build models.",
      intro: "Let's look at the neighborhood around our Sun.",
      steps: [{ lesson: "solarsys" }, { obj: 1 }, { obj: 7 }, { lesson: "asteroid" }, { obj: 2 }, { lesson: "comet" }, { obj: 5 },
        { topic: "smallbodies", n: 1 }, { lesson: "models" }, { obj: 6 }] },
    { id: "orbits", title: "Orbit Control", icon: "icon-orbit", objectives: [12, 13, 14],
      blurb: "How long orbits take, how to read orbit pictures, and how to match planets to clues.",
      intro: "Around and around: let's study orbits.",
      steps: [{ lesson: "orbits" }, { obj: 12 }, { lesson: "orbitmap" }, { obj: 13 }, { lesson: "planets" }, { obj: 14 },
        { topic: "orbits", n: 2 }, { topic: "planets", n: 1 }] }
  ];

  /* ====================== OBJECTIVE QUESTIONS ====================== */

  /* --- 1 solar system --- */
  add("o1-real", 1, "real", "solarsys", "Together, a star and all the planets and other objects orbiting it form a(n) ____.",
    ch(["*solar system", "galaxy", "constellation", "universe"]), "Think small: one star and the things that circle it.",
    "A star plus the planets and other objects that orbit it is a solar system. A galaxy is a huge group of billions of stars.", "p.151 Q1");
  add("o1-f1", 1, "fresh", "solarsys", "Earth, Mars, and Jupiter all travel around the Sun. The Sun and everything that orbits it is our ____.",
    ch(["*solar system", "galaxy", "comet", "nebula"]), "What do we call a star together with its orbiting family?",
    "The Sun with its planets and other orbiting objects is our solar system. A galaxy would hold billions of stars.", BM);
  add("o1-f2", 1, "fresh", "solarsys", "A far-away star has three planets circling it, like the picture. The star and its planets together are called a ____.",
    ch(["*solar system", "constellation", "galaxy", "comet"]), "Count what is in the picture: one star and some orbiters.",
    "One star with planets orbiting it is a solar system. A constellation is only a pattern of stars in the sky.", BM, { art: { name: "solar-system", n: 3 } });

  /* --- 2 asteroid --- */
  add("o2-real", 2, "real", "smallbodies", "A chunk of rock or iron that orbits the Sun is called a(n) ____.",
    ch(["*asteroid", "comet", "galaxy", "star"]), "Rock or iron, not ice and not glowing gas.",
    "An asteroid is a chunk of rock or iron going around the Sun. A comet is mostly ice and dust, and a star is a ball of glowing gas.", "p.151 Q2");
  add("o2-f1", 2, "fresh", "smallbodies", "This lumpy, cratered chunk of rock circles the Sun. What is it?",
    ch(["*asteroid", "comet", "star", "galaxy"]), "It has no tail and makes no light of its own.",
    "A lumpy rocky chunk orbiting the Sun is an asteroid. A comet would have a glowing head and a tail.", BM, { art: "asteroid" });
  add("o2-f2", 2, "fresh", "smallbodies", "Many small, rocky chunks, much smaller than planets, orbit the Sun. Each chunk is called a(n) ____.",
    ch(["*asteroid", "star", "galaxy", "solar system"]), "Small, rocky, and orbiting the Sun.",
    "Small rocky or iron chunks orbiting the Sun are asteroids. A star is a huge ball of gas, and a galaxy is billions of stars.", BM);

  /* --- 3 star --- */
  add("o3-real", 3, "real", "starlight", "A huge ball of very hot, glowing gases in space that can produce its own heat and light is called a(n) ____.",
    ch(["*star", "comet", "galaxy", "asteroid"]), "Which space object makes its own light?",
    "A star is a huge ball of hot, glowing gas that makes its own heat and light. A galaxy is a group of billions of stars.", "p.151 Q3");
  add("o3-f1", 3, "fresh", "starlight", "The Sun makes its own heat and light. What kind of object is the Sun?",
    ch(["*A star", "A planet", "A moon", "A comet"]), "Remember what makes its own light.",
    "The Sun is a star: a huge ball of hot, glowing gas. Planets and moons only shine by reflecting light.", BM);
  add("o3-f2", 3, "fresh", "starlight", "Which of these is a ball of hot, glowing gas that gives off its own light?",
    ch(["*A star", "A planet", "An asteroid", "A moon"]), "Think of the Sun and the points of light you see at night.",
    "Stars are balls of hot, glowing gas that make their own light. Planets, asteroids, and moons do not.", BM);
  add("o3-f3", 3, "fresh", "starlight", "A scientist says, \"This is a huge ball of hot, glowing gas that gives off its own heat and light.\" What is she describing?",
    ch(["*A star", "A galaxy", "A solar system", "A comet"]), "She describes one single object, not a group.",
    "One huge ball of hot, glowing gas is a star. A galaxy and a solar system are groups of objects.", BM);

  /* --- 4 galaxy --- */
  add("o4-real", 4, "real", "galaxy", "A huge group of billions of stars and their solar systems, held together by gravity and sorted by shape, is called a(n) ____.",
    ch(["*galaxy", "solar system", "star", "comet"]), "Think bigger than a solar system: billions of stars.",
    "A galaxy is a huge group of stars, gas, and dust held together by gravity, and galaxies are sorted by shape. A solar system is just one star and its orbiters.", "p.151 Q4");
  add("o4-f1", 4, "fresh", "galaxy", "The Milky Way is spiral-shaped, with billions of stars, gas, and dust held together by gravity. The Milky Way is a ____.",
    ch(["*galaxy", "solar system", "planet", "universe"]), "Gravity holds billions of stars together in this group.",
    "The Milky Way is a galaxy. The universe is everything that exists, including billions of galaxies.", BM);
  add("o4-f2", 4, "fresh", "galaxy", "Edwin Hubble sorted huge star groups by shape: spiral, elliptical, and irregular. What were these star groups?",
    ch(["*Galaxies", "Solar systems", "Comets", "Constellations"]), "These groups hold billions of stars.",
    "Hubble sorted galaxies by shape. A constellation is only a pattern people see in the stars.", BM);

  /* --- 5 comet picture --- */
  add("o5-real", 5, "real", "smallbodies", "The picture shows an example of a(n) ____.",
    ch(["*comet", "asteroid", "galaxy", "star"]), "Look for a glowing head and a long tail.",
    "A glowing head with a long tail is a comet. An asteroid is a lumpy rock with no tail.", "p.151 Q5", { art: "comet" });
  add("o5-f1", 5, "fresh", "smallbodies", "Which picture shows a comet?",
    pc([["comet", "Picture A", true], ["asteroid", "Picture B"], ["meteor", "Picture C"], ["constellation", "Picture D"]]),
    "A comet has a glowing head and a tail streaming behind it.",
    "A comet has a glowing head and a long tail. The lumpy rock is an asteroid, and the thin streak is a meteor.", BM, { type: "picture" });
  add("o5-f2", 5, "fresh", "smallbodies", "Which picture shows an asteroid?",
    pc([["comet", "Picture A"], ["asteroid", "Picture B", true], ["meteor", "Picture C"], ["galaxy-system-pic", "Picture D"]]),
    "An asteroid is a rocky chunk, not a glowing streak.",
    "An asteroid is a lumpy, cratered chunk of rock. The picture with a tail is a comet.", BM, { type: "picture" });
  add("o5-f3", 5, "fresh", "smallbodies", "A space object has a glowing head and a long tail that streams away from the Sun. It is a ____.",
    ch(["*comet", "asteroid", "galaxy", "planet"]), "Which object grows a tail near the Sun?",
    "A comet shows a glowing head and a tail pointing away from the Sun. An asteroid has no tail.", BM);

  /* --- 6 models --- */
  add("o6-real", 6, "real", "models", "Scientists use models to represent or explain things in the natural world. Why are models useful for the study of the solar system?",
    ch(["because models cannot be proven wrong", "because models are always accepted by all scientists", "because models describe the way things actually are", "*because models can be used to describe how things work"]),
    "What does a small model help you do with something huge?",
    "Models help us describe how things work. A model is not exactly the real thing, and scientists can test and improve models.", "p.151 Q6");
  add("o6-f1", 6, "fresh", "models", "A museum has a small solar system model with balls on rods. What is the best reason to build it?",
    ch(["*It shows how the solar system works in a size we can see.", "It is exactly the same size as the real solar system.", "It proves that scientists can never be wrong.", "It is the real solar system moved indoors."]),
    "Think about why a small copy can be helpful.",
    "A model shows how things work in a size we can see and handle. It is much smaller than the real thing.", BM, { art: "orrery" });
  add("o6-f2", 6, "fresh", "models", "A student says, \"The model is much smaller than the real solar system, so it is useless.\" What is the best reply?",
    ch(["*A model can be smaller and still help us understand how things work.", "A model must be the same size as the real thing to be useful.", "A model is useful only if every scientist agrees with it.", "A model is useful only if it can never be changed."]),
    "Does a useful copy need to be the same size?",
    "Models are usually smaller than the real thing, but they still show how things work.", BM, { art: "model-vs-real" });

  /* --- 7 solar system picture --- */
  add("o7-real", 7, "real", "solarsys", "The picture shows several planets orbiting a star. What type of group is the picture illustrating?",
    ch(["constellation", "*solar system", "galaxy system", "universe"]), "A star in the middle with planets going around it.",
    "A star with planets orbiting it is a solar system. A constellation is a pattern of stars, and the universe is everything that exists.", "p.151 Q7", { art: "solar-system" });
  add("o7-f1", 7, "fresh", "solarsys", "Which picture shows a solar system?",
    pc([["constellation", "Picture A"], ["galaxy-system-pic", "Picture B"], ["solar-system", "Picture C", true], ["universe", "Picture D"]]),
    "Look for one star with planets traveling around it on curved paths.",
    "One star with planets circling it on orbits is a solar system. The others show a star pattern, a fuzzy cluster of galaxies, and a great many galaxies.", BM, { type: "picture" });
  add("o7-f2", 7, "fresh", "solarsys", "Which picture shows a constellation, a pattern of stars joined by lines?",
    pc([["solar-system", "Picture A"], ["constellation", "Picture B", true], ["galaxy-system-pic", "Picture C"], ["universe", "Picture D"]]),
    "A constellation is a pattern you can draw by connecting dots.",
    "A constellation is a pattern of stars joined by lines. The picture with planets on orbits is a solar system.", BM, { type: "picture" });
  add("o7-f3", 7, "fresh", "solarsys", "This picture shows one star with eight planets traveling around it. What kind of group is this?",
    ch(["constellation", "universe", "*solar system", "galaxy"]), "One star, planets circling: what is the name of that family?",
    "A star with planets orbiting it is a solar system. A galaxy would have billions of stars.", BM, { art: { name: "solar-system", n: 8 } });

  /* --- 8 galaxy contents --- */
  add("o8-real", 8, "real", "galaxy", "Galaxies are made of many different objects. What kind of objects make up most of what we can see in a galaxy?",
    ch(["asteroids", "planets", "dust", "*stars"]), "A galaxy is a huge group of what?",
    "A galaxy is a group of billions of stars, plus gas and dust. Stars make up most of what we can see.", "p.152 Q8");
  add("o8-f1", 8, "fresh", "galaxy", "Which list shows what a galaxy is made of?",
    ch(["*Billions of stars, plus gas, dust, and objects orbiting the stars", "Only planets and moons", "One star and its planets", "Only gas and dust, with no stars"]),
    "Think of the Milky Way: how many stars does it have?",
    "A galaxy has billions of stars, gas, dust, and objects that orbit stars. One star with planets is only a solar system.", BM, { art: "galaxy-spiral" });
  add("o8-f2", 8, "fresh", "galaxy", "What keeps the stars, gas, and dust of a galaxy together?",
    ch(["*Gravity", "Wind", "Magnets", "Starlight"]), "It is the same pull that makes gas and dust form stars.",
    "Gravity holds a galaxy together, the same force that pulls gas and dust into stars.", BM);

  /* --- 9 star chart brightness --- */
  add("o9-real", 9, "real", "hrchart", "Astronomers use the word brightness to mean how much light a star produces, not how bright it looks from Earth. On the chart, which of these stars produces the most light?",
    hs([["betelgeuse", "Betelgeuse", true], ["sun", "Sun"], ["proxima", "Proxima Centauri"], ["vega", "Vega"]]),
    "High up on the chart means more light is produced.",
    "Betelgeuse is the highest of the four on the chart, so it produces the most light. The Sun, Vega, and Proxima Centauri are lower.", "p.152 Q9",
    { type: "hotspot", art: hr("named", ["betelgeuse", "sun", "proxima", "vega"], ["betelgeuse", "sun", "proxima", "vega"]) });
  add("o9-f1", 9, "fresh", "hrchart", "Tap the star that produces the LEAST light.",
    hs([["proxima", "Proxima Centauri", true], ["sun", "Sun"], ["vega", "Vega"], ["polaris", "Polaris"]]),
    "Look for the star lowest on the chart.",
    "Proxima Centauri is the lowest, so it makes the least light. Polaris and Vega are much higher.", BM,
    { type: "hotspot", art: hr("named", ["proxima", "sun", "vega", "polaris"], ["proxima", "sun", "vega", "polaris"]) });
  add("o9-f2", 9, "fresh", "hrchart", "Tap the hottest star. Remember, hot stars are on the left side of the chart.",
    hs([["spica", "Spica", true], ["sun", "Sun"], ["aldebaran", "Aldebaran"], ["polaris", "Polaris"]]),
    "Which dot is farthest to the left?",
    "Spica is farthest left, so it is the hottest of these. Aldebaran is orange and cooler.", BM,
    { type: "hotspot", art: hr("named", ["spica", "sun", "aldebaran", "polaris"], ["spica", "sun", "aldebaran", "polaris"]) });
  add("o9-f3", 9, "fresh", "hrchart", "Using the chart, which of these stars is both cool and dim?",
    ch(["*Proxima Centauri", "Spica", "Polaris", "Vega"]), "Cool means right side. Dim means low on the chart.",
    "Proxima Centauri is on the cool right side and low on the chart, so it is cool and dim. Spica and Vega are hot, and Polaris is bright.", BM,
    { art: hr("named", ["proxima", "spica", "polaris", "vega"]) });
  add("o9-f4", 9, "fresh", "hrchart", "Betelgeuse and Proxima Centauri are both red stars. Which one produces more light?",
    ch(["*Betelgeuse", "Proxima Centauri", "They produce the same amount", "The chart cannot show this"]), "Compare how high each dot is.",
    "Betelgeuse is far higher on the chart, so it makes much more light. Both are red, but Betelgeuse is a giant star.", BM,
    { art: hr("named", ["betelgeuse", "proxima"]) });

  /* --- 10 elliptical density --- */
  add("o10-real", 10, "real", "galtypes", "Some elliptical galaxies look like perfect spheres. How are the stars spread out inside this kind of galaxy?",
    pc([[dens("even"), "The stars are evenly spread through the galaxy."], [dens("center-dense"), "The center is very crowded with stars, and it thins out farther away.", true],
      [dens("ring"), "Most stars are near the outside, with dust clouds in the center."], [dens("bands"), "The stars are in bands like the arms of a spiral galaxy."]]),
    "Elliptical galaxies are brightest at the center. What does that say about the stars there?",
    "Ellipticals are brightest at the center because stars are packed most tightly there, thinning out toward the edge.", "p.152 Q10", { type: "picture" });
  add("o10-f1", 10, "fresh", "galtypes", "A round elliptical galaxy is very bright in the middle and dimmer farther out. Which dot picture matches?",
    pc([[dens("bands"), "Spiral bands"], [dens("ring"), "Empty middle"], [dens("center-dense"), "Crowded middle", true], [dens("even"), "Even spread"]]),
    "Bright in the middle means lots of stars close together there.",
    "Many stars crowded in the middle make the center bright, and fewer stars farther out make it fade.", BM, { type: "picture" });
  add("o10-f2", 10, "fresh", "galtypes", "An elliptical galaxy is brightest at its center. What does this tell us about its stars?",
    ch(["*They are packed most tightly at the center and spread out toward the edge.", "They are spread out evenly everywhere.", "There are no stars at the center.", "They are only at the outer edge."]),
    "Where is the crowd thickest?",
    "A bright center means lots of stars close together there. Farther out the stars are more spread out.", BM, { art: "galaxy-elliptical" });
  add("o10-f3", 10, "fresh", "galtypes", "In a round elliptical galaxy, where would you find the most stars packed into a small space?",
    ch(["*Near the center", "Near the outer edge", "Evenly everywhere", "In spiral arms"]), "Ellipticals have no arms. Where are they brightest?",
    "The most stars are crowded near the center, and the crowd thins farther out. Elliptical galaxies do not have spiral arms.", BM, { art: dens("center-dense") });

  /* --- 11 same-color stars --- */
  add("o11-real", 11, "real", "starsize", "There are many different colors of stars. Each picture shows two stars of the same color. Which picture and statement is correct?",
    pc([[twins("yellow", 50, 26), "The larger star must be brighter.", true], [twins("yellow", 50, 26), "The smaller star must be hotter."],
      [twins("yellow", 50, 26), "The smaller star must be closer to Earth."], [twins("yellow", 38, 38), "Stars that are the same color are usually the same size."]]),
    "Same color means same temperature. What changes between the two stars?",
    "Same color means the same temperature, so the bigger star, with more glowing surface, gives off more light. Same-color stars can be very different sizes, and size does not tell us distance.", "p.152 Q11", { type: "picture" });
  add("o11-f1", 11, "fresh", "starsize", "Here are two red stars, one large and one small. Which statement is true?",
    ch(["*The larger star gives off more light.", "The smaller star is hotter.", "Both give off the same light because they are both red.", "The smaller star must be closer to Earth."]),
    "Both are red, so their temperatures match. What is different?",
    "Red stars have about the same temperature, so the larger one has more surface to give off light.", BM, { art: twins("red", 56, 16, true) });
  add("o11-f2", 11, "fresh", "starsize", "These two blue stars are the same color. Which one gives off more light?",
    ch(["*The larger star", "The smaller star", "Neither, they give off exactly the same light", "The one that is closer to Earth"]), "Think about how much glowing surface each star has.",
    "At the same temperature, a bigger star gives off more light. The picture says nothing about distance.", BM, { art: twins("blue", 20, 52, true) });
  add("o11-f3", 11, "fresh", "starsize", "Two stars are both blue, one large and one small. What can you say about their temperatures?",
    ch(["*Both are very hot", "The larger one is cooler", "The smaller one is hotter", "Both are cool"]), "Blue is the color of the hottest stars.",
    "A star's color tells its temperature, and blue stars are the hottest. Two blue stars are both very hot.", BM, { art: twins("blue", 52, 22) });

  /* --- 12 orbit length --- */
  add("o12-real", 12, "real", "orbits", "All the planets in the solar system orbit the Sun. What is the main difference between the orbits of the inner and outer planets?",
    ch(["The inner planets travel a greater distance than the outer planets do.", "The inner planets have almost round orbits, and the outer planets do not.", "The outer planets rotate as they orbit the Sun, and the inner planets do not.", "*The outer planets take longer to orbit the Sun than the inner planets do."]),
    "Which planets have the longer trip to make?",
    "Outer planets have much longer paths, so they take longer to go around the Sun. The inner planets travel the shorter distance.", "p.153 Q12");
  add("o12-f1", 12, "fresh", "orbits", "Look at the bars. Which planet takes the longest to go once around the Sun?",
    ch(["*Neptune", "Jupiter", "Earth", "Mercury"]), "Find the longest bar.",
    "Neptune has the longest bar: about 165 years for one trip. Mercury takes only 88 days.", BM, { art: "orbit-times" });
  add("o12-f2", 12, "fresh", "orbits", "Mercury goes around the Sun in 88 days. Earth takes one year. Neptune takes about 165 years. What pattern do you see?",
    ch(["*Planets farther from the Sun take longer to go around it", "Planets farther from the Sun go around it faster", "All planets take the same time", "Planets closer to the Sun take longer"]),
    "Compare the closest planet with the farthest planet.",
    "The farther a planet is from the Sun, the longer its trip takes: 88 days, then one year, then about 165 years.", BM);
  add("o12-f3", 12, "fresh", "orbits", "In the picture, the inner planet finishes trips quickly. Why does a planet far from the Sun take much longer to complete one orbit?",
    ch(["*Its path around the Sun is much longer", "It spins backward", "It is hotter than inner planets", "It has more moons"]), "Think about the length of the path.",
    "A far-away planet has a much longer path to travel, so one orbit takes much longer.", BM, { art: "orbit-race" });

  /* --- 13 orbit diagram --- */
  add("o13-real", 13, "real", "orbits", "The diagram shows the orbit of Earth and the orbit of Borrelly. Which type of space object is Borrelly most likely to be?",
    ch(["an asteroid", "a moon", "*a comet", "a star"]), "Look at the shape of Borrelly's path compared with Earth's.",
    "Borrelly's orbit is a long, stretched oval that crosses Earth's path, which is how a comet moves. An asteroid's orbit is nearly round.", "p.153 Q13", { art: orbit("comet", "Borrelly") });
  add("o13-f1", 13, "fresh", "orbits", "Object Vesta follows a nearly round path around the Sun, a little bigger than Earth's. What is it most likely?",
    ch(["*an asteroid", "a comet", "a moon", "a star"]), "A comet's path is long and stretched. Is this one?",
    "A nearly round path around the Sun fits an asteroid. A comet's path would be long and stretched.", BM, { art: orbit("asteroid", "Vesta") });
  add("o13-f2", 13, "fresh", "orbits", "Object X travels in a small circle around Earth. What is it most likely?",
    ch(["*a moon", "a comet", "an asteroid", "a star"]), "What circles a planet instead of the Sun?",
    "A small path around Earth belongs to a moon. Comets and asteroids travel around the Sun.", BM, { art: orbit("moon", "X") });
  add("o13-f3", 13, "fresh", "orbits", "Object Z has a very long, thin path. It swings in close to the Sun, then far out beyond Earth's orbit. What is it most likely?",
    ch(["*a comet", "a planet", "a moon", "a star"]), "Which object has a long, stretched oval path?",
    "A long, stretched path that swings close to the Sun and far away is a comet's orbit. Planets follow nearly round paths.", BM, { art: orbit("comet", "Object Z") });

  /* --- 14 planet clues --- */
  add("o14-real", 14, "real", "planets", "Ming is doing a project on planets in other solar systems. Planet Z is very large, has a thick atmosphere, and has low density. Which of these planets in our solar system is Planet Z most similar to?",
    ch(["Earth", "Mercury", "*Saturn", "Mars"]), "Match all three clues: size, atmosphere, density.",
    "Saturn is very large, with a thick atmosphere and low density. Earth, Mercury, and Mars are small or medium rocky planets with high density.", "p.153 Q14");
  add("o14-f1", 14, "fresh", "planets", "Planet R is small, dense, and rocky, with a thin atmosphere. Which of these planets is it most like?",
    ch(["*Mars", "Venus", "Earth", "Jupiter"]), "Which of these is small with a thin atmosphere?",
    "Mars is small and rocky with a thin atmosphere. Venus has a very thick atmosphere, and Jupiter is huge and gassy.", BM, { art: { name: "planet-group", names: ["mars", "venus", "earth", "jupiter"] } });
  add("o14-f2", 14, "fresh", "planets", "Planet W is medium-sized, dense, and rocky, with a very thick atmosphere. Which of these is it most like?",
    ch(["*Venus", "Mars", "Jupiter", "Saturn"]), "Dense and rocky with a very thick atmosphere.",
    "Venus is rocky and dense, with a very thick atmosphere. Mars has a thin atmosphere, and Jupiter and Saturn have low density.", BM);
  add("o14-f3", 14, "fresh", "planets", "Planet Q is huge, has a thick atmosphere of gas, and has low density. Which of these is it most like?",
    ch(["*Jupiter", "Mercury", "Mars", "Earth"]), "Which planet is huge with low density?",
    "Jupiter is huge with a thick gas atmosphere and low density. Mercury, Mars, and Earth are smaller and dense.", BM);

  /* --- 15 Milky Way in the sky --- */
  add("o15-real", 15, "real", "milkyway", "Earth is part of the Milky Way galaxy. On a clear night, how does the Milky Way look in the sky from Earth?",
    ch(["a small, very dim group of stars", "*a faint band of clouds among the stars", "a large number of stars in a broad, spiral shape", "a bright, wide band of stars that covers the whole sky"]),
    "Clue words: faint, band, among the stars.",
    "From Earth it looks like a faint band of clouds among the stars. We cannot see a spiral from inside, and it is faint, not bright or sky-filling.", "p.153 Q15", { art: "sky-milky-way" });
  add("o15-f1", 15, "fresh", "milkyway", "Which picture shows how the Milky Way looks from Earth on a dark, cloudless night?",
    pc([[{ name: "sky-milky-way", kind: "spiral" }, "A clear spiral hanging in the sky"], [{ name: "sky-milky-way", kind: "band" }, "A hazy stripe among the stars", true],
      [{ name: "sky-milky-way", kind: "dim-clump" }, "One small dim cluster"]]),
    "Look for the faint, hazy band among the stars.",
    "We see the Milky Way as a faint hazy band among the stars. We do not see a clear spiral, and it is not just a small cluster.", BM, { type: "picture" });
  add("o15-f2", 15, "fresh", "milkyway", "The Milky Way is a barred spiral galaxy, but from Earth we do not see a pinwheel. Why does it look like a faint band?",
    ch(["*We live inside the Milky Way, so we see part of it as a faint band among the stars", "It is a small cloud of gas near the Sun", "It is made of comet tails", "It is another galaxy right next to Earth"]),
    "Where are we, compared with the galaxy?",
    "Earth is inside the Milky Way, so we see part of it as a faint band among the stars. It is not a cloud near us, and it is not made of comets.", BM);
  add("o15-f3", 15, "fresh", "milkyway", "Sam says, \"I saw the Milky Way last night. It was a bright, clear pinwheel in the sky.\" What should you tell Sam?",
    ch(["*From Earth the Milky Way looks like a faint band among the stars, not a pinwheel.", "He is right, it looks like a bright pinwheel.", "He saw the Sun.", "He saw a comet."]),
    "Remember the clue words: faint and among the stars.",
    "From Earth the Milky Way is a faint band among the stars. A pinwheel shape is how it would look from far outside the galaxy.", BM);

  /* ====================== SUPPORT QUESTIONS (obj 0) ====================== */
  /* --- stars and telescopes --- */
  sup("s-astronomy", "starlight", "What is astronomy?",
    ch(["*The study of objects in space", "The study of rocks on Earth", "The study of the weather", "The study of ocean animals"]), "Think of the word astronomer.",
    "Astronomy is the study of objects in space and what they are like.", "p.138");
  sup("s-telescope-math", "starlight", "A small telescope magnifies objects 150 times. A large observatory telescope magnifies 3,300 times. How many times as great is the large telescope's magnification?",
    ch(["*22", "33", "220", "3,150"]), "Divide 3,300 by 150.", "3,300 divided by 150 is 22, so the observatory telescope magnifies 22 times as much.", "p.138", "telescope");
  sup("s-sun-bigger", "starlight", "Why does the Sun look so much larger than other stars?",
    ch(["*It is much closer to Earth", "It is the biggest star there is", "It is made of different stuff", "It is hotter than every star"]), "Think about how far away stars are.",
    "The Sun only seems larger because it is much closer. Many stars are bigger than the Sun.", "p.138", "sun-distance");
  sup("s-not-tiny", "starlight", "Stars look like tiny points of light in the night sky. Why?",
    ch(["*They are very far away", "They really are tiny", "They are small planets", "They are holes in the sky"]), "Does a faraway lamp look big?",
    "Stars are not tiny. They look tiny because they are so far away.", "p.138");
  sup("s-telescopes", "starlight", "How do astronomers look closely at stars and planets?",
    ch(["*They use many kinds of telescopes", "They use only their eyes", "They use microscopes", "They fly up to each one"]), "What tool makes far-away things look bigger?",
    "Astronomers use many types of telescopes to observe objects in space such as stars and planets.", "p.138", "telescope");

  /* --- how stars are born --- */
  sup("s-gravity", "starbirth", "What pulls gas and dust together to form a star?",
    ch(["*Gravity", "Wind", "Magnets", "Sound"]), "It is the same pull that keeps you on the ground.", "Stars form when gravity pulls gas and dust together.", "p.139", "starbirth");
  sup("s-squeeze", "starbirth", "Gas and dust are squeezed together under great pressure. At last, energy is let out as heat and light. What has happened?",
    ch(["*A star is born", "A planet has frozen", "A comet has appeared", "A galaxy has vanished"]), "What object makes its own heat and light?",
    "When the energy inside is released as heat and light, a star is born.", "p.139");
  sup("s-nebula", "starbirth", "A nebula is a giant cloud of what?",
    ch(["*Gas and dust", "Rocks and iron", "Only stars", "Only ice"]), "Remember the pink and purple cloud.", "A nebula is a giant cloud of gas and dust, a place where stars can form.", "p.137", "nebula");

  /* --- star colors --- */
  sup("s-hot-color", "starcolor", "Which color of star is the hottest?",
    ch(["*Blue", "Yellow", "Orange", "Red"]), "Think of the hottest part of a flame.", "Blue stars are the hottest, and red stars are the coolest.", "p.139", "star-colors");
  sup("s-red-cooler", "starcolor", "How does a red star's temperature compare with a blue star's?",
    ch(["*The red star is cooler", "The red star is hotter", "They are the same", "Red stars have no heat"]), "Use the color line from hot to cool.",
    "Blue stars are the hottest and red stars are cooler.", "p.139");
  sup("s-15000", "starcolor", "A blue star's average temperature is about how hot?",
    ch(["*15,000 degrees Celsius", "150 degrees Celsius", "1,500 degrees Celsius", "150,000 degrees Celsius"]), "It is a big number, but not the biggest.",
    "A blue star averages about 15,000 degrees Celsius.", "p.139", "star-colors");
  sup("s-classified", "starcolor", "Stars are sorted by their color, temperature, brightness, and ____.",
    ch(["*size", "name", "number of moons", "sound"]), "Think of the dwarfs and giants.", "Stars are classified by color, temperature, brightness, and size.", "p.139");

  /* --- star sizes and light --- */
  sup("s-sun-kind", "starsize", "What kind of star is the Sun?",
    ch(["*A medium-size yellow star", "A giant blue star", "A small red star", "A supergiant orange star"]), "It is not the biggest or the smallest.",
    "The Sun is a medium-size yellow star. Many stars are larger or hotter.", "p.139", "star-sizes");
  sup("s-supergiant", "starsize", "How big can a supergiant star be compared with the Sun?",
    ch(["*More than 100 times the size of the Sun", "About the same as the Sun", "Half the size of the Sun", "About twice the size of the Sun"]), "Supergiants are very big.",
    "A supergiant can be more than 100 times the size of the Sun.", "p.139", "star-sizes");
  sup("s-white-dwarf", "starsize", "White dwarf stars can be as small as a ____.",
    ch(["*planet", "galaxy", "solar system", "nebula"]), "They are the smallest kind of star in the picture.",
    "White dwarf stars can be as small as a planet.", "p.139", "star-sizes");
  sup("s-bright-light", "starsize", "A star's brightness is related to the amount of what that it gives off?",
    ch(["*Visible light", "Sound", "Water", "Gravity"]), "Brightness is about light.", "A star's brightness is related to the amount of visible light it gives off.", "p.139");
  sup("s-largest-bright", "starsize", "The largest stars are also usually the ____.",
    ch(["*brightest", "dimmest", "tiniest", "newest"]), "Bigger stars have more glowing surface.", "The largest stars are also usually the brightest.", "p.139");

  /* --- the star chart --- */
  sup("s-hr-left", "hrchart", "On this star chart, where are the hottest stars?",
    ch(["*On the left side", "On the right side", "At the bottom only", "In the very middle only"]), "Read the words under the chart: hot on one end, cool on the other.",
    "The chart shows hot stars on the left and cool stars on the right.", "p.139", hr("book"));
  sup("s-hr-whitedwarf", "hrchart", "Which group sits in the bottom-left of the chart, hot but dim?",
    ch(["*White dwarfs", "Supergiants", "Blue giants", "Red giants"]), "They are small stars.", "White dwarfs are small, hot, and dim, so they sit at the bottom left.", "p.139", hr("book"));

  /* --- galaxies --- */
  sup("g-universe", "galaxy", "What is the universe?",
    ch(["*Everything that exists", "Only our solar system", "Only the Milky Way", "Only the stars we can see"]), "It is the biggest thing there is.",
    "The universe is everything that exists.", "p.140", "universe");
  sup("g-billions", "galaxy", "About how many galaxies are in the universe?",
    ch(["*Billions", "Just one", "Two", "About ten"]), "The universe is huge.", "There are billions of galaxies in the universe.", "p.141");
  sup("g-far", "galaxy", "How far apart are galaxies?",
    ch(["*Separated by large distances", "Squeezed side by side", "Touching each other", "Inside one another"]), "There is lots of empty space between them.",
    "Galaxies are separated by large distances.", "p.141");
  sup("g-moving", "galaxy", "Do galaxies stand still?",
    ch(["*No, they are always moving", "Yes, they never move", "Only spiral ones move", "Only when they crash"]), "Think about why they sometimes crash.",
    "Galaxies do not stand still. They can move away from each other or toward each other.", "p.143");

  /* --- galaxy types --- */
  sup("g-hubble", "galtypes", "Who was the first to study galaxies and sort them by shape?",
    ch(["*Edwin Hubble", "Albert Einstein", "Isaac Newton", "Galileo"]), "He lived and worked in the 1920s.", "Astronomer Edwin Hubble was the first to study galaxies and classified them by shape.", "p.141", "hubble");
  sup("g-spiral", "galtypes", "Hubble called pinwheel-like groups of stars what?",
    ch(["*Spiral galaxies", "Irregular galaxies", "Elliptical galaxies", "Solar systems"]), "Think of a pinwheel's shape.", "Pinwheel-like groups of stars are spiral galaxies.", "p.141", "galaxy-spiral");
  sup("g-barred", "galtypes", "What makes a barred spiral galaxy different?",
    ch(["*Its center is shaped like a long bar", "It has no stars", "It is a perfect ball", "It has no spiral arms"]), "The name gives a clue.",
    "A barred spiral galaxy has a center shaped like a long bar, with spiral arms.", "p.141", "galaxy-barred");
  sup("g-irregular", "galtypes", "Which type of galaxy does not have any particular shape?",
    ch(["*Irregular", "Spiral", "Elliptical", "Barred spiral"]), "Its stars are scattered at random.", "Irregular galaxies do not have any particular shape.", "p.142", "galaxy-irregular");
  sup("g-elliptical-old", "galtypes", "Large elliptical galaxies are made up of old stars. What else is true about them?",
    ch(["*They have too little gas and dust to form new stars", "They have lots of gas and dust for new stars", "They have two bright spiral arms", "They have a long bar in the middle"]),
    "Think about whether new stars can still form.", "Large elliptical galaxies have old stars and too little gas or dust to form new ones.", "p.142", "galaxy-elliptical");

  /* --- Milky Way --- */
  sup("g-mw-type", "milkyway", "Recent evidence suggests the Milky Way is what type of galaxy?",
    ch(["*Barred spiral", "Elliptical", "Irregular", "A solar system"]), "It has a bar and spiral arms.", "Recent evidence suggests that the Milky Way is a barred spiral galaxy.", "p.141");
  sup("g-mw-position", "milkyway", "Where is our solar system in the Milky Way?",
    ch(["*Out from the center, not in the middle", "Exactly at the center", "Outside the galaxy", "Inside the Sun"]), "Find the marker on the picture.",
    "We are not even at the center of our own galaxy.", "p.140", "milky-way-top");

  /* --- collisions --- */
  sup("g-collide-why", "collisions", "Why do galaxies sometimes collide?",
    ch(["*Gravity pulls them toward each other", "Wind pushes them together", "They are tied with ropes", "They grow bigger and bump"]), "What force pulls things toward each other?",
    "Gravity pulls galaxies toward each other.", "p.143");
  sup("g-stars-never", "collisions", "When two galaxies collide, what almost never happens?",
    ch(["*Single stars and planets crash into each other", "Gas and dust get pressed together", "New stars form", "The galaxies change shape"]), "There is a lot of space between stars.",
    "Although galaxies may collide, single stars and planets almost never do.", "p.143");
  sup("g-starburst", "collisions", "Gas and dust get pressed together in a collision. What does this cause?",
    ch(["*A starburst, the rapid formation of many new stars", "All the stars disappear", "The galaxies stop moving", "The Sun turns blue"]), "Pressed gas and dust is how stars begin.",
    "Pressed gas and dust cause a starburst, the rapid formation of many new stars.", "p.143");
  sup("g-irregular-origin", "collisions", "Scientists believe many irregular galaxies were once spiral or elliptical galaxies that ____.",
    ch(["*were in a cosmic crash", "ran out of gravity", "turned into comets", "moved to the center of the Milky Way"]), "Think of the five pictures of crashing galaxies.",
    "A collision of galaxies can form a large, irregular galaxy.", "p.143");
  sup("g-strip", "collisions", "What do these pictures show happening?",
    ch(["*Two galaxies move together, crash, and become one big galaxy", "A galaxy turns into a star", "Two galaxies move far apart", "Stars crash and explode"]), "Follow the pictures from 1 to 5.",
    "The galaxies come closer, collide, and merge into one big, lumpy galaxy.", "p.143", "collision-strip");

  /* --- solar system and small bodies, models --- */
  sup("p-center", "solarsys", "What is at the center of our solar system?",
    ch(["*The Sun, a star", "Earth", "A comet", "A galaxy"]), "It makes its own light.", "The Sun is a star at the center of our solar system, and the planets orbit it.", "extra context");
  sup("p-comet-tail", "smallbodies", "Which way does a comet's tail point?",
    ch(["*Away from the Sun", "Toward the Sun", "Straight down", "In circles"]), "The Sun pushes material off the comet.",
    "A comet's tail streams away from the Sun.", "extra context", "comet");
  sup("p-meteor", "smallbodies", "A thin, quick streak of light across the night sky is called a ____.",
    ch(["*meteor", "galaxy", "star", "planet"]), "It lasts only a moment.", "A meteor is a quick streak of light. It is not a comet or a star.", "extra context", "meteor");
  sup("m-model", "models", "A model of the solar system is smaller than the real thing. What can it still do?",
    ch(["*Show how the solar system works", "Replace the real solar system", "Prove scientists are never wrong", "Make the planets move faster"]), "Think about why people build models.",
    "A model can show how things work, even though it is much smaller.", "extra context", "orrery");

  /* --- orbits and planets --- */
  sup("r-earth-year", "orbits", "How long does Earth take to go once around the Sun?",
    ch(["*One year", "One day", "88 days", "About 165 years"]), "That trip is how we measure a year.", "Earth takes one year to go once around the Sun.", "extra context", "orbit-times");
  sup("r-mercury", "orbits", "Mercury is the closest planet to the Sun. How long does its trip around the Sun take compared with Earth's?",
    ch(["*Shorter, about 88 days", "Longer, about 165 years", "The same, one year", "Mercury does not orbit"]), "Closer to the Sun means a shorter path.",
    "Mercury's path is short, so its orbit takes only about 88 days.", "extra context");
  sup("r-neptune", "orbits", "About how long does Neptune take to go once around the Sun?",
    ch(["*About 165 years", "About 88 days", "One year", "About 12 hours"]), "Neptune is the farthest planet.", "Neptune is far away, so one orbit takes about 165 years.", "extra context", "orbit-times");
  sup("p-biggest", "planets", "Which of these planets is the biggest?",
    ch(["*Jupiter", "Earth", "Mars", "Mercury"]), "It is a gas giant.", "Jupiter is the largest planet in our solar system.", "extra context");
  sup("p-mars-card", "planets", "This card describes Mars. Which planet is most like Mars?",
    ch(["*Mercury", "Jupiter", "Saturn", "Neptune"]), "Look for another small, dense, rocky planet.",
    "Mercury is also small and rocky. Jupiter, Saturn, and Neptune are large, with thick atmospheres and low density.", "extra context", "planet-profile:mars");
  sup("p-saturn-card", "planets", "This card describes Saturn: very large, thick atmosphere, low density. Which planet is most like Saturn?",
    ch(["*Jupiter", "Mercury", "Mars", "Earth"]), "Look for another huge gas planet.", "Jupiter is also huge with a thick atmosphere and low density.", "extra context", "planet-profile:saturn");

  /* ====================== OPEN-BOOK TASKS ====================== */
  var TASKS = [
    { id: "t137-title", page: "137", skill: "title", region: "title",
      prompt: "Open your book to page 137. Find the big white title near the top, under the words ESSENTIAL QUESTION. What is the Essential Question?",
      options: [{ id: "a", t: "What Are Stars and Galaxies?", ok: true }, { id: "b", t: "Why Do Stars Twinkle?" }, { id: "c", t: "How Do Planets Move?" }, { id: "d", t: "What Is the Sun Made Of?" }],
      find: "Big titles tell the main idea of a lesson. Look for the biggest words on the first page, right under the small label ESSENTIAL QUESTION.",
      why: "The Essential Question on page 137 is \"What Are Stars and Galaxies?\" The whole lesson answers it.", src: "p.137" },
    { id: "t137-caption", page: "137", skill: "caption", region: "caption",
      prompt: "Stay on page 137. Find the white caption beside the big purple space picture, on the right. What does it say a nebula is?",
      options: [{ id: "a", t: "A giant cloud of gas and dust", ok: true }, { id: "b", t: "A very bright young star" }, { id: "c", t: "A tool for seeing far away" }, { id: "d", t: "A tiny planet" }],
      find: "A caption is the small text next to a picture that explains it. Look right beside the photo for words that name what you see.",
      why: "The caption says a nebula, such as the pelican nebula, is a giant cloud of gas and dust.", src: "p.137" },
    { id: "t138-bold", page: "138", skill: "bold-term", region: "bold",
      prompt: "Open your book to page 138. In the right column near the top, find the word Astronomy highlighted in yellow. What is astronomy?",
      options: [{ id: "a", t: "The study of objects in space and their characteristics", ok: true }, { id: "b", t: "Scientists who study space" }, { id: "c", t: "Huge balls of hot, glowing gases" }, { id: "d", t: "A kind of telescope" }],
      find: "Highlighted or bold words are vocabulary terms. The meaning is almost always in the same sentence, right after the word.",
      why: "The sentence says astronomy is the study of objects in space and their characteristics. Astronomers are the scientists who do it.", src: "p.138" },
    { id: "t138-math", page: "138", skill: "math", region: "math",
      prompt: "Stay on page 138. Find the box named DO THE MATH in the lower left. A small telescope magnifies 150 times and a large one 3,300 times. How many times as great is the large telescope's magnification (3,300 divided by 150)?",
      options: [{ id: "a", t: "22", ok: true }, { id: "b", t: "33" }, { id: "c", t: "220" }, { id: "d", t: "3,150" }],
      find: "Math boxes are set apart with a colored border and a title. Read the numbers in the box, then work the problem.",
      why: "3,300 divided by 150 is 22, so the observatory telescope magnifies 22 times as much.", src: "p.138" },
    { id: "t139-heading", page: "139", skill: "heading", region: "heading",
      prompt: "Open your book to page 139. Find the purple heading A STAR IS BORN on the left. According to the first sentence below it, what causes gas and dust to pull together?",
      options: [{ id: "a", t: "Gravity", ok: true }, { id: "b", t: "Wind" }, { id: "c", t: "Magnets" }, { id: "d", t: "Sunlight" }],
      find: "Headings are large and colored, and they tell what the section is about. The first sentence under a heading often holds the key fact.",
      why: "The first sentence says stars form when gravity causes gas and dust particles to pull together.", src: "p.139" },
    { id: "t139-callout", page: "139", skill: "callout", region: "callout",
      prompt: "Stay on page 139. Find the rounded box at the very top right with a red triangle. How big can a supergiant star be compared with the Sun?",
      options: [{ id: "a", t: "More than 100 times the size of the Sun", ok: true }, { id: "b", t: "About twice the size of the Sun" }, { id: "c", t: "The same size as the Sun" }, { id: "d", t: "Half the size of the Sun" }],
      find: "A callout box sits apart from the main text and highlights one key idea. Look for a box with a border and a small arrow or triangle.",
      why: "The callout says a supergiant can be more than 100 times the size of the Sun.", src: "p.139" },
    { id: "t139-diagram", page: "139", skill: "diagram-label", region: "diagram",
      prompt: "Stay on page 139. Find the diagram named Super Hot and Just Hot at the lower right. Along the tall arrow on the left side, what word is written?",
      options: [{ id: "a", t: "Brightest", ok: true }, { id: "b", t: "Temperature" }, { id: "c", t: "Size" }, { id: "d", t: "Color" }],
      find: "In a diagram, labels along the arrows tell what each direction measures. Read the label next to the arrow, then look at what the arrow points toward.",
      why: "The word Brightest runs along the up arrow. The word Temperature runs along the bottom.", src: "p.139" },
    { id: "t140-callout", page: "140", skill: "callout", region: "callout",
      prompt: "Open your book to page 140. Find the oval speech bubble that says YOU ARE HERE on the big galaxy picture. According to the bubble, what is the universe?",
      options: [{ id: "a", t: "Everything that exists", ok: true }, { id: "b", t: "Only our galaxy" }, { id: "c", t: "Only the stars we can see" }, { id: "d", t: "Only our solar system" }],
      find: "Speech bubbles and callouts often define a word. Look for the highlighted word universe and read the words right after it.",
      why: "The bubble says the universe is everything that exists, and that we are not even at the center of our own galaxy.", src: "p.140" },
    { id: "t141-sentence", page: "141", skill: "sentence", region: "topleft",
      prompt: "Open your book to page 141. In the left column under FEATURES OF GALAXIES, find the sentence that begins \"On a cloudless night.\" What might you see?",
      options: [{ id: "a", t: "What looks like a faint band of clouds among the stars", ok: true }, { id: "b", t: "A bright spiral hanging in the sky" }, { id: "c", t: "One small dim group of stars" }, { id: "d", t: "A comet with a long tail" }],
      find: "When a question gives the first words of a sentence, scan the paragraph for those words and then read the full sentence.",
      why: "The sentence says that on a cloudless night you might see what looks like a faint band of clouds among the stars, which is part of our home galaxy, the Milky Way.", src: "p.141" },
    { id: "t141-types", page: "141", skill: "heading", region: "topright",
      prompt: "Stay on page 141. Find the heading TYPES OF GALAXIES in the right column. What did Edwin Hubble call the pinwheel-like groups of stars?",
      options: [{ id: "a", t: "Spiral galaxies", ok: true }, { id: "b", t: "Irregular galaxies" }, { id: "c", t: "Elliptical galaxies" }, { id: "d", t: "Barred stars" }],
      find: "Look for the big heading first. Names of things are often written in slanted type (italics) in the paragraph below.",
      why: "Hubble observed pinwheel-like groups of stars that he called spiral galaxies. Some spirals are barred, with a bar-shaped center.", src: "p.141" },
    { id: "t142-heading", page: "142", skill: "heading", region: "heading",
      prompt: "Open your book to page 142. Find the yellow heading ELLIPTICAL GALAXIES. According to the first sentence below it, elliptical galaxies are brightest at their what?",
      options: [{ id: "a", t: "Center", ok: true }, { id: "b", t: "Outer edge" }, { id: "c", t: "Arms" }, { id: "d", t: "Bar" }],
      find: "A heading names the topic, and the first sentence after it is a good place to start. This page has two yellow headings, so read the right one.",
      why: "The first sentence says elliptical galaxies are brightest at their center.", src: "p.142" },
    { id: "t143-sequence", page: "143", skill: "diagram-label", region: "diagram",
      prompt: "Open your book to page 143. Look at the five numbered pictures down the right side. How is picture 5 different from picture 1?",
      options: [{ id: "a", t: "Picture 1 shows two galaxies apart, and picture 5 shows one big merged galaxy", ok: true }, { id: "b", t: "Picture 5 shows the galaxies moving farther apart" }, { id: "c", t: "Picture 5 shows nothing but stars" }, { id: "d", t: "Picture 1 and picture 5 look the same" }],
      find: "When pictures are numbered, look at them in order from 1 to the last number. Ask what changes from one picture to the next.",
      why: "The numbers show two galaxies coming together over time and ending as one big, lumpy galaxy in picture 5.", src: "p.143" }
  ];

  window.SG_DATA = {
    objectives: OBJECTIVES,
    topics: TOPICS,
    lessons: LESSONS,
    missions: MISSIONS,
    questions: QS,
    openBook: {
      title: "Chapter Detective",
      intro: "Open your science book and be a detective. Each task tells you the page and the spot to look, then asks one question you can answer only by reading that spot.",
      tasks: TASKS
    }
  };
}());

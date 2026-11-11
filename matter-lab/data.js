/* Matter Lab content: pure data + pure functions (testable in Node). No DOM here. */
(function (root) {
  "use strict";

  /* ---------- the three states ---------- */
  var STATES = {
    solid: {
      id: "solid", label: "Solid", memory: "STAYS",
      shape: "Has its own shape (keeps it)", volume: "Has its own volume (keeps it)",
      spacing: "Very close together, in a regular pattern", motion: "Vibrate (jiggle) in place; they do not move from place to place",
      live: "Solid. The particles are packed tightly in a regular pattern and only vibrate in place. A solid keeps its own shape and volume."
    },
    liquid: {
      id: "liquid", label: "Liquid", memory: "FLOWS",
      shape: "No shape of its own: takes the shape of its container", volume: "Keeps its volume (the amount stays the same)",
      spacing: "Close together, but not in a fixed pattern", motion: "Slide past each other, so the liquid can flow",
      live: "Liquid. The particles are close together but slide past each other. The liquid sits at the bottom, takes the shape of its container, and keeps the same volume."
    },
    gas: {
      id: "gas", label: "Gas", memory: "FILLS",
      shape: "No shape of its own: takes the shape of its container", volume: "No volume of its own: spreads out to fill the whole container",
      spacing: "Very far apart", motion: "Move very fast in all directions",
      live: "Gas. The particles are far apart and move very fast in every direction. The gas fills the whole container, so it takes both the shape and the volume of the container."
    }
  };

  /* ---------- water: state from temperature (at normal, sea-level air pressure) ---------- */
  var WATER = { name: "water", meltC: 0, boilC: 100 };
  function stateAt(tempC, sub) {
    sub = sub || WATER;
    if (tempC <= sub.meltC) return "solid";
    if (tempC < sub.boilC) return "liquid";
    return "gas";
  }
  function toF(c) { return Math.round(c * 9 / 5 + 32); }
  function stateName(state) { return { solid: "Ice (solid water)", liquid: "Liquid water", gas: "Steam / water vapor (gas water)" }[state]; }

  /* ---------- state changes ---------- */
  var TRANSITIONS = {
    melting: { id: "melting", label: "Melting", from: "solid", to: "liquid", energy: "in",
      says: "A solid takes in energy and becomes a liquid.", example: "An ice cube melting on a hot day." },
    freezing: { id: "freezing", label: "Freezing", from: "liquid", to: "solid", energy: "out",
      says: "A liquid releases energy and becomes a solid.", example: "Dripping water freezing into an icicle." },
    evaporation: { id: "evaporation", label: "Evaporation", from: "liquid", to: "gas", energy: "in", where: "surface", speed: "slow",
      says: "A liquid slowly becomes a gas, only at its surface. It can happen below the boiling point.", example: "A puddle drying on a warm day." },
    boiling: { id: "boiling", label: "Boiling", from: "liquid", to: "gas", energy: "in", where: "throughout", speed: "fast",
      says: "A liquid rapidly becomes a gas all through the liquid (bubbles form inside). Water boils at 100 °C at normal (sea-level) air pressure.", example: "A pot of water boiling on the stove." },
    condensation: { id: "condensation", label: "Condensation", from: "gas", to: "liquid", energy: "out",
      says: "A gas releases energy and becomes a liquid.", example: "Dew, raindrops, or drops on a cold glass." }
  };
  var TRANSITION_ORDER = ["melting", "freezing", "evaporation", "boiling", "condensation"];

  /* In the Heat & Cool lab, a liquid that turns to gas by heating up to 100 °C is boiling. */
  function transitionBetween(fromState, toState) {
    if (fromState === toState) return null;
    if (fromState === "solid" && toState === "liquid") return TRANSITIONS.melting;
    if (fromState === "liquid" && toState === "solid") return TRANSITIONS.freezing;
    if (fromState === "liquid" && toState === "gas") return TRANSITIONS.boiling;
    if (fromState === "gas" && toState === "liquid") return TRANSITIONS.condensation;
    return null;
  }

  /* Heat lab: one tap = 10 degrees C. Range -20..120. dir: +1 add heat, -1 remove heat. */
  var LAB = { min: -20, max: 120, step: 10, start: 20, evapFromC: 30 };
  function labStep(tempC, dir) {
    var next = Math.max(LAB.min, Math.min(LAB.max, tempC + dir * LAB.step));
    var from = stateAt(tempC), to = stateAt(next);
    return { tempC: next, from: from, to: to, moved: next !== tempC, transition: transitionBetween(from, to), energy: next === tempC ? null : (dir > 0 ? "in" : "out") };
  }
  /* liquid water warmer than this shows slow evaporation at the surface */
  function isEvaporating(tempC) { return stateAt(tempC) === "liquid" && tempC >= LAB.evapFromC; }
  function labNote(tempC) {
    var s = stateAt(tempC);
    if (tempC === 0) return "At 0 °C water freezes and ice melts. Add a little more energy and the ice melts.";
    if (tempC >= 100 && s === "gas") return "Past 100 °C (at sea level) the water is a gas: steam, or water vapor. It is still water!";
    if (s === "liquid" && tempC >= 90) return "Almost 100 °C. The particles are moving fast. One more bit of heat and the water boils.";
    return "";
  }

  /* ---------- density ---------- */
  function density(mass, volume) { return Math.round(mass / volume * 100) / 100; }
  var DENSITY_ITEMS = [
    { id: "gelatin", name: "Gelatin", emoji: "🟥", mass: 75, volume: 100, color: "#ff6b8b" },
    { id: "pudding", name: "Pudding", emoji: "🟫", mass: 90, volume: 100, color: "#b9783f" },
    { id: "cream", name: "Whipped cream", emoji: "⬜", mass: 50, volume: 100, color: "#f4efe6" }
  ];
  function mostDense(items) {
    return items.reduce(function (best, it) { return density(it.mass, it.volume) > density(best.mass, best.volume) ? it : best; });
  }

  /* ---------- Matter Detective cards (physical properties and states) ---------- */
  var DETECTIVE = [
    { id: "sandpaper", icon: "📄", name: "Sandpaper", clue: "It feels rough when you rub it.", ask: "Which physical property is this?", options: ["Texture", "Odor", "Color"], answer: 0,
      fact: "Texture is how something feels. Feeling the sandpaper does not change it: observing a physical property never changes the matter." },
    { id: "onion", icon: "🧅", name: "Onion", clue: "You can smell it from across the kitchen.", ask: "Which physical property is this?", options: ["Volume", "Odor", "Temperature"], answer: 1,
      fact: "Odor is a physical property. Sniffing the onion does not turn it into something new." },
    { id: "bowls", icon: "🥣", name: "Two dog bowls", clue: "The big dog's bowl holds more food than the small dog's bowl. It takes up more space.", ask: "Which physical property is this?", options: ["Mass", "Volume", "Color"], answer: 1,
      fact: "Volume is the amount of space something takes up." },
    { id: "bowling", icon: "🎳", name: "Bowling ball and basketball", clue: "They are about the same size, but the bowling ball has more matter in it.", ask: "Which property is bigger for the bowling ball?", options: ["Mass", "Volume", "Odor"], answer: 0,
      fact: "Mass is the amount of matter in something. Same size (volume), more mass, so the bowling ball is more dense." },
    { id: "glass", icon: "🫙", name: "Melted glass", clue: "It is glowing and extremely hot. A thermometer could measure it.", ask: "Which physical property is this?", options: ["Temperature", "Texture", "Odor"], answer: 0,
      fact: "Temperature is a measure of the energy of motion of the particles in matter." },
    { id: "honey", icon: "🍯", name: "Honey", clue: "It pours, but much more slowly than water.", ask: "Which state is honey?", options: ["Solid", "Liquid", "Gas"], answer: 1,
      fact: "All liquids flow, but at different rates. Water flows much faster than honey." },
    { id: "balloon", icon: "🎈", name: "Helium balloon", clue: "Squeeze it and it gets smaller. Let go and the gas spreads out again.", ask: "Which state is the helium?", options: ["Solid", "Liquid", "Gas"], answer: 2,
      fact: "Gases can be compressed (squeezed into less space) and can expand. A gas tank holds a lot of compressed gas that can fill many balloons." },
    { id: "clay", icon: "🧱", name: "Clay", clue: "You can squish it into a new shape, but it is not flowing like water.", ask: "Which state is clay?", options: ["Solid", "Liquid", "Gas"], answer: 0,
      fact: "Some solids are soft. Clay changes shape easily but is still a solid." },
    { id: "lava", icon: "🌋", name: "Lava cooling into rock", clue: "Hot, melted rock slowly gives off energy as it cools.", ask: "What state does it end up in?", options: ["Solid", "Liquid", "Gas"], answer: 0,
      fact: "Lava is hot, melted rock. It releases energy as it cools and becomes solid rock." }
  ];

  var FACTS = [
    { q: "Does looking at a property change the matter?", a: "No. A physical property (color, texture, odor, temperature, mass, volume, state) can be observed without changing the matter into something new." },
    { q: "Do all liquids flow the same way?", a: "No. All liquids flow, but at different rates. Water flows much faster than honey." },
    { q: "Can gases be squeezed?", a: "Yes. Gases can be compressed (take up less space) and can expand (take up more space)." },
    { q: "Are all solids hard?", a: "No. Some solids are soft. Clay changes shape easily but is still a solid." },
    { q: "Is air matter? Is sunlight?", a: "Air is matter: it has mass and takes up space, even though you cannot see it. Sunlight is energy, not matter." },
    { q: "Can matter be created or destroyed?", a: "No. Matter can change form, but it is still matter." }
  ];

  var STATIONS = [
    { id: "particles", label: "Particle Explorer", minutes: 3 },
    { id: "heat", label: "Heat & Cool Lab", minutes: 3 },
    { id: "density", label: "Density Detective", minutes: 2 },
    { id: "detective", label: "Matter Detective", minutes: 3 }
  ];

  var BIG_IDEAS = [
    "Matter is anything with mass that takes up space (volume). Air is matter.",
    "SOLID = STAYS · LIQUID = FLOWS · GAS = FILLS.",
    "More energy means faster particles and a higher temperature. Less energy means slower particles.",
    "Melting, freezing, evaporation, boiling and condensation change the state, not the kind of matter. Ice, water and steam are all water.",
    "Density = mass ÷ volume. More mass in the same space means more dense.",
    "Liquids flow at different rates, gases can be compressed, and some solids are soft."
  ];

  /* ---------- small SVG particle boxes for quiz questions (deterministic, no DOM) ---------- */
  function seeded(seed) { var s = seed; return function () { s = (s * 16807) % 2147483647; return (s - 1) / 2147483646; }; }
  function boxSvg(kind, label) {
    var W = 120, H = 100, dots = [], i, r = seeded(kind === "solid" ? 11 : kind === "liquid" ? 23 : 37);
    if (kind === "solid") {
      for (var row = 0; row < 4; row++) for (var col = 0; col < 6; col++) dots.push([22 + col * 15, 40 + row * 15]);
    } else if (kind === "liquid") {
      for (i = 0; i < 24; i++) dots.push([14 + (i % 8) * 13 + (r() * 5 - 2.5), 52 + Math.floor(i / 8) * 14 + (r() * 5 - 2.5)]);
    } else {
      for (i = 0; i < 9; i++) dots.push([14 + (i % 3) * 36 + r() * 22, 12 + Math.floor(i / 3) * 26 + r() * 14]);
    }
    var circles = dots.map(function (d) { return '<circle cx="' + d[0].toFixed(1) + '" cy="' + d[1].toFixed(1) + '" r="5" fill="#0f8a7a"/>'; }).join("");
    return '<svg viewBox="0 0 ' + W + " " + H + '" width="120" height="100" role="img" aria-label="' + label + '"><title>' + label + '</title>' +
      '<rect x="3" y="3" width="114" height="94" rx="8" fill="#f4fbff" stroke="#173c6b" stroke-width="3"/>' + circles + "</svg>";
  }

  /* ---------- Part B: Science Challenge (10 fresh questions) ---------- */
  var CHALLENGE_TAGS = ["particles", "shape-volume", "properties", "state-change", "evaporation-boiling", "condensation", "energy", "compression", "flow", "matter", "density"];
  var CHALLENGE = [
    { id: "c1", type: "mc", tags: ["particles"], station: "particles",
      prompt: "Each box shows tiny particles of one kind of matter. Which box shows a SOLID?",
      choices: [
        { html: boxSvg("liquid", "Box A: particles close together but not in a pattern, sitting at the bottom") },
        { html: boxSvg("solid", "Box B: particles tightly packed in a neat, regular pattern") },
        { html: boxSvg("gas", "Box C: particles far apart, spread all over the box") }
      ], answer: 1,
      explain: "Solid particles are packed tightly in a regular pattern and just vibrate in place. Box A is a liquid (close, but sliding). Box C is a gas (far apart, moving fast)." },
    { id: "c2", type: "mc", tags: ["shape-volume"], station: "particles",
      prompt: "Juice is poured from a tall, skinny jar into a wide, flat dish. What happens to the juice?",
      choices: ["Its shape stays the same, but its volume changes", "Both its shape and its volume change", "Its volume stays the same, but its shape changes to fit the dish", "Both its shape and its volume stay the same"], answer: 2,
      explain: "A liquid keeps its volume (the same amount of juice) but takes the shape of its container, because its particles slide past each other." },
    { id: "c3", type: "tf", tags: ["flow"], station: "detective",
      prompt: "True or false: every liquid flows at exactly the same speed as water.", answer: false,
      explain: "All liquids flow, but at different rates. Water flows much faster than honey." },
    { id: "c4", type: "mc", tags: ["properties"], station: "detective",
      prompt: "A student runs a finger over a glass vase and says, “It feels smooth.” Which physical property is being observed?",
      choices: ["Texture", "Odor", "Volume", "Temperature"], answer: 0,
      explain: "Texture is how something feels. Feeling the vase does not change it. Observing a physical property never changes the matter." },
    { id: "c5", type: "match", tags: ["state-change", "energy", "evaporation-boiling"], station: "heat",
      prompt: "Match each state change to what happens.",
      pairs: [
        ["Melting", "A solid takes in energy and becomes a liquid"],
        ["Freezing", "A liquid releases energy and becomes a solid"],
        ["Evaporation", "A liquid slowly becomes a gas at its surface"],
        ["Boiling", "A liquid quickly becomes a gas, with bubbles all through it"],
        ["Condensation", "A gas releases energy and becomes a liquid"]
      ],
      explain: "Melting and freezing are solid ↔ liquid. Evaporation and boiling both make a gas from a liquid: evaporation is slow and only at the surface, boiling is fast and happens throughout. Condensation is a gas turning to liquid. Taking in energy: melting, evaporation, boiling. Releasing energy: freezing, condensation." },
    { id: "c6", type: "mc", tags: ["evaporation-boiling", "state-change"], station: "heat",
      prompt: "On a warm day a puddle slowly disappears, even though it never gets close to 100 °C. What is happening?",
      choices: ["Boiling: bubbles form all through the puddle", "Freezing: the puddle turns into ice", "Condensation: a gas turns into water", "Evaporation: water at the surface slowly changes into a gas"], answer: 3,
      explain: "Evaporation happens only at the surface and can happen below the boiling point. Boiling happens throughout the liquid, at the boiling point." },
    { id: "c7", type: "mc", tags: ["condensation", "energy"], station: "heat",
      prompt: "Water vapor in the air touches a cold glass and turns into drops of water. What is this called, and what happens to the energy?",
      choices: ["Condensation: the water vapor takes in energy", "Condensation: the water vapor releases energy", "Evaporation: the water takes in energy", "Melting: the water releases energy"], answer: 1,
      explain: "A gas that releases enough energy condenses into a liquid. Dew and raindrops form the same way." },
    { id: "c8", type: "mc", tags: ["compression", "particles"], station: "detective",
      prompt: "A tank holds a huge amount of gas squeezed into a small space. When it is opened, the gas can fill many balloons. What does this show?",
      choices: ["Gases always keep a fixed shape", "Gases cannot be squeezed", "Gases can be compressed, and they expand to fill the space they are given", "Gas particles stop moving inside a tank"], answer: 2,
      explain: "Gas particles are far apart, so a gas can be compressed into less space. When it is released it expands again." },
    { id: "c9", type: "mc", tags: ["matter"], station: "detective",
      prompt: "Which of these is NOT matter?",
      choices: ["Air inside a balloon", "Steam from a kettle", "A drop of honey", "Sunlight shining through a window"], answer: 3,
      explain: "Matter has mass and takes up space. Air and steam are gases, so they are matter, even though they are hard to see. Sunlight is energy, not matter." },
    { id: "c10", type: "short", tags: ["density"], station: "density",
      prompt: "A cup holds 100 cm³ of syrup that has a mass of 60 g. What is its density in g/cm³?",
      placeholder: "Type a number", inputmode: "decimal", hint: "Density = mass ÷ volume. Just type the number.",
      numericAnswer: 0.6, mass: 60, volume: 100, answerText: "0.6 g/cm³",
      explain: "Density = mass ÷ volume = 60 g ÷ 100 cm³ = 0.6 g/cm³." }
  ];
  /* numeric check shared by the page and the tests */
  function checkNumber(input, expected) {
    var s0 = String(input).replace(/,/g, ".");
    var div = s0.match(/(\d*\.?\d+)\s*[\/÷]\s*(\d*\.?\d+)/); // "60/100" or "60 ÷ 100" is also fine
    if (div && parseFloat(div[2]) !== 0) return Math.abs(parseFloat(div[1]) / parseFloat(div[2]) - expected) < 0.005;
    var m = s0.match(/-?\d*\.?\d+/);
    return !!m && Math.abs(parseFloat(m[0]) - expected) < 0.005;
  }
  CHALLENGE.forEach(function (q) { if (q.type === "short") q.check = function (s) { return checkNumber(s, q.numericAnswer); }; });

  var DATA = {
    STATES: STATES, WATER: WATER, stateAt: stateAt, toF: toF, stateName: stateName,
    TRANSITIONS: TRANSITIONS, TRANSITION_ORDER: TRANSITION_ORDER, transitionBetween: transitionBetween,
    LAB: LAB, labStep: labStep, isEvaporating: isEvaporating, labNote: labNote,
    density: density, DENSITY_ITEMS: DENSITY_ITEMS, mostDense: mostDense,
    DETECTIVE: DETECTIVE, FACTS: FACTS, STATIONS: STATIONS, BIG_IDEAS: BIG_IDEAS,
    boxSvg: boxSvg, CHALLENGE: CHALLENGE, CHALLENGE_TAGS: CHALLENGE_TAGS, checkNumber: checkNumber
  };
  if (typeof module !== "undefined" && module.exports) module.exports = DATA; else root.MatterLabData = DATA;
})(typeof window !== "undefined" ? window : this);

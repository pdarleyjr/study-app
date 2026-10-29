/* European Exploration Quest: all the learning content in one place.
   Built from the school handouts (photos IMG_7305 to IMG_7311). Every lesson and question carries
   the photo it came from in `src`. To add another worksheet, add lessons, questions, and missions here.
   Where a handout line was simplified or doubtful, it is reworded on purpose (see README notes). */
(function () {
  "use strict";

  var SOURCES = {
    IMG_7305: "European Explorers, Unit 1 L.5 (explorers 1-7)",
    IMG_7306: "European Explorers, Unit 1 L.5 (explorers 8-9)",
    IMG_7307: "Unit 4 L.4: How and Why Europeans Came to the Americas",
    IMG_7308: "Astrolabe, directions (compass), maps",
    IMG_7309: "Claimed lands, religious beliefs, wealth",
    IMG_7310: "Precious metals, new foods, cash crops",
    IMG_7311: "Tobacco as a cash crop (continued)"
  };

  var TOPICS = {
    why: { label: "Why Europeans sailed", icon: "⛵" },
    tools: { label: "Astrolabe & compass", icon: "🧭" },
    maps: { label: "Maps & charts", icon: "🗺️" },
    motives: { label: "Land, faith & power", icon: "🚩" },
    metals: { label: "Gold & silver", icon: "🪙" },
    foods: { label: "New foods", icon: "🌽" },
    tobacco: { label: "Tobacco & cash crops", icon: "🌿" },
    explorers: { label: "The explorers", icon: "🧑‍✈️" }
  };

  /* ---------- Micro-lessons: one or two sentences, a picture, a concrete example ---------- */
  var LESSONS = {
    people: {
      title: "People Were Already Here", art: "people", src: "IMG_7307",
      text: "Native Americans had already lived in the Americas for thousands of years. Vikings had reached the Americas long before, too, but they never built permanent settlements.",
      example: "So in 1492 the Americas were new to Europeans, but not new to the people who lived there."
    },
    trade: {
      title: "Why Sail West?", art: "trade", src: "IMG_7307",
      text: "The Age of Exploration began in the late 1400s. In the late 1400s and 1500s, Europeans sailed across the Atlantic looking for new trade routes to Asia. They wanted spices and silks.",
      example: "Picture a shortcut to a faraway market full of spices for food and silk for fancy clothes."
    },
    columbus: {
      title: "Columbus Sets Sail", art: "columbus", src: "IMG_7307",
      text: "In 1492, Christopher Columbus sailed west searching for Asia. Instead he reached the Americas, land that Europeans did not know about. King Ferdinand and Queen Isabella of Spain paid for his trip.",
      example: "He aimed for Asia and found a world that was new to Europeans."
    },
    wrecks: {
      title: "Clues from Sunken Ships", art: "wreck", src: "IMG_7307",
      text: "Scientists today study sunken ships from centuries ago to learn about European exploration. Some ships sank, and modern scientists use sonar and grid systems to study the wrecks and the artifacts inside.",
      example: "Sonar bounces sound off the sea floor, so scientists can find a wreck they cannot see."
    },
    tools: {
      title: "Tools for the Open Sea", art: "tools", src: "IMG_7307",
      text: "The open sea has no landmarks, so sailors used tools. An astrolabe measured the angle of the sun or stars to find latitude, and a compass needle always points north.",
      example: "Latitude means how far north or south of the equator a ship is."
    },
    rulers: {
      title: "Flags, Land & Power", art: "flags", src: "IMG_7309",
      text: "European rulers wanted more power in the Americas, so they paid for explorers who carried flags for their countries. Planting a flag on new land meant claiming it for that country.",
      example: "Spanish flags showed a cross and the letters F and Y, for Ferdinand and Ysabel (Isabella). But people already lived on that land."
    },
    faith: {
      title: "A Mission of Faith", art: "faith", src: "IMG_7309",
      text: "Christianity began in the Middle East and spread through Europe under the Roman Empire. By the 1500s, European explorers were Christians, mostly Catholic or Protestant.",
      example: "Many carried Bibles, and Catholic rulers sent priests and armies to convert native peoples to Christianity. Spreading religion was part of their mission, but native peoples already had their own beliefs."
    },
    metals: {
      title: "Gold & Silver", art: "metals", src: "IMG_7310",
      text: "Explorers hoped to find precious metals. Europeans measured wealth in gold and silver, and Spain wanted more after costly wars.",
      example: "Spanish explorers found gold and silver in Mexico and South America and enslaved native peoples to mine it. It was made into bars, coins, and jewelry and shipped to Spain. Forcing people into slavery was cruel and unfair."
    },
    foods: {
      title: "Foods That Crossed the Ocean", art: "foods", src: "IMG_7310",
      text: "Explorers brought new foods from the Americas to Europe: corn (maize), potatoes, sweet potatoes, beans, squash, tomatoes, pineapple, and cacao, which is used to make chocolate.",
      example: "Native Americans widely grew corn and found many uses for it. These foods improved diets and helped Europe's population grow."
    },
    tobacco: {
      title: "Tobacco: A Cash Crop", art: "tobacco", src: "IMG_7311",
      text: "Explorers found tobacco, a tall leafy plant grown throughout the Americas. Native Americans used it in ceremonies, medicine, and peace rituals.",
      example: "Europeans took it home, where it became very popular and addictive. Settlers grew large fields of it as a cash crop, a crop grown to sell for money, to buy European goods. Today we know tobacco is harmful."
    },
    astrolabe: {
      title: "The Astrolabe", art: "astrolabe", src: "IMG_7308",
      text: "An astrolabe is a circular metal instrument with marked edges and a rotating bar. Sailors measured the angle of the sun or stars above the horizon to find their latitude.",
      example: "It told sailors their ship's position, day or night."
    },
    compass: {
      title: "The Compass", art: "compass", src: "IMG_7308",
      text: "A compass has a magnetic needle that always points north. That helped sailors find north, south, east, and west, even in fog or darkness.",
      example: "Without compasses, reaching the Americas would have taken much longer."
    },
    charts: {
      title: "Charts & Maps", art: "chart", src: "IMG_7308",
      text: "Nautical charts showed rocky shores and safe ports. Navigational maps showed wind and ocean currents. Mapmakers kept improving maps with information from explorers and sailors.",
      example: "A chart was like a sailor's guidebook for staying safe near land."
    },
    blank: {
      title: "Blank Spots & Sea Monsters", art: "blank", src: "IMG_7308",
      text: "By the 1400s, Europeans knew the world was round, but they did not know about the Americas. Early maps had blank spots for unexplored areas and often showed imaginary sea monsters like dragons or serpents.",
      example: "A blank spot meant “we don't know what is here yet.”"
    }
  };

  /* ---------- The nine historical figures (IMG_7305 and IMG_7306) ---------- */
  var EXPLORERS = [
    { id: "columbus", name: "Christopher Columbus", short: "Columbus", hue: 212, initials: "CC", src: "IMG_7305",
      country: "Spain", countryWhy: "He claimed land for Spain, and King Ferdinand and Queen Isabella paid for his trip.",
      place: null,
      clue: "sailed west in 1492 hoping to reach Asia", hint: "Think of the year 1492.",
      pair: "Sailed west in 1492 for Spain",
      facts: [["Sponsor", "King Ferdinand and Queen Isabella of Spain"], ["Where", "The Bahamas, Central America, and North America"], ["Known for", "Sailed west to find the West Indies (Asia) and claimed land for Spain"]] },
    { id: "cabot", name: "John Cabot", short: "Cabot", hue: 350, initials: "JC", src: "IMG_7305",
      country: "England", countryWhy: "King Henry VII of England sponsored Cabot.",
      place: "Fish-rich waters near Newfoundland", placeWhy: "Cabot found an area of the Atlantic Ocean southeast of Newfoundland that was rich with fish.",
      clue: "found fish-rich Atlantic waters southeast of Newfoundland", hint: "Think about Newfoundland and England's king.",
      pair: "Found fish-rich waters for England",
      facts: [["Sponsor", "King Henry VII of England"], ["Where", "Atlantic Ocean, southeast of Newfoundland"], ["Known for", "Italian explorer who found waters rich with fish"]] },
    { id: "ponce", name: "Juan Ponce de León", short: "Ponce de León", hue: 140, initials: "PL", src: "IMG_7305",
      country: "Spain", countryWhy: "Ponce de León was sponsored by Spain.",
      place: "Florida", placeWhy: "Ponce de León reached Florida for Spain.",
      clue: "reached Florida and named it for the Feast of Flowers", hint: "Think about the Feast of Flowers.",
      pair: "Reached Florida for Spain",
      facts: [["Sponsor", "Spain"], ["Where", "Florida"], ["Known for", "Credited as the first European to reach Florida. He named it Pascua Florida (Feast of Flowers) because he arrived around Easter"]] },
    { id: "cortes", name: "Hernán Cortés", short: "Cortés", hue: 18, initials: "HC", src: "IMG_7305",
      country: "Spain", countryWhy: "Cortés claimed Mexico for Spain.",
      place: "Mexico", placeWhy: "Cortés sailed to Mexico in search of wealth and claimed it for Spain.",
      clue: "sailed to Mexico seeking wealth and claimed it for Spain", hint: "Think about Mexico and the Aztecs.",
      pair: "Claimed Mexico for Spain",
      facts: [["Sponsor", "Spain"], ["Where", "Mexico, home of the Aztec Empire"], ["Known for", "Sailed to Mexico in search of wealth and claimed Mexico for Spain"]] },
    { id: "cartier", name: "Jacques Cartier", short: "Cartier", hue: 262, initials: "JC", src: "IMG_7305",
      country: "France", countryWhy: "Cartier was a French explorer who claimed land for France.",
      place: "The St. Lawrence River", placeWhy: "Cartier reached the peninsula near the St. Lawrence River and claimed it for France.",
      clue: "searched for the Northwest Passage near the St. Lawrence River", hint: "Think about France and the St. Lawrence River.",
      pair: "Sought the Northwest Passage for France",
      facts: [["Sponsor", "France"], ["Where", "A peninsula near the St. Lawrence River"], ["Known for", "French explorer who claimed the area for France while searching for the Northwest Passage (a hoped-for sea route to Asia)"]] },
    { id: "coronado", name: "Francisco Vázquez de Coronado", short: "Coronado", hue: 40, initials: "FC", src: "IMG_7305",
      country: "Spain", countryWhy: "Coronado was sponsored by Spain.",
      place: "Arizona, New Mexico, and Colorado", placeWhy: "Coronado traveled north of Mexico toward Arizona, New Mexico, and Colorado.",
      clue: "traveled north of Mexico looking for the seven cities of gold", hint: "Think about gold cities north of Mexico.",
      pair: "Hunted the seven cities of gold",
      facts: [["Sponsor", "Spain"], ["Where", "North of Mexico toward Arizona, New Mexico, and Colorado"], ["Known for", "Searched for the seven cities of gold"]] },
    { id: "hudson", name: "Henry Hudson", short: "Hudson", hue: 190, initials: "HH", src: "IMG_7305",
      country: null, badge: "Netherlands & England", place: "The Hudson River and Hudson Bay", placeWhy: "A river and a bay are named after Henry Hudson.",
      clue: "has a river and a bay named after him", hint: "Think about names on a map that match his name.",
      pair: "A river and a bay carry his name",
      facts: [["Sponsor", "The Dutch East India Company (Netherlands) and English merchants"], ["Where", "Hudson Bay and the Hudson River"], ["Known for", "English sea captain, first to map the Hudson River and the North Atlantic. The river and bay are named after him"]] },
    { id: "lasalle", name: "Robert de La Salle", short: "La Salle", hue: 300, initials: "RL", src: "IMG_7306",
      country: "France", countryWhy: "La Salle was sponsored by France and claimed the Mississippi River for France.",
      place: "The Mississippi River", placeWhy: "La Salle claimed the Mississippi River and its tributaries for France.",
      clue: "claimed the Mississippi River for France", hint: "Think about Louisiana and a French king.",
      pair: "Named Louisiana for King Louis XIV",
      facts: [["Sponsor", "France"], ["Where", "The Mississippi River"], ["Known for", "Claimed the Mississippi River and its tributaries for France and named the territory Louisiana after King Louis XIV"]] },
    { id: "lascasas", name: "Bartolomé de las Casas", short: "Las Casas", hue: 95, initials: "BC", src: "IMG_7306",
      country: null, badge: "Spanish missionary", place: null,
      clue: "was a Spanish missionary who spoke up against the unfair treatment of Native Americans", hint: "Think about someone who wrote and spoke up for others.",
      pair: "Spoke up for Native Americans",
      facts: [["Job", "Spanish missionary"], ["Wrote about", "How Native Americans had sophisticated cities"], ["Spoke up against", "The unfair treatment of Native Americans by the Spanish"]] }
  ];

  /* ---------- Questions. Each has one correct answer and several clearly wrong ones. ---------- */
  var QUESTIONS = [];
  function Q(id, topic, src, text, answer, wrong, hint, why, extra) {
    var q = { id: id, topic: topic, src: src, text: text, answer: answer, wrong: wrong, hint: hint, why: why };
    if (extra) { for (var k in extra) { q[k] = extra[k]; } }
    QUESTIONS.push(q);
  }

  /* Why Europeans sailed (IMG_7307) */
  Q("why-asia", "why", "IMG_7307", "In the late 1400s and 1500s, what were Europeans hoping to find by sailing across the Atlantic?",
    "New trade routes to Asia for spices and silks", ["A way to reach Africa by land", "A shorter way to cross the Pacific Ocean", "New ships to buy from Asia"],
    "Think about what Asia sold: flavors for food and fancy cloth.", "Europeans wanted spices and silks from Asia, so they searched for new trade routes.");
  Q("why-columbus", "why", "IMG_7307", "When Columbus sailed west in 1492, what was he searching for?",
    "A way to reach Asia", ["The Mississippi River", "The seven cities of gold", "The St. Lawrence River"],
    "Columbus wanted the same thing many Europeans wanted: trade with Asia.", "Columbus sailed west hoping to reach Asia. Instead he reached the Americas, which Europeans did not know about.");
  Q("why-before", "why", "IMG_7307", "Before Columbus arrived in 1492, who already lived in the Americas?",
    "Native Americans, for thousands of years", ["Nobody lived there yet", "Only Spanish settlers", "Only a few Viking farmers"],
    "Think about the people who were here long before the ships.", "Native Americans had already lived in the Americas for thousands of years, so the land was not empty.");
  Q("why-vikings", "why", "IMG_7307", "Which group reached the Americas before Columbus but did not build permanent settlements?",
    "The Vikings", ["The Spanish", "The French", "The Dutch"],
    "Think about explorers who came much earlier than 1492.", "Vikings had reached the Americas earlier, but they did not establish permanent settlements.");
  Q("why-year", "why", "IMG_7307", "In what year did Columbus sail west and reach the Americas?",
    "1492", ["1392", "1592", "1692"],
    "It is the year in the rhyme about the ocean blue.", "Columbus made his famous voyage in 1492.");
  Q("why-age", "why", "IMG_7307", "The Age of Exploration began in which time period?",
    "The late 1400s", ["The 1200s", "The late 1700s", "The early 1800s"],
    "It started around the time Columbus sailed.", "The Age of Exploration began in the late 1400s, as Europeans searched for new routes to Asia.");
  Q("why-wrecks", "why", "IMG_7307", "Why do scientists today study sunken ships from long ago?",
    "To learn about European exploration", ["To learn how to grow corn", "To find the first flag ever made", "To practice sailing"],
    "Those ships carry clues about the past.", "Sunken ships and the artifacts on them teach scientists about European exploration.");
  Q("why-sonar", "why", "IMG_7307", "Which tools do modern scientists use to study shipwrecks?",
    "Sonar and grid systems", ["Astrolabes and compasses", "Flags and Bibles", "Spices and silks"],
    "Think about modern tools that can “see” under the water.", "Modern scientists use sonar and grid systems to study wrecks and artifacts.");

  /* Astrolabe and compass (IMG_7307, IMG_7308) */
  Q("tool-astrolabe", "tools", "IMG_7307", "What did an astrolabe help sailors find?",
    "Their latitude, how far north or south of the equator they were", ["How deep the ocean was", "Which way the wind was blowing", "How many days until land"],
    "Latitude is about north and south.", "Explorers used astrolabes to find their latitude, which is the distance north or south of the equator.");
  Q("tool-astro-how", "tools", "IMG_7308", "How does an astrolabe work?",
    "It measures the angle of the sun or stars above the horizon", ["It has a magnetic needle that points north", "It shows rocky shores on a drawing", "It counts the waves"],
    "Look up! What does a sailor aim it at?", "An astrolabe is used to find latitude by measuring the angle of the sun or stars above the horizon.");
  Q("tool-astro-night", "tools", "IMG_7308", "Why could sailors use an astrolabe both day and night?",
    "They could measure the stars at night and the sun by day", ["It glowed in the dark", "It made the ship sail faster", "It only worked in the fog"],
    "What is up in the sky at night?", "An astrolabe measures the sun or the stars, so it helped sailors determine their position day or night.");
  Q("tool-which-astro", "tools", "IMG_7307", "Which tool is a circular metal instrument with marked edges and a rotating bar?",
    "An astrolabe", ["A compass", "A nautical chart", "A flag"],
    "It has a rotating bar for measuring angles.", "An astrolabe is a circular metal instrument with marked edges and a rotating bar.");
  Q("tool-compass-north", "tools", "IMG_7308", "A compass has a magnetic needle. Which way does it always point?",
    "North", ["South", "East", "West"],
    "It is the direction at the top of most maps.", "A compass needle always points north.");
  Q("tool-compass-fog", "tools", "IMG_7308", "Why was a compass so useful in fog or darkness?",
    "It showed direction even when sailors could not see land or the sun", ["It made the fog go away", "It showed where the rocky shores were", "It measured latitude"],
    "Think about a time you could not see anything around you.", "A compass helped sailors know their direction even in fog or darkness.");
  Q("tool-compass-dirs", "tools", "IMG_7308", "What did the compass let navigators figure out?",
    "North, south, east, and west", ["How much gold a ship carried", "Where storms began", "Which king owned the land"],
    "It is about directions.", "A compass allowed navigators to figure out north, south, east, and west.");
  Q("tool-compass-longer", "tools", "IMG_7308", "Without compasses, reaching the Americas would have...",
    "taken much longer", ["been much faster", "been easier because of landmarks", "not needed any ships"],
    "Think about sailing without knowing which way you are heading.", "Without compasses, reaching the Americas would have taken much longer.");
  Q("tool-sun", "tools", "IMG_7308", "What is the sailor measuring in this picture?",
    "The angle of the sun above the horizon", ["How deep the water is", "How fast the wind is blowing", "How far away land is"],
    "Look at the arc between the horizon and the sun.", "An astrolabe measures the angle of the sun or stars above the horizon. That angle helps sailors find latitude.",
    { visual: { type: "sun" } });
  [["n", 0, "North"], ["e", 90, "East"], ["s", 180, "South"], ["w", 270, "West"]].forEach(function (d) {
    var others = ["North", "East", "South", "West"].filter(function (x) { return x !== d[2]; });
    Q("tool-dir-" + d[0], "tools", "IMG_7308", "The arrow shows which way the ship is sailing. Which direction is that?",
      d[2], others, "Find the letters N, E, S, and W on the compass. Which letter is the arrow closest to?",
      "The arrow points toward the " + d[2].toLowerCase() + ". A compass needle always points north, so sailors could figure out the other directions from it.",
      { visual: { type: "compass", deg: d[1] } });
  });

  /* Maps and charts (IMG_7308) */
  Q("map-charts", "maps", "IMG_7308", "What did nautical charts show?",
    "Rocky shores and safe ports", ["Cities made of gold", "The names of every sailor", "Which ships carried silver"],
    "Think about what a ship needs to stay safe near land.", "Nautical charts showed rocky shores and safe ports.");
  Q("map-nav", "maps", "IMG_7308", "What did navigational maps show?",
    "Wind and ocean currents", ["Gold mines", "Sailors' names", "The flags of each country"],
    "Think about what moves a ship across the water.", "Navigational maps showed wind and ocean currents.");
  Q("map-improve", "maps", "IMG_7308", "How did mapmakers make maps better over time?",
    "They used information from explorers and sailors", ["They copied old maps without any changes", "They guessed using sonar", "They asked kings to draw them"],
    "Who had actually been to those places?", "Mapmakers improved maps using information from explorers and sailors.");
  Q("map-round", "maps", "IMG_7308", "What did Europeans know about the world by the 1400s?",
    "It was round, but they did not know about the Americas", ["It was flat", "They had already mapped the Americas", "They knew about every ocean"],
    "They knew the shape of the world but not everything on it.", "By the 1400s, Europeans knew the world was round, but they did not know about the Americas.");
  Q("map-blank", "maps", "IMG_7308", "What did early maps show for places that had not been explored?",
    "Blank spots", ["Gold coins", "Tiny flags", "Tobacco fields"],
    "If nobody knew what was there, what would a mapmaker leave?", "Early maps had blank spots for unexplored areas.");
  Q("map-monsters", "maps", "IMG_7308", "What did mapmakers often draw in the ocean on early maps?",
    "Imaginary sea monsters like dragons or serpents", ["Photographs of whales", "Pictures of the sailors' pets", "Ships from Asia"],
    "These creatures were not real.", "Maps often included imaginary sea monsters like dragons or serpents.");

  /* Land, faith, and power (IMG_7309) */
  Q("mo-fund", "motives", "IMG_7309", "Why did European rulers pay for explorers?",
    "They wanted more land and power", ["They wanted to give land to Native Americans", "They wanted to stop all trade", "They wanted to build museums"],
    "Think about what a king or queen hopes their kingdom will become.", "European rulers wanted to expand their power in the Americas.");
  Q("mo-flags", "motives", "IMG_7309", "What did explorers carry to show which country they served?",
    "Flags", ["Astrolabes", "Tobacco leaves", "Nautical charts"],
    "Every country has one.", "Rulers funded explorers who carried flags representing their countries.");
  Q("mo-plant", "motives", "IMG_7309", "What did planting a flag on new land mean to the explorers?",
    "They were claiming the land for their country", ["They were asking permission to stay", "They were marking a safe port", "They were saying the trip was over"],
    "Think about “this land belongs to us.”", "Planting a flag symbolized claiming the land for their country, even though people already lived there.");
  Q("mo-fy", "motives", "IMG_7309", "Spanish flags featured a cross and two letters. Which letters, and who were they for?",
    "F and Y, for Ferdinand and Ysabel (Isabella)", ["C and S, for Columbus and Spain", "K and Q, for King and Queen", "S and F, for Spain and Florida"],
    "Think about Spain's king and queen.", "Spanish flags featured a cross and the letters F (Ferdinand) and Y (Ysabel/Isabella).");
  Q("mo-spain", "motives", "IMG_7309", "After costly wars, which kingdom wanted to increase its supply of gold and silver?",
    "Spain", ["Sweden", "Russia", "Egypt"],
    "It was the kingdom that paid for Columbus.", "Spain wanted to increase its supply of gold and silver after costly wars.");
  Q("mo-christians", "motives", "IMG_7309", "By the 1500s, European explorers were mostly...",
    "Christians, mostly Catholic or Protestant", ["Followers of the religions of the Americas", "People with no religious beliefs", "Members of only one church"],
    "Think about the Bibles they carried.", "By the 1500s, European explorers were Christians, mostly Catholic or Protestant.");
  Q("mo-priests", "motives", "IMG_7309", "What did Catholic rulers send to convert native peoples to Christianity?",
    "Priests and armies", ["Astrolabes and charts", "Corn and beans", "Flags and gold"],
    "One group taught, and one group had weapons.", "Catholic rulers sent priests and armies to convert native peoples to Christianity.");
  Q("mo-goal", "motives", "IMG_7309", "Along with exploring, what was another goal for many European explorers?",
    "Spreading their religion", ["Building lighthouses", "Making astrolabes", "Selling flags"],
    "Many explorers carried Bibles with them.", "Spreading religion was part of their mission alongside exploration.");
  Q("mo-rome", "motives", "IMG_7309", "Christianity began in the Middle East and spread through Europe under which empire?",
    "The Roman Empire", ["The Aztec Empire", "The Viking Empire", "The Spanish Empire"],
    "It was a very old empire that began in Rome.", "Christianity spread through Europe under the Roman Empire.");

  /* Gold and silver (IMG_7309, IMG_7310) */
  Q("me-wealth", "metals", "IMG_7309", "What did Europeans measure wealth in?",
    "Gold and silver", ["Corn and potatoes", "Compasses and maps", "Flags and Bibles"],
    "They are shiny metals.", "Europeans measured wealth in gold and silver.");
  Q("me-where", "metals", "IMG_7310", "Where did Spanish explorers find gold and silver?",
    "In Mexico and South America", ["Near Newfoundland", "Along the St. Lawrence River", "In Hudson Bay"],
    "Look south of where the English and French explored.", "Spanish explorers found gold and silver in Mexico and South America.");
  Q("me-enslaved", "metals", "IMG_7310", "What happened to many native peoples after the Spanish found gold and silver?",
    "They were enslaved and forced to mine the metals", ["They were paid to mine the metals", "They were given the gold and silver", "They sailed to Spain as explorers"],
    "It was a harsh and unfair time for them.", "The Spanish enslaved native peoples to mine the metals. That was cruel and unfair, and Bartolomé de las Casas spoke up against it.");
  Q("me-bars", "metals", "IMG_7310", "What were the gold and silver turned into before they were shipped back to Spain?",
    "Bars, coins, and jewelry", ["Flags and maps", "Astrolabes and compasses", "Ships and sails"],
    "Think about things people spend or wear.", "Gold and silver were turned into bars, coins, and jewelry, then shipped back to Spain.");
  Q("me-hoped", "metals", "IMG_7310", "What did explorers hope to find in the Americas?",
    "Precious metals", ["Sea monsters", "More astrolabes", "Viking cities"],
    "Think about gold and silver.", "Explorers hoped to find precious metals in the Americas.");

  /* New foods (IMG_7310) */
  Q("fo-corn", "foods", "IMG_7310", "Which food was widely grown by Native Americans and had many uses?",
    "Corn (maize)", ["Rice", "Wheat", "Oats"],
    "It grows on a tall stalk with golden kernels.", "Corn (maize) was widely grown by Native Americans and had many uses.");
  Q("fo-from", "foods", "IMG_7310", "Which of these foods came from the Americas and spread around the world?",
    "Potatoes", ["Wheat", "Rice", "Oranges"],
    "Look back at the lesson list of new foods.", "Potatoes are one of the foods from the Americas that spread globally.");
  Q("fo-cacao", "foods", "IMG_7310", "Cacao from the Americas is used to make which treat?",
    "Chocolate", ["Cheese", "Bread", "Orange juice"],
    "It is sweet and often brown.", "Cacao is used to make chocolate.");
  Q("fo-europe", "foods", "IMG_7310", "How did foods from the Americas change Europe?",
    "They improved diets and helped the population grow", ["They made Europeans stop farming", "They made Europe smaller", "They replaced every food Europe had"],
    "More and better food helps people thrive.", "These foods improved diets and increased population growth in Europe.");

  /* Tobacco (IMG_7310, IMG_7311) */
  Q("to-what", "tobacco", "IMG_7310", "What is tobacco?",
    "A tall leafy plant grown throughout the Americas", ["A kind of corn", "A metal found in Mexico", "A tool for making maps"],
    "It is a plant, and it has big leaves.", "Explorers found tobacco, a tall leafy plant grown throughout the Americas.");
  Q("to-use", "tobacco", "IMG_7310", "How did Native Americans use tobacco?",
    "In ceremonies, medicine, and peace rituals", ["As money to buy ships", "As their main food", "As flags for their villages"],
    "It had special and respectful uses.", "Native Americans used tobacco in ceremonies, medicine, and peace rituals.");
  Q("to-addict", "tobacco", "IMG_7311", "What happened when Europeans brought tobacco to Europe?",
    "It became very popular and addictive", ["It was too heavy to ship", "It made all food spoil", "Nobody wanted it"],
    "Think about why something is hard to stop using.", "Tobacco became very popular and addictive in Europe. Addictive means people find it very hard to stop using it.");
  Q("to-cash", "tobacco", "IMG_7311", "What is a cash crop?",
    "A crop grown to be sold for money", ["A crop grown only to feed one family", "A crop that grows on coins", "A crop used to make maps"],
    "Cash means money.", "Tobacco became a valuable cash crop, providing income to buy European goods.");
  Q("to-fields", "tobacco", "IMG_7311", "Why did settlers grow large fields of tobacco?",
    "To sell it and earn income to buy European goods", ["To give it away for free", "To use only in ceremonies", "To eat it for dinner"],
    "Think about where the money came from.", "Tobacco was a valuable cash crop. It provided income to buy European goods.");

  /* Explorers: written questions (IMG_7305, IMG_7306) */
  Q("ex-sponsor-columbus", "explorers", "IMG_7305", "Who sponsored Christopher Columbus?",
    "King Ferdinand and Queen Isabella of Spain", ["King Henry VII of England", "King Louis XIV of France", "The Dutch East India Company"],
    "He claimed land for their country.", "Columbus was sponsored by King Ferdinand and Queen Isabella of Spain.");
  Q("ex-sponsor-cabot", "explorers", "IMG_7305", "Who sponsored John Cabot?",
    "King Henry VII of England", ["King Ferdinand and Queen Isabella of Spain", "King Louis XIV of France", "The Dutch East India Company"],
    "Cabot explored for England.", "John Cabot was sponsored by King Henry VII of England.");
  Q("ex-sponsor-hudson", "explorers", "IMG_7305", "Who sponsored Henry Hudson?",
    "The Dutch East India Company and English merchants", ["King Ferdinand and Queen Isabella of Spain", "King Henry VII of England", "King Louis XIV of France"],
    "One sponsor was a company from the Netherlands.", "Henry Hudson was sponsored by the Dutch East India Company (Netherlands) and English merchants.");
  Q("ex-florida", "explorers", "IMG_7305", "Why did Ponce de León name the land Florida?",
    "He arrived around Easter, called Pascua Florida (Feast of Flowers)", ["It was covered in orange trees", "It was named after his hometown", "It was named after King Ferdinand"],
    "The name has to do with flowers and a holiday.", "Ponce de León reached the coast around Easter, known as Pascua Florida (Feast of Flowers).");
  Q("ex-coronado", "explorers", "IMG_7305", "What was Coronado looking for north of Mexico?",
    "The seven cities of gold", ["The Northwest Passage", "A river named after a king", "Fish-rich waters"],
    "He hoped to find great wealth.", "Coronado traveled north of Mexico looking for the seven cities of gold.");
  Q("ex-cartier", "explorers", "IMG_7305", "What was Jacques Cartier searching for?",
    "The Northwest Passage", ["The seven cities of gold", "The Mississippi River", "Hudson Bay"],
    "It was a hoped-for sea route through North America.", "Jacques Cartier searched for the Northwest Passage and claimed land near the St. Lawrence River for France.");
  Q("ex-lasalle", "explorers", "IMG_7306", "What did Robert de La Salle name the territory he claimed for France, and after whom?",
    "Louisiana, after King Louis XIV", ["Florida, after the Feast of Flowers", "Hudson, after a sea captain", "New Spain, after Queen Isabella"],
    "The name sounds like a French king's name.", "La Salle called the territory Louisiana after King Louis XIV.");
  Q("ex-lascasas", "explorers", "IMG_7306", "What did Bartolomé de las Casas do?",
    "He wrote about Native American cities and spoke up against their unfair treatment", ["He claimed Mexico for Spain", "He mapped the Hudson River", "He sailed west to find Asia"],
    "He was a missionary, not a soldier.", "Las Casas, a Spanish missionary, wrote about how Native Americans had sophisticated cities and spoke up against the unfair treatment of Native Americans by the Spanish.");
  Q("ex-cabot-fish", "explorers", "IMG_7305", "John Cabot found an area of the Atlantic Ocean near Newfoundland that was rich with what?",
    "Fish", ["Gold", "Spices", "Silk"],
    "Think about why people fish there.", "Cabot found waters southeast of Newfoundland that were rich with fish.");
  Q("ex-cortes", "explorers", "IMG_7305", "Why did Hernán Cortés sail to Mexico?",
    "In search of wealth", ["To look for fish-rich waters", "To find the Northwest Passage", "To name a river"],
    "Many Spanish explorers hoped to bring treasure home.", "Cortés sailed to Mexico in search of wealth and claimed Mexico for Spain.");

  /* ---------- Sorting games: tap a card, then tap its group ---------- */
  var SORTS = {
    motives: {
      topic: "motives", src: "IMG_7309", prompt: "Why did Europeans sail? Tap the reason that fits each card.", pick: [2, 2, 2],
      buckets: [
        { label: "Land & power", desc: "Claiming land for a kingdom" },
        { label: "Religion", desc: "Spreading Christianity" },
        { label: "Wealth", desc: "Gold, silver, and treasure" }
      ],
      items: [
        { t: "Plant a flag to claim new land", b: 0, why: "Planting a flag symbolized claiming land for their country." },
        { t: "Help a kingdom grow bigger and stronger", b: 0, why: "European rulers wanted to expand their power in the Americas." },
        { t: "Carry a flag for Spain's king and queen", b: 0, why: "Flags showed which country an explorer served and claimed land for." },
        { t: "Send priests to convert native peoples", b: 1, why: "Catholic rulers sent priests and armies to convert native peoples to Christianity." },
        { t: "Carry Bibles on the voyage", b: 1, why: "Explorers often carried Bibles because spreading religion was part of their mission." },
        { t: "Spread Christianity alongside exploring", b: 1, why: "Spreading religion was part of their mission alongside exploration." },
        { t: "Find gold and silver", b: 2, why: "Europeans measured wealth in gold and silver." },
        { t: "Refill Spain's supply of gold after costly wars", b: 2, why: "Spain wanted to increase its supply of gold and silver after costly wars." },
        { t: "Ship coins and jewelry back to Spain", b: 2, why: "Gold and silver became coins and jewelry that were shipped to Spain." }
      ]
    },
    cargo: {
      topic: "foods", src: "IMG_7310", prompt: "What came from the Americas? Tap the group for each card.", pick: [3, 2, 1],
      buckets: [
        { label: "Foods", desc: "Grown to eat", topic: "foods" },
        { label: "Precious metals", desc: "Mined from the ground", topic: "metals" },
        { label: "Cash crop", desc: "Grown to sell for money", topic: "tobacco" }
      ],
      items: [
        { t: "Corn (maize)", b: 0, why: "Corn was widely grown by Native Americans and had many uses." },
        { t: "Potatoes", b: 0, why: "Potatoes are a vegetable from the Americas that spread around the world." },
        { t: "Cacao, used to make chocolate", b: 0, why: "Cacao is used to make chocolate." },
        { t: "Pineapple", b: 0, why: "Pineapple is a fruit from the Americas." },
        { t: "Squash and beans", b: 0, why: "Beans and squash are vegetables from the Americas." },
        { t: "Gold bars", b: 1, why: "Gold was mined and made into bars." },
        { t: "Silver coins", b: 1, why: "Silver was turned into coins and shipped back to Spain." },
        { t: "Large fields of tobacco grown to sell", b: 2, why: "Settlers grew large fields of tobacco as a cash crop to earn income." },
        { t: "Tobacco sold to buy European goods", b: 2, why: "Tobacco became a valuable cash crop, providing income to buy European goods." }
      ]
    }
  };

  /* ---------- Missions. Steps: lesson, q (by id, a list to pick from, or a topic), sort, meet, match ---------- */
  var MISSIONS = [
    { id: "sail", title: "Set Sail", short: "Set Sail", icon: "⛵", blurb: "Follow the story of how and why Europeans crossed the ocean.", minutes: "About 4 min",
      steps: [
        { k: "lesson", id: "people" }, { k: "lesson", id: "trade" }, { k: "lesson", id: "columbus" }, { k: "lesson", id: "wrecks" },
        { k: "q", from: ["why-asia", "why-columbus", "why-before", "why-vikings", "why-year", "why-age", "why-wrecks", "why-sonar"], n: 2, banner: "Checkpoint" },
        { k: "lesson", id: "tools" }, { k: "lesson", id: "rulers" }, { k: "lesson", id: "faith" },
        { k: "q", from: ["tool-astrolabe", "tool-compass-north", "mo-fund", "mo-plant", "mo-priests"], n: 2, banner: "Checkpoint" },
        { k: "lesson", id: "metals" }, { k: "lesson", id: "foods" }, { k: "lesson", id: "tobacco" },
        { k: "q", from: ["me-where", "me-enslaved", "fo-europe", "to-addict", "to-cash"], n: 3, banner: "Checkpoint" }
      ] },
    { id: "explorers", title: "Who's That Explorer?", short: "Explorers", icon: "🧑‍✈️", blurb: "Meet nine historical figures, then match each to what they did.", minutes: "About 4 min",
      steps: [
        { k: "meet" },
        { k: "match", pairs: ["columbus", "cabot", "ponce", "cortes", "cartier"] },
        { k: "match", pairs: ["coronado", "hudson", "lasalle", "lascasas"] },
        { k: "q", topic: "explorers", exclude: "ex-who-", n: 5 }
      ] },
    { id: "navigation", title: "Captain's Navigation", short: "Navigate", icon: "🧭", blurb: "Solve little puzzles with the compass, astrolabe, and sea charts.", minutes: "About 4 min",
      steps: [
        { k: "lesson", id: "trade" }, { k: "q", id: "why-asia" },
        { k: "lesson", id: "astrolabe" }, { k: "q", id: "tool-sun" }, { k: "q", from: ["tool-astrolabe", "tool-astro-how", "tool-astro-night", "tool-which-astro"], n: 1 },
        { k: "lesson", id: "compass" }, { k: "q", from: ["tool-dir-n", "tool-dir-e", "tool-dir-s", "tool-dir-w"], n: 2 }, { k: "q", from: ["tool-compass-north", "tool-compass-fog", "tool-compass-dirs", "tool-compass-longer"], n: 1 },
        { k: "lesson", id: "charts" }, { k: "q", from: ["map-charts", "map-nav", "map-improve"], n: 2 },
        { k: "lesson", id: "blank" }, { k: "q", from: ["map-round", "map-blank", "map-monsters"], n: 2 }
      ] },
    { id: "cargo", title: "Motives, Cargo & Consequences", short: "Cargo", icon: "📦", blurb: "Sort the reasons they sailed and what came back across the ocean.", minutes: "About 4 min",
      steps: [
        { k: "lesson", id: "rulers" }, { k: "lesson", id: "faith" }, { k: "lesson", id: "metals" }, { k: "sort", id: "motives" },
        { k: "q", from: ["me-wealth", "me-where", "me-enslaved", "me-bars", "me-hoped"], n: 1 },
        { k: "lesson", id: "foods" }, { k: "q", from: ["fo-corn", "fo-from", "fo-cacao", "fo-europe"], n: 1 },
        { k: "lesson", id: "tobacco" }, { k: "q", from: ["to-what", "to-use", "to-addict", "to-cash", "to-fields"], n: 1 },
        { k: "sort", id: "cargo" }
      ] }
  ];

  /* The final challenge picks this many questions from each topic (12 in all). */
  var FINAL_MIX = { why: 2, tools: 2, maps: 1, motives: 2, metals: 1, foods: 1, tobacco: 1, explorers: 2 };

  window.EE_DATA = {
    sources: SOURCES, topics: TOPICS, lessons: LESSONS, explorers: EXPLORERS,
    questions: QUESTIONS, sorts: SORTS, missions: MISSIONS, finalMix: FINAL_MIX
  };
})();

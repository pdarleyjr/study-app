/* Religion Quest: Sacraments — content only (pure data, testable in Node).
   Source: Unit 1 Review, book pages 45–47 (see docs/sources/math-religion-sources.md). */
var SacramentsData = (function () {
  var homework = {
    p46: [
      { letter: "S", clue: "the usual minister of Confirmation", answer: "BISHOP" },
      { letter: "A", clue: "what the bishop places over those to be confirmed as he anoints them", answer: "HAND" },
      { letter: "C", clue: "a person in the OCIA who desires to become a Catholic", answer: "CATECHUMEN" },
      { letter: "R", clue: "the holy oil used in Confirmation", answer: "CHRISM" },
      { letter: "A", clue: "what we do for one hour before receiving the Eucharist", answer: "FAST" },
      { letter: "M", clue: "sacred vessel used to expose the Blessed Sacrament", answer: "MONSTRANCE" },
      { letter: "E", clue: "the day when Jesus gave the Holy Spirit to the Apostles", answer: "PENTECOST" },
      { letter: "N", clue: "the sacrament that strengthens the gift of the Holy Spirit first received in Baptism", answer: "CONFIRMATION" },
      { letter: "T", clue: "the sacrament in which we receive our first call to give witness to Jesus", answer: "BAPTISM" },
      { letter: "S", clue: "the person the Holy Spirit helps us imitate", answer: "CHRIST" }
    ],
    p47across: [
      { n: 1, clue: "nourishes our life in Christ", answer: "EUCHARIST" },
      { n: 4, clue: "the sacrament that makes us children of God and members of the Church", answer: "BAPTISM" },
      { n: 5, clue: "words, actions, or objects blessed by the Church to bring us closer to God", answer: "SACRAMENTALS" },
      { n: 8, clue: "one of the signs used in the Sacrament of the Eucharist", answer: "BREAD" },
      { n: 9, clue: "the chief sign used in the Sacrament of Baptism", answer: "WATER" },
      { n: 10, clue: "the public worship of the Church", answer: "LITURGY" },
      { n: 11, clue: "the process for initiating adults into the Church", answer: "OCIA" }
    ],
    p47down: [
      { n: 2, clue: "the sacrament in which the gift of the Holy Spirit is strengthened and we are connected more closely to the mission of the Church", answer: "CONFIRMATION" },
      { n: 3, clue: "sacred signs Jesus gave his Church to help us encounter him and receive a share in his divine life", answer: "SACRAMENTS" },
      { n: 4, clue: "a blessing given by making the Sign of the Cross with the Blessed Sacrament at the end of eucharistic devotions", answer: "BENEDICTION" },
      { n: 6, clue: "the table in a church where Mass is offered", answer: "ALTAR" },
      { n: 7, clue: "the gift of sharing in the life of God", answer: "GRACE" },
      { n: 9, clue: "prayer and good deeds done to honor God", answer: "WORSHIP" }
    ]
  };

  /* term, def (kid-friendly, in the book's words), book (exact words from the book that def must contain) */
  var vocab = [
    { id: "holy-spirit", term: "Holy Spirit", book: "Jesus comes to us through the Holy Spirit",
      def: "Jesus comes to us through the Holy Spirit. The Holy Spirit helps us imitate Christ." },
    { id: "pentecost", term: "Pentecost", book: "the day when Jesus gave the Holy Spirit to the Apostles",
      def: "The day when Jesus gave the Holy Spirit to the Apostles." },
    { id: "chrism", term: "Chrism", book: "the holy oil used in Confirmation",
      def: "The holy oil used in Confirmation." },
    { id: "bishop", term: "Bishop", book: "the usual minister of Confirmation",
      def: "The usual minister of Confirmation. He places his hand over the person and anoints with Chrism." },
    { id: "catechumen", term: "Catechumen", book: "a person in the OCIA who desires to become a Catholic",
      def: "A person in the OCIA who desires to become a Catholic." },
    { id: "ocia", term: "OCIA", book: "the process for initiating adults into the Church",
      def: "The process for initiating adults into the Church." },
    { id: "monstrance", term: "Monstrance", book: "sacred vessel used to expose the Blessed Sacrament",
      def: "A sacred vessel used to expose the Blessed Sacrament." },
    { id: "benediction", term: "Benediction", book: "a blessing given by making the Sign of the Cross with the Blessed Sacrament at the end of eucharistic devotions",
      def: "A blessing given by making the Sign of the Cross with the Blessed Sacrament at the end of eucharistic devotions." },
    { id: "sacraments", term: "Sacraments", book: "sacred signs Jesus gave his Church to help us encounter him and receive a share in his divine life",
      def: "Sacred signs Jesus gave his Church to help us encounter him and receive a share in his divine life." },
    { id: "sacramentals", term: "Sacramentals", book: "words, actions, or objects blessed by the Church to bring us closer to God",
      def: "Words, actions, or objects blessed by the Church to bring us closer to God." },
    { id: "grace", term: "Grace", book: "the gift of sharing in the life of God",
      def: "The gift of sharing in the life of God." },
    { id: "liturgy", term: "Liturgy", book: "the public worship of the Church",
      def: "The public worship of the Church." },
    { id: "worship", term: "Worship", book: "prayer and good deeds done to honor God",
      def: "Prayer and good deeds done to honor God." },
    { id: "altar", term: "Altar", book: "the table in a church where Mass is offered",
      def: "The table in a church where Mass is offered." },
    { id: "fast", term: "Fast", book: "what we do for one hour before receiving the Eucharist",
      def: "What we do for one hour before receiving the Eucharist." },
    { id: "christ", term: "Christ", book: "the person the Holy Spirit helps us imitate",
      def: "The person the Holy Spirit helps us imitate." },
    { id: "witness", term: "Christian witness", book: "give witness to Jesus by good words and kind acts",
      def: "Showing Jesus by our good words and kind acts. (Page 45: give witness to Jesus by good words and kind acts.)" }
  ];

  var initiation = [
    { id: "baptism", name: "Baptism", icon: "water",
      facts: ["Water is the chief sign.", "Makes us children of God and members of the Church.", "We begin the Christian life.", "Our first call to give witness to Jesus."] },
    { id: "confirmation", name: "Confirmation", icon: "flame",
      facts: ["The usual minister is the bishop.", "He places his hand over the person and anoints with Chrism, the holy oil.", "Strengthens the gift of the Holy Spirit first received in Baptism.", "Connects us more closely to the mission of the Church."] },
    { id: "eucharist", name: "Eucharist", icon: "chalice",
      facts: ["Bread is one of the signs (bread and wine).", "Nourishes our life in Christ.", "Jesus offers himself for us.", "We fast for one hour before receiving."] }
  ];

  var sortClues = [
    { clue: "Water", answer: "baptism", why: "Water is the chief sign of Baptism." },
    { clue: "Chrism, the holy oil", answer: "confirmation", why: "The bishop anoints with Chrism in Confirmation." },
    { clue: "Bread", answer: "eucharist", why: "Bread is one of the signs of the Eucharist." },
    { clue: "The bishop's hand over the person", answer: "confirmation", why: "In Confirmation the bishop places his hand over the person." },
    { clue: "Our first call to give witness to Jesus", answer: "baptism", why: "Baptism is where we receive our first call to give witness." },
    { clue: "Nourishes our life in Christ", answer: "eucharist", why: "The Eucharist nourishes our life in Christ." },
    { clue: "Fast for one hour before", answer: "eucharist", why: "We fast for one hour before receiving the Eucharist." },
    { clue: "Makes us children of God and members of the Church", answer: "baptism", why: "That is what Baptism does." },
    { clue: "Strengthens the gift of the Holy Spirit first received in Baptism", answer: "confirmation", why: "That is Confirmation." }
  ];

  /* kind: id = identify-the-sacrament, mc, match, tf, app = application. vocab = vocab ids behind the question. */
  var quiz = [
    { id: "q1", kind: "mc", type: "mc", vocab: ["sacraments"],
      prompt: "Baptism, Confirmation, and the Eucharist are called the Sacraments of what?",
      choices: ["Initiation", "Benediction", "Liturgy", "Worship"], answer: 0,
      explain: "They are the Sacraments of Initiation. In Baptism we begin the Christian life, Confirmation strengthens us to grow in it, and the Eucharist nourishes God's life in us." },
    { id: "q2", kind: "id", type: "mc", vocab: ["sacraments"],
      prompt: "Which sacrament uses water as its chief sign and makes us children of God?",
      choices: ["Confirmation", "Baptism", "Eucharist", "Benediction"], answer: 1,
      explain: "In Baptism, water is the chief sign. It makes us children of God and members of the Church." },
    { id: "q3", kind: "id", type: "mc", vocab: ["chrism", "bishop"],
      prompt: "The bishop, the usual minister of this sacrament, places his hand over a person and anoints with Chrism. Which sacrament is this?",
      choices: ["Baptism", "Eucharist", "Confirmation", "OCIA"], answer: 2,
      explain: "This is Confirmation. It strengthens the gift of the Holy Spirit first received in Baptism." },
    { id: "q4", kind: "id", type: "mc", vocab: ["fast", "altar"],
      prompt: "Which sacrament do we prepare for by fasting for one hour?",
      choices: ["Eucharist", "Baptism", "Confirmation", "Pentecost"], answer: 0,
      explain: "We fast for one hour before receiving the Eucharist, which nourishes our life in Christ." },
    { id: "q5", kind: "match", type: "match", vocab: ["chrism", "monstrance", "catechumen", "altar"],
      prompt: "Match each word to its meaning.",
      pairs: [["Chrism", "The holy oil used in Confirmation"],
        ["Monstrance", "A sacred vessel used to expose the Blessed Sacrament"],
        ["Catechumen", "A person in the OCIA who desires to become a Catholic"],
        ["Altar", "The table in a church where Mass is offered"]],
      explain: "Chrism is the holy oil, the monstrance holds the Blessed Sacrament, a catechumen is in the OCIA, and Mass is offered on the altar." },
    { id: "q6", kind: "match", type: "match", vocab: ["grace", "liturgy", "benediction", "sacramentals"],
      prompt: "Match each word to its meaning.",
      pairs: [["Grace", "The gift of sharing in the life of God"],
        ["Liturgy", "The public worship of the Church"],
        ["Benediction", "A blessing with the Sign of the Cross made with the Blessed Sacrament"],
        ["Sacramentals", "Words, actions, or objects blessed by the Church"]],
      explain: "Grace is sharing in God's life, the liturgy is the Church's public worship, Benediction is a blessing with the Blessed Sacrament, and sacramentals are blessed words, actions, or objects." },
    { id: "q7", kind: "tf", type: "tf", vocab: ["pentecost", "holy-spirit"],
      prompt: "Pentecost is the day when Jesus gave the Holy Spirit to the Apostles.",
      answer: true, explain: "That is right. Pentecost is the day Jesus gave the Holy Spirit to the Apostles." },
    { id: "q8", kind: "tf", type: "tf", vocab: ["holy-spirit", "sacraments"],
      prompt: "Baptism is the sacrament that strengthens the gift of the Holy Spirit first received in Confirmation.",
      answer: false, explain: "It is the other way around. Confirmation strengthens the gift of the Holy Spirit first received in Baptism." },
    { id: "q9", kind: "app", type: "mc", vocab: ["catechumen", "ocia"],
      prompt: "Your friend's grandmother is learning about the Catholic faith in the OCIA because she wants to become a Catholic. What is she called?",
      choices: ["A catechumen", "A bishop", "A monstrance", "A sacramental"], answer: 0,
      explain: "A catechumen is a person in the OCIA who desires to become a Catholic." },
    { id: "q10", kind: "app", type: "mc", vocab: ["sacramentals", "grace"],
      prompt: "Why do Catholics use sacramentals, like holy water or a blessed medal?",
      choices: ["To take the place of the sacraments", "To bring us closer to God", "To make Mass shorter", "To tell the bishop where we sit"], answer: 1,
      explain: "Sacramentals are blessed by the Church to bring us closer to God and remind us that he loves us." }
  ];

  var DATA = { homework: homework, vocab: vocab, initiation: initiation, sortClues: sortClues, quiz: quiz,
    storeKey: "studyquest:sacraments-quest:v1",
    images: { p45: "homework/unit1-review-p45.jpg", p46: "homework/about-the-sacraments-p46.jpg", p47: "homework/sacraments-in-review-p47.png" } };
  return DATA;
})();
if (typeof module !== "undefined" && module.exports) module.exports = SacramentsData; else window.SacramentsData = SacramentsData;

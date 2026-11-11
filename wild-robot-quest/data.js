/* Wild Robot Quest: content for The Wild Robot Escapes, Chapters 38-39 (family chapter review).
   Pure data + pure functions, testable in Node. Rendering lives in app.js. */
(function (root) {
  "use strict";

  var DATA = {
    id: "wild-robot-quest",
    storeKey: "studyquest:wild-robot-quest:v1",
    title: "Wild Robot Quest: The Truth & The Allies",
    book: "The Wild Robot Escapes by Peter Brown",
    covers: "Chapters 38–39 (pages 103–107)",

    /* steps of the activity; minutes add up to the whole time (about 10) */
    steps: [
      { id: "chapters", label: "Chapters", minutes: 1, kind: "review" },
      { id: "timeline", label: "Story timeline", minutes: 2, kind: "review" },
      { id: "ideas", label: "Big ideas", minutes: 1, kind: "review" },
      { id: "remember", label: "Remember", minutes: 1, kind: "review" },
      { id: "quiz", label: "Quiz", minutes: 5, kind: "quiz" }
    ],

    chapters: [
      {
        num: 38, title: "The Truth", hook: "SECRET REVEALED 🔓",
        summary: "Jaya and Jad hear noises and sneak into the barn. They find Roz holding a goose, and they figure out her secret. Roz tells the truth, and the children promise to keep it safe."
      },
      {
        num: 39, title: "The Allies", hook: "ESCAPE PLANNED 🗺️",
        summary: "The children want Roz to be happy and to go home to her island. Escaping is dangerous, so they work as a team on a plan. They hope Roz can leave when Brightbill returns in the spring."
      }
    ],

    /* story beats in order; scene = which little picture to show */
    beats: [
      { ch: 38, n: 1, scene: "barn", text: "Jaya and Jad hear strange noises. They sneak into the barn. Roz is there with cows and geese, holding a goose in her arms." },
      { ch: 38, n: 2, scene: "robot", text: "They figure it out! Roz's stories about a robot on an island were really about Roz herself." },
      { ch: 38, n: 3, scene: "goose", text: "Roz tells the truth. She lived on an island with wild animals. The goose is Brightbill, her adopted goose son." },
      { ch: 38, n: 4, scene: "lock", text: "Roz kept it secret. She was afraid of scaring the children. She also fears their father will send her back to the robot factory to be destroyed." },
      { ch: 38, n: 5, scene: "heart", text: "Jaya and Jad feel compassion for Roz. They promise not to tell their father." },
      { ch: 39, n: 1, scene: "family", text: "The children want Roz to be happy. They miss their own mother, so they know how much Roz and Brightbill need each other." },
      { ch: 39, n: 2, scene: "island", text: "They tell Roz she belongs on her island, with Brightbill, her family and her animal friends." },
      { ch: 39, n: 3, scene: "warning", text: "But escaping is dangerous. Their father can track Roz's movements. If she runs, he might think she is defective and send her away to be destroyed." },
      { ch: 39, n: 4, scene: "question", text: "Jaya wonders if Roz might really be defective. Roz says she does not feel broken. She feels different." },
      { ch: 39, n: 5, scene: "heart", text: "Jaya agrees. Being different does not mean something is wrong with you." },
      { ch: 39, n: 6, scene: "map", text: "Jad promises to help. Roz once saved his life, and now he wants to save hers. The children will research a safe escape plan, because Roz can only look up farming information." },
      { ch: 39, n: 7, scene: "geese", text: "Brightbill must lead his flock south to their wintering grounds. The children hope Roz will be ready to escape when he returns in the spring." },
      { ch: 39, n: 8, scene: "spring", text: "Getting back to her island will be hard. But Roz trusts Brightbill and the children to help her." }
    ],

    ideas: [
      { id: "compassion", icon: "💛", label: "Compassion", text: "Caring about other people's feelings and wanting to help. Jaya and Jad were not scared of Roz. They understood her and chose to protect her." },
      { id: "allies", icon: "🤝", label: "Allies", text: "Allies work together to help and protect someone. Jaya, Jad and Brightbill are Roz's allies." },
      { id: "different", icon: "🌈", label: "Different is not defective", text: "Roz says she is not broken, just different. Being different does not mean something is wrong with you." },
      { id: "teamwork", icon: "💪", label: "Teamwork, courage, loyalty", text: "Friendship, teamwork and courage help solve hard problems. Jad stays loyal to Roz because she once saved his life." }
    ],

    vocab: [
      { word: "compassion", def: "Caring about other people's feelings and wanting to help them." },
      { word: "allies", def: "People who work together to help and protect someone." },
      { word: "defective", def: "Not working the way something is supposed to." },
      { word: "migrate", def: "To fly south for the winter. The wintering grounds are where the geese spend it." }
    ],

    remember: {
      hooks: ["Chapter 38 = SECRET REVEALED 🔓", "Chapter 39 = ESCAPE PLANNED 🗺️"],
      takeaway: "Roz may be a robot, but she has feelings, a family and friends who care about her. Jaya and Jad show kindness by accepting her differences and helping her find a way home."
    },

    quiz: {
      id: "wild-robot-quest",
      quizName: "quiz",
      title: "Wild Robot quiz",
      questions: [
        { id: "discover", type: "mc", prompt: "How did Jaya and Jad find out Roz's secret?",
          choices: ["Roz told them at dinner", "They heard noises and investigated the barn", "Their father showed them a letter", "They saw Roz's picture in the news"],
          answer: 1, explain: "They heard strange noises, sneaked into the barn and found Roz holding a goose." },
        { id: "brightbill", type: "mc", prompt: "Who is Brightbill?",
          choices: ["A cow that lives in the barn", "Jad's pet goose", "Roz's adopted goose son", "The children's father"],
          answer: 2, explain: "Brightbill is the goose in Roz's arms. He is her adopted goose son." },
        { id: "father", type: "mc", prompt: "Why is Roz afraid of the children's father?",
          choices: ["He might send her back to the factory to be destroyed", "He might ask her to do more chores", "He might be angry about the noisy barn", "He might sell the geese"],
          answer: 0, explain: "If he learns the truth, he might send Roz back to the robot factory to be destroyed." },
        { id: "different", type: "mc", prompt: "What does Roz teach about being different?",
          choices: ["Different means something is broken", "Everyone should look and act the same", "Being different does not mean being defective", "Different robots should hide"],
          answer: 2, explain: "Roz feels different, not broken. Being different does not mean something is wrong with you." },
        { id: "jad", type: "mc", prompt: "Why does Jad especially want to help Roz?",
          choices: ["He wants a robot for his own", "Roz once saved his life", "Jaya told him he had to", "He is bored on the farm"],
          answer: 1, explain: "Roz once saved Jad's life, and now he wants to save hers." },
        { id: "spring", type: "mc", prompt: "When do the children hope Roz can escape?",
          choices: ["Tonight, while Father sleeps", "When winter starts", "When Brightbill returns in the spring", "At the end of the school year"],
          answer: 2, explain: "Brightbill must lead his flock south for winter. The children hope Roz is ready when he returns in the spring." }
      ]
    }
  };

  /* pure helper: total minutes of all steps */
  DATA.totalMinutes = function () {
    return DATA.steps.reduce(function (sum, s) { return sum + s.minutes; }, 0);
  };

  if (typeof module !== "undefined" && module.exports) module.exports = DATA; else root.WildRobotData = DATA;
})(typeof window !== "undefined" ? window : this);

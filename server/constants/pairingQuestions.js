// server/constants/pairingQuestions.js
//
// The style quiz's pairing questions ("Shirts over tops"), and what each
// answer does to the subtype pairs it covers - see
// services/pairingQuizService.js.
//
// Each question is a list of pair groups. In a group, every subtype in
// `pairs[0]` is paired with every subtype in `pairs[1]`, and `yes` / `no`
// are the points that answer adds to each pair's baseline score (limited
// to 0-100). "sometimes" changes nothing. OFF takes the pair to 0, under
// MIN_PAIR_SCORE, so it's never suggested automatically. Pairs the user's
// matrix doesn't allow (null) are skipped, so listing them here is
// harmless and never makes them match.
//
// The quiz sends yes for a ticked picture and no for one left unticked
// (core/styleQuiz/quizAnswers.js). The question labels and pictures live
// in core/constants/pairingQuestions.js. The keys must match.

const { MAX_SCORE } = require("./scoring.js");

const OFF = -MAX_SCORE;

const SHIRTS = ["Buttondown shirt", "Denim shirt", "Linen shirt"];
const TURTLENECKS = ["Short turtleneck", "Long turtleneck"];
const LAYERING_DRESSES = ["Winter dress", "Work dress", "Casual dress"];

const PAIRING_QUESTION_GENDERS = ["woman", "unisex"];

const pairingQuestions = {
  // A shirt over a tank.
  shirtsOverTops: {
    pairGroups: [
      { pairs: [SHIRTS, ["Vest", "Croptop"]], yes: 10, no: -10 },
      { pairs: [SHIRTS, ["Short t-shirt"]], yes: 5, no: -5 },
    ],
  },

  turtlenecksUnderShirts: {
    pairGroups: [
      {
        pairs: [
          TURTLENECKS,
          ["Buttondown shirt", "Denim shirt", "Linen shirt", "Floaty blouse", "Peasant/boho blouse", "Fancy blouse"],
        ],
        yes: 10,
        no: -10,
      },
    ],
  },

  topsUnderDresses: {
    pairGroups: [
      { pairs: [[...TURTLENECKS, "Long-sleeve t-shirt"], LAYERING_DRESSES], yes: 10, no: -10 },
      { pairs: [["Short t-shirt"], LAYERING_DRESSES], yes: 5, no: -5 },
    ],
  },

  // Never summer dresses - those are linenWithSummerDresses.
  shirtsUnderDresses: {
    pairGroups: [{ pairs: [SHIRTS, ["Work dress"]], yes: 10, no: -10 }],
  },

  linenWithSummerDresses: {
    pairGroups: [
      { pairs: [["Linen shirt"], ["Summer dress", "Strappy summer dress"]], yes: 10, no: -10 },
    ],
  },

  // Baseline 50: ticked takes it to 70, unticked turns it off.
  tshirtsOverLongSleeves: {
    pairGroups: [{ pairs: [["Short t-shirt"], ["Long-sleeve t-shirt"]], yes: 20, no: -10 }],
  },

  smartAndCasual: {
    pairGroups: [
      { pairs: [["Hoodie/sweatshirt"], ["Tailored blazer", "Longline blazer", "Classic trench"]], yes: 10, no: OFF },
      { pairs: [["Tailored blazer", "Longline blazer", "Classic trench"], ["Sweatpants", "Leggings"]], yes: 10, no: OFF },
      {
        pairs: [
          ["Hoodie/sweatshirt"],
          ["Mini skirt", "Winter mini skirt", "Midi-skirt", "Floaty maxi skirt", "Fitted maxi skirt", "Smart skirt"],
        ],
        yes: 10,
        no: OFF,
      },
      { pairs: [["Cargo pants"], ["Fancy top", "Fancy blouse", "Tailored blazer", "Longline blazer"]], yes: 10, no: OFF },
    ],
  },
};

module.exports = {
  PAIRING_QUESTION_GENDERS,
  pairingQuestions,
};

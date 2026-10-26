// server/constants/pairingQuestions.js
//
// The style quiz's pairing questions ("Do you like shirts over tops?"),
// and which subtype pairs each one sets. The answer's value
// (PAIRING_ANSWER_ADJUSTMENTS in scoring.js) becomes the personal
// adjustment of every pair in the question - see
// services/pairingQuizService.js.
//
// Each question's `pairGroups` is a list of [subtypesA, subtypesB]; every
// subtype in subtypesA is paired with every subtype in subtypesB. Pairs the
// user's matrix doesn't allow (null) are skipped, so listing them here is
// harmless and never makes them match.
//
// The question text and images live in src/constants/pairingQuestions.js.
// The keys must match between the two files.

const DRESSES = [
  "Summer dress",
  "Wedding guest dress",
  "Evening dress",
  "Cocktail dress",
  "Winter dress",
  "Casual dress",
  "Work dress",
];

const PAIRING_QUESTION_GENDERS = ["woman", "unisex"];

const pairingQuestions = {
  shirtsOverTops: {
    pairGroups: [
      [
        ["Buttondown shirt", "Linen shirt"],
        ["Short t-shirt", "Long t-shirt", "Vest", "Croptop", "Bodysuit", "Fancy top"],
      ],
    ],
  },

  turtlenecksUnderShirts: {
    pairGroups: [
      [
        ["Short turtleneck", "Long turtleneck"],
        ["Buttondown shirt", "Linen shirt", "Floaty blouse", "Fancy blouse"],
      ],
    ],
  },

  topsUnderDresses: {
    pairGroups: [
      [["Short t-shirt", "Long t-shirt", "Short turtleneck", "Long turtleneck"], DRESSES],
    ],
  },

  smartAndCasual: {
    pairGroups: [
      [["Hoodie/sweatshirt"], ["Blazer", "Trench coat"]],
      [["Blazer", "Trench coat"], ["Sweatpants", "Leggings"]],
      [
        ["Hoodie/sweatshirt"],
        ["Mini skirt", "Midi-skirt", "Maxi skirt", "Smart skirt"],
      ],
      [["Cargo pants"], ["Fancy top", "Fancy blouse", "Blazer"]],
    ],
  },

  croptopsLowRise: {
    pairGroups: [[["Croptop"], ["Low waist jeans"]]],
  },
};

module.exports = {
  PAIRING_QUESTION_GENDERS,
  pairingQuestions,
};

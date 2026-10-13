/* --------------------------------------------------------------------
   PAIRING QUESTIONS (style quiz)

   Yes / Sometimes / No questions about pairings people feel strongly
   about. Shown only to the genders in `pairingQuestionGenders`, after the
   style images. The answer sets the starting score of every subtype pair
   in the question - which pairs, and by how much, is decided on the
   server in server/constants/pairingQuestions.js and
   PAIRING_ANSWER_ADJUSTMENTS in server/constants/scoring.js. The `key`s
   must match the server's.

   `section` is the heading shown above the question. `images` are shown
   in a row above the answers - a null entry shows a placeholder tile.
   To add a picture, import it at the top of this file and replace a null.
-------------------------------------------------------------------- */

export const pairingQuestionGenders = ["woman", "unisex"];

const LAYERING = "A few layering questions...";
const MIXING = "And a couple about mixing styles...";

export const pairingQuestions = [
  {
    key: "shirtsOverTops",
    section: LAYERING,
    question: "Do you like shirts over tops?",
    images: [null, null, null],
  },
  {
    key: "turtlenecksUnderShirts",
    section: LAYERING,
    question: "Do you like turtlenecks under shirts or blouses?",
    images: [null, null, null],
  },
  {
    key: "topsUnderDresses",
    section: LAYERING,
    question: "Do you like t-shirts or turtlenecks under dresses?",
    images: [null, null, null],
  },
  {
    key: "smartAndCasual",
    section: MIXING,
    question: "Do you like to mix smart and casual?",
    images: [null, null, null],
  },
  {
    key: "croptopsLowRise",
    section: MIXING,
    question: "Do you like croptops with low-rise bottoms?",
    images: [null, null, null],
  },
];

export const pairingAnswerOptions = [
  { label: "Yes", value: "yes" },
  { label: "Sometimes", value: "sometimes" },
  { label: "No", value: "no" },
];

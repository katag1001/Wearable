// core/styleQuiz/pairingSections.js

import { pairingQuestions } from "../constants/pairingQuestions.js";

// The pairing questions grouped under their section headings, in order:
// [{ section, questions: [...] }].
export const getPairingSections = () => {
  const sections = [...new Set(pairingQuestions.map((q) => q.section))];

  return sections.map((section) => ({
    section,
    questions: pairingQuestions.filter((q) => q.section === section),
  }));
};

import {
  styleImageOptions,
  levelPriority,
} from "../constants/styleQuizOptions";

const countBy = (options, field) => {
  const counts = {};

  options.forEach((option) => {
    const value = option[field];
    counts[value] = (counts[value] || 0) + 1;
  });

  return counts;
};

const pickWinner = (counts, priorityOrder) => {
  let winner = null;
  let winnerCount = 0;

  priorityOrder.forEach((option) => {
    const count = counts[option] || 0;

    if (count > winnerCount) {
      winner = option;
      winnerCount = count;
    }
  });

  return winner;
};

/**
 * Given the keys of the style images a user selected, returns the
 * {colour, pattern} majority vote, breaking ties using the fixed
 * priority order in styleQuizOptions.js.
 */
export const resolveStyleQuiz = (selectedImageKeys) => {
  const selectedOptions = styleImageOptions.filter((option) =>
    selectedImageKeys.includes(option.key)
  );

  return {
    colour: pickWinner(countBy(selectedOptions, "colour"), levelPriority),
    pattern: pickWinner(countBy(selectedOptions, "pattern"), levelPriority),
  };
};

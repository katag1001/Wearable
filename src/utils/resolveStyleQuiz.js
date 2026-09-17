import {
  styleImageOptions,
  stylePriority,
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
 * {style, colour, pattern} majority vote, breaking ties using the
 * fixed priority order in styleQuizOptions.js.
 *
 * Men only have a single style archetype ("all") for now, so gender always
 * forces the style outcome for "man" rather than deriving it from images -
 * colour/pattern are still computed normally either way.
 */
export const resolveStyleQuiz = (selectedImageKeys, gender) => {
  const selectedOptions = styleImageOptions.filter((option) =>
    selectedImageKeys.includes(option.key)
  );

  return {
    style:
      gender === "man"
        ? "all"
        : pickWinner(countBy(selectedOptions, "style"), stylePriority),
    colour: pickWinner(countBy(selectedOptions, "colour"), levelPriority),
    pattern: pickWinner(countBy(selectedOptions, "pattern"), levelPriority),
  };
};

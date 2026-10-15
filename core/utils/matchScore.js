// A favourite is always shown and sorted as 100. The match's stored score
// (set once by the server when the match was created) is left unchanged,
// so unfavouriting returns the match to its original score.
export const FAVOURITE_SCORE = 100;

export const getEffectiveMatchScore = (match) => {
  if (!match) return 0;

  if (match.favourite) return FAVOURITE_SCORE;

  return typeof match.score === "number" ? match.score : 0;
};

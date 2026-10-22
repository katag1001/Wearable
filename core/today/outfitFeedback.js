// core/today/outfitFeedback.js
//
// The broken heart on the Today page: "too hot", "too cold" or "mismatch"
// for the outfit on screen. Each takes outfits off today's list and moves
// on to the next. Server rules: temperatureFeedbackService.js and
// mismatchService.js.

export const TOO_HOT = "too_hot";
export const TOO_COLD = "too_cold";

// How many items a mismatch is between.
export const MISMATCH_ITEM_COUNT = 2;

const isIn = (ids) => {
  const set = new Set(ids.map(String));

  return (outfit) => set.has(String(outfit?.matchId?._id));
};

export const withoutOutfits = (outfits, matchIds) => {
  const removed = isIn(matchIds);

  return outfits.filter((outfit) => !removed(outfit));
};

// Where to be in `list` once `matchIds` are gone from it: the outfit that
// was next moves into the current one's place - wrapping to the first if
// the last one went.
export const indexAfterRemoving = (list, currentIndex, matchIds) => {
  const removed = isIn(matchIds);

  const removedBefore = list.slice(0, currentIndex).filter(removed).length;
  const remaining = list.filter((outfit) => !removed(outfit)).length;

  return remaining > 0 ? (currentIndex - removedBefore) % remaining : 0;
};

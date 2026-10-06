// server/constants/scoring.js
//
// Every number that decides a score, in one place.
//
// Pair scores (0-100) come from the matrix files plus the user's personal
// adjustment for that pair. A match's `score` is set once, when the match
// is created (see services/outfitScoreService.js), and is never
// recalculated - except when a user claims an automatic match by building
// the same outfit themselves.

const MIN_SCORE = 0;
const MAX_SCORE = 100;

// Automatic outfits: 70% of the average pair score + 30% of the lowest,
// so one clashing pair pulls the whole outfit down.
const AVERAGE_PAIR_WEIGHT = 0.7;
const LOWEST_PAIR_WEIGHT = 0.3;

// Outfits with no pairs to score (a onepiece on its own).
const SINGLE_ITEM_SCORE = 80;

// Every outfit the user builds (or claims) gets this flat score.
const USER_MADE_SCORE = 90;

// Change to every compatible pair in an outfit when the user acts on it.
const LEARNING_DELTAS = {
  created: 5,
  claimed: 5,
  favourited: 3,
  unfavourited: -3,
  deleted: -2,
};

module.exports = {
  MIN_SCORE,
  MAX_SCORE,
  AVERAGE_PAIR_WEIGHT,
  LOWEST_PAIR_WEIGHT,
  SINGLE_ITEM_SCORE,
  USER_MADE_SCORE,
  LEARNING_DELTAS,
};

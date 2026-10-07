// server/constants/scoring.js
//
// Every number that decides a score, in one place.
//
// Pair scores (0-100) come from the matrix files plus the user's personal
// adjustment for that pair. A match's `score` is set once, when the match
// is created (see services/outfitScoreService.js), and is never
// recalculated - except when a user claims an automatic match by building
// the same outfit themselves, or rejects it on the Today page
// (services/matchRejectionService.js).

const MIN_SCORE = 0;
const MAX_SCORE = 100;

// Automatic outfits: 70% of the average pair score + 30% of the lowest,
// so one clashing pair pulls the whole outfit down.
const AVERAGE_PAIR_WEIGHT = 0.7;
const LOWEST_PAIR_WEIGHT = 0.3;

// Outfits with no pairs to score (a onepiece on its own).
const SINGLE_ITEM_SCORE = 80;

// Automatic outfits scoring below this are never saved - complete matching
// on a large wardrobe finds tens of thousands of outfits per item, most of
// them poor. Doesn't apply to outfits the user builds.
const MIN_AUTO_MATCH_SCORE = 60;

// Every outfit the user builds (or claims) gets this flat score.
const USER_MADE_SCORE = 90;

// Change to every compatible pair in an outfit when the user acts on it.
const LEARNING_DELTAS = {
  created: 5,
  claimed: 5,
  favourited: 3,
  unfavourited: -3,
  deleted: -0.25,
};

// Rejecting an outfit on the Today page (at most once per outfit per day)
// takes this off its stored score, and keeps it out of the Today list for
// this many days.
const REJECTION_SCORE_PENALTY = 3;
const REJECTION_COOLDOWN_DAYS = 5;

module.exports = {
  MIN_SCORE,
  MAX_SCORE,
  AVERAGE_PAIR_WEIGHT,
  LOWEST_PAIR_WEIGHT,
  SINGLE_ITEM_SCORE,
  MIN_AUTO_MATCH_SCORE,
  USER_MADE_SCORE,
  LEARNING_DELTAS,
  REJECTION_SCORE_PENALTY,
  REJECTION_COOLDOWN_DAYS,
};

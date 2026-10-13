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

// Matrix baseline scores stop below MAX_SCORE so the user's own behaviour
// (LEARNING_DELTAS) always has room to push a pair above its baseline.
const MAX_BASELINE_SCORE = 90;

// Automatic outfits: 70% of the average pair score + 30% of the lowest,
// so one clashing pair pulls the whole outfit down.
const AVERAGE_PAIR_WEIGHT = 0.7;
const LOWEST_PAIR_WEIGHT = 0.3;

// Automatic outfits with 2+ items: the pair blend above counts for 60% of the
// final score, and the colour score (COLOUR_COUNT_SCORES) for 40%.
const PAIR_SCORE_WEIGHT = 0.6;
const COLOUR_SCORE_WEIGHT = 0.4;

// Score for the number of distinct colours in an outfit, per colour level
// (Preferences.colour). Entry 0 is 1 colour, entry 1 is 2 colours, and so
// on; the last entry is used for anything more. Each level's colour cap is
// in utils/colorPalettes.js (maxColorsByLevel).
const COLOUR_COUNT_SCORES = {
  min: [65, 75, 85, 65],
  mid: [65, 55, 85, 85, 65, 55],
  max: [25, 45, 75, 85, 75, 65, 45],
};

// Outfits with no pairs to score (a onepiece on its own). Not affected by
// the colour score.
const SINGLE_ITEM_SCORE = 80;

// Automatic outfits scoring below this are never saved - complete matching
// on a large wardrobe finds tens of thousands of outfits per item, most of
// them poor. Doesn't apply to outfits the user builds.
const MIN_AUTO_MATCH_SCORE = 65;

// Automatic outfits whose pair blend (before the colour score) is below
// this are never saved either, however good their colours - so colour can
// only rank outfits whose pairs are already good enough, never rescue one.
// Doesn't apply to a single item, which has no pairs.
const MIN_AUTO_PAIR_SCORE = 60;

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

// Style quiz pairing questions (constants/pairingQuestions.js): each answer
// sets the personal adjustment of every pair in that question to this
// value, replacing whatever was there. "no" takes the pair score down to
// MIN_SCORE (the adjustment is limited at 0), which keeps every outfit
// with that pair under MIN_AUTO_PAIR_SCORE so it is never suggested
// automatically - anything smaller gets diluted by the outfit's other pairs.
const PAIRING_ANSWER_ADJUSTMENTS = {
  yes: 10,
  sometimes: -10,
  no: -MAX_SCORE,
};

// Rejecting an outfit on the Today page (at most once per outfit per day)
// takes this off its stored score, and keeps it out of the Today list for
// this many days.
const REJECTION_SCORE_PENALTY = 3;
const REJECTION_COOLDOWN_DAYS = 5;

module.exports = {
  MIN_SCORE,
  MAX_SCORE,
  MAX_BASELINE_SCORE,
  AVERAGE_PAIR_WEIGHT,
  LOWEST_PAIR_WEIGHT,
  PAIR_SCORE_WEIGHT,
  COLOUR_SCORE_WEIGHT,
  COLOUR_COUNT_SCORES,
  SINGLE_ITEM_SCORE,
  MIN_AUTO_MATCH_SCORE,
  MIN_AUTO_PAIR_SCORE,
  USER_MADE_SCORE,
  LEARNING_DELTAS,
  PAIRING_ANSWER_ADJUSTMENTS,
  REJECTION_SCORE_PENALTY,
  REJECTION_COOLDOWN_DAYS,
};

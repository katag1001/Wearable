// server/constants/scoring.js
//
// Every number that decides a score, in one place.
//
// Pair scores (0-100) come from the matrix files plus the user's personal
// adjustment for that pair. A match's `score` is set once, when the match
// is created (see services/outfitScoreService.js). After that it only
// changes when the user claims an automatic match by building the same
// outfit themselves, rejects it on the Today page
// (services/matchRejectionService.js), or favourites / unfavourites one of
// its clothing items (services/favouriteItemService.js).

const MIN_SCORE = 0;
const MAX_SCORE = 100;

// Matrix baseline scores stop below MAX_SCORE so the user's own behaviour
// (LEARNING_DELTAS) always has room to push a pair above its baseline.
const MAX_BASELINE_SCORE = 90;

// Automatic outfits: 70% of the average pair score + 30% of the lowest,
// so one clashing pair pulls the whole outfit down.
const AVERAGE_PAIR_WEIGHT = 0.7;
const LOWEST_PAIR_WEIGHT = 0.3;

// If any pair in an outfit scores below this, the outfit's pair blend is
// that pair's score instead - so it always fails MIN_AUTO_SCORE. The search
// drops an outfit the moment such a pair appears (matchService.js).
const MIN_PAIR_SCORE = 50;

// Automatic outfits with 2+ items: the pair blend above counts for 50% of the
// final score, and the colour score (computeColourScore) for 50%.
const PAIR_SCORE_WEIGHT = 0.5;
const COLOUR_SCORE_WEIGHT = 0.5;

// The colour score is the average of the colour-count score and the palette
// tier score, plus the favourite-palette bonus, the bright-colour
// adjustment and the pattern echo adjustment, kept between 0 and 100.

// Score for the number of distinct colours in an outfit, per colour level
// (Preferences.colour). Entry 0 is 1 colour, entry 1 is 2 colours, and so
// on; the last entry is used for anything more. Each level's colour cap is
// in shared/colorPalettes.json (maxColors).
const COLOUR_COUNT_SCORES = {
  min: [65, 70, 70, 65],
  mid: [65, 65, 70, 70, 60, 50],
  max: [20, 40, 65, 70, 70, 60, 60],
};

// Score for each palette tier (shared/colorPalettes.json), per colour level:
// min favours classic combinations, max favours bold ones. An outfit that
// fits several of its level's palettes gets the best of their scores.
const PALETTE_TIER_SCORES = {
  min: { classic: 95, common: 70, bold: 30 },
  mid: { classic: 80, common: 85, bold: 65 },
  max: { classic: 65, common: 75, bold: 90 },
};

// Added when the outfit's colours fit one of the user's favourite palettes
// (Preferences.favouritePalettes), at any level.
const FAVOURITE_PALETTE_BONUS = 8;

// Change for the number of bright colours in an outfit
// (brightColours in shared/colorPalettes.json), per colour level. Entry 0 is
// no bright colours, entry 1 is one; the last entry is used for anything
// more.
const BRIGHT_COLOUR_ADJUSTMENTS = {
  min: [0, 0, -10, -30],
  mid: [0, 3, -15],
  max: [0, 0, 0],
};

// Pattern echo: in an outfit with a patterned item, the change for the
// number of distinct colours the other items add that aren't already in
// the pattern, per pattern level (Preferences.pattern). Entry 0 is no new
// colours (the plain pieces only echo the pattern), entry 1 is one; the
// last entry is used for anything more. Users with no pattern level get
// DEFAULT_PATTERN_LEVEL.
const PATTERN_ECHO_ADJUSTMENTS = {
  min: [6, -3, -10],
  mid: [4, -2, -6],
  max: [2, -1, -3],
};
const DEFAULT_PATTERN_LEVEL = "mid";

// Outfits with no pairs to score (a onepiece on its own). Not affected by
// the colour score, and never dropped by MIN_AUTO_SCORE.
const SINGLE_ITEM_SCORE = 85;

// Automatic outfits whose pair blend OR colour score is below this are
// dropped as soon as they're scored, and never saved - complete matching on
// a large wardrobe finds tens of thousands of outfits per item, most of them
// poor. Since the final score is a weighted average of the two, every saved
// outfit also scores at least this. Doesn't apply to outfits the user builds.
const MIN_AUTO_SCORE = 65;

// Automatic outfits never score above this, so they always rank below
// USER_MADE_SCORE.
const MAX_AUTO_SCORE = 90;

// Every outfit the user builds (or claims) gets this flat score.
const USER_MADE_SCORE = 95;

// Added once to an automatic outfit's score when any of its clothing items
// is a favourite (Clothes.favourite) - after the outfit has passed every
// check and been chosen, so it never lets a weaker outfit in. It never
// takes the score above MAX_AUTO_SCORE, and the amount actually added is
// stored on the match (favouriteItemBonus), so unfavouriting takes off
// exactly that. User-made outfits stay at USER_MADE_SCORE.
const FAVOURITE_ITEM_BONUS = 7;

// Change to every compatible pair in an outfit when the user acts on it.
// Unfavouriting and deleting outfits change nothing. `mismatched` is the
// exception: it only changes the one subtype pair the user marked as a
// mismatch on the Today page (services/mismatchService.js).
const LEARNING_DELTAS = {
  created: 3,
  claimed: 1,
  favourited: 3,
  mismatched: -5,
};

// Style quiz pairing questions (constants/pairingQuestions.js): each answer
// sets the personal adjustment of every pair in that question to this
// value, replacing whatever was there. "no" takes the pair score down to
// MIN_SCORE (the adjustment is limited at 0), which is under MIN_PAIR_SCORE,
// so no outfit with that pair is ever suggested automatically.
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

// "Too hot" / "too cold" on the Today page moves the outfit's min_temp and
// max_temp this many degrees (services/temperatureFeedbackService.js).
const TEMPERATURE_FEEDBACK_SHIFT = 1;

// Footwear on the Today page (server/services/footwearScoreService.js):
// the change to an outfit-bottom + shoe pairing's personal adjustment.
// Scrolling past a shoe counts at most once per pairing per day; wearing it
// takes back a rejection from the same day.
const FOOTWEAR_LEARNING_DELTAS = {
  rejected: -0.1,
  worn: 1,
};

module.exports = {
  MIN_SCORE,
  FOOTWEAR_LEARNING_DELTAS,
  MAX_SCORE,
  MAX_BASELINE_SCORE,
  AVERAGE_PAIR_WEIGHT,
  LOWEST_PAIR_WEIGHT,
  PAIR_SCORE_WEIGHT,
  COLOUR_SCORE_WEIGHT,
  MIN_PAIR_SCORE,
  COLOUR_COUNT_SCORES,
  PALETTE_TIER_SCORES,
  FAVOURITE_PALETTE_BONUS,
  BRIGHT_COLOUR_ADJUSTMENTS,
  PATTERN_ECHO_ADJUSTMENTS,
  DEFAULT_PATTERN_LEVEL,
  SINGLE_ITEM_SCORE,
  MIN_AUTO_SCORE,
  MAX_AUTO_SCORE,
  USER_MADE_SCORE,
  FAVOURITE_ITEM_BONUS,
  LEARNING_DELTAS,
  PAIRING_ANSWER_ADJUSTMENTS,
  REJECTION_SCORE_PENALTY,
  REJECTION_COOLDOWN_DAYS,
  TEMPERATURE_FEEDBACK_SHIFT,
};

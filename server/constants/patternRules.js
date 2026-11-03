// server/constants/patternRules.js
//
// The pattern rules for automatic outfits. They only approve or reject an
// outfit - they never change its score. The values themselves (one per
// clothing item) are listed in shared/patterns.json.
//
// Checked in services/styleColorService.js (patternFailure), with the
// user's Preferences.pattern level (min / mid / max):
//  1. At most MAX_PATTERNED_ITEMS[level] items that aren't PLAIN.
//  2. The same pattern twice is rejected, except REPEATABLE_PATTERNS.
//  3. GRAPHIC is never worn with another pattern.
//  4. Two BOLD_PATTERNS together are rejected below "max".
// At "min" only rule 1 can ever fire, since it allows one pattern.

const PATTERNS = require("../../shared/patterns.json");

const PLAIN = "Plain";
const GRAPHIC = "Graphic/slogan";

const MAX_PATTERNED_ITEMS = { min: 1, mid: 2, max: 2 };

const REPEATABLE_PATTERNS = ["Lace/broderie"];

const BOLD_PATTERNS = ["Floral", "Animal print", "Paisley", "Geometric", "Camo"];

// The levels that allow two bold patterns together.
const BOLD_PAIR_LEVELS = ["max"];

module.exports = {
  PATTERNS,
  PLAIN,
  GRAPHIC,
  MAX_PATTERNED_ITEMS,
  REPEATABLE_PATTERNS,
  BOLD_PATTERNS,
  BOLD_PAIR_LEVELS,
};

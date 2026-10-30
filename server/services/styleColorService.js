// server/services/styleColorService.js
//
// Pure pattern and colour checks for a finished candidate outfit's items.
// No DB access here. These are the two checks that (along with the matrix
// clique check in matrixService) make up validateOutfit's gate for
// auto-generated candidates - never applied to user-made outfits.

const { paletteFits } = require("../utils/colorPalettes.js");
const { DEFAULT_PATTERN_LEVEL } = require("../constants/scoring.js");
const {
  PLAIN,
  GRAPHIC,
  MAX_PATTERNED_ITEMS,
  REPEATABLE_PATTERNS,
  BOLD_PATTERNS,
  BOLD_PAIR_LEVELS,
} = require("../constants/patternRules.js");

// Whether an item has a pattern - anything but Plain. An item saved before
// pattern was a field has none, and counts as plain.
function isPatterned(item) {
  return Boolean(item.pattern) && item.pattern !== PLAIN;
}

// The reason two patterns can't be worn together at this level, or null.
function patternPairFailure(a, b, level) {
  if (a === b && !REPEATABLE_PATTERNS.includes(a)) {
    return `the same pattern twice (${a})`;
  }

  if (a === GRAPHIC || b === GRAPHIC) {
    return "a graphic print with another pattern";
  }

  if (!BOLD_PAIR_LEVELS.includes(level) && BOLD_PATTERNS.includes(a) && BOLD_PATTERNS.includes(b)) {
    return `two bold patterns (${a} and ${b})`;
  }

  return null;
}

// Why these items break the pattern rules (constants/patternRules.js) at the
// user's Preferences.pattern level, or null if they pass. Monotonic - adding
// items never makes a failing set pass - so it can prune a partial outfit.
function patternFailure(items, level = DEFAULT_PATTERN_LEVEL) {
  const patterns = items.filter(isPatterned).map((item) => item.pattern);
  const maxPatterned = MAX_PATTERNED_ITEMS[level] ?? MAX_PATTERNED_ITEMS[DEFAULT_PATTERN_LEVEL];

  if (patterns.length > maxPatterned) {
    return `more than ${maxPatterned} patterned item${maxPatterned === 1 ? "" : "s"}`;
  }

  for (let i = 0; i < patterns.length; i += 1) {
    for (let j = i + 1; j < patterns.length; j += 1) {
      const failure = patternPairFailure(patterns[i], patterns[j], level);

      if (failure) {
        return failure;
      }
    }
  }

  return null;
}

function passesPatternCheck(items, level = DEFAULT_PATTERN_LEVEL) {
  return patternFailure(items, level) === null;
}

// `colorRules` is the caller's already-resolved { palettes, maxColors } for
// their own Preferences.colour level (min/mid/max) - see
// server/utils/colorPalettes.js. An outfit must both fit within one shared
// palette AND stay within the level's distinct-colour-count cap
// (maxColors === null means no cap).
function passesColorCheck(items, colorRules) {
  const combinedColors = [...new Set(items.flatMap((item) => item.colors || []))];

  if (colorRules.maxColors !== null && combinedColors.length > colorRules.maxColors) {
    return false;
  }

  return colorRules.palettes.some((palette) => paletteFits(palette, combinedColors));
}

module.exports = { isPatterned, patternFailure, passesPatternCheck, passesColorCheck };

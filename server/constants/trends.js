// server/constants/trends.js
//
// Current trends (the Trend collection, edited on the web /trends page by
// admins) and what they do on Today (services/trendService.js). Like the
// season, trends only ever add to the Today score - never the saved one.

// Preferences.trends (1 = not at all ... 5 = absolutely) -> points for an
// outfit that's on one trend, and the most it can get however many
// trends it's on. Unanswered counts as 1 (no effect).
const TREND_POINTS = {
  one: { 1: 0, 2: 0, 3: 1, 4: 3, 5: 6 },
  max: { 1: 0, 2: 0, 3: 1, 4: 6, 5: 8 },
};

const DEFAULT_TRENDS_LEVEL = 1;

// From this level up, Today says which trend an outfit is on
// (the trend's label is the whole note).
const TREND_NOTE_MIN_LEVEL = 4;

// A trend saved without an end date ends this many months after it's added.
const TREND_DEFAULT_MONTHS = 3;

// The most pieces (items) one trend can combine.
const TREND_MAX_PIECES = 4;

const TREND_LABEL_MAX_LENGTH = 120;

module.exports = {
  TREND_POINTS,
  DEFAULT_TRENDS_LEVEL,
  TREND_NOTE_MIN_LEVEL,
  TREND_DEFAULT_MONTHS,
  TREND_MAX_PIECES,
  TREND_LABEL_MAX_LENGTH,
};

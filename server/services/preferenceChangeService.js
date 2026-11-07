// server/services/preferenceChangeService.js
//
// Works out what a preference change (PUT /preferences - the style quiz,
// its retake, Style Preferences) does to the user's saved outfits. Pure: no
// database access. Every preference is compared as matching reads it, so
// a different answer that resolves the same (other style pictures giving
// the same colour level, no answer and the default) changes nothing.
//
//   gender           -> every outfit is rebuilt (allItems)
//   colour level     -> every outfit is rebuilt (allItems)
//   pattern level    -> only outfits with a patterned item are rebuilt
//   pairing answers  -> only outfits with an item of a subtype in a pair
//                       whose quiz part changed are rebuilt
//   temperature      -> nothing is rebuilt: the outfits' temperature ranges
//                       are worked out again in place
//                       (outfitTemperatureRefreshService.js)
//   colour families, seasonality, trends -> Today's ranking only
//
// The outfit rebuild itself: outfitRebuildService.js. Today is built again
// after any of these (todayChanged).

const { ROLES } = require("../constants/outfitShapes.js");
const { DEFAULT_PATTERN_LEVEL } = require("../constants/scoring.js");
const { DEFAULT_SEASONALITY } = require("../constants/seasonality.js");
const { DEFAULT_TRENDS_LEVEL } = require("../constants/trends.js");
const { getColorRules } = require("../utils/colorPalettes.js");
const { preferenceShiftOf } = require("./presetTemperatureService.js");
const { isPatterned } = require("./styleColorService.js");

const DEFAULT_GENDER = "unisex";

// A partial rebuild covering at least this share of the wardrobe is done
// as a full one - it costs about the same and is simpler.
const FULL_REBUILD_SHARE = 0.8;

// Each preference as matching and Today read it.
const resolved = (preferences = {}) => ({
  gender: preferences.gender || DEFAULT_GENDER,
  colour: getColorRules(preferences.colour).level,
  pattern: preferences.pattern || DEFAULT_PATTERN_LEVEL,
  temperatureShift: preferenceShiftOf(preferences.temperature),
  favouriteColourFamilies: [...(preferences.favouriteColourFamilies || [])].sort().join(","),
  seasonality: preferences.seasonality || DEFAULT_SEASONALITY,
  trends: preferences.trends || DEFAULT_TRENDS_LEVEL,
});

// The preferences once `changes` are saved: a field left out (undefined)
// keeps its saved value, as with the $set in updatePreferences.
const preferencesAfter = (before, changes) => {
  const after = { ...(before || {}) };

  Object.entries(changes).forEach(([field, value]) => {
    if (value !== undefined) after[field] = value;
  });

  return after;
};

// `before`: the saved preferences (null for a new user). `after`: the
// preferences once saved (preferencesAfter). `changedPairs`: the pairs
// whose quiz part changes ([{ subtypeA, subtypeB }],
// pairingQuizService.planPairingAnswers).
//
// Returns { rebuild, temperatureChanged, todayChanged }. `rebuild` is null
// (nothing to rebuild), { allItems: true }, or { allItems: false,
// patterned, subtypes } - rebuild the outfits with a patterned item
// (patterned: true) and with an item of one of `subtypes`.
function planPreferenceChange(before, after, { changedPairs = [] } = {}) {
  const old = resolved(before || {});
  const next = resolved(after);

  const changed = (field) => old[field] !== next[field];

  let rebuild = null;

  if (changed("gender") || changed("colour")) {
    rebuild = { allItems: true };
  } else if (changed("pattern") || changedPairs.length) {
    rebuild = {
      allItems: false,
      patterned: changed("pattern"),
      subtypes: [
        ...new Set(changedPairs.flatMap(({ subtypeA, subtypeB }) => [subtypeA, subtypeB])),
      ],
    };
  }

  const temperatureChanged = changed("temperatureShift");

  const todayChanged =
    Boolean(rebuild) ||
    temperatureChanged ||
    changed("favouriteColourFamilies") ||
    changed("seasonality") ||
    changed("trends");

  return { rebuild, temperatureChanged, todayChanged };
}

// The items to match again for `rebuild` (planPreferenceChange), from the
// user's wardrobe, and whether it's done as a full rebuild. Only items
// that go into outfits (ROLES) count. { allItems, itemIds }; itemIds is
// empty when there's nothing to rebuild.
function rebuildItemsFor(rebuild, wardrobe) {
  const matchable = wardrobe.filter((item) => ROLES.includes(item.type));

  if (!rebuild || !matchable.length) {
    return { allItems: false, itemIds: [] };
  }

  const all = { allItems: true, itemIds: matchable.map((item) => item._id) };

  if (rebuild.allItems) {
    return all;
  }

  const subtypes = new Set(rebuild.subtypes);
  const inScope = matchable.filter(
    (item) => (rebuild.patterned && isPatterned(item)) || subtypes.has(item.subtype)
  );

  if (inScope.length >= matchable.length * FULL_REBUILD_SHARE) {
    return all;
  }

  return { allItems: false, itemIds: inScope.map((item) => item._id) };
}

module.exports = {
  FULL_REBUILD_SHARE,
  preferencesAfter,
  planPreferenceChange,
  rebuildItemsFor,
};

// server/services/presetTemperatureService.js
//
// Works out an outfit's temperature range from its subtypes and fabrics,
// using the presets in constants/temperatureGroups.js. Clothing items' own
// min_temp/max_temp are never read. Pure - no DB access.
//
// 1. Base range:
//    - with a onepiece: that onepiece's own range (if a user-built outfit
//      has more than one, the coldest), minus ONEPIECE_LAYER_POINTS for
//      every top worn with it;
//    - otherwise: BASE_RANGES for the warmest top's level and the warmest
//      bottom's level, minus LAYER_BONUS for every other top. With no top
//      NO_TOP_LEVEL is used; with no bottom NO_BOTTOM_LEVEL.
// 2. Fabric: the tops', bottoms' and onepieces' fabric warmth
//    (shared/fabrics.json) is added up - leaving out fabrics their subtype
//    already assumes (FABRIC_NAMED_SUBTYPES) - limited to
//    FABRIC_SHIFT_LIMIT either way, and moves the range down by it.
// 3. Outers: their warmth points are added together and move the whole
//    range down, with the maximum never above OUTER_CEILING_BASE minus the
//    points. The minimum is then lowered if needed so the range is at
//    least OUTER_MIN_SPAN wide.
// 4. Floors: the minimum is never below NO_OUTER_MIN_TEMP with no outer,
//    or the lowest of its outers' OUTER_MIN_TEMPS. An outfit with a skirt
//    or dress (SKIRT_DRESS_SUBTYPES) is also never below
//    SKIRT_DRESS_MIN_TEMP; the higher floor wins. If a floor lifts the
//    minimum above the maximum, the maximum is raised to match.
// 5. Caps: LAYERED_MAX_TEMP with layered tops, BOTTOM_MAX_TEMPS for the
//    warmest bottom's level, SUBTYPE_MAX_TEMPS for any subtype in the
//    outfit. A minimum above a cap is lowered to it. Then a range narrower
//    than MIN_SPAN is widened upwards from its minimum.
// 6. The user's temperature preference shifts the whole range.
//
// Subtypes missing from the presets fall back to a middle value (level 3
// for a top or bottom, a 15-25 onepiece, a 5-point outer) and are reported
// in `unknownSubtypes`, so nothing is silently dropped.

const {
  TOP_LEVELS,
  BOTTOM_LEVELS,
  BASE_RANGES,
  NO_TOP_LEVEL,
  NO_BOTTOM_LEVEL,
  LAYER_BONUS,
  ONEPIECE_LAYER_POINTS,
  FABRIC_SHIFT_LIMIT,
  FABRIC_NAMED_SUBTYPES,
  ONEPIECE_RANGES,
  OUTER_WARMTH_POINTS,
  NO_OUTER_MIN_TEMP,
  OUTER_MIN_TEMPS,
  SKIRT_DRESS_MIN_TEMP,
  SKIRT_DRESS_SUBTYPES,
  LAYERED_MAX_TEMP,
  BOTTOM_MAX_TEMPS,
  SUBTYPE_MAX_TEMPS,
  OUTER_CEILING_BASE,
  OUTER_MIN_SPAN,
  MIN_SPAN,
  TEMPERATURE_PREFERENCE_SHIFT,
  TEMPERATURE_LIMITS,
} = require("../constants/temperatureGroups.js");
const FABRIC_LIST = require("../../shared/fabrics.json");

const FALLBACK_LEVEL = 3;
const FALLBACK_ONEPIECE_RANGE = [15, 25];
const FALLBACK_OUTER_POINTS = 5;

// { 1: [subtypes], ... } -> { subtype: 1, ... }
function levelLookup(levels) {
  const levelOf = {};

  Object.entries(levels).forEach(([level, subtypes]) => {
    subtypes.forEach((subtype) => {
      levelOf[subtype] = Number(level);
    });
  });

  return levelOf;
}

const TOP_LEVEL_OF = levelLookup(TOP_LEVELS);
const BOTTOM_LEVEL_OF = levelLookup(BOTTOM_LEVELS);
const FABRIC_WARMTH = new Map(FABRIC_LIST.map(({ name, warmth }) => [name, warmth || 0]));

const FABRIC_ROLES = new Set(["top", "bottom", "onepiece"]);

function clampTemperature(value) {
  const [lowest, highest] = TEMPERATURE_LIMITS;
  return Math.min(highest, Math.max(lowest, value));
}

const shiftRange = ([min, max], degrees) => [min - degrees, max - degrees];

// One item's fabric warmth - 0 for outers, no fabric, or a fabric its
// subtype already assumes.
function fabricWarmthOf(item) {
  if (!FABRIC_ROLES.has(item.type) || !item.fabric) {
    return 0;
  }

  if (FABRIC_NAMED_SUBTYPES[item.subtype]?.includes(item.fabric)) {
    return 0;
  }

  return FABRIC_WARMTH.get(item.fabric) || 0;
}

// The outfit's fabric shift, limited to FABRIC_SHIFT_LIMIT either way.
function fabricShift(items) {
  const total = items.reduce((sum, item) => sum + fabricWarmthOf(item), 0);
  return Math.max(-FABRIC_SHIFT_LIMIT, Math.min(FABRIC_SHIFT_LIMIT, total));
}

function addOuters([min, max], points) {
  if (!points) {
    return [min, max];
  }

  const cappedMax = Math.min(max - points, OUTER_CEILING_BASE - points);
  return [Math.min(min - points, cappedMax - OUTER_MIN_SPAN), cappedMax];
}

function capMax([min, max], cap) {
  if (cap === undefined || max <= cap) {
    return [min, max];
  }

  return [Math.min(min, cap), cap];
}

// The coldest the outfit's minimum may go (step 4), before the preference
// shift: NO_OUTER_MIN_TEMP with no outer, else the lowest of its outers'
// OUTER_MIN_TEMPS; with a skirt or dress, never below SKIRT_DRESS_MIN_TEMP
// (or `skirtDressFloor` - the tights range passes a lower one, since that
// floor is for bare legs). Also keeps the tights range (tightsService.js)
// above the same floors.
function minTempFloor(items, skirtDressFloor = SKIRT_DRESS_MIN_TEMP) {
  const outers = items.filter((item) => item.type === "outer");

  const outerFloor = outers.length === 0
    ? NO_OUTER_MIN_TEMP
    : Math.min(...outers.map((outer) => OUTER_MIN_TEMPS[outer.subtype] ?? TEMPERATURE_LIMITS[0]));

  const hasSkirtOrDress = items.some((item) => SKIRT_DRESS_SUBTYPES.includes(item.subtype));

  return hasSkirtOrDress ? Math.max(outerFloor, skirtDressFloor) : outerFloor;
}

const preferenceShiftOf = (temperaturePreference) =>
  TEMPERATURE_PREFERENCE_SHIFT[temperaturePreference] || 0;

function computePresetTemperatureRange(items, temperaturePreference = null) {
  const unknownSubtypes = [];

  const lookup = (table, subtype, fallback) => {
    if (table[subtype] === undefined) {
      unknownSubtypes.push(subtype);
      return fallback;
    }
    return table[subtype];
  };

  const ofRole = (role) => items.filter((item) => item.type === role);
  const tops = ofRole("top");
  const bottoms = ofRole("bottom");
  const onepieces = ofRole("onepiece");
  const outers = ofRole("outer");

  const topLevels = tops.map((top) => lookup(TOP_LEVEL_OF, top.subtype, FALLBACK_LEVEL));
  const bottomLevels = bottoms.map((bottom) => lookup(BOTTOM_LEVEL_OF, bottom.subtype, FALLBACK_LEVEL));
  const bottomLevel = bottomLevels.length ? Math.max(...bottomLevels) : NO_BOTTOM_LEVEL;

  // Step 1 - base range.
  let range;
  let layered;

  if (onepieces.length) {
    const onepieceRanges = onepieces.map((onepiece) =>
      lookup(ONEPIECE_RANGES, onepiece.subtype, FALLBACK_ONEPIECE_RANGE)
    );
    const coldest = onepieceRanges.reduce((best, current) => (current[0] < best[0] ? current : best));
    const layerPoints = topLevels.reduce((sum, level) => sum + ONEPIECE_LAYER_POINTS[level], 0);

    range = shiftRange(coldest, layerPoints);
    layered = tops.length > 0;
  } else {
    const topLevel = topLevels.length ? Math.max(...topLevels) : NO_TOP_LEVEL;

    // Every top but one of the warmest adds its bonus.
    const others = [...topLevels];
    others.splice(others.indexOf(topLevel), 1);
    const layerPoints = others.reduce((sum, level) => sum + LAYER_BONUS[level], 0);

    range = shiftRange(BASE_RANGES[topLevel][bottomLevel], layerPoints);
    layered = tops.length > 1;
  }

  // Step 2 - fabric.
  range = shiftRange(range, fabricShift(items));

  // Step 3 - outers.
  const outerPoints = outers.reduce(
    (sum, outer) => sum + lookup(OUTER_WARMTH_POINTS, outer.subtype, FALLBACK_OUTER_POINTS),
    0
  );
  range = addOuters(range, outerPoints);

  // Step 4 - floors.
  const floor = minTempFloor(items);

  if (range[0] < floor) {
    range = [floor, Math.max(range[1], floor)];
  }

  // Step 5 - caps. The lowest applicable cap wins.
  const ceiling = Math.min(
    layered ? LAYERED_MAX_TEMP : Infinity,
    (bottoms.length && BOTTOM_MAX_TEMPS[bottomLevel]) || Infinity,
    ...items.map((item) => SUBTYPE_MAX_TEMPS[item.subtype] ?? Infinity)
  );
  range = capMax(range, Number.isFinite(ceiling) ? ceiling : undefined);

  // Widen a narrow range upwards from its floor, but never past the cap -
  // whatever's left goes below the minimum instead.
  if (range[1] - range[0] < MIN_SPAN) {
    const max = Math.min(range[0] + MIN_SPAN, Math.max(range[1], ceiling));
    range = [Math.min(range[0], max - MIN_SPAN), max];
  }

  // Step 6 - preference.
  const shift = preferenceShiftOf(temperaturePreference);
  const min_temp = clampTemperature(range[0] + shift);
  const max_temp = Math.max(min_temp, clampTemperature(range[1] + shift));

  return { min_temp, max_temp, unknownSubtypes };
}

// A top's warmth level (TOP_LEVELS), or undefined for an unknown subtype.
const topLevelOf = (subtype) => TOP_LEVEL_OF[subtype];

module.exports = { computePresetTemperatureRange, minTempFloor, preferenceShiftOf, topLevelOf };

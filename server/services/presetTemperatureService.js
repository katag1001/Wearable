// server/services/presetTemperatureService.js
//
// Works out an outfit's temperature range from its subtypes alone, using
// the presets in constants/temperatureGroups.js. Clothing items' own
// min_temp/max_temp are never read. Pure - no DB access.
//
// 1. Base range:
//    - with a onepiece: that onepiece's own range (if a user-built outfit
//      has more than one, the coldest is used);
//    - otherwise: the base range for the innermost top (the lightest top's
//      group) + the warmest bottom's group. With no top the "short" top
//      row is used; with no bottom the "long" bottom column is used.
// 2. Extra top layers - every other top worn over the innermost one, or
//    every top worn with a onepiece - move the whole range down by their
//    group's layer points.
// 3. Outers: their warmth points are added together and move the whole
//    range down, with the maximum never above OUTER_CEILING_BASE minus the
//    points.
// 4. Floors: the minimum is never below NO_OUTER_MIN_TEMP with no outer,
//    or the outer's OUTER_MIN_TEMPS value with exactly one outer. (Two
//    outers have no floor.) If that lifts the minimum above the maximum,
//    the maximum is raised to match.
// 5. Caps: an outfit with extra top layers never has a maximum above
//    LAYERED_MAX_TEMPS for its warmest layer (jumper/cardigan or not, see
//    LAYER_KINDS), and one with a long bottom never above
//    LONG_BOTTOM_MAX_TEMP. The minimum is lowered to match if it was above
//    the cap.
// 6. The user's temperature preference shifts the whole range.
//
// Subtypes missing from the presets fall back to a middle value (a "long"
// top or bottom, a 15-25 onepiece, a 5-point outer) and are reported in
// `unknownSubtypes`, so nothing is silently dropped.

const {
  TOP_GROUPS,
  BOTTOM_GROUPS,
  BASE_RANGES,
  ONEPIECE_RANGES,
  OUTER_WARMTH_POINTS,
  NO_OUTER_MIN_TEMP,
  OUTER_MIN_TEMPS,
  TOP_LAYER_POINTS,
  LAYER_KINDS,
  LAYERED_MAX_TEMPS,
  OUTER_CEILING_BASE,
  TEMPERATURE_PREFERENCE_SHIFT,
  LONG_BOTTOM_MAX_TEMP,
  TEMPERATURE_LIMITS,
} = require("../constants/temperatureGroups.js");

// Warmest last.
const TOP_GROUP_ORDER = ["short", "long", "warm"];
const BOTTOM_GROUP_ORDER = ["short", "lightLong", "long"];

const FALLBACK_TOP_GROUP = "long";
const FALLBACK_BOTTOM_GROUP = "long";
const FALLBACK_ONEPIECE_RANGE = [15, 25];
const FALLBACK_OUTER_POINTS = 5;

function invertGroups(groups) {
  const groupOf = {};

  Object.entries(groups).forEach(([group, subtypes]) => {
    subtypes.forEach((subtype) => {
      groupOf[subtype] = group;
    });
  });

  return groupOf;
}

const TOP_GROUP_OF = invertGroups(TOP_GROUPS);
const BOTTOM_GROUP_OF = invertGroups(BOTTOM_GROUPS);
const LAYER_KIND_OF = invertGroups(LAYER_KINDS);

function warmest(groups, order) {
  return groups.reduce((best, group) =>
    order.indexOf(group) > order.indexOf(best) ? group : best
  );
}

function lightest(groups, order) {
  return groups.reduce((best, group) =>
    order.indexOf(group) < order.indexOf(best) ? group : best
  );
}

function clampTemperature(value) {
  const [lowest, highest] = TEMPERATURE_LIMITS;
  return Math.min(highest, Math.max(lowest, value));
}

function addOuters([min, max], points) {
  if (!points) {
    return [min, max];
  }

  return [min - points, Math.min(max - points, OUTER_CEILING_BASE - points)];
}

// Lowest cap for the tops worn as extra layers, or undefined with none.
function layeredMaxTemp(layerSubtypes) {
  if (!layerSubtypes.length) {
    return undefined;
  }

  return Math.min(
    ...layerSubtypes.map((subtype) => LAYERED_MAX_TEMPS[LAYER_KIND_OF[subtype] || "other"])
  );
}

function capMax([min, max], cap) {
  if (cap === undefined || max <= cap) {
    return [min, max];
  }

  return [Math.min(min, cap), cap];
}

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

  const topGroups = tops.map((top) => lookup(TOP_GROUP_OF, top.subtype, FALLBACK_TOP_GROUP));

  let range;
  let layerTops;

  if (onepieces.length) {
    const onepieceRanges = onepieces.map((onepiece) =>
      lookup(ONEPIECE_RANGES, onepiece.subtype, FALLBACK_ONEPIECE_RANGE)
    );
    const [baseMin, baseMax] = onepieceRanges.reduce((best, current) =>
      current[0] < best[0] ? current : best
    );

    // Every top worn with a onepiece is an extra layer.
    layerTops = tops;
    const layerPoints = topGroups.reduce((sum, group) => sum + TOP_LAYER_POINTS[group], 0);

    range = [baseMin - layerPoints, baseMax - layerPoints];
  } else {
    // The innermost (lightest) top sets the base; the rest go over it.
    const topGroup = topGroups.length ? lightest(topGroups, TOP_GROUP_ORDER) : "short";
    const bottomGroups = bottoms.map((bottom) =>
      lookup(BOTTOM_GROUP_OF, bottom.subtype, FALLBACK_BOTTOM_GROUP)
    );
    const bottomGroup = bottomGroups.length
      ? warmest(bottomGroups, BOTTOM_GROUP_ORDER)
      : FALLBACK_BOTTOM_GROUP;

    // Every other top is a layer over the innermost one.
    const innermostIndex = topGroups.indexOf(topGroup);
    layerTops = tops.filter((_, index) => index !== innermostIndex);
    const layerPoints = topGroups
      .filter((_, index) => index !== innermostIndex)
      .reduce((sum, group) => sum + TOP_LAYER_POINTS[group], 0);

    const [min, max] = BASE_RANGES[topGroup][bottomGroup];
    range = [min - layerPoints, max - layerPoints];
  }

  const outerPoints = outers.reduce(
    (sum, outer) => sum + lookup(OUTER_WARMTH_POINTS, outer.subtype, FALLBACK_OUTER_POINTS),
    0
  );

  range = addOuters(range, outerPoints);

  const floor = outers.length === 0
    ? NO_OUTER_MIN_TEMP
    : outers.length === 1
      ? OUTER_MIN_TEMPS[outers[0].subtype]
      : undefined;

  if (floor !== undefined && range[0] < floor) {
    range = [floor, Math.max(range[1], floor)];
  }

  // Unknown bottoms count as long, as above.
  const hasLongBottom = bottoms.some(
    (bottom) => (BOTTOM_GROUP_OF[bottom.subtype] || FALLBACK_BOTTOM_GROUP) === "long"
  );

  range = capMax(range, layeredMaxTemp(layerTops.map((top) => top.subtype)));
  range = capMax(range, hasLongBottom ? LONG_BOTTOM_MAX_TEMP : undefined);

  const shift = TEMPERATURE_PREFERENCE_SHIFT[temperaturePreference] || 0;
  const min_temp = clampTemperature(range[0] + shift);
  const max_temp = Math.max(min_temp, clampTemperature(range[1] + shift));

  return { min_temp, max_temp, unknownSubtypes };
}

module.exports = { computePresetTemperatureRange };

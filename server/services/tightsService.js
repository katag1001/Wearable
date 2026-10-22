// server/services/tightsService.js
//
// Tights. A match's stored min_temp/max_temp is always the range WITHOUT
// tights. An outfit that can take tights also suits a range TIGHTS_SHIFT
// degrees colder at both ends - worked out when it's needed (Today's
// weather tiers, the Matches temperature filter, the match card), never
// stored, so changing the shift needs no reset. Pure - no DB access.
//
// An outfit can take tights when it has:
//  - a skirt or dress from shared/tights.json (no shorts, playsuits,
//    summer, evening or wedding guest dresses), and
//  - a warm top (the "warm" top group in temperatureGroups.js) or any
//    outer - tights only make sense on an outfit already dressed for the
//    cold.
//
// The numbers live in shared/tights.json so the app can show the tights
// range with the same shift.

const { shift: TIGHTS_SHIFT, skirts, dresses } = require("../../shared/tights.json");
const { TOP_GROUPS } = require("../constants/temperatureGroups.js");

const TIGHTS_SKIRTS = new Set(skirts);
const TIGHTS_DRESSES = new Set(dresses);
const WARM_TOPS = new Set(TOP_GROUPS.warm);

// `items` need `type` and `subtype`.
function canWearTights(items) {
  const hasSkirtOrDress = items.some(
    (item) =>
      (item.type === "bottom" && TIGHTS_SKIRTS.has(item.subtype)) ||
      (item.type === "onepiece" && TIGHTS_DRESSES.has(item.subtype))
  );

  const hasWarmLayer = items.some(
    (item) => item.type === "outer" || (item.type === "top" && WARM_TOPS.has(item.subtype))
  );

  return hasSkirtOrDress && hasWarmLayer;
}

// The range with tights, from a stored { min, max }.
const tightsRange = ({ min, max }) => ({ min: min - TIGHTS_SHIFT, max: max - TIGHTS_SHIFT });

module.exports = { TIGHTS_SHIFT, canWearTights, tightsRange };

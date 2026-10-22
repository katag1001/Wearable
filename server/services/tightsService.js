// server/services/tightsService.js
//
// Tights. A match's stored min_temp/max_temp is always the range WITHOUT
// tights. An outfit that can take tights also suits a range TIGHTS_SHIFT
// degrees colder at both ends - worked out when it's needed (Today's
// weather tiers, the Matches temperature filter, the match card), never
// stored, so changing the shift needs no reset. Pure - no DB access.
//
// Two flags decide it:
//  - On the clothing item, `wearWithTights`: the answer to "Would you wear
//    this with tights?" on the item form, asked for the skirts, dresses
//    and shorts in shared/tights.json (askBySubtype). An item with no
//    answer yet uses that list's default. Anything not on the list never
//    takes tights.
//  - On the match, `noTights`: "not with tights in this outfit" (the
//    Today page's broken heart, or the outfit's edit page).
//
// `match.tights` (set by describeOutfit) is true when the outfit's items
// allow tights: a skirt, dress or shorts that's worn with tights, and a
// warm top (the "warm" top group in temperatureGroups.js) or any outer -
// tights only make sense on an outfit already dressed for the cold. The
// outfit actually takes tights when that's true and it isn't `noTights`
// (takesTights).
//
// An outfit never has more than one skirt, dress or shorts (two bottoms,
// or a bottom and a onepiece, never match), so tightsItemOf is
// unambiguous.

const { shift: TIGHTS_SHIFT, askBySubtype } = require("../../shared/tights.json");
const { TOP_GROUPS } = require("../constants/temperatureGroups.js");

const WARM_TOPS = new Set(TOP_GROUPS.warm);

const asksAboutTights = (subtype) => typeof askBySubtype[subtype] === "boolean";

// The item's answer, or its subtype's default. `item` needs `subtype`.
function itemWearsTights(item) {
  if (!asksAboutTights(item.subtype)) {
    return false;
  }

  return typeof item.wearWithTights === "boolean"
    ? item.wearWithTights
    : askBySubtype[item.subtype];
}

// The outfit's skirt, dress or shorts, or undefined.
const tightsItemOf = (items) => items.find((item) => asksAboutTights(item.subtype));

// `items` need `type` and `subtype` (and `wearWithTights` when set).
function canWearTights(items) {
  const hasTightsItem = items.some(itemWearsTights);

  const hasWarmLayer = items.some(
    (item) => item.type === "outer" || (item.type === "top" && WARM_TOPS.has(item.subtype))
  );

  return hasTightsItem && hasWarmLayer;
}

// Whether a saved match takes tights.
const takesTights = (match) => !!match.tights && !match.noTights;

// The range with tights, from a stored { min, max }.
const tightsRange = ({ min, max }) => ({ min: min - TIGHTS_SHIFT, max: max - TIGHTS_SHIFT });

module.exports = {
  TIGHTS_SHIFT,
  asksAboutTights,
  itemWearsTights,
  tightsItemOf,
  canWearTights,
  takesTights,
  tightsRange,
};

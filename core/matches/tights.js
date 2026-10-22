// core/matches/tights.js
//
// Tights, as the app sees them - the same rules as
// server/services/tightsService.js, from the same list
// (shared/tights.json).
//
//  - An item's `wearWithTights` is the answer to "Would you wear this with
//    tights?", asked on the item form for the skirts, dresses and shorts
//    on the list (never for men). Unanswered, the list's default applies.
//  - An outfit's `tights` says its items allow tights; `noTights` is the
//    user's "not with tights in this outfit".

import tights from "../../shared/tights.json";

export const TIGHTS_SHIFT = tights.shift;

const DEFAULTS = tights.askBySubtype;

const isOnList = (subtype) => typeof DEFAULTS[subtype] === "boolean";

// Whether the item form asks "Would you wear this with tights?".
export const asksAboutTights = (subtype, gender) =>
  gender !== "man" && isOnList(subtype);

// The answer to show: the item's own, else its subtype's default.
export const wearsWithTights = (item) =>
  typeof item.wearWithTights === "boolean"
    ? item.wearWithTights
    : DEFAULTS[item.subtype] ?? false;

// The outfit's skirt, dress or shorts - it never has more than one.
export const tightsItemOf = (clothes) =>
  (clothes || []).find((item) => isOnList(item?.subtype));

// Whether a saved outfit takes tights.
export const takesTights = (match) => !!match?.tights && !match?.noTights;

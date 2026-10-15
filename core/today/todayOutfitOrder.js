// core/today/todayOutfitOrder.js

import { cacheOutfitOrder, getCachedOutfitOrder } from "./outfitOrderCache.js";
import todayOutfitSort from "./todayOutfitSort.js";

// Today's outfits in today's order: the order saved earlier today if there
// is one (outfits no longer on the list dropped), otherwise freshly sorted
// for today's tag and weather - and that order saved for the day.
export const orderTodayOutfits = (outfits, todayTagName) => {
  const cachedIds = getCachedOutfitOrder();

  if (cachedIds) {
    console.log("Using cached today's outfit order.");

    const byId = new Map(
      outfits
        .filter((outfit) => outfit?.matchId?._id)
        .map((outfit) => [outfit.matchId._id, outfit])
    );

    return cachedIds.map((id) => byId.get(id)).filter(Boolean);
  }

  console.log("Creating today's outfit order.");

  const sorted = todayOutfitSort(outfits, todayTagName);

  cacheOutfitOrder(sorted);

  return sorted;
};

// Whether two outfit lists differ in which outfits they hold or their order.
export const outfitIdsChanged = (before, after) =>
  before.length !== after.length ||
  before.some(
    (outfit, index) => outfit?.matchId?._id !== after[index]?.matchId?._id
  );

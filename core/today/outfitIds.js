// core/today/outfitIds.js

// Whether two outfit lists differ in which outfits they hold or their order.
export const outfitIdsChanged = (before, after) =>
  before.length !== after.length ||
  before.some(
    (outfit, index) => outfit?.matchId?._id !== after[index]?.matchId?._id
  );

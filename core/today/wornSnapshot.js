// core/today/wornSnapshot.js
//
// Marking an outfit worn today bumps its wear counts and its clothes'.
// Wearing a different outfit later the same day undoes that, using a
// snapshot of the values from before - kept in memory/the day's cache of
// the device that marked it only, not on the server. So another device
// can show what was worn but not undo it.

// The wear values of a match, clothing item or shoe.
export const wornValuesOf = (entry) => ({
  lastWornDate: entry.lastWornDate ?? null,
  timesWorn: entry.timesWorn ?? 0,
  timesWornThisYear: entry.timesWornThisYear ?? 0,
  wornYear: entry.wornYear ?? null,
});

// { matchId, outfit, matchSnapshot, clothesSnapshots } - taken just
// before the outfit is marked worn.
export const takeWornSnapshot = (outfit) => ({
  matchId: outfit.matchId._id,
  outfit,
  matchSnapshot: wornValuesOf(outfit.matchId),
  clothesSnapshots: (outfit.matchId.clothes || []).map((item) => ({
    clothesId: item._id,
    ...wornValuesOf(item),
  })),
});

// Whether this worn record can be undone (it was marked worn on this
// device, which took the snapshot).
export const hasSnapshot = (worn) =>
  Boolean(worn?.matchSnapshot && worn?.clothesSnapshots);

// A worn record for an outfit marked worn elsewhere (another device, or
// the Outfits page) - shown, but with no snapshot it can't be undone.
export const fromAnotherDevice = (outfit) => ({
  matchId: outfit.matchId._id,
  outfit,
  matchSnapshot: null,
  clothesSnapshots: null,
});

// The outfit with the snapshot's values put back (the server has been
// told separately - core/api/matches.js restoreMatchSnapshot).
export const applyWornSnapshot = (outfit, snapshot) => {
  const clothes = (outfit.matchId.clothes || []).map((item) => {
    const itemSnapshot = snapshot.clothesSnapshots.find(
      (entry) => entry.clothesId === item._id
    );

    return itemSnapshot ? { ...item, ...itemSnapshot } : item;
  });

  return {
    ...outfit,
    matchId: { ...outfit.matchId, ...snapshot.matchSnapshot, clothes },
  };
};

// The fields of a freshly worn match to merge into the list.
export const pickWornUpdate = (updated) => ({
  lastWornDate: updated.lastWornDate,
  timesWorn: updated.timesWorn,
  timesWornThisYear: updated.timesWornThisYear,
  wornYear: updated.wornYear,
  clothes: updated.clothes,
  score: updated.score,
  rejectedCount: updated.rejectedCount,
  lastRejectedDate: updated.lastRejectedDate,
});

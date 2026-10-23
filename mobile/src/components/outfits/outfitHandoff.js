// mobile/src/components/outfits/outfitHandoff.js
//
// Passing an outfit to the outfit screen (route params only carry
// strings), and the changes made there - edits, and outfits a mismatch
// deleted - back to the Today tab. In memory
// only - an outfit screen opened with nothing handed over just goes back.

let outfitToShow = null;
// matchId -> the fields changed on it.
let editedOutfits = {};
// Ids of outfits deleted there (a mismatch).
let removedOutfitIds = [];

// `footwear`: a shoe to show with the outfit (Today's pick), or none.
// `rating`: stars picked on Today but not saved yet, to start from.
export const handOverOutfit = (match, footwear = null, rating = null) => {
  outfitToShow = { match, footwear, rating };
};

// { match, footwear, rating } handed over (once), or null.
export const takeOutfit = () => {
  const outfit = outfitToShow;

  outfitToShow = null;

  return outfit;
};

export const markOutfitEdited = (matchId, fields) => {
  editedOutfits = {
    ...editedOutfits,
    [matchId]: { ...editedOutfits[matchId], ...fields },
  };
};

// { matchId: fields } changed since the last check (once).
export const takeEditedOutfits = () => {
  const edited = editedOutfits;

  editedOutfits = {};

  return edited;
};

export const markOutfitsRemoved = (matchIds) => {
  removedOutfitIds = [...new Set([...removedOutfitIds, ...matchIds.map(String)])];
};

// Ids deleted since the last check (once).
export const takeRemovedOutfits = () => {
  const removed = removedOutfitIds;

  removedOutfitIds = [];

  return removed;
};

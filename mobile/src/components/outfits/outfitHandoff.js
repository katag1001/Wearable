// mobile/src/components/outfits/outfitHandoff.js
//
// Passing an outfit to the outfit screen (route params only carry
// strings), and the changes made there back to the Today tab. In memory
// only - an outfit screen opened with nothing handed over just goes back.

let outfitToShow = null;
// matchId -> the fields changed on it.
let editedOutfits = {};

// `footwear`: a shoe to show with the outfit (Today's pick), or none.
export const handOverOutfit = (match, footwear = null) => {
  outfitToShow = { match, footwear };
};

// { match, footwear } handed over (once), or null.
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

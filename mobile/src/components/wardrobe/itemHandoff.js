// mobile/src/components/wardrobe/itemHandoff.js
//
// Passing an item from the wardrobe list to the edit screen (route
// params only carry strings), and telling the list to refresh when it's
// shown again after a save or delete. In memory only - an edit screen
// opened with nothing handed over just goes back.

let itemToEdit = null;
let wardrobeChanged = false;

export const handOverItem = (item) => {
  itemToEdit = item;
};

// The item handed over (once), or null for a new one.
export const takeItem = () => {
  const item = itemToEdit;

  itemToEdit = null;

  return item;
};

export const markWardrobeChanged = () => {
  wardrobeChanged = true;
};

// true (once) if something was saved or deleted since the last check.
export const takeWardrobeChanged = () => {
  const changed = wardrobeChanged;

  wardrobeChanged = false;

  return changed;
};

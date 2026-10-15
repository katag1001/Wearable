// mobile/src/components/outfits/outfitsChanged.js
//
// Tells the Outfits list to refresh when it's shown again after an outfit
// was built on another screen. In memory only.

let outfitsChanged = false;

export const markOutfitsChanged = () => {
  outfitsChanged = true;
};

// true (once) if an outfit was added since the last check.
export const takeOutfitsChanged = () => {
  const changed = outfitsChanged;

  outfitsChanged = false;

  return changed;
};

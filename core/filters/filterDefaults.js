// core/filters/filterDefaults.js
//
// The filter panel's fields (core/hooks/useFilterPanel.js). Each list page
// uses the parts it needs; Reset goes back to all of this.

export const ITEM_CATEGORIES = ["top", "bottom", "outer", "onepiece"];

export const ITEM_CATEGORY_LABELS = {
  top: "Tops",
  bottom: "Bottoms",
  outer: "Outerwear",
  onepiece: "One-Pieces",
};

// The temperature filter slider's ends.
export const FILTER_TEMPERATURE_RANGE = { min: -10, max: 50 };

export const emptyItemFilter = {
  top: null,
  bottom: null,
  outer: null,
  onepiece: null,
};

export const defaultFilters = {
  seasons: [],
  colors: [],
  styles: [],
  tags: [],
  // Set from the type buttons on the wardrobe, not from the panel -
  // listed here so Reset clears them too.
  subtypes: [],
  minTemp: null,
  maxTemp: null,
  favourite: false,
  // Outfits containing these items (one per category).
  items: emptyItemFilter,
};

// The wardrobe's filters (no temperature, favourites or items there).
export const defaultWardrobeFilters = {
  seasons: [],
  colors: [],
  styles: [],
  tags: [],
  subtypes: [],
};

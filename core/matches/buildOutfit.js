// core/matches/buildOutfit.js
//
// Helpers for building an outfit by hand (core/hooks/useCreateMatch.js).

import { ITEM_CATEGORIES } from "../filters/filterDefaults.js";

export const emptyByCategory = () =>
  Object.fromEntries(ITEM_CATEGORIES.map((category) => [category, []]));

// { top: [...], bottom: [...], outer: [...], onepiece: [...] }
export const groupClothesByType = (clothes) => {
  const grouped = emptyByCategory();

  clothes.forEach((item) => {
    grouped[item.type]?.push(item);
  });

  return grouped;
};

// The search box matches the name, brand, colours or tags.
export const itemMatchesSearch = (item, term) => {
  const search = term.trim().toLowerCase();

  if (!search) return true;

  return (
    item.name?.toLowerCase().includes(search) ||
    item.brand?.toLowerCase().includes(search) ||
    item.colors?.some((color) => color.toLowerCase().includes(search)) ||
    item.tags?.some((tag) => tag.toLowerCase().includes(search))
  );
};

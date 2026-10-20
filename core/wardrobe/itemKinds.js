// core/wardrobe/itemKinds.js
//
// The two kinds of wardrobe item. They share one add/edit form
// (core/hooks/useWardrobeItemForm.js); this is everything that differs.
//
// - clothing is matched into outfits after saving (hence "View new
//   matches"), and its types sit in categories;
// - footwear is its own collection, never matched, with one flat list of
//   types and its own name synonyms.

import { getStorage } from "../config.js";
import { STORAGE_KEYS } from "../storageKeys.js";
import {
  createClothing,
  deleteClothing,
  updateClothing,
} from "../api/clothing.js";
import {
  createFootwear,
  deleteFootwear,
  updateFootwear,
} from "../api/footwear.js";
import { getTypeOptions } from "../constants/typeOptions.js";
import {
  FOOTWEAR_SYNONYMS,
  getFootwearOptions,
} from "../constants/footwearOptions.js";

export const WARDROBE_KINDS = {
  clothing: {
    label: "Clothing",
    titles: { add: "Add Clothing Item", update: "Update Clothing Item" },
    savedMessages: { added: "Item created", updated: "Item updated" },
    getOptions: getTypeOptions,
    // undefined = the clothing synonyms (suggestSubtypesFromName's default).
    synonyms: undefined,
    hasCategories: true,
    hasMatches: true,
    // Items saved before temperature moved to matches may still carry
    // these - never send them back. `favourite` is only changed by the
    // heart (useItemFavourite), so a form opened before a tap can't undo it.
    dropFields: ["min_temp", "max_temp", "favourite"],
    create: (fields) =>
      createClothing({
        ...fields,
        username: getStorage().getItem(STORAGE_KEYS.user),
      }),
    update: updateClothing,
    remove: deleteClothing,
  },

  footwear: {
    label: "Footwear",
    titles: { add: "Add Footwear", update: "Update Footwear" },
    savedMessages: { added: "Footwear added", updated: "Footwear updated" },
    getOptions: getFootwearOptions,
    synonyms: FOOTWEAR_SYNONYMS,
    hasCategories: false,
    hasMatches: false,
    // Fields from the shared form state that footwear doesn't store.
    dropFields: ["type", "min_temp", "max_temp"],
    create: createFootwear,
    update: updateFootwear,
    remove: deleteFootwear,
  },
};

export const WARDROBE_KIND_LIST = Object.entries(WARDROBE_KINDS).map(
  ([kind, { label }]) => ({ kind, label })
);

export const deleteWardrobeItem = (kind, id) =>
  WARDROBE_KINDS[kind].remove(id);

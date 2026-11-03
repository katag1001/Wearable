import { useEffect, useState } from "react";

import { fetchAllClothing } from "../api/clothing.js";
import { getErrorMessage } from "../api/errors.js";
import { createMatch } from "../api/matches.js";
import { ITEM_CATEGORIES } from "../filters/filterDefaults.js";
import {
  emptyByCategory,
  groupClothesByType,
  itemMatchesSearch,
} from "../matches/buildOutfit.js";

/*
 * Building an outfit by hand: browse the clothes one category at a time
 * (with a search, and optionally narrowed to some of the category's
 * subtypes - only ones the user owns, like the wardrobe), tick items from
 * any categories, then submit.
 *
 * `result` ({ title, message, ok }) is the outcome to show after a
 * submit, until `clearResult`.
 */
export const useCreateMatch = () => {
  const [clothesByCategory, setClothesByCategory] = useState(emptyByCategory);
  const [loading, setLoading] = useState(true);

  // The ticked items, per category.
  const [selected, setSelected] = useState(emptyByCategory);

  const [category, setCategory] = useState(ITEM_CATEGORIES[0]);
  const [searchTerm, setSearchTerm] = useState("");
  // Subtypes picked within the category; none = the whole category.
  const [selectedSubtypes, setSelectedSubtypes] = useState([]);

  const [submitting, setSubmitting] = useState(false);
  const [result, setResult] = useState(null);

  useEffect(() => {
    const fetchClothes = async () => {
      try {
        setClothesByCategory(groupClothesByType(await fetchAllClothing()));
      } catch (err) {
        console.error("Error fetching clothing data:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchClothes();
  }, []);

  /* -------------------- Browsing -------------------- */

  // A new category starts with an empty search and no subtypes picked.
  const chooseCategory = (next) => {
    setCategory(next);
    setSearchTerm("");
    setSelectedSubtypes([]);
  };

  // The category's subtypes the user has items in, A-Z.
  const ownedSubtypes = clothesByCategory[category]
    .map((item) => item.subtype)
    .filter(Boolean);
  const subtypes = [...new Set(ownedSubtypes)].sort((a, b) =>
    a.localeCompare(b)
  );

  const toggleSubtype = (subtype) =>
    setSelectedSubtypes((prev) =>
      prev.includes(subtype)
        ? prev.filter((entry) => entry !== subtype)
        : [...prev, subtype]
    );

  const categoryItems = clothesByCategory[category].filter(
    (item) =>
      itemMatchesSearch(item, searchTerm) &&
      (selectedSubtypes.length === 0 || selectedSubtypes.includes(item.subtype))
  );

  /* -------------------- Selecting -------------------- */

  const isSelected = (itemCategory, item) =>
    selected[itemCategory].some((entry) => entry._id === item._id);

  const toggleItem = (itemCategory, item) => {
    setSelected((prev) => ({
      ...prev,
      [itemCategory]: prev[itemCategory].some((entry) => entry._id === item._id)
        ? prev[itemCategory].filter((entry) => entry._id !== item._id)
        : [...prev[itemCategory], item],
    }));
  };

  // [{ category, item }] in category order.
  const selectedItems = ITEM_CATEGORIES.flatMap((itemCategory) =>
    selected[itemCategory].map((item) => ({ category: itemCategory, item }))
  );

  /* -------------------- Submit -------------------- */

  const submit = async () => {
    if (selectedItems.length === 0) {
      setResult({
        ok: false,
        title: "No Clothing Selected",
        message: "Please select at least one clothing item.",
      });
      return;
    }

    setSubmitting(true);

    try {
      await createMatch(selectedItems.map(({ item }) => item._id));

      setResult({
        ok: true,
        title: "Outfit Submitted!",
        message:
          "Your outfit has been successfully added to the matches database.",
      });
      setSelected(emptyByCategory());
    } catch (err) {
      console.error("Submit failed:", err);

      setResult({
        ok: false,
        title: "Unable to Submit Outfit",
        message: getErrorMessage(err, "Failed to create match"),
      });
    } finally {
      setSubmitting(false);
    }
  };

  return {
    loading,
    category,
    chooseCategory,
    searchTerm,
    setSearchTerm,
    subtypes,
    selectedSubtypes,
    toggleSubtype,
    categoryItems,

    isSelected,
    toggleItem,
    selectedItems,

    submit,
    submitting,
    result,
    clearResult: () => setResult(null),
  };
};

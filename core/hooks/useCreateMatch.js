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
 * (with a search), tick items from any categories, then submit.
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

  // A new category starts with an empty search.
  const chooseCategory = (next) => {
    setCategory(next);
    setSearchTerm("");
  };

  const categoryItems = clothesByCategory[category].filter((item) =>
    itemMatchesSearch(item, searchTerm)
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

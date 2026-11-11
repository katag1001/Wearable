import { useEffect, useState } from "react";

import { fetchAllClothing } from "../api/clothing.js";
import { getErrorMessage } from "../api/errors.js";
import { fetchTodayFootwear } from "../api/footwear.js";
import { createMatch } from "../api/matches.js";
import { planDay } from "../api/plan.js";
import { ITEM_CATEGORIES } from "../filters/filterDefaults.js";
import {
  emptyByCategory,
  groupClothesByType,
  itemMatchesSearch,
} from "../matches/buildOutfit.js";
import { savePlannedWorn } from "../plan/plannedWorn.js";

// The shoes' category, after the clothing ones. Shoes aren't part of the
// outfit itself - they're the shoes Today shows first with it.
export const SHOES_CATEGORY = "footwear";

/*
 * Building an outfit by hand: browse the clothes one category at a time
 * (with a search, and optionally narrowed to some of the category's
 * subtypes - only ones the user owns, like the wardrobe), tick items from
 * any categories, then submit.
 *
 * Shoes (SHOES_CATEGORY) are browsed the same way. Picked ones become the
 * outfit's shoes, in the order picked (the first is shown with it).
 *
 * `planDate` ("YYYY-MM-DD"): building the outfit for that day on the Plan
 * tab - one pair of shoes only, locked to the day; saving plans the outfit
 * (and favourites it). An outfit the user built before is planned as it is.
 *
 * `result` ({ title, message, ok }) is the outcome to show after a
 * submit, until `clearResult`.
 */
export const useCreateMatch = ({ planDate = null } = {}) => {
  const [clothesByCategory, setClothesByCategory] = useState(emptyByCategory);
  const [footwear, setFootwear] = useState([]);
  const [loading, setLoading] = useState(true);

  // The ticked items, per category, and the shoes, in the order picked.
  const [selected, setSelected] = useState(emptyByCategory);
  const [selectedShoes, setSelectedShoes] = useState([]);

  const [category, setCategory] = useState(ITEM_CATEGORIES[0]);
  const [searchTerm, setSearchTerm] = useState("");
  // Subtypes picked within the category; none = the whole category.
  const [selectedSubtypes, setSelectedSubtypes] = useState([]);

  const [submitting, setSubmitting] = useState(false);
  const [result, setResult] = useState(null);

  useEffect(() => {
    const fetchItems = async () => {
      try {
        const [clothes, shoes] = await Promise.all([
          fetchAllClothing(),
          // No shoes is fine - the outfit can still be built.
          fetchTodayFootwear().catch((err) => {
            console.error("Error fetching footwear:", err);
            return { items: [] };
          }),
        ]);

        setClothesByCategory(groupClothesByType(clothes));
        setFootwear(shoes?.items || []);
      } catch (err) {
        console.error("Error fetching clothing data:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchItems();
  }, []);

  const itemsOf = (itemCategory) =>
    itemCategory === SHOES_CATEGORY ? footwear : clothesByCategory[itemCategory];

  /* -------------------- Browsing -------------------- */

  // A new category starts with an empty search and no subtypes picked.
  const chooseCategory = (next) => {
    setCategory(next);
    setSearchTerm("");
    setSelectedSubtypes([]);
  };

  // The category's subtypes the user has items in, A-Z.
  const ownedSubtypes = itemsOf(category)
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

  const categoryItems = itemsOf(category).filter(
    (item) =>
      itemMatchesSearch(item, searchTerm) &&
      (selectedSubtypes.length === 0 || selectedSubtypes.includes(item.subtype))
  );

  /* -------------------- Selecting -------------------- */

  const isSelected = (itemCategory, item) =>
    (itemCategory === SHOES_CATEGORY ? selectedShoes : selected[itemCategory]).some(
      (entry) => entry._id === item._id
    );

  // Planning a day takes one pair: picking another swaps it.
  const toggleShoe = (shoe) =>
    setSelectedShoes((prev) => {
      if (prev.some((entry) => entry._id === shoe._id)) {
        return prev.filter((entry) => entry._id !== shoe._id);
      }

      return planDate ? [shoe] : [...prev, shoe];
    });

  const toggleItem = (itemCategory, item) => {
    if (itemCategory === SHOES_CATEGORY) {
      toggleShoe(item);
      return;
    }

    setSelected((prev) => ({
      ...prev,
      [itemCategory]: prev[itemCategory].some((entry) => entry._id === item._id)
        ? prev[itemCategory].filter((entry) => entry._id !== item._id)
        : [...prev[itemCategory], item],
    }));
  };

  // [{ category, item }] in category order - the clothes only.
  const selectedItems = ITEM_CATEGORIES.flatMap((itemCategory) =>
    selected[itemCategory].map((item) => ({ category: itemCategory, item }))
  );

  /* -------------------- Submit -------------------- */

  // The id of the outfit made of these clothes: new, or the one the user
  // built before (the server says which).
  const outfitIdFor = async (clothesIds) => {
    try {
      return (await createMatch(clothesIds))._id;
    } catch (err) {
      const existingId = err?.response?.status === 409 && err.response.data?.matchId;

      if (existingId) return existingId;

      throw err;
    }
  };

  const savePlan = async (clothesIds) => {
    const matchId = await outfitIdFor(clothesIds);
    const { plannedWorn } = await planDay({
      date: planDate,
      matchId,
      footwearId: selectedShoes[0]?._id ?? null,
    });

    // Today's own plan was worn straight away (core/plan/plannedWorn.js).
    if (plannedWorn) savePlannedWorn(plannedWorn);
  };

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
      const clothesIds = selectedItems.map(({ item }) => item._id);

      if (planDate) {
        await savePlan(clothesIds);

        setResult({
          ok: true,
          title: "Outfit planned!",
          message: "Your outfit is saved to your favourites and planned for the day.",
        });
        return;
      }

      await createMatch(clothesIds, selectedShoes.map((shoe) => shoe._id));

      setResult({
        ok: true,
        title: "Outfit Submitted!",
        message:
          "Your outfit has been successfully added to the matches database.",
      });
      setSelected(emptyByCategory());
      setSelectedShoes([]);
    } catch (err) {
      console.error("Submit failed:", err);

      setResult({
        ok: false,
        title: planDate ? "Unable to Plan Outfit" : "Unable to Submit Outfit",
        message: getErrorMessage(err, planDate ? "Failed to plan the outfit" : "Failed to create match"),
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
    selectedShoes,
    hasFootwear: footwear.length > 0,

    submit,
    submitting,
    result,
    clearResult: () => setResult(null),
  };
};

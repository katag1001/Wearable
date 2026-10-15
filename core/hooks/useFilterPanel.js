import { useEffect, useState } from "react";

import {
  colorOptions,
  seasonOptions,
  styleOptions,
  tagOptions,
} from "../constants/optionsBank.js";
import {
  defaultFilters,
  emptyItemFilter,
} from "../filters/filterDefaults.js";

const startIndexes = { top: 0, bottom: 0, outer: 0, onepiece: 0 };

// Only the options something on the list actually has; all of them while
// the list's options haven't loaded.
const narrowTo = (options, available, getName = (option) => option) =>
  available.length > 0
    ? options.filter((option) => available.includes(getName(option)))
    : options;

/*
 * The filter panel (a side panel on the web, a bottom sheet on a phone).
 *
 * Edits are made to a draft and only reach the list on `apply`; `reset`
 * clears both. The "filter by item" view steps through each category's
 * clothes one at a time (`clothesByCategory`, matches page only).
 */
export const useFilterPanel = ({
  isOpen,
  filters,
  setFilters,
  onClose,
  availableColors = [],
  availableStyles = [],
  availableTags = [],
  clothesByCategory = {},
}) => {
  const [draft, setDraft] = useState({ ...defaultFilters, ...filters });

  // "main" (the standard filters) or "items" (filter by item).
  const [view, setView] = useState("main");
  const [itemSearchTerm, setItemSearchTerm] = useState("");
  const [categoryIndex, setCategoryIndex] = useState(startIndexes);

  // The draft follows the list's filters whenever they change.
  useEffect(() => {
    setDraft({ ...defaultFilters, ...filters });
  }, [filters]);

  useEffect(() => {
    if (isOpen) {
      setView("main");
    }
  }, [isOpen]);

  /* -------------------- Options on offer -------------------- */

  const seasons = seasonOptions;
  const colors = narrowTo(colorOptions, availableColors, (color) => color.name);
  const styles = narrowTo(styleOptions, availableStyles);
  const tags = narrowTo(tagOptions, availableTags, (tag) => tag.name);

  /* -------------------- Draft edits -------------------- */

  const toggleInList = (field, value) => {
    setDraft((prev) => {
      const current = prev[field] || [];

      return {
        ...prev,
        [field]: current.includes(value)
          ? current.filter((entry) => entry !== value)
          : [...current, value],
      };
    });
  };

  const toggleFavourite = () => {
    setDraft((prev) => ({ ...prev, favourite: !prev.favourite }));
  };

  const setTemperature = (minTemp, maxTemp) => {
    setDraft((prev) => ({ ...prev, minTemp, maxTemp }));
  };

  /* -------------------- Filter by item -------------------- */

  const getCategoryItems = (category) => {
    const term = itemSearchTerm.trim().toLowerCase();
    const items = clothesByCategory[category] || [];

    if (!term) return items;

    return items.filter((item) => item.name?.toLowerCase().includes(term));
  };

  // The item currently shown for a category (wrapping round), or null.
  const getCurrentCategoryItem = (category) => {
    const items = getCategoryItems(category);

    if (items.length === 0) return null;

    const rawIndex = categoryIndex[category] || 0;
    const safeIndex = ((rawIndex % items.length) + items.length) % items.length;

    return items[safeIndex];
  };

  const stepCategory = (category, direction) => {
    setCategoryIndex((prev) => ({
      ...prev,
      [category]: (prev[category] || 0) + direction,
    }));
  };

  const searchItems = (value) => {
    setItemSearchTerm(value);
    setCategoryIndex(startIndexes);
  };

  // Picking the selected item again clears it.
  const toggleCategoryItem = (category, item) => {
    setDraft((prev) => {
      const items = prev.items || emptyItemFilter;

      return {
        ...prev,
        items: {
          ...items,
          [category]: items[category] === item._id ? null : item._id,
        },
      };
    });
  };

  /* -------------------- Apply / reset -------------------- */

  const apply = () => {
    setFilters(draft);
    onClose();
  };

  const reset = () => {
    setDraft(defaultFilters);
    setFilters(defaultFilters);
  };

  return {
    draft,
    view,
    setView,

    seasons,
    colors,
    styles,
    tags,

    toggleInList,
    toggleFavourite,
    setTemperature,

    itemSearchTerm,
    searchItems,
    getCurrentCategoryItem,
    stepCategory,
    toggleCategoryItem,

    apply,
    reset,
  };
};

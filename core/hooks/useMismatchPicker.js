import { useState } from "react";

import { MISMATCH_ITEM_COUNT } from "../today/outfitFeedback.js";

/*
 * Picking the two clothing items of an outfit that don't go together (shoes
 * aren't part of an outfit, so they're never offered). A two-item outfit
 * starts with both picked; a third pick replaces the oldest. Used by the
 * Today broken heart (useOutfitFeedback) and the outfit card's
 * (useOutfitMismatch).
 *
 * `clothes`: the outfit's clothing items, fixed when the picker opens.
 */
export const useMismatchPicker = (clothes) => {
  const [selectedIds, setSelectedIds] = useState(() =>
    clothes.length === MISMATCH_ITEM_COUNT ? clothes.map((item) => item._id) : []
  );

  const toggleItem = (itemId) =>
    setSelectedIds((prev) => {
      if (prev.includes(itemId)) {
        return prev.filter((id) => id !== itemId);
      }

      return [...prev, itemId].slice(-MISMATCH_ITEM_COUNT);
    });

  return {
    selectedIds,
    isSelected: (itemId) => selectedIds.includes(itemId),
    toggleItem,
    isComplete: selectedIds.length === MISMATCH_ITEM_COUNT,
  };
};

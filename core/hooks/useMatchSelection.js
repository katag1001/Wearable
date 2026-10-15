import { useCallback, useEffect, useState } from "react";

/*
 * Tracks which outfits are ticked on the matches page.
 *
 * Ticks for outfits that are no longer shown (another page, new
 * filters, deleted) are dropped, so the bin only ever deletes
 * outfits the user can see.
 */
export const useMatchSelection = (matches) => {
  const [selectedIds, setSelectedIds] = useState(() => new Set());

  useEffect(() => {
    const shownIds = new Set(matches.map((match) => match._id));

    setSelectedIds((prev) => {
      const kept = [...prev].filter((id) => shownIds.has(id));

      return kept.length === prev.size ? prev : new Set(kept);
    });
  }, [matches]);

  const toggleSelected = useCallback((id) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);

      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }

      return next;
    });
  }, []);

  const clearSelection = useCallback(() => {
    setSelectedIds(new Set());
  }, []);

  return { selectedIds, toggleSelected, clearSelection };
};

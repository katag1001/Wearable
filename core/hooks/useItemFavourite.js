import { useEffect, useRef, useState } from "react";

import { updateClothing } from "../api/clothing.js";
import { getErrorMessage } from "../api/errors.js";

/*
 * The heart on a wardrobe clothing item. Favouriting an item raises the
 * score of its automatic outfits on the server
 * (server/services/favouriteItemService.js).
 *
 * - The heart changes straight away, then shows what the server saved
 *   (rolling back if the save failed or wasn't stored).
 * - onToggled(id, favourite): after a successful save (e.g. to update the
 *   cached list).
 */
export const useItemFavourite = ({ item, onToggled, onError }) => {
  const [favourite, setFavourite] = useState(!!item.favourite);
  const savingRef = useRef(false);

  useEffect(() => {
    setFavourite(!!item.favourite);
  }, [item.favourite]);

  const toggleFavourite = async () => {
    if (savingRef.current) return;

    const newValue = !favourite;

    setFavourite(newValue);
    savingRef.current = true;

    try {
      const saved = await updateClothing(item._id, { favourite: newValue });

      // Shows what the server actually stored - a server that doesn't know
      // the field returns the item unchanged.
      const stored = !!saved?.favourite;

      setFavourite(stored);
      onToggled?.(item._id, stored);

      if (stored !== newValue) {
        onError?.("Couldn't save favourite");
      }
    } catch (err) {
      console.error("Item favourite toggle error:", err);
      setFavourite(!newValue);
      onError?.(getErrorMessage(err, "Failed to update favourite"));
    } finally {
      savingRef.current = false;
    }
  };

  return { favourite, toggleFavourite };
};

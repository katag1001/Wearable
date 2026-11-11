import { useEffect, useState } from "react";

import { getErrorMessage } from "../api/errors.js";
import { fetchTodayFootwear } from "../api/footwear.js";
import { setMatchFootwear } from "../api/matches.js";

/*
 * An outfit's shoes, set by hand on the outfit screen: the shoes Today
 * shows first with it (match.footwear, best first). Adding a shoe puts it
 * at the end; removing takes it off. Saved straight away.
 *
 * `match`: the outfit (its `footwear` ids). `onChanged({ footwear })`:
 * the saved ids, for the screen's copy of the outfit.
 */
export const useOutfitShoes = ({ match, onChanged }) => {
  const [allShoes, setAllShoes] = useState(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    let cancelled = false;

    fetchTodayFootwear()
      .then((data) => {
        if (!cancelled) setAllShoes(data?.items || []);
      })
      .catch((err) => {
        console.error("Failed to load footwear:", err);
        if (!cancelled) setAllShoes([]);
      });

    return () => {
      cancelled = true;
    };
  }, []);

  const ids = (match?.footwear || []).map(String);
  const byId = new Map((allShoes || []).map((shoe) => [String(shoe._id), shoe]));

  // The outfit's shoes, in order (deleted ones dropped).
  const shoes = ids.map((id) => byId.get(id)).filter(Boolean);
  // Every other shoe, to add.
  const others = (allShoes || []).filter((shoe) => !ids.includes(String(shoe._id)));

  const save = async (nextIds) => {
    setSaving(true);
    setError(null);

    try {
      const footwear = await setMatchFootwear(match._id, nextIds);

      onChanged({ footwear });
    } catch (err) {
      console.error("Failed to save the outfit's shoes:", err);
      setError(`Couldn't save the shoes: ${getErrorMessage(err, err.message)}`);
    } finally {
      setSaving(false);
    }
  };

  return {
    loading: allShoes === null,
    hasFootwear: (allShoes || []).length > 0,
    shoes,
    others,
    saving,
    error,
    add: (shoe) => save([...ids, String(shoe._id)]),
    remove: (shoe) => save(ids.filter((id) => id !== String(shoe._id))),
  };
};

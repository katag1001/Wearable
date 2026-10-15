import { useRef, useState } from "react";

import { getErrorMessage } from "../api/errors.js";
import { updateMatch } from "../api/matches.js";
import { markMatchWorn, setMatchFavourite } from "../matches/matchActions.js";
import { buildMatchUpdate, getMatchDraft } from "../matches/matchFields.js";
import { isDateToday } from "../utils/dates.js";

/*
 * One outfit card: favourite, mark worn today, and editing its seasons,
 * temperature range and tags (a draft, saved with `save`).
 *
 * - onChanged: after a save or mark-worn (refresh the list).
 * - onFavouriteToggle(id, favourite): shows the change straight away
 *   (and again to roll back if the request fails). Without it, the list
 *   is refreshed instead.
 * - onError(message)
 */
export const useMatchCard = ({ match, onChanged, onFavouriteToggle, onError }) => {
  // null while not editing.
  const [draft, setDraft] = useState(null);
  const [saving, setSaving] = useState(false);
  const [markingWorn, setMarkingWorn] = useState(false);

  // Rapid repeat taps on the heart are ignored while one is in flight.
  const togglingFavouriteRef = useRef(false);

  // Once worn today, marking it again is locked so the wear counts can't
  // be bumped twice in one day.
  const wornToday = isDateToday(match.lastWornDate);

  /* -------------------- Editing -------------------- */

  const startEditing = () => setDraft(getMatchDraft(match));
  const stopEditing = () => setDraft(null);

  const toggleSeason = (season) => {
    setDraft((prev) => ({ ...prev, [season]: !prev[season] }));
  };

  const toggleTag = (tagName) => {
    setDraft((prev) => ({
      ...prev,
      tags: prev.tags.includes(tagName)
        ? prev.tags.filter((tag) => tag !== tagName)
        : [...prev.tags, tagName],
    }));
  };

  const setTemperature = (minTemp, maxTemp) => {
    setDraft((prev) => ({ ...prev, min_temp: minTemp, max_temp: maxTemp }));
  };

  // Resolves to true when saved (the editor can close).
  const save = async () => {
    setSaving(true);

    try {
      await updateMatch(match._id, buildMatchUpdate(draft));

      setDraft(null);
      onChanged?.();
      return true;
    } catch (err) {
      console.error("Update error:", err);
      onError?.(getErrorMessage(err, "Failed to update match"));
      return false;
    } finally {
      setSaving(false);
    }
  };

  /* -------------------- Worn today -------------------- */

  const markWorn = async () => {
    setMarkingWorn(true);

    try {
      await markMatchWorn(match);
      onChanged?.();
    } catch (err) {
      console.error("Mark as worn error:", err);
      onError?.(getErrorMessage(err, "Failed to mark as worn"));
    } finally {
      setMarkingWorn(false);
    }
  };

  /* -------------------- Favourite -------------------- */

  const toggleFavourite = async () => {
    if (togglingFavouriteRef.current) return;

    const newValue = !match.favourite;

    // Shown straight away rather than waiting on a refetch.
    onFavouriteToggle?.(match._id, newValue);

    togglingFavouriteRef.current = true;

    try {
      await setMatchFavourite(match._id, newValue);

      if (!onFavouriteToggle) {
        onChanged?.();
      }
    } catch (err) {
      console.error("Favourite toggle error:", err);

      // Roll back.
      if (onFavouriteToggle) {
        onFavouriteToggle(match._id, !newValue);
      } else {
        onChanged?.();
      }

      onError?.(getErrorMessage(err, "Failed to update favourite"));
    } finally {
      togglingFavouriteRef.current = false;
    }
  };

  return {
    draft,
    isEditing: !!draft,
    startEditing,
    stopEditing,
    toggleSeason,
    toggleTag,
    setTemperature,
    save,
    saving,

    wornToday,
    markWorn,
    markingWorn,

    toggleFavourite,
  };
};

import { useRef, useState } from "react";

import { getErrorMessage } from "../api/errors.js";
import { rateMatch, updateMatch } from "../api/matches.js";
import { markMatchWorn, setMatchFavourite } from "../matches/matchActions.js";
import { buildMatchUpdate, getMatchDraft } from "../matches/matchFields.js";
import { isDateToday } from "../utils/dates.js";

/*
 * One outfit card: favourite, mark worn today, and editing its star
 * rating, seasons, temperature range, tags and - when its items allow
 * tights - whether it can be worn with tights (a draft, saved with
 * `save`). A rating of 1-2 stars can delete the outfit
 * (server/services/matchRatingService.js).
 *
 * - onChanged: after a save or mark-worn (refresh the list).
 * - onFavouriteToggle(id, fields): shows { favourite } straight away (and
 *   again to roll back if the request fails), then the new { score } once
 *   saved. Without it, the list is refreshed instead.
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

  // `overrides`: draft values to start from instead of the outfit's own
  // (e.g. stars picked on Today but not saved yet).
  const startEditing = (overrides) =>
    setDraft({ ...getMatchDraft(match), ...overrides });
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

  // Only offered when the outfit's items allow tights.
  const offersTights = !!match.tights;

  const toggleWearWithTights = () => {
    setDraft((prev) => ({ ...prev, wearWithTights: !prev.wearWithTights }));
  };

  const setRating = (rating) => {
    setDraft((prev) => ({ ...prev, rating }));
  };

  // Resolves to false if it failed, else (the editor can close)
  // { deleted } - plus the new { rating, score } if the rating changed.
  // The rating goes last, as it can delete the outfit.
  const save = async () => {
    setSaving(true);

    try {
      await updateMatch(match._id, buildMatchUpdate(draft));

      const ratingChanged =
        draft.rating != null && draft.rating !== (match.rating ?? null);

      const result = ratingChanged
        ? await rateMatch(match._id, draft.rating)
        : { deleted: false };

      setDraft(null);
      onChanged?.();
      return result;
    } catch (err) {
      console.error("Update error:", err);
      onError?.(getErrorMessage(err, "Failed to update match"));
      return false;
    } finally {
      setSaving(false);
    }
  };

  /* -------------------- Worn today -------------------- */

  // Resolves to true when marked.
  const markWorn = async () => {
    setMarkingWorn(true);

    try {
      await markMatchWorn(match);
      onChanged?.();
      return true;
    } catch (err) {
      console.error("Mark as worn error:", err);
      onError?.(getErrorMessage(err, "Failed to mark as worn"));
      return false;
    } finally {
      setMarkingWorn(false);
    }
  };

  /* -------------------- Favourite -------------------- */

  const toggleFavourite = async () => {
    if (togglingFavouriteRef.current) return;

    const newValue = !match.favourite;

    // Shown straight away rather than waiting on a refetch.
    onFavouriteToggle?.(match._id, { favourite: newValue });

    togglingFavouriteRef.current = true;

    try {
      // Favouriting sets the score (server/services/matchRatingService.js).
      const { score } = await setMatchFavourite(match._id, newValue);

      if (onFavouriteToggle) {
        onFavouriteToggle(match._id, { score });
      } else {
        onChanged?.();
      }
    } catch (err) {
      console.error("Favourite toggle error:", err);

      // Roll back.
      if (onFavouriteToggle) {
        onFavouriteToggle(match._id, { favourite: !newValue });
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
    offersTights,
    toggleWearWithTights,
    setRating,
    save,
    saving,

    wornToday,
    markWorn,
    markingWorn,

    toggleFavourite,
  };
};

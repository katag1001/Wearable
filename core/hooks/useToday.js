import { useEffect, useRef, useState } from "react";

import { deleteMatches, restoreMatchSnapshot } from "../api/matches.js";
import { getErrorMessage } from "../api/errors.js";
import { fetchTodayOutfits } from "../api/today.js";
import { markMatchWorn } from "../matches/matchActions.js";
import { rejectOutfit, wasRejectedToday } from "../today/outfitRejection.js";
import { cacheToday, getCachedToday } from "../today/todayCache.js";
import { fetchTodayInfo } from "../today/todayInfo.js";
import {
  orderTodayOutfits,
  outfitIdsChanged,
} from "../today/todayOutfitOrder.js";
import {
  applyWornSnapshot,
  pickWornUpdate,
  takeWornSnapshot,
} from "../today/wornSnapshot.js";
import { findTagOption } from "../utils/tagOptions.js";

// The server builds today's outfits after /today/create, so an empty list
// is retried once a second for a while.
const RETRY_MS = 1000;
const MAX_RETRIES = 10;

/*
 * The Today outfits: today's list (sorted once a day), filtered by a tag,
 * one at a time. Next rejects the outfit being left (at most once a day).
 * "Mark as worn" picks today's outfit; picking a different one later
 * undoes the first (wornSnapshot.js). Everything is cached for the day,
 * so coming back shows it straight away and refreshes in the background.
 *
 * `todayReady`: true once today's weather is known and /today/create has
 * run (useWeather).
 */
export const useToday = ({ todayReady }) => {
  const [cachedToday] = useState(getCachedToday);

  const [outfits, setOutfits] = useState(cachedToday?.outfits ?? []);
  const [currentIndex, setCurrentIndex] = useState(0);

  // Today's tag from the weekly preferences (a tagOptions name), or null.
  const [todayTag, setTodayTag] = useState(cachedToday?.todayTag ?? null);
  const [selectedTag, setSelectedTag] = useState(cachedToday?.todayTag ?? null);

  const [loading, setLoading] = useState(!cachedToday);
  const [checkingToday, setCheckingToday] = useState(false);
  const [message, setMessage] = useState(null);

  // { matchId, outfit, matchSnapshot, clothesSnapshots } for the outfit
  // worn today, kept to undo it if another is worn instead.
  const [wornToday, setWornToday] = useState(cachedToday?.wornToday ?? null);

  // Whether the outfit picker shows, or just the worn outfit.
  const [showSelector, setShowSelector] = useState(!cachedToday?.wornToday);

  // { title, message } to show after an action, until clearNotice.
  const [notice, setNotice] = useState(null);
  const [deleting, setDeleting] = useState(false);

  // Reject requests in flight, so fast taps can't send one twice.
  const pendingRejections = useRef(new Set());

  // Read by the background refresh, which outlives the render it began in.
  const outfitsRef = useRef(outfits);
  outfitsRef.current = outfits;

  const unmounted = useRef(false);
  useEffect(() => () => {
    unmounted.current = true;
  }, []);

  /* -------------------- Load -------------------- */

  // silent: cached outfits are already showing, so refresh them without
  // the loading messages and without moving the user's place.
  const loadOutfits = async (todayTagName, silent, attempt = 0) => {
    try {
      const data = await fetchTodayOutfits();

      if (unmounted.current) return;

      // Today is still being created.
      if (data.length === 0) {
        if (attempt < MAX_RETRIES) {
          if (!silent) setCheckingToday(true);

          setTimeout(() => {
            if (!unmounted.current) {
              loadOutfits(todayTagName, silent, attempt + 1);
            }
          }, RETRY_MS);

          return;
        }

        setCheckingToday(false);
        setOutfits([]);
        setCurrentIndex(0);
        setLoading(false);
        return;
      }

      const sorted = orderTodayOutfits(data, todayTagName);
      const changed = outfitIdsChanged(outfitsRef.current, sorted);

      setOutfits(sorted);

      if (!silent || changed) {
        setCurrentIndex(0);
      }

      setCheckingToday(false);
      setLoading(false);
    } catch (err) {
      console.error("Failed to fetch today's outfits:", err);

      if (unmounted.current) return;

      setCheckingToday(false);
      setLoading(false);

      // Keep showing the cached outfits rather than an error.
      if (!silent) {
        setMessage(`Error fetching outfits: ${err.message}`);
      }
    }
  };

  useEffect(() => {
    if (!todayReady) return;

    const loadToday = async () => {
      const { todayTag: preferenceTag } = await fetchTodayInfo();

      // The tagOptions spelling, which is what outfit tags use.
      const todayTagName =
        findTagOption(preferenceTag)?.name || preferenceTag || null;

      setTodayTag(todayTagName);

      // Start filtered to today's tag - unless cached outfits are already
      // showing, where the user may have picked a different tag.
      if (!cachedToday) {
        setSelectedTag(todayTagName);
      }

      await loadOutfits(todayTagName, Boolean(cachedToday));
    };

    loadToday();
    // Once, when today is ready.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [todayReady]);

  // Keep the cached copy in step with every change (rejections, worn,
  // deletes) so coming back shows exactly what was on screen.
  useEffect(() => {
    if (loading) return;

    cacheToday({ todayTag, outfits, wornToday });
  }, [outfits, todayTag, wornToday, loading]);

  /* -------------------- Tag filter -------------------- */

  const filteredOutfits = selectedTag
    ? outfits.filter((outfit) => outfit?.matchId?.tags?.includes(selectedTag))
    : outfits;

  const selectedOutfit = filteredOutfits[currentIndex] ?? null;

  const selectTag = (tagName) => {
    setSelectedTag(selectedTag === tagName ? null : tagName);
    setCurrentIndex(0);
  };

  /* -------------------- List updates -------------------- */

  // Merges new values into one match, keeping the order.
  const updateMatch = (matchId, fields) => {
    setOutfits((prev) =>
      prev.map((outfit) =>
        outfit.matchId?._id === matchId
          ? { ...outfit, matchId: { ...outfit.matchId, ...fields } }
          : outfit
      )
    );
  };

  /* -------------------- Next / previous -------------------- */

  // Moving on from an outfit rejects it - at most once per outfit per day.
  const rejectCurrentOutfit = () => {
    const match = selectedOutfit?.matchId;
    const matchId = match?._id;

    if (!matchId || wasRejectedToday(match) || pendingRejections.current.has(matchId)) {
      return;
    }

    pendingRejections.current.add(matchId);

    rejectOutfit(matchId)
      .then(({ score, rejectedCount, lastRejectedDate }) =>
        updateMatch(matchId, { score, rejectedCount, lastRejectedDate })
      )
      .catch((err) => console.error("Failed to reject outfit:", err))
      .finally(() => pendingRejections.current.delete(matchId));
  };

  const goNext = () => {
    if (filteredOutfits.length <= 1) return;

    rejectCurrentOutfit();
    setCurrentIndex((prev) => (prev + 1) % filteredOutfits.length);
  };

  const goPrev = () => {
    if (filteredOutfits.length <= 1) return;

    setCurrentIndex(
      (prev) => (prev - 1 + filteredOutfits.length) % filteredOutfits.length
    );
  };

  /* -------------------- Worn today -------------------- */

  const undoWorn = async (snapshot) => {
    try {
      await restoreMatchSnapshot(snapshot);

      // So re-picking this outfit later snapshots the right values.
      setOutfits((prev) =>
        prev.map((outfit) =>
          outfit.matchId?._id === snapshot.matchId
            ? applyWornSnapshot(outfit, snapshot)
            : outfit
        )
      );
    } catch (err) {
      console.error("Failed to revert previous worn outfit:", err);
    }
  };

  const markAsWornToday = async () => {
    const outfit = selectedOutfit;
    const matchId = outfit?.matchId?._id;

    if (!matchId) return;

    // Already today's outfit - just show it.
    if (wornToday?.matchId === matchId) {
      setShowSelector(false);
      return;
    }

    try {
      if (wornToday) {
        await undoWorn(wornToday);
      }

      const snapshot = takeWornSnapshot(outfit);
      const updated = await markMatchWorn(outfit.matchId);

      // Update the outfit, but don't re-sort - today's order stays.
      updateMatch(matchId, pickWornUpdate(updated));

      setWornToday(snapshot);
      setShowSelector(false);
      setNotice({ title: "Success", message: "Marked as worn today!" });
    } catch (err) {
      setNotice({
        title: "Error",
        message: `Error updating lastWornDate: ${getErrorMessage(err, err.message)}`,
      });
    }
  };

  // The worn outfit's latest copy from the list (or the one saved with it).
  const wornOutfit = wornToday
    ? outfits.find((outfit) => outfit.matchId?._id === wornToday.matchId) ||
      wornToday.outfit
    : null;

  /* -------------------- Delete -------------------- */

  const deleteCurrentOutfit = async () => {
    const matchId = selectedOutfit?.matchId?._id;

    if (!matchId) return;

    setDeleting(true);

    try {
      await deleteMatches([matchId]);

      // Nothing left to undo for a deleted worn outfit.
      if (wornToday?.matchId === matchId) {
        setWornToday(null);
      }

      setOutfits((prev) => prev.filter((outfit) => outfit.matchId?._id !== matchId));
      setCurrentIndex(0);
      setNotice({ title: "Success", message: "Outfit deleted." });
    } catch (err) {
      setNotice({
        title: "Error",
        message: `Error deleting outfit: ${getErrorMessage(err, err.message)}`,
      });
    } finally {
      setDeleting(false);
    }
  };

  return {
    loading,
    checkingToday,
    message,

    outfits,
    filteredOutfits,
    selectedOutfit,
    currentIndex,
    goNext,
    goPrev,

    todayTag,
    selectedTag,
    selectTag,

    wornToday,
    wornOutfit,
    showSelector,
    showOutfitPicker: () => setShowSelector(true),
    markAsWornToday,

    deleteCurrentOutfit,
    deleting,

    notice,
    clearNotice: () => setNotice(null),
  };
};

import { useEffect, useRef, useState } from "react";

import {
  rateMatch,
  restoreMatchSnapshot,
  sendMismatch,
  sendTagFeedback,
  sendTemperatureFeedback,
  sendTightsFeedback,
} from "../api/matches.js";
import { getErrorMessage } from "../api/errors.js";
import { changeTodayTag, fetchTodayOutfits } from "../api/today.js";
import { markMatchWorn } from "../matches/matchActions.js";
import { getPlannedWorn } from "../plan/plannedWorn.js";
import { rejectOutfit, wasRejectedToday } from "../today/outfitRejection.js";
import { cacheToday, getCachedToday } from "../today/todayCache.js";
import { todayWeatherParams } from "../today/createTodayOnce.js";
import { fetchTodayInfo, todayTagFor } from "../today/todayInfo.js";
import { outfitIdsChanged } from "../today/outfitIds.js";
import { indexAfterRemoving, withoutOutfits } from "../today/outfitFeedback.js";
import {
  applyWornSnapshot,
  fromAnotherDevice,
  hasSnapshot,
  pickWornUpdate,
  takeWornSnapshot,
} from "../today/wornSnapshot.js";
import { getTodayStartISO, isDateToday } from "../utils/dates.js";
import { weatherNoticeText } from "../today/weatherNotice.js";

// The server builds today's outfits after /today/create, so an empty list
// is retried once a second for a while.
const RETRY_MS = 1000;
const MAX_RETRIES = 10;

/*
 * The Today outfits: today's list - chosen, ordered and capped once a day
 * on the server, so every device shows the same - filtered by a tag, one
 * at a time. Next rejects the outfit being left (at most once a day).
 *
 * Stars picked for an outfit are saved once the user leaves it - next,
 * previous, another tag, or wearing it - so they can change their mind
 * until then. 1-2 stars can delete it (server/services/matchRatingService.js);
 * worn at the same time, it's kept.
 *
 * "Mark as worn" picks today's outfit. Picking a different one later
 * undoes the first if this device picked it (wornSnapshot.js); one picked
 * on another device stays counted. Whatever was worn today - on any
 * device, or from the Outfits page - is opened on (the server sends it).
 *
 * Another tag can be picked for the day (pickTag - mobile, today only;
 * the weekly preferences stay as they are). The server re-orders or
 * rebuilds today's list for it (server/services/todayTagService.js), and
 * only outfits with that tag are shown after it - swiping past the last
 * one reaches the end of them (atTagEnd), with no wrapping round.
 *
 * Everything is cached for the day, so coming back shows it straight away
 * and refreshes in the background.
 *
 * `todayReady`: true once today's weather is known and /today/create has
 * run (useWeather).
 * `tagFilter`: false shows all of today's outfits, unfiltered until a tag
 * is picked with pickTag (mobile has no tag filter panel).
 */
export const useToday = ({ todayReady, tagFilter = true }) => {
  const [cachedToday] = useState(getCachedToday);

  const [outfits, setOutfits] = useState(cachedToday?.outfits ?? []);
  const [currentIndex, setCurrentIndex] = useState(0);

  // Today's tag from the weekly preferences (a tagOptions name, or the
  // default - todayInfo.js). A day cached with an old tag name gets the
  // default too.
  const cachedTag = cachedToday ? todayTagFor(cachedToday.todayTag) : null;
  const [weeklyTag, setWeeklyTag] = useState(cachedTag);

  // A tag picked in its place for today (pickTag), or null.
  const [pickedTag, setPickedTag] = useState(cachedToday?.pickedTag ?? null);
  const [changingTag, setChangingTag] = useState(false);

  // The tag today's outfits are for: the picked one, else the weekly one.
  const todayTag = pickedTag ?? weeklyTag;

  const [selectedTag, setSelectedTag] = useState(
    tagFilter ? cachedTag : cachedToday?.pickedTag ?? null
  );

  // { level, band } when few outfits fit today's weather, else null.
  const [weatherNotice, setWeatherNotice] = useState(cachedToday?.weatherNotice ?? null);

  const [loading, setLoading] = useState(!cachedToday);
  const [checkingToday, setCheckingToday] = useState(false);
  const [message, setMessage] = useState(null);

  // { matchId, outfit, matchSnapshot, clothesSnapshots } for the outfit
  // worn today, kept to undo it if another is worn instead.
  const [wornToday, setWornToday] = useState(cachedToday?.wornToday ?? null);

  // Whether the outfit picker shows, or just the worn outfit.
  const [showSelector, setShowSelector] = useState(!cachedToday?.wornToday);

  // { title, message } to show after an action, until clearNotice. The
  // "marked worn" one also has kind: "worn", so an app with its own
  // celebration can skip it.
  const [notice, setNotice] = useState(null);

  // { matchId, rating }: stars picked for an outfit, not saved yet.
  const [pendingRating, setPendingRating] = useState(null);

  // Reject requests in flight, so fast taps can't send one twice.
  const pendingRejections = useRef(new Set());

  // Read by the background refresh, which outlives the render it began in.
  const outfitsRef = useRef(outfits);
  outfitsRef.current = outfits;
  const wornTodayRef = useRef(wornToday);
  wornTodayRef.current = wornToday;

  // Reset on mount too: StrictMode (dev) unmounts and remounts once, and
  // the ref survives that - left true, every load would be dropped.
  const unmounted = useRef(false);
  useEffect(() => {
    unmounted.current = false;

    return () => {
      unmounted.current = true;
    };
  }, []);

  /* -------------------- Load -------------------- */

  // The outfit the server says was worn today (the most recent, from any
  // device or the Outfits page). If this device picked the same one it
  // keeps its undo snapshot; otherwise it's shown without one, and opened
  // on. Nothing worn per the server leaves this device's choice as it is.
  // Today's plan worn by the server (core/plan/plannedWorn.js) comes with
  // the values from before, so it can be undone like this device's own -
  // and, as with wearing another outfit here, it undoes this device's
  // earlier pick.
  const applyServerWorn = (serverWorn) => {
    const matchId = serverWorn?.matchId?._id;

    if (!matchId) return;

    const local = wornTodayRef.current;

    if (local?.matchId === matchId) {
      setWornToday({ ...local, outfit: serverWorn });
      return;
    }

    const planned = getPlannedWorn(matchId);

    if (planned) {
      if (local) undoWorn(local);

      setWornToday({
        matchId,
        outfit: serverWorn,
        matchSnapshot: planned.matchSnapshot,
        clothesSnapshots: planned.clothesSnapshots,
      });
    } else {
      setWornToday(fromAnotherDevice(serverWorn));
    }

    setShowSelector(false);
  };

  // silent: cached outfits are already showing, so refresh them without
  // the loading messages and without moving the user's place.
  const loadOutfits = async (silent, attempt = 0) => {
    try {
      const { outfits: fresh, wornToday: serverWorn, notice } = await fetchTodayOutfits(
        getTodayStartISO()
      );

      if (unmounted.current) return;

      applyServerWorn(serverWorn);
      setWeatherNotice(notice);

      // Today is still being created.
      if (fresh.length === 0) {
        if (attempt < MAX_RETRIES) {
          if (!silent) setCheckingToday(true);

          setTimeout(() => {
            if (!unmounted.current) {
              loadOutfits(silent, attempt + 1);
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

      const changed = outfitIdsChanged(outfitsRef.current, fresh);

      setOutfits(fresh);

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
      // Already the tagOptions spelling, which is what outfit tags use.
      const { todayTag: todayTagName } = await fetchTodayInfo();

      setWeeklyTag(todayTagName);

      // Start filtered to today's tag - unless cached outfits are already
      // showing, where the user may have picked a different tag.
      if (!cachedToday && tagFilter) {
        setSelectedTag(todayTagName);
      }

      await loadOutfits(Boolean(cachedToday));
    };

    loadToday();
    // Once, when today is ready.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [todayReady]);

  // Keep the cached copy in step with every change (rejections, worn,
  // deletes) so coming back shows exactly what was on screen.
  useEffect(() => {
    if (loading) return;

    cacheToday({ todayTag: weeklyTag, pickedTag, outfits, wornToday, weatherNotice });
  }, [outfits, weeklyTag, pickedTag, wornToday, weatherNotice, loading]);

  /* -------------------- Tag filter -------------------- */

  const filteredOutfits = selectedTag
    ? outfits.filter((outfit) => outfit?.matchId?.tags?.includes(selectedTag))
    : outfits;

  // Past the last outfit with the picked tag (none at all when the list
  // has none) - see goNext.
  const atTagEnd = Boolean(pickedTag) && currentIndex >= filteredOutfits.length;

  const selectedOutfit = filteredOutfits[currentIndex] ?? null;

  // Read after a request, once the list may have moved on.
  const filteredOutfitsRef = useRef(filteredOutfits);
  filteredOutfitsRef.current = filteredOutfits;
  const currentIndexRef = useRef(currentIndex);
  currentIndexRef.current = currentIndex;

  const selectTag = (tagName) => {
    saveRating();
    setSelectedTag(selectedTag === tagName ? null : tagName);
    setCurrentIndex(0);
  };

  // Another tag for today, in place of the weekly one: the server
  // re-orders or rebuilds today's list for it from today's weather
  // (useWeather's weather and season), then the list is fetched again and
  // shows just that tag's outfits, from the first. Back to choosing if an
  // outfit was already worn.
  const pickTag = async (tagName, weather, season) => {
    if (!weather || changingTag) return;

    saveRating();
    setChangingTag(true);

    try {
      await changeTodayTag({ tag: tagName, ...todayWeatherParams(weather, season) });

      if (unmounted.current) return;

      setPickedTag(tagName);
      setSelectedTag(tagName);
      setShowSelector(true);
      await loadOutfits(false);
      setCurrentIndex(0);
    } catch (err) {
      console.error("Failed to change today's tag:", err);
      setNotice({
        title: "Error",
        message: `Couldn't change today's tag: ${getErrorMessage(err, err.message)}`,
      });
    } finally {
      if (!unmounted.current) setChangingTag(false);
    }
  };

  /* -------------------- List updates -------------------- */

  // Merges new values into one match, keeping the order. A new rating
  // (e.g. saved on the outfit screen) replaces stars picked here.
  const updateMatch = (matchId, fields) => {
    if ("rating" in fields) {
      setPendingRating((prev) => (prev?.matchId === matchId ? null : prev));
    }

    setOutfits((prev) =>
      prev.map((outfit) =>
        outfit.matchId?._id === matchId
          ? { ...outfit, matchId: { ...outfit.matchId, ...fields } }
          : outfit
      )
    );
  };

  /* -------------------- Rating -------------------- */

  // The selected outfit's stars: picked here, else saved, else null.
  const selectedRating =
    pendingRating && pendingRating.matchId === selectedOutfit?.matchId?._id
      ? pendingRating.rating
      : selectedOutfit?.matchId?.rating ?? null;

  const rateSelected = (rating) => {
    const matchId = selectedOutfit?.matchId?._id;

    if (matchId) setPendingRating({ matchId, rating });
  };

  // Saves the stars picked, if they changed - when the outfit is left, or
  // as it's worn (`wearing`: a low rating then keeps it). A deleted outfit
  // leaves the list without moving the user's place.
  const saveRating = async ({ wearing = false } = {}) => {
    const pending = pendingRating;

    if (!pending) return;

    setPendingRating(null);

    const { matchId, rating } = pending;
    const match = outfitsRef.current.find(
      (outfit) => outfit.matchId?._id === matchId
    )?.matchId;

    if (!match || rating === (match.rating ?? null)) return;

    try {
      const result = await rateMatch(matchId, rating, { wearing });

      if (unmounted.current) return;

      if (result.deleted) {
        removeFromToday([matchId], [matchId]);
      } else {
        updateMatch(matchId, {
          rating: result.rating,
          score: result.score,
        });
      }
    } catch (err) {
      console.error("Failed to rate outfit:", err);
      feedbackError(err);
    }
  };

  /* -------------------- Next / previous -------------------- */

  // Moving on from an outfit rejects it - at most once per outfit per day -
  // which only hides it from Today for the next few days, never touching
  // its score. Rated and favourite outfits included.
  const rejectCurrentOutfit = () => {
    const match = selectedOutfit?.matchId;
    const matchId = match?._id;

    if (
      !matchId ||
      wasRejectedToday(match) ||
      pendingRejections.current.has(matchId)
    ) {
      return;
    }

    pendingRejections.current.add(matchId);

    rejectOutfit(matchId)
      .then(({ rejectedCount, lastRejectedDate }) =>
        updateMatch(matchId, { rejectedCount, lastRejectedDate })
      )
      .catch((err) => console.error("Failed to reject outfit:", err))
      .finally(() => pendingRejections.current.delete(matchId));
  };

  // With a picked tag the outfits don't wrap round: next from the last one
  // goes to the end of them (atTagEnd), and previous from there back.
  const canMove = pickedTag
    ? filteredOutfits.length > 0
    : filteredOutfits.length > 1;

  const goNext = () => {
    if (!canMove || atTagEnd) return;

    rejectCurrentOutfit();
    saveRating();
    setCurrentIndex((prev) =>
      pickedTag ? prev + 1 : (prev + 1) % filteredOutfits.length
    );
  };

  const goPrev = () => {
    if (!canMove) return;

    saveRating();

    if (pickedTag) {
      setCurrentIndex((prev) => Math.max(0, Math.min(prev, filteredOutfits.length) - 1));
      return;
    }

    setCurrentIndex(
      (prev) => (prev - 1 + filteredOutfits.length) % filteredOutfits.length
    );
  };

  /* -------------------- Worn today -------------------- */

  // Only possible for an outfit this device marked worn - one from another
  // device has no snapshot, so it stays counted.
  const undoWorn = async (snapshot) => {
    if (!hasSnapshot(snapshot)) return;

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

  // Resolves true once the outfit is today's (false if it couldn't be).
  const markAsWornToday = async () => {
    const outfit = selectedOutfit;
    const matchId = outfit?.matchId?._id;

    if (!matchId) return false;

    await saveRating({ wearing: true });

    // Already today's outfit - just show it.
    if (wornToday?.matchId === matchId) {
      setShowSelector(false);
      return true;
    }

    try {
      if (wornToday) {
        await undoWorn(wornToday);
      }

      // Already worn today but not undoable here (marked on another device
      // or the Outfits page, or its undo failed): it's today's outfit again,
      // but it isn't counted twice in a day. One this device undid has its
      // old date back, so it's counted as usual.
      if (isDateToday(outfit.matchId.lastWornDate)) {
        setWornToday(fromAnotherDevice(outfit));
        setShowSelector(false);
        return true;
      }

      const snapshot = takeWornSnapshot(outfit);
      const updated = await markMatchWorn(outfit.matchId);

      // Update the outfit, but don't re-sort - today's order stays.
      updateMatch(matchId, pickWornUpdate(updated));

      setWornToday(snapshot);
      setShowSelector(false);
      setNotice({ kind: "worn", title: "Success", message: "Marked as worn today!" });
      return true;
    } catch (err) {
      setNotice({
        title: "Error",
        message: `Error updating lastWornDate: ${getErrorMessage(err, err.message)}`,
      });
      return false;
    }
  };

  // The worn outfit's latest copy from the list (or the one saved with it).
  const wornOutfit = wornToday
    ? outfits.find((outfit) => outfit.matchId?._id === wornToday.matchId) ||
      wornToday.outfit
    : null;

  /* -------------------- Broken heart -------------------- */

  // Takes outfits off today's list, keeping the place (outfitFeedback.js),
  // and drops any stars picked for them.
  // `deletedIds`: those of `matchIds` that were deleted, not just hidden -
  // they're gone for good, so a deleted worn outfit has nothing left to
  // undo.
  const removeFromToday = (matchIds, deletedIds = []) => {
    const worn = wornTodayRef.current;
    const removed = matchIds.map(String);

    if (worn && deletedIds.map(String).includes(String(worn.matchId))) {
      setWornToday(null);
    }

    setPendingRating((prev) =>
      prev && removed.includes(String(prev.matchId)) ? null : prev
    );
    setOutfits((prev) => withoutOutfits(prev, matchIds));
    setCurrentIndex(
      indexAfterRemoving(filteredOutfitsRef.current, currentIndexRef.current, matchIds)
    );
  };

  const feedbackError = (err) =>
    setNotice({
      title: "Error",
      message: `Couldn't save that: ${getErrorMessage(err, err.message)}`,
    });

  // Too hot / too cold (TOO_HOT / TOO_COLD): the outfit's range moves a
  // degree and it's hidden for today - not rejected. Resolves true once
  // saved.
  const giveTemperatureFeedback = async (matchId, feel) => {
    try {
      await sendTemperatureFeedback(matchId, feel);
      removeFromToday([matchId]);
      return true;
    } catch (err) {
      feedbackError(err);
      return false;
    }
  };

  // Can't wear this with tights (NO_TIGHTS_OUTFIT / NO_TIGHTS_ITEM): hidden
  // for today, with - for the item - every other outfit with it that's only
  // here thanks to tights (the server says which). Resolves true once
  // saved.
  const giveTightsFeedback = async (matchId, scope) => {
    try {
      const { hiddenMatchIds = [] } = await sendTightsFeedback(matchId, scope);
      removeFromToday([matchId, ...hiddenMatchIds]);
      return true;
    } catch (err) {
      feedbackError(err);
      return false;
    }
  };

  // Not appropriate for today's tag: the tag comes off the outfit and it's
  // hidden for today. An outfit without the tag is left as it is.
  // Resolves true once saved.
  const giveTagFeedback = async (matchId) => {
    if (!todayTag) return false;

    try {
      const { removed } = await sendTagFeedback(matchId, todayTag);
      if (removed) removeFromToday([matchId]);
      return true;
    } catch (err) {
      feedbackError(err);
      return false;
    }
  };

  // Two of the outfit's clothing items never go together: every outfit
  // with both is deleted apart from favourites and user-built ones (the
  // server says which). The outfit on screen leaves the list either way -
  // a kept one is hidden for today. Resolves true once saved.
  const markMismatch = async (matchId, clothesIds) => {
    try {
      const { deletedMatchIds = [] } = await sendMismatch(matchId, clothesIds);
      removeFromToday([matchId, ...deletedMatchIds], deletedMatchIds);
      return true;
    } catch (err) {
      feedbackError(err);
      return false;
    }
  };

  return {
    loading,
    checkingToday,
    message,
    // "Brrr! It's cold today..." (shared/todayMessages.json), or null.
    weatherNoticeText: weatherNoticeText(weatherNotice),

    outfits,
    filteredOutfits,
    selectedOutfit,
    currentIndex,
    canMove,
    goNext,
    goPrev,
    atTagEnd,
    updateMatch,

    selectedRating,
    rateSelected,

    todayTag,
    pickedTag,
    selectedTag,
    selectTag,
    pickTag,
    changingTag,

    wornToday,
    wornOutfit,
    showSelector,
    showOutfitPicker: () => setShowSelector(true),
    markAsWornToday,

    giveTemperatureFeedback,
    giveTightsFeedback,
    giveTagFeedback,
    markMismatch,
    // Outfits deleted elsewhere (the mobile outfit screen's mismatch).
    dropOutfits: (matchIds) => removeFromToday(matchIds, matchIds),
    // Fetches today's list again from the first outfit - after it's been
    // built again on the server (core/outfitRebuild/runOutfitRebuild.js).
    reload: () => {
      saveRating();
      return loadOutfits(false);
    },

    notice,
    clearNotice: () => setNotice(null),
  };
};

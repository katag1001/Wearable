import { useEffect, useMemo, useRef, useState } from "react";

import {
  fetchTodayFootwear,
  rejectFootwearPairing,
  unwearFootwear,
  wearFootwear,
} from "../api/footwear.js";
import { cacheFootwear, getCachedFootwear } from "../footwear/footwearCache.js";
import { applyCachedOrder, readTodayWeather } from "../footwear/footwearOrder.js";
import {
  findPairing,
  getPairingSubtype,
  isOutfitPatterned,
  rankFootwear,
} from "../footwear/footwearRanking.js";
import { wornValuesOf } from "../today/wornSnapshot.js";
import { isDateToday } from "../utils/dates.js";

/*
 * The shoes for each of today's outfits: all the user's footwear, best
 * first for that outfit and today's weather (footwearRanking.js). Each
 * outfit shows its top shoe, or the one picked for it with Change shoes.
 *
 * Moving past a shoe while changing shoes lowers its pairing with the
 * outfit's bottom (at most once a day); wearing it (with the outfit) marks
 * it worn and raises the pairing. Wearing a different shoe - or a
 * different outfit - undoes the previous shoe's worn values and its
 * pairing boost, if this device marked it worn.
 *
 * A shoe worn today on another device (this device has no record of its
 * own) is found from its lastWornDate and shown with the worn outfit -
 * but, with no snapshot, can't be undone; it stays counted.
 *
 * `outfits`: every outfit that may be shown (today's list and the worn
 * one). `wornMatchId`: the outfit worn today, or null.
 */

const matchIdOf = (outfit) => outfit?.matchId?._id ?? null;
const bottomOf = (outfit) => getPairingSubtype(outfit?.matchId?.clothes);

export const useTodayFootwear = ({ outfits, wornMatchId, todayTag }) => {
  const [cached] = useState(getCachedFootwear);

  const [data, setData] = useState(null);
  const [error, setError] = useState(null);

  // Each outfit's shoe ids in display order - ranked once per outfit so
  // rejections and wearing don't reshuffle the list while browsing.
  const [orders, setOrders] = useState(cached.orders);
  const [chosen, setChosen] = useState(cached.chosen);

  const [worn, setWornState] = useState(cached.worn);
  const [saving, setSaving] = useState(false);

  // Read by the async wear / undo steps, which outlive their render.
  const wornRef = useRef(worn);
  const setWorn = (value) => {
    wornRef.current = value;
    setWornState(value);
  };

  // Whether this device had its own record of today's shoe on opening.
  // Only without one is a shoe worn elsewhere picked up - with one, this
  // device's choice (and its undo) wins.
  const [hadLocalWorn] = useState(() => Boolean(cached.worn));

  // Outfits ranked since opening - a cached order is only checked against
  // the fresh footwear (deleted / new shoes) once.
  const ranked = useRef(new Set());
  const pendingRejections = useRef(new Set());

  const loaded = data !== null;

  /* -------------------- Load -------------------- */

  useEffect(() => {
    let cancelled = false;

    fetchTodayFootwear()
      .then((fresh) => {
        if (!cancelled) setData(fresh);
      })
      .catch((err) => {
        console.error("Failed to load footwear:", err);
        if (!cancelled) setError("Couldn't load your footwear.");
      });

    return () => {
      cancelled = true;
    };
  }, []);

  /* -------------------- Orders -------------------- */

  // Changes whenever an outfit is added or its bottom becomes known
  // (outfits cached earlier in the day may not carry subtypes until the
  // Today page's background refresh brings them).
  const outfitsKey = (outfits || [])
    .map((outfit) => `${matchIdOf(outfit)}|${bottomOf(outfit)}`)
    .join(",");

  useEffect(() => {
    if (!data) return;

    const { weather, season } = readTodayWeather();
    const added = {};

    for (const outfit of outfits || []) {
      const matchId = matchIdOf(outfit);
      const bottomSubtype = bottomOf(outfit);
      const existing = orders[matchId];

      if (
        !matchId ||
        (ranked.current.has(matchId) &&
          (existing?.bottomSubtype ?? null) === bottomSubtype)
      ) {
        continue;
      }

      const rankedShoes = rankFootwear(data.items, {
        gender: data.gender,
        bottomSubtype,
        pairings: data.pairings,
        weather,
        season,
        todayTag,
        outfitColors: outfit.matchId.colors || [],
        outfitPatterned: isOutfitPatterned(outfit.matchId),
        colourLevel: data.colourLevel,
      });

      ranked.current.add(matchId);
      added[matchId] = {
        bottomSubtype,
        footwearIds: applyCachedOrder(rankedShoes, existing, bottomSubtype).map(
          (item) => item._id
        ),
      };
    }

    if (Object.keys(added).length > 0) {
      setOrders((prev) => ({ ...prev, ...added }));
    }
    // Ranked once per outfit - pairings/worn changing later must not
    // reshuffle the list.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [loaded, outfitsKey]);

  // Saved straight away on every change, so an undone shoe can never be
  // undone a second time after a reload.
  useEffect(() => {
    cacheFootwear({ orders, chosen, worn });
  }, [orders, chosen, worn]);

  /* -------------------- Worn on another device -------------------- */

  useEffect(() => {
    if (!data || !wornMatchId || wornRef.current || hadLocalWorn) return;

    const shoeWornToday = data.items.find((item) => isDateToday(item.lastWornDate));

    if (shoeWornToday) {
      const outfit = (outfits || []).find((entry) => matchIdOf(entry) === wornMatchId);

      setWorn({
        footwearId: shoeWornToday._id,
        matchId: wornMatchId,
        bottomSubtype: bottomOf(outfit),
        snapshot: null,
      });
    }
    // Once the footwear and the worn outfit are known.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [loaded, wornMatchId]);

  /* -------------------- State helpers -------------------- */

  // Both may run before the footwear has loaded (undoing a shoe on mount) -
  // the fresh load then carries the change anyway.
  const updateItem = (item) =>
    setData((prev) => prev && {
      ...prev,
      items: prev.items.map((entry) =>
        entry._id === item._id ? { ...entry, ...item } : entry
      ),
    });

  const updatePairing = (pairing) => {
    if (!pairing) return;

    setData((prev) => prev && {
      ...prev,
      pairings: [
        ...prev.pairings.filter(
          (entry) =>
            entry.bottomSubtype !== pairing.bottomSubtype ||
            entry.footwearSubtype !== pairing.footwearSubtype
        ),
        pairing,
      ],
    });
  };

  /* -------------------- Undo a worn shoe -------------------- */

  // Only for a shoe this device marked worn - one worn elsewhere has no
  // snapshot, so it stays counted.
  const undoWorn = async (entry) => {
    if (!entry?.snapshot) return;

    const { item, pairing } = await unwearFootwear(
      entry.footwearId,
      entry.bottomSubtype,
      entry.snapshot
    );

    updateItem(item);
    updatePairing(pairing);
  };

  // A different outfit was worn since this shoe was picked (e.g. on
  // another device) - the shoe went with the old outfit, so take it back
  // off. Wearing here always wears the shoe first, so this doesn't fire.
  useEffect(() => {
    const previous = wornRef.current;

    if (!previous || !wornMatchId || previous.matchId === wornMatchId) return;

    setWorn(null);

    undoWorn(previous).catch((err) =>
      console.error("Failed to undo the previous shoe:", err)
    );
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [wornMatchId]);

  /* -------------------- Shoes per outfit -------------------- */

  const byId = useMemo(
    () => new Map((data?.items || []).map((item) => [item._id, item])),
    [data]
  );

  // The outfit's shoes in order, best first.
  const shoesFor = (outfit) =>
    (orders[matchIdOf(outfit)]?.footwearIds || [])
      .map((id) => byId.get(id))
      .filter(Boolean);

  // The shoe worn today with this outfit, if any.
  const wornShoeFor = (outfit) => {
    const matchId = matchIdOf(outfit);

    return matchId && worn?.matchId === matchId
      ? byId.get(worn.footwearId) ?? null
      : null;
  };

  // The shoe shown with an outfit: the one picked for it, else the one
  // worn with it, else its best.
  const shoeFor = (outfit) => {
    const matchId = matchIdOf(outfit);

    if (!matchId) return null;

    return (
      byId.get(chosen[matchId]) ||
      wornShoeFor(outfit) ||
      shoesFor(outfit)[0] ||
      null
    );
  };

  const isWornWith = (outfit, shoe) =>
    Boolean(shoe) &&
    worn?.footwearId === shoe._id &&
    worn?.matchId === matchIdOf(outfit);

  // Picked with Change shoes - shown with the outfit, nothing saved.
  const choose = (outfit, shoe) => {
    const matchId = matchIdOf(outfit);

    if (!matchId || !shoe) return;

    setChosen((prev) => ({ ...prev, [matchId]: shoe._id }));
  };

  /* -------------------- Moving past -------------------- */

  // Lowers the pairing - at most once a day, never for the shoe worn
  // today, and not at all for an outfit with no bottom or one-piece.
  const rejectShoe = (outfit, shoe) => {
    const bottomSubtype = bottomOf(outfit);

    if (!data || !shoe || !bottomSubtype || isWornWith(outfit, shoe)) return;

    const key = `${bottomSubtype}|${shoe.subtype}`;
    const pairing = findPairing(data.pairings, bottomSubtype, shoe.subtype);

    if (isDateToday(pairing?.lastRejectedDate) || pendingRejections.current.has(key)) {
      return;
    }

    pendingRejections.current.add(key);

    rejectFootwearPairing(bottomSubtype, shoe.subtype)
      .then(({ pairing: updated }) => updatePairing(updated))
      .catch((err) => console.error("Failed to reject shoe:", err))
      .finally(() => pendingRejections.current.delete(key));
  };

  /* -------------------- Wear -------------------- */

  // Marks the shoe worn with the outfit, undoing the previous shoe.
  // Resolves true once saved (or already worn), false if it wasn't.
  const wearWith = async (outfit, shoe) => {
    const matchId = matchIdOf(outfit);
    const bottomSubtype = bottomOf(outfit);
    const previous = wornRef.current;

    if (!matchId || !shoe) return false;

    if (previous?.footwearId === shoe._id && previous?.matchId === matchId) {
      return true;
    }

    setSaving(true);

    try {
      if (previous) {
        await undoWorn(previous);
        setWorn(null);
      }

      const snapshot = wornValuesOf(shoe);
      const { item, pairing } = await wearFootwear(shoe._id, bottomSubtype);

      updateItem(item);
      updatePairing(pairing);

      setWorn({ footwearId: shoe._id, matchId, bottomSubtype, snapshot });
      return true;
    } catch (err) {
      console.error("Failed to mark shoe worn:", err);
      return false;
    } finally {
      setSaving(false);
    }
  };

  // Takes the worn shoe back off (the outfit it was worn with failed to
  // save).
  const takeOff = async () => {
    const previous = wornRef.current;

    if (!previous) return;

    setWorn(null);

    try {
      await undoWorn(previous);
    } catch (err) {
      console.error("Failed to undo the shoe:", err);
    }
  };

  return {
    loading: !data,
    error,
    hasFootwear: byId.size > 0,
    shoesFor,
    shoeFor,
    wornShoeFor,
    choose,
    rejectShoe,
    wearWith,
    takeOff,
    saving,
  };
};

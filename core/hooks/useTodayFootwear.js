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
 * The shoes for the outfit worn today: all the user's footwear one at a
 * time, best first for this outfit and today's weather
 * (footwearRanking.js). Moving past a shoe lowers its pairing with the
 * outfit's bottom (at most once a day); "Wear these" marks it worn and
 * raises the pairing. Wearing a different shoe - or a different outfit -
 * undoes the previous shoe's worn values and its pairing boost.
 */
export const useTodayFootwear = ({ outfit, todayTag }) => {
  const matchId = outfit?.matchId?._id ?? null;
  const bottomSubtype = getPairingSubtype(outfit?.matchId?.clothes);

  const [data, setData] = useState(null);
  const [error, setError] = useState(null);

  // Shoe ids in display order - set once per outfit so rejections and
  // wearing don't reshuffle the list while browsing.
  const [order, setOrder] = useState(null);
  const [index, setIndex] = useState(0);

  const [worn, setWorn] = useState(() => getCachedFootwear().worn);
  const [saving, setSaving] = useState(false);

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

  /* -------------------- Order -------------------- */

  useEffect(() => {
    if (!data || !matchId) return;

    const { weather, season } = readTodayWeather();

    const ranked = rankFootwear(data.items, {
      gender: data.gender,
      bottomSubtype,
      pairings: data.pairings,
      weather,
      season,
      todayTag,
      outfitColors: outfit?.matchId?.colors || [],
      outfitPatterned: isOutfitPatterned(outfit?.matchId),
      colourLevel: data.colourLevel,
    });

    const ids = applyCachedOrder(
      ranked,
      getCachedFootwear().order,
      matchId,
      bottomSubtype
    ).map((item) => item._id);

    setOrder(ids);

    // Open on today's shoe if one is worn with this outfit.
    const wornIndex = ids.indexOf(worn?.matchId === matchId ? worn.footwearId : null);
    setIndex(Math.max(0, wornIndex));

    // Ranked once per outfit - pairings/worn changing later must not
    // reshuffle the list. bottomSubtype is included because outfits cached
    // earlier in the day may not carry subtypes until the Today page's
    // background refresh brings them.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [loaded, matchId, bottomSubtype]);

  // Saved straight away on every change (even before the order is known),
  // so an undone shoe can never be undone a second time after a reload.
  useEffect(() => {
    cacheFootwear({
      order:
        order && matchId
          ? { matchId, bottomSubtype, footwearIds: order }
          : getCachedFootwear().order,
      worn,
    });
  }, [order, worn, matchId, bottomSubtype]);

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

  const undoWorn = async (entry) => {
    const { item, pairing } = await unwearFootwear(
      entry.footwearId,
      entry.bottomSubtype,
      entry.snapshot
    );

    updateItem(item);
    updatePairing(pairing);
  };

  // A different outfit was worn since this shoe was picked - the shoe went
  // with the old outfit, so take it back off.
  useEffect(() => {
    if (!worn || !matchId || worn.matchId === matchId) return;

    const previous = worn;
    setWorn(null);

    undoWorn(previous).catch((err) =>
      console.error("Failed to undo the previous shoe:", err)
    );
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [matchId]);

  /* -------------------- Current shoe -------------------- */

  const shoes = useMemo(() => {
    if (!data || !order) return [];

    const byId = new Map(data.items.map((item) => [item._id, item]));

    return order.map((id) => byId.get(id)).filter(Boolean);
  }, [data, order]);

  const current = shoes[index] ?? null;

  const isWornShoe = (shoe) =>
    Boolean(shoe) && worn?.footwearId === shoe._id && worn?.matchId === matchId;

  /* -------------------- Moving past -------------------- */

  // Lowers the pairing - at most once a day, never for the shoe worn
  // today, and not at all for an outfit with no bottom or one-piece.
  const rejectCurrent = () => {
    if (!current || !bottomSubtype || isWornShoe(current)) return;

    const key = `${bottomSubtype}|${current.subtype}`;
    const pairing = findPairing(data.pairings, bottomSubtype, current.subtype);

    if (isDateToday(pairing?.lastRejectedDate) || pendingRejections.current.has(key)) {
      return;
    }

    pendingRejections.current.add(key);

    rejectFootwearPairing(bottomSubtype, current.subtype)
      .then(({ pairing: updated }) => updatePairing(updated))
      .catch((err) => console.error("Failed to reject shoe:", err))
      .finally(() => pendingRejections.current.delete(key));
  };

  const goNext = () => {
    if (shoes.length <= 1) return;

    rejectCurrent();
    setIndex((prev) => (prev + 1) % shoes.length);
  };

  const goPrev = () => {
    if (shoes.length <= 1) return;

    setIndex((prev) => (prev - 1 + shoes.length) % shoes.length);
  };

  /* -------------------- Wear -------------------- */

  const wearCurrent = async () => {
    if (!current || saving || isWornShoe(current)) return;

    setSaving(true);

    try {
      if (worn) {
        await undoWorn(worn);
      }

      const snapshot = wornValuesOf(current);
      const { item, pairing } = await wearFootwear(current._id, bottomSubtype);

      updateItem(item);
      updatePairing(pairing);

      setWorn({ footwearId: current._id, matchId, bottomSubtype, snapshot });
    } catch (err) {
      console.error("Failed to mark shoe worn:", err);
      setError("Couldn't mark these as worn - please try again.");
    } finally {
      setSaving(false);
    }
  };

  return {
    loading: !data || !order,
    error,
    shoes,
    current,
    index,
    goNext,
    goPrev,
    isWearingCurrent: isWornShoe(current),
    wearCurrent,
    saving,
  };
};

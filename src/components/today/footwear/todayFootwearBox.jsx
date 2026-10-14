import React, { useEffect, useMemo, useRef, useState } from "react";

import { getImageUrl } from "../../../utils/getImageUrl";
import { getSeason, isDateToday } from "../todayHelpers";
import {
  getPairingSubtype,
  findPairing,
  isOutfitPatterned,
  rankFootwear,
} from "./footwearRanking";
import { getCachedFootwear, cacheFootwear } from "./footwearCache";
import {
  fetchTodayFootwear,
  rejectFootwearPairing,
  wearFootwear,
  unwearFootwear,
} from "./footwearApi";

import "./todayFootwear.css";

/*
 * The shoe box beside the outfit worn today. Shows all the user's footwear
 * one at a time, best first for this outfit and today's weather
 * (footwearRanking.js). Scrolling right past a shoe lowers its pairing with
 * the outfit's bottom (at most once a day); "Wear these" marks it worn and
 * raises the pairing. Wearing a different shoe - or a different outfit -
 * undoes the previous shoe's worn values and its pairing boost.
 */

const WEATHER_CACHE_KEY = "weather_cache";

// Today's forecast { min, max, code } and season, from AutoWeather's cache.
const readTodayWeather = () => {
  try {
    const cached = JSON.parse(localStorage.getItem(WEATHER_CACHE_KEY));

    if (!cached?.weather || !isDateToday(cached.date)) {
      return { weather: null, season: null };
    }

    return {
      weather: cached.weather,
      season: getSeason(new Date(), cached.location?.latitude ?? null),
    };
  } catch {
    return { weather: null, season: null };
  }
};

const wornSnapshotOf = (item) => ({
  lastWornDate: item.lastWornDate ?? null,
  timesWorn: item.timesWorn ?? 0,
  timesWornThisYear: item.timesWornThisYear ?? 0,
  wornYear: item.wornYear ?? null,
});

// Puts the cached order back for the same outfit and bottom, dropping
// deleted shoes and adding new ones (in ranked order) at the end.
const applyCachedOrder = (ranked, cachedOrder, matchId, bottomSubtype) => {
  if (
    cachedOrder?.matchId !== matchId ||
    (cachedOrder?.bottomSubtype ?? null) !== bottomSubtype
  ) {
    return ranked;
  }

  const byId = new Map(ranked.map((item) => [item._id, item]));

  const kept = cachedOrder.footwearIds
    .map((id) => byId.get(id))
    .filter(Boolean);

  const keptIds = new Set(kept.map((item) => item._id));

  return [...kept, ...ranked.filter((item) => !keptIds.has(item._id))];
};


const TodayFootwearBox = ({ outfit, todayTag }) => {

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


  /* ------------------------- LOAD ------------------------- */

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


  /* ------------------------- ORDER ------------------------- */

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

    const ordered = applyCachedOrder(
      ranked,
      getCachedFootwear().order,
      matchId,
      bottomSubtype
    );
    const ids = ordered.map((item) => item._id);

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
  // so an undone shoe can never be undone a second time after a refresh.
  useEffect(() => {

    cacheFootwear({
      order:
        order && matchId
          ? { matchId, bottomSubtype, footwearIds: order }
          : getCachedFootwear().order,
      worn,
    });

  }, [order, worn, matchId, bottomSubtype]);


  /* ------------------------- STATE HELPERS ------------------------- */

  // Both may run before the footwear has loaded (undoing a shoe on mount) -
  // the fresh load then carries the change anyway.
  const updateItem = (item) =>
    setData((prev) => prev && ({
      ...prev,
      items: prev.items.map((entry) =>
        entry._id === item._id ? { ...entry, ...item } : entry
      ),
    }));

  const updatePairing = (pairing) => {
    if (!pairing) return;

    setData((prev) => prev && ({
      ...prev,
      pairings: [
        ...prev.pairings.filter(
          (entry) =>
            entry.bottomSubtype !== pairing.bottomSubtype ||
            entry.footwearSubtype !== pairing.footwearSubtype
        ),
        pairing,
      ],
    }));
  };


  /* ------------------------- UNDO A WORN SHOE ------------------------- */

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


  /* ------------------------- CURRENT SHOE ------------------------- */

  const shoes = useMemo(() => {
    if (!data || !order) return [];

    const byId = new Map(data.items.map((item) => [item._id, item]));

    return order.map((id) => byId.get(id)).filter(Boolean);
  }, [data, order]);

  const current = shoes[index] ?? null;

  const isWornShoe = (shoe) =>
    Boolean(shoe) && worn?.footwearId === shoe._id && worn?.matchId === matchId;


  /* ------------------------- SCROLL PAST ------------------------- */

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


  /* ------------------------- WEAR ------------------------- */

  const wearCurrent = async () => {

    if (!current || saving || isWornShoe(current)) return;

    setSaving(true);

    try {

      if (worn) {
        await undoWorn(worn);
      }

      const snapshot = wornSnapshotOf(current);

      const { item, pairing } = await wearFootwear(current._id, bottomSubtype);

      updateItem(item);
      updatePairing(pairing);

      setWorn({
        footwearId: current._id,
        matchId,
        bottomSubtype,
        snapshot,
      });

    } catch (err) {

      console.error("Failed to mark shoe worn:", err);
      setError("Couldn't mark these as worn - please try again.");

    } finally {

      setSaving(false);
    }
  };


  /* ------------------------- RENDER ------------------------- */

  const renderBody = () => {

    if (error && !data) {
      return <p className="today-footwear-message">{error}</p>;
    }

    if (!data || !order) {
      return <p className="today-footwear-message">Loading footwear...</p>;
    }

    if (!shoes.length) {
      return (
        <p className="today-footwear-message">
          Add footwear in My Wardrobe to get shoe suggestions here.
        </p>
      );
    }

    return (
      <>
        <div className="featured-outfit-content today-footwear-content">

          <div className="today-image-group">
            {current.imageUrl && (
              <img
                src={getImageUrl(current.imageUrl, 600)}
                alt={current.name}
                className="today-image"
              />
            )}
          </div>

          {shoes.length > 1 && (
            <>
              <button
                className="today-arrow-button today-arrow-prev"
                onClick={goPrev}
                aria-label="Previous shoes"
              >
                ‹
              </button>

              <button
                className="today-arrow-button today-arrow-next"
                onClick={goNext}
                aria-label="Next shoes"
              >
                ›
              </button>
            </>
          )}

        </div>

        <p className="today-footwear-name">
          {current.name}
        </p>

        <p className="today-footwear-position">
          {index + 1} of {shoes.length}
        </p>

        {error && (
          <p className="today-footwear-message">{error}</p>
        )}

        <div className="today-buttons">
          <button
            className="regular-button"
            onClick={wearCurrent}
            disabled={saving || isWornShoe(current)}
          >
            {isWornShoe(current)
              ? "Wearing today"
              : saving
                ? "Saving..."
                : "Wear these"}
          </button>
        </div>
      </>
    );
  };


  return (
    <div className="featured-outfit today-footwear-box">

      <h3 className="today-footwear-title">
        Shoes
      </h3>

      {renderBody()}

    </div>
  );
};


export default TodayFootwearBox;

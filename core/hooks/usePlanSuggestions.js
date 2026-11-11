import { useEffect, useRef, useState } from "react";

import { getErrorMessage } from "../api/errors.js";
import { planDay, suggestOutfits } from "../api/plan.js";
import { dayWeatherParams } from "../plan/dayWeather.js";
import { fetchTagForDay, tagsFor } from "../plan/planOccasions.js";
import { savePlannedWorn } from "../plan/plannedWorn.js";
import { usePlanFootwear } from "./usePlanFootwear.js";

/*
 * A planned day's recommendations: Today's picking run for that day's
 * weather (server/services/dayOutfitService.js), only outfits for the
 * chosen plan or tag, one at a time with their shoes. Swiping never
 * rejects. "Plan this" plans the outfit on show with its shoe (and
 * favourites it); today itself is worn straight away.
 *
 * Starts "by tag" on the weekday's tag from the weekly preferences.
 * `weather`: the day's (useDayWeather), `latitude` for its season.
 */
export const usePlanSuggestions = ({ date, weather, latitude }) => {
  const [chooseBy, setChooseBy] = useState("tag");
  // The tag, or the plan's name; null until picked.
  const [choice, setChoice] = useState(null);
  const dayTag = useRef(null);

  const [outfits, setOutfits] = useState([]);
  const [index, setIndex] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [planning, setPlanning] = useState(false);

  const tags = tagsFor(chooseBy, choice);
  const tagsKey = tags.join("|");

  useEffect(() => {
    let cancelled = false;

    fetchTagForDay(date).then((tag) => {
      if (cancelled) return;

      dayTag.current = tag;
      setChoice((prev) => prev ?? tag);
    });

    return () => {
      cancelled = true;
    };
  }, [date]);

  useEffect(() => {
    if (!weather || !tags.length) {
      setOutfits([]);
      return;
    }

    let cancelled = false;

    setLoading(true);
    setError(null);

    suggestOutfits({ date, ...dayWeatherParams(date, weather, latitude), tags })
      .then((found) => {
        if (cancelled) return;

        setOutfits(found);
        setIndex(0);
      })
      .catch((err) => {
        console.error("Failed to load recommendations:", err);
        if (!cancelled) setError("Couldn't load outfits for this day.");
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
    // The weather's numbers, not the object.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [date, weather?.min, weather?.max, weather?.code, tagsKey]);

  const footwear = usePlanFootwear({ outfits, weather, tags });

  /* -------------------- Choosing -------------------- */

  // Switching between plans and tags starts the tags on the day's own.
  const changeChooseBy = (next) => {
    if (next === chooseBy) return;

    setChooseBy(next);
    setChoice(next === "tag" ? dayTag.current : null);
  };

  /* -------------------- Browsing -------------------- */

  const current = outfits[index] ?? null;
  const shoe = footwear.shoeFor(current);
  const canMove = outfits.length > 1;

  const goNext = () => {
    if (canMove) setIndex((prev) => (prev + 1) % outfits.length);
  };

  const goPrev = () => {
    if (canMove) setIndex((prev) => (prev - 1 + outfits.length) % outfits.length);
  };

  /* -------------------- Plan this -------------------- */

  // Resolves true once the outfit on show is planned with its shoe.
  const planCurrent = async () => {
    if (!current || planning) return false;

    setPlanning(true);
    setError(null);

    try {
      const { plannedWorn } = await planDay({
        date,
        matchId: current.matchId._id,
        footwearId: shoe?._id ?? null,
      });

      if (plannedWorn) savePlannedWorn(plannedWorn);

      return true;
    } catch (err) {
      console.error("Failed to plan the outfit:", err);
      setError(`Couldn't plan this outfit: ${getErrorMessage(err, err.message)}`);
      return false;
    } finally {
      setPlanning(false);
    }
  };

  return {
    chooseBy,
    changeChooseBy,
    choice,
    choose: setChoice,
    tags,

    outfits,
    loading,
    error,
    current,
    shoe,
    canMove,
    goNext,
    goPrev,

    footwear,
    chooseShoe: (picked) => footwear.choose(current, picked),

    planCurrent,
    planning,
  };
};

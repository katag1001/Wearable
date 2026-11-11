import { useEffect, useMemo, useState } from "react";

import { fetchTodayFootwear } from "../api/footwear.js";
import {
  getOuterColours,
  getPairingSubtype,
  isOutfitPatterned,
  rankFootwear,
} from "../footwear/footwearRanking.js";

/*
 * The shoes for a planned day's outfits - Today's shoe box
 * (useTodayFootwear) without the wearing: every shoe ranked for each
 * outfit (core/footwear/footwearRanking.js) with the planned day's
 * weather and the day's tags, the outfit's own shoes first. Each outfit
 * shows its top shoe, or the one picked with Change shoes. Nothing is
 * saved here - the shoe on show goes with the plan.
 *
 * Same shape as useTodayFootwear where ShoeChooser reads it (shoesFor).
 * `outfits`: [{ matchId: <match>, withTights }]. `weather`: the day's
 * { min, max, code } (code null for an estimate). `tags`: the day's tags.
 */
const matchIdOf = (outfit) => outfit?.matchId?._id ?? null;

export const usePlanFootwear = ({ outfits, weather, tags }) => {
  const [data, setData] = useState(null);
  const [chosen, setChosen] = useState({});

  useEffect(() => {
    let cancelled = false;

    fetchTodayFootwear()
      .then((fresh) => {
        if (!cancelled) setData(fresh);
      })
      .catch((err) => {
        console.error("Failed to load footwear:", err);
        if (!cancelled) setData({ items: [] });
      });

    return () => {
      cancelled = true;
    };
  }, []);

  const tagsKey = (tags || []).join("|");

  // Each outfit's shoes, best first - ranked once per outfit for this day.
  const orders = useMemo(() => {
    if (!data) return {};

    return Object.fromEntries(
      (outfits || []).map((outfit) => [
        matchIdOf(outfit),
        rankFootwear(data.items, {
          gender: data.gender,
          bottomSubtype: getPairingSubtype(outfit.matchId.clothes),
          weather,
          todayTag: tags,
          withTights: Boolean(outfit.withTights),
          outfitColors: outfit.matchId.colors || [],
          outerColors: getOuterColours(outfit.matchId.clothes),
          outfitPatterned: isOutfitPatterned(outfit.matchId),
          colourLevel: data.colourLevel,
          rememberedIds: (outfit.matchId.footwear || []).map(String),
        }),
      ])
    );
    // Outfits change as a list, the weather and tags with the day.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [data, outfits, weather?.min, weather?.max, weather?.code, tagsKey]);

  const shoesFor = (outfit) => orders[matchIdOf(outfit)] || [];

  const shoeFor = (outfit) => {
    const shoes = shoesFor(outfit);

    return shoes.find((shoe) => shoe._id === chosen[matchIdOf(outfit)]) || shoes[0] || null;
  };

  const choose = (outfit, shoe) => {
    const matchId = matchIdOf(outfit);

    if (matchId && shoe) setChosen((prev) => ({ ...prev, [matchId]: shoe._id }));
  };

  return {
    loading: !data,
    hasFootwear: (data?.items || []).length > 0,
    shoesFor,
    shoeFor,
    choose,
  };
};

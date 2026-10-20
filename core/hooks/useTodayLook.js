import { useState } from "react";

import { useToday } from "./useToday.js";
import { useTodayFootwear } from "./useTodayFootwear.js";

/*
 * Today's outfits with their shoes: useToday (the outfits) plus
 * useTodayFootwear (each outfit's shoe). Shared by the web Today page and
 * the mobile Today tab.
 *
 * Each outfit shows a shoe as part of it - its best, or the one picked
 * with Change shoes. Nothing is saved until the whole look is worn:
 * "Mark as worn" (the heart on mobile) wears the outfit and its shoe
 * together. Changing the shoes of the outfit already worn today saves
 * straight away.
 *
 * Takes useToday's options; returns everything useToday does, plus the
 * shoes.
 */
export const useTodayLook = (options) => {
  const today = useToday(options);

  // The worn outfit can be one no longer in today's list.
  const outfits = today.wornOutfit
    ? [...today.outfits, today.wornOutfit]
    : today.outfits;

  const footwear = useTodayFootwear({
    outfits,
    wornMatchId: today.wornToday?.matchId ?? null,
    todayTag: today.todayTag,
  });

  // Shoe errors, shown like useToday's notices.
  const [shoeNotice, setShoeNotice] = useState(null);
  const [wearing, setWearing] = useState(false);

  const shoeError = () =>
    setShoeNotice({
      title: "Error",
      message: "Couldn't mark the shoes as worn - please try again.",
    });

  const selectedShoe = footwear.shoeFor(today.selectedOutfit);

  // The worn outfit shows the shoe worn with it, else its suggestion.
  const wornShoe =
    footwear.wornShoeFor(today.wornOutfit) || footwear.shoeFor(today.wornOutfit);

  /* -------------------- Wear the look -------------------- */

  // The shoe first: wearing it with the new outfit undoes the previous
  // shoe, so nothing is undone twice when the outfit changes. If the
  // outfit then fails, the shoe comes back off.
  const markAsWornToday = async () => {
    const outfit = today.selectedOutfit;

    if (!outfit || wearing) return false;

    setWearing(true);

    try {
      if (selectedShoe && !(await footwear.wearWith(outfit, selectedShoe))) {
        shoeError();
        return false;
      }

      const worn = await today.markAsWornToday();

      if (!worn && selectedShoe) {
        await footwear.takeOff();
      }

      return worn;
    } finally {
      setWearing(false);
    }
  };

  /* -------------------- Change shoes -------------------- */

  // For the outfit being browsed - just shown with it until it's worn.
  const chooseShoe = (shoe) => footwear.choose(today.selectedOutfit, shoe);

  // For the outfit worn today - saved straight away. Resolves true once
  // saved.
  const changeWornShoe = async (shoe) => {
    const outfit = today.wornOutfit;

    if (!(await footwear.wearWith(outfit, shoe))) {
      shoeError();
      return false;
    }

    footwear.choose(outfit, shoe);
    return true;
  };

  return {
    ...today,

    footwear,
    selectedShoe,
    wornShoe,

    markAsWornToday,
    wearing,

    chooseShoe,
    changeWornShoe,

    notice: shoeNotice ?? today.notice,
    clearNotice: () => {
      if (shoeNotice) setShoeNotice(null);
      else today.clearNotice();
    },
  };
};

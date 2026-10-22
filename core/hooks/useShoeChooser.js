import { useState } from "react";

/*
 * Change shoes: one outfit's shoes, one at a time, best first - opened on
 * the shoe it shows now. Next lowers the pairing of the shoe being left
 * (useTodayFootwear's rejectShoe), like the outfits. Mounted while the
 * chooser is open, so it starts afresh each time.
 *
 * `footwear`: useTodayFootwear's result. `outfit`: the outfit whose shoes
 * these are. `startShoe`: the shoe it shows now.
 */
export const useShoeChooser = ({ footwear, outfit, startShoe }) => {
  const shoes = footwear.shoesFor(outfit);

  const [index, setIndex] = useState(() =>
    Math.max(0, shoes.findIndex((shoe) => shoe._id === startShoe?._id))
  );

  const current = shoes[index] ?? shoes[0] ?? null;

  const goNext = () => {
    if (shoes.length <= 1) return;

    // Rejection paused while temperatures are being reviewed - uncomment to
    // restore the swipe penalty.
    // footwear.rejectShoe(outfit, current);
    setIndex((prev) => (prev + 1) % shoes.length);
  };

  const goPrev = () => {
    if (shoes.length <= 1) return;

    setIndex((prev) => (prev - 1 + shoes.length) % shoes.length);
  };

  return {
    shoes,
    current,
    index: shoes[index] ? index : 0,
    goNext,
    goPrev,
  };
};

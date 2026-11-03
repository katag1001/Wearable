// Splits the outfit list into two Pinterest-style columns: each outfit, in
// list order (best score first), goes into whichever column is shorter so
// far (the left one on a tie). Heights come from outfitCardHeight, so the
// columns are balanced before any photo loads, and a newly loaded page
// carries on filling the shorter column.

import { outfitCardHeight } from "./OutfitCard";

export const COLUMN_COUNT = 2;

export const splitIntoColumns = (matches, columnWidth, gap) => {
  const columns = Array.from({ length: COLUMN_COUNT }, () => []);
  const heights = Array(COLUMN_COUNT).fill(0);

  matches.forEach((match) => {
    const shortest = heights.indexOf(Math.min(...heights));

    columns[shortest].push(match);
    heights[shortest] += outfitCardHeight(match, columnWidth) + gap;
  });

  return columns;
};

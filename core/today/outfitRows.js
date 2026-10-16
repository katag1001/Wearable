// core/today/outfitRows.js
//
// An outfit's clothes split into rows by where they're worn, so it shows
// the way it's worn: tops then outerwear on the upper row, one-pieces then
// bottoms on the lower one. Clothes with an unknown type go last on the
// lower row. Empty rows are dropped.

const UPPER = ["top", "outer"];
const LOWER = ["onepiece", "bottom"];

// Position within its row; unknown types sort after the known ones.
const rank = (order) => (item) => {
  const index = order.indexOf(item.type);
  return index === -1 ? order.length : index;
};

const sortBy = (items, order) => {
  const rankOf = rank(order);
  return [...items].sort((a, b) => rankOf(a) - rankOf(b));
};

export const outfitRows = (clothes) => {
  const upper = clothes.filter((item) => UPPER.includes(item.type));
  const lower = clothes.filter((item) => !UPPER.includes(item.type));

  return [sortBy(upper, UPPER), sortBy(lower, LOWER)].filter(
    (row) => row.length > 0
  );
};

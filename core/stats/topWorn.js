// core/stats/topWorn.js
//
// The most-worn outfits and clothes for the stats screen.

export const STATS_MODES = [
  { key: "allTime", label: "All Time" },
  { key: "thisYear", label: "This Year" },
];

// The count each mode ranks by.
export const getWornCountField = (mode) =>
  mode === "thisYear" ? "timesWornThisYear" : "timesWorn";

// The `limit` items worn most often (by `countField`), never-worn left out.
export const getTopByCount = (items, countField, limit) =>
  [...items]
    .filter((item) => (item?.[countField] || 0) > 0)
    .sort((a, b) => (b?.[countField] || 0) - (a?.[countField] || 0))
    .slice(0, limit);

export const formatWornCount = (count) =>
  `Worn ${count} ${count === 1 ? "time" : "times"}`;

// api/constants/outfitShapes.js
//
// The only valid outfit structures, as role counts. Tops and outers may
// appear once or twice; bottoms and onepieces at most once. Any outfit that
// doesn't match one of these shapes is not a valid combination.

const OUTFIT_SHAPES = [
  { top: 0, bottom: 0, onepiece: 1, outer: 0 },
  { top: 0, bottom: 0, onepiece: 1, outer: 1 },
  { top: 0, bottom: 0, onepiece: 1, outer: 2 },
  { top: 1, bottom: 1, onepiece: 0, outer: 0 },
  { top: 1, bottom: 1, onepiece: 0, outer: 1 },
  { top: 2, bottom: 1, onepiece: 0, outer: 0 },
  { top: 2, bottom: 1, onepiece: 0, outer: 1 },
  { top: 1, bottom: 1, onepiece: 0, outer: 2 },
  { top: 2, bottom: 1, onepiece: 0, outer: 2 },
  { top: 1, bottom: 0, onepiece: 1, outer: 0 },
  { top: 1, bottom: 0, onepiece: 1, outer: 1 },
];

const ROLES = ["top", "bottom", "onepiece", "outer"];

// Roles that can ever appear twice in a shape - only these can meaningfully
// be asked "does this item need a layering partner", since only they ever
// have a same-role partner available. Derived from the shapes themselves
// (rather than hardcoded) so it can never drift out of sync with them.
const LAYERABLE_ROLES = new Set(
  ROLES.filter((role) => OUTFIT_SHAPES.some((shape) => shape[role] > 1))
);

module.exports = { OUTFIT_SHAPES, ROLES, LAYERABLE_ROLES };

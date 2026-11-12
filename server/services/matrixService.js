// server/services/matrixService.js
//
// Pure compatibility logic for outfit matching: can these items be in the
// same automatic outfit at all? Takes a baseline matrix
// (constants/matchScoreBaseline.js) and the layering rules
// (constants/requiresLayering.js) as plain data - no DB access here, so
// this is cheap to call repeatedly during a search.
//
// Compatibility is fixed. It reads only the baseline matrix and the
// hardcoded rules - never a user's personal adjustments - so user behaviour
// can never make a pair match or stop matching. Scores (how good a match
// is) live separately in outfitScoreService.js.

const { LAYERABLE_ROLES } = require("../constants/outfitShapes.js");
const { NEVER, getRolePairRule } = require("../constants/compatibilityRules.js");

function canonicalPairKey(subtypeA, subtypeB) {
  return subtypeA <= subtypeB ? [subtypeA, subtypeB] : [subtypeB, subtypeA];
}

function pairKey(subtypeA, subtypeB) {
  const [a, b] = canonicalPairKey(subtypeA, subtypeB);
  return `${a} ${b}`;
}

// Two items are compatible when, in order:
//  1. they aren't the same subtype;
//  2. their roles aren't a "never" pair (constants/compatibilityRules.js);
//  3. the matrix has a score (not null) for the pair.
// The matrix already holds a score for every "always" role pair (checked
// when it loads), so step 3 covers both "always" and "decided" pairs. A
// subtype missing from the matrix (e.g. added under another gender) is
// never compatible.
function isCompatible(baselineMatrix, itemA, itemB) {
  if (itemA.subtype === itemB.subtype) {
    return false;
  }

  if (getRolePairRule(itemA.type, itemB.type) === NEVER) {
    return false;
  }

  const value = baselineMatrix?.[itemA.subtype]?.[itemB.subtype];

  return typeof value === "number";
}

// Standalone-eligibility is a hard, static rule (constants/
// requiresLayering.js), not part of the matrix.
function canStandAlone(requiresLayeringSet, subtype) {
  return !requiresLayeringSet || !requiresLayeringSet.has(subtype);
}

// Whether `item` may fill a slot in `shape` given the single-item rules:
//  - a top/outer that requires layering needs 2 slots of its role;
//  - a onepiece that requires a top needs a shape with a top;
//  - an item that requires an outer needs a shape with an outer.
// Used to rule out a whole shape, or a candidate, before searching it.
function fitsShape(item, shape, layeringRules = {}) {
  const { requiresLayeringSet, requiresTopSet, requiresOuterSet } = layeringRules;

  if (
    LAYERABLE_ROLES.has(item.type) &&
    shape[item.type] === 1 &&
    !canStandAlone(requiresLayeringSet, item.subtype)
  ) {
    return false;
  }

  if (item.type === "onepiece" && shape.top === 0 && requiresTopSet?.has(item.subtype)) {
    return false;
  }

  if (!shape.outer && requiresOuterSet?.has(item.subtype)) {
    return false;
  }

  return true;
}

// The same single-item rules, checked against a finished item-set instead
// of a shape. Bottoms are never subject to the layering rule - no shape
// gives them a second same-role item to layer with.
function satisfiesLayeringRules(items, layeringRules = {}) {
  const { requiresLayeringSet, requiresTopSet, requiresOuterSet } = layeringRules;
  const roleCounts = {};

  items.forEach((item) => {
    roleCounts[item.type] = (roleCounts[item.type] || 0) + 1;
  });

  return items.every((item) => {
    if (
      LAYERABLE_ROLES.has(item.type) &&
      roleCounts[item.type] === 1 &&
      !canStandAlone(requiresLayeringSet, item.subtype)
    ) {
      return false;
    }

    if (item.type === "onepiece" && !roleCounts.top && requiresTopSet?.has(item.subtype)) {
      return false;
    }

    if (!roleCounts.outer && requiresOuterSet?.has(item.subtype)) {
      return false;
    }

    return true;
  });
}

// Full pairwise check across every item in a finished outfit, plus the
// single-item layering rules.
function isCliqueValid(items, baselineMatrix, layeringRules = {}) {
  for (let i = 0; i < items.length; i += 1) {
    for (let j = i + 1; j < items.length; j += 1) {
      if (!isCompatible(baselineMatrix, items[i], items[j])) {
        return false;
      }
    }
  }

  return satisfiesLayeringRules(items, layeringRules);
}

module.exports = {
  canonicalPairKey,
  pairKey,
  isCompatible,
  canStandAlone,
  fitsShape,
  satisfiesLayeringRules,
  isCliqueValid,
};

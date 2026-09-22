// api/services/matchService.js
//
// Finds every valid outfit that a newly added/updated clothing item can be
// part of, given the rest of the user's wardrobe, and saves the new ones.
//
// This always builds each candidate outfit fresh from the current wardrobe
// (anchored on the new item) rather than incrementally extending
// previously-saved matches. That sidesteps the old "can this saved match
// still take another outer" problem entirely - there is nothing to extend,
// every candidate is assembled and validated as a complete whole before
// anything is saved.
//
// Every check used for pruning here (matrix pairwise/self-check, colour,
// pattern, season) is monotonic: once violated by a partial item-set, it
// can never be satisfied again by adding more items. That's what makes it
// safe to check all of them as early as possible, incrementally, during
// the search itself - not just after a full candidate is assembled:
//   1. Shape-level early exit: if the new item alone would occupy a
//      single-slot role that requires layering, the whole shape is
//      rejected before any pool/search work starts.
//   2. Per-candidate layering check: a pool candidate for a single-slot
//      role that requires layering is skipped the moment it's considered,
//      never entered into the recursion.
//   3. Incremental matrix + colour + pattern + season checks: every time a
//      candidate is added, the growing partial item-set is re-checked
//      against all four; a dead branch is abandoned immediately rather
//      than fully built out and rejected at the end.
// Only temperature isn't pruned incrementally (the layering formula's
// "outer replaces the floor" exception makes that non-trivial) - it's
// still checked once per fully-assembled candidate, in describeOutfit.
// validateOutfit is still called on each survivor as a cheap final safety
// net, even though by construction it should now always pass.
//
// `budget` (MAX_COMBINATIONS_EXPLORED) is shared across every shape in one
// run. Before this reordering, the most expensive shapes (2 top + 2 outer)
// could exhaust it before cheaper, equally valid shapes (e.g. involving a
// onepiece) were ever attempted - silently missing real matches, not just
// running slower. Pruning this aggressively means far less budget is spent
// on dead branches, which fixes that starvation as a side effect.
//
// Only item-sets that reach the DB-facing dedupe/insert step ever touch
// Mongo again.

const { Clothes, Match } = require("../models/AllModels.js");
const { OUTFIT_SHAPES, ROLES } = require("../constants/outfitShapes.js");
const { getRequiresLayeringSet } = require("../constants/requiresLayering.js");
const { getColorRules } = require("../utils/colorPalettes.js");
const { canPair } = require("./matrixService.js");
const { passesPatternCheck, passesColorCheck } = require("./styleColorService.js");
const { describeOutfit, validateOutfit, hasSharedSeason } = require("./outfitEvaluator.js");
const {
  getUserMatchingPreferences,
  getBaselineMatrix,
  loadUserScores,
} = require("./matchScoreService.js");

// Hard caps to keep this bounded regardless of wardrobe size - important on
// a serverless free tier with a short execution limit. Today, every
// baseline score is a placeholder 5 (see matchScoreBaseline.js), so the
// matrix provides no real pruning yet; these caps are the actual guardrail
// until real per-user/per-archetype scores start doing that job.
const MAX_POOL_SIZE_PER_ROLE = 60;
const MAX_COMBINATIONS_EXPLORED = 20000;

function buildRolePools(allItems, newItem) {
  const pools = { top: [], bottom: [], onepiece: [], outer: [] };
  const newItemId = String(newItem._id);

  allItems.forEach((item) => {
    if (String(item._id) === newItemId) return;

    const pool = pools[item.type];

    if (pool && pool.length < MAX_POOL_SIZE_PER_ROLE) {
      pool.push(item);
    }
  });

  return pools;
}

// A partial (or complete) item-set is still "alive" only if it could still
// end up passing colour + pattern + season. All three are monotonic (see
// file header), so checking them on a growing partial set is equivalent to
// checking them once at the end - just cheaper, since a dead branch stops
// growing immediately instead of being built out in full first.
function isStillViable(items, colorRules) {
  return passesColorCheck(items, colorRules) && passesPatternCheck(items) && hasSharedSeason(items);
}

// Backtracking search across the 4 roles for one shape. Prunes the moment a
// candidate is incompatible with anything chosen so far (including
// newItem) on matrix compatibility, layering, colour, pattern, or season -
// see the file header for why this is safe. `budget` is shared across
// every shape in one processMatches run and caps total work done,
// independent of wardrobe size.
function findShapeCombinations(
  newItem,
  shape,
  pools,
  baselineMatrix,
  personalScores,
  budget,
  requiresLayeringSet = new Set(),
  colorRules = getColorRules(null)
) {
  const needed = {};

  for (const role of ROLES) {
    needed[role] = shape[role] - (newItem.type === role ? 1 : 0);

    if (needed[role] < 0) {
      return [];
    }
  }

  // Shape-level early exit: newItem alone occupies a single-slot role it
  // can never stand alone in - no point building pools/searching at all.
  if (shape[newItem.type] === 1 && requiresLayeringSet.has(newItem.subtype)) {
    return [];
  }

  // Some shapes are fully satisfied by newItem alone (0 additional picks
  // needed for every role), so the pick() loop below never runs and never
  // gets a chance to check colour/pattern/season. Check the baseline once,
  // up front - every subsequent incremental check below only ever grows
  // this same set, so this single check covers it for good.
  if (!isStillViable([newItem], colorRules)) {
    return [];
  }

  const results = [];

  function pickRole(roleIndex, chosenSoFar) {
    if (roleIndex === ROLES.length) {
      // No re-check needed here: matrix/layering/colour/pattern/season were
      // already verified incrementally as each item was picked below.
      results.push([newItem, ...chosenSoFar]);
      return;
    }

    const role = ROLES[roleIndex];
    const count = needed[role];

    if (count === 0) {
      pickRole(roleIndex + 1, chosenSoFar);
      return;
    }

    const pool = pools[role];
    const roleTargetCount = shape[role];

    function pick(startIndex, remaining, picked) {
      if (remaining === 0) {
        pickRole(roleIndex + 1, [...chosenSoFar, ...picked]);
        return;
      }

      for (let i = startIndex; i < pool.length; i += 1) {
        if (budget.remaining <= 0) {
          return;
        }

        budget.remaining -= 1;

        const candidate = pool[i];

        // Per-candidate layering check: this role has only 1 slot in this
        // shape, so a candidate that can't stand alone is dead on arrival.
        if (roleTargetCount === 1 && requiresLayeringSet.has(candidate.subtype)) {
          continue;
        }

        const soFar = [newItem, ...chosenSoFar, ...picked];

        const compatibleWithEverythingSoFar = soFar.every((item) =>
          canPair(baselineMatrix, personalScores, item.subtype, candidate.subtype)
        );

        if (!compatibleWithEverythingSoFar) {
          continue;
        }

        if (!isStillViable([...soFar, candidate], colorRules)) {
          continue;
        }

        pick(i + 1, remaining - 1, [...picked, candidate]);
      }
    }

    pick(0, count, []);
  }

  pickRole(0, []);

  return results;
}

function findCandidateMatches(
  newItem,
  allItems,
  baselineMatrix,
  personalScores,
  requiresLayeringSet = new Set(),
  colorRules = getColorRules(null)
) {
  const pools = buildRolePools(allItems, newItem);
  const budget = { remaining: MAX_COMBINATIONS_EXPLORED };
  const candidates = [];

  OUTFIT_SHAPES.forEach((shape) => {
    if (!shape[newItem.type]) {
      return;
    }

    const combos = findShapeCombinations(
      newItem,
      shape,
      pools,
      baselineMatrix,
      personalScores,
      budget,
      requiresLayeringSet,
      colorRules
    );

    combos.forEach((itemSet) => {
      const described = describeOutfit(itemSet, { isUserMade: false });

      if (!described) {
        return;
      }

      if (!validateOutfit(itemSet, baselineMatrix, personalScores, requiresLayeringSet, colorRules)) {
        return;
      }

      candidates.push({
        ...described,
        userId: newItem.userId,
        userMade: false,
        favourite: false,
        lastWornDate: null,
      });
    });
  });

  return candidates;
}

function dedupeKey(clothesIds) {
  return clothesIds.map((id) => id.toString()).sort().join(",");
}

async function processMatches(newItem, allItems) {
  if (!ROLES.includes(newItem.type)) {
    return;
  }

  const wardrobe = allItems || (await Clothes.find({ userId: newItem.userId }));

  const [{ gender, style, colour }, personalScores] = await Promise.all([
    getUserMatchingPreferences(newItem.userId),
    loadUserScores(newItem.userId),
  ]);

  const baselineMatrix = getBaselineMatrix(gender, style);
  const requiresLayeringSet = getRequiresLayeringSet(gender);
  const colorRules = getColorRules(colour);

  const candidates = findCandidateMatches(
    newItem,
    wardrobe,
    baselineMatrix,
    personalScores,
    requiresLayeringSet,
    colorRules
  );

  if (!candidates.length) {
    return;
  }

  const existingMatches = await Match.find({ userId: newItem.userId }).select("clothes");
  const existingKeys = new Set(existingMatches.map((match) => dedupeKey(match.clothes)));
  const seenKeys = new Set();

  const newMatches = candidates.filter((match) => {
    const key = dedupeKey(match.clothes);

    if (existingKeys.has(key) || seenKeys.has(key)) {
      return false;
    }

    seenKeys.add(key);
    return true;
  });

  if (!newMatches.length) {
    return;
  }

  await Match.insertMany(newMatches);
}

module.exports = {
  processMatches,
  findCandidateMatches,
  buildRolePools,
  findShapeCombinations,
  isStillViable,
};

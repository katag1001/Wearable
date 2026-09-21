// api/services/matchService.js
//
// Finds every valid outfit that a newly added/updated clothing item can be
// part of, given the rest of the user's wardrobe, and saves the new ones.
//
// Unlike the previous design, this always builds each candidate outfit
// fresh from the current wardrobe (anchored on the new item) rather than
// incrementally extending previously-saved matches. That sidesteps the
// old "can this saved match still take another outer" problem entirely -
// there is nothing to extend, every candidate is assembled and validated
// as a complete whole before anything is saved.
//
// Search order, cheapest/most-eliminating first:
//   1. matrix compatibility (matrixService) - pure, in-memory, no DB.
//   2. temperature + season (outfitEvaluator.describeOutfit) - pure, cheap.
//   3. colour + pattern (outfitEvaluator.validateOutfit) - pure, cheap.
// Only item-sets that reach the DB-facing dedupe/insert step ever touch
// Mongo again.

const { Clothes, Match } = require("../models/AllModels.js");
const { OUTFIT_SHAPES, ROLES } = require("../constants/outfitShapes.js");
const { getRequiresLayeringSet } = require("../constants/requiresLayering.js");
const { isCliqueValid, canPair } = require("./matrixService.js");
const { describeOutfit, validateOutfit } = require("./outfitEvaluator.js");
const {
  getUserGenderStyle,
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

// Backtracking search across the 4 roles for one shape. Prunes the moment a
// candidate is incompatible with anything chosen so far (including
// newItem), so incompatible branches never get built out further. `budget`
// is shared across every shape in one processMatches run and caps total
// work done, independent of wardrobe size.
function findShapeCombinations(
  newItem,
  shape,
  pools,
  baselineMatrix,
  personalScores,
  budget,
  requiresLayeringSet
) {
  const needed = {};

  for (const role of ROLES) {
    needed[role] = shape[role] - (newItem.type === role ? 1 : 0);

    if (needed[role] < 0) {
      return [];
    }
  }

  const results = [];

  function pickRole(roleIndex, chosenSoFar) {
    if (roleIndex === ROLES.length) {
      const fullSet = [newItem, ...chosenSoFar];

      if (isCliqueValid(fullSet, baselineMatrix, personalScores, requiresLayeringSet)) {
        results.push(fullSet);
      }

      return;
    }

    const role = ROLES[roleIndex];
    const count = needed[role];

    if (count === 0) {
      pickRole(roleIndex + 1, chosenSoFar);
      return;
    }

    const pool = pools[role];

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
        const soFar = [newItem, ...chosenSoFar, ...picked];

        const compatibleWithEverythingSoFar = soFar.every((item) =>
          canPair(baselineMatrix, personalScores, item.subtype, candidate.subtype)
        );

        if (!compatibleWithEverythingSoFar) {
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
  requiresLayeringSet
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
      requiresLayeringSet
    );

    combos.forEach((itemSet) => {
      const described = describeOutfit(itemSet, { isUserMade: false });

      if (!described) {
        return;
      }

      if (!validateOutfit(itemSet, baselineMatrix, personalScores, requiresLayeringSet)) {
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

  const [{ gender, style }, personalScores] = await Promise.all([
    getUserGenderStyle(newItem.userId),
    loadUserScores(newItem.userId),
  ]);

  const baselineMatrix = getBaselineMatrix(gender, style);
  const requiresLayeringSet = getRequiresLayeringSet(gender);

  const candidates = findCandidateMatches(
    newItem,
    wardrobe,
    baselineMatrix,
    personalScores,
    requiresLayeringSet
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
};

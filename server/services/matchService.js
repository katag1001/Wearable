// server/services/matchService.js
//
// Finds the best new outfits a newly added/updated clothing item can be
// part of, given the rest of the user's wardrobe, and saves them.
//
// This always builds each candidate outfit fresh from the current wardrobe
// (anchored on the new item) rather than incrementally extending
// previously-saved matches - every candidate is assembled and validated as
// a complete whole before anything is saved.
//
// Every check used for pruning here (fixed compatibility, colour, pattern,
// season) is monotonic: once violated by a partial item-set, it can never
// be satisfied again by adding more items. That's what makes it safe to
// check all of them as early as possible, incrementally, during the search
// itself - not just after a full candidate is assembled:
//   1. Shape-level early exit: if the new item can't fill its slot in a
//      shape (it requires layering but the shape has one slot for its role,
//      or it requires a top but the shape has none), the whole shape is
//      skipped before any search work starts.
//   2. Per-candidate shape check: a pool candidate that can't fill its slot
//      for the same reasons is skipped the moment it's considered.
//   3. Incremental compatibility + colour + pattern + season checks: every
//      time a candidate is added, the growing partial item-set is
//      re-checked; a dead branch is abandoned immediately.
// Only temperature isn't pruned incrementally (the layering formula's
// "outer replaces the floor" exception makes that non-trivial) - it's
// still checked once per fully-assembled candidate, in describeOutfit.
// validateOutfit is still called on each survivor as a cheap final safety
// net, even though by construction it should always pass.
//
// Choosing what to save: every item-set the search finds is scored
// (outfitScoreService.computeOutfitScore), and only the best
// MAX_NEW_MATCHES_PER_ITEM that aren't already saved are kept.
//
// Search limits: the search stops after MAX_COMBINATIONS_EXPLORED candidate
// considerations or SEARCH_TIME_LIMIT_MS, whichever comes first, shared
// across every shape in one run. Matching runs after the response on a
// serverless free tier with a short execution limit, so it must stay
// bounded regardless of wardrobe size. When a limit is hit, the best
// outfits found so far are still kept.

const { Clothes, Match } = require("../models/AllModels.js");
const { OUTFIT_SHAPES, ROLES } = require("../constants/outfitShapes.js");
const { getLayeringRules } = require("../constants/requiresLayering.js");
const { getColorRules } = require("../utils/colorPalettes.js");
const { isCompatible, fitsShape } = require("./matrixService.js");
const { computeOutfitScore } = require("./outfitScoreService.js");
const { passesPatternCheck, passesColorCheck } = require("./styleColorService.js");
const { describeOutfit, validateOutfit, hasSharedSeason } = require("./outfitEvaluator.js");
const {
  getUserMatchingPreferences,
  getBaselineMatrix,
  loadUserAdjustments,
} = require("./matchScoreService.js");

const MAX_POOL_SIZE_PER_ROLE = 60;
const MAX_COMBINATIONS_EXPLORED = 200000;
const SEARCH_TIME_LIMIT_MS = 3000;
const MAX_NEW_MATCHES_PER_ITEM = 100;

function createBudget({
  maxCombinations = MAX_COMBINATIONS_EXPLORED,
  timeLimitMs = SEARCH_TIME_LIMIT_MS,
} = {}) {
  return { remaining: maxCombinations, deadline: Date.now() + timeLimitMs };
}

function isBudgetSpent(budget) {
  return budget.remaining <= 0 || Date.now() > budget.deadline;
}

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

// Everything matching needs for one user, resolved once per run.
function buildMatchingContext({
  gender,
  colour = null,
  temperature = null,
  adjustments = new Map(),
}) {
  return {
    baselineMatrix: getBaselineMatrix(gender),
    adjustments,
    layeringRules: getLayeringRules(gender),
    colorRules: getColorRules(colour),
    temperaturePreference: temperature,
  };
}

// A partial (or complete) item-set is still "alive" only if it could still
// end up passing colour + pattern + season. All three are monotonic (see
// file header), so checking them on a growing partial set is equivalent to
// checking them once at the end - just cheaper, since a dead branch stops
// growing immediately instead of being built out in full first.
function isStillViable(items, colorRules) {
  const colorOk = passesColorCheck(items, colorRules);
  const patternOk = passesPatternCheck(items);
  const seasonOk = hasSharedSeason(items);

  return colorOk && patternOk && seasonOk;
}

// Backtracking search across the 4 roles for one shape. Prunes the moment a
// candidate is incompatible with anything chosen so far (including
// newItem), can't fill its slot in the shape, or breaks colour, pattern or
// season - see the file header for why this is safe. `budget` is shared
// across every shape in one processMatches run.
function findShapeCombinations(newItem, shape, pools, context, budget) {
  const { baselineMatrix, layeringRules, colorRules } = context;
  const needed = {};

  for (const role of ROLES) {
    needed[role] = shape[role] - (newItem.type === role ? 1 : 0);

    if (needed[role] < 0) {
      return [];
    }
  }

  // Shape-level early exit: newItem alone can't fill its slot here - no
  // point searching at all.
  if (!fitsShape(newItem, shape, layeringRules)) {
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
      // No re-check needed here: everything was already verified
      // incrementally as each item was picked below.
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

    function pick(startIndex, remaining, picked) {
      if (remaining === 0) {
        pickRole(roleIndex + 1, [...chosenSoFar, ...picked]);
        return;
      }

      for (let i = startIndex; i < pool.length; i += 1) {
        if (isBudgetSpent(budget)) {
          return;
        }

        budget.remaining -= 1;

        const candidate = pool[i];
        const soFar = [newItem, ...chosenSoFar, ...picked];

        if (!fitsShape(candidate, shape, layeringRules)) {
          continue;
        }

        const incompatibleWith = soFar.find(
          (item) => !isCompatible(baselineMatrix, item, candidate)
        );

        if (incompatibleWith) {
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

function dedupeKey(clothesIds) {
  return clothesIds.map((id) => id.toString()).sort().join(",");
}

// Searches every shape with a slot for newItem's role, scores every
// item-set found, and returns up to `limit` saveable match descriptions,
// best score first. Item-sets already saved (`existingKeys`) are skipped,
// as are any that fail the temperature check in describeOutfit - the next
// best one takes their place.
function findCandidateMatches(
  newItem,
  allItems,
  context,
  {
    existingKeys = new Set(),
    limit = MAX_NEW_MATCHES_PER_ITEM,
    budget = createBudget(),
  } = {}
) {
  const pools = buildRolePools(allItems, newItem);
  const scoredItemSets = [];

  OUTFIT_SHAPES.forEach((shape) => {
    if (!shape[newItem.type]) {
      return;
    }

    findShapeCombinations(newItem, shape, pools, context, budget).forEach((itemSet) => {
      scoredItemSets.push({
        itemSet,
        score: computeOutfitScore(itemSet, context.baselineMatrix, context.adjustments),
      });
    });
  });

  // Stable sort, so equal scores keep the order they were found in.
  scoredItemSets.sort((a, b) => b.score - a.score);

  const candidates = [];
  const seenKeys = new Set(existingKeys);

  for (const { itemSet, score } of scoredItemSets) {
    if (candidates.length >= limit) {
      break;
    }

    const key = dedupeKey(itemSet.map((item) => item._id));

    if (seenKeys.has(key)) {
      continue;
    }

    seenKeys.add(key);

    const described = describeOutfit(itemSet, {
      isUserMade: false,
      temperaturePreference: context.temperaturePreference,
    });

    if (!described) {
      continue;
    }

    if (!validateOutfit(itemSet, context)) {
      continue;
    }

    candidates.push({
      ...described,
      score,
      userId: newItem.userId,
      userMade: false,
      favourite: false,
      lastWornDate: null,
    });
  }

  return candidates;
}

async function processMatches(newItem, allItems) {
  if (!ROLES.includes(newItem.type)) {
    return;
  }

  const wardrobe = allItems || (await Clothes.find({ userId: newItem.userId }));

  const [{ gender, colour, temperature }, adjustments, existingMatches] = await Promise.all([
    getUserMatchingPreferences(newItem.userId),
    loadUserAdjustments(newItem.userId),
    Match.find({ userId: newItem.userId }).select("clothes"),
  ]);

  const context = buildMatchingContext({ gender, colour, temperature, adjustments });
  const existingKeys = new Set(existingMatches.map((match) => dedupeKey(match.clothes)));

  const newMatches = findCandidateMatches(newItem, wardrobe, context, { existingKeys });

  if (!newMatches.length) {
    return;
  }

  await Match.insertMany(newMatches);
}

module.exports = {
  MAX_COMBINATIONS_EXPLORED,
  SEARCH_TIME_LIMIT_MS,
  MAX_NEW_MATCHES_PER_ITEM,
  processMatches,
  findCandidateMatches,
  buildMatchingContext,
  buildRolePools,
  createBudget,
  findShapeCombinations,
  isStillViable,
  dedupeKey,
};

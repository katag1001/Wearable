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
// season, tags) is monotonic: once violated by a partial item-set, it can never
// be satisfied again by adding more items. That's what makes it safe to
// check all of them as early as possible, incrementally, during the search
// itself - not just after a full candidate is assembled:
//   1. Shape-level early exit: if the new item can't fill its slot in a
//      shape (it requires layering but the shape has one slot for its role,
//      or it requires a top but the shape has none), the whole shape is
//      skipped before any search work starts.
//   2. Per-candidate shape check: a pool candidate that can't fill its slot
//      for the same reasons is skipped the moment it's considered.
//   3. Incremental compatibility + colour + pattern + season + tag checks: every
//      time a candidate is added, the growing partial item-set is
//      re-checked; a dead branch is abandoned immediately.
// Temperature never rejects a candidate - every outfit's range is worked
// out from its subtypes (presetTemperatureService.js) once it's chosen.
// validateOutfit is still called on each survivor as a cheap final safety
// net, even though by construction it should always pass.
//
// Choosing what to save: every item-set the search finds is scored
// (outfitScoreService.computeOutfitScore). Those scoring below
// MIN_AUTO_MATCH_SCORE (constants/scoring.js) are dropped, and only the
// best MAX_NEW_MATCHES_PER_ITEM that aren't already saved are kept.
//
// Search limits: the search stops after MAX_COMBINATIONS_EXPLORED candidate
// considerations or SEARCH_TIME_LIMIT_MS, whichever comes first, shared
// across every shape in one run. When a limit is hit, the best outfits
// found so far are still kept.
//
// The limits are sized so matching is complete (every valid outfit found
// and saved) for a wardrobe of ~330 items - 4x an 83-item test wardrobe,
// whose worst single item needed ~1.7M considerations, ~5s of search and
// ~90,000 outfits. Matching runs after the response, kept alive with
// waitUntil (allControllers.js), inside Vercel Hobby's 300s function
// limit; SEARCH_TIME_LIMIT_MS leaves most of that for scoring and saving.
//
// Vercel deadline: the search also stops SAVE_RESERVE_MS before the
// invocation's actual deadline (utils/functionDeadline.js), however much
// of the function's time the request itself used. Matches are then saved
// best first in chunks of INSERT_CHUNK_SIZE, stopping INSERT_STOP_MARGIN_MS
// before the deadline - so a run that's short of time still keeps its best
// outfits instead of being cut off mid-write.
//
// Duplicates: each match's clothesKey is unique per user (models/
// AllModels.js), so if two runs overlap and both try to save the same
// outfit, the database rejects the second copy and it's skipped here.

const { Clothes, Match } = require("../models/AllModels.js");
const { OUTFIT_SHAPES, ROLES } = require("../constants/outfitShapes.js");
const { getLayeringRules } = require("../constants/requiresLayering.js");
const { getColorRules } = require("../utils/colorPalettes.js");
const { isCompatible, fitsShape } = require("./matrixService.js");
const { computeOutfitScore } = require("./outfitScoreService.js");
const { passesPatternCheck, passesColorCheck } = require("./styleColorService.js");
const { describeOutfit, validateOutfit, hasSharedSeason } = require("./outfitEvaluator.js");
const { hasSharedTag } = require("./helpers.js");
const { clothesKey } = require("../utils/clothesKey.js");
const { msUntilDeadline } = require("../utils/functionDeadline.js");
const { MIN_AUTO_MATCH_SCORE } = require("../constants/scoring.js");
const {
  getUserMatchingPreferences,
  getBaselineMatrix,
  loadUserAdjustments,
} = require("./matchScoreService.js");

const MAX_POOL_SIZE_PER_ROLE = 250;
const MAX_COMBINATIONS_EXPLORED = 2000000;
const SEARCH_TIME_LIMIT_MS = 60000;
const MAX_NEW_MATCHES_PER_ITEM = 100000;
const SAVE_RESERVE_MS = 60000;
const INSERT_CHUNK_SIZE = 5000;
const INSERT_STOP_MARGIN_MS = 15000;
const DUPLICATE_KEY_ERROR = 11000;

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
// end up passing colour + pattern + season + tags. All four are monotonic (see
// file header), so checking them on a growing partial set is equivalent to
// checking them once at the end - just cheaper, since a dead branch stops
// growing immediately instead of being built out in full first.
function isStillViable(items, colorRules) {
  const colorOk = passesColorCheck(items, colorRules);
  const patternOk = passesPatternCheck(items);
  const seasonOk = hasSharedSeason(items);
  const tagOk = hasSharedTag(items);

  return colorOk && patternOk && seasonOk && tagOk;
}

// Backtracking search across the 4 roles for one shape. Prunes the moment a
// candidate is incompatible with anything chosen so far (including
// newItem), can't fill its slot in the shape, or breaks colour, pattern,
// season or tags - see the file header for why this is safe. `budget` is shared
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

const dedupeKey = clothesKey;

// Searches every shape with a slot for newItem's role, scores every
// item-set found, and returns up to `limit` saveable match descriptions
// scoring at least `minScore`, best score first. Item-sets already saved
// (`existingKeys`) are skipped, as is any describeOutfit rejects - the
// next best one takes their place.
function findCandidateMatches(
  newItem,
  allItems,
  context,
  {
    existingKeys = new Set(),
    limit = MAX_NEW_MATCHES_PER_ITEM,
    minScore = MIN_AUTO_MATCH_SCORE,
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
    // Sorted best first, so nothing after this scores high enough either.
    if (candidates.length >= limit || score < minScore) {
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
    Match.find({ userId: newItem.userId }).select("clothesKey"),
  ]);

  const context = buildMatchingContext({ gender, colour, temperature, adjustments });
  const existingKeys = new Set(existingMatches.map((match) => match.clothesKey));

  const budget = createBudget({
    timeLimitMs: Math.min(SEARCH_TIME_LIMIT_MS, msUntilDeadline() - SAVE_RESERVE_MS),
  });

  const newMatches = findCandidateMatches(newItem, wardrobe, context, { existingKeys, budget });

  await saveMatchesBestFirst(newMatches);
}

// Saves in chunks, best first, until done or the Vercel deadline is close.
// A chunk keeps going past an outfit another run already saved (unordered
// insert) and that duplicate is ignored; any other error is thrown.
async function saveMatchesBestFirst(matches) {
  for (let start = 0; start < matches.length; start += INSERT_CHUNK_SIZE) {
    if (msUntilDeadline() < INSERT_STOP_MARGIN_MS) {
      console.warn(
        `Match saving stopped near the function deadline: ${start} of ${matches.length} saved.`
      );
      return;
    }

    try {
      await Match.insertMany(matches.slice(start, start + INSERT_CHUNK_SIZE), { ordered: false });
    } catch (error) {
      if (!isOnlyDuplicateKeyErrors(error)) {
        throw error;
      }
    }
  }
}

function isOnlyDuplicateKeyErrors(error) {
  const writeErrors = error.writeErrors || [error];

  return writeErrors.every((writeError) => (writeError.code ?? writeError.err?.code) === DUPLICATE_KEY_ERROR);
}

module.exports = {
  MAX_COMBINATIONS_EXPLORED,
  SEARCH_TIME_LIMIT_MS,
  MAX_NEW_MATCHES_PER_ITEM,
  processMatches,
  saveMatchesBestFirst,
  isOnlyDuplicateKeyErrors,
  findCandidateMatches,
  buildMatchingContext,
  buildRolePools,
  createBudget,
  findShapeCombinations,
  isStillViable,
  dedupeKey,
};

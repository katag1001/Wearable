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

// --- Debug logging helpers -------------------------------------------------
// Only used to make console output readable while testing the match service
// against real wardrobe data - purely cosmetic, no effect on matching logic.
function formatItem(item) {
  if (!item) return "<none>";
  return `"${item.name || "unnamed"}" [${item.type}/${item.subtype}] (id:${item._id})`;
}

function formatItems(items) {
  return items.map(formatItem).join(", ");
}

function formatShape(shape) {
  return `top:${shape.top} bottom:${shape.bottom} onepiece:${shape.onepiece} outer:${shape.outer}`;
}
// ----------------------------------------------------------------------------

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

  console.log(
    `[matchService] built role pools for new item ${formatItem(newItem)} -> ` +
      `top:${pools.top.length} bottom:${pools.bottom.length} onepiece:${pools.onepiece.length} outer:${pools.outer.length}`
  );

  return pools;
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

  if (!colorOk || !patternOk || !seasonOk) {
    const failedChecks = [
      !colorOk && "colour",
      !patternOk && "pattern",
      !seasonOk && "season",
    ].filter(Boolean);

    console.log(
      `[matchService]     viability check FAILED (${failedChecks.join(", ")}) for set [${formatItems(items)}]`
    );
  }

  return colorOk && patternOk && seasonOk;
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
  console.log(`[matchService] --- trying shape [${formatShape(shape)}] for new item ${formatItem(newItem)}`);

  const needed = {};

  for (const role of ROLES) {
    needed[role] = shape[role] - (newItem.type === role ? 1 : 0);

    if (needed[role] < 0) {
      console.log(
        `[matchService]   REJECTED shape [${formatShape(shape)}]: new item's type "${newItem.type}" ` +
          `already exceeds this shape's "${role}" slot count`
      );
      return [];
    }
  }

  // Shape-level early exit: newItem alone occupies a single-slot role it
  // can never stand alone in - no point building pools/searching at all.
  if (shape[newItem.type] === 1 && requiresLayeringSet.has(newItem.subtype)) {
    console.log(
      `[matchService]   REJECTED shape [${formatShape(shape)}]: new item ${formatItem(newItem)} requires ` +
        `layering but this shape only has 1 "${newItem.type}" slot`
    );
    return [];
  }

  // Some shapes are fully satisfied by newItem alone (0 additional picks
  // needed for every role), so the pick() loop below never runs and never
  // gets a chance to check colour/pattern/season. Check the baseline once,
  // up front - every subsequent incremental check below only ever grows
  // this same set, so this single check covers it for good.
  if (!isStillViable([newItem], colorRules)) {
    console.log(
      `[matchService]   REJECTED shape [${formatShape(shape)}]: new item ${formatItem(newItem)} alone ` +
        `already fails colour/pattern/season`
    );
    return [];
  }

  console.log(`[matchService]   needed additional picks: ${JSON.stringify(needed)}`);

  const results = [];

  function pickRole(roleIndex, chosenSoFar) {
    if (roleIndex === ROLES.length) {
      // No re-check needed here: matrix/layering/colour/pattern/season were
      // already verified incrementally as each item was picked below.
      console.log(`[matchService]   COMPLETE candidate set for shape [${formatShape(shape)}]: [${formatItems([newItem, ...chosenSoFar])}]`);
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
          console.log(`[matchService]   BUDGET EXHAUSTED while filling role "${role}" - stopping search for this shape`);
          return;
        }

        budget.remaining -= 1;

        const candidate = pool[i];
        const soFar = [newItem, ...chosenSoFar, ...picked];

        console.log(
          `[matchService]   considering ${formatItem(candidate)} for role "${role}" against current set [${formatItems(soFar)}]`
        );

        // Per-candidate layering check: this role has only 1 slot in this
        // shape, so a candidate that can't stand alone is dead on arrival.
        if (roleTargetCount === 1 && requiresLayeringSet.has(candidate.subtype)) {
          console.log(
            `[matchService]     REJECTED ${formatItem(candidate)}: requires layering but "${role}" only has 1 slot in this shape`
          );
          continue;
        }

        const incompatibleWith = soFar.find(
          (item) => !canPair(baselineMatrix, personalScores, item.subtype, candidate.subtype)
        );

        if (incompatibleWith) {
          console.log(
            `[matchService]     REJECTED ${formatItem(candidate)}: matrix says "${candidate.subtype}" ` +
              `does not pair with "${incompatibleWith.subtype}" (${formatItem(incompatibleWith)})`
          );
          continue;
        }

        if (!isStillViable([...soFar, candidate], colorRules)) {
          console.log(`[matchService]     REJECTED ${formatItem(candidate)}: fails colour/pattern/season with current set`);
          continue;
        }

        console.log(`[matchService]     ACCEPTED ${formatItem(candidate)} for role "${role}"`);

        pick(i + 1, remaining - 1, [...picked, candidate]);
      }
    }

    pick(0, count, []);
  }

  pickRole(0, []);

  console.log(`[matchService] shape [${formatShape(shape)}] produced ${results.length} candidate set(s)`);

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

  console.log(`[matchService] === finding candidate matches for ${formatItem(newItem)} across ${OUTFIT_SHAPES.length} shape(s), budget:${budget.remaining}`);

  OUTFIT_SHAPES.forEach((shape) => {
    if (!shape[newItem.type]) {
      console.log(`[matchService] skipping shape [${formatShape(shape)}]: has no "${newItem.type}" slot`);
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
        console.log(`[matchService]   REJECTED completed set [${formatItems(itemSet)}]: describeOutfit failed (likely temperature/season)`);
        return;
      }

      if (!validateOutfit(itemSet, baselineMatrix, personalScores, requiresLayeringSet, colorRules)) {
        console.log(`[matchService]   REJECTED completed set [${formatItems(itemSet)}]: failed final validateOutfit safety check`);
        return;
      }

      console.log(`[matchService]   FINAL CANDIDATE: [${formatItems(itemSet)}]`);

      candidates.push({
        ...described,
        userId: newItem.userId,
        userMade: false,
        favourite: false,
        lastWornDate: null,
      });
    });
  });

  console.log(`[matchService] === ${candidates.length} total candidate(s) found for ${formatItem(newItem)}`);

  return candidates;
}

function dedupeKey(clothesIds) {
  return clothesIds.map((id) => id.toString()).sort().join(",");
}

async function processMatches(newItem, allItems) {
  console.log(`[matchService] ######## processMatches called for ${formatItem(newItem)}`);

  if (!ROLES.includes(newItem.type)) {
    console.log(`[matchService] ABORTING: new item's type "${newItem.type}" is not a recognised role (${ROLES.join(", ")})`);
    return;
  }

  const wardrobe = allItems || (await Clothes.find({ userId: newItem.userId }));

  console.log(`[matchService] wardrobe size (excluding new item lookup): ${wardrobe.length}`);

  const [{ gender, style, colour }, personalScores] = await Promise.all([
    getUserMatchingPreferences(newItem.userId),
    loadUserScores(newItem.userId),
  ]);

  console.log(`[matchService] user preferences -> gender:${gender} style:${style} colour:${colour}`);

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
    console.log(`[matchService] no candidates found for ${formatItem(newItem)} - nothing to save`);
    return;
  }

  const existingMatches = await Match.find({ userId: newItem.userId }).select("clothes");
  const existingKeys = new Set(existingMatches.map((match) => dedupeKey(match.clothes)));
  const seenKeys = new Set();

  const newMatches = candidates.filter((match) => {
    const key = dedupeKey(match.clothes);

    if (existingKeys.has(key)) {
      console.log(`[matchService] DEDUPED (already saved): [${match.clothes.map(String).join(", ")}]`);
      return false;
    }

    if (seenKeys.has(key)) {
      console.log(`[matchService] DEDUPED (duplicate within this run): [${match.clothes.map(String).join(", ")}]`);
      return false;
    }

    seenKeys.add(key);
    return true;
  });

  if (!newMatches.length) {
    console.log(`[matchService] all candidates were duplicates of existing matches - nothing new to save`);
    return;
  }

  console.log(`[matchService] saving ${newMatches.length} new match(es) out of ${candidates.length} candidate(s) found`);

  await Match.insertMany(newMatches);

  console.log(`[matchService] ######## processMatches finished for ${formatItem(newItem)}`);
}

module.exports = {
  processMatches,
  findCandidateMatches,
  buildRolePools,
  findShapeCombinations,
  isStillViable,
};

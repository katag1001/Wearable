// server/services/todayRankingService.js
//
// Orders outfits for today's list - moved here from the clients
// (core/today/todayOutfitSort.js) so every device gets the same order.
// Pure - no DB access. Temperature isn't part of it: the weather tiers in
// todaySelectionService.js decide which outfits get in at all.
//
// Order: outfits with today's tag first, then the rest; each group by a
// weighted mix of how long since its clothes were worn, how long since the
// outfit was worn, and its match score (RANKING_WEIGHTS).

const {
  RANKING_WEIGHTS,
  FRESHNESS_FULL_DAYS,
  MAX_FRESHNESS,
  FAVOURITE_SCORE,
} = require("../constants/todayOutfits.js");

const DAY_MS = 24 * 60 * 60 * 1000;

const daysSince = (date, now) => {
  if (!date) return null;

  const time = new Date(date).getTime();

  if (Number.isNaN(time)) return null;

  return Math.max(0, (now.getTime() - time) / DAY_MS);
};

// 0-10: never worn, or worn FRESHNESS_FULL_DAYS+ days ago, is 10.
const freshness = (lastWornDate, now) => {
  const days = daysSince(lastWornDate, now);

  if (days === null) return MAX_FRESHNESS;

  return Math.min(MAX_FRESHNESS, (days / FRESHNESS_FULL_DAYS) * MAX_FRESHNESS);
};

// The average freshness of the outfit's clothes (needs clothes populated
// with lastWornDate).
const clothingFreshness = (match, now) => {
  const clothes = match.clothes || [];

  if (!clothes.length) return 0;

  const total = clothes.reduce(
    (sum, item) => sum + freshness(item?.lastWornDate, now),
    0
  );

  return total / clothes.length;
};

// The match's 0-100 score (100 for a favourite) on the same 0-10 scale.
const matchScore = (match) => {
  if (match.favourite) return FAVOURITE_SCORE / 10;

  return (typeof match.score === "number" ? match.score : 0) / 10;
};

const rankingScore = (match, now) =>
  clothingFreshness(match, now) * RANKING_WEIGHTS.clothingFreshness +
  freshness(match.lastWornDate, now) * RANKING_WEIGHTS.outfitFreshness +
  matchScore(match) * RANKING_WEIGHTS.score;

// Tags are compared ignoring case and spaces at the ends.
const hasTag = (match, todayTag) => {
  const wanted = todayTag.trim().toLowerCase();

  return (match.tags || []).some((tag) => tag.trim().toLowerCase() === wanted);
};

// The matches in today's order (a new array).
const rankTodayMatches = (matches, todayTag = null, now = new Date()) => {
  const scored = matches.map((match) => ({
    match,
    tagged: !todayTag || hasTag(match, todayTag),
    score: rankingScore(match, now),
  }));

  const byScore = (a, b) => b.score - a.score;

  return [
    ...scored.filter((entry) => entry.tagged).sort(byScore),
    ...scored.filter((entry) => !entry.tagged).sort(byScore),
  ].map((entry) => entry.match);
};

module.exports = {
  rankTodayMatches,
  rankingScore,
  freshness,
};

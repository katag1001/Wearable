// server/services/todayRankingService.js
//
// Orders outfits for today's list - moved here from the clients
// (core/today/todayOutfitSort.js) so every device gets the same order.
// Pure - no DB access. Temperature isn't part of it: the weather tiers in
// todaySelectionService.js decide which outfits get in at all.
//
// Order: outfits with today's tag first, then the rest; each group by a
// weighted mix of how long since its clothes were worn, how long since the
// outfit was worn, and its score (RANKING_WEIGHTS) - the Today score
// (todayScoreService.js) when `scoreOf` gives it - plus a small random
// nudge (RANKING_JITTER). todaySelectionService.js then spreads out
// outfits sharing an item (todayDiversityService.js).

const {
  RANKING_WEIGHTS,
  FRESHNESS_FULL_DAYS,
  MAX_FRESHNESS,
} = require("../constants/todayOutfits.js");
const { jitter } = require("./todayDiversityService.js");

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

// The match's saved score - the default for `scoreOf`.
const savedScore = (match) => (typeof match.score === "number" ? match.score : 0);

// `scoreOf(match)` is on the 0-100 scale (a Today score can go above
// 100); it counts on the same 0-10 scale as freshness.
const rankingScore = (match, now, scoreOf = savedScore) =>
  clothingFreshness(match, now) * RANKING_WEIGHTS.clothingFreshness +
  freshness(match.lastWornDate, now) * RANKING_WEIGHTS.outfitFreshness +
  (scoreOf(match) / 10) * RANKING_WEIGHTS.score;

// Tags are compared ignoring case and spaces at the ends.
const hasTag = (match, todayTag) => {
  const wanted = todayTag.trim().toLowerCase();

  return (match.tags || []).some((tag) => tag.trim().toLowerCase() === wanted);
};

// The matches in today's order, as [tagged, untagged] groups (new arrays).
// Each score gets a random nudge (todayDiversityService.jitter) last; pass
// `random` to control it.
const rankTodayGroups = (
  matches,
  todayTag = null,
  now = new Date(),
  random = Math.random,
  scoreOf = savedScore
) => {
  const scored = matches.map((match) => ({
    match,
    tagged: !todayTag || hasTag(match, todayTag),
    score: rankingScore(match, now, scoreOf) + jitter(random),
  }));

  const byScore = (a, b) => b.score - a.score;
  const group = (tagged) =>
    scored
      .filter((entry) => entry.tagged === tagged)
      .sort(byScore)
      .map((entry) => entry.match);

  return [group(true), group(false)];
};

// The matches in today's order (a new array).
const rankTodayMatches = (matches, todayTag = null, now = new Date(), random = Math.random) =>
  rankTodayGroups(matches, todayTag, now, random).flat();

module.exports = {
  rankTodayGroups,
  rankTodayMatches,
  rankingScore,
  freshness,
};

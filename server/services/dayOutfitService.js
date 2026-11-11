// server/services/dayOutfitService.js
//
// Picking the outfits for a day - one path for Today's list and the Plan
// tab's recommendations. It only reads: Today saves what it picks
// (allControllers buildToday), the Plan tab just sends it back
// (planControllers suggestForDay).
//
// The weather tiers, ranking and cap are todaySelectionService.js's. The
// two differ only in what they pass in:
//  - Today: `todayTag` puts outfits with the day's tag first; outfits
//    hidden today are left out (`leaveOut`); TODAY_OUTFIT_LIMIT.
//  - Plan: `onlyTags` keeps just the outfits with any of those tags (the
//    tags then have no say in the order); outfits planned for days nearby
//    are left out; freshness is measured from the planned day (`now`);
//    PLAN_OUTFIT_LIMIT.

const { Match, Trend } = require("../models/AllModels.js");
const { getUserMatchingPreferences } = require("./matchScoreService.js");
const { trendsForGender } = require("./trendService.js");
const { favouriteFamilyPalettes, getColorRules } = require("../utils/colorPalettes.js");
const { todayScoreBreakdown, trendNoteOf } = require("./todayScoreService.js");
const { selectTodayMatches, todayTierOf } = require("./todaySelectionService.js");
const { hasTag } = require("./todayRankingService.js");

// The clothes fields picking a day's outfits needs: lastWornDate (clothing
// freshness), type + subtype (the floors that keep a tights range from
// going too cold - todaySelectionService.todayFitOf), fabric + favourite
// + colors + pattern (Today's points and trends - todayScoreService.js).
const TODAY_BUILD_CLOTHES_FIELDS = "lastWornDate type subtype fabric favourite colors pattern";

// The clothes fields showing a day's outfits needs: subtype (the shoe box
// pairs shoes with the outfit's bottom), colors (shoes are preferred in an
// outer's colours), lastWornDate (clothing freshness), and the worn fields
// together (the snapshot the client takes before marking an outfit worn,
// restored if another is worn instead on the same device).
const TODAY_CLOTHES_FIELDS =
  "name imageUrl type subtype colors lastWornDate timesWorn timesWornThisYear wornYear";

// (match) => its Today score (todayScoreService.js), worked out once per
// match, its parts (breakdownOf) and trend note (trendNoteOf), plus the
// user's temperature preference.
const todayScorer = async (userId, season) => {
  const [{ gender, temperature, colour, seasonality, favouriteColourFamilies, trends: trendsLevel }, running] =
    await Promise.all([
      getUserMatchingPreferences(userId),
      Trend.find({ until: { $gte: new Date() } }).sort({ added: -1 }).lean(),
    ]);
  const trends = trendsForGender(running, gender);

  const scoreContext = {
    season,
    seasonality,
    palettes: getColorRules(colour).palettes,
    favouriteColourPalettes: favouriteFamilyPalettes(favouriteColourFamilies),
    trends,
    trendsLevel,
  };
  const breakdowns = new Map();

  const breakdownOf = (match) => {
    if (!breakdowns.has(match)) {
      breakdowns.set(match, todayScoreBreakdown(match, scoreContext));
    }
    return breakdowns.get(match);
  };

  const scoreOf = (match) => breakdownOf(match).total;

  const noteOf = (match) => trendNoteOf(match, scoreContext);

  return { scoreOf, breakdownOf, trendNoteOf: noteOf, temperature };
};

// Pure: whether a match may be picked - not left out, carrying one of
// `onlyTags` (when given), and in a weather tier.
const isCandidate = (match, { leaveOut, onlyTags, todayRange, temperature }) =>
  !leaveOut.has(String(match._id)) &&
  (!onlyTags || onlyTags.some((tag) => hasTag(match, tag))) &&
  todayTierOf(match, todayRange, temperature) !== null;

// The day's outfits: { chosen (best first), notice, scoreOf, breakdownOf,
// trendNoteOf, temperature }. `todayRange` is { min, max } (already
// shifted by the weather offset), `season` decides the seasonal points.
const selectOutfitsForDay = async ({
  userId,
  todayRange,
  season,
  todayTag = null,
  onlyTags = null,
  leaveOut = [],
  now = new Date(),
  limit,
}) => {
  const [allMatches, scorer] = await Promise.all([
    Match.find({ userId }).populate("clothes", TODAY_BUILD_CLOTHES_FIELDS),
    todayScorer(userId, season),
  ]);

  const context = {
    leaveOut: new Set(leaveOut.map(String)),
    onlyTags,
    todayRange,
    temperature: scorer.temperature,
  };

  const { matches: chosen, notice } = selectTodayMatches({
    matches: allMatches.filter((match) => isCandidate(match, context)),
    todayRange,
    todayTag,
    temperaturePreference: scorer.temperature,
    scoreOf: scorer.scoreOf,
    now,
    ...(limit ? { limit } : {}),
  });

  return { chosen, notice, ...scorer };
};

module.exports = {
  TODAY_BUILD_CLOTHES_FIELDS,
  TODAY_CLOTHES_FIELDS,
  todayScorer,
  isCandidate,
  selectOutfitsForDay,
};

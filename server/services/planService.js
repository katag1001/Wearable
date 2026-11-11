// server/services/planService.js
//
// The Plan tab's plans (context/planning-feature.md). A plan is an entry
// on the outfit's Match - `plannedFor: [{ date, footwear }]`, `date` the
// user's local "YYYY-MM-DD" - one outfit per day.
//
//  - Planning a day (setPlan) takes the day off any other outfit first,
//    favourites the outfit, and locks the one shoe (or none) to the day.
//    The outfit's own shoe list isn't touched until the day.
//  - On the day (applyDuePlans, run by every /today/create, and straight
//    away when today itself is planned) the plan becomes a real "worn
//    today": the outfit, its clothes and the locked shoe are counted worn
//    now, the shoe goes first on the outfit, and the entry is removed. The
//    "before" values come back so the app can undo it like its own wear
//    (core/plan/plannedWorn.js) if something else is worn instead.
//  - Passed days the app wasn't opened on are counted worn on their own
//    day - unless the outfit was already worn that day, or another outfit
//    was - and removed either way.

const { Match, Clothes, Footwear } = require("../models/AllModels.js");
const { isValidId } = require("./queryHelpers.js");
const { countWear, wearClothes, wornValuesOf } = require("./wearService.js");
const { rememberShoe } = require("./matchFootwearService.js");
const { applyFavouriteScore } = require("./matchRatingService.js");
const {
  getBaselineMatrixForUser,
  recordOutfitFavourited,
} = require("./matchScoreService.js");
const { PASSED_PLAN_WORN_HOUR } = require("../constants/planning.js");

const DAY_MS = 24 * 60 * 60 * 1000;
const HOUR_MS = 60 * 60 * 1000;

/* -------------------- Dates (pure) -------------------- */

// A real calendar date written "YYYY-MM-DD".
const isPlanDate = (value) => {
  if (typeof value !== "string" || !/^\d{4}-\d{2}-\d{2}$/.test(value)) return false;

  const date = new Date(`${value}T00:00:00Z`);

  return !Number.isNaN(date.getTime()) && date.toISOString().slice(0, 10) === value;
};

// Whole days from one plan date to another (negative if `to` is earlier).
const daysBetween = (from, to) =>
  Math.round((Date.parse(`${to}T00:00:00Z`) - Date.parse(`${from}T00:00:00Z`)) / DAY_MS);

// The plan date `days` after `date`.
const addDays = (date, days) =>
  new Date(Date.parse(`${date}T00:00:00Z`) + days * DAY_MS).toISOString().slice(0, 10);

// The start of a plan date in the user's time, from today's date and the
// start of today (the user's local midnight). A daylight-saving change in
// between can put it out by an hour.
const dayStartOf = (date, todayDate, todayStart) =>
  new Date(new Date(todayStart).getTime() + daysBetween(todayDate, date) * DAY_MS);

const isWithinDay = (when, dayStart) => {
  if (!when) return false;

  const time = new Date(when).getTime();

  return time >= dayStart.getTime() && time < dayStart.getTime() + DAY_MS;
};

// The entries of `matches` planned on or before `todayDate`, oldest first:
// [{ match, entry }].
const duePlanEntries = (matches, todayDate) =>
  matches
    .flatMap((match) =>
      (match.plannedFor || [])
        .filter((entry) => isPlanDate(entry.date) && entry.date <= todayDate)
        .map((entry) => ({ match, entry }))
    )
    .sort((a, b) => (a.entry.date < b.entry.date ? -1 : 1));

/* -------------------- Wearing a planned day -------------------- */

// Counts the outfit, its clothes and the plan's shoe worn at `wornDate`.
// Returns the undo values: { matchId, matchSnapshot, clothesSnapshots,
// shoe: { footwearId, snapshot, previousFootwear } | null }.
const wearPlannedOutfit = async (userId, match, footwearId, wornDate) => {
  const clothes = await Clothes.find({ _id: { $in: match.clothes }, userId })
    .select("lastWornDate timesWorn timesWornThisYear wornYear")
    .lean();

  const undo = {
    matchId: String(match._id),
    matchSnapshot: wornValuesOf(match),
    clothesSnapshots: clothes.map((item) => ({ clothesId: String(item._id), ...wornValuesOf(item) })),
    shoe: null,
  };

  countWear(match, wornDate);
  await match.save();
  await wearClothes(userId, match.clothes, wornDate);

  const shoe = footwearId ? await Footwear.findOne({ _id: footwearId, userId }) : null;

  if (shoe) {
    const snapshot = wornValuesOf(shoe);

    countWear(shoe, wornDate);
    await shoe.save();

    const previousFootwear = await rememberShoe(userId, match._id, shoe._id);

    undo.shoe = { footwearId: String(shoe._id), snapshot, previousFootwear };
  }

  return undo;
};

// Turns every plan up to today into a worn day and removes it. Returns
// today's undo values (wearPlannedOutfit) when today's plan was worn just
// now, else null.
const applyDuePlans = async ({ userId, todayDate, todayStart, now = new Date() }) => {
  const matches = await Match.find({ userId, "plannedFor.date": { $lte: todayDate } });
  let plannedWorn = null;

  for (const { match, entry } of duePlanEntries(matches, todayDate)) {
    const dayStart = dayStartOf(entry.date, todayDate, todayStart);
    const isToday = entry.date === todayDate;

    const wornThatDay = isWithinDay(match.lastWornDate, dayStart);
    const otherWornThatDay =
      !isToday &&
      !wornThatDay &&
      (await Match.exists({
        userId,
        _id: { $ne: match._id },
        lastWornDate: { $gte: dayStart, $lt: new Date(dayStart.getTime() + DAY_MS) },
      }));

    if (!wornThatDay && !otherWornThatDay) {
      const wornDate = isToday ? now : new Date(dayStart.getTime() + PASSED_PLAN_WORN_HOUR * HOUR_MS);
      const undo = await wearPlannedOutfit(userId, match, entry.footwear, wornDate);

      if (isToday) plannedWorn = undo;
    }

    await Match.updateOne({ _id: match._id, userId }, { $pull: { plannedFor: { date: entry.date } } });
  }

  return plannedWorn;
};

/* -------------------- Making plans -------------------- */

// Favourites the outfit if it isn't already (as the heart does -
// allControllers.updateMatch).
const favouriteMatch = async (userId, match) => {
  if (match.favourite) return;

  match.favourite = true;
  applyFavouriteScore(match);
  await match.save();

  const clothes = await Clothes.find({ _id: { $in: match.clothes }, userId });

  await recordOutfitFavourited(userId, clothes, await getBaselineMatrixForUser(userId));
};

// The user's shoe id, or null (none, or not theirs).
const ownShoeId = async (userId, footwearId) => {
  if (!footwearId || !isValidId(footwearId)) return null;

  return (await Footwear.exists({ _id: footwearId, userId }))?._id ?? null;
};

// Plans the outfit for `date` with the shoe (or none). Returns false when
// the outfit isn't the user's. Planning today itself wears it straight
// away: returns { plannedWorn } (applyDuePlans).
const setPlan = async ({ userId, matchId, date, footwearId = null, todayDate, todayStart }) => {
  if (!isValidId(matchId)) return false;

  const match = await Match.findOne({ _id: matchId, userId });

  if (!match) return false;

  const footwear = await ownShoeId(userId, footwearId);

  await Match.updateMany({ userId, "plannedFor.date": date }, { $pull: { plannedFor: { date } } });
  await Match.updateOne({ _id: match._id, userId }, { $push: { plannedFor: { date, footwear } } });

  match.plannedFor = [...(match.plannedFor || []).filter((entry) => entry.date !== date), { date, footwear }];
  await favouriteMatch(userId, match);

  const plannedWorn =
    todayDate && date <= todayDate
      ? await applyDuePlans({ userId, todayDate, todayStart })
      : null;

  return { plannedWorn };
};

const removePlan = (userId, date) =>
  Match.updateMany({ userId, "plannedFor.date": date }, { $pull: { plannedFor: { date } } });

// Changes the shoe locked to the day (null for none). False when the day
// has no plan.
const setPlanShoe = async (userId, date, footwearId) => {
  const footwear = await ownShoeId(userId, footwearId);

  const { matchedCount } = await Match.updateOne(
    { userId, "plannedFor.date": date },
    { $set: { "plannedFor.$.footwear": footwear } }
  );

  return matchedCount > 0;
};

// The plans from `from` to `to` (inclusive), by date:
// [{ date, outfit: { matchId: <match> }, footwear: <shoe> | null }].
const listPlans = async (userId, from, to, clothesFields) => {
  const matches = await Match.find({ userId, "plannedFor.date": { $gte: from, $lte: to } })
    .populate("clothes", clothesFields)
    .populate("plannedFor.footwear")
    .lean();

  return matches
    .flatMap((match) =>
      match.plannedFor
        .filter((entry) => entry.date >= from && entry.date <= to)
        .map((entry) => ({
          date: entry.date,
          outfit: { matchId: { ...match, plannedFor: undefined } },
          footwear: entry.footwear ?? null,
        }))
    )
    .sort((a, b) => (a.date < b.date ? -1 : 1));
};

// Ids of outfits planned for another day within `days` of `date` - kept
// out of that day's recommendations.
const plannedNearbyIds = async (userId, date, days) => {
  const matches = await Match.find({
    userId,
    "plannedFor.date": { $gte: addDays(date, -days), $lte: addDays(date, days) },
  })
    .select("plannedFor")
    .lean();

  return matches
    .filter((match) => match.plannedFor.some((entry) => entry.date !== date))
    .map((match) => match._id);
};

module.exports = {
  isPlanDate,
  daysBetween,
  addDays,
  dayStartOf,
  isWithinDay,
  duePlanEntries,
  applyDuePlans,
  setPlan,
  removePlan,
  setPlanShoe,
  listPlans,
  plannedNearbyIds,
};

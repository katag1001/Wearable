// server/controllers/planControllers.js
//
// The Plan tab (context/planning-feature.md): the plans on the calendar,
// recommendations for a day, and planning / changing / removing a day.
// The rules: services/planService.js; picking the outfits:
// services/dayOutfitService.js (shared with Today). Dates are the user's
// local "YYYY-MM-DD".

const { Match } = require("../models/AllModels.js");
const { OCCASION_TAGS } = require("../constants/occasionTags.js");
const { PLAN_OUTFIT_LIMIT, PLANNED_NEARBY_DAYS } = require("../constants/planning.js");
const {
  selectOutfitsForDay,
  TODAY_CLOTHES_FIELDS,
} = require("../services/dayOutfitService.js");
const { todayFitOf } = require("../services/todaySelectionService.js");
const { resolveTodayStart } = require("../services/matchRejectionService.js");
const { withUserLock } = require("../services/userLock.js");
const {
  isPlanDate,
  listPlans,
  plannedNearbyIds,
  removePlan,
  setPlan,
  setPlanShoe,
} = require("../services/planService.js");

const SEASONS = ["spring", "summer", "autumn", "winter"];

const badRequest = (res) =>
  res.status(400).json({ message: "Invalid input data.", success: false });

const serverError = (res, err) => {
  console.error(err);

  return res.status(500).json({ message: "Internal server error.", success: false });
};

// The occasion tags among `tags`, spelt as the outfit tags are.
const knownTags = (tags) =>
  (Array.isArray(tags) ? tags : [])
    .map((tag) => (typeof tag === "string" ? tag.trim().toLowerCase() : ""))
    .map((wanted) => OCCASION_TAGS.find((name) => name.toLowerCase() === wanted))
    .filter(Boolean);

// GET /plan?from=&to= - { plans: [{ date, outfit: { matchId }, footwear }] }.
exports.getPlans = async (req, res) => {
  const userId = req.user?.userId;
  const { from, to } = req.query;

  if (!isPlanDate(from) || !isPlanDate(to)) return badRequest(res);

  try {
    return res.json({ plans: await listPlans(userId, from, to, TODAY_CLOTHES_FIELDS) });
  } catch (err) {
    return serverError(res, err);
  }
};

// POST /plan/suggest - the recommendations for a day. Body: `date`,
// `min_temp` / `max_temp` (the day's, already shifted by the weather
// offset), `season`, `tags` (only outfits with one of them). Nothing is
// saved. Responds { outfits: [{ matchId: <match>, withTights }] }, best
// first, at most PLAN_OUTFIT_LIMIT.
exports.suggestForDay = async (req, res) => {
  const userId = req.user?.userId;
  const { date, min_temp, max_temp, season } = req.body || {};
  const tags = knownTags(req.body?.tags);

  if (
    !isPlanDate(date) ||
    typeof min_temp !== "number" ||
    typeof max_temp !== "number" ||
    !SEASONS.includes(season) ||
    !tags.length
  ) {
    return badRequest(res);
  }

  try {
    const todayRange = { min: min_temp, max: max_temp };

    const { chosen, temperature } = await selectOutfitsForDay({
      userId,
      todayRange,
      season,
      onlyTags: tags,
      leaveOut: await plannedNearbyIds(userId, date, PLANNED_NEARBY_DAYS),
      // Freshness as it will be on the day.
      now: new Date(`${date}T12:00:00Z`),
      limit: PLAN_OUTFIT_LIMIT,
    });

    // Again with the clothes the outfit cards show, in the same order.
    const shown = await Match.find({ _id: { $in: chosen.map((match) => match._id) }, userId })
      .populate("clothes", TODAY_CLOTHES_FIELDS)
      .lean();
    const byId = new Map(shown.map((match) => [String(match._id), match]));

    const outfits = chosen
      .filter((match) => byId.has(String(match._id)))
      .map((match) => ({
        matchId: byId.get(String(match._id)),
        withTights: todayFitOf(match, todayRange, temperature)?.withTights ?? false,
      }));

    return res.json({ outfits });
  } catch (err) {
    return serverError(res, err);
  }
};

// PUT /plan/:date - plans the outfit for the day. Body: `matchId`,
// `footwearId` (or null), `today_date` + `today_start` (the user's local
// date and midnight - planning today wears it straight away). Responds
// { success, plannedWorn } - the undo values when it was worn just now.
exports.planDay = async (req, res) => {
  const userId = req.user?.userId;
  const { date } = req.params;
  const { matchId, footwearId = null, today_date, today_start } = req.body || {};

  if (!isPlanDate(date) || !isPlanDate(today_date) || date < today_date) {
    return badRequest(res);
  }

  try {
    const result = await withUserLock(userId, () =>
      setPlan({
        userId,
        matchId,
        date,
        footwearId,
        todayDate: today_date,
        todayStart: resolveTodayStart(today_start),
      })
    );

    if (!result) {
      return res.status(404).json({ message: "Outfit not found", success: false });
    }

    return res.json({ success: true, plannedWorn: result.plannedWorn });
  } catch (err) {
    return serverError(res, err);
  }
};

// PUT /plan/:date/footwear - the shoe locked to the day. Body:
// `footwearId` (or null for none).
exports.changePlanShoe = async (req, res) => {
  const userId = req.user?.userId;
  const { date } = req.params;

  if (!isPlanDate(date)) return badRequest(res);

  try {
    const changed = await setPlanShoe(userId, date, req.body?.footwearId ?? null);

    if (!changed) {
      return res.status(404).json({ message: "Nothing planned that day", success: false });
    }

    return res.json({ success: true });
  } catch (err) {
    return serverError(res, err);
  }
};

// DELETE /plan/:date - the day has no plan any more (the outfit stays).
exports.removePlan = async (req, res) => {
  const userId = req.user?.userId;
  const { date } = req.params;

  if (!isPlanDate(date)) return badRequest(res);

  try {
    await removePlan(userId, date);

    return res.json({ success: true });
  } catch (err) {
    return serverError(res, err);
  }
};

// The current trends (Trend), for the web /trends page - admins only
// (middleware/adminMiddleware.js). Every trend is checked by
// services/trendService.js checkTrend before it's saved.

const { Trend } = require("../models/AllModels.js");
const { checkTrend } = require("../services/trendService.js");

const serverError = (res, err) => {
  console.error(err);
  return res.status(500).json({ ok: false, message: "Internal server error." });
};

// Every trend, newest first; the page marks the ended ones.
exports.listTrends = async (req, res) => {
  try {
    const trends = await Trend.find().sort({ added: -1 }).lean();
    return res.json({ ok: true, trends });
  } catch (err) {
    return serverError(res, err);
  }
};

exports.createTrend = async (req, res) => {
  try {
    const { trend, error } = checkTrend(req.body);

    if (error) {
      return res.status(400).json({ ok: false, message: error });
    }

    const created = await Trend.create(trend);
    return res.status(201).json({ ok: true, trend: created });
  } catch (err) {
    return serverError(res, err);
  }
};

// Keeps its added date; an empty end date means TREND_DEFAULT_MONTHS from
// now.
exports.updateTrend = async (req, res) => {
  try {
    const existing = await Trend.findById(req.params.id).lean();

    if (!existing) {
      return res.status(404).json({ ok: false, message: "Trend not found." });
    }

    const { trend, error } = checkTrend({ ...req.body, added: existing.added });

    if (error) {
      return res.status(400).json({ ok: false, message: error });
    }

    const updated = await Trend.findByIdAndUpdate(req.params.id, trend, { new: true });
    return res.json({ ok: true, trend: updated });
  } catch (err) {
    return serverError(res, err);
  }
};

exports.deleteTrend = async (req, res) => {
  try {
    await Trend.deleteOne({ _id: req.params.id });
    return res.json({ ok: true });
  } catch (err) {
    return serverError(res, err);
  }
};

// ?scope=expired removes the ended ones; ?scope=all removes every trend.
exports.clearTrends = async (req, res) => {
  const { scope } = req.query;

  if (scope !== "expired" && scope !== "all") {
    return res.status(400).json({ ok: false, message: "scope must be expired or all." });
  }

  try {
    const filter = scope === "expired" ? { until: { $lt: new Date() } } : {};
    const { deletedCount } = await Trend.deleteMany(filter);
    return res.json({ ok: true, deleted: deletedCount });
  } catch (err) {
    return serverError(res, err);
  }
};

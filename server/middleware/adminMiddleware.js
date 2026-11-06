// Admin-only routes (the trends): after authMiddleware, checks the user is
// an admin in the database on every request - never trusting the client -
// so removing an admin (scripts/setAdmin.js) works straight away.

const { User } = require("../models/AllModels.js");

exports.adminMiddleware = async (req, res, next) => {
  try {
    const user = await User.findById(req.user?.userId).select("isAdmin").lean();

    if (!user?.isAdmin) {
      return res.status(403).json({ ok: false, message: "Admins only." });
    }

    next();
  } catch (err) {
    console.error(err);
    return res.status(500).json({ ok: false, message: "Internal server error." });
  }
};

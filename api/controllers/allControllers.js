const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const validator = require("validator");
const jwt_secret = process.env.JWT_SECRET;

const { User, Match, Today, Clothes } = require('../models/AllModels.js');
const { processMatches } = require('../services/matchService');


/* USER CONTROLLERS */

exports.createItemregister = async (req, res) => {
  const { email, password, password2 } = req.body;

  if (!email || !password || !password2) {
    return res.json({ ok: false, message: "All fields required" });
  }

  if (password !== password2) {
    return res.json({ ok: false, message: "Passwords must match" });
  }

  if (!validator.isEmail(email)) {
    return res.json({ ok: false, message: "Invalid email" });
  }

  try {
    const user = await User.findOne({ email });
    if (user) return res.json({ ok: false, message: "User exists!" });

    const salt = bcrypt.genSaltSync(10);
    const hash = bcrypt.hashSync(password, salt);

    await User.create({ email, password: hash });

    res.json({ ok: true, message: "Successfully registered" });

  } catch (error) {
    console.log(error);
    res.json({ ok: false, error });
  }
};


exports.login = async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.json({ ok: false, message: "All fields are required" });
  }

  if (!validator.isEmail(email)) {
    return res.json({ ok: false, message: "Invalid email provided" });
  }

  try {
    const user = await User.findOne({ email });
    if (!user) return res.json({ ok: false, message: "Invalid user provided" });

    const match = bcrypt.compareSync(password, user.password);

    if (!match) {
      return res.json({ ok: false, message: "Invalid data provided" });
    }

    const token = jwt.sign(
      { userId: user._id, email: user.email },
      jwt_secret,
      { expiresIn: "356d" }
    );

    res.json({ ok: true, message: "welcome back", token, email });

  } catch (error) {
    res.json({ ok: false, error });
  }
};


exports.verify_token = (req, res) => {
  const authHeader = req.headers.authorization;

  if (!authHeader) {
    return res.json({ ok: false, message: "No token provided" });
  }

  const token = authHeader.startsWith("Bearer ")
    ? authHeader.slice(7)
    : authHeader;

  jwt.verify(token, jwt_secret, (err, decoded) => {
    if (err) {
      return res.json({ ok: false, message: "Token is corrupted" });
    }

    res.json({ ok: true, decoded });
  });
};


/* CLOTHING CONTROLLERS */

exports.createItem = async (req, res) => {
  const username = req.body.username;
  const { name, type } = req.body;

  if (!type) return res.json({ error: "Missing type" });

  try {
    const existingItem = await Clothes.findOne({
      name,
      type,
      username,
    });

    if (existingItem) {
      return res.json({
        error: "Duplicate item already exists",
        item: existingItem,
      });
    }

    const item = new Clothes(req.body);
    await item.save();

    const allItems = await Clothes.find({ username });

    processMatches(item, allItems)
      .then(() => console.log("Match processing completed."))
      .catch((err) =>
        console.error("Match processing failed:", err.message)
      );

    return res.json({
      ...item.toObject(),
      processing: true,
    });

  } catch (error) {
    return res.json({ error: error.message });
  }
};


exports.getAllItems = async (req, res) => {
  const { username } = req.body;

  if (!username) {
    return res.json({ error: "Missing username" });
  }

  try {
    const items = await Clothes.find({ username });
    return res.json(items);
  } catch (error) {
    return res.json({ error: error.message });
  }
};


exports.getItemById = async (req, res) => {
  try {
    const item = await Clothes.findById(req.params.id);

    if (!item) return res.json({ message: "Item not found" });

    res.json(item);
  } catch (error) {
    res.json({ error: error.message });
  }
};


exports.getItemByName = async (req, res) => {
  const { type } = req.params;
  const username = req.body.username;

  const basePath = `/api/clothing/${type}/`;
  const rawName = req.originalUrl.slice(basePath.length);
  const name = decodeURIComponent(rawName);

  try {
    const item = await Clothes.findOne({
      name,
      type,
      username,
    });

    if (!item) {
      return res.json({
        message: `${type} "${name}" not found for user "${username}"`,
      });
    }

    res.json(item);

  } catch (error) {
    res.json({ error: error.message });
  }
};


/* FIXED: delete matches using ObjectId */

exports.updateItem = async (req, res) => {
  const { id } = req.params;

  try {
    const existingItem = await Clothes.findById(id);
    if (!existingItem) {
      return res.json({ message: "Item not found" });
    }

    const updatedItem = await Clothes.findByIdAndUpdate(
      id,
      req.body,
      { new: true, runValidators: true }
    );

    // FIX: delete by ObjectId, not string
    await Match.deleteMany({
      clothes: existingItem._id
    });

    const allItems = await Clothes.find({
      username: updatedItem.username,
    });

    processMatches(updatedItem, allItems);

    res.json(updatedItem);

  } catch (error) {
    res.json({ error: error.message });
  }
};


/* FIXED: delete matches using ObjectId */

exports.deleteItem = async (req, res) => {
  const { id } = req.params;

  try {
    const item = await Clothes.findById(id);
    if (!item) return res.json({ message: "Item not found" });

    await Match.deleteMany({
      clothes: item._id
    });

    await Clothes.findByIdAndDelete(id);

    res.json({
      message: "Item and related matches deleted successfully",
    });

  } catch (error) {
    res.json({ error: error.message });
  }
};


/* MATCH CONTROLLERS */

exports.createMatch = async (req, res) => {
  try {
    const match = new Match(req.body);
    await match.save();
    res.json(match);
  } catch (error) {
    res.json({ error: error.message });
  }
};


exports.createMatchesBulk = async (req, res) => {
  try {
    const matches = await Match.insertMany(req.body);
    res.json(matches);
  } catch (error) {
    res.json({ error: error.message });
  }
};


exports.getAllMatches = async (req, res) => {
  const { username } = req.body;

  try {
    const matches = await Match.find({ username })
      .populate("clothes");

    res.json(matches);
  } catch (error) {
    res.json({ error: error.message });
  }
};


exports.getMatchById = async (req, res) => {
  try {
    const match = await Match.findById(req.params.id)
      .populate("clothes");

    res.json(match);
  } catch (error) {
    res.json({ error: error.message });
  }
};


exports.updateMatch = async (req, res) => {
  try {
    const match = await Match.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true }
    ).populate("clothes");

    res.json(match);

  } catch (error) {
    res.json({ error: error.message });
  }
};


exports.deleteMatch = async (req, res) => {
  try {
    await Match.findByIdAndDelete(req.params.id);
    res.json({ message: 'Match deleted' });

  } catch (error) {
    res.json({ error: error.message });
  }
};


exports.deleteMatchesByPiece = async (req, res) => {
  try {
    const { pieceId } = req.body;

    const result = await Match.deleteMany({
      clothes: pieceId
    });

    res.json({
      message: `Deleted ${result.deletedCount} matches`
    });

  } catch (error) {
    res.json({ error: error.message });
  }
};


/* TODAY CONTROLLERS */

exports.createToday = async (req, res) => {
  try {
    const { min_temp_today, max_temp_today, season_today, username } = req.body;

    if (
      typeof min_temp_today !== "number" ||
      typeof max_temp_today !== "number" ||
      !["spring", "summer", "autumn", "winter"].includes(season_today)
    ) {
      return res.json({ message: "Invalid input data.", success: false });
    }

    const seasonFilter = {};
    seasonFilter[season_today] = true;

    const matches = await Match.find({
      min_temp: { $gte: min_temp_today },
      max_temp: { $lte: max_temp_today },
      rejected: false,
      ...seasonFilter,
      username
    });

    await Today.deleteMany({});

    if (!matches.length) {
      return res.json({
        message: "No matching outfits found for today.",
        success: true,
        matchesFound: false
      });
    }

    const todayOutfits = matches.map(match => ({
      ...match.toObject(),
      rank: 1
    }));

    const inserted = await Today.insertMany(todayOutfits);

    return res.json({
      message: `${inserted.length} outfits saved.`,
      success: true,
      matchesFound: true,
      data: inserted
    });

  } catch (err) {
    return res.status(500).json({
      message: "Internal server error.",
      success: false
    });
  }
};


exports.getToday = async (req, res) => {
  const { username } = req.body;

  try {
    const outfits = await Today.find({ username })
      .sort({ rank: 1 });

    if (!outfits.length) {
      return res.json({ message: "No outfits found for today." });
    }

    res.json(outfits);

  } catch (err) {
    res.json({ message: "Internal server error." });
  }
};
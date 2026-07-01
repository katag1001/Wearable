const bcrypt = require("bcryptjs"); // https://github.com/dcodeIO/bcrypt.js#readme
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

    // Generate a salt
    const salt = bcrypt.genSaltSync(10);
    // Hash the password with the salt
    const hash = bcrypt.hashSync(password, salt);

    const newUser = {
      email,
      password: hash,
    };
    await User.create(newUser);
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
    if (match) {
      const token = jwt.sign(
  { userId: user._id, email: user.email },
  jwt_secret,
  { expiresIn: "356d" }
);
      res.json({ ok: true, message: "welcome back", token, email });
    } else return res.json({ ok: false, message: "Invalid data provided" });
  } catch (error) {
    res.json({ ok: false, error });
  }
};

exports.verify_token = (req, res) => {
  const authHeader = req.headers.authorization;
  if (!authHeader) {
    return res.json({ ok: false, message: "No token provided" });
  }

  const token = authHeader.startsWith("Bearer ") ? authHeader.slice(7) : authHeader;

  jwt.verify(token, jwt_secret, (err, succ) => {
    if (err) {
      return res.json({ ok: false, message: "Token is corrupted" });
    }
    res.json({ ok: true, succ });
  });
};


/* CLOTHING CONTROLLERS (SINGLE MODEL VERSION) */

exports.createItem = async (req, res) => {
  const username = req.body.username;
  const { name, type } = req.body;

  if (!type) return res.json({ error: "Missing type" });

  try {
    // Prevent duplicates per user + type + name
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

    // Create and save item first
    const item = new Clothes(req.body);
    await item.save();

    // Fetch wardrobe for matching
    const allItems = await Clothes.find({ username });

    // 🚀 IMPORTANT: run matching in background (DO NOT await)
    processMatches(item, allItems)
      .then(() => {
        console.log("Match processing completed.");
      })
      .catch((err) => {
        console.error("Match processing failed:", err.message);
      });

    // ✅ Respond immediately
    return res.json({
      ...item.toObject(),
      processing: true
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
  const { id } = req.params;

  try {
    const item = await Clothes.findById(id);

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

  console.log(
    `Fetching ${type} with name "${name}" for user "${username}"`
  );

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

exports.updateItem = async (req, res) => {
  const { id } = req.params;

  try {
    const existingItem = await Clothes.findById(id);
    if (!existingItem) {
      return res.json({ message: "Item not found" });
    }

    const oldName = existingItem.name;
    const type = existingItem.type;

    const updatedItem = await Clothes.findByIdAndUpdate(
      id,
      req.body,
      {
        new: true,
        runValidators: true,
      }
    );

    // Delete matches that referenced the old item
    const filter = {};
    filter[type] = oldName;

    const matchDeleteResult = await Match.deleteMany(filter);

    console.log(
      `Deleted ${matchDeleteResult.deletedCount} matches using this ${type}`
    );

    // Regenerate matches for updated wardrobe
    const allItems = await Clothes.find({
      username: updatedItem.username,
    });

    processMatches(updatedItem, allItems);

    console.log("Match processing completed after update.");

    res.json(updatedItem);
  } catch (error) {
    res.json({ error: error.message });
  }
};

exports.deleteItem = async (req, res) => {
  const { id } = req.params;

  try {
    const item = await Clothes.findById(id);
    if (!item) return res.json({ message: "Item not found" });

    const { name, type, username } = item;

    // Delete matches involving this item
    const filter = {};
    filter[type] = name;

    const matchDeleteResult = await Match.deleteMany(filter);

    console.log(
      `Deleted ${matchDeleteResult.deletedCount} matches using this ${type}`
    );

    // Delete clothing item
    await Clothes.findByIdAndDelete(id);

    res.json({
      message: "Item and related matches deleted successfully",
    });
  } catch (error) {
    res.json({ error: error.message });
  }
};

/* MATCH CONTROLLERS */

// Create one match item
exports.createMatch = async (req, res) => {
   console.log('Received body:', req.body);
  try {
    const match = new Match(req.body);
    await match.save();
    console.log('Match saved to DB:', match); 
    res.json(match);
  } catch (error) {
    res.json({ error: error.message });
  }
};

// Create multiple match items (only used for automatic from the match algorithm - no front end)
exports.createMatchesBulk = async (req, res) => {
  console.log("Received bulk matches:", req.body);
  try {
    const matches = await Match.insertMany(req.body);
    res.json(matches);
  } catch (error) {
    res.json({ error: error.message });
  }
};

// Get all matches
exports.getAllMatches = async (req, res) => {
  const username = req.body.username;
  try {
    const matches = await Match.find({'username':username});
    res.json(matches);
  } catch (error) {
    res.json({ error: error.message });
  }
};

// Get a match by ID
exports.getMatchById = async (req, res) => {
  try {
    const match = await Match.findById(req.params.id);
    res.json(match);
  } catch (error) {
    res.json({ error: error.message });
  }
};

// Update a match by ID
exports.updateMatch = async (req, res) => {
  try {
    const match = await Match.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.json(match);
  } catch (error) {
    res.json({ error: error.message });
  }
};

// Delete a match by ID
exports.deleteMatch = async (req, res) => {
  try {
    await Match.findByIdAndDelete(req.params.id);
    res.json({ message: 'Match deleted' });
  } catch (error) {
    res.json({ error: error.message });
  }
};

// For when the piece is deleted - delete all matches containing that piece
exports.deleteMatchesByPiece = async (req, res) => {
  try {
    let { pieceType, pieceValue } = req.body;

    const allowedFields = ['top', 'bottom', 'outer', 'onepiece'];
    if (!allowedFields.includes(pieceType)) {
      return res.json({ error: 'Invalid piece type' });
    }

    // Trim whitespace from pieceValue to avoid mismatch due to trailing spaces
    pieceValue = pieceValue.trim();

    const filter = {};
    filter[pieceType] = pieceValue;

    const result = await Match.deleteMany(filter);

    res.json({ message: `Deleted ${result.deletedCount} matches` });
  } catch (error) {
    res.json({ error: error.message });
  }
};

/* TODAY CONTROLLERS */

exports.createToday = async (req, res) => {
  try {
    const { min_temp_today, max_temp_today, season_today, username } = req.body;

    console.log(`[createToday] Incoming request at ${new Date().toISOString()}`);
    console.log(`[createToday] Payload received:`, { min_temp_today, max_temp_today, season_today });

    // ✅ Input validation
    if (
      typeof min_temp_today !== 'number' ||
      typeof max_temp_today !== 'number' ||
      !['spring', 'summer', 'autumn', 'winter'].includes(season_today)
    ) {
      console.warn('[createToday] Invalid input data.');
      return res.json({ message: 'Invalid input data.', success: false });
    }

    // ✅ Build dynamic season filter
    const seasonFilter = {};
    seasonFilter[season_today] = true;

    const timeLabel = `[createToday] Query time`;
    console.time(timeLabel);

    // ✅ Find matching outfits
    const matches = await Match.find({
      min_temp: { $gte: min_temp_today },
      max_temp: { $lte: max_temp_today },
      rejected: false, 
      ...seasonFilter,
      username: username
    });

    console.timeEnd(timeLabel);
    console.log(`[createToday] Found ${matches.length} match(es).`);

    // ✅ Clear previous outfits regardless of matches found
    await Today.deleteMany({});

    if (matches.length === 0) {
      console.log('[createToday] No matches found for today.');
      return res.json({
        message: 'No matching outfits found for today. Cleared old outfits.',
        matchesFound: false,
        success: true,
      });
    }

    // ✅ Prepare matches to insert (KEEP original _id)
    const todayOutfits = matches.map((match) => {
      const matchObj = match.toObject();
      // KEEP matchObj._id here - do NOT delete it
      return {
        ...matchObj,
        rank: 1,
      };
    });

    // ✅ Insert new outfits
    const inserted = await Today.insertMany(todayOutfits);

    console.log(`[createToday] Inserted ${inserted.length} outfit(s) for today.`);

    return res.json({
      message: `${inserted.length} outfits saved for today with rank 1.`,
      data: inserted,
      matchesFound: true,
      success: true,
    });
  } catch (err) {
    console.error('[createToday] ❌ Error:', err);
    return res.status(500).json({ message: 'Internal server error.', success: false });
  }
};

exports.getToday = async (req, res) => {
  const username = req.body.username;
  try {
    const outfits = await Today.find({'username':username}).sort({ rank: 1 });

    if (outfits.length === 0) {
      return res.json({ message: 'No outfits found for today.' });
    }

    res.send(outfits);
  } catch (err) {
    console.error('Error in getToday:', err);
    res.json({ message: 'Internal server error.' });
  }
};






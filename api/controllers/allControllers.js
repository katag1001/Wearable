const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const validator = require("validator");
const cloudinary = require("../cloudinary.js");
const jwt_secret = process.env.JWT_SECRET;

const { User, Match, Today, Clothes } = require("../models/AllModels.js");
const { processMatches } = require("../services/matchService");

/* -------------------- AUTH HELPERS -------------------- */

exports.verify_token = (req, res) => {
const authHeader = req.headers.authorization;

if (!authHeader) {
return res.status(401).json({ ok: false, message: "No token provided" });
}

const token = authHeader.startsWith("Bearer ")
? authHeader.slice(7)
: authHeader;

try {
const decoded = jwt.verify(token, jwt_secret);
return res.json({ ok: true, decoded });
} catch (err) {
return res.status(401).json({ ok: false, message: "Invalid token" });
}
};

/* -------------------- USER CONTROLLERS -------------------- */

exports.createItemregister = async (req, res) => {
const { email, password, password2 } = req.body;

if (!email || !password || !password2) {
return res.status(400).json({ ok: false, message: "All fields required" });
}

if (password !== password2) {
return res.status(400).json({ ok: false, message: "Passwords must match" });
}

if (!validator.isEmail(email)) {
return res.status(400).json({ ok: false, message: "Invalid email" });
}

try {
const existingUser = await User.findOne({ email });
if (existingUser) {
return res.status(409).json({ ok: false, message: "User exists!" });
}

const salt = await bcrypt.genSalt(10);
const hash = await bcrypt.hash(password, salt);

await User.create({
  email,
  password: hash,
});

return res.json({ ok: true, message: "Successfully registered" });

} catch (error) {
return res.status(500).json({ ok: false, error: error.message });
}
};

exports.login = async (req, res) => {
const { email, password } = req.body;

if (!email || !password) {
return res.status(400).json({ ok: false, message: "All fields are required" });
}

if (!validator.isEmail(email)) {
return res.status(400).json({ ok: false, message: "Invalid email provided" });
}

try {
const user = await User.findOne({ email });
if (!user) {
return res.status(401).json({ ok: false, message: "Invalid credentials" });
}

const match = await bcrypt.compare(password, user.password);
if (!match) {
  return res.status(401).json({ ok: false, message: "Invalid credentials" });
}

const token = jwt.sign(
  {
    userId: user._id,
    email: user.email,
  },
  jwt_secret,
  { expiresIn: "1h" }
);

return res.json({
  ok: true,
  message: "welcome back",
  token,
  email: user.email,
});

} catch (error) {
return res.status(500).json({ ok: false, error: error.message });
}
};

/* -------------------- CLOTHING CONTROLLERS -------------------- */

exports.createItem = async (req, res) => {
const userId = req.user?.userId;
const { name, type } = req.body;

if (!userId) {
return res.status(401).json({ error: "Unauthorized" });
}

if (!type) return res.status(400).json({ error: "Missing type" });

try {
const existingItem = await Clothes.findOne({
name,
type,
userId,
});

if (existingItem) {
  return res.json({
    error: "Duplicate item already exists",
    item: existingItem,
  });
}

const item = new Clothes({
  ...req.body,
  userId,
});

await item.save();

const allItems = await Clothes.find({ userId });

processMatches(item, allItems)
  .then(() => console.log("Match processing completed."))
  .catch((err) =>
    console.error("Match processing failed:", err.message)
  );

return res.json({ ...item.toObject(), processing: true });

} catch (error) {
return res.status(500).json({ error: error.message });
}
};

exports.getAllItems = async (req, res) => {
const userId = req.user?.userId;

if (!userId) {
return res.status(401).json({ error: "Unauthorized" });
}

try {
const items = await Clothes.find({ userId });
return res.json(items);
} catch (error) {
return res.status(500).json({ error: error.message });
}
};

exports.getItemById = async (req, res) => {
const userId = req.user?.userId;

try {
const item = await Clothes.findOne({
_id: req.params.id,
userId,
});

if (!item) return res.json({ message: "Item not found" });

return res.json(item);

} catch (error) {
return res.status(500).json({ error: error.message });
}
};

exports.getItemByName = async (req, res) => {
  const userId = req.user?.userId;
  const { type, name } = req.params;

  try {
    const item = await Clothes.findOne({
      name: decodeURIComponent(name),
      type,
      userId,
    });

    if (!item) {
      return res.json({
        message: `${type} "${name}" not found for user`,
      });
    }

    return res.json(item);
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};

exports.updateItem = async (req, res) => {
const userId = req.user?.userId;
const { id } = req.params;

try {
const existingItem = await Clothes.findOne({
_id: id,
userId,
});

if (!existingItem) {
return res.json({ message: "Item not found" });
}

const updatedItem = await Clothes.findOneAndUpdate(
{ _id: id, userId },
req.body,
{ new: true, runValidators: true }
);

const allItems = await Clothes.find({ userId });

processMatches(updatedItem, allItems);

return res.json(updatedItem);

} catch (error) {
return res.status(500).json({ error: error.message });
}
};

exports.deleteItem = async (req, res) => {
  const userId = req.user?.userId;
  const { id } = req.params;

  try {
    const item = await Clothes.findOne({
      _id: id,
      userId,
    });

    if (!item) {
      return res.json({ message: "Item not found" });
    }


    if (item.cloudinaryId) {
      await cloudinary.uploader.destroy(item.cloudinaryId);
    }


    await Match.deleteMany({ clothes: item._id });

    await Clothes.deleteOne({
      _id: id,
      userId,
    });


    return res.json({
      message: "Item, image, and related matches deleted successfully",
    });

  } catch (error) {
    return res.status(500).json({
      error: error.message
    });
  }
};

/* -------------------- MATCH CONTROLLERS -------------------- */

exports.createMatch = async (req, res) => {
  const userId = req.user?.userId;

  if (!userId) {
    return res.status(401).json({ error: "Unauthorized" });
  }

  try {
    const clothes = (req.body.clothes || []).map((id) => id.toString()).sort();

    const existingMatches = await Match.find({
      userId,
      clothes: { $size: clothes.length },
    }).select("clothes");

    const duplicate = existingMatches.find((match) => {
      const existingClothes = match.clothes
        .map((id) => id.toString())
        .sort();

      return (
        existingClothes.length === clothes.length &&
        existingClothes.every((id, index) => id === clothes[index])
      );
    });

    if (duplicate) {
      return res.status(409).json({ error: "Match already exists." });
    }

    const match = new Match({
      ...req.body,
      userId,
    });

    await match.save();

    return res.json(match);
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};

/*exports.createMatchesBulk = async (req, res) => {
  const userId = req.user?.userId;

  if (!userId) {
    return res.status(401).json({ error: "Unauthorized" });
  }

  try {
    const matchesToInsert = req.body.map((match) => ({
      ...match,
      userId,
    }));

    const clothesArrays = matchesToInsert.map((match) =>
      match.clothes.map((id) => id.toString()).sort()
    );

    const existingMatches = await Match.find({
      userId,
      clothes: {
        $in: matchesToInsert.map((match) => match.clothes),
      },
    }).select("clothes");

    const filteredMatches = matchesToInsert.filter((match) => {
      const clothes = match.clothes.map((id) => id.toString()).sort();

      const alreadyExists = existingMatches.some((existingMatch) => {
        const existingClothes = existingMatch.clothes
          .map((id) => id.toString())
          .sort();

        return (
          existingClothes.length === clothes.length &&
          existingClothes.every((id, index) => id === clothes[index])
        );
      });

      return !alreadyExists;
    });

    if (filteredMatches.length === 0) {
      return res.status(409).json({ error: "All matches already exist." });
    }

    const matches = await Match.insertMany(filteredMatches);

    return res.json(matches);
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
}; */

exports.getAllMatches = async (req, res) => {
const userId = req.user?.userId;

try {
const matches = await Match.find({ userId }).populate("clothes");
return res.json(matches);
} catch (error) {
return res.status(500).json({ error: error.message });
}
};

exports.getMatchById = async (req, res) => {
const userId = req.user?.userId;

try {
const match = await Match.findOne({
_id: req.params.id,
userId,
}).populate("clothes");

return res.json(match);

} catch (error) {
return res.status(500).json({ error: error.message });
}
};

exports.updateMatch = async (req, res) => {
const userId = req.user?.userId;

try {
const match = await Match.findOneAndUpdate(
{ _id: req.params.id, userId },
req.body,
{ new: true }
).populate("clothes");

return res.json(match);

} catch (error) {
return res.status(500).json({ error: error.message });
}
};

exports.deleteMatch = async (req, res) => {
const userId = req.user?.userId;

try {
await Match.deleteOne({
_id: req.params.id,
userId,
});

return res.json({ message: "Match deleted" });

} catch (error) {
return res.status(500).json({ error: error.message });
}
};

exports.deleteMatchesByPiece = async (req, res) => {
const userId = req.user?.userId;
const { pieceId } = req.body;

try {
const result = await Match.deleteMany({
clothes: pieceId,
userId,
});

return res.json({
  message: `Deleted ${result.deletedCount} matches`,
});

} catch (error) {
return res.status(500).json({ error: error.message });
}
};

/* -------------------- TODAY CONTROLLERS -------------------- */

exports.createToday = async (req, res) => {
const userId = req.user?.userId;

try {
const {
min_temp_today,
max_temp_today,
season_today,
} = req.body;

if (
  typeof min_temp_today !== "number" ||
  typeof max_temp_today !== "number" ||
  !["spring", "summer", "autumn", "winter"].includes(season_today)
) {
  return res.status(400).json({
    message: "Invalid input data.",
    success: false,
  });
}

const seasonFilter = {};
seasonFilter[season_today] = true;

const matches = await Match.find({
  min_temp: { $gte: min_temp_today },
  max_temp: { $lte: max_temp_today },
  rejected: false,
  userId,
  ...seasonFilter,
});

await Today.deleteMany({ userId });

if (!matches.length) {
  return res.json({
    message: "No matching outfits found for today.",
    success: true,
    matchesFound: false,
  });
}

const todayOutfits = matches.map((match) => ({
  ...match.toObject(),
  rank: 1,
  userId,
}));

const inserted = await Today.insertMany(todayOutfits);

return res.json({
  message: `${inserted.length} outfits saved.`,
  success: true,
  matchesFound: true,
  data: inserted,
});

} catch (err) {
return res.status(500).json({
message: "Internal server error.",
success: false,
});
}
};

exports.getToday = async (req, res) => {
  const userId = req.user?.userId;

  try {
    const outfits = await Today.find({ userId })
      .populate("clothes", "name imageUrl type")
      .sort({ rank: 1 });

    if (!outfits.length) {
      return res.json({ message: "No outfits found for today." });
    }

    return res.json(outfits);

  } catch (err) {
    console.error(err);

    return res.status(500).json({
      message: "Internal server error.",
    });
  }
};
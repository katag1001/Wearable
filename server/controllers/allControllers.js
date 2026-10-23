const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const validator = require("validator");
const cloudinary = require("../cloudinary.js");
const jwt_secret = process.env.JWT_SECRET;

const { User, Match, Today, Clothes, Preferences } = require("../models/AllModels.js");
const { processMatches } = require("../services/matchService");
const { waitUntil } = require("@vercel/functions");
const { deleteAllFootwearForUser } = require("./footwearControllers.js");
const {
  deleteReplacedImage,
  canUseImage,
  IMAGE_IN_USE_ERROR,
} = require("../services/imageService.js");
const { pickFields } = require("../services/requestFields.js");
const {
  CLOTHING_FIELDS,
  MATCH_FIELDS,
  WORN_SNAPSHOT_FIELDS,
} = require("../constants/editableFields.js");
const { wipeFootwearScores } = require("../services/footwearScoreService.js");
const { describeOutfit } = require("../services/outfitEvaluator.js");
const {
  getBaselineMatrix,
  getBaselineMatrixForUser,
  getUserMatchingPreferences,
  recordOutfitCreated,
  recordOutfitClaimed,
  recordOutfitFavourited,
  wipeUserScores,
} = require("../services/matchScoreService.js");
const { USER_MADE_SCORE } = require("../constants/scoring.js");
const { syncFavouriteItemBonus } = require("../services/favouriteItemService.js");
const { applyPairingAnswers } = require("../services/pairingQuizService.js");
const { cleanFavouritePalettes } = require("../utils/colorPalettes.js");
const {
  findPage,
  parseIdList,
  isValidId,
  HIGHEST_SCORE_FIRST,
} = require("../services/queryHelpers.js");
const {
  CLOTHES_CARD_FIELDS,
  parseMatchQuery,
  buildMatchFilter,
  findClothesIdsMatchingSearch,
  groupClothesByType,
} = require("../services/matchQueryService.js");
const {
  parseClothingQuery,
  buildClothingFilter,
  groupSubtypesByType,
} = require("../services/clothingQueryService.js");
const { deleteMatches } = require("../services/matchLifecycleService.js");
const { markMismatch, forgetMismatches } = require("../services/mismatchService.js");
const { isManualEdit } = require("../services/matchProtection.js");
const {
  isTemperatureFeel,
  applyTemperatureFeedback,
} = require("../services/temperatureFeedbackService.js");
const { isTightsScope, applyTightsFeedback } = require("../services/tightsFeedbackService.js");
const {
  changedMatchingFields,
  refreshMatchesForItem,
} = require("../services/matchRefreshService.js");
const {
  selectTodayMatches,
  todayTierOf,
  todayFitOf,
} = require("../services/todaySelectionService.js");
const { withUserLock } = require("../services/userLock.js");
const {
  resolveTodayStart,
  applyRejection,
  undoRejection,
  excludeRecentlyRejected,
} = require("../services/matchRejectionService.js");

// Matching runs after the response is sent. waitUntil keeps the Vercel
// function alive until it finishes (up to the function's max duration);
// outside Vercel it does nothing and the promise simply runs on.
function matchInBackground(item, allItems) {
  waitUntil(
    processMatches(item, allItems)
      .then(() => console.log("Match processing completed."))
      .catch((err) => console.error("Match processing failed:", err.message))
  );
}


/* -------------------- AUTH HELPER -------------------- */

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
    return res.status(400).json({
      ok: false,
      message: "All fields required",
    });
  }

  if (password !== password2) {
    return res.status(400).json({
      ok: false,
      message: "Passwords must match",
    });
  }

  if (!validator.isEmail(email)) {
    return res.status(400).json({
      ok: false,
      message: "Invalid email",
    });
  }

  try {
    const existingUser = await User.findOne({ email });

    if (existingUser) {
      return res.status(409).json({
        ok: false,
        message: "User exists!",
      });
    }

    const salt = await bcrypt.genSalt(10);
    const hash = await bcrypt.hash(password, salt);

    // Create the user
    await User.create({
      email,
      password: hash,
    });

    return res.json({
      ok: true,
      message: "Successfully registered",
    });

  } catch (error) {
    console.error("❌ Registration error:", error);

    return res.status(500).json({
      ok: false,
      message: "Registration failed",
      error: error.message,
    });
  }
};

exports.deleteUser = async (req, res) => {
  const userId = req.user?.userId;

  if (!userId) {
    return res.status(401).json({
      ok: false,
      message: "Unauthorized",
    });
  }

  try {
    // 1. Find all clothing items belonging to the user
    const clothes = await Clothes.find({ userId }).select(
      "_id cloudinaryId"
    );

    // 2. Delete all clothing images from Cloudinary
    for (const item of clothes) {
      if (item.cloudinaryId) {
        try {
          await cloudinary.uploader.destroy(item.cloudinaryId);
        } catch (cloudinaryError) {
          console.error(
            `Failed to delete Cloudinary image ${item.cloudinaryId}:`,
            cloudinaryError.message
          );
        }
      }
    }

    // 3. Delete all matches belonging to the user
    await Match.deleteMany({ userId });

    // 4. Delete all Today entries belonging to the user
    await Today.deleteMany({ userId });

    // 5. Delete all clothes belonging to the user
    await Clothes.deleteMany({ userId });

    // 6. Delete all footwear (and its images) belonging to the user
    await deleteAllFootwearForUser(userId);

    // 7. Delete the user's preferences
    await Preferences.deleteOne({ userId });

    // 8. Finally delete the user
    const deletedUser = await User.findByIdAndDelete(userId);

    if (!deletedUser) {
      return res.status(404).json({
        ok: false,
        message: "User not found",
      });
    }

    return res.json({
      ok: true,
      message: "User and all associated data deleted successfully",
    });

  } catch (error) {
    console.error("❌ Delete user error:", error);

    return res.status(500).json({
      ok: false,
      message: "Failed to delete user",
      error: error.message,
    });
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
  { expiresIn: "365d" }
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

console.log("[add clothing] server: request received", { userId, name, type, body: req.body });

if (!userId) {
console.log("[add clothing] server: stopped - no userId");
return res.status(401).json({ error: "Unauthorized" });
}

if (!type) {
console.log("[add clothing] server: stopped - missing type");
return res.status(400).json({ error: "Missing type" });
}

try {
const fields = pickFields(req.body, CLOTHING_FIELDS);

const existingItem = await Clothes.findOne({
name: String(name ?? ""),
type: String(type),
userId,
});

if (existingItem) {
  console.log("[add clothing] server: stopped - duplicate of", existingItem._id);
  // 409 so the client treats it as a failed save (shows the error and
  // cleans up the image it just uploaded) rather than "Item created".
  return res.status(409).json({
    error: "You already have an item with this name and type",
    item: existingItem,
  });
}

if (!(await canUseImage(fields.cloudinaryId))) {
  return res.status(409).json({ error: IMAGE_IN_USE_ERROR });
}

const item = new Clothes({
  ...fields,
  userId,
});

await item.save();

console.log("[add clothing] server: saved item", item._id);

const allItems = await Clothes.find({ userId });

console.log("[add clothing] server: starting background matching against", allItems.length, "items");

matchInBackground(item, allItems);

return res.json({ ...item.toObject(), processing: true });

} catch (error) {
console.error("[add clothing] server: FAILED", error);
return res.status(500).json({ error: error.message });
}
};

// Without ?page= this returns every item as a plain array (used by Build
// Outfits and Stats). With ?page= it returns one page of the filtered
// items plus counts - see server/services/clothingQueryService.js.
exports.getAllItems = async (req, res) => {
const userId = req.user?.userId;

if (!userId) {
return res.status(401).json({ error: "Unauthorized" });
}

try {
if (req.query.page === undefined) {
const items = await Clothes.find({ userId });
return res.json(items);
}

const filters = parseClothingQuery(req.query);

const result = await findPage({
Model: Clothes,
userId,
filter: buildClothingFilter(userId, filters),
paging: filters,
listKey: "items",
});

return res.json(result);
} catch (error) {
return res.status(500).json({ error: error.message });
}
};

// The choices shown in the My Clothes filter panel, worked out on the
// server so the page doesn't need every item to build them.
exports.getClothingFilterOptions = async (req, res) => {
const userId = req.user?.userId;

if (!userId) {
return res.status(401).json({ error: "Unauthorized" });
}

try {
const [colors, styles, tags, typesAndSubtypes] = await Promise.all([
Clothes.distinct("colors", { userId }),
Clothes.distinct("styles", { userId }),
Clothes.distinct("tags", { userId }),
Clothes.find({ userId }).select("type subtype").lean(),
]);

return res.json({
colors,
styles,
tags,
subtypesByType: groupSubtypesByType(typesAndSubtypes),
});
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

const fields = pickFields(req.body, CLOTHING_FIELDS);

if (
  fields.cloudinaryId !== undefined &&
  fields.cloudinaryId !== existingItem.cloudinaryId &&
  !(await canUseImage(fields.cloudinaryId, { exceptId: existingItem._id }))
) {
  return res.status(409).json({ error: IMAGE_IN_USE_ERROR });
}

const updatedItem = await Clothes.findOneAndUpdate(
{ _id: id, userId },
{ $set: fields },
{ new: true, runValidators: true }
);

// A new image was uploaded - the old one is no longer used.
await deleteReplacedImage(existingItem, updatedItem);

// Favouriting / unfavouriting raises or lowers its outfits' scores.
if (!!existingItem.favourite !== !!updatedItem.favourite) {
  await syncFavouriteItemBonus(userId, updatedItem);
}

// Only a change to a field matching reads (not e.g. the name) re-checks the
// item's outfits and searches for new ones.
const changedFields = changedMatchingFields(existingItem, updatedItem);

if (changedFields.length) {
  try {
    await refreshMatchesForItem(updatedItem, changedFields);
  } catch (error) {
    console.error("Match refresh failed:", error.message);
  }

  const allItems = await Clothes.find({ userId });

  matchInBackground(updatedItem, allItems);
}

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

    console.log("item found:", !!item);

    if (!item) {
      return res.status(404).json({
        error: "Item not found",
      });
    }

    console.log("cloudinaryId:", item.cloudinaryId);

    if (item.cloudinaryId) {
      console.log("Deleting from Cloudinary...");
      const result = await cloudinary.uploader.destroy(
        item.cloudinaryId
      );
      console.log("Cloudinary result:", result);
    }

    console.log("Deleting matches...");
    await deleteMatches({ clothes: item._id, userId });
    await forgetMismatches(userId, item._id);

    console.log("Deleting clothing...");
    await Clothes.deleteOne({
      _id: id,
      userId,
    });

    console.log("DELETE SUCCESS");

    return res.json({
      message: "Item, image, and related matches deleted successfully",
    });

  } catch (error) {
    console.error("DELETE CLOTHING ERROR:", error);
    console.error("Stack:", error.stack);

    return res.status(500).json({
      error: error.message,
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
    const clothesIds = parseIdList(req.body?.clothes).sort();

    if (!clothesIds.length) {
      return res.status(400).json({ error: "Choose at least one item." });
    }

    // Check if this exact match already exists
    const existingMatches = await Match.find({
      userId,
      clothes: { $size: clothesIds.length },
    }).select("clothes userMade");

    const duplicate = existingMatches.find((match) => {
      const existingClothes = match.clothes
        .map((id) => id.toString())
        .sort();

      return (
        existingClothes.length === clothesIds.length &&
        existingClothes.every((id, index) => id === clothesIds[index])
      );
    });

    if (duplicate?.userMade) {
      return res.status(409).json({ error: "Match already exists." });
    }

    // Get clothing items so we can describe the finished outfit
    const clothes = await Clothes.find({
      _id: { $in: clothesIds },
      userId,
    });

    if (clothes.length !== clothesIds.length) {
      return res.status(400).json({
        error: "One or more clothing items could not be found.",
      });
    }

    const baselineMatrix = await getBaselineMatrixForUser(userId);

    // Building an outfit the app already suggested claims it: it becomes
    // user-made, gets the flat user-made score, and its pairs learn from it.
    if (duplicate) {
      const claimed = await Match.findByIdAndUpdate(
        duplicate._id,
        { $set: { userMade: true, score: USER_MADE_SCORE, favouriteItemBonus: 0 } },
        { new: true, runValidators: true }
      );

      await recordOutfitClaimed(userId, clothes, baselineMatrix);

      return res.json(claimed);
    }

    // Manual outfits are never rejected - describeOutfit only computes
    // descriptive fields here (temperature, tags, role counts, etc.),
    // it never validates compatibility/colour/pattern.
    const { temperature } = await getUserMatchingPreferences(userId);

    const described = describeOutfit(clothes, {
      isUserMade: true,
      temperaturePreference: temperature,
    });

    // Only the checked clothes come from the request (in `described`).
    const match = new Match({
      ...described,
      userId,
      userMade: true,
      score: USER_MADE_SCORE,
    });

    await match.save();

    await recordOutfitCreated(userId, clothes, baselineMatrix);

    return res.json(match);

  } catch (error) {
    // Saved by a matching run between the duplicate check and this save
    // (Match.clothesKey is unique per user).
    if (error.code === 11000) {
      return res.status(409).json({ error: "Match already exists." });
    }

    return res.status(500).json({ error: error.message });
  }
};

// Without ?page= this returns every match as a plain array (used by Stats).
// With ?page= it returns one page of the filtered matches plus counts -
// see server/services/matchQueryService.js for the supported filters.
exports.getAllMatches = async (req, res) => {
const userId = req.user?.userId;

try {
if (req.query.page === undefined) {
const matches = await Match.find({ userId }).populate("clothes");
return res.json(matches);
}

const filters = parseMatchQuery(req.query);

const matchingClothesIds = await findClothesIdsMatchingSearch(
Clothes,
userId,
filters.search
);

const result = await findPage({
Model: Match,
userId,
filter: buildMatchFilter(userId, filters, matchingClothesIds),
paging: filters,
listKey: "matches",
sort: HIGHEST_SCORE_FIRST,
prepare: (query) => query.populate("clothes", CLOTHES_CARD_FIELDS),
});

return res.json(result);
} catch (error) {
return res.status(500).json({ error: error.message });
}
};

// The choices shown in the My Outfits filter panel, worked out on the
// server so the page doesn't need every match to build them.
exports.getMatchFilterOptions = async (req, res) => {
const userId = req.user?.userId;

try {
const [colors, styles, tags, clothesIds] = await Promise.all([
Match.distinct("colors", { userId }),
Match.distinct("styles", { userId }),
Match.distinct("tags", { userId }),
Match.distinct("clothes", { userId }),
]);

const clothes = await Clothes.find({ _id: { $in: clothesIds }, userId })
.select(CLOTHES_CARD_FIELDS)
.lean();

return res.json({
colors,
styles,
tags,
clothesByCategory: groupClothesByType(clothes),
});
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
    const match = await Match.findOne({
      _id: req.params.id,
      userId,
    });

    if (!match) {
      return res.status(404).json({
        message: "Match not found",
      });
    }

    // Only the fields in MATCH_FIELDS (plus the wear values when undoing
    // "worn today") come from the request. Score, rejection fields, clothes
    // and owner are only ever changed by the server (a favourite is shown
    // as 100 without changing its score).
    const {
      restoreSnapshot,
      clothesSnapshots,
      undoRejection: shouldUndoRejection,
    } = req.body || {};

    const matchFields = pickFields(
      req.body,
      restoreSnapshot ? [...MATCH_FIELDS, ...WORN_SNAPSHOT_FIELDS] : MATCH_FIELDS
    );

    const wasFavourite = !!match.favourite;

    // Changing anything on the edit page protects the outfit from the app's
    // automatic rematching (matchProtection.js).
    if (!restoreSnapshot && isManualEdit(match, matchFields)) {
      match.userEdited = true;
    }

    // Update match fields
    Object.assign(match, matchFields);

    const favouriteChanged =
      typeof matchFields.favourite === "boolean" &&
      matchFields.favourite !== wasFavourite;

    if (restoreSnapshot) {

      // Restore the exact prior values for the match (no increment)
      await match.save();

      // Restore the exact prior values for each affected clothing item
      if (Array.isArray(clothesSnapshots) && clothesSnapshots.length) {

        await Promise.all(
          clothesSnapshots
            .filter((snapshot) => isValidId(snapshot?.clothesId))
            .map((snapshot) =>
              Clothes.updateOne(
                { _id: snapshot.clothesId, userId },
                { $set: pickFields(snapshot, WORN_SNAPSHOT_FIELDS) }
              )
            )
        );
      }

    } else {

      // If outfit was marked as worn, update its wear counts
      if (req.body.lastWornDate) {
        const wornYear = new Date(req.body.lastWornDate).getFullYear();

        match.timesWorn = (match.timesWorn || 0) + 1;

        match.timesWornThisYear =
          match.wornYear === wornYear
            ? (match.timesWornThisYear || 0) + 1
            : 1;

        match.wornYear = wornYear;

        // Wearing an outfit rejected earlier today takes the rejection back.
        if (shouldUndoRejection) {
          undoRejection(match);
        }
      }

      await match.save();

      // If outfit was marked as worn, update all clothes in the outfit
      if (req.body.lastWornDate) {
        const wornYear = new Date(req.body.lastWornDate).getFullYear();

        await Clothes.updateMany(
          {
            _id: { $in: match.clothes },
            userId,
          },
          [
            {
              $set: {
                // The match's copy, already turned into a Date by save() -
                // never the raw request value inside an update pipeline.
                lastWornDate: match.lastWornDate,

                timesWorn: {
                  $add: [{ $ifNull: ["$timesWorn", 0] }, 1],
                },

                timesWornThisYear: {
                  $cond: [
                    { $eq: ["$wornYear", wornYear] },
                    { $add: [{ $ifNull: ["$timesWornThisYear", 0] }, 1] },
                    1,
                  ],
                },

                wornYear,
              },
            },
          ],
          { updatePipeline: true }
        );
      }
    }

    // Favouriting raises every pair in the outfit; unfavouriting leaves the
    // pair scores alone.
    if (favouriteChanged && match.favourite) {
      const clothes = await Clothes.find({ _id: { $in: match.clothes }, userId });
      const baselineMatrix = await getBaselineMatrixForUser(userId);

      await recordOutfitFavourited(userId, clothes, baselineMatrix);
    }

    // Return populated match
    const updatedMatch = await Match.findById(match._id)
      .populate("clothes");

    return res.json(updatedMatch);

  } catch (error) {
    return res.status(500).json({
      error: error.message,
    });
  }
};

// Scrolling past an outfit on the Today page. Counts at most once per
// outfit per day - a second call the same day returns the match unchanged.
exports.rejectMatch = async (req, res) => {
  const userId = req.user?.userId;

  try {
    const match = await Match.findOne({
      _id: req.params.id,
      userId,
    });

    if (!match) {
      return res.status(404).json({
        message: "Match not found",
      });
    }

    const todayStart = resolveTodayStart(req.body?.todayStart);

    if (applyRejection(match, todayStart)) {
      await match.save();
    }

    return res.json({
      _id: match._id,
      score: match.score,
      rejectedCount: match.rejectedCount,
      lastRejectedDate: match.lastRejectedDate,
    });

  } catch (error) {
    return res.status(500).json({
      error: error.message,
    });
  }
};

// "Too hot" / "too cold" on the Today page: moves the outfit's range a
// degree and hides it from today's list (temperatureFeedbackService.js).
// Body: { feel: "too_hot" | "too_cold" }.
exports.giveTemperatureFeedback = async (req, res) => {
  const userId = req.user?.userId;
  const feel = req.body?.feel;

  if (!isTemperatureFeel(feel)) {
    return res.status(400).json({ message: "Invalid feedback." });
  }

  if (!isValidId(req.params.id)) {
    return res.status(404).json({ message: "Match not found" });
  }

  try {
    const range = await applyTemperatureFeedback(userId, req.params.id, feel);

    if (!range) {
      return res.status(404).json({ message: "Match not found" });
    }

    return res.json({ _id: req.params.id, ...range });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};

// "Can't wear this with tights" on the Today page (tightsFeedbackService.js).
// Body: { scope: "outfit" | "item" }. Returns the ids of every outfit
// hidden from today's list.
exports.giveTightsFeedback = async (req, res) => {
  const userId = req.user?.userId;
  const scope = req.body?.scope;

  if (!isTightsScope(scope)) {
    return res.status(400).json({ message: "Invalid feedback." });
  }

  if (!isValidId(req.params.id)) {
    return res.status(404).json({ message: "Match not found" });
  }

  try {
    const result = await applyTightsFeedback(userId, req.params.id, scope);

    if (result.notFound) {
      return res.status(404).json({ message: "Match not found" });
    }

    if (result.invalid) {
      return res.status(400).json({ message: "This outfit has no skirt, dress or shorts." });
    }

    return res.json({ hiddenMatchIds: result.hiddenMatchIds });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};

// "Mismatch" on the Today page: two clothing items from this outfit are
// never matched again, and the outfits with both are deleted
// (mismatchService.js). Body: { clothesIds: [id, id] }. Returns the ids of
// every outfit deleted.
exports.mismatchMatch = async (req, res) => {
  const userId = req.user?.userId;

  if (!isValidId(req.params.id)) {
    return res.status(404).json({ message: "Match not found" });
  }

  try {
    const result = await markMismatch(userId, req.params.id, req.body?.clothesIds);

    if (result.notFound) {
      return res.status(404).json({ message: "Match not found" });
    }

    if (result.invalid) {
      return res.status(400).json({ message: "Choose two items from this outfit." });
    }

    return res.json({ deletedMatchIds: result.deletedMatchIds });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};

exports.deleteMatch = async (req, res) => {
const userId = req.user?.userId;

try {
await deleteMatches({ _id: req.params.id, userId });

return res.json({ message: "Match deleted" });

} catch (error) {
return res.status(500).json({ error: error.message });
}
};

// Deletes the outfits the user ticked on the matches page. Like a single
// delete, it leaves the pair scores alone (matchLifecycleService.js).
exports.deleteManyMatches = async (req, res) => {
const userId = req.user?.userId;
const ids = parseIdList(req.body?.ids);

if (!ids.length) {
return res.status(400).json({ error: "No matches selected" });
}

try {
const { deletedCount } = await deleteMatches({ _id: { $in: ids }, userId });

return res.json({
  message: `Deleted ${deletedCount} matches`,
  deletedCount,
});

} catch (error) {
return res.status(500).json({ error: error.message });
}
};

exports.deleteMatchesByPiece =async (req, res) => {
const userId = req.user?.userId;
const { pieceId } = req.body;

try {
const { deletedCount } = await deleteMatches(
  { clothes: pieceId, userId }
);

return res.json({
  message: `Deleted ${deletedCount} matches`,
});

} catch (error) {
return res.status(500).json({ error: error.message });
}
};

/* -------------------- TODAY CONTROLLERS -------------------- */

const WEEK_DAYS = [
  "monday", "tuesday", "wednesday", "thursday", "friday", "saturday", "sunday",
];

// The clothes fields Today needs: subtype (the shoe box pairs shoes with
// the outfit's bottom), lastWornDate (clothing freshness), and the worn
// fields together (the snapshot the client takes before marking an outfit
// worn, restored if another is worn instead on the same device).
const TODAY_CLOTHES_FIELDS =
  "name imageUrl type subtype lastWornDate timesWorn timesWornThisYear wornYear";

// Today's tag from the weekly preferences, for the user's weekday (sent by
// the client - "today" is the user's local day). null if none.
const getTodayTag = async (userId, dayOfWeek) => {
  if (!WEEK_DAYS.includes(dayOfWeek)) return null;

  const preferences = await Preferences.findOne({ userId }).select(dayOfWeek).lean();

  return preferences?.[dayOfWeek] || null;
};

// Builds today's outfit list - once per day. A second device (or a second
// visit with its storage cleared) gets the list already built, so every
// device shows the same outfits in the same order. Lists built before
// ranking moved to the server (no rank) are rebuilt.
//
// The weather tiers, ranking and cap: services/todaySelectionService.js.
exports.createToday = async (req, res) => {
  const userId = req.user?.userId;

  try {
    const {
      min_temp_today,
      max_temp_today,
      season_today,
      today_start,
      day_of_week,
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

    const todayStart = resolveTodayStart(today_start);

    // One build per user at a time - requests arriving together would
    // otherwise each see "no list yet" and each save a full list.
    const result = await withUserLock(userId, () =>
      buildToday({ userId, todayStart, season_today, day_of_week, min_temp_today, max_temp_today })
    );

    return res.json(result);
  } catch (err) {
    console.error(err);

    return res.status(500).json({
      message: "Internal server error.",
      success: false,
    });
  }
};

// The build itself, run under withUserLock. Returns the response body.
const buildToday = async ({ userId, todayStart, season_today, day_of_week, min_temp_today, max_temp_today }) => {
    const alreadyBuilt = await Today.exists({
      userId,
      dateCreated: { $gte: todayStart },
      rank: { $ne: null },
    });

    if (alreadyBuilt) {
      return {
        message: "Today's outfits are already built.",
        success: true,
        alreadyBuilt: true,
      };
    }

    const seasonMatches = await Match.find({
      userId,
      [season_today]: true,
    }).populate("clothes", "lastWornDate");

    const todayRange = { min: min_temp_today, max: max_temp_today };

    // Anything that could get into a weather tier...
    const candidates = seasonMatches.filter(
      (match) => todayTierOf(match, todayRange) !== null
    );

    // ...without outfits rejected in the last few days, unless every
    // candidate was.
    // Paused while temperatures are being reviewed - restore the line below
    // to hide recently rejected outfits again.
    // const matches = excludeRecentlyRejected(candidates, todayStart);
    const matches = candidates;

    const selected = selectTodayMatches({
      matches,
      todayRange,
      todayTag: await getTodayTag(userId, day_of_week),
    });

    await Today.deleteMany({ userId });

    if (!selected.length) {
      return {
        message: "No matching outfits found for today.",
        success: true,
        matchesFound: false,
      };
    }

    const inserted = await Today.insertMany(
      selected.map((match, rank) => ({
        userId,
        matchId: match._id,
        rank,
        withTights: todayFitOf(match, todayRange).withTights,
      }))
    );

    return {
      message: `${inserted.length} outfits saved.`,
      success: true,
      matchesFound: true,
    };
};

// Today's outfits in rank order, plus the outfit worn today (if any - the
// most recently worn, from anywhere: Today on any device, or the Outfits
// page), so every device opens on it. Both as { matchId: <match> }.
//
// `today_start` (query): the user's local midnight, as for createToday.
exports.getToday = async (req, res) => {
  const userId = req.user?.userId;

  try {
    const todayStart = resolveTodayStart(req.query.today_start);

    const [outfits, wornMatch] = await Promise.all([
      // Not the ones hidden with "too hot" / "too cold".
      Today.find({ userId, hidden: { $ne: true } })
        .sort({ rank: 1, _id: 1 })
        .populate({
          path: "matchId",
          populate: { path: "clothes", select: TODAY_CLOTHES_FIELDS },
        }),

      Match.findOne({ userId, lastWornDate: { $gte: todayStart } })
        .sort({ lastWornDate: -1 })
        .populate("clothes", TODAY_CLOTHES_FIELDS),
    ]);

    return res.json({
      // An outfit deleted since the list was built has no match left.
      outfits: outfits.filter((outfit) => outfit.matchId),
      wornToday: wornMatch ? { matchId: wornMatch } : null,
    });
  } catch (err) {
    console.error(err);

    return res.status(500).json({
      message: "Internal server error.",
    });
  }
};

/* -------------------- PREFERENCES CONTROLLERS -------------------- */

exports.getPreferences = async (req, res) => {
  const userId = req.user?.userId;

  try {
    const preferences = await Preferences.findOne({ userId });

    if (!preferences) {
      return res.status(404).json({
        message: "Preferences not found.",
        success: false,
      });
    }

    return res.json({
      success: true,
      data: preferences,
    });
  } catch (err) {
    console.error(err);

    return res.status(500).json({
      message: "Internal server error.",
      success: false,
    });
  }
};

exports.updatePreferences = async (req, res) => {
  const userId = req.user?.userId;

  try {
    const {
      monday,
      tuesday,
      wednesday,
      thursday,
      friday,
      saturday,
      sunday,
      gender,
      colour,
      pattern,
      temperature,
      favouritePalettes,
      pairingAnswers,
    } = req.body;

    // A user changing their gender invalidates their personal score
    // adjustments (they were learned against a different set of subtypes) -
    // so they get wiped and scoring falls back to the new gender's
    // baseline. Changing anything else (temperature, colour, pattern, day
    // preferences) never wipes them.
    const existingPreferences = await Preferences.findOne({ userId });

    const genderChanged =
      !!existingPreferences &&
      gender !== undefined &&
      gender !== existingPreferences.gender;

    const preferences = await Preferences.findOneAndUpdate(
      { userId },
      {
        $set: {
          monday,
          tuesday,
          wednesday,
          thursday,
          friday,
          saturday,
          sunday,
          gender,
          colour,
          pattern,
          temperature,
          favouritePalettes: cleanFavouritePalettes(favouritePalettes),
        },
        $setOnInsert: {
          userId,
        },
      },
      {
        new: true,
        upsert: true,
        runValidators: true,
        setDefaultsOnInsert: true,
      }
    );

    if (genderChanged) {
      await wipeUserScores(userId);
      // Footwear pairings were learned against the old gender's matrix too.
      await wipeFootwearScores(userId);
    }

    // Style quiz pairing answers set those pairs' adjustments. Applied after
    // any wipe so a gender change in the same save keeps the new answers.
    if (pairingAnswers) {
      await applyPairingAnswers(
        userId,
        pairingAnswers,
        preferences.gender,
        getBaselineMatrix(preferences.gender)
      );
    }

    return res.json({
      message: "Preferences saved successfully.",
      success: true,
      data: preferences,
    });
  } catch (err) {
    console.error(err);

    return res.status(500).json({
      message: "Internal server error.",
      success: false,
    });
  }
};






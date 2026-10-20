const cloudinary = require("../cloudinary.js");

const { Footwear } = require("../models/AllModels.js");
const { findPage } = require("../services/queryHelpers.js");
const {
  destroyImage,
  deleteReplacedImage,
  canUseImage,
  IMAGE_IN_USE_ERROR,
} = require("../services/imageService.js");
const { pickFields } = require("../services/requestFields.js");
const { FOOTWEAR_FIELDS } = require("../constants/editableFields.js");
const {
  rejectFootwearPairing,
  wearFootwearPairing,
  unwearFootwearPairing,
  loadFootwearPairings,
  wipeFootwearScores,
} = require("../services/footwearScoreService.js");
const { getUserMatchingPreferences } = require("../services/matchScoreService.js");
const { resolveTodayStart } = require("../services/matchRejectionService.js");
const {
  parseFootwearQuery,
  buildFootwearFilter,
  listOwnedSubtypes,
} = require("../services/footwearQueryService.js");

/*
 * Footwear is its own collection, separate from Clothes. Nothing here
 * touches outfits: adding, editing or deleting footwear never creates,
 * re-checks or removes matches. The Today page's shoe box ranks footwear
 * against the worn outfit and learns from it (footwearScoreService.js).
 */

// Only FOOTWEAR_FIELDS come from the form (constants/editableFields.js).
const editableFields = (body) => pickFields(body, FOOTWEAR_FIELDS);

exports.createFootwear = async (req, res) => {
  const userId = req.user?.userId;
  const { name, subtype } = req.body;

  if (!userId) {
    return res.status(401).json({ error: "Unauthorized" });
  }

  if (!subtype) {
    return res.status(400).json({ error: "Missing type" });
  }

  try {
    const existingItem = await Footwear.findOne({
      name: String(name ?? ""),
      subtype: String(subtype),
      userId,
    });

    if (existingItem) {
      // 409 so the client treats it as a failed save (shows the error and
      // cleans up the image it just uploaded).
      return res.status(409).json({
        error: "You already have footwear with this name and type",
        item: existingItem,
      });
    }

    const fields = editableFields(req.body);

    if (!(await canUseImage(fields.cloudinaryId))) {
      return res.status(409).json({ error: IMAGE_IN_USE_ERROR });
    }

    const item = new Footwear({
      ...fields,
      userId,
    });

    await item.save();

    return res.json(item);
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};

// Without ?page= this returns every item as a plain array. With ?page= it
// returns one page of the filtered items plus counts.
exports.getAllFootwear = async (req, res) => {
  const userId = req.user?.userId;

  if (!userId) {
    return res.status(401).json({ error: "Unauthorized" });
  }

  try {
    if (req.query.page === undefined) {
      const items = await Footwear.find({ userId });
      return res.json(items);
    }

    const filters = parseFootwearQuery(req.query);

    const result = await findPage({
      Model: Footwear,
      userId,
      filter: buildFootwearFilter(userId, filters),
      paging: filters,
      listKey: "items",
    });

    return res.json(result);
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};

// The choices shown in the filter panel and the Footwear subtype row.
exports.getFootwearFilterOptions = async (req, res) => {
  const userId = req.user?.userId;

  if (!userId) {
    return res.status(401).json({ error: "Unauthorized" });
  }

  try {
    const [colors, styles, tags, subtypes] = await Promise.all([
      Footwear.distinct("colors", { userId }),
      Footwear.distinct("styles", { userId }),
      Footwear.distinct("tags", { userId }),
      Footwear.distinct("subtype", { userId }),
    ]);

    return res.json({
      colors,
      styles,
      tags,
      subtypes: listOwnedSubtypes(subtypes),
    });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};

exports.getFootwearById = async (req, res) => {
  const userId = req.user?.userId;

  try {
    const item = await Footwear.findOne({ _id: req.params.id, userId });

    if (!item) {
      return res.status(404).json({ error: "Item not found" });
    }

    return res.json(item);
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};

exports.updateFootwear = async (req, res) => {
  const userId = req.user?.userId;
  const { id } = req.params;

  try {
    const existingItem = await Footwear.findOne({ _id: id, userId });

    if (!existingItem) {
      return res.status(404).json({ error: "Item not found" });
    }

    const fields = editableFields(req.body);

    if (
      fields.cloudinaryId !== undefined &&
      fields.cloudinaryId !== existingItem.cloudinaryId &&
      !(await canUseImage(fields.cloudinaryId, { exceptId: existingItem._id }))
    ) {
      return res.status(409).json({ error: IMAGE_IN_USE_ERROR });
    }

    const updatedItem = await Footwear.findOneAndUpdate(
      { _id: id, userId },
      { $set: fields },
      { new: true, runValidators: true }
    );

    // A new image was uploaded - the old one is no longer used.
    await deleteReplacedImage(existingItem, updatedItem);

    return res.json(updatedItem);
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};

exports.deleteFootwear = async (req, res) => {
  const userId = req.user?.userId;
  const { id } = req.params;

  try {
    const item = await Footwear.findOne({ _id: id, userId });

    if (!item) {
      return res.status(404).json({ error: "Item not found" });
    }

    if (item.cloudinaryId) {
      await cloudinary.uploader.destroy(item.cloudinaryId);
    }

    await Footwear.deleteOne({ _id: id, userId });

    return res.json({ message: "Footwear and image deleted successfully" });
  } catch (error) {
    console.error("DELETE FOOTWEAR ERROR:", error);

    return res.status(500).json({ error: error.message });
  }
};

/* -------------------- TODAY PAGE -------------------- */

// A subtype name from a request body, or null if missing / not a string.
const parseSubtype = (value) =>
  typeof value === "string" && value.trim() && value.length <= 100
    ? value.trim()
    : null;

// Everything the Today page's shoe box needs in one request: all the
// user's footwear, their learned pairings, their gender (which picks
// the matrix) and colour level (which picks the palettes). The box ranks
// the shoes itself.
exports.getTodayFootwear = async (req, res) => {
  const userId = req.user?.userId;

  if (!userId) {
    return res.status(401).json({ error: "Unauthorized" });
  }

  try {
    const [items, pairings, { gender, colour }] = await Promise.all([
      Footwear.find({ userId }).sort({ _id: -1 }).lean(),
      loadFootwearPairings(userId),
      getUserMatchingPreferences(userId),
    ]);

    return res.json({ items, pairings, gender, colourLevel: colour });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};

// Scrolling past a shoe - counts at most once per pairing per day.
exports.rejectFootwearPairing = async (req, res) => {
  const userId = req.user?.userId;
  const bottomSubtype = parseSubtype(req.body?.bottomSubtype);
  const footwearSubtype = parseSubtype(req.body?.footwearSubtype);

  if (!userId) {
    return res.status(401).json({ error: "Unauthorized" });
  }

  if (!bottomSubtype || !footwearSubtype) {
    return res.status(400).json({ error: "Missing bottomSubtype or footwearSubtype" });
  }

  try {
    const { gender } = await getUserMatchingPreferences(userId);

    const pairing = await rejectFootwearPairing(
      userId,
      gender,
      bottomSubtype,
      footwearSubtype,
      resolveTodayStart(req.body?.todayStart)
    );

    return res.json({ pairing });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};

// Marks a shoe worn today, with the outfit's bottom (or one-piece) subtype
// if it has one. Returns the updated shoe and pairing.
exports.wearFootwear = async (req, res) => {
  const userId = req.user?.userId;
  const bottomSubtype = parseSubtype(req.body?.bottomSubtype);
  const wornDate = new Date(req.body?.wornDate || Date.now());

  if (!userId) {
    return res.status(401).json({ error: "Unauthorized" });
  }

  if (Number.isNaN(wornDate.getTime())) {
    return res.status(400).json({ error: "Invalid wornDate" });
  }

  try {
    const item = await Footwear.findOne({ _id: req.params.id, userId });

    if (!item) {
      return res.status(404).json({ error: "Item not found" });
    }

    const wornYear = wornDate.getFullYear();

    item.lastWornDate = wornDate;
    item.timesWorn = (item.timesWorn || 0) + 1;
    item.timesWornThisYear =
      item.wornYear === wornYear ? (item.timesWornThisYear || 0) + 1 : 1;
    item.wornYear = wornYear;

    await item.save();

    let pairing = null;

    if (bottomSubtype) {
      const { gender } = await getUserMatchingPreferences(userId);

      pairing = await wearFootwearPairing(
        userId,
        gender,
        bottomSubtype,
        item.subtype,
        resolveTodayStart(req.body?.todayStart)
      );
    }

    return res.json({ item, pairing });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};

// Undoes wearFootwear when a different shoe or outfit is worn instead the
// same day: restores the shoe's exact previous worn values and takes the
// pairing's worn delta back off.
exports.unwearFootwear = async (req, res) => {
  const userId = req.user?.userId;
  const bottomSubtype = parseSubtype(req.body?.bottomSubtype);
  const snapshot = req.body?.snapshot || {};

  if (!userId) {
    return res.status(401).json({ error: "Unauthorized" });
  }

  try {
    const item = await Footwear.findOneAndUpdate(
      { _id: req.params.id, userId },
      {
        $set: {
          lastWornDate: snapshot.lastWornDate ?? null,
          timesWorn: snapshot.timesWorn ?? 0,
          timesWornThisYear: snapshot.timesWornThisYear ?? 0,
          wornYear: snapshot.wornYear ?? null,
        },
      },
      { new: true, runValidators: true }
    );

    if (!item) {
      return res.status(404).json({ error: "Item not found" });
    }

    let pairing = null;

    if (bottomSubtype) {
      const { gender } = await getUserMatchingPreferences(userId);

      pairing = await unwearFootwearPairing(
        userId,
        gender,
        bottomSubtype,
        item.subtype
      );
    }

    return res.json({ item, pairing });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};

/* -------------------- ACCOUNT -------------------- */

// Used when a user deletes their account: removes their footwear, its
// images and their learned footwear pairings. Image failures are logged
// and skipped so the account still goes.
exports.deleteAllFootwearForUser = async (userId) => {
  const items = await Footwear.find({ userId }).select("cloudinaryId");

  for (const item of items) {
    if (item.cloudinaryId) {
      await destroyImage(item.cloudinaryId, "account deleted");
    }
  }

  await Footwear.deleteMany({ userId });
  await wipeFootwearScores(userId);
};

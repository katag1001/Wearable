
const { Footwear, Trend } = require("../models/AllModels.js");
const { isShoeTrend, showsTrendNote, trendsForGender } = require("../services/trendService.js");
const { findPage } = require("../services/queryHelpers.js");
const {
  deleteReplacedImage,
  destroyItemImages,
  withReplacedImageFields,
  withDerivedImageFields,
  ITEM_IMAGE_FIELDS,
  canUseItemImages,
  IMAGE_IN_USE_ERROR,
} = require("../services/imageService.js");
const { pickFields } = require("../services/requestFields.js");
const { FOOTWEAR_FIELDS } = require("../constants/editableFields.js");
// Checks shared/footwearMatrices.json when the server starts.
require("../constants/footwearScoreBaseline.js");
const { getUserMatchingPreferences } = require("../services/matchScoreService.js");
const { countWear } = require("../services/wearService.js");
const {
  rememberShoe,
  restoreShoes,
  forgetShoe,
} = require("../services/matchFootwearService.js");
const {
  parseFootwearQuery,
  buildFootwearFilter,
  listOwnedSubtypes,
} = require("../services/footwearQueryService.js");

/*
 * Footwear is its own collection, separate from Clothes. Nothing here
 * touches outfits: adding, editing or deleting footwear never creates,
 * re-checks or removes matches. The Today page's shoe box ranks footwear
 * against the worn outfit (core/footwear/footwearRanking.js), and the shoes
 * worn with an outfit are remembered on it (matchFootwearService.js).
 */

// Only FOOTWEAR_FIELDS come from the form (constants/editableFields.js).
// With the thumbnail and original of a background-removed image.
const editableFields = (body) => withDerivedImageFields(pickFields(body, FOOTWEAR_FIELDS));

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

    if (!(await canUseItemImages(fields))) {
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

    const fields = withReplacedImageFields(editableFields(req.body), existingItem);

    if (
      fields.cloudinaryId !== undefined &&
      fields.cloudinaryId !== existingItem.cloudinaryId &&
      !(await canUseItemImages(fields, { exceptId: existingItem._id }))
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

    await destroyItemImages(item, "item deleted");

    await Footwear.deleteOne({ _id: id, userId });
    await forgetShoe(userId, item._id);

    return res.json({ message: "Footwear and image deleted successfully" });
  } catch (error) {
    console.error("DELETE FOOTWEAR ERROR:", error);

    return res.status(500).json({ error: error.message });
  }
};

/* -------------------- TODAY PAGE -------------------- */

// Everything the Today page's shoe box needs in one request: all the
// user's footwear, their gender (which picks the matrix) and colour level (which picks the palettes). The box ranks
// the shoes itself. Plus the running shoe trends, for users who care a lot
// about trends - the page notes a trendy shoe (core/today/trendNote.js).
exports.getTodayFootwear = async (req, res) => {
  const userId = req.user?.userId;

  if (!userId) {
    return res.status(401).json({ error: "Unauthorized" });
  }

  try {
    const [items, { gender, colour, trends: trendsLevel }, running] = await Promise.all([
      Footwear.find({ userId }).sort({ _id: -1 }).lean(),
      getUserMatchingPreferences(userId),
      Trend.find({ until: { $gte: new Date() } }).sort({ added: -1 }).lean(),
    ]);

    const shoeTrends = showsTrendNote(trendsLevel)
      ? trendsForGender(running, gender)
          .filter(isShoeTrend)
          .map(({ label, plural, pieces: [piece] }) => ({
            label,
            plural,
            footwear: piece.footwear,
            colour: piece.colour,
          }))
      : [];

    return res.json({ items, gender, colourLevel: colour, shoeTrends });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};

// Marks a shoe worn today, and puts it first on the outfit it was worn with
// (`matchId`, if given). Returns the updated shoe and the outfit's shoes
// from before (null without an outfit), for unwearFootwear.
exports.wearFootwear = async (req, res) => {
  const userId = req.user?.userId;
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

    countWear(item, wornDate);

    await item.save();

    const previousFootwear = await rememberShoe(userId, req.body?.matchId, item._id);

    return res.json({ item, previousFootwear });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};

// Undoes wearFootwear when a different shoe or outfit is worn instead the
// same day: restores the shoe's exact previous worn values, and the
// outfit's shoes (`matchId` + `previousFootwear`, from wearFootwear).
exports.unwearFootwear = async (req, res) => {
  const userId = req.user?.userId;
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

    await restoreShoes(userId, req.body?.matchId, req.body?.previousFootwear);

    return res.json({ item });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};

/* -------------------- ACCOUNT -------------------- */

// Used when a user deletes their account: removes their footwear and its
// images. Image failures are logged
// and skipped so the account still goes.
exports.deleteAllFootwearForUser = async (userId) => {
  const items = await Footwear.find({ userId }).select(ITEM_IMAGE_FIELDS.join(" "));

  for (const item of items) {
    await destroyItemImages(item, "account deleted");
  }

  await Footwear.deleteMany({ userId });
};

const cloudinary = require("../cloudinary.js");

const { Footwear } = require("../models/AllModels.js");
const { findPage } = require("../services/queryHelpers.js");
const {
  parseFootwearQuery,
  buildFootwearFilter,
  listOwnedSubtypes,
} = require("../services/footwearQueryService.js");

/*
 * Footwear is its own collection, separate from Clothes. Nothing here
 * touches outfits: adding, editing or deleting footwear never creates,
 * re-checks or removes matches.
 */

// The client's form also carries clothing-only fields (e.g. `type`) - the
// schema drops anything it doesn't define, but don't let these be set.
const PROTECTED_FIELDS = ["_id", "userId", "__v"];

const editableFields = (body = {}) => {
  const fields = { ...body };
  PROTECTED_FIELDS.forEach((field) => delete fields[field]);
  return fields;
};

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
    const existingItem = await Footwear.findOne({ name, subtype, userId });

    if (existingItem) {
      // 409 so the client treats it as a failed save (shows the error and
      // cleans up the image it just uploaded).
      return res.status(409).json({
        error: "You already have footwear with this name and type",
        item: existingItem,
      });
    }

    const item = new Footwear({
      ...editableFields(req.body),
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

    const updatedItem = await Footwear.findOneAndUpdate(
      { _id: id, userId },
      editableFields(req.body),
      { new: true, runValidators: true }
    );

    // A new image was uploaded - the old one is no longer used.
    const oldImageId = existingItem.cloudinaryId;

    if (oldImageId && oldImageId !== updatedItem.cloudinaryId) {
      try {
        await cloudinary.uploader.destroy(oldImageId);
      } catch (cloudinaryError) {
        console.error(
          `Failed to delete old Cloudinary image ${oldImageId}:`,
          cloudinaryError.message
        );
      }
    }

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

// Used when a user deletes their account: removes their footwear and its
// images. Image failures are logged and skipped so the account still goes.
exports.deleteAllFootwearForUser = async (userId) => {
  const items = await Footwear.find({ userId }).select("cloudinaryId");

  for (const item of items) {
    if (!item.cloudinaryId) continue;

    try {
      await cloudinary.uploader.destroy(item.cloudinaryId);
    } catch (cloudinaryError) {
      console.error(
        `Failed to delete Cloudinary image ${item.cloudinaryId}:`,
        cloudinaryError.message
      );
    }
  }

  await Footwear.deleteMany({ userId });
};

// server/constants/occasionTags.js
//
// The occasion tags (shared/occasionTags.json) and the ones that need a
// particular piece in the outfit before an outfit can have them. Used by
// services/helpers.js computeMatchTags.

const OCCASION_TAG_GROUPS = require("../../shared/occasionTags.json");

const OCCASION_TAGS = OCCASION_TAG_GROUPS.flatMap((group) => group.tags);

const isBlazer = (item) => /blazer/i.test(item.subtype || "");
const hasTag = (item, tag) => (item.tags || []).includes(tag);

// tag -> { genders (null = everyone), met(items) }.
const TAG_REQUIREMENTS = {
  // A suit-only office: men need a blazer. Women and unisex don't.
  "Formal office": {
    genders: ["man"],
    met: (items) => items.some(isBlazer),
  },
  // A formal dress, or formal bottoms worn with a blazer.
  "Formal / black tie": {
    genders: null,
    met: (items) =>
      items.some((item) => item.type === "onepiece" && hasTag(item, "Formal / black tie")) ||
      (items.some((item) => item.type === "bottom" && hasTag(item, "Formal / black tie")) && items.some(isBlazer)),
  },
};

module.exports = { OCCASION_TAG_GROUPS, OCCASION_TAGS, TAG_REQUIREMENTS };

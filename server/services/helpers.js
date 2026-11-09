// api/services/helpers.js
//
// Small pure helpers shared by the outfit-matching services. No DB access -
// callers pass already-loaded clothing items.

const { TAG_REQUIREMENTS } = require("../constants/occasionTags.js");
const { TAGGED_OUTERS } = require("../constants/outerTags.js");

const taggedOuters = new Set(TAGGED_OUTERS);

// Most outers don't take part in an outfit's tags: a coat goes over whatever
// is underneath, so it can't rule an occasion in or out. The TAGGED_OUTERS
// (constants/outerTags.js), like blazers, count exactly like a top.
const wearables = (items) =>
  items.filter((item) => item.type !== "outer" || taggedOuters.has(item.subtype));

// Tags held by every top, bottom, onepiece and tagged outer. An item with no
// tags means nothing is shared.
function overlapTags(items) {
  const [first, ...rest] = wearables(items);

  if (!first) {
    return [];
  }

  return [...new Set(first.tags || [])].filter(tag =>
    rest.every(item => (item.tags || []).includes(tag))
  );
}

const requirementMet = (tag, items, gender) => {
  const requirement = TAG_REQUIREMENTS[tag];

  if (!requirement) return true;
  if (requirement.genders && !requirement.genders.includes(gender)) return true;

  return requirement.met(items);
};

// A finished outfit's occasion tags: the overlap of its tops, bottoms,
// onepieces and tagged outers, without any tag whose required piece (constants/occasionTags.js)
// is missing. `gender` picks the gender-specific requirements.
function computeMatchTags(items, gender = null) {
  return overlapTags(items).filter((tag) => requirementMet(tag, items, gender));
}

// True if the tops, bottoms, onepieces and tagged outers still share at
// least one tag (a set of untagged outers only always does). Monotonic - once false for a partial
// item-set, adding more items can never make it true again - so this is safe
// to check early/incrementally during a search. Requirements aren't checked
// here: adding a blazer later can bring a tag back, so they're only applied
// to finished outfits (computeMatchTags).
function hasSharedTag(items) {
  return wearables(items).length === 0 || overlapTags(items).length > 0;
}

module.exports = {
  computeMatchTags,
  hasSharedTag
};

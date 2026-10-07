// api/services/helpers.js
//
// Small pure helpers shared by the outfit-matching services. No DB access -
// callers pass already-loaded clothing items.

// Tags held by EVERY item. An item with no tags means nothing is shared.
function computeMatchTags(items) {

  if (!items.length) {
    return [];
  }

  const [first, ...rest] = items;

  return [...new Set(first.tags || [])].filter(tag =>
    rest.every(item => (item.tags || []).includes(tag))
  );
}

// True if there's at least one tag every item shares. Monotonic - once
// false for a partial item-set, adding more items can never make it true
// again - so this is safe to check early/incrementally during a search.
function hasSharedTag(items) {
  return computeMatchTags(items).length > 0;
}

module.exports = {
  computeMatchTags,
  hasSharedTag
};

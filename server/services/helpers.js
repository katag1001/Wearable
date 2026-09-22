// api/services/helpers.js
//
// Small pure helpers shared by the outfit-matching services. No DB access -
// callers pass already-loaded clothing items.

function computeMatchTags(items) {

  if (!items.length) {
    return [];
  }

  const tagCounts = {};

  items.forEach(item => {
    (item.tags || []).forEach(tag => {
      tagCounts[tag] = (tagCounts[tag] || 0) + 1;
    });
  });

  const majorityTags = Object.keys(tagCounts).filter(
    tag => tagCounts[tag] >= items.length / 2
  );

  return majorityTags.length > 0
    ? majorityTags
    : Object.keys(tagCounts);
}

module.exports = {
  computeMatchTags
};

const { Clothes } = require("../models/AllModels.js");

async function generateMatchTags(clothesIds) {

  const clothes = await Clothes.find({
    _id: { $in: clothesIds }
  });

  if (!clothes.length) {
    return [];
  }

  const tagCounts = {};

  clothes.forEach(item => {
    (item.tags || []).forEach(tag => {
      tagCounts[tag] = (tagCounts[tag] || 0) + 1;
    });
  });

  const majorityTags = Object.keys(tagCounts).filter(
    tag => tagCounts[tag] >= clothes.length / 2
  );

  return majorityTags.length > 0
    ? majorityTags
    : Object.keys(tagCounts);
}

async function calculateTempRange(clothesIds) {

  const clothes = await Clothes.find({
    _id: { $in: clothesIds }
  });

  const outerItems = clothes.filter(c => c.type === "outer");
  const baseItems = clothes.filter(c => c.type !== "outer");

  const baseMins = baseItems.map(c => c.min_temp);
  const baseMaxes = baseItems.map(c => c.max_temp);

  let baseMin = Math.max(...baseMins);
  let baseMax = Math.min(...baseMaxes);

  if (baseMin > baseMax) {
    // Base items don't actually overlap - fall back to the union of their ranges.
    baseMin = Math.min(...baseMins);
    baseMax = Math.max(...baseMaxes);
  }

  if (!outerItems.length) {
    return { min_temp: baseMin, max_temp: baseMax };
  }

  const outerMin = Math.min(...outerItems.map(c => c.min_temp));

  return { min_temp: outerMin, max_temp: baseMax };
}

module.exports = {
  generateMatchTags,
  calculateTempRange
};

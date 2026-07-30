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

module.exports = {
  generateMatchTags
};

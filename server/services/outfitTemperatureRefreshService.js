// server/services/outfitTemperatureRefreshService.js
//
// A new temperature preference (always too cold ... always too hot) only
// shifts each outfit's saved temperature range (TEMPERATURE_PREFERENCE_SHIFT)
// - and the season flags read from that range. Which clothes pair and the
// scores stay the same, so nothing is rebuilt: the ranges are worked out
// again in place. Protected outfits (matchProtection.js) keep theirs.

const { Match, Clothes } = require("../models/AllModels.js");
const { describeOutfit } = require("./outfitEvaluator.js");
const { buildMatchingContext } = require("./matchService.js");
const { UNPROTECTED_MATCH_FILTER } = require("./matchProtection.js");

const SEASON_FLAGS = ["spring", "summer", "autumn", "winter"];
const REFRESHED_FIELDS = ["min_temp", "max_temp", ...SEASON_FLAGS];

const WRITE_CHUNK_SIZE = 1000;

// Pure: the changed range and season fields for each outfit. `itemsById`
// holds the user's clothes; an outfit with a missing item is left alone.
// [{ _id, fields }].
function planTemperatureRefresh(matches, itemsById, context) {
  const updates = [];

  matches.forEach((match) => {
    const items = match.clothes.map((id) => itemsById.get(String(id)));

    if (items.some((item) => !item)) {
      return;
    }

    // isUserMade: true - describe it whether or not it would pass the search.
    const described = describeOutfit(items, {
      isUserMade: true,
      temperaturePreference: context.temperaturePreference,
      gender: context.gender,
      colorRules: context.colorRules,
    });

    const fields = {};

    REFRESHED_FIELDS.forEach((field) => {
      if (match[field] !== described[field]) {
        fields[field] = described[field];
      }
    });

    if (Object.keys(fields).length) {
      updates.push({ _id: match._id, fields });
    }
  });

  return updates;
}

// `preferences`: the saved preferences after the change ({ gender, colour,
// temperature }). Returns how many outfits changed.
async function refreshOutfitTemperatures(userId, { gender, colour, temperature }) {
  const [matches, clothes] = await Promise.all([
    Match.find({ userId, ...UNPROTECTED_MATCH_FILTER })
      .select(["clothes", ...REFRESHED_FIELDS].join(" "))
      .lean(),
    Clothes.find({ userId }).lean(),
  ]);

  const itemsById = new Map(clothes.map((item) => [String(item._id), item]));
  const context = buildMatchingContext({ gender, colour, temperature });
  const updates = planTemperatureRefresh(matches, itemsById, context);

  for (let start = 0; start < updates.length; start += WRITE_CHUNK_SIZE) {
    await Match.bulkWrite(
      updates.slice(start, start + WRITE_CHUNK_SIZE).map(({ _id, fields }) => ({
        updateOne: { filter: { _id, userId }, update: { $set: fields } },
      })),
      { ordered: false }
    );
  }

  return updates.length;
}

module.exports = { planTemperatureRefresh, refreshOutfitTemperatures };

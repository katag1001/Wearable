const { Clothes } = require("../models/AllModels.js");
const axios = require("axios");
const { colorPalettes } = require("../utils/colorPalettes.js");

async function getCandidates(newItem) {

  console.log("\n==================== getCandidates ====================");
  console.log("Input item:", {
    name: newItem.name,
    type: newItem.type,
    username: newItem.username
  });

  let types = [];

  switch (newItem.type) {

    case "top":
      types = ["bottom"];
      console.log("Looking for bottoms.");
      break;

    case "bottom":
      types = ["top"];
      console.log("Looking for tops.");
      break;

    case "onepiece":
      types = ["outer"];
      console.log("Looking for outers.");
      break;

    case "outer":
      types = ["top", "onepiece"];
      console.log("Looking for tops or onepieces.");
      break;

case "match": {
  const clothes = await Clothes.find({
    _id: { $in: newItem.clothes }
  });

  const hasTop = clothes.some(c => c.type === "top");
  const hasBottom = clothes.some(c => c.type === "bottom");
  const hasOuter = clothes.some(c => c.type === "outer");

  if (hasTop && hasBottom && !hasOuter) {
    types = ["outer"];
  } else if (hasOuter && hasTop && !hasBottom) {
    types = ["bottom"];
  }

      break;
    }

    default:
      console.log("Unsupported type:", newItem.type);
      return [];
  }

  const query = {
    username: newItem.username,

    type: { $in: types },

    min_temp: { $lte: newItem.max_temp },

    max_temp: { $gte: newItem.min_temp },

    $or: [
      { spring: newItem.spring },
      { summer: newItem.summer },
      { autumn: newItem.autumn },
      { winter: newItem.winter }
    ]
  };

  console.log("Mongo query:");
  console.dir(query, { depth: null });

  const candidates = await Clothes.find(query);

  console.log(`Found ${candidates.length} candidates:`);

  candidates.forEach(c => {
    console.log(`- ${c.name} (${c.type})`);
  });

  return candidates;
}

async function matchPath(newItem, matches) {

  console.log("\n==================== matchPath ====================");
  console.log("Matching:", newItem.name || "(generated match)");
  console.log("Type:", newItem.type);

  if (newItem.type === "onepiece") {

    console.log("Creating standalone onepiece match.");

    matches.push({
      clothes: [newItem._id],
      colors: newItem.colors,
      min_temp: newItem.min_temp,
      max_temp: newItem.max_temp,
      type: "match",
      styles: [...newItem.styles],
      spring: newItem.spring,
      summer: newItem.summer,
      autumn: newItem.autumn,
      winter: newItem.winter,
      tags: null,
      rejected: false,
      userMade: false,
      username: newItem.username,
      lastWornDate: new Date("1925-09-25T00:00:00.000Z")
    });

    console.log("Standalone onepiece match added.");
  }

  const candidates = await getCandidates(newItem);

  console.log("Candidate count:", candidates.length);

  if (!candidates.length) {

    console.log("No candidates found.");
    return;

  }

  await matchSeason(newItem, candidates, matches);
}

async function matchSeason(newItem, candidates, matches) {

  console.log("Matching season:", newItem.name);

  const seasonalMatches = candidates.filter(item =>
    (item.spring && newItem.spring) ||
    (item.summer && newItem.summer) ||
    (item.autumn && newItem.autumn) ||
    (item.winter && newItem.winter)
  );

  await matchStyle(newItem, seasonalMatches, matches);

}

async function matchStyle(newItem, candidates, matches) {

  console.log("Matching style:", newItem.name);

  for (const item of candidates) {

    const combinedStyles = [
      ...newItem.styles,
      ...item.styles
    ];

    const patternedCount =
      combinedStyles.filter(style => style === "patterned").length;

    if (patternedCount <= 1) {
      await colorMatch(newItem, item, matches);
    }

  }

}

async function colorMatch(newItem, matchItem, matches) {

  console.log(
    "Matching colors:",
    newItem.name,
    "with",
    matchItem.name
  );

  const combinedColors = [
    ...new Set([
      ...newItem.colors,
      ...matchItem.colors
    ])
  ];

  const validPalette = colorPalettes.some(palette =>
    combinedColors.every(color => palette.includes(color))
  );

  if (!validPalette) return;

  await tempMatch(
    newItem,
    matchItem,
    matches,
    combinedColors
  );

}

async function tempMatch(
  newItem,
  matchItem,
  matches,
  combinedColors
) {

  if (
    newItem.min_temp > matchItem.max_temp ||
    matchItem.min_temp > newItem.max_temp
  ) {
    return;
  }

  const min_temp =
    (newItem.min_temp + matchItem.min_temp) / 2;

  const max_temp =
    (newItem.max_temp + matchItem.max_temp) / 2;

  await pushResult(
    newItem,
    matchItem,
    matches,
    combinedColors,
    min_temp,
    max_temp
  );

}

async function pushResult(
  newItem,
  matchItem,
  matches,
  combinedColors,
  min_temp,
  max_temp
) {

  console.log("\n==================== pushResult ====================");

  console.log(
    `Creating result for ${newItem.name} + ${matchItem.name}`
  );

  function createResult(overrides = {}) {

    const result = {
      clothes: [],
      colors: combinedColors,
      min_temp: Number(min_temp.toFixed(1)),
      max_temp: Number(max_temp.toFixed(1)),
      type: "match",
      styles: [...new Set([...newItem.styles, ...matchItem.styles])],
      tags: null,
      rejected: false,
      spring: newItem.spring && matchItem.spring,
      summer: newItem.summer && matchItem.summer,
      autumn: newItem.autumn && matchItem.autumn,
      winter: newItem.winter && matchItem.winter,
      userMade: false,
      username: newItem.username || matchItem.username,
      lastWornDate: new Date("1925-09-25T00:00:00.000Z"),
      ...overrides
    };

    console.log("Generated match:");
    console.dir(result, { depth: null });

    return result;

  }

  if (newItem.type === "top" || newItem.type === "bottom") {

    console.log("Creating top+bottom match.");

    const clothes = [];

    if (newItem.type === "top") {
      clothes.push(newItem._id);
      clothes.push(matchItem._id);
    } else {
      clothes.push(matchItem._id);
      clothes.push(newItem._id);
    }

    const result = createResult({ clothes });

    matches.push(result);

    console.log("Recursing to search for outer...");
    await matchPath(result, matches);

    return;

  }

  if (newItem.type === "outer" && matchItem.type === "top") {

    console.log("Outer + top. Searching for bottom.");

    const result = createResult({
      clothes: [
        matchItem._id,
        newItem._id
      ]
    });

    await matchPath(result, matches);

    return;

  }

  if (newItem.type === "outer" && matchItem.type === "onepiece") {

    console.log("Outer + onepiece complete.");

    matches.push(createResult({
    clothes: [
      matchItem._id,
      newItem._id
    ]
    }));

    return;

  }

  if (newItem.type === "match") {

    const clothes = [...newItem.clothes];

    const clothingDocs = await Clothes.find({
      _id: { $in: clothes }
    });

    const hasTop = clothingDocs.some(c => c.type === "top");
    const hasBottom = clothingDocs.some(c => c.type === "bottom");
    const hasOuter = clothingDocs.some(c => c.type === "outer");

    if (hasTop && hasBottom && !hasOuter) {

      console.log("Finishing top+bottom with outer.");

      matches.push(createResult({
        clothes: [...clothes, matchItem._id]
      }));

      return;

    }

    if (hasOuter && hasTop && !hasBottom) {

      console.log("Finishing outer+top with bottom.");

      matches.push(createResult({
        clothes: [...clothes, matchItem._id]
      }));

      return;

    }

  }

  if (newItem.type === "onepiece" && matchItem.type === "outer") {

    console.log("Onepiece + outer complete.");

    matches.push(createResult({
    clothes: [
        matchItem._id,
        newItem._id
      ]
    }));

  }

}

async function processMatches(newItem) {

  console.log("\n====================================================");
  console.log("Starting processMatches");
  console.log("====================================================");

  console.dir(newItem, { depth: null });

  const matches = [];

  await matchPath(newItem, matches);

  console.log("\nFinished matching.");
  console.log("Total matches:", matches.length);

  console.dir(matches, { depth: null });

  if (!matches.length) {

    console.log("No matches found.");
    return;

  }

  try {

    console.log("Uploading matches...");

    const response = await axios.post(
      "https://wearable-psi.vercel.app/api/match/bulk",
      matches
    );

    console.log("Upload successful.");
    console.log("Response:");

    console.dir(response.data, { depth: null });

  } catch (err) {

    console.error("Upload failed.");
    console.error(err.message);

    if (err.response) {
      console.error(err.response.data);
    }

  }

}

module.exports = {
  processMatches
};
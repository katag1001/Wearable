// server/services/itemNameService.js
//
// Names for analysed items that the user doesn't already have. The
// analysis gives a short name and a more specific one
// (services/analysisValidation.js); the short one is used when it's free,
// then the specific one, then the specific one numbered ("... 2", "... 3").
// Names are compared ignoring case and spacing, across clothes AND
// footwear.

const { Clothes, Footwear } = require("../models/AllModels.js");

const nameKey = (name) => String(name ?? "").replace(/\s+/g, " ").trim().toLowerCase();

// Pure. `candidates` in order of preference (at least one).
function pickUniqueName(candidates, takenNames) {
  const taken = new Set(takenNames.map(nameKey));

  const free = candidates.find((name) => !taken.has(nameKey(name)));

  if (free) return free;

  const base = candidates[candidates.length - 1];

  for (let number = 2; ; number += 1) {
    const numbered = `${base} ${number}`;

    if (!taken.has(nameKey(numbered))) return numbered;
  }
}

async function loadTakenNames(userId) {
  const [clothes, footwear] = await Promise.all([
    Clothes.distinct("name", { userId }),
    Footwear.distinct("name", { userId }),
  ]);

  return [...clothes, ...footwear];
}

module.exports = { pickUniqueName, loadTakenNames, nameKey };

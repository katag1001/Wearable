// server/constants/requiresLayering.js
//
// Hardcoded single-item rules. Like the role rules in compatibilityRules.js,
// these are never changed by user behaviour.
//
// REQUIRES_LAYERING - tops/outers that can never be the only item in their
// role. They always need a second item of the same role (e.g. Warm cardigan
// needs a t-shirt or similar underneath), so they only appear in shapes
// with 2 tops (or 2 outers).
//
// REQUIRES_TOP - onepieces that must always be worn with a top (e.g.
// Overalls), so they only appear in the onepiece + top shapes.

const REQUIRES_LAYERING = {
  man: ["Warm cardigan", "Waistcoat"],
  woman: ["Warm cardigan"],
  unisex: ["Warm cardigan"],
};

const REQUIRES_TOP = {
  man: ["Overalls"],
  woman: ["Overalls"],
  unisex: ["Overalls"],
};

function getRequiresLayeringSet(gender) {
  return new Set(REQUIRES_LAYERING[gender] || []);
}

function getRequiresTopSet(gender) {
  return new Set(REQUIRES_TOP[gender] || []);
}

// Both rule sets for one gender, in the shape matrixService expects.
function getLayeringRules(gender) {
  return {
    requiresLayeringSet: getRequiresLayeringSet(gender),
    requiresTopSet: getRequiresTopSet(gender),
  };
}

module.exports = {
  REQUIRES_LAYERING,
  REQUIRES_TOP,
  getRequiresLayeringSet,
  getRequiresTopSet,
  getLayeringRules,
};

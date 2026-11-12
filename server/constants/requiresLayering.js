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
//
// REQUIRES_OUTER - items that must always be worn with an outer (e.g.
// Ski/snow pants), so they only appear in shapes with an outer.

const REQUIRES_LAYERING = {
  man: ["Warm cardigan", "Chunky knit jumper", "Waistcoat"],
  woman: ["Warm cardigan", "Chunky knit jumper", "Thick turtleneck jumper"],
  unisex: ["Warm cardigan", "Chunky knit jumper", "Thick turtleneck jumper"],
};

const REQUIRES_TOP = {
  man: ["Overalls"],
  woman: ["Overalls"],
  unisex: ["Overalls"],
};

const REQUIRES_OUTER = {
  man: ["Ski/snow pants"],
  woman: ["Ski/snow pants"],
  unisex: ["Ski/snow pants"],
};

function getRequiresLayeringSet(gender) {
  return new Set(REQUIRES_LAYERING[gender] || []);
}

function getRequiresTopSet(gender) {
  return new Set(REQUIRES_TOP[gender] || []);
}

function getRequiresOuterSet(gender) {
  return new Set(REQUIRES_OUTER[gender] || []);
}

// Both rule sets for one gender, in the shape matrixService expects.
function getLayeringRules(gender) {
  return {
    requiresLayeringSet: getRequiresLayeringSet(gender),
    requiresTopSet: getRequiresTopSet(gender),
    requiresOuterSet: getRequiresOuterSet(gender),
  };
}

module.exports = {
  REQUIRES_LAYERING,
  REQUIRES_TOP,
  REQUIRES_OUTER,
  getRequiresLayeringSet,
  getRequiresTopSet,
  getRequiresOuterSet,
  getLayeringRules,
};

// api/constants/requiresLayering.js
//
// Hardcoded list of subtypes that can never be the sole occupant of their
// role - they always need a second item of the same role to be worn (e.g.
// Warm cardigan needs a t-shirt or similar underneath). This is a deliberate
// hard rule, not personalizable via user behaviour, unlike everything else
// in the matching system.
//
// Only ever takes effect for LAYERABLE_ROLES (top/outer) - see
// api/constants/outfitShapes.js. No shape ever offers a second bottom or
// onepiece, so a bottom/onepiece subtype listed here would have no effect
// (matrixService guards against it), rather than becoming permanently
// unusable.

const REQUIRES_LAYERING = {
  man: ["Warm cardigan", "Overalls"],
  woman: ["Warm cardigan"],
  unisex: ["Warm cardigan"],
};

function getRequiresLayeringSet(gender) {
  return new Set(REQUIRES_LAYERING[gender] || []);
}

module.exports = { REQUIRES_LAYERING, getRequiresLayeringSet };

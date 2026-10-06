// server/constants/compatibilityRules.js
//
// Fixed compatibility rules by role. These hold whatever the matrix files
// say and are never changed by user behaviour:
//
//  - "never":   two bottoms, two onepieces, a bottom with a onepiece.
//  - "always":  top+bottom, top+outer, bottom+outer, onepiece+outer.
//  - "decided": top+top, outer+outer, top+onepiece - the per-pair yes/no
//               lives in the matrix files (null = no, a score = yes).
//
// The same subtype twice is also never compatible - see
// services/matrixService.js. matchScoreBaseline.js checks every matrix
// file against these rules when the server starts.

const NEVER = "never";
const ALWAYS = "always";
const DECIDED = "decided";

function rolePairKey(roleA, roleB) {
  return [roleA, roleB].sort().join("+");
}

const ROLE_PAIR_RULES = {
  [rolePairKey("bottom", "bottom")]: NEVER,
  [rolePairKey("onepiece", "onepiece")]: NEVER,
  [rolePairKey("bottom", "onepiece")]: NEVER,

  [rolePairKey("top", "bottom")]: ALWAYS,
  [rolePairKey("top", "outer")]: ALWAYS,
  [rolePairKey("bottom", "outer")]: ALWAYS,
  [rolePairKey("onepiece", "outer")]: ALWAYS,

  [rolePairKey("top", "top")]: DECIDED,
  [rolePairKey("outer", "outer")]: DECIDED,
  [rolePairKey("top", "onepiece")]: DECIDED,
};

// Unknown roles count as "never", so a malformed item can't slip through.
function getRolePairRule(roleA, roleB) {
  return ROLE_PAIR_RULES[rolePairKey(roleA, roleB)] || NEVER;
}

module.exports = { NEVER, ALWAYS, DECIDED, getRolePairRule };

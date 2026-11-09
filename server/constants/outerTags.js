// server/constants/outerTags.js
//
// Which outer subtypes count towards an outfit's occasion tags. Used by
// services/helpers.js (computeMatchTags, hasSharedTag).
//
// TAGGED_OUTERS - worn as part of the outfit, so their tags count exactly
// like a top's: the outfit only keeps tags they share, and one with no tags
// never matches automatically.
//
// UNTAGGED_OUTERS - worn over whatever is underneath, so their tags are
// ignored and they never rule an occasion in or out.
//
// To change how a subtype behaves, move it from one list to the other, then
// run server/scripts/rematchAll.js. Every outer subtype must be in exactly
// one list (helpers.spec.js checks this).

const TAGGED_OUTERS = [
  "Tailored blazer",
  "Longline blazer",
  "Shacket",
  "Fleece",
  "Denim jacket",
  "Leather jacket",
  "Poncho",
];

const UNTAGGED_OUTERS = [
  "Duffle coat",
  "Rain coat",
  "Classic trench",
  "Long leather coat",
  "Puffer coat",
  "Wool coat",
  "Parka",
  "Spring coat",
  "Knit coat",
  "Fur coat",
  "Cropped jacket",
  "Bomber",
  "Gilet",
];

module.exports = { TAGGED_OUTERS, UNTAGGED_OUTERS };

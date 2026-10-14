// src/constants/footwearOptions.jsx
//
// Each gender's footwear types, with the seasons and tags that pre-fill
// page two of the Add Footwear form. Footwear is separate from clothing
// (its own Footwear collection) and has no role or category.
//
// The type names per gender come from shared/footwearByGender.json, which
// the footwear score matrices (shared/footwearMatrices.json) are checked
// against. Unisex is every type from the woman and man lists. A type added
// there needs an entry in FOOTWEAR_DEFAULTS below and a column in the
// matrices.

import footwearByGender from "../../shared/footwearByGender.json";

const ALL_SEASONS = ["Spring", "Summer", "Autumn", "Winter"];

// Defaults per type, shared by every gender that has the type.
const FOOTWEAR_DEFAULTS = {
  "Ballerinas": {
    season: ["Spring", "Summer", "Autumn"],
    tags: ["Work", "Everyday", "Dinner", "Date night", "Party"],
  },
  "Loafers": {
    season: ALL_SEASONS,
    tags: ["Work", "Everyday", "Dinner", "Date night"],
  },
  "Flipflops": {
    season: ["Summer"],
    tags: ["Beach", "Loungewear", "Everyday"],
  },
  "Ankle boots": {
    season: ["Spring", "Autumn", "Winter"],
    tags: ["Work", "Everyday", "Dinner", "Date night", "Outdoor"],
  },
  "Knee-high boots": {
    season: ["Autumn", "Winter"],
    tags: ["Everyday", "Dinner", "Date night", "Party"],
  },
  "Heeled boots": {
    season: ["Autumn", "Winter"],
    tags: ["Work", "Dinner", "Date night", "Party"],
  },
  "Snow boots": {
    season: ["Winter"],
    tags: ["Outdoor", "Everyday"],
  },
  "Sandals": {
    season: ["Spring", "Summer"],
    tags: ["Beach", "Everyday", "Dinner", "Date night"],
  },
  "Walking boots": {
    season: ["Spring", "Autumn", "Winter"],
    tags: ["Outdoor", "Everyday"],
  },
  "Heeled sandals": {
    season: ["Spring", "Summer"],
    tags: ["Party", "Dinner", "Date night", "Wedding"],
  },
  "Heels": {
    season: ALL_SEASONS,
    tags: ["Work", "Dinner", "Date night", "Party", "Wedding"],
  },
  "Smart trainers": {
    season: ALL_SEASONS,
    tags: ["Work", "Everyday", "Dinner", "Date night"],
  },
  "Casual trainers": {
    season: ALL_SEASONS,
    tags: ["Gym", "Everyday", "Outdoor", "Loungewear"],
  },
  "Formal shoes": {
    season: ALL_SEASONS,
    tags: ["Work", "Dinner", "Wedding", "Party", "Date night"],
  },
  "Boots": {
    season: ["Spring", "Autumn", "Winter"],
    tags: ["Everyday", "Outdoor", "Work", "Dinner", "Date night"],
  },
};

const toOptions = (names) =>
  names.map((name) => ({ name, ...FOOTWEAR_DEFAULTS[name] }));

const footwearOptionsByGender = {
  woman: toOptions(footwearByGender.woman),
  man: toOptions(footwearByGender.man),
  unisex: toOptions(footwearByGender.unisex),
};

// Extra keywords for suggesting a type from the item's name, on top of
// the type's own name and words (see suggestSubtypesFromName). Keyed by
// the lowercased type name.
export const FOOTWEAR_SYNONYMS = {
  "ballerinas": ["ballerina", "ballet flats", "flats"],
  "loafers": ["loafer", "moccasins", "penny"],
  "flipflops": ["flip flops", "flip-flops", "flip flop", "thongs", "jandals"],
  "ankle boots": ["chelsea", "booties"],
  "knee-high boots": ["knee high", "tall boots", "riding boots"],
  "heeled boots": ["heeled boot", "stiletto boots"],
  "snow boots": ["uggs", "ugg", "moon boots", "winter boots"],
  "walking boots": ["walking boot", "hiking boots", "hiking boot", "hikers", "trail boots"],
  "sandals": ["sandal", "slides", "sliders", "espadrilles"],
  "heeled sandals": ["heeled sandal", "strappy heels", "block heel sandals", "wedges", "wedge sandals"],
  "heels": ["heel", "pumps", "stilettos", "stiletto", "court shoes", "slingbacks", "mules"],
  // "trainers" on its own matches both trainer types by their names.
  "smart trainers": ["smart trainer", "leather trainers", "white trainers", "smart sneakers", "leather sneakers"],
  "casual trainers": ["casual trainer", "sneakers", "sneaker", "runners", "running shoes", "kicks"],
  "formal shoes": ["brogues", "oxfords", "derby", "derbies", "dress shoes"],
  "boots": ["boot", "chelsea", "work boots"],
};

export const getFootwearOptions = (gender) =>
  footwearOptionsByGender[gender] || footwearOptionsByGender.unisex;

export default footwearOptionsByGender;

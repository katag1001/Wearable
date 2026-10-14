// src/constants/footwearOptions.jsx
//
// Each gender's footwear types, with the seasons and tags that pre-fill
// page two of the Add Footwear form. Footwear is separate from clothing
// (its own Footwear collection) and never takes part in outfit matching,
// so unlike typeOptions.jsx there is no role or category, and nothing on
// the server needs to be kept in step with this file.

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
  "Heels": {
    season: ALL_SEASONS,
    tags: ["Work", "Dinner", "Date night", "Party", "Wedding"],
  },
  "Trainers": {
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

const WOMAN_FOOTWEAR = [
  "Ballerinas",
  "Loafers",
  "Flipflops",
  "Ankle boots",
  "Knee-high boots",
  "Heeled boots",
  "Snow boots",
  "Sandals",
  "Heels",
  "Trainers",
];

const MAN_FOOTWEAR = [
  "Loafers",
  "Formal shoes",
  "Flipflops",
  "Boots",
  "Snow boots",
  "Sandals",
  "Trainers",
];

// Unisex is every type from both lists, like unisex clothing.
const UNISEX_FOOTWEAR = [...new Set([...WOMAN_FOOTWEAR, ...MAN_FOOTWEAR])];

const toOptions = (names) =>
  names.map((name) => ({ name, ...FOOTWEAR_DEFAULTS[name] }));

const footwearOptionsByGender = {
  woman: toOptions(WOMAN_FOOTWEAR),
  man: toOptions(MAN_FOOTWEAR),
  unisex: toOptions(UNISEX_FOOTWEAR),
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
  "sandals": ["sandal", "slides", "sliders", "espadrilles"],
  "heels": ["heel", "pumps", "stilettos", "stiletto", "court shoes", "slingbacks", "mules"],
  "trainers": ["trainer", "sneakers", "sneaker", "runners", "running shoes", "kicks"],
  "formal shoes": ["brogues", "oxfords", "derby", "derbies", "dress shoes"],
  "boots": ["boot", "chelsea", "work boots", "hiking boots"],
};

export const getFootwearOptions = (gender) =>
  footwearOptionsByGender[gender] || footwearOptionsByGender.unisex;

export default footwearOptionsByGender;

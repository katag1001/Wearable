// core/constants/footwearOptions.js
//
// Each gender's footwear types, with the tags that pre-fill
// page two of the Add Footwear form. Footwear is separate from clothing
// (its own Footwear collection) and has no role or category.
//
// The type names per gender come from shared/footwearByGender.json, which
// the footwear score matrices (shared/footwearMatrices.json) are checked
// against. Unisex is every type from the woman and man lists. A type added
// there needs an entry in FOOTWEAR_DEFAULTS below and a column in the
// matrices.

import footwearByGender from "../../shared/footwearByGender.json";


// Defaults per type, shared by every gender that has the type.
const FOOTWEAR_DEFAULTS = {
  "Ballerinas": {
    tags: ["Comfy casual", "Elevated everyday", "Smart casual", "Errands", "Business casual", "Brunch / lunch", "Day out", "Casual dinner", "Restaurant dinner", "Date night", "Drinks / night out", "Party", "Travel day", "City break"],
  },
  "Loafers": {
    tags: ["Comfy casual", "Elevated everyday", "Smart casual", "Errands", "Business casual", "Brunch / lunch", "Day out", "Casual dinner", "Restaurant dinner", "Date night", "Travel day", "City break"],
  },
  "Flipflops": {
    tags: ["Comfy casual", "Elevated everyday", "Errands", "Work from home", "Day out", "Travel day", "City break", "Beach / pool", "Lounge / home"],
  },
  "Ankle boots": {
    tags: ["Elevated everyday", "Smart casual", "Errands", "Business casual", "Brunch / lunch", "Day out", "Casual dinner", "Restaurant dinner", "Date night", "City break", "Outdoor / hiking"],
  },
  "Knee-high boots": {
    tags: ["Elevated everyday", "Errands", "Brunch / lunch", "Day out", "Casual dinner", "Restaurant dinner", "Date night", "Drinks / night out", "Party", "City break"],
  },
  "Heeled boots": {
    tags: ["Smart casual", "Business casual", "Brunch / lunch", "Casual dinner", "Restaurant dinner", "Date night", "Drinks / night out", "Party"],
  },
  "Snow boots": {
    tags: ["Comfy casual", "Elevated everyday", "Errands", "Day out", "Travel day", "City break", "Outdoor / hiking"],
  },
  "Sandals": {
    tags: ["Comfy casual", "Elevated everyday", "Errands", "Brunch / lunch", "Day out", "Casual dinner", "Restaurant dinner", "Date night", "Travel day", "City break", "Beach / pool"],
  },
  "Walking boots": {
    tags: ["Comfy casual", "Elevated everyday", "Errands", "Day out", "Travel day", "City break", "Outdoor / hiking"],
  },
  "Heeled sandals": {
    tags: ["Brunch / lunch", "Casual dinner", "Restaurant dinner", "Date night", "Drinks / night out", "Party", "Cocktail party", "Wedding guest", "Formal / black tie"],
  },
  "Heels": {
    tags: ["Smart casual", "Business casual", "Brunch / lunch", "Casual dinner", "Restaurant dinner", "Date night", "Drinks / night out", "Party", "Cocktail party", "Wedding guest", "Formal / black tie"],
  },
  "Smart trainers": {
    tags: ["Comfy casual", "Elevated everyday", "Smart casual", "Errands", "Business casual", "Brunch / lunch", "Day out", "Casual dinner", "Restaurant dinner", "Date night", "Travel day", "City break"],
  },
  "Casual trainers": {
    tags: ["Comfy casual", "Elevated everyday", "Errands", "Work from home", "Brunch / lunch", "Day out", "Travel day", "City break", "Gym / sport", "Outdoor / hiking", "Lounge / home"],
  },
  "Formal shoes": {
    tags: ["Smart casual", "Business casual", "Brunch / lunch", "Casual dinner", "Restaurant dinner", "Date night", "Drinks / night out", "Party", "Cocktail party", "Wedding guest", "Formal / black tie"],
  },
  "Boots": {
    tags: ["Comfy casual", "Elevated everyday", "Smart casual", "Errands", "Business casual", "Brunch / lunch", "Day out", "Casual dinner", "Restaurant dinner", "Date night", "Travel day", "City break", "Outdoor / hiking"],
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

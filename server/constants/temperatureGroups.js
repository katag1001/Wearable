// server/constants/temperatureGroups.js
//
// Preset temperature ranges (°C, daytime outdoor) for outfits, worked out
// from subtypes only - clothing items carry no temperature of their own.
// See services/presetTemperatureService.js for how these combine.
//
//  - Every top and bottom belongs to a group. Each top group + bottom group
//    pair has one base range (BASE_RANGES).
//  - Every onepiece has its own range (ONEPIECE_RANGES).
//  - Every outer has warmth points (OUTER_WARMTH_POINTS) that move an
//    outfit's range down to colder days.
//  - Every top group has layer points (TOP_LAYER_POINTS), used when a top
//    is an extra layer: a top over the innermost top, or a top worn with
//    a onepiece.

const TOP_GROUPS = {
  short: [
    "Short t-shirt", "Vest", "Croptop", "Off-the-shoulder top", "Linen shirt",
    "Bodysuit", "Fancy top", "Tunic",
  ],
  long: [
    "Long t-shirt", "Buttondown shirt", "Fancy blouse", "Short turtleneck",
    "Long turtleneck", "Turtleneck", "Waistcoat", "Light jumper", "Light cardigan", 
    "Floaty blouse",
  ],
  warm: [
    "Hoodie/sweatshirt", "Warm jumper", "Turtleneck jumper", "Warm cardigan",
  ],
};

const BOTTOM_GROUPS = {
  short: [
    "Mini skirt", "Shorts", "Casual shorts", "Denim shorts", "Linen shorts",
    "Cargo shorts", "Skater shorts", "Fancy Shorts",
  ],
  lightLong: [
    "Maxi skirt", "Knee-length skirt", "Midi-skirt", "Low waist midi",
    "Linen pants", "Cropped trousers",
  ],
  long: [
    "Jeans", "Flared jeans", "Wide leg jeans", "High waisted jeans",
    "Low waist jeans", "Skinny jeans", "Boyfriend jeans", "Tailored trousers",
    "Wide leg trousers", "Chinos", "Cargo pants", "Leather trousers",
    "Leggings", "Sweatpants", "Cropped jeans",
  ],
};

// [min, max] for a top group worn with a bottom group, no outer.
const BASE_RANGES = {
  short: { short: [22, 38], lightLong: [19, 34], long: [17, 28] },
  long: { short: [18, 27], lightLong: [15, 25], long: [13, 22] },
  warm: { short: [12, 19], lightLong: [9, 18], long: [5, 16] },
};

// [min, max] for a onepiece on its own, no top or outer.
const ONEPIECE_RANGES = {
  "Summer dress": [22, 36],
  "Playsuit": [21, 34],
  "Romper": [21, 34],
  "Casual dress": [18, 28],
  "Wedding guest dress": [18, 30],
  "Cocktail dress": [18, 28],
  "Evening dress": [18, 28],
  "Jumpsuit": [15, 26],
  "Work dress": [15, 25],
  "Overalls": [15, 25],
  "Winter dress": [6, 16],
};

// Degrees an outer moves an outfit's range down.
const OUTER_WARMTH_POINTS = {
  "Blazer": 2,
  "Denim jacket": 2,
  "Shacket": 3,
  "Rain coat": 3,
  "Leather jacket": 3,
  "Jacket": 4,
  "Poncho": 4,
  "Fleece": 3,
  "Trench coat": 4,
  "Duffle coat": 7,
  "Winter Coat": 9,
  "Fur coat": 8,
  "Puffer coat": 11,
};

// The coldest an outfit can ever go, however many tops are layered up.
// The outfit's minimum is never set below this (before the preference
// shift). Outfits with two outers have no floor.
//
// With no outer at all - below this you need a coat:
const NO_OUTER_MIN_TEMP = 14;

// With exactly one outer:
const OUTER_MIN_TEMPS = {
  "Blazer": 12,
  "Denim jacket": 10,
  "Shacket": 11,
  "Leather jacket": 9,
  "Rain coat": 8,
  "Jacket": 10,
  "Poncho": 12,
  "Fleece": 10,
  "Trench coat": 6,
  "Duffle coat": 0,
  "Fur coat": -5,
  "Winter Coat": -6,
  "Puffer coat": -10,
};

// Degrees a top moves the range down when it's an extra layer: a top worn
// over the innermost top (which sets the base), or any top worn with a
// onepiece.
const TOP_LAYER_POINTS = { short: 1, long: 4, warm: 11, };

// A long/warm top worn over a onepiece (a cardigan over a dress) is for
// days colder than the onepiece suits on its own, so the maximum is capped
// this many degrees above the onepiece's own minimum.
const OUTER_LAYER_OVERLAP = 4;

// The warmest day an outfit with outers is still comfortable on is this
// minus the outers' total warmth points - e.g. 23° with a blazer (2),
// 14° with a puffer coat (11). Heavier outers are too warm sooner,
// whatever is underneath.
const OUTER_CEILING_BASE = 25;

// Shift for the user's temperature preference ("Do you generally feel too
// cold or too hot?"), applied to both ends of the range before it's saved
// on the match - the saved min_temp/max_temp already include it. Feeling
// the cold means needing warmer days.
const TEMPERATURE_PREFERENCE_SHIFT = { cold: 2, normal: 0, hot: -2 };

// Final cap: any outfit with a bottom from the "long" group is never saved
// with a maximum above this. Applied after everything else, including the
// preference shift - the rest of the calculation is unchanged.
const LONG_BOTTOM_MAX_TEMP = 25;

// The same bounds as the temperature sliders.
const TEMPERATURE_LIMITS = [-20, 50];

module.exports = {
  TOP_GROUPS,
  BOTTOM_GROUPS,
  BASE_RANGES,
  ONEPIECE_RANGES,
  OUTER_WARMTH_POINTS,
  NO_OUTER_MIN_TEMP,
  OUTER_MIN_TEMPS,
  TOP_LAYER_POINTS,
  OUTER_LAYER_OVERLAP,
  OUTER_CEILING_BASE,
  TEMPERATURE_PREFERENCE_SHIFT,
  LONG_BOTTOM_MAX_TEMP,
  TEMPERATURE_LIMITS,
};

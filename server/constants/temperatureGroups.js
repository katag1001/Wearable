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
    "Bodysuit", "Fancy top", "Party top", "Tunic", "Waistcoat",
  ],
  long: [
    "Long t-shirt", "Buttondown shirt", "Fancy blouse", "Short turtleneck",
    "Long turtleneck", "Turtleneck", "Light jumper", "Light cardigan",
    "Floaty blouse",
  ],
  warm: [
    "Hoodie/sweatshirt", "Warm jumper", "Turtleneck jumper", "Warm cardigan",
  ],
};

const BOTTOM_GROUPS = {
  short: [
    "Mini skirt", "Shorts", "Casual shorts", "Denim shorts", "Linen shorts",
    "Cargo shorts", "Skater shorts", "Fancy Shorts", "Maxi skirt",
  ],
  lightLong: [
    "Smart skirt", "Midi-skirt",
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
  long: { short: [17, 23], lightLong: [15, 22], long: [13, 22] },
  warm: { short: [15, 22], lightLong: [9, 18], long: [5, 16] },
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
  "Spring coat": 4,
  "Short jacket": 3,
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
// shift). With two outers, the lower of their floors - the warmer coat's.
//
// With no outer at all - below this you need a coat:
const NO_OUTER_MIN_TEMP = 14;

// With one outer (two: the lower of the two):
const OUTER_MIN_TEMPS = {
  "Blazer": 12,
  "Denim jacket": 10,
  "Shacket": 11,
  "Leather jacket": 9,
  "Rain coat": 8,
  "Spring coat": 10,
  "Short jacket": 11,
  "Poncho": 12,
  "Fleece": 10,
  "Trench coat": 6,
  "Duffle coat": 0,
  "Fur coat": -5,
  "Winter Coat": -6,
  "Puffer coat": -10,
};

// Any outfit with a skirt or dress is never below this either - it's the bare-legs range; tights take it
// shared/tights.json's shift colder (7 -> 5).
const SKIRT_DRESS_MIN_TEMP = 7;

const SKIRT_DRESS_SUBTYPES = [
  "Mini skirt", "Maxi skirt", "Smart skirt", "Midi-skirt",
  "Summer dress", "Casual dress", "Wedding guest dress", "Cocktail dress",
  "Evening dress", "Work dress", "Winter dress",
];

// Degrees a top moves the range down when it's an extra layer over the
// innermost top (which sets the base). A warm top over a summer top takes
// the outfit from the summer rows to the jumper rows, hence 11; over a
// long or warm top it adds much less (WARM_OVER_LONG_POINTS).
const TOP_LAYER_POINTS = { short: 1, long: 4, warm: 11 };
const WARM_OVER_LONG_POINTS = 4;

// The same, for a top worn with a onepiece (every top is a layer then).
const ONEPIECE_LAYER_POINTS = { short: 1, long: 4, warm: 5 };

// Tops only ever worn over another top: with a second top, never the
// innermost one, whatever their group.
const OVER_ONLY_TOPS = ["Waistcoat"];

// Layered tops: an outfit with a top worn as an extra layer (over the
// innermost top, or any top worn with a onepiece) never has a maximum above
// the cap for its warmest layer. Tops listed here are jumpers/cardigans;
// any other top worn as a layer (a shirt over a t-shirt, a waistcoat, a
// blouse over a dress) uses the "other" cap.
const LAYER_KINDS = {
  warmJumper: ["Hoodie/sweatshirt", "Warm jumper", "Turtleneck jumper", "Warm cardigan"],
  lightJumper: ["Light jumper", "Light cardigan"],
};

const LAYERED_MAX_TEMPS = { warmJumper: 18, lightJumper: 24, other: 28 };

// The warmest day an outfit with outers is still comfortable on is this
// minus the outers' total warmth points - e.g. 23° with a blazer (2),
// 14° with a puffer coat (11). Heavier outers are too warm sooner,
// whatever is underneath.
const OUTER_CEILING_BASE = 25;

// An outfit with outers always covers at least this many degrees: after the
// ceiling above, the minimum is lowered until the range is this wide (the
// outer's OUTER_MIN_TEMPS floor still applies). Without it a light outfit
// under a jacket - a vest and skirt, say - is squeezed into a few degrees,
// because the ceiling pulls its maximum right down while its minimum only
// moves by the outer's points.
const OUTER_MIN_SPAN = 7;

// Every outfit covers at least this many degrees. Applied last, before the
// preference shift: a narrower range is widened upwards from its minimum.
// Narrow ranges come from the floors above (a warm outfit lifted to
// NO_OUTER_MIN_TEMP or an outer's minimum), so widening upwards keeps the
// floor exact - a warm jumper outfit floored at 14 becomes 14-17, not 14-14.
const MIN_SPAN = 3;

// Shift for the user's temperature preference ("Do you generally feel too
// cold or too hot?"), applied to both ends of the range before it's saved
// on the match - the saved min_temp/max_temp already include it. Feeling
// the cold means needing warmer days.
const TEMPERATURE_PREFERENCE_SHIFT = { cold: 1, normal: 0, hot: -1 };

// Any outfit with a bottom from the "long" group never has a maximum above
// this. Applied with the layer caps, before the preference shift - so a
// "cold" user's saved maximum can be this + 1.
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
  SKIRT_DRESS_MIN_TEMP,
  SKIRT_DRESS_SUBTYPES,
  TOP_LAYER_POINTS,
  WARM_OVER_LONG_POINTS,
  ONEPIECE_LAYER_POINTS,
  OVER_ONLY_TOPS,
  LAYER_KINDS,
  LAYERED_MAX_TEMPS,
  OUTER_CEILING_BASE,
  OUTER_MIN_SPAN,
  MIN_SPAN,
  TEMPERATURE_PREFERENCE_SHIFT,
  LONG_BOTTOM_MAX_TEMP,
  TEMPERATURE_LIMITS,
};

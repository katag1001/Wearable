// server/constants/temperatureGroups.js
//
// Preset temperature ranges (°C, daytime outdoor) for outfits, worked out
// from subtypes and fabrics only - clothing items carry no temperature of
// their own. See services/presetTemperatureService.js for how these combine
// and context/temperature-ranges.md for the full walk-through.
//
//  - Every top and bottom has a warmth level, 1 (lightest) to 5 (warmest).
//    The warmest top and warmest bottom pick the base range (BASE_RANGES);
//    every other top takes off its LAYER_BONUS.
//  - Every onepiece has its own range (ONEPIECE_RANGES); every top worn
//    with it takes off ONEPIECE_LAYER_POINTS.
//  - Fabrics (shared/fabrics.json "warmth") nudge the range.
//  - Every outer has warmth points (OUTER_WARMTH_POINTS) that move the
//    range down to colder days.
//  - Floors and caps keep the result sensible.

// Warmth level of every top subtype.
const TOP_LEVELS = {
  1: [
    "Vest", "Croptop", "Off-the-shoulder top", "Halter/strappy top", "Tube top",
    "Knit vest/tank", "Short t-shirt", "Bodysuit", "Linen shirt", "Fancy top",
    "Party top", "Tunic", "Waistcoat",
  ],
  2: [
    "Long-sleeve t-shirt", "3/4 sleeve top", "Buttondown shirt", "Denim shirt",
    "Oversized shirt", "Fancy blouse", "Floaty blouse", "Peasant/boho blouse",
    "Short turtleneck",
  ],
  3: ["Fine-knit jumper", "Light cardigan", "Long turtleneck"],
  4: ["Thin turtleneck jumper", "Turtleneck"],
  5: ["Hoodie/sweatshirt", "Chunky knit jumper", "Thick turtleneck jumper", "Warm cardigan"],
};

// Warmth level of every bottom subtype.
const BOTTOM_LEVELS = {
  1: [
    "Mini skirt", "Shorts", "Casual shorts", "Denim shorts", "Linen shorts",
    "Cargo shorts", "Skater shorts", "Fancy Shorts",
  ],
  2: ["Floaty maxi skirt", "Fitted maxi skirt", "Linen pants", "Floaty trousers", "Cropped trousers"],
  3: ["Smart skirt", "Midi-skirt", "Winter mini skirt", "Cropped jeans", "Leggings"],
  4: [
    "Skinny jeans", "Slim jeans", "Straight leg jeans", "Tapered jeans", "Mom jeans",
    "Boyfriend jeans", "Relaxed jeans", "Wide leg jeans", "Baggy jeans", "Flared jeans",
    "Bootcut jeans", "Barrel jeans", "Tailored trousers", "Tailored wide leg trousers",
    "Flared trousers", "Chinos", "Cargo pants", "Sweatpants",
  ],
  5: ["Wool trousers", "Leather trousers", "Ski/snow pants"],
};

// [min, max] for the warmest top's level (rows) with the warmest bottom's
// level (columns), no outer. Level-5 jumpers are nearly always worn over
// something (REQUIRES_LAYERING), so that row assumes a thin top underneath.
const BASE_RANGES = {
  1: { 1: [22, 38], 2: [20, 35], 3: [18, 32], 4: [17, 28], 5: [14, 22] },
  2: { 1: [18, 26], 2: [17, 25], 3: [15, 23], 4: [13, 22], 5: [11, 19] },
  3: { 1: [16, 23], 2: [15, 22], 3: [13, 21], 4: [11, 20], 5: [9, 17] },
  4: { 1: [14, 21], 2: [12, 20], 3: [10, 19], 4: [8, 18], 5: [6, 15] },
  5: { 1: [14, 21], 2: [11, 19], 3: [9, 17], 4: [7, 17], 5: [5, 14] },
};

// The level used for an outfit with no top / no bottom.
const NO_TOP_LEVEL = 1;
const NO_BOTTOM_LEVEL = 4;

// Degrees every top other than the warmest takes off the range, by its own
// level: the warmest layer decides, anything with it adds a little.
const LAYER_BONUS = { 1: 1, 2: 2, 3: 3, 4: 3, 5: 4 };

// Degrees every top worn with a onepiece takes off the onepiece's range,
// by the top's level.
const ONEPIECE_LAYER_POINTS = { 1: 1, 2: 3, 3: 4, 4: 5, 5: 6 };

// Fabric: the "warmth" of each top's, bottom's and onepiece's fabric
// (shared/fabrics.json) is added up and moves the range down by the total
// (cool fabrics have negative warmth, so move it up) - never more than
// this many degrees either way. Outers' fabric isn't counted: their warmth
// points already describe it.
const FABRIC_SHIFT_LIMIT = 3;

// Subtypes whose level already assumes these fabrics, so those don't count
// again. Any other fabric on them still does.
const FABRIC_NAMED_SUBTYPES = {
  "Linen shirt": ["Linen"],
  "Linen pants": ["Linen"],
  "Linen shorts": ["Linen"],
  "Chunky knit jumper": ["Chunky knit", "Wool / felted"],
  "Thick turtleneck jumper": ["Chunky knit", "Wool / felted"],
  "Warm cardigan": ["Chunky knit", "Wool / felted"],
  "Wool trousers": ["Wool / felted", "Tweed / boucle"],
  "Leather trousers": ["Leather / faux leather"],
  "Winter mini skirt": ["Wool / felted", "Tweed / boucle", "Corduroy", "Leather / faux leather", "Suede"],
};

// [min, max] for a onepiece on its own, no top or outer.
const ONEPIECE_RANGES = {
  "Strappy summer dress": [22, 36],
  "Summer dress": [22, 36],
  "Maxi dress": [20, 34],
  "Buttondown dress": [22, 36],
  "Shirt dress": [22, 36],
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
  "Tailored blazer": 2,
  "Longline blazer": 2,
  "Denim jacket": 2,
  "Shacket": 3,
  "Rain coat": 3,
  "Leather jacket": 3,
  "Spring coat": 4,
  "Knit coat": 4,
  "Cropped jacket": 3,
  "Bomber": 3,
  "Gilet": 3,
  "Poncho": 4,
  "Fleece": 3,
  "Classic trench": 4,
  "Long leather coat": 4,
  "Duffle coat": 7,
  "Wool coat": 9,
  "Parka": 9,
  "Fur coat": 8,
  "Puffer coat": 11,
  "Lightweight down jacket": 5,
  "Bolero": 1,
};

// The coldest an outfit can ever go, however many tops are layered up.
// The outfit's minimum is never set below this (before the preference
// shift). With two outers, the lower of their floors - the warmer coat's.
//
// With no outer at all - below this you need a coat:
const NO_OUTER_MIN_TEMP = 14;

// With one outer (two: the lower of the two):
const OUTER_MIN_TEMPS = {
  "Tailored blazer": 12,
  "Longline blazer": 12,
  "Denim jacket": 10,
  "Shacket": 11,
  "Leather jacket": 9,
  "Rain coat": 8,
  "Spring coat": 10,
  "Knit coat": 10,
  "Cropped jacket": 11,
  "Bomber": 11,
  "Gilet": 11,
  "Poncho": 12,
  "Fleece": 10,
  "Classic trench": 6,
  "Long leather coat": 6,
  "Duffle coat": 0,
  "Fur coat": -5,
  "Wool coat": -6,
  "Parka": -6,
  "Puffer coat": -10,
  "Lightweight down jacket": 5,
  "Bolero": 14,
};

// Any outfit with a skirt or dress is never below this either - it's the
// bare-legs range; tights take it shared/tights.json's shift colder (7 -> 5).
const SKIRT_DRESS_MIN_TEMP = 7;

const SKIRT_DRESS_SUBTYPES = [
  "Mini skirt", "Winter mini skirt", "Floaty maxi skirt", "Fitted maxi skirt",
  "Smart skirt", "Midi-skirt", "Strappy summer dress", "Summer dress",
  "Maxi dress", "Buttondown dress", "Shirt dress", "Casual dress", "Wedding guest dress", "Cocktail dress",
  "Evening dress", "Work dress", "Winter dress",
];

// Maximum caps. Each is applied before the preference shift; a minimum
// above a cap is lowered to it.
//
// Any outfit with layered tops (a second top, or a top with a onepiece):
const LAYERED_MAX_TEMP = 28;

// Any outfit with a bottom of this level:
const BOTTOM_MAX_TEMPS = { 4: 25, 5: 20 };

// Any outfit containing this subtype:
const SUBTYPE_MAX_TEMPS = {
  "Short turtleneck": 20,
  "Long turtleneck": 20,
  "Turtleneck": 20,
  "Thin turtleneck jumper": 20,
  "Thick turtleneck jumper": 20,
  "Ski/snow pants": 10,
};

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
// cold or too hot?", 1 = always too cold ... 5 = always too hot), applied
// to both ends of the range before it's saved on the match - the saved
// min_temp/max_temp already include it. Feeling the cold means needing
// warmer days.
const TEMPERATURE_PREFERENCE_SHIFT = { 1: 1, 2: 0.5, 3: 0, 4: -0.5, 5: -1 };

// Tops of this level or warmer let an outfit take tights
// (services/tightsService.js canWearTights) - as does any outer.
const TIGHTS_MIN_TOP_LEVEL = 4;

// The same bounds as the temperature sliders.
const TEMPERATURE_LIMITS = [-20, 50];

module.exports = {
  TOP_LEVELS,
  BOTTOM_LEVELS,
  BASE_RANGES,
  NO_TOP_LEVEL,
  NO_BOTTOM_LEVEL,
  LAYER_BONUS,
  ONEPIECE_LAYER_POINTS,
  FABRIC_SHIFT_LIMIT,
  FABRIC_NAMED_SUBTYPES,
  ONEPIECE_RANGES,
  OUTER_WARMTH_POINTS,
  NO_OUTER_MIN_TEMP,
  OUTER_MIN_TEMPS,
  SKIRT_DRESS_MIN_TEMP,
  SKIRT_DRESS_SUBTYPES,
  LAYERED_MAX_TEMP,
  BOTTOM_MAX_TEMPS,
  SUBTYPE_MAX_TEMPS,
  OUTER_CEILING_BASE,
  OUTER_MIN_SPAN,
  MIN_SPAN,
  TEMPERATURE_PREFERENCE_SHIFT,
  TIGHTS_MIN_TOP_LEVEL,
  TEMPERATURE_LIMITS,
};

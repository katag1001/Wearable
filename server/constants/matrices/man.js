// server/constants/matrices/man.js
//
// Baseline score (0-90) for every pair of man subtypes. Hand-edit the
// numbers directly.
//
//  - "subtypes" must stay in the same order as the "man" lists in
//    shared/subtypesByGender.json (tops, bottoms, onepieces, outers).
//  - scores[i][j] is the score between subtypes[i] and subtypes[j], and must
//    equal scores[j][i].
//  - null means the pair can never be matched. Some of these are fixed rules
//    (the same subtype twice, two bottoms, two onepieces, a bottom with a
//    onepiece) and the pair must stay null. Top+bottom, top+outer,
//    bottom+outer and onepiece+outer pairs must always have a score. Only
//    top+top, outer+outer and top+onepiece pairs are free to be null or a
//    score - that is where "do these match at all" is decided.
//  - 0 is a valid score (a poor match), not "never".
//
// server/constants/matchScoreBaseline.js checks all of this when the server
// starts and refuses to start if any rule is broken.

module.exports = {
  subtypes: [
    "Hoodie/sweatshirt",
    "Chunky knit jumper",
    "Warm cardigan",
    "Fine-knit jumper",
    "Buttondown shirt",
    "Oversized shirt",
    "Linen shirt",
    "Turtleneck",
    "Short t-shirt",
    "Long-sleeve t-shirt",
    "Vest",
    "Waistcoat",
    "Slim jeans",
    "Straight leg jeans",
    "Tapered jeans",
    "Relaxed jeans",
    "Bootcut jeans",
    "Leather trousers",
    "Tailored trousers",
    "Wool trousers",
    "Cargo pants",
    "Linen pants",
    "Sweatpants",
    "Ski/snow pants",
    "Chinos",
    "Shorts",
    "Denim shorts",
    "Linen shorts",
    "Cargo shorts",
    "Skater shorts",
    "Romper",
    "Overalls",
    "Tailored blazer",
    "Longline blazer",
    "Duffle coat",
    "Rain coat",
    "Classic trench",
    "Long leather coat",
    "Puffer coat",
    "Lightweight down jacket",
    "Wool coat",
    "Parka",
    "Spring coat",
    "Cropped jacket",
    "Bomber",
    "Denim jacket",
    "Shacket",
    "Fleece",
    "Leather jacket",
    "Knit coat",
    "Gilet",
  ],

  scores: [
    [null,null,null,null,null,null,null,  70,  85,  82,  80,null,  85,  88,  88,  90,  70,  59,  72,  72,  88,  44,  85,  85,  72,  80,  75,  60,  65,  86,null,null,  60,  60,  76,  85,  50,  40,  85,  85,  55,  55,  62,  62,  62,  80,  86,  75,  82,  62,  62], // Hoodie/sweatshirt
    [null,null,null,null,  50,  50,  74,  86,  82,  80,  72,null,  88,  88,  88,  88,  88,  78,  80,  86,  72,  24,  50,  75,  85,  45,  34,  34,  18,  18,null,null,  32,  32,  88,  78,  84,  74,  72,  72,  90,  90,  66,  66,  66,  65,  56,  58,  65,  66,  66], // Chunky knit jumper
    [null,null,null,null,  88,  88,  80,  86,  88,  86,  82,null,  85,  85,  85,  85,  85,  79,  80,  80,  58,  65,  52,  50,  85,  60,  46,  52,  30,  30,null,null,  54,  54,  85,  74,  80,  70,  58,  58,  84,  84,  74,  74,  74,  66,  64,  52,  79,  74,  74], // Warm cardigan
    [null,null,null,null,  45,  45,  45,  86,  85,  45,  54,null,  88,  88,  88,  88,  88,  74,  86,  86,  72,  72,  54,  70,  88,  68,  68,  60,  60,  46,null,  75,  84,  84,  76,  75,  60,  50,  75,  80,  70,  70,  74,  74,  74,  72,  75,  54,  78,  74,  74], // Fine-knit jumper
    [null,  50,  88,  45,null,null,null,  78,  82,  78,  80,  90,  88,  88,  88,  88,  88,  82,  90,  90,  65,  80,  24,  10,  90,  75,  70,  80,  60,  35,null,  78,  90,  90,  78,  44,  88,  78,  12,  40,  86,  86,  82,  82,  82,  54,  54,  16,  80,  82,  82], // Buttondown shirt
    [null,  50,  88,  45,null,null,null,  78,  82,  78,  80,  90,  88,  88,  88,  85,  88,  82,  90,  90,  65,  80,  24,  10,  90,  75,  70,  80,  60,  35,null,  78,  90,  90,  78,  44,  88,  78,  12,  40,  86,  86,  82,  82,  82,  54,  54,  16,  80,  82,  82], // Oversized shirt
    [null,  74,  80,  45,null,null,null,  52,  84,  74,  85,  88,  80,  80,  80,  80,  80,  52,  78,  50,  54,  90,  46,   5,  88,  84,  85,  90,  72,  65,null,  80,  82,  82,  34,  60,  60,  50,  22,  22,  28,  28,  66,  66,  66,  68,  66,  32,  72,  66,  66], // Linen shirt
    [  70,  86,  86,  86,  78,  78,  52,null,null,null,null,  85,  88,  88,  88,  88,  88,  86,  90,  90,  72,  70,  65,  80,  85,  40,  40,  46,  37,  37,null,  86,  90,  90,  86,  68,  90,  80,  82,  82,  90,  90,  74,  74,  74,  60,  78,  59,  86,  74,  74], // Turtleneck
    [  85,  82,  88,  85,  82,  82,  84,null,null,null,null,  70,  90,  90,  90,  90,  90,  72,  85,  70,  85,  78,  78,  55,  88,  86,  90,  86,  82,  68,null,  88,  88,  88,  28,  66,  84,  74,  55,  70,  14,  14,  85,  85,  85,  88,  88,  82,  90,  85,  85], // Short t-shirt
    [  82,  80,  86,  45,  78,  78,  74,null,null,null,null,  76,  85,  85,  85,  85,  85,  60,  58,  58,  84,  65,  82,  85,  82,  80,  80,  74,  68,  82,null,  88,  70,  70,  46,  82,  80,  70,  80,  80,  32,  32,  84,  84,  84,  74,  86,  85,  68,  84,  84], // Long-sleeve t-shirt
    [  80,  72,  82,  54,  80,  80,  85,null,null,null,null,null,  80,  80,  80,  80,  80,  40,  55,  40,  78,  85,  80,  30,  62,  85,  86,  85,  82,  82,null,  85,  75,  75,  27,  72,  26,  16,  45,  45,   5,   5,  60,  60,  60,  85,  80,  63,  85,  60,  60], // Vest
    [null,null,null,null,  90,  90,  88,  85,  70,  76,null,null,  80,  80,  80,  80,  80,  60,  90,  90,  45,  78,  29,   5,  85,  44,  44,  54,  39,  20,null,null,  84,  84,  61,  44,  84,  74,  17,  17,  62,  62,  62,  62,  62,  54,  59,  21,  68,  62,  62], // Waistcoat
    [  85,  88,  85,  88,  88,  88,  80,  88,  90,  85,  80,  80,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,  88,  85,  88,  84,  85,  75,  85,  85,  88,  88,  74,  74,  74,  72,  88,  80,  88,  74,  74], // Slim jeans
    [  88,  88,  85,  88,  88,  88,  80,  88,  90,  85,  80,  80,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,  85,  85,  88,  84,  85,  75,  85,  85,  88,  88,  74,  74,  74,  72,  88,  80,  88,  74,  74], // Straight leg jeans
    [  88,  88,  85,  88,  88,  88,  80,  88,  90,  85,  80,  80,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,  80,  85,  88,  84,  85,  75,  85,  85,  88,  88,  74,  74,  80,  72,  88,  80,  88,  74,  74], // Tapered jeans
    [  90,  88,  85,  88,  88,  85,  80,  88,  90,  85,  80,  80,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,  70,  72,  88,  84,  75,  75,  85,  85,  78,  88,  74,  74,  82,  72,  88,  80,  88,  74,  74], // Relaxed jeans
    [  70,  88,  85,  88,  88,  88,  80,  88,  90,  85,  80,  80,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,  85,  85,  88,  84,  85,  75,  70,  70,  88,  88,  74,  74,  65,  72,  88,  80,  85,  74,  74], // Bootcut jeans
    [  59,  78,  79,  74,  82,  82,  52,  86,  72,  60,  40,  60,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,  84,  84,  79,  68,  78,  68,  67,  67,  80,  80,  74,  74,  74,  60,  73,  59,  55,  74,  74], // Leather trousers
    [  72,  80,  80,  86,  90,  90,  78,  90,  85,  58,  55,  90,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,  90,  90,  80,  55,  90,  80,  40,  50,  90,  90,  62,  62,  62,  75,  65,  40,  82,  62,  62], // Tailored trousers
    [  72,  86,  80,  86,  90,  90,  50,  90,  70,  58,  40,  90,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,  90,  90,  88,  55,  90,  80,  50,  50,  90,  90,  62,  62,  62,  75,  65,  40,  82,  62,  62], // Wool trousers
    [  88,  72,  58,  72,  65,  65,  54,  72,  85,  84,  78,  45,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,  60,  60,  80,  80,  44,  34,  70,  70,  36,  36,  68,  68,  68,  85,  72,  70,  82,  68,  68], // Cargo pants
    [  44,  24,  65,  72,  80,  80,  90,  70,  78,  65,  85,  78,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,  75,  75,  24,  66,  70,  60,  18,  35,  22,  22,  66,  66,  66,  80,  75,  30,  71,  66,  66], // Linen pants
    [  85,  50,  52,  54,  24,  24,  46,  65,  78,  82,  80,  29,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,  45,  45,  36,  74,  40,  30,  85,  85,  16,  16,  62,  62,  62,  82,  58,  85,  75,  62,  62], // Sweatpants
    [  85,  75,  50,  70,  10,  10,   5,  80,  55,  85,  30,   5,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,   5,   5,  40,  70,  10,   5,  90,  90,  20,  85,  30,  30,  40,  20,  45,  88,  15,  30,  85], // Ski/snow pants
    [  72,  85,  85,  88,  90,  90,  88,  85,  88,  82,  62,  85,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,  90,  90,  85,  78,  88,  78,  60,  75,  78,  78,  74,  74,  74,  85,  84,  65,  82,  74,  74], // Chinos
    [  80,  45,  60,  68,  75,  75,  84,  40,  86,  80,  85,  44,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,  65,  65,  22,  66,  36,  26,  34,  45,   5,   5,  60,  60,  60,  74,  75,  65,  54,  60,  60], // Shorts
    [  75,  34,  46,  68,  70,  70,  85,  40,  90,  80,  86,  44,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,  44,  40,  22,  66,  36,  26,  34,  45,   5,   5,  60,  60,  60,  70,  66,  52,  75,  60,  60], // Denim shorts
    [  60,  34,  52,  60,  80,  80,  90,  46,  86,  74,  85,  54,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,  54,  54,  28,  66,  46,  36,  34,  35,  14,  14,  66,  66,  66,  74,  72,  46,  60,  66,  66], // Linen shorts
    [  65,  18,  30,  60,  60,  60,  72,  37,  82,  68,  82,  39,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,  34,  34,   5,  60,  26,  16,  24,  45,   5,   5,  54,  54,  54,  68,  56,  42,  51,  54,  54], // Cargo shorts
    [  86,  18,  30,  46,  35,  35,  65,  37,  68,  82,  82,  20,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,  20,  20,   5,  66,  16,   6,  30,  45,   5,   5,  54,  54,  54,  68,  50,  72,  51,  54,  54], // Skater shorts
    [null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,  72,  72,  28,  66,  72,  62,  34,  40,  14,  14,  66,  66,  66,  85,  80,  46,  80,  66,  66], // Romper
    [null,null,null,  75,  78,  78,  80,  86,  88,  88,  85,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,  44,  44,  30,  74,  44,  34,  42,  55,  22,  22,  68,  68,  68,  62,  70,  56,  67,  68,  68], // Overalls
    [  60,  32,  54,  84,  90,  90,  82,  90,  88,  70,  75,  84,  88,  85,  80,  70,  85,  84,  90,  90,  60,  75,  45,   5,  90,  65,  44,  54,  34,  20,  72,  44,null,null,null,null,  65,null,null,null,  90,  90,null,null,null,null,null,null,null,null,null], // Tailored blazer
    [  60,  32,  54,  84,  90,  90,  82,  90,  88,  70,  75,  84,  85,  85,  85,  72,  85,  84,  90,  90,  60,  75,  45,   5,  90,  65,  40,  54,  34,  20,  72,  44,null,null,null,null,  65,null,null,null,  90,  90,null,null,null,null,null,null,null,null,null], // Longline blazer
    [  76,  88,  85,  76,  78,  78,  34,  86,  28,  46,  27,  61,  88,  88,  88,  88,  88,  79,  80,  88,  80,  24,  36,  40,  85,  22,  22,  28,   5,   5,  28,  30,null,null,null,null,null,null,null,null,null,null,  78,  78,  78,  78,  80,  80,null,  78,  78], // Duffle coat
    [  85,  78,  74,  75,  44,  44,  60,  68,  66,  82,  72,  44,  84,  84,  84,  84,  84,  68,  55,  55,  80,  66,  74,  70,  78,  66,  66,  66,  60,  66,  66,  74,null,null,null,null,null,null,null,  70,null,null,  80,  80,  80,  80,  85,  90,null,  80,  80], // Rain coat
    [  50,  84,  80,  60,  88,  88,  60,  90,  84,  80,  26,  84,  85,  85,  85,  75,  85,  78,  90,  90,  44,  70,  40,  10,  88,  36,  36,  46,  26,  16,  72,  44,  65,  65,null,null,null,null,null,null,null,null,null,null,null,null,  76,  64,null,null,null], // Classic trench
    [  40,  74,  70,  50,  78,  78,  50,  80,  74,  70,  16,  74,  75,  75,  75,  75,  75,  68,  80,  80,  34,  60,  30,   5,  78,  26,  26,  36,  16,   6,  62,  34,null,null,null,null,null,null,null,null,null,null,null,null,null,null,  76,  64,null,null,null], // Long leather coat
    [  85,  72,  58,  75,  12,  12,  22,  82,  55,  80,  45,  17,  85,  85,  85,  85,  70,  67,  40,  50,  70,  18,  85,  90,  60,  34,  34,  34,  24,  30,  34,  42,null,null,null,null,null,null,null,null,null,null,null,null,null,null,  80,  74,null,null,null], // Puffer coat
    [  85,  72,  58,  80,  40,  40,  22,  82,  70,  80,  45,  17,  85,  85,  85,  85,  70,  67,  50,  50,  70,  35,  85,  90,  75,  45,  45,  35,  45,  45,  40,  55,null,null,null,  70,null,null,null,null,null,null,null,null,null,null,  80,  74,null,null,null], // Lightweight down jacket
    [  55,  90,  84,  70,  86,  86,  28,  90,  14,  32,   5,  62,  88,  88,  88,  78,  88,  80,  90,  90,  36,  22,  16,  20,  78,   5,   5,  14,   5,   5,  14,  22,  90,  90,null,null,null,null,null,null,null,null,null,null,null,null,  80,  70,null,null,null], // Wool coat
    [  55,  90,  84,  70,  86,  86,  28,  90,  14,  32,   5,  62,  88,  88,  88,  88,  88,  80,  90,  90,  36,  22,  16,  85,  78,   5,   5,  14,   5,   5,  14,  22,  90,  90,null,null,null,null,null,null,null,null,null,null,null,null,  80,  70,null,null,null], // Parka
    [  62,  66,  74,  74,  82,  82,  66,  74,  85,  84,  60,  62,  74,  74,  74,  74,  74,  74,  62,  62,  68,  66,  62,  30,  74,  60,  60,  66,  54,  54,  66,  68,null,null,  78,  80,null,null,null,null,null,null,null,null,null,null,  70,  75,null,null,null], // Spring coat
    [  62,  66,  74,  74,  82,  82,  66,  74,  85,  84,  60,  62,  74,  74,  74,  74,  74,  74,  62,  62,  68,  66,  62,  30,  74,  60,  60,  66,  54,  54,  66,  68,null,null,  78,  80,null,null,null,null,null,null,null,null,null,null,  70,  75,null,null,null], // Cropped jacket
    [  62,  66,  74,  74,  82,  82,  66,  74,  85,  84,  60,  62,  74,  74,  80,  82,  65,  74,  62,  62,  68,  66,  62,  40,  74,  60,  60,  66,  54,  54,  66,  68,null,null,  78,  80,null,null,null,null,null,null,null,null,null,null,  70,  75,null,null,null], // Bomber
    [  80,  65,  66,  72,  54,  54,  68,  60,  88,  74,  85,  54,  72,  72,  72,  72,  72,  60,  75,  75,  85,  80,  82,  20,  85,  74,  70,  74,  68,  68,  85,  62,null,null,  78,  80,null,null,null,null,null,null,null,null,null,null,  72,  70,null,null,null], // Denim jacket
    [  86,  56,  64,  75,  54,  54,  66,  78,  88,  86,  80,  59,  88,  88,  88,  88,  88,  73,  65,  65,  72,  75,  58,  45,  84,  75,  66,  72,  56,  50,  80,  70,null,null,  80,  85,  76,  76,  80,  80,  80,  80,  70,  70,  70,  72,null,null,  72,  70,  70], // Shacket
    [  75,  58,  52,  54,  16,  16,  32,  59,  82,  85,  63,  21,  80,  80,  80,  80,  80,  59,  40,  40,  70,  30,  85,  88,  65,  65,  52,  46,  42,  72,  46,  56,null,null,  80,  90,  64,  64,  74,  74,  70,  70,  75,  75,  75,  70,null,null,null,  75,  75], // Fleece
    [  82,  65,  79,  78,  80,  80,  72,  86,  90,  68,  85,  68,  88,  88,  88,  88,  85,  55,  82,  82,  82,  71,  75,  15,  82,  54,  75,  60,  51,  51,  80,  67,null,null,null,null,null,null,null,null,null,null,null,null,null,null,  72,null,null,null,null], // Leather jacket
    [  62,  66,  74,  74,  82,  82,  66,  74,  85,  84,  60,  62,  74,  74,  74,  74,  74,  74,  62,  62,  68,  66,  62,  30,  74,  60,  60,  66,  54,  54,  66,  68,null,null,  78,  80,null,null,null,null,null,null,null,null,null,null,  70,  75,null,null,null], // Knit coat
    [  62,  66,  74,  74,  82,  82,  66,  74,  85,  84,  60,  62,  74,  74,  74,  74,  74,  74,  62,  62,  68,  66,  62,  85,  74,  60,  60,  66,  54,  54,  66,  68,null,null,  78,  80,null,null,null,null,null,null,null,null,null,null,  70,  75,null,null,null], // Gilet
  ],
};

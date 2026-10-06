// server/constants/matrices/man.js
//
// Baseline score (0-100) for every pair of man subtypes. Hand-edit the
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
    "Warm jumper",
    "Warm cardigan",
    "Light jumper",
    "Buttondown shirt",
    "Linen shirt",
    "Turtleneck",
    "Short t-shirt",
    "Long t-shirt",
    "Vest",
    "Waistcoat",
    "Jeans",
    "Leather trousers",
    "Tailored trousers",
    "Cargo pants",
    "Linen pants",
    "Sweatpants",
    "Chinos",
    "Shorts",
    "Denim shorts",
    "Linen shorts",
    "Cargo shorts",
    "Skater shorts",
    "Romper",
    "Overalls",
    "Blazer",
    "Duffle coat",
    "Rain coat",
    "Trench coat",
    "Puffer coat",
    "Winter Coat",
    "Jacket",
    "Denim jacket",
    "Shacket",
    "Fleece",
    "Leather jacket",
  ],

  scores: [
    [null,null,null,null,null,null,  70,  85,  82,  80,null,  82,  59,  24,  86,  44,  92,  54,  80,  66,  60,  80,  86,null,null,  24,  76,  85,  24,  90,  16,  62,  85,  86,  70,  82], // Hoodie/sweatshirt
    [null,null,null,null,  94,  74,  86,  82,  80,  72,null,  92,  82,  80,  56,  24,  50,  85,  34,  34,  34,  18,  18,null,null,  32,  92,  66,  84,  86,  90,  66,  52,  56,  58,  65], // Warm jumper
    [null,null,null,null,  88,  78,  86,  88,  86,  82,null,  88,  79,  62,  58,  42,  52,  66,  46,  46,  52,  30,  30,null,null,  54,  85,  74,  62,  58,  84,  74,  66,  64,  52,  79], // Warm cardigan
    [null,null,null,null,  95,  82,  86,  85,  82,  54,null,  90,  74,  86,  62,  66,  54,  90,  54,  54,  60,  46,  46,null,null,  84,  76,  68,  88,  54,  70,  74,  68,  68,  54,  74], // Light jumper
    [null,  94,  88,  95,null,null,  78,  82,  78,  80,  95,  92,  82,  96,  44,  80,  24,  93,  44,  44,  54,  34,  24,null,null,  95,  56,  44,  92,  12,  86,  82,  54,  54,  16,  68], // Buttondown shirt
    [null,  74,  78,  82,null,null,  52,  84,  74,  86,  88,  66,  52,  60,  54,  94,  46,  88,  84,  84,  92,  60,  60,null,  80,  82,  34,  60,  60,  22,  28,  66,  68,  66,  32,  66], // Linen shirt
    [  70,  86,  86,  86,  78,  52,null,null,null,null,  85,  88,  74,  92,  67,  57,  59,  90,  40,  40,  46,  37,  37,null,  84,  90,  86,  68,  88,  67,  90,  74,  60,  73,  59,  86], // Turtleneck
    [  85,  82,  88,  85,  82,  84,null,null,null,null,  80,  95,  46,  72,  84,  74,  60,  84,  90,  92,  86,  68,  68,null,  92,  86,  28,  66,  84,  34,  14,  85,  90,  88,  82,  94], // Short t-shirt
    [  82,  80,  86,  82,  78,  74,null,null,null,null,  76,  90,  60,  54,  84,  74,  68,  82,  74,  74,  74,  68,  68,null,  88,  78,  46,  82,  54,  80,  32,  84,  74,  86,  85,  68], // Long t-shirt
    [  80,  72,  82,  54,  80,  86,null,null,null,null,null,  80,  40,  26,  71,  73,  77,  62,  85,  86,  74,  79,  82,null,  85,  34,  27,  72,  26,  45,   5,  60,  85,  71,  63,  88], // Vest
    [null,null,null,null,  95,  88,  85,  80,  76,null,null,  82,  60,  94,  49,  67,  29,  85,  44,  44,  54,  39,  29,null,null,  84,  61,  44,  84,  17,  62,  62,  54,  59,  21,  68], // Waistcoat
    [  82,  92,  88,  90,  92,  66,  88,  95,  90,  80,  82,null,null,null,null,null,null,null,null,null,null,null,null,null,null,  90,  90,  84,  90,  85,  88,  74,  62,  90,  62,  92], // Jeans
    [  59,  82,  79,  74,  82,  52,  74,  46,  60,  40,  60,null,null,null,null,null,null,null,null,null,null,null,null,null,null,  84,  79,  68,  68,  67,  68,  74,  60,  73,  59,  50], // Leather trousers
    [  24,  80,  62,  86,  96,  60,  92,  72,  54,  26,  94,null,null,null,null,null,null,null,null,null,null,null,null,null,null,  95,  70,  44,  92,  26,  92,  62,  54,  54,  24,  68], // Tailored trousers
    [  86,  56,  58,  62,  44,  54,  67,  84,  84,  71,  49,null,null,null,null,null,null,null,null,null,null,null,null,null,null,  44,  80,  86,  44,  86,  36,  68,  82,  86,  88,  82], // Cargo pants
    [  44,  24,  42,  66,  80,  94,  57,  74,  74,  73,  67,null,null,null,null,null,null,null,null,null,null,null,null,null,null,  62,  24,  66,  54,  18,  22,  66,  80,  62,  30,  71], // Linen pants
    [  92,  50,  52,  54,  24,  46,  59,  60,  68,  77,  29,null,null,null,null,null,null,null,null,null,null,null,null,null,null,  24,  36,  74,  24,  85,  16,  62,  78,  58,  85,  59], // Sweatpants
    [  54,  85,  66,  90,  93,  88,  90,  84,  82,  62,  85,null,null,null,null,null,null,null,null,null,null,null,null,null,null,  90,  88,  68,  88,  40,  56,  74,  85,  84,  46,  74], // Chinos
    [  80,  34,  46,  54,  44,  84,  40,  90,  74,  85,  44,null,null,null,null,null,null,null,null,null,null,null,null,null,null,  44,  22,  66,  36,  34,   5,  60,  74,  66,  52,  54], // Shorts
    [  66,  34,  46,  54,  44,  84,  40,  92,  74,  86,  44,null,null,null,null,null,null,null,null,null,null,null,null,null,null,  44,  22,  66,  36,  34,   5,  60,  62,  66,  52,  54], // Denim shorts
    [  60,  34,  52,  60,  54,  92,  46,  86,  74,  74,  54,null,null,null,null,null,null,null,null,null,null,null,null,null,null,  54,  28,  66,  46,  34,  14,  66,  74,  72,  46,  60], // Linen shorts
    [  80,  18,  30,  46,  34,  60,  37,  68,  68,  79,  39,null,null,null,null,null,null,null,null,null,null,null,null,null,null,  34,   5,  60,  26,  24,   5,  54,  68,  56,  42,  51], // Cargo shorts
    [  86,  18,  30,  46,  24,  60,  37,  68,  68,  82,  29,null,null,null,null,null,null,null,null,null,null,null,null,null,null,  24,   5,  66,  16,  30,   5,  54,  68,  50,  48,  51], // Skater shorts
    [null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,  54,  28,  66,  46,  34,  14,  66,  85,  80,  46,  60], // Romper
    [null,null,null,null,null,  80,  84,  92,  88,  85,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,  44,  30,  74,  44,  42,  22,  68,  62,  70,  56,  67], // Overalls
    [  24,  32,  54,  84,  95,  82,  90,  86,  78,  34,  84,  90,  84,  95,  44,  62,  24,  90,  44,  44,  54,  34,  24,  54,  44,null,null,null,  92,null,  92,null,null,null,null,null], // Blazer
    [  76,  92,  85,  76,  56,  34,  86,  28,  46,  27,  61,  90,  79,  70,  80,  24,  36,  88,  22,  22,  28,   5,   5,  28,  30,null,null,null,null,null,null,  78,  78,  80,  80,null], // Duffle coat
    [  85,  66,  74,  68,  44,  60,  68,  66,  82,  72,  44,  84,  68,  44,  86,  66,  74,  68,  66,  66,  66,  60,  66,  66,  74,null,null,null,null,null,null,  80,  80,  85,  90,null], // Rain coat
    [  24,  84,  62,  88,  92,  60,  88,  84,  54,  26,  84,  90,  68,  92,  44,  54,  24,  88,  36,  36,  46,  26,  16,  46,  44,  92,null,null,null,null,null,null,null,  76,  64,null], // Trench coat
    [  90,  86,  58,  54,  12,  22,  67,  34,  80,  45,  17,  85,  67,  26,  86,  18,  85,  40,  34,  34,  34,  24,  30,  34,  42,null,null,null,null,null,null,null,null,  80,  74,null], // Puffer coat
    [  16,  90,  84,  70,  86,  28,  90,  14,  32,   5,  62,  88,  68,  92,  36,  22,  16,  56,   5,   5,  14,   5,   5,  14,  22,  92,null,null,null,null,null,null,null,  80,  70,null], // Winter Coat
    [  62,  66,  74,  74,  82,  66,  74,  85,  84,  60,  62,  74,  74,  62,  68,  66,  62,  74,  60,  60,  66,  54,  54,  66,  68,null,  78,  80,null,null,null,null,null,  70,  75,null], // Jacket
    [  85,  52,  66,  68,  54,  68,  60,  90,  74,  85,  54,  62,  60,  54,  82,  80,  78,  85,  74,  62,  74,  68,  68,  85,  62,null,  78,  80,null,null,null,null,null,  72,  70,null], // Denim jacket
    [  86,  56,  64,  68,  54,  66,  73,  88,  86,  71,  59,  90,  73,  54,  86,  62,  58,  84,  66,  66,  72,  56,  50,  80,  70,null,  80,  85,  76,  80,  80,  70,  72,null,null,  72], // Shacket
    [  70,  58,  52,  54,  16,  32,  59,  82,  85,  63,  21,  62,  59,  24,  88,  30,  85,  46,  52,  52,  46,  42,  48,  46,  56,null,  80,  90,  64,  74,  70,  75,  70,null,null,null], // Fleece
    [  82,  65,  79,  74,  68,  66,  86,  94,  68,  88,  68,  92,  50,  68,  82,  71,  59,  74,  54,  54,  60,  51,  51,  60,  67,null,null,null,null,null,null,null,null,  72,null,null], // Leather jacket
  ],
};

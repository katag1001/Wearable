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
    [null,null,null,null,null,null,  70,  85,  82,  80,null,  88,  59,  72,  88,  44,  85,  72,  80,  75,  60,  65,  86,null,null,  60,  76,  85,  50,  85,  55,  62,  80,  86,  75,  82], // Hoodie/sweatshirt
    [null,null,null,null,  85,  74,  86,  82,  80,  72,null,  88,  78,  80,  72,  24,  50,  85,  45,  34,  34,  18,  18,null,null,  32,  88,  78,  84,  72,  90,  66,  65,  56,  58,  65], // Warm jumper
    [null,null,null,null,  88,  80,  86,  88,  86,  82,null,  85,  79,  80,  58,  65,  52,  85,  60,  46,  52,  30,  30,null,null,  54,  85,  74,  80,  58,  84,  74,  66,  64,  52,  79], // Warm cardigan
    [null,null,null,null,  90,  82,  86,  85,  82,  54,null,  88,  74,  86,  72,  72,  54,  88,  68,  68,  60,  60,  46,null,  75,  84,  76,  75,  85,  75,  70,  74,  72,  75,  54,  78], // Light jumper
    [null,  85,  88,  90,null,null,  78,  82,  78,  80,  90,  88,  82,  90,  65,  80,  24,  90,  75,  70,  80,  60,  35,null,  78,  90,  78,  44,  88,  12,  86,  82,  54,  54,  16,  80], // Buttondown shirt
    [null,  74,  80,  82,null,null,  52,  84,  74,  85,  88,  80,  52,  78,  54,  90,  46,  88,  84,  85,  90,  72,  65,null,  80,  82,  34,  60,  60,  22,  28,  66,  68,  66,  32,  72], // Linen shirt
    [  70,  86,  86,  86,  78,  52,null,null,null,null,  85,  88,  86,  90,  72,  70,  65,  85,  40,  40,  46,  37,  37,null,  86,  90,  86,  68,  90,  82,  90,  74,  60,  78,  59,  86], // Turtleneck
    [  85,  82,  88,  85,  82,  84,null,null,null,null,  70,  90,  72,  85,  85,  78,  78,  88,  86,  90,  86,  82,  68,null,  88,  88,  28,  66,  84,  55,  14,  85,  88,  88,  82,  90], // Short t-shirt
    [  82,  80,  86,  82,  78,  74,null,null,null,null,  76,  85,  60,  58,  84,  65,  82,  82,  80,  80,  74,  68,  82,null,  88,  70,  46,  82,  54,  80,  32,  84,  74,  86,  85,  68], // Long t-shirt
    [  80,  72,  82,  54,  80,  85,null,null,null,null,null,  80,  40,  55,  78,  85,  80,  62,  85,  86,  85,  82,  82,null,  85,  75,  27,  72,  26,  45,   5,  60,  85,  80,  63,  85], // Vest
    [null,null,null,null,  90,  88,  85,  70,  76,null,null,  80,  60,  90,  45,  78,  29,  85,  44,  44,  54,  39,  20,null,null,  84,  61,  44,  84,  17,  62,  62,  54,  59,  21,  68], // Waistcoat
    [  88,  88,  85,  88,  88,  80,  88,  90,  85,  80,  80,null,null,null,null,null,null,null,null,null,null,null,null,null,null,  85,  88,  84,  85,  85,  88,  74,  72,  88,  80,  88], // Jeans
    [  59,  78,  79,  74,  82,  52,  86,  72,  60,  40,  60,null,null,null,null,null,null,null,null,null,null,null,null,null,null,  84,  79,  68,  78,  67,  80,  74,  60,  73,  59,  55], // Leather trousers
    [  72,  80,  80,  86,  90,  78,  90,  85,  58,  55,  90,null,null,null,null,null,null,null,null,null,null,null,null,null,null,  90,  80,  55,  90,  40,  90,  62,  75,  65,  40,  82], // Tailored trousers
    [  88,  72,  58,  72,  65,  54,  72,  85,  84,  78,  45,null,null,null,null,null,null,null,null,null,null,null,null,null,null,  60,  80,  80,  44,  70,  36,  68,  85,  72,  70,  82], // Cargo pants
    [  44,  24,  65,  72,  80,  90,  70,  78,  65,  85,  78,null,null,null,null,null,null,null,null,null,null,null,null,null,null,  75,  24,  66,  70,  18,  22,  66,  80,  75,  30,  71], // Linen pants
    [  85,  50,  52,  54,  24,  46,  65,  78,  82,  80,  29,null,null,null,null,null,null,null,null,null,null,null,null,null,null,  45,  36,  74,  40,  85,  16,  62,  82,  58,  85,  75], // Sweatpants
    [  72,  85,  85,  88,  90,  88,  85,  88,  82,  62,  85,null,null,null,null,null,null,null,null,null,null,null,null,null,null,  90,  85,  78,  88,  60,  78,  74,  85,  84,  65,  82], // Chinos
    [  80,  45,  60,  68,  75,  84,  40,  86,  80,  85,  44,null,null,null,null,null,null,null,null,null,null,null,null,null,null,  65,  22,  66,  36,  34,   5,  60,  74,  75,  65,  54], // Shorts
    [  75,  34,  46,  68,  70,  85,  40,  90,  80,  86,  44,null,null,null,null,null,null,null,null,null,null,null,null,null,null,  44,  22,  66,  36,  34,   5,  60,  70,  66,  52,  75], // Denim shorts
    [  60,  34,  52,  60,  80,  90,  46,  86,  74,  85,  54,null,null,null,null,null,null,null,null,null,null,null,null,null,null,  54,  28,  66,  46,  34,  14,  66,  74,  72,  46,  60], // Linen shorts
    [  65,  18,  30,  60,  60,  72,  37,  82,  68,  82,  39,null,null,null,null,null,null,null,null,null,null,null,null,null,null,  34,   5,  60,  26,  24,   5,  54,  68,  56,  42,  51], // Cargo shorts
    [  86,  18,  30,  46,  35,  65,  37,  68,  82,  82,  20,null,null,null,null,null,null,null,null,null,null,null,null,null,null,  20,   5,  66,  16,  30,   5,  54,  68,  50,  72,  51], // Skater shorts
    [null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,  72,  28,  66,  72,  34,  14,  66,  85,  80,  46,  80], // Romper
    [null,null,null,  75,  78,  80,  86,  88,  88,  85,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,  44,  30,  74,  44,  42,  22,  68,  62,  70,  56,  67], // Overalls
    [  60,  32,  54,  84,  90,  82,  90,  88,  70,  75,  84,  85,  84,  90,  60,  75,  45,  90,  65,  44,  54,  34,  20,  72,  44,null,null,null,  88,null,  90,null,null,null,null,null], // Blazer
    [  76,  88,  85,  76,  78,  34,  86,  28,  46,  27,  61,  88,  79,  80,  80,  24,  36,  85,  22,  22,  28,   5,   5,  28,  30,null,null,null,null,null,null,  78,  78,  80,  80,null], // Duffle coat
    [  85,  78,  74,  75,  44,  60,  68,  66,  82,  72,  44,  84,  68,  55,  80,  66,  74,  78,  66,  66,  66,  60,  66,  66,  74,null,null,null,null,null,null,  80,  80,  85,  90,null], // Rain coat
    [  50,  84,  80,  85,  88,  60,  90,  84,  54,  26,  84,  85,  78,  90,  44,  70,  40,  88,  36,  36,  46,  26,  16,  72,  44,  88,null,null,null,null,null,null,null,  76,  64,null], // Trench coat
    [  85,  72,  58,  75,  12,  22,  82,  55,  80,  45,  17,  85,  67,  40,  70,  18,  85,  60,  34,  34,  34,  24,  30,  34,  42,null,null,null,null,null,null,null,null,  80,  74,null], // Puffer coat
    [  55,  90,  84,  70,  86,  28,  90,  14,  32,   5,  62,  88,  80,  90,  36,  22,  16,  78,   5,   5,  14,   5,   5,  14,  22,  90,null,null,null,null,null,null,null,  80,  70,null], // Winter Coat
    [  62,  66,  74,  74,  82,  66,  74,  85,  84,  60,  62,  74,  74,  62,  68,  66,  62,  74,  60,  60,  66,  54,  54,  66,  68,null,  78,  80,null,null,null,null,null,  70,  75,null], // Jacket
    [  80,  65,  66,  72,  54,  68,  60,  88,  74,  85,  54,  72,  60,  75,  85,  80,  82,  85,  74,  70,  74,  68,  68,  85,  62,null,  78,  80,null,null,null,null,null,  72,  70,null], // Denim jacket
    [  86,  56,  64,  75,  54,  66,  78,  88,  86,  80,  59,  88,  73,  65,  72,  75,  58,  84,  75,  66,  72,  56,  50,  80,  70,null,  80,  85,  76,  80,  80,  70,  72,null,null,  72], // Shacket
    [  75,  58,  52,  54,  16,  32,  59,  82,  85,  63,  21,  80,  59,  40,  70,  30,  85,  65,  65,  52,  46,  42,  72,  46,  56,null,  80,  90,  64,  74,  70,  75,  70,null,null,null], // Fleece
    [  82,  65,  79,  78,  80,  72,  86,  90,  68,  85,  68,  88,  55,  82,  82,  71,  75,  82,  54,  75,  60,  51,  51,  80,  67,null,null,null,null,null,null,null,null,  72,null,null], // Leather jacket
  ],
};

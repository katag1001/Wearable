// server/constants/matrices/woman.js
//
// Baseline score (0-100) for every pair of woman subtypes. Hand-edit the
// numbers directly.
//
//  - "subtypes" must stay in the same order as the "woman" lists in
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
    "Turtleneck jumper",
    "Warm cardigan",
    "Light jumper",
    "Light cardigan",
    "Buttondown shirt",
    "Linen shirt",
    "Floaty blouse",
    "Fancy blouse",
    "Fancy top",
    "Waistcoat",
    "Short turtleneck",
    "Long turtleneck",
    "Bodysuit",
    "Short t-shirt",
    "Long t-shirt",
    "Vest",
    "Croptop",
    "Off-the-shoulder top",
    "Tunic",
    "Mini skirt",
    "Maxi skirt",
    "Knee-length skirt",
    "Midi-skirt",
    "Low waist midi",
    "Cropped jeans",
    "Flared jeans",
    "Wide leg jeans",
    "High waisted jeans",
    "Low waist jeans",
    "Skinny jeans",
    "Boyfriend jeans",
    "Cropped trousers",
    "Leather trousers",
    "Wide leg trousers",
    "Tailored trousers",
    "Cargo pants",
    "Linen pants",
    "Leggings",
    "Sweatpants",
    "Fancy Shorts",
    "Casual shorts",
    "Denim shorts",
    "Linen shorts",
    "Cargo shorts",
    "Jumpsuit",
    "Playsuit",
    "Overalls",
    "Summer dress",
    "Wedding guest dress",
    "Evening dress",
    "Cocktail dress",
    "Winter dress",
    "Casual dress",
    "Work dress",
    "Blazer",
    "Poncho",
    "Duffle coat",
    "Rain coat",
    "Trench coat",
    "Fur coat",
    "Puffer coat",
    "Winter Coat",
    "Jacket",
    "Denim jacket",
    "Fleece",
    "Leather jacket",
  ],

  scores: [
    [null,null,null,null,null,null,null,null,null,null,null,null,  70,  70,null,  85,  82,  80,null,null,null,  59,  34,  34,  34,  44,  68,  52,  52,  62,  68,  73,  58,  34,  59,  24,  24,  86,  44,  88,  92,  46,  82,  66,  60,  80,null,null,  80,null,null,null,null,null,  68,null,  24,  58,  76,  85,  24,   5,  90,  16,  62,  85,  70,  82], // Hoodie/sweatshirt
    [null,null,null,null,null,null,  94,  74,null,null,null,null,  85,  84,  74,  82,  80,  72,null,null,null,  39,  74,  40,  82,  46,  52,  56,  56,  90,  66,  87,  88,  40,  82,  30,  80,  56,  24,  65,  50,  28,  34,  34,  34,  18,  40,  34,  42,  34,null,null,null,  74,  52,  37,  32,  56,  92,  66,  84,  34,  86,  90,  66,  52,  58,  65], // Warm jumper
    [null,null,null,null,null,  58,null,null,null,null,null,null,  62,  76,  52,  28,  46,  22,null,null,null,  34,  52,  86,  88,  52,  46,  66,  66,  88,  60,  60,  60,  62,  86,  90,  92,  54,  34,  46,  46,  34,  22,  22,  28,  14,  52,  34,  82,  34,null,null,null,  80,  46,  56,  56,  60,  88,  60,  90,  85,  62,  92,  66,  46,  54,  66], // Turtleneck jumper
    [null,null,null,null,null,null,  88,  78,  80,null,null,null,  86,  86,  82,  88,  86,  82,null,null,null,  57,  56,  60,  82,  66,  66,  64,  64,  86,  74,  79,  86,  60,  79,  50,  62,  58,  42,  67,  52,  52,  46,  46,  52,  30,  60,  52,  50,  52,null,null,null,  86,  82,  59,  54,  64,  85,  74,  62,  44,  58,  84,  74,  66,  52,  79], // Warm cardigan
    [null,null,null,null,null,  86,  95,  82,  78,  80,  68,  70,  84,  84,  74,  85,  82,  54,null,null,  74,  66,  74,  86,  85,  74,  68,  74,  74,  88,  68,  68,  68,  85,  74,  86,  86,  62,  66,  54,  54,  66,  54,  54,  60,  46,  74,  66,  62,  66,  62,  54,  62,  80,  68,  78,  84,  78,  76,  68,  88,  54,  54,  70,  74,  68,  54,  74], // Light jumper
    [null,null,  58,null,  86,null,  85,  80,  86,  84,  85,null,  85,  84,  85,  90,  84,  88,  80,null,  76,  74,  80,  86,  88,  80,  68,  74,  74,  85,  68,  68,  68,  84,  66,  84,  68,  62,  74,  44,  44,  74,  62,  62,  68,  54,  82,  82,  62,  88,  84,  78,  78,  72,  86,  86,  68,  68,  52,  58,  68,  40,  30,  46,  74,  68,  36,  74], // Light cardigan
    [null,  94,null,  88,  95,  85,null,null,null,null,null,  95,  76,  76,  78,null,null,  80,  72,null,null,  72,  78,  90,  88,  68,  54,  62,  62,  90,  54,  84,  85,  89,  82,  92,  96,  44,  80,  24,  24,  68,  44,  44,  54,  34,null,null,  44,  62,null,null,null,null,  54,  84,  95,  54,  56,  44,  92,  52,  12,  86,  82,  54,  16,  68], // Buttondown shirt
    [null,  74,null,  78,  82,  80,null,null,null,null,null,  88,null,null,null,null,null,  86,  82,null,null,  74,  84,  74,  74,  74,  68,  66,  66,  66,  60,  60,  66,  74,  52,  86,  60,  54,  94,  46,  46,  74,  68,  84,  92,  60,null,null,  80,  80,null,null,null,null,  74,  68,  82,  66,  34,  60,  60,  22,  22,  28,  66,  68,  32,  66], // Linen shirt
    [null,null,null,  80,  78,  86,null,null,null,null,null,  82,null,null,null,null,null,null,null,null,null,  79,  70,  74,  88,  80,  82,  56,  56,  85,  60,  65,  50,  74,  57,  86,  60,  44,  85,  41,  26,  74,  62,  80,  68,  44,null,null,null,null,null,null,null,null,null,null,  68,  50,  24,  50,  60,  12,   5,  28,  66,  80,  12,  71], // Floaty blouse
    [null,null,null,null,  80,  84,null,null,null,null,null,  85,null,null,null,null,null,null,null,null,null,  62,  74,  88,  90,  74,  54,  62,  62,  82,  54,  54,  54,  74,  85,  90,  90,  44,  62,  24,  24,  82,  44,  44,  54,  34,null,null,null,null,null,null,null,null,null,null,  90,  54,  46,  44,  74,  58,  12,  52,  62,  54,  16,  68], // Fancy blouse
    [null,null,null,null,  68,  85,null,null,null,null,null,  82,null,null,null,null,null,null,null,null,null,  82,  68,  74,  86,  68,  54,  62,  62,  84,  54,  54,  54,  74,  88,  88,  88,  44,  62,  24,  24,  84,  44,  44,  54,  34,null,null,null,null,null,null,null,null,null,null,  88,  54,  46,  44,  74,  88,  12,  52,  62,  54,  16,  84], // Fancy top
    [null,null,null,null,  70,null,  95,  88,  82,  85,  82,null,  82,  82,  82,  80,  76,  70,null,null,null,  62,  73,  84,  84,  68,  54,  67,  67,  84,  54,  54,  59,  84,  60,  90,  94,  49,  67,  24,  29,  68,  44,  44,  54,  39,null,null,null,  62,null,null,null,null,  54,  84,  84,  59,  61,  44,  84,  57,  17,  62,  62,  54,  21,  68], // Waistcoat
    [  70,  85,  62,  86,  84,  85,  76,null,null,null,null,  82,null,null,null,null,null,null,null,null,null,  74,  79,  84,  86,  74,  68,  79,  79,  86,  68,  68,  73,  84,  66,  88,  88,  67,  79,  54,  59,  74,  62,  62,  68,  59,  74,null,  67,  74,null,null,null,  66,  68,  86,  88,  73,  67,  68,  78,  45,  45,  56,  74,  68,  51,  84], // Short turtleneck
    [  70,  84,  76,  86,  84,  84,  76,null,null,null,null,  82,null,null,null,null,null,null,null,null,null,  66,  79,  84,  88,  74,  68,  79,  79,  86,  68,  68,  73,  84,  86,  88,  90,  67,  71,  54,  59,  66,  54,  54,  60,  51,  74,null,  84,  66,null,null,null,  86,  68,  88,  88,  80,  81,  68,  88,  86,  59,  88,  74,  68,  59,  84], // Long turtleneck
    [null,  74,  52,  82,  74,  85,  78,null,null,null,null,  82,null,null,null,null,null,null,null,null,null,  82,  79,  74,  85,  74,  68,  79,  79,  88,  68,  68,  73,  74,  86,  87,  85,  67,  79,  44,  49,  74,  62,  62,  68,  59,null,null,null,null,null,null,null,null,null,null,  86,  73,  57,  58,  68,  84,  35,  46,  74,  68,  41,  85], // Bodysuit
    [  85,  82,  28,  88,  85,  90,null,null,null,null,null,  80,null,null,null,null,null,null,null,null,null,  80,  80,  62,  80,  68,  86,  66,  88,  92,  66,  88,  90,  62,  46,  78,  72,  84,  74,  60,  60,  68,  88,  92,  86,  68,  84,  74,  92,  78,null,null,null,null,  82,null,  86,  66,  28,  66,  84,   5,  34,  14,  85,  90,  82,  94], // Short t-shirt
    [  82,  80,  46,  86,  82,  84,null,null,null,null,null,  76,null,null,null,null,null,null,null,null,null,  74,  68,  62,  62,  68,  74,  74,  74,  86,  74,  85,  86,  62,  60,  62,  54,  84,  74,  68,  68,  68,  74,  74,  74,  68,  62,  74,  88,  74,null,null,null,null,  74,null,  78,  74,  46,  82,  54,  22,  80,  32,  84,  74,  85,  68], // Long t-shirt
    [  80,  72,  22,  82,  54,  88,  80,  86,null,null,null,  70,null,null,null,null,null,null,null,null,null,  68,  57,  44,  44,  52,  74,  65,  65,  60,  66,  66,  71,  44,  40,  49,  26,  71,  73,  82,  77,  62,  85,  86,  74,  79,null,null,  85,null,null,null,null,null,null,null,  34,  71,  27,  72,  26,   5,  45,   5,  60,  85,  63,  88], // Vest
    [null,null,null,null,null,  80,  72,  82,null,null,null,null,null,null,null,null,null,null,null,null,null,  80,  82,  62,  62,  68,  74,  71,  86,  88,  66,  66,  71,  62,  52,  80,  46,  80,  85,  80,  65,  68,  80,  86,  80,  79,null,null,  82,null,null,null,null,null,null,null,  54,  71,  33,  66,  46,   9,  39,  14,  66,  84,  51,  85], // Croptop
    [null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,  74,  88,  74,  84,  80,  68,  66,  66,  85,  60,  60,  60,  74,  52,  74,  60,  54,  84,  36,  36,  74,  68,  85,  74,  60,null,null,null,null,null,null,null,null,null,null,  68,  60,  34,  50,  60,  22,  12,  28,  66,  78,  22,  66], // Off-the-shoulder top
    [null,null,null,null,  74,  76,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,  79,  70,  74,  74,  74,  68,  64,  64,  74,  68,  84,  64,  74,  71,  64,  68,  52,  82,  80,  44,  74,  62,  62,  74,  44,null,null,null,null,null,null,null,null,null,null,  68,  64,  42,  68,  68,  30,  30,  46,  74,  68,  36,  79], // Tunic
    [  59,  39,  34,  57,  66,  74,  72,  74,  79,  62,  82,  62,  74,  66,  82,  80,  74,  68,  80,  74,  79,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,  82,  71,  39,  66,  54,  19,  33,  22,  66,  85,  45,  90], // Mini skirt
    [  34,  74,  52,  56,  74,  80,  78,  84,  70,  74,  68,  73,  79,  79,  79,  80,  68,  57,  82,  88,  70,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,  68,  64,  42,  58,  68,  30,  20,  46,  74,  68,  26,  79], // Maxi skirt
    [  34,  40,  86,  60,  86,  86,  90,  74,  74,  88,  74,  84,  84,  84,  74,  62,  62,  44,  62,  74,  74,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,  88,  62,  62,  52,  84,  46,  22,  62,  68,  62,  26,  74], // Knee-length skirt
    [  34,  82,  88,  82,  85,  88,  88,  74,  88,  90,  86,  84,  86,  88,  85,  80,  62,  44,  62,  84,  74,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,  86,  62,  62,  52,  88,  46,  22,  86,  68,  62,  26,  82], // Midi-skirt
    [  44,  46,  52,  66,  74,  80,  68,  74,  80,  74,  68,  68,  74,  74,  74,  68,  68,  52,  68,  80,  74,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,  68,  68,  52,  58,  68,  40,  30,  46,  74,  68,  36,  74], // Low waist midi
    [  68,  52,  46,  66,  68,  68,  54,  68,  82,  54,  54,  54,  68,  68,  68,  86,  74,  74,  74,  68,  68,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,  54,  74,  46,  74,  54,  22,  52,  32,  74,  62,  60,  68], // Cropped jeans
    [  52,  56,  66,  64,  74,  74,  62,  66,  56,  62,  62,  67,  79,  79,  79,  66,  74,  65,  71,  66,  64,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,  62,  82,  56,  74,  62,  36,  50,  54,  74,  62,  52,  79], // Flared jeans
    [  52,  56,  66,  64,  74,  74,  62,  66,  56,  62,  62,  67,  79,  79,  79,  88,  74,  65,  86,  66,  64,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,  62,  64,  56,  74,  62,  36,  50,  54,  74,  62,  52,  79], // Wide leg jeans
    [  62,  90,  88,  86,  88,  85,  90,  66,  85,  82,  84,  84,  86,  86,  88,  92,  86,  60,  88,  85,  74,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,  88,  74,  76,  74,  90,  46,  60,  88,  74,  62,  62,  90], // High waisted jeans
    [  68,  66,  60,  74,  68,  68,  54,  60,  60,  54,  54,  54,  68,  68,  68,  66,  74,  66,  66,  60,  68,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,  54,  74,  60,  74,  54,  36,  66,  46,  74,  62,  68,  68], // Low waist jeans
    [  73,  87,  60,  79,  68,  68,  84,  60,  65,  54,  54,  54,  68,  68,  68,  88,  85,  66,  66,  60,  84,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,  86,  84,  86,  74,  88,  84,  84,  86,  74,  62,  73,  94], // Skinny jeans
    [  58,  88,  60,  86,  68,  68,  85,  66,  50,  54,  54,  59,  73,  73,  73,  90,  86,  71,  71,  60,  64,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,  54,  70,  85,  74,  54,  26,  56,  46,  74,  62,  58,  73], // Boyfriend jeans
    [  34,  40,  62,  60,  85,  84,  89,  74,  74,  74,  74,  84,  84,  84,  74,  62,  62,  44,  62,  74,  74,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,  90,  62,  62,  52,  88,  46,  22,  62,  68,  62,  26,  74], // Cropped trousers
    [  59,  82,  86,  79,  74,  66,  82,  52,  57,  85,  88,  60,  66,  86,  86,  46,  60,  40,  52,  52,  71,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,  84,  73,  79,  68,  68,  88,  67,  68,  74,  60,  59,  50], // Leather trousers
    [  24,  30,  90,  50,  86,  84,  92,  86,  86,  90,  88,  90,  88,  88,  87,  78,  62,  49,  80,  74,  64,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,  92,  52,  52,  52,  90,  36,  12,  88,  68,  62,  16,  79], // Wide leg trousers
    [  24,  80,  92,  62,  86,  68,  96,  60,  60,  90,  88,  94,  88,  90,  85,  72,  54,  26,  46,  60,  68,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,  95,  54,  70,  44,  92,  86,  26,  92,  62,  54,  24,  68], // Tailored trousers
    [  86,  56,  54,  58,  62,  62,  44,  54,  44,  44,  44,  49,  67,  67,  67,  84,  84,  71,  80,  54,  52,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,  44,  64,  80,  86,  44,  16,  86,  36,  68,  82,  88,  82], // Cargo pants
    [  44,  24,  34,  42,  66,  74,  80,  94,  85,  62,  62,  67,  79,  71,  79,  74,  74,  73,  85,  84,  82,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,  62,  62,  24,  66,  54,   5,  18,  22,  66,  80,  30,  71], // Linen pants
    [  88,  65,  46,  67,  54,  44,  24,  46,  41,  24,  24,  24,  54,  54,  44,  60,  68,  82,  80,  36,  80,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,  24,  82,  51,  84,  24,   9,  86,  16,  62,  80,  86,  54], // Leggings
    [  92,  50,  46,  52,  54,  44,  24,  46,  26,  24,  24,  29,  59,  59,  49,  60,  68,  77,  65,  36,  44,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,  24,  58,  36,  74,  24,   5,  85,  16,  62,  78,  85,  59], // Sweatpants
    [  46,  28,  34,  52,  66,  74,  68,  74,  74,  82,  84,  68,  74,  66,  74,  68,  68,  62,  68,  74,  74,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,  82,  60,  34,  60,  60,  22,  22,  28,  66,  68,  32,  66], // Fancy Shorts
    [  82,  34,  22,  46,  54,  62,  44,  68,  62,  44,  44,  44,  62,  54,  62,  88,  74,  85,  80,  68,  62,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,  44,  66,  22,  66,  36,   5,  34,   5,  60,  80,  52,  54], // Casual shorts
    [  66,  34,  22,  46,  54,  62,  44,  84,  80,  44,  44,  44,  62,  54,  62,  92,  74,  86,  86,  85,  62,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,  44,  66,  22,  66,  36,   5,  34,   5,  60,  62,  52,  54], // Denim shorts
    [  60,  34,  28,  52,  60,  68,  54,  92,  68,  54,  54,  54,  68,  60,  68,  86,  74,  74,  80,  74,  74,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,  54,  72,  28,  66,  46,   5,  34,  14,  66,  74,  46,  60], // Linen shorts
    [  80,  18,  14,  30,  46,  54,  34,  60,  44,  34,  34,  39,  59,  51,  59,  68,  68,  79,  79,  60,  44,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,  34,  50,   5,  60,  26,   5,  24,   5,  54,  68,  42,  51], // Cargo shorts
    [null,  40,  52,  60,  74,  82,null,null,null,null,null,null,  74,  74,null,  84,  62,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,  90,  62,  52,  52,  80,  52,  22,  58,  68,  82,  26,  85], // Jumpsuit
    [null,  34,  34,  52,  66,  82,null,null,null,null,null,null,null,null,null,  74,  74,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,  62,  66,  34,  66,  54,  14,  28,  22,  66,  88,  40,  66], // Playsuit
    [  80,  42,  82,  50,  62,  62,  44,  80,null,null,null,null,  67,  84,null,  92,  88,  85,  82,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,  44,  64,  30,  74,  44,   5,  42,  22,  68,  62,  56,  67], // Overalls
    [null,  34,  34,  52,  66,  88,  62,  80,null,null,null,  62,  74,  66,null,  78,  74,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,  62,  66,  34,  56,  54,  14,  18,  22,  82,  92,  30,  82], // Summer dress
    [null,null,null,null,  62,  84,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,  86,  44,  40,  34,  84,  58,   5,  52,  54,  44,   5,  62], // Wedding guest dress
    [null,null,null,null,  54,  78,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,  82,  34,  32,  24,  82,  92,   5,  84,  44,  34,   5,  54], // Evening dress
    [null,null,null,null,  62,  78,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,  88,  49,  45,  34,  84,  88,   7,  52,  54,  44,   9,  86], // Cocktail dress
    [null,  74,  80,  86,  80,  72,null,null,null,null,null,null,  66,  86,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,  60,  68,  88,  68,  68,  62,  80,  92,  74,  60,  54,  74], // Winter dress
    [  68,  52,  46,  82,  68,  86,  54,  74,null,null,null,  54,  68,  68,null,  82,  74,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,  54,  80,  46,  74,  54,  22,  52,  32,  74,  90,  60,  85], // Casual dress
    [null,  37,  56,  59,  78,  86,  84,  68,null,null,null,  84,  86,  88,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,  94,  59,  61,  44,  92,  57,  17,  90,  62,  54,  21,  68], // Work dress
    [  24,  32,  56,  54,  84,  68,  95,  82,  68,  90,  88,  84,  88,  88,  86,  86,  78,  34,  54,  68,  68,  82,  68,  88,  86,  68,  54,  62,  62,  88,  54,  86,  54,  90,  84,  92,  95,  44,  62,  24,  24,  82,  44,  44,  54,  34,  90,  62,  44,  62,  86,  82,  88,  60,  54,  94,null,null,null,null,  92,  85,null,  92,null,null,null,null], // Blazer
    [  58,  56,  60,  64,  78,  68,  54,  66,  50,  54,  54,  59,  73,  80,  73,  66,  74,  71,  71,  60,  64,  71,  64,  62,  62,  68,  74,  82,  64,  74,  74,  84,  70,  62,  73,  52,  54,  64,  62,  82,  58,  60,  66,  66,  72,  50,  62,  66,  64,  66,  44,  34,  49,  68,  80,  59,null,null,  60,  75,null,null,null,  66,null,null,null,null], // Poncho
    [  76,  92,  88,  85,  76,  52,  56,  34,  24,  46,  46,  61,  67,  81,  57,  28,  46,  27,  33,  34,  42,  39,  42,  62,  62,  52,  46,  56,  56,  76,  60,  86,  85,  62,  79,  52,  70,  80,  24,  51,  36,  34,  22,  22,  28,   5,  52,  34,  30,  34,  40,  32,  45,  88,  46,  61,null,  60,null,null,null,null,null,null,  78,  78,  80,null], // Duffle coat
    [  85,  66,  60,  74,  68,  58,  44,  60,  50,  44,  44,  44,  68,  68,  58,  66,  82,  72,  66,  50,  68,  66,  58,  52,  52,  58,  74,  74,  74,  74,  74,  74,  74,  52,  68,  52,  44,  86,  66,  84,  74,  60,  66,  66,  66,  60,  52,  66,  74,  56,  34,  24,  34,  68,  74,  44,null,  75,null,null,null,null,null,null,  80,  80,  90,null], // Rain coat
    [  24,  84,  90,  62,  88,  68,  92,  60,  60,  74,  74,  84,  78,  88,  68,  84,  54,  26,  46,  60,  68,  54,  68,  84,  88,  68,  54,  62,  62,  90,  54,  88,  54,  88,  68,  90,  92,  44,  54,  24,  24,  60,  36,  36,  46,  26,  80,  54,  44,  54,  84,  82,  84,  68,  54,  92,  92,null,null,null,null,null,null,null,null,null,  64,null], // Trench coat
    [   5,  34,  85,  44,  54,  40,  52,  22,  12,  58,  88,  57,  45,  86,  84,   5,  22,   5,   9,  22,  30,  19,  30,  46,  46,  40,  22,  36,  36,  46,  36,  84,  26,  46,  88,  36,  86,  16,   5,   9,   5,  22,   5,   5,   5,   5,  52,  14,   5,  14,  58,  92,  88,  62,  22,  57,  85,null,null,null,null,null,null,null,null,null,  45,null], // Fur coat
    [  90,  86,  62,  58,  54,  30,  12,  22,   5,  12,  12,  17,  45,  59,  35,  34,  80,  45,  39,  12,  30,  33,  20,  22,  22,  30,  52,  50,  50,  60,  66,  84,  56,  22,  67,  12,  26,  86,  18,  86,  85,  22,  34,  34,  34,  24,  22,  28,  42,  18,   5,   5,   7,  80,  52,  17,null,null,null,null,null,null,null,null,null,null,  74,null], // Puffer coat
    [  16,  90,  92,  84,  70,  46,  86,  28,  28,  52,  52,  62,  56,  88,  46,  14,  32,   5,  14,  28,  46,  22,  46,  62,  86,  46,  32,  54,  54,  88,  46,  86,  46,  62,  68,  88,  92,  36,  22,  16,  16,  28,   5,   5,  14,   5,  58,  22,  22,  22,  52,  84,  52,  92,  32,  90,  92,  66,null,null,null,null,null,null,null,null,  70,null], // Winter Coat
    [  62,  66,  66,  74,  74,  74,  82,  66,  66,  62,  62,  62,  74,  74,  74,  85,  84,  60,  66,  66,  74,  66,  74,  68,  68,  74,  74,  74,  74,  74,  74,  74,  74,  68,  74,  68,  62,  68,  66,  62,  62,  66,  60,  60,  66,  54,  68,  66,  68,  82,  54,  44,  54,  74,  74,  62,null,null,  78,  80,null,null,null,null,null,null,  75,null], // Jacket
    [  85,  52,  46,  66,  68,  68,  54,  68,  80,  54,  54,  54,  68,  68,  68,  90,  74,  85,  84,  78,  68,  85,  68,  62,  62,  68,  62,  62,  62,  62,  62,  62,  62,  62,  60,  62,  54,  82,  80,  80,  78,  68,  80,  62,  74,  68,  82,  88,  62,  92,  44,  34,  44,  60,  90,  54,null,null,  78,  80,null,null,null,null,null,null,  70,null], // Denim jacket
    [  70,  58,  54,  52,  54,  36,  16,  32,  12,  16,  16,  21,  51,  59,  41,  82,  85,  63,  51,  22,  36,  45,  26,  26,  26,  36,  60,  52,  52,  62,  68,  73,  58,  26,  59,  16,  24,  88,  30,  86,  85,  32,  52,  52,  46,  42,  26,  40,  56,  30,   5,   5,   9,  54,  60,  21,null,null,  80,  90,  64,  45,  74,  70,  75,  70,null,null], // Fleece
    [  82,  65,  66,  79,  74,  74,  68,  66,  71,  68,  84,  68,  84,  84,  85,  94,  68,  88,  85,  66,  79,  90,  79,  74,  82,  74,  68,  79,  79,  90,  68,  94,  73,  74,  50,  79,  68,  82,  71,  54,  59,  66,  54,  54,  60,  51,  85,  66,  67,  82,  62,  54,  86,  74,  85,  68,null,null,null,null,null,null,null,null,null,null,null,null], // Leather jacket
  ],
};

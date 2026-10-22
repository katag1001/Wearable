// server/constants/matrices/unisex.js
//
// Baseline score (0-90) for every pair of unisex subtypes. Hand-edit the
// numbers directly.
//
//  - "subtypes" must stay in the same order as the "unisex" lists in
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
    "Party top",
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
    "Smart skirt",
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
    "Chinos",
    "Fancy Shorts",
    "Casual shorts",
    "Denim shorts",
    "Linen shorts",
    "Cargo shorts",
    "Skater shorts",
    "Jumpsuit",
    "Playsuit",
    "Romper",
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
    "Shacket",
    "Fleece",
    "Leather jacket",
  ],

  scores: [
    [null,null,null,null,null,null,null,null,null,null,null,null,null,  70,  70,null,  85,  82,  80,null,null,null,  82,  45,  34,  50,  44,  82,  45,  50,  62,  68,  88,  78,  34,  59,  45,  72,  85,  44,  88,  85,  72,  46,  80,  75,  60,  65,  86,null,null,null,null,null,null,null,null,null,  68,null,  60,  35,  76,  85,  24,   5,  82,  16,  62,  80,  86,  70,  82], // Hoodie/sweatshirt
    [null,null,null,null,null,null,  85,  74,null,null,null,null,null,  85,  84,  74,  82,  80,  72,null,null,null,  85,  65,  55,  78,  40,  82,  56,  50,  88,  45,  88,  72,  40,  78,  55,  80,  56,  24,  82,  50,  85,  28,  34,  34,  34,  18,  18,  40,  34,null,null,  34,null,null,null,  74,  52,  37,  32,  30,  88,  78,  84,  34,  65,  90,  66,  52,  56,  58,  65], // Warm jumper
    [null,null,null,null,null,  45,null,null,null,null,null,null,null,  62,  76,  52,  82,  80,  72,null,null,null,  34,  70,  86,  88,  52,  46,  66,  85,  88,  60,  60,  60,  62,  86,  90,  90,  54,  34,  46,  46,  85,  34,  22,  22,  28,  14,  37,  52,  34,null,  72,  34,null,null,null,  80,  46,  56,  88,  82,  86,  60,  90,  85,  80,  90,  66,  46,  78,  54,  66], // Turtleneck jumper
    [null,null,null,null,null,null,  88,  78,null,null,null,null,null,  86,  86,  82,  88,  86,  82,null,null,null,  57,  60,  60,  82,  66,  66,  64,  64,  85,  74,  85,  85,  60,  79,  50,  80,  58,  42,  85,  52,  85,  52,  46,  46,  52,  30,  30,  75,  52,null,null,  52,null,null,null,  86,  82,  78,  54,  64,  85,  74,  62,  44,  58,  84,  74,  66,  64,  52,  79], // Warm cardigan
    [null,null,null,null,null,  45,  45,  45,  45,  45,  68,  50,null,  84,  45,  74,  85,  45,  54,null,null,  74,  66,  74,  86,  88,  74,  68,  74,  80,  88,  68,  68,  68,  85,  74,  86,  86,  62,  72,  54,  54,  88,  66,  68,  54,  60,  46,  46,  74,  66,null,  75,  66,  62,  54,  62,  80,  78,  78,  84,  78,  76,  75,  85,  54,  75,  70,  74,  68,  75,  54,  74], // Light jumper
    [null,null,  45,null,  45,null,  45,  45,  45,  45,  85,  62,null,  85,  45,  85,  90,  45,  88,  80,null,  76,  74,  80,  86,  88,  80,  80,  80,  74,  85,  68,  68,  68,  84,  66,  84,  80,  72,  82,  44,  44,  74,  74,  78,  78,  80,  54,  44,  82,  82,null,  62,  88,  84,  78,  78,  72,  86,  86,  68,  68,  52,  58,  68,  40,  30,  46,  74,  68,  68,  36,  74], // Light cardigan
    [null,  85,null,  88,  45,  45,null,null,null,null,null,null,  90,  76,  76,  78,  72,null,  80,  72,null,null,  72,  78,  90,  88,  68,  80,  78,  80,  88,  62,  82,  85,  89,  82,  88,  90,  44,  80,  70,  24,  90,  80,  75,  70,  54,  60,  35,null,null,null,  78,  62,null,null,null,null,  54,  84,  90,  54,  56,  44,  88,  52,  12,  86,  82,  54,  54,  16,  68], // Buttondown shirt
    [null,  74,null,  78,  45,  45,null,null,null,null,null,null,  88,null,null,null,  75,null,  85,  82,null,null,  74,  84,  74,  74,  74,  68,  66,  66,  66,  60,  60,  66,  74,  52,  86,  60,  54,  90,  46,  46,  88,  74,  68,  85,  90,  60,  65,null,null,null,  80,  80,null,null,null,null,  74,  68,  82,  66,  34,  60,  60,  22,  22,  28,  66,  68,  66,  32,  66], // Linen shirt
    [null,null,null,null,  45,  45,null,null,null,null,null,null,  82,null,null,null,null,null,null,null,null,null,  79,  70,  74,  88,  55,  75,  75,  75,  75,  75,  75,  75,  74,  57,  78,  88,  44,  85,  41,  26,  74,  74,  62,  80,  82,  44,  34,null,null,null,  70,null,null,null,null,null,null,null,  68,  50,  24,  50,  80,  12,   5,  70,  66,  80,  50,  12,  85], // Floaty blouse
    [null,null,null,null,  45,  45,null,null,null,null,null,null,  85,null,null,null,null,null,null,null,null,null,  62,  74,  88,  90,  74,  75,  75,  75,  75,  75,  75,  75,  74,  85,  90,  90,  72,  62,  24,  20,  68,  85,  44,  44,  54,  34,  24,null,null,null,null,null,null,null,null,null,null,null,  90,  54,  46,  44,  82,  50,  12,  75,  62,  54,  54,  16,  68], // Fancy blouse
    [null,null,null,null,  68,  85,null,null,null,null,null,null,  82,null,null,null,null,null,null,null,null,null,  82,  85,  74,  86,  68,  54,  62,  62,  85,  54,  54,  54,  74,  85,  88,  88,  44,  62,  24,  20,  68,  84,  44,  44,  54,  34,  24,null,null,null,null,null,null,null,null,null,null,null,  88,  54,  46,  44,  74,  50,  12,  52,  62,  54,  54,  16,  84], // Fancy top
    [null,null,null,null,  50,  62,null,null,null,null,null,null,  70,null,null,null,null,null,null,null,null,null,  90,  78,  62,  80,  74,  62,  80,  78,  88,  72,  82,  66,  62,  90,  82,  78,  70,  44,  40,  20,  54,  86,  44,  62,  40,  34,  30,null,null,null,null,null,null,null,null,null,null,null,  85,  40,  40,  34,  70,  80,  20,  55,  62,  66,  54,  10,  90], // Party top
    [null,null,null,null,null,null,  90,  88,  82,  85,  82,  70,null,  82,  82,  82,  70,  76,null,null,null,null,  62,  85,  84,  84,  68,  54,  67,  67,  80,  54,  54,  59,  84,  60,  90,  90,  45,  67,  24,  29,  85,  68,  44,  44,  54,  39,  20,null,null,null,null,  62,null,null,null,null,  54,  84,  84,  59,  61,  44,  84,  57,  17,  62,  62,  54,  59,  21,  68], // Waistcoat
    [  70,  85,  62,  86,  84,  85,  76,null,null,null,null,null,  82,null,null,null,null,null,null,null,null,null,  74,  85,  84,  86,  74,  68,  86,  88,  88,  68,  68,  82,  84,  66,  90,  88,  72,  70,  54,  59,  85,  74,  40,  40,  46,  37,  37,  74,null,null,  86,  74,null,null,null,  80,  68,  86,  88,  85,  80,  68,  86,  82,  80,  56,  74,  60,  78,  51,  86], // Short turtleneck
    [  70,  84,  76,  86,  45,  45,  76,null,null,null,null,null,  82,null,null,null,null,null,null,null,null,null,  66,  75,  84,  88,  74,  68,  79,  85,  88,  68,  68,  73,  84,  86,  90,  90,  72,  70,  54,  59,  85,  66,  40,  40,  46,  37,  37,  74,null,null,  86,  66,null,null,null,  86,  68,  88,  88,  85,  81,  68,  88,  86,  82,  88,  74,  60,  78,  59,  86], // Long turtleneck
    [null,  74,  52,  82,  74,  85,  78,null,null,null,null,null,  82,null,null,null,null,null,null,null,null,null,  82,  85,  74,  88,  82,  68,  86,  88,  88,  78,  68,  82,  74,  88,  90,  85,  80,  79,  44,  72,  74,  82,  62,  62,  75,  75,  49,null,null,null,  80,null,null,null,null,null,null,null,  88,  73,  57,  58,  80,  80,  70,  46,  74,  68,  73,  41,  85], // Bodysuit
    [  85,  82,  82,  88,  85,  90,  72,  75,null,null,null,null,  70,null,null,null,null,null,null,null,null,null,  80,  85,  62,  80,  82,  86,  82,  88,  90,  80,  88,  90,  62,  65,  85,  85,  85,  74,  60,  78,  88,  68,  86,  90,  86,  68,  68,  84,  74,null,  88,  78,null,null,null,null,  82,null,  88,  66,  28,  66,  84,   5,  34,  14,  85,  88,  88,  82,  90], // Short t-shirt
    [  82,  80,  80,  86,  45,  45,null,null,null,null,null,null,  76,null,null,null,null,null,null,null,null,null,  74,  50,  62,  62,  40,  74,  74,  50,  85,  50,  85,  72,  72,  60,  45,  54,  84,  65,  85,  68,  82,  68,  74,  74,  74,  68,  82,  62,  74,null,  88,  74,null,null,null,null,  74,null,  70,  74,  46,  82,  54,  22,  80,  32,  84,  74,  86,  85,  68], // Long t-shirt
    [  80,  72,  72,  82,  54,  88,  80,  85,null,null,null,null,null,null,null,null,null,null,null,null,null,null,  68,  90,  44,  44,  52,  75,  75,  75,  75,  75,  75,  75,  44,  40,  49,  55,  78,  85,  82,  77,  62,  62,  85,  86,  85,  82,  82,null,null,null,  85,null,null,null,null,null,null,null,  75,  71,  27,  72,  26,   5,  45,   5,  60,  85,  80,  63,  85], // Vest
    [null,null,null,null,null,  80,  72,  82,null,null,null,null,null,null,null,null,null,null,null,null,null,null,  72,  88,  62,  85,  85,  74,  82,  88,  88,  80,  66,  71,  62,  52,  85,  72,  82,  85,  80,  75,  68,  68,  80,  86,  80,  82,  79,null,null,null,  82,null,null,null,null,null,null,null,  75,  71,  33,  66,  46,   9,  39,  14,  66,  84,  71,  51,  85], // Croptop
    [null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,  74,  88,  74,  85,  80,  68,  66,  66,  85,  60,  82,  60,  74,  52,  85,  85,  40,  84,  36,  36,  74,  74,  68,  85,  74,  60,  50,null,null,null,null,null,null,null,null,null,null,null,  68,  60,  34,  50,  60,  22,  12,  28,  66,  78,  60,  22,  66], // Off-the-shoulder top
    [null,null,null,null,  74,  76,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,  79,  45,  74,  74,  40,  68,  64,  40,  74,  45,  88,  45,  82,  71,  40,  68,  52,  82,  88,  44,  74,  74,  62,  62,  74,  44,  44,null,null,null,null,null,null,null,null,null,null,null,  68,  64,  42,  68,  68,  30,  30,  46,  74,  68,  64,  36,  79], // Tunic
    [  82,  85,  34,  57,  66,  74,  72,  74,  79,  62,  82,  90,  62,  74,  66,  82,  80,  74,  68,  72,  74,  79,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,  85,  71,  65,  66,  72,  72,  33,  60,  66,  85,  71,  45,  90], // Mini skirt
    [  45,  65,  70,  60,  74,  80,  78,  84,  70,  74,  85,  78,  85,  85,  75,  85,  85,  50,  90,  88,  88,  45,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,  68,  64,  42,  58,  82,  30,  20,  75,  74,  75,  64,  26,  82], // Maxi skirt
    [  34,  55,  86,  60,  86,  86,  90,  74,  74,  88,  74,  62,  84,  84,  84,  74,  62,  62,  44,  62,  74,  74,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,  88,  62,  70,  52,  84,  46,  22,  75,  68,  72,  62,  26,  78], // Smart skirt
    [  50,  78,  88,  82,  88,  88,  88,  74,  88,  90,  86,  80,  84,  86,  88,  88,  80,  62,  44,  85,  85,  74,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,  86,  62,  72,  52,  88,  46,  22,  86,  68,  78,  62,  26,  82], // Midi-skirt
    [  44,  40,  52,  66,  74,  80,  68,  74,  55,  74,  68,  74,  68,  74,  74,  82,  82,  40,  52,  85,  80,  40,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,  68,  68,  52,  58,  68,  40,  30,  46,  74,  68,  68,  36,  74], // Low waist midi
    [  82,  82,  46,  66,  68,  80,  80,  68,  75,  75,  54,  62,  54,  68,  68,  68,  86,  74,  75,  74,  68,  68,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,  82,  74,  46,  74,  78,  22,  52,  32,  74,  62,  88,  60,  68], // Cropped jeans
    [  45,  56,  66,  64,  74,  80,  78,  66,  75,  75,  62,  80,  67,  86,  79,  86,  82,  74,  75,  82,  66,  64,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,  82,  55,  56,  74,  80,  36,  50,  54,  74,  62,  88,  52,  79], // Flared jeans
    [  50,  50,  85,  64,  80,  74,  80,  66,  75,  75,  62,  78,  67,  88,  85,  88,  88,  50,  75,  88,  66,  40,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,  80,  40,  56,  74,  80,  36,  45,  54,  74,  62,  88,  52,  79], // Wide leg jeans
    [  62,  88,  88,  85,  88,  85,  88,  66,  75,  75,  85,  88,  80,  88,  88,  88,  90,  85,  75,  88,  85,  74,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,  85,  74,  82,  74,  85,  75,  72,  88,  74,  62,  88,  62,  88], // High waisted jeans
    [  68,  45,  60,  74,  68,  68,  62,  60,  75,  75,  54,  72,  54,  68,  68,  78,  80,  50,  75,  80,  60,  45,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,  54,  74,  60,  74,  70,  36,  66,  46,  74,  62,  88,  68,  68], // Low waist jeans
    [  88,  88,  60,  85,  68,  68,  82,  60,  75,  75,  54,  82,  54,  68,  68,  68,  88,  85,  75,  66,  82,  88,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,  85,  88,  86,  74,  85,  82,  85,  86,  74,  62,  88,  78,  88], // Skinny jeans
    [  78,  72,  60,  85,  68,  68,  85,  66,  75,  75,  54,  66,  59,  82,  73,  82,  90,  72,  75,  71,  60,  45,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,  82,  40,  80,  74,  78,  26,  50,  46,  74,  62,  88,  58,  85], // Boyfriend jeans
    [  34,  40,  62,  60,  85,  84,  89,  74,  74,  74,  74,  62,  84,  84,  84,  74,  62,  72,  44,  62,  74,  82,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,  90,  78,  62,  52,  88,  46,  22,  62,  68,  62,  62,  26,  80], // Cropped trousers
    [  59,  78,  86,  79,  74,  66,  82,  52,  57,  85,  85,  90,  60,  66,  86,  88,  65,  60,  40,  52,  52,  71,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,  84,  73,  79,  68,  78,  55,  67,  68,  74,  60,  73,  59,  55], // Leather trousers
    [  45,  55,  90,  50,  86,  84,  88,  86,  78,  90,  88,  82,  90,  90,  90,  90,  85,  45,  49,  85,  85,  40,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,  90,  35,  52,  52,  90,  36,  45,  88,  68,  62,  52,  16,  79], // Wide leg trousers
    [  72,  80,  90,  80,  86,  80,  90,  60,  88,  90,  88,  78,  90,  88,  90,  85,  85,  54,  55,  72,  85,  68,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,  90,  54,  70,  44,  90,  86,  26,  90,  62,  75,  65,  24,  80], // Tailored trousers
    [  85,  56,  54,  58,  62,  72,  44,  54,  44,  72,  44,  70,  45,  72,  72,  80,  85,  84,  78,  82,  40,  52,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,  44,  64,  80,  80,  44,  16,  60,  36,  68,  82,  72,  70,  82], // Cargo pants
    [  44,  24,  34,  42,  72,  82,  80,  90,  85,  62,  62,  44,  67,  70,  70,  79,  74,  65,  85,  85,  84,  82,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,  72,  62,  24,  66,  54,   5,  18,  22,  66,  80,  75,  30,  71], // Linen pants
    [  88,  82,  46,  85,  54,  44,  70,  46,  41,  24,  24,  40,  24,  54,  54,  44,  60,  85,  82,  80,  36,  88,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,  24,  88,  70,  84,  60,   9,  86,  70,  62,  80,  73,  86,  54], // Leggings
    [  85,  50,  46,  52,  54,  44,  24,  46,  26,  20,  20,  20,  29,  59,  59,  72,  78,  68,  77,  75,  36,  44,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,  45,  58,  36,  74,  24,   5,  85,  16,  62,  80,  58,  85,  75], // Sweatpants
    [  72,  85,  85,  85,  88,  74,  90,  88,  74,  68,  68,  54,  85,  85,  85,  74,  88,  82,  62,  68,  74,  74,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,  90,  68,  85,  78,  88,  40,  60,  78,  74,  85,  84,  65,  82], // Chinos
    [  46,  28,  34,  52,  66,  74,  80,  74,  74,  85,  84,  86,  68,  74,  66,  82,  68,  68,  62,  68,  74,  74,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,  85,  60,  34,  60,  60,  22,  22,  28,  66,  68,  60,  32,  66], // Fancy Shorts
    [  80,  34,  22,  46,  68,  78,  75,  68,  62,  44,  44,  44,  44,  40,  40,  62,  86,  74,  85,  80,  68,  62,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,  65,  66,  22,  66,  36,   5,  34,   5,  60,  74,  75,  65,  54], // Casual shorts
    [  75,  34,  22,  46,  54,  78,  70,  85,  80,  44,  44,  62,  44,  40,  40,  62,  90,  74,  86,  86,  85,  62,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,  44,  66,  22,  66,  36,   5,  34,   5,  60,  70,  66,  52,  75], // Denim shorts
    [  60,  34,  28,  52,  60,  80,  54,  90,  82,  54,  54,  40,  54,  46,  46,  75,  86,  74,  85,  80,  74,  74,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,  54,  72,  28,  66,  46,   5,  34,  14,  66,  74,  72,  46,  60], // Linen shorts
    [  65,  18,  14,  30,  46,  54,  60,  60,  44,  34,  34,  34,  39,  37,  37,  75,  68,  68,  82,  82,  60,  44,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,  34,  50,   5,  60,  26,   5,  24,   5,  54,  68,  56,  42,  51], // Cargo shorts
    [  86,  18,  37,  30,  46,  44,  35,  65,  34,  24,  24,  30,  20,  37,  37,  49,  68,  82,  82,  79,  50,  44,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,  20,  50,   5,  66,  16,   5,  30,   5,  54,  68,  50,  72,  51], // Skater shorts
    [null,  40,  52,  75,  74,  82,null,null,null,null,null,null,null,  74,  74,null,  84,  62,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,  90,  62,  52,  52,  85,  52,  22,  78,  68,  82,  62,  26,  85], // Jumpsuit
    [null,  34,  34,  52,  66,  82,null,null,null,null,null,null,null,null,null,null,  74,  74,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,  78,  66,  34,  66,  75,  14,  28,  22,  66,  90,  66,  40,  85], // Playsuit
    [null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,  72,  66,  28,  66,  72,   5,  34,  14,  66,  85,  80,  46,  80], // Romper
    [null,null,  72,null,  75,  62,  78,  80,  70,null,null,null,null,  86,  86,  80,  88,  88,  85,  82,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,  44,  64,  30,  74,  44,   5,  42,  22,  68,  62,  70,  56,  67], // Overalls
    [null,  34,  34,  52,  66,  88,  62,  80,null,null,null,null,  62,  74,  66,null,  78,  74,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,  62,  66,  34,  56,  78,  14,  18,  22,  82,  90,  66,  30,  86], // Summer dress
    [null,null,null,null,  62,  84,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,  88,  44,  40,  34,  84,  80,   5,  75,  54,  35,  44,   5,  60], // Wedding guest dress
    [null,null,null,null,  54,  78,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,  85,  34,  32,  24,  82,  90,   5,  84,  44,  30,  34,   5,  70], // Evening dress
    [null,null,null,null,  62,  78,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,  88,  49,  45,  34,  84,  88,   7,  52,  54,  44,  49,   9,  78], // Cocktail dress
    [null,  74,  80,  86,  80,  72,null,null,null,null,null,null,null,  80,  86,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,  82,  68,  88,  68,  82,  82,  80,  90,  74,  60,  68,  54,  80], // Winter dress
    [  68,  52,  46,  82,  78,  86,  54,  74,null,null,null,null,  54,  68,  68,null,  82,  74,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,  80,  80,  78,  74,  80,  22,  52,  32,  74,  88,  80,  60,  86], // Casual dress
    [null,  37,  56,  78,  78,  86,  84,  68,null,null,null,null,  84,  86,  88,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,  90,  59,  61,  44,  88,  72,  17,  90,  62,  45,  59,  21,  62], // Work dress
    [  60,  32,  88,  54,  84,  68,  90,  82,  68,  90,  88,  85,  84,  88,  88,  88,  88,  70,  75,  75,  68,  68,  85,  68,  88,  86,  68,  82,  82,  80,  85,  54,  85,  82,  90,  84,  90,  90,  44,  72,  24,  45,  90,  85,  65,  44,  54,  34,  20,  90,  78,  72,  44,  62,  88,  85,  88,  82,  80,  90,null,null,null,null,  88,  85,null,  90,null,null,null,null,null], // Blazer
    [  35,  30,  82,  64,  78,  68,  54,  66,  50,  54,  54,  40,  59,  85,  85,  73,  66,  74,  71,  71,  60,  64,  71,  64,  62,  62,  68,  74,  55,  40,  74,  74,  88,  40,  78,  73,  35,  54,  64,  62,  88,  58,  68,  60,  66,  66,  72,  50,  50,  62,  66,  66,  64,  66,  44,  34,  49,  68,  80,  59,null,null,  60,  75,null,null,null,  66,null,null,null,null,null], // Poncho
    [  76,  88,  86,  85,  76,  52,  56,  34,  24,  46,  46,  40,  61,  80,  81,  57,  28,  46,  27,  33,  34,  42,  65,  42,  70,  72,  52,  46,  56,  56,  82,  60,  86,  80,  62,  79,  52,  70,  80,  24,  70,  36,  85,  34,  22,  22,  28,   5,   5,  52,  34,  28,  30,  34,  40,  32,  45,  88,  78,  61,null,  60,null,null,null,null,null,null,  78,  78,  80,  80,null], // Duffle coat
    [  85,  78,  60,  74,  75,  58,  44,  60,  50,  44,  44,  34,  44,  68,  68,  58,  66,  82,  72,  66,  50,  68,  66,  58,  52,  52,  58,  74,  74,  74,  74,  74,  74,  74,  52,  68,  52,  44,  80,  66,  84,  74,  78,  60,  66,  66,  66,  60,  66,  52,  66,  66,  74,  56,  34,  24,  34,  68,  74,  44,null,  75,null,null,null,null,null,null,  80,  80,  85,  90,null], // Rain coat
    [  24,  84,  90,  62,  85,  68,  88,  60,  80,  82,  74,  70,  84,  86,  88,  80,  84,  54,  26,  46,  60,  68,  72,  82,  84,  88,  68,  78,  80,  80,  85,  70,  85,  78,  88,  78,  90,  90,  44,  54,  60,  24,  88,  60,  36,  36,  46,  26,  16,  85,  75,  72,  44,  78,  84,  82,  84,  82,  80,  88,  88,null,null,null,null,null,null,null,null,null,  76,  64,null], // Trench coat
    [   5,  34,  85,  44,  54,  40,  52,  22,  12,  50,  50,  80,  57,  82,  86,  80,   5,  22,   5,   9,  22,  30,  72,  30,  46,  46,  40,  22,  36,  36,  75,  36,  82,  26,  46,  55,  36,  86,  16,   5,   9,   5,  40,  22,   5,   5,   5,   5,   5,  52,  14,   5,   5,  14,  80,  90,  88,  82,  22,  72,  85,null,null,null,null,null,null,null,null,null,null,  45,null], // Fur coat
    [  82,  65,  80,  58,  75,  30,  12,  22,   5,  12,  12,  20,  17,  80,  82,  70,  34,  80,  45,  39,  12,  30,  33,  20,  22,  22,  30,  52,  50,  45,  72,  66,  85,  50,  22,  67,  45,  26,  60,  18,  86,  85,  60,  22,  34,  34,  34,  24,  30,  22,  28,  34,  42,  18,   5,   5,   7,  80,  52,  17,null,null,null,null,null,null,null,null,null,null,  80,  74,null], // Puffer coat
    [  16,  90,  90,  84,  70,  46,  86,  28,  70,  75,  52,  55,  62,  56,  88,  46,  14,  32,   5,  14,  28,  46,  60,  75,  75,  86,  46,  32,  54,  54,  88,  46,  86,  46,  62,  68,  88,  90,  36,  22,  70,  16,  78,  28,   5,   5,  14,   5,   5,  78,  22,  14,  22,  22,  75,  84,  52,  90,  32,  90,  90,  66,null,null,null,null,null,null,null,null,  80,  70,null], // Winter Coat
    [  62,  66,  66,  74,  74,  74,  82,  66,  66,  62,  62,  62,  62,  74,  74,  74,  85,  84,  60,  66,  66,  74,  66,  74,  68,  68,  74,  74,  74,  74,  74,  74,  74,  74,  68,  74,  68,  62,  68,  66,  62,  62,  74,  66,  60,  60,  66,  54,  54,  68,  66,  66,  68,  82,  54,  44,  54,  74,  74,  62,null,null,  78,  80,null,null,null,null,null,null,  70,  75,null], // Jacket
    [  80,  52,  46,  66,  68,  68,  54,  68,  80,  54,  54,  66,  54,  60,  60,  68,  88,  74,  85,  84,  78,  68,  85,  75,  72,  78,  68,  62,  62,  62,  62,  62,  62,  62,  62,  60,  62,  75,  82,  80,  80,  80,  85,  68,  74,  70,  74,  68,  68,  82,  90,  85,  62,  90,  35,  30,  44,  60,  88,  45,null,null,  78,  80,null,null,null,null,null,null,  72,  70,null], // Denim jacket
    [  86,  56,  78,  64,  75,  68,  54,  66,  50,  54,  54,  54,  59,  78,  78,  73,  88,  86,  80,  71,  60,  64,  71,  64,  62,  62,  68,  88,  88,  88,  88,  88,  88,  88,  62,  73,  52,  65,  72,  75,  73,  58,  84,  60,  75,  66,  72,  56,  50,  62,  66,  80,  70,  66,  44,  34,  49,  68,  80,  59,null,null,  80,  85,  76,null,  80,  80,  70,  72,null,null,  72], // Shacket
    [  70,  58,  54,  52,  54,  36,  16,  32,  12,  16,  16,  10,  21,  51,  59,  41,  82,  85,  63,  51,  22,  36,  45,  26,  26,  26,  36,  60,  52,  52,  62,  68,  78,  58,  26,  59,  16,  24,  70,  30,  86,  85,  65,  32,  65,  52,  46,  42,  72,  26,  40,  46,  56,  30,   5,   5,   9,  54,  60,  21,null,null,  80,  90,  64,  45,  74,  70,  75,  70,null,null,null], // Fleece
    [  82,  65,  66,  79,  74,  74,  68,  66,  85,  68,  84,  90,  68,  86,  86,  85,  90,  68,  85,  85,  66,  79,  90,  82,  78,  82,  74,  68,  79,  79,  88,  68,  88,  85,  80,  55,  79,  80,  82,  71,  54,  75,  82,  66,  54,  75,  60,  51,  51,  85,  85,  80,  67,  86,  60,  70,  78,  80,  86,  62,null,null,null,null,null,null,null,null,null,null,  72,null,null], // Leather jacket
  ],
};

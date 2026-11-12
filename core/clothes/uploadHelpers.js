import { colorOptions, tagOptions } from "../constants/optionsBank.js";

// Clothing items have no temperature range of their own - a match's range
// is worked out on the server from its subtypes (context/temperature-ranges.md).
export const getInitialState = () => ({
  name: "",
  imageUrl: "",
  colors: [],
  // Footwear only - worked out from the colours (useWardrobeItemForm).
  styles: "plain",
  // Clothing only - picked by the user.
  pattern: "Plain",
  // Clothing only - shared/fabrics.json, "" until known.
  fabric: "",
  type: "",
  subtype: "",
  tags: [],
  lastWornDate: null
});

// "a name", "a name and a type", "a name, a type and an image" - for the
// "Please enter ..." validation message.
export const formatMissingFields = (fields) => {

  if (fields.length <= 1) {
    return fields.join("");
  }

  return `${fields.slice(0, -1).join(", ")} and ${fields[fields.length - 1]}`;
};

// Other words for a colour in colorOptions, so an item name using them
// still picks the colour up (e.g. "Beige trench" -> Cream).
const COLOR_NAME_ALIASES = {
  beige: "Cream",
  lavender: "Lilac",
  cobalt: "Bright Blue",
  "royal blue": "Bright Blue",
  "electric blue": "Bright Blue",
  red: "Bright Red",
  "deep red": "Dark Red",
  maroon: "Burgundy",
  oxblood: "Burgundy",
  pink: "Baby Pink",
  "light pink": "Baby Pink",
  "pale pink": "Baby Pink",
  "hot pink": "Bright Pink",
  yellow: "Bright Yellow",
  butter: "Butter Yellow",
  "pale yellow": "Butter Yellow",
};

export const detectFromName = (name) => {
  const lower = name.toLowerCase();


  const namedColors = colorOptions
    .filter(color =>
      lower.includes(
        color.name.toLowerCase()
      )
    )
    .map(color => color.name);

  // An alias inside a colour or a longer alias already found doesn't
  // count: "dark red" is Dark Red, not Dark Red and Bright Red, and "hot
  // pink" is Bright Pink, not Bright Pink and Baby Pink.
  const foundAliases = Object.keys(COLOR_NAME_ALIASES)
    .filter(alias => lower.includes(alias));

  const aliasedColors = foundAliases
    .filter(alias =>
      !namedColors.some(colorName => colorName.toLowerCase().includes(alias)) &&
      !foundAliases.some(other => other !== alias && other.includes(alias))
    )
    .map(alias => COLOR_NAME_ALIASES[alias]);

  const detectedColors = [
    ...new Set([...namedColors, ...aliasedColors])
  ];



  const detectedTags = tagOptions
    .filter(tag =>
      lower.includes(tag.name.toLowerCase())
    )
    .map(tag => tag.name);



  const style =
    detectedColors.length > 1
      ? "patterned"
      : "plain";

  return {
    detectedColors,
    detectedTags,
    style
  };
};


// Extra keywords for subtypes whose name alone doesn't cover how
// people actually type them (compound names, alternate spellings,
// or garments commonly called something else).
const SUBTYPE_SYNONYMS = {
  "hoodie/sweatshirt": ["hoodie", "sweatshirt", "hoody"],
  "chunky knit jumper": ["warm jumper", "sweater", "wool jumper", "cable knit", "chunky jumper"],
  "fine-knit jumper": ["sweater", "thin knit", "light knit", "light jumper", "fine knit"],
  "warm cardigan": ["wool cardigan", "chunky cardigan"],
  "light cardigan": ["thin cardigan", "light knit cardigan"],
  "buttondown shirt": [
    "button down shirt",
    "button-down shirt",
    "button up shirt",
    "oxford shirt",
  ],
  "denim shirt": ["chambray shirt", "chambray", "jean shirt"],
  "peasant/boho blouse": ["peasant blouse", "boho blouse", "peasant top", "boho top", "embroidered blouse"],
  "knit vest/tank": ["knitted vest", "knit vest", "crochet top", "knitted tank", "crochet vest"],
  "halter/strappy top": ["halter", "halterneck", "halter neck", "cami", "camisole", "strappy top"],
  "tube top": ["bandeau", "boob tube", "strapless top", "corset top"],
  "short t-shirt": ["tee", "tshirt", "t shirt", "crewneck", "crew neck"],
  "3/4 sleeve top": ["three quarter sleeve top", "3/4 sleeve", "three-quarter sleeve", "bracelet sleeve top", "elbow sleeve top"],
  "long-sleeve t-shirt": ["long tee", "long sleeve tee", "long sleeve tshirt", "long sleeve t-shirt", "long sleeve top", "long t-shirt"],
  "off-the-shoulder top": ["off the shoulder top", "bardot top"],
  "croptop": ["crop top"],
  "short turtleneck": ["polo neck"],
  "long turtleneck": ["polo neck", "roll neck"],
  "thick turtleneck jumper": ["polo neck jumper", "roll neck jumper", "turtleneck sweater", "chunky turtleneck"],
  "thin turtleneck jumper": ["fine knit turtleneck", "thin turtleneck", "turtleneck jumper"],
  "fancy top": ["dressy top", "smart top"],
  "party top": ["going out top", "night out top", "sparkly top", "sequin top", "glitter top"],
  "shacket": ["shirt jacket", "overshirt"],
  "oversized shirt": ["boyfriend shirt", "long shirt", "big shirt"],
  "floaty trousers": ["palazzo", "palazzo pants", "flowy trousers", "wide leg pants"],
  "tailored wide leg trousers": [
    "wideleg trousers",
    "wide-leg trousers",
    "wide leg trousers",
    "pleated trousers",
  ],
  "cargo pants": ["cargo trousers"],
  "linen pants": ["linen trousers"],
  "sweatpants": ["joggers", "track pants"],
  "chinos": ["chino"],
  "leggings": ["tights"],
  "midi-skirt": ["midi skirt"],
  "winter mini skirt": ["wool mini", "tweed mini", "wool skirt", "tweed skirt"],
  "floaty maxi skirt": ["maxi skirt", "tiered skirt", "flowy skirt"],
  "maxi dress": ["long dress", "floor length dress", "floor-length dress", "ankle length dress"],
  "fitted maxi skirt": ["maxi skirt", "pencil maxi", "straight skirt", "column skirt"],
  "straight leg jeans": ["straight jeans", "straight-leg jeans", "regular jeans", "jeans", "high waisted jeans", "high waist jeans", "low waist jeans", "low waisted jeans"],
  "mom jeans": ["mum jeans", "high waisted jeans", "high waist jeans", "tapered jeans"],
  "boyfriend jeans": ["slouchy jeans"],
  "baggy jeans": ["loose jeans", "oversized jeans", "skater jeans", "90s jeans"],
  "bootcut jeans": ["boot cut jeans", "boot-cut jeans"],
  "barrel jeans": ["horseshoe jeans", "barrel leg jeans", "curved jeans"],
  "slim jeans": ["slim fit jeans", "skinny jeans", "jeans"],
  "tapered jeans": ["slim tapered jeans", "carrot jeans"],
  "relaxed jeans": ["loose jeans", "baggy jeans", "relaxed fit jeans"],
  "wool trousers": ["wool pants", "tweed trousers", "flannel trousers", "winter trousers"],
  "ski/snow pants": ["ski pants", "ski trousers", "snow pants", "salopettes", "snow trousers"],
  "wide leg jeans": ["wide-leg jeans", "wideleg jeans", "wide jeans"],
  "flared trousers": ["flares", "flare trousers", "bootcut trousers", "velvet flares"],
  "jumpsuit": ["playsuit"],
  "playsuit": ["jumpsuit", "romper"],
  "romper": ["playsuit", "jumpsuit"],
  "wedding guest dress": ["wedding guest outfit"],
  "strappy summer dress": ["sundress", "slip dress", "strappy dress", "sun dress"],
  "buttondown dress": ["button down dress", "button-down dress", "button front dress", "buttoned dress"],
  "shirt dress": ["shirtdress", "shirt-dress", "collared dress"],
  "duffle coat": ["duffel coat", "duffel"],
  "rain coat": ["raincoat", "waterproof jacket"],
  "tailored blazer": ["blazer", "suit jacket", "fitted blazer"],
  "longline blazer": ["oversized blazer", "long blazer", "boyfriend blazer"],
  "classic trench": ["trench", "trench coat", "trenchcoat", "mac"],
  "long leather coat": ["leather coat", "pleather coat", "faux leather coat", "pleather trench", "leather trench"],
  "cropped jacket": ["short jacket"],
  "bomber": ["bomber jacket"],
  "knit coat": ["long cardigan", "cardigan coat", "knitted coat"],
  "gilet": ["body warmer", "puffer vest", "sleeveless jacket"],
  "fur coat": ["faux fur coat"],
  "puffer coat": ["puffer jacket", "down coat"],
  "lightweight down jacket": ["light puffer", "packable jacket", "down jacket", "quilted jacket", "light down jacket"],
  "bolero": ["shrug", "cropped cardigan", "evening shrug"],
  "wool coat": ["winter coat", "overcoat", "camel coat"],
  "parka": ["anorak"],
  "leather jacket": ["biker jacket"],
};

const STOPWORDS = new Set(["and", "the", "or", "a", "an", "of"]);

const buildKeywords = (option, synonyms) => {
  const optionName = option.name.toLowerCase();

  const baseKeywords = [
    optionName,
    optionName.replace(/[/-]/g, " "),
    optionName.replace(/[/\-\s]/g, ""),
    ...optionName.split(/[\s/-]+/),
  ];

  const extraKeywords = synonyms[optionName] || [];

  return [...new Set([...baseKeywords, ...extraKeywords])].filter(
    keyword => keyword.length > 2 && !STOPWORDS.has(keyword)
  );
};

// `synonyms` defaults to the clothing ones; footwear passes its own
// (FOOTWEAR_SYNONYMS in core/constants/footwearOptions.js).
export const suggestSubtypesFromName = (
  name,
  typeOptions,
  synonyms = SUBTYPE_SYNONYMS
) => {

  if (!name) return [];


  const text = name
    .toLowerCase()
    .trim();

  if (!text) return [];


  const matches = typeOptions.filter(option => {

    const keywords = buildKeywords(option, synonyms);

    return keywords.some(keyword =>
      text.includes(keyword) || keyword.includes(text)
    );

  });


  return matches.slice(0, 4);

};


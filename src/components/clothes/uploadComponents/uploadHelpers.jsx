import { colorOptions, tagOptions } from "../../../constants/optionsBank";

// Clothing items have no temperature range of their own - a match's range
// is worked out on the server from its subtypes (context/temperature-ranges.md).
export const getInitialState = () => ({
  name: "",
  imageUrl: "",
  colors: [],
  styles: "plain",
  type: "",
  subtype: "",
  spring: false,
  summer: false,
  autumn: false,
  winter: false,
  tags: [],
  lastWornDate: null
});

// Other words for a colour in colorOptions, so an item name using them
// still picks the colour up (e.g. "Beige trench" -> Cream).
const COLOR_NAME_ALIASES = {
  beige: "Cream",
  lavender: "Lilac",
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

  const aliasedColors = Object.entries(COLOR_NAME_ALIASES)
    .filter(([alias]) => lower.includes(alias))
    .map(([, colorName]) => colorName);

  const detectedColors = [
    ...new Set([...namedColors, ...aliasedColors])
  ];



  const detectedSeasons = {
    spring: lower.includes("spring"),
    summer: lower.includes("summer"),
    autumn:
      lower.includes("autumn") ||
      lower.includes("fall"),
    winter: lower.includes("winter")
  };



  const detectedTags = tagOptions.filter(tag =>
    lower.includes(tag.name.toLowerCase())
  );



  const style =
    detectedColors.length > 1
      ? "patterned"
      : "plain";

  return {
    detectedColors,
    detectedSeasons,
    detectedTags,
    style
  };
};


// Extra keywords for subtypes whose name alone doesn't cover how
// people actually type them (compound names, alternate spellings,
// or garments commonly called something else).
const SUBTYPE_SYNONYMS = {
  "hoodie/sweatshirt": ["hoodie", "sweatshirt", "hoody"],
  "warm jumper": ["sweater", "wool jumper", "chunky knit"],
  "light jumper": ["sweater", "thin knit", "light knit"],
  "warm cardigan": ["wool cardigan", "chunky cardigan"],
  "light cardigan": ["thin cardigan", "light knit cardigan"],
  "buttondown shirt": [
    "button down shirt",
    "button-down shirt",
    "button up shirt",
    "oxford shirt",
  ],
  "short t-shirt": ["tee", "tshirt", "t shirt", "crewneck", "crew neck"],
  "long t-shirt": ["long tee", "long sleeve tshirt", "long sleeve t-shirt"],
  "off-the-shoulder top": ["off the shoulder top", "bardot top"],
  "croptop": ["crop top"],
  "short turtleneck": ["polo neck"],
  "long turtleneck": ["polo neck", "roll neck"],
  "turtleneck jumper": ["polo neck jumper", "roll neck jumper", "turtleneck sweater"],
  "fancy top": ["party top", "going out top", "dressy top"],
  "shacket": ["shirt jacket"],
  "wide leg trousers": [
    "wideleg trousers",
    "wide-leg trousers",
    "wide leg pants",
  ],
  "cargo pants": ["cargo trousers"],
  "linen pants": ["linen trousers"],
  "sweatpants": ["joggers", "track pants"],
  "chinos": ["chino"],
  "leggings": ["tights"],
  "midi-skirt": ["midi skirt"],
  "low waist midi": ["low waisted midi skirt"],
  "low waist jeans": ["low waisted jeans"],
  "high waisted jeans": ["high waist jeans"],
  "boyfriend jeans": ["baggy jeans"],
  "wide leg jeans": ["wide-leg jeans", "wideleg jeans", "wide jeans"],
  "jumpsuit": ["playsuit"],
  "playsuit": ["jumpsuit", "romper"],
  "romper": ["playsuit", "jumpsuit"],
  "wedding guest dress": ["wedding guest outfit"],
  "duffle coat": ["duffel coat", "duffel"],
  "rain coat": ["raincoat", "waterproof jacket"],
  "trench coat": ["trenchcoat"],
  "fur coat": ["faux fur coat"],
  "puffer coat": ["puffer jacket", "down coat"],
  "winter coat": ["parka"],
  "leather jacket": ["biker jacket"],
};

const STOPWORDS = new Set(["and", "the", "or", "a", "an", "of"]);

const buildKeywords = (option) => {
  const optionName = option.name.toLowerCase();

  const baseKeywords = [
    optionName,
    optionName.replace(/[/-]/g, " "),
    optionName.replace(/[/\-\s]/g, ""),
    ...optionName.split(/[\s/-]+/),
  ];

  const extraKeywords = SUBTYPE_SYNONYMS[optionName] || [];

  return [...new Set([...baseKeywords, ...extraKeywords])].filter(
    keyword => keyword.length > 2 && !STOPWORDS.has(keyword)
  );
};

export const suggestSubtypesFromName = (name, typeOptions) => {

  if (!name) return [];


  const text = name
    .toLowerCase()
    .trim();

  if (!text) return [];


  const matches = typeOptions.filter(option => {

    const keywords = buildKeywords(option);

    return keywords.some(keyword =>
      text.includes(keyword) || keyword.includes(text)
    );

  });


  return matches.slice(0, 4);

};


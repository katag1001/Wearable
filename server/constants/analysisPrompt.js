// server/constants/analysisPrompt.js
//
// The wording sent to Gemini when a new item's photo is analysed - the
// rules for each field. services/analysisPrompt.js puts it together with
// the lists and their definitions (constants/analysisDefinitions.js,
// shared/colors.json, shared/fabrics.json) and the answer's schema. Change
// PROMPT_VERSION (constants/itemAnalysis.js) after editing.

const INTRODUCTION = `You are cataloguing one piece from a person's own wardrobe, from a photo, for an outfit-matching app. The photo comes after these instructions. Fill in every field of the answer. If the piece is shown on a plain light grey background, that background is not part of it.`;

const ITEM_COUNT = `itemCount - how many wearable items the photo is about:
- "one": a single garment, or a single pair of shoes (a pair counts as one). It may be worn, on a hanger or laid flat. Ignore the person, hanger, background, and anything only partly visible at the edge.
- "multiple": two or more separate items shown as equal subjects - e.g. a top and trousers laid out together, an outfit flat-lay, shoes from different pairs. A person wearing a whole outfit counts as "multiple" unless one piece is clearly the focus of the photo.
- "none": no clothing or footwear.
Fill in the other fields with your best guess either way.`;

// Written before the type: describing the shape first helps the choice
// (and shows why when it's wrong).
const PIECE_DESCRIPTION = `pieceDescription - before choosing its type, describe the piece in one line: what it is, where it ends (hip, thigh, knee, ankle), its neckline and sleeves or straps, its fit and its fabric. E.g. "button-front collared shirt ending at the hip, long sleeves, crisp cotton". Look at how a laid-flat piece would sit on a body: a top has a neckline, sleeves or straps; a skirt or trousers have a waistband.`;

const KIND_AND_SUBTYPE = `kind - "clothing" or "footwear".
subtype - the type from the lists below that matches your pieceDescription (for footwear, from the footwear list). Read each type's definition and pick the one that fits best; where two are close, the definitions say how to tell them apart.`;

const PATTERN = `pattern - one from the list below, by its definition. For footwear, "Plain" unless the shoe is clearly printed.`;

const FABRIC = `fabric - the piece's main fabric, from the list below, judged by how it looks: its surface, weave or knit, sheen, drape and creasing. Choose the fabric most of the piece is made of, not trims or linings. If you can't tell, answer "Not sure".`;

// Written before `colors`: putting the colour in its own words first
// helps the choice from the list (and shows why when it's wrong).
const COLOUR_DESCRIPTION = `colourDescription - a few words describing the piece's colours in your own words, e.g. "warm off-white linen with grey-green embroidery".`;

const COLOURS = `colors - the real colours of the piece, from the list below. Count a colour once: shadows, creases, sheen, fading and texture within one fabric are all the same colour, never a second one. Add a second or third colour only for a separate part of the design: a print, stripes, a contrasting panel, or trim big enough to notice from a distance. Most plain pieces have exactly one colour. For a print or stripes, list the background colour first, then the others by how much of the piece they cover. Ignore buttons, zips, buckles, stitching and labels.
Denim: light-wash is Light Blue, mid or dark-wash is Dark Blue, black denim is Black - never a second blue for the fading.
The colours (each name, then what it covers):`;

const OCCASIONS = `occasions - one answer for EVERY occasion below. Answer true only if this piece is a natural, typical choice for that occasion: something people there commonly wear, that you'd suggest without a second thought. Answer false if it would only work at a stretch, if it's clearly too dressy or too casual for the setting, or if you're unsure. Judge the piece in the photo, not its category: two pieces of the same type can suit different occasions. Most pieces suit a handful of occasions, not most of them. At least one must be true.
Each occasion has its setting, pieces that fit it and pieces that don't - these are examples to judge by, not complete lists.`;

// From the user's own corrections in testing.
const OCCASION_EXAMPLES = [
  "A simple cami or crop top CAN be Comfy casual - with an easy skirt or trousers it's a relaxed outfit.",
  "A slouchy knit, worn with drawstring linen, is Comfy casual but NOT Elevated everyday.",
  "A cami worn with wide-leg jeans is Elevated everyday but NOT Smart casual.",
  "A halter top can be worn for Errands.",
];

const NAMES = `name - a short name, 2 to 4 words, in sentence case: the main colour, at most one stand-out detail, and the everyday word for the piece. E.g. "Cream linen trousers", "Navy striped jumper", "Black ankle boots". No brands.
specificName - a longer name, 3 to 6 words, that adds one more detail to tell it apart from similar pieces (fabric, neckline, sleeves, fit, trim). E.g. "Cream drawstring linen trousers". It must differ from name.`;

// The follow-up question when no occasion was answered true.
const CLOSEST_OCCASION = `None of the occasions were answered yes for the piece in this photo, but every piece needs at least one. Which single occasion below suits it best? The photo comes after this list.`;

module.exports = {
  INTRODUCTION,
  ITEM_COUNT,
  PIECE_DESCRIPTION,
  KIND_AND_SUBTYPE,
  PATTERN,
  FABRIC,
  COLOUR_DESCRIPTION,
  COLOURS,
  OCCASIONS,
  OCCASION_EXAMPLES,
  NAMES,
  CLOSEST_OCCASION,
};

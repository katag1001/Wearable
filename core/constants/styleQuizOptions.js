import women1 from "../assets/styles/women1.jpg";
import women2 from "../assets/styles/women2.jpg";
import women3 from "../assets/styles/women3.jpg";
import women4 from "../assets/styles/women4.jpg";
import women5 from "../assets/styles/women5.jpg";
import women6 from "../assets/styles/women6.jpg";
import women7 from "../assets/styles/women7.jpg";
import women8 from "../assets/styles/women8.jpg";
import women9 from "../assets/styles/women9.jpg";
import women10 from "../assets/styles/women10.jpg";
import women11 from "../assets/styles/women11.jpg";
import men1 from "../assets/styles/men1.jpg";
import men2 from "../assets/styles/men2.jpg";
import men3 from "../assets/styles/men3.jpg";
import men4 from "../assets/styles/men4.jpg";
import men5 from "../assets/styles/men5.jpg";
import men6 from "../assets/styles/men6.jpg";
import men7 from "../assets/styles/men7.jpg";
import men8 from "../assets/styles/men8.jpg";
import men9 from "../assets/styles/men9.jpg";
import men10 from "../assets/styles/men10.jpg";

// Unisex sees 7 women's and 6 men's (see STYLE IMAGE MAPPING below). Listed in the
// order women and men see them, mixed so neighbouring tiles differ in
// colour level. Unisex has its own order (unisexImageOrder).
export const styleImageOptions = [
  { key: "women10", image: women10, colour: "max", pattern: "max", gender: ["woman", "unisex"] },
  { key: "women11", image: women11, colour: "min", pattern: "min", gender: ["woman", "unisex"] },
  { key: "men1", image: men1, colour: "min", pattern: "min", gender: ["man", "unisex"] },
  { key: "men4", image: men4, colour: "mid", pattern: "min", gender: ["man"] },
  { key: "women6", image: women6, colour: "mid", pattern: "mid", gender: ["woman", "unisex"] },
  { key: "men8", image: men8, colour: "max", pattern: "mid", gender: ["man", "unisex"] },
  { key: "women3", image: women3, colour: "min", pattern: "mid", gender: ["woman", "unisex"] },
  { key: "women9", image: women9, colour: "max", pattern: "min", gender: ["woman"] },
  { key: "men6", image: men6, colour: "mid", pattern: "max", gender: ["man", "unisex"] },
  { key: "men2", image: men2, colour: "min", pattern: "min", gender: ["man"] },
  { key: "men10", image: men10, colour: "mid", pattern: "min", gender: ["man"] },
  { key: "women1", image: women1, colour: "min", pattern: "min", gender: ["woman", "unisex"] },
  { key: "women7", image: women7, colour: "mid", pattern: "mid", gender: ["woman"] },
  { key: "women4", image: women4, colour: "min", pattern: "mid", gender: ["woman"] },
  { key: "men7", image: men7, colour: "max", pattern: "min", gender: ["man", "unisex"] },
  { key: "women5", image: women5, colour: "mid", pattern: "min", gender: ["woman", "unisex"] },
  { key: "women2", image: women2, colour: "min", pattern: "min", gender: ["woman"] },
  { key: "men5", image: men5, colour: "mid", pattern: "mid", gender: ["man"] },
  { key: "men3", image: men3, colour: "min", pattern: "mid", gender: ["man", "unisex"] },
  { key: "women8", image: women8, colour: "mid", pattern: "max", gender: ["woman", "unisex"] },
  { key: "men9", image: men9, colour: "max", pattern: "max", gender: ["man", "unisex"] },
];

// Unisex's 13 in the 2-column grid, row by row: women's and men's photos
// on both sides, and no tile next to (or above) one at the same colour
// level.
const unisexImageOrder = [
  "women10", "men1",
  "women3", "women5",
  "men6", "men9",
  "men3", "women6",
  "women8", "men8",
  "men7", "women1",
  "women11",
];

// The images shown for a gender, in the order shown. No gender yet shows
// them all.
export const styleImagesFor = (gender) => {
  if (!gender) {
    return styleImageOptions;
  }

  const options = styleImageOptions.filter((option) => option.gender.includes(gender));

  if (gender !== "unisex") {
    return options;
  }

  return [...options].sort(
    (a, b) => unisexImageOrder.indexOf(a.key) - unisexImageOrder.indexOf(b.key)
  );
};

/* --------------------------------------------------------------------
   GENDER QUESTION

   "How do you prefer to dress?" — single-select. `value` is written
   straight to preferences.gender.
-------------------------------------------------------------------- */

export const genderQuestionOptions = [
  { label: "More feminine", value: "woman" },
  { label: "More unisex", value: "unisex" },
  { label: "More masculine", value: "man" },
];

/* --------------------------------------------------------------------
   SEASONALITY QUESTION

   A 5-point scale, 1 (not at all) to 5 (very much), written straight to
   preferences.seasonality. On Today, outfits in the season's fabrics and
   colours rank higher the more the season matters
   (server/constants/seasonality.js).
-------------------------------------------------------------------- */

export const seasonalityQuestion = {
  title: "How much does the season affect what you wear?",
  hint: "For example linen and bright colours in summer, velvet and deep reds in winter.",
  lowLabel: "Not at all",
  highLabel: "Very much",
};

// The points of every 1-5 scale question (seasonality, temperature).
export const fivePointScale = [1, 2, 3, 4, 5];

// Where the scale starts before it's answered.
export const DEFAULT_SEASONALITY_ANSWER = 3;

/* --------------------------------------------------------------------
   TEMPERATURE QUESTION

   A 5-point scale, 1 (always too cold) to 5 (always too hot), written
   straight to preferences.temperature. It shifts every outfit's saved
   temperature range: +1, +0.5, 0, -0.5, -1 degrees
   (TEMPERATURE_PREFERENCE_SHIFT in server/constants/temperatureGroups.js).
-------------------------------------------------------------------- */

export const temperatureQuestion = {
  title: "Do you generally feel too cold or too hot?",
  lowLabel: "I'm always too cold",
  midLabel: "Neither",
  highLabel: "I'm always too hot",
};

export const DEFAULT_TEMPERATURE_ANSWER = 3;

/* --------------------------------------------------------------------
   STYLE IMAGE MAPPING

   "Select all that apply" — multi-select grid built from every image
   in core/assets/styles. Each entry says what colour level and
   pattern level that image represents. Edit the colour and pattern
   values here to change what a picture means — nothing else in the
   app needs to change.

   colour:  "max" | "mid" | "min"
   pattern: "max" | "mid" | "min"
   gender:  array of one or more of "woman" | "unisex" | "man" — an
            image is only shown when the gender picked in question 1
            is included in this list. "unisex" is its own category:
            it is not implied by "woman" or "man" and vice versa.

   Mix (colour rows × pattern columns, min / mid / max):

     woman (11)   min: 1,2,11 | 3,4 | -     unisex (13)  min: w1,w11,m1 | w3,m3 | -
                  mid: 5      | 6,7 | 8                  mid: w5        | w6    | w8,m6
                  max: 9      | -   | 10                 max: m7        | m8    | w10,m9

     man (10)     min: 1,2    | 3   | -
                  mid: 4,10   | 5   | 6
                  max: 7      | 8   | 9
-------------------------------------------------------------------- */


/* --------------------------------------------------------------------
   TIE-BREAK PRIORITY

   When a majority vote across selected images ends in a tie, the
   option that appears first in these lists wins.
-------------------------------------------------------------------- */

export const levelPriority = ["min", "mid", "max"];

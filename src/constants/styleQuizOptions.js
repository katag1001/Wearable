import fun1 from "../assets/images/styles/fun1.jpg";
import fun2 from "../assets/images/styles/fun2.jpg";
import fun3 from "../assets/images/styles/fun3.jpg";
import classic1 from "../assets/images/styles/classic1.jpg";
import classic2 from "../assets/images/styles/classic2.jpg";
import classic3 from "../assets/images/styles/classic3.jpg";
import fashion1 from "../assets/images/styles/fashion1.jpg";
import fashion2 from "../assets/images/styles/fashion2.jpg";
import fashion3 from "../assets/images/styles/fashion3.jpg";


export const styleImageOptions = [
  { key: "fun1", image: fun1, style: "fun", colour: "max", pattern: "max", gender: ["woman"] },
  { key: "fun2", image: fun2, style: "fun", colour: "mid", pattern: "max", gender: ["unisex"] },
  { key: "fun3", image: fun3, style: "fun", colour: "max", pattern: "mid", gender: ["woman", "man"] },

  { key: "classic1", image: classic1, style: "classic", colour: "min", pattern: "min", gender: ["unisex"] },
  { key: "classic2", image: classic2, style: "classic", colour: "min", pattern: "mid", gender: ["woman"] },
  { key: "classic3", image: classic3, style: "classic", colour: "mid", pattern: "min", gender: ["man"] },

  { key: "fashion1", image: fashion1, style: "fashion", colour: "mid", pattern: "mid", gender: ["woman", "unisex"] },
  { key: "fashion2", image: fashion2, style: "fashion", colour: "max", pattern: "min", gender: ["man"] },
  { key: "fashion3", image: fashion3, style: "fashion", colour: "min", pattern: "max", gender: ["woman"] },
];

/* --------------------------------------------------------------------
   GENDER QUESTION

   "How do you usually dress?" — single-select. `value` is written
   straight to preferences.gender.
-------------------------------------------------------------------- */

export const genderQuestionOptions = [
  { label: "More feminine", value: "woman" },
  { label: "More unisex", value: "unisex" },
  { label: "More masculine", value: "man" },
];

/* --------------------------------------------------------------------
   TEMPERATURE QUESTION

   "Do you generally feel too cold or too hot?" — single-select.
   `value` is written straight to preferences.temperature.
-------------------------------------------------------------------- */

export const temperatureQuestionOptions = [
  { label: "Too cold", value: "cold" },
  { label: "Too hot", value: "hot" },
  { label: "Normal", value: "normal" },
];

/* --------------------------------------------------------------------
   STYLE IMAGE MAPPING

   "Select all that apply" — multi-select grid built from every image
   in src/assets/images/styles. Each entry says what style, colour
   level and pattern level that image represents. Edit the style,
   colour and pattern values here to change what a picture means —
   nothing else in the app needs to change.

   style:   "fun" | "classic" | "fashion"
   colour:  "max" | "mid" | "min"
   pattern: "max" | "mid" | "min"
   gender:  array of one or more of "woman" | "unisex" | "man" — an
            image is only shown when the gender picked in question 1
            is included in this list. "unisex" is its own category:
            it is not implied by "woman" or "man" and vice versa.

   The gender values below were assigned randomly as placeholders —
   update them to reflect what each image actually shows.
-------------------------------------------------------------------- */


/* --------------------------------------------------------------------
   TIE-BREAK PRIORITY

   When a majority vote across selected images ends in a tie, the
   option that appears first in these lists wins.
-------------------------------------------------------------------- */

export const stylePriority = ["fashion", "classic", "fun"];
export const levelPriority = ["min", "mid", "max"];

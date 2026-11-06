/* --------------------------------------------------------------------
   PAIRING QUESTIONS (style quiz)

   Pairings people feel strongly about, asked only of the genders in
   `pairingQuestionGenders`. Each answer (yes / sometimes / no) moves the
   starting score of every subtype pair in that question - which pairs,
   and by how much, is decided on the server in
   server/constants/pairingQuestions.js. The `key`s must match the
   server's.

   The quiz asks them as pictures, not Yes / Sometimes / No:
   - layering: one "tick any that apply" step. Ticked → yes, not
     ticked → no. Skipping the step sends nothing.
   - smart and casual: an extra tile in the style images. Picked → yes,
     not picked → nothing sent. It never counts towards colour or
     pattern.
   Style Preferences asks each one as Yes / Sometimes / No.

   The pictures live in core/assets/pairing. An `image` of null shows a
   placeholder tile.
-------------------------------------------------------------------- */

import shirtOverTop from "../assets/pairing/shirt-over-top.jpg";
import shirtSummerDress from "../assets/pairing/shirt-summerdress.jpg";
import shirtUnderDress from "../assets/pairing/shirt-under-dress.jpg";
import smartCasual from "../assets/pairing/smart-casual.jpg";
import tUnderDress from "../assets/pairing/t-under-dress.jpg";
import tUnderShirt from "../assets/pairing/t-under-shirt.jpg";
import tUnderT from "../assets/pairing/t-under-t.jpg";

export const pairingQuestionGenders = ["woman", "unisex"];

export const layeringQuestion = {
  title: "Do you like to layer tops?",
  subtitle: "Tick any that apply.",
};

export const layeringOptions = [
  { key: "shirtsOverTops", label: "Shirts over tops", image: shirtOverTop },
  { key: "turtlenecksUnderShirts", label: "Turtlenecks under shirts", image: tUnderShirt },
  { key: "topsUnderDresses", label: "Tops under dresses", image: tUnderDress },
  { key: "shirtsUnderDresses", label: "Shirts under dresses", image: shirtUnderDress },
  { key: "linenWithSummerDresses", label: "Linen shirts with summer dresses", image: shirtSummerDress },
  { key: "tshirtsOverLongSleeves", label: "T-shirts over long-sleeve tops", image: tUnderT },
];

export const smartCasualOption = {
  key: "smartAndCasual",
  label: "Mixing smart and casual",
  image: smartCasual,
};

// Every question, for Style Preferences.
export const pairingQuestions = [...layeringOptions, smartCasualOption];

export const pairingAnswerOptions = [
  { label: "Yes", value: "yes" },
  { label: "Sometimes", value: "sometimes" },
  { label: "No", value: "no" },
];

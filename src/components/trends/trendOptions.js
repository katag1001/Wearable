// The names a trend piece can use - the same lists the server checks
// against (server/services/trendService.js).

import footwearByGender from "../../../shared/footwearByGender.json";
import subtypesByGender from "../../../shared/subtypesByGender.json";
import { colorOptions, fabricOptions, patternOptions } from "@core/constants/optionsBank.js";

const subtypes = [
  ...new Set(Object.values(subtypesByGender).flatMap((roles) => Object.values(roles).flat())),
];

// A piece's fields, in the order the form shows them.
export const PIECE_FIELDS = [
  { key: "subtype", label: "Type", options: subtypes },
  { key: "colour", label: "Colour", options: colorOptions.map(({ name }) => name) },
  { key: "pattern", label: "Pattern", options: patternOptions },
  { key: "fabric", label: "Fabric", options: fabricOptions },
];

const colourField = PIECE_FIELDS.find(({ key }) => key === "colour");

// A shoe trend's one piece: a shoe type and maybe a colour. Shoe trends
// only add a note on Today, never points.
export const SHOE_FIELDS = [
  { key: "footwear", label: "Shoe", options: [...new Set(Object.values(footwearByGender).flat())] },
  colourField,
];

export const GENDER_OPTIONS = [
  { value: "woman", label: "Women" },
  { value: "unisex", label: "Unisex" },
  { value: "man", label: "Men" },
];

export const emptyPiece = () => ({ subtype: [], colour: [], pattern: [], fabric: [], footwear: [] });

export const isShoeTrend = (trend) => Boolean(trend?.pieces?.[0]?.footwear?.length);

// A piece in words: "Flared jeans or Flared trousers, White".
export const describePiece = (piece) =>
  [...PIECE_FIELDS, SHOE_FIELDS[0]].map(({ key }) => (piece[key] || []).join(" or "))
    .filter(Boolean)
    .join(", ");

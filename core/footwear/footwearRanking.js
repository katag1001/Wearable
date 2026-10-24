import footwearMatrices from "../../shared/footwearMatrices.json";
import footwearScoring from "../../shared/footwearScoring.json";
import colorPalettes from "../../shared/colorPalettes.json";
import { FOOTWEAR_WEATHER_RULES } from "../constants/footwearWeather.js";
import { NOT_WITH_TIGHTS, TIGHTS_POINTS } from "../constants/footwearTights.js";
import { palettesForLevel, resolveColourLevel } from "../utils/colourPalettes.js";
import {
  ADD_COLOUR_UP_TO,
  COLOUR_POINTS,
  FALLBACK_COLOUR_POINTS,
  OUTER_COLOUR_FROM,
  OUTER_COLOUR_POINTS,
  PATTERN_POINTS,
} from "../constants/footwearColour.js";

/*
 * Orders every shoe for the outfit worn today.
 *
 * Groups come first:
 *   - unsuitable: every shoe today's weather doesn't penalise comes before
 *     every shoe it does (constants/footwearWeather.js), and with tights,
 *     open shoes go to the bottom too (constants/footwearTights.js), so
 *     nothing else can lift an unsuitable shoe above a suitable one;
 *   - then, within each, grouped by season and tag:
 *     in today's season and has today's tag, season only, tag only,
 *     neither. With no season or no tag known, every shoe fits it.
 *
 * Within a group, by score:
 *   baseline for the outfit's bottom (or one-piece) + the user's learned
 *   adjustment, kept within 0-100 (shared/footwearMatrices.json, rules in
 *   server/constants/footwearScoreBaseline.js, neutral scores in
 *   shared/footwearScoring.json)
 *   + weather points + tights points + colour points + pattern points
 *   (constants/footwearColour.js, with the outfit palettes in
 *   shared/colorPalettes.json).
 *
 * Freshness (how recently a shoe was worn) deliberately plays no part -
 * people rewear the same shoes.
 */

// Bump when the rules or numbers change, so shoe orders cached earlier in
// the day (core/footwear/footwearCache.js) are ranked again.
export const FOOTWEAR_RANKING_VERSION = 2;

const DEFAULT_GENDER = "unisex";
const MIN_SCORE = 0;
const MAX_SCORE = 100;

const clamp = (value) => Math.min(MAX_SCORE, Math.max(MIN_SCORE, value));

/* -------------------- Outfit -------------------- */

// The outfit item shoes are paired with: its bottom, else its one-piece.
// Null for an outfit with neither (e.g. a user-made outfit of tops).
export const getPairingSubtype = (clothes = []) =>
  clothes.find((item) => item?.type === "bottom")?.subtype ||
  clothes.find((item) => item?.type === "onepiece")?.subtype ||
  null;

// Every colour on the outfit's outers (several outers all count).
export const getOuterColours = (clothes = []) => [
  ...new Set(
    clothes
      .filter((item) => item?.type === "outer")
      .flatMap((item) => item.colors || [])
  ),
];

const hasPatternedStyle = (styles = []) =>
  styles.some(
    (style) => typeof style === "string" && style.toLowerCase() === "patterned"
  );

// A match's combined styles include "Patterned" if any item is patterned.
export const isOutfitPatterned = (match) => hasPatternedStyle(match?.styles);

// Shoes are Patterned whenever they have more than one colour.
const isShoePatterned = (item) =>
  hasPatternedStyle(item.styles) || (item.colors || []).length > 1;

/* -------------------- Pairing -------------------- */

export const findPairing = (pairings = [], bottomSubtype, footwearSubtype) =>
  pairings.find(
    (pairing) =>
      pairing.bottomSubtype === bottomSubtype &&
      pairing.footwearSubtype === footwearSubtype
  ) || null;

export const getBaselineScore = (gender, bottomSubtype, footwearSubtype) => {
  if (!bottomSubtype) return footwearScoring.noBottomScore;

  const matrix = footwearMatrices[gender] || footwearMatrices[DEFAULT_GENDER];
  const score = matrix[bottomSubtype]?.[footwearSubtype];

  return Number.isInteger(score) ? score : footwearScoring.notInMatrixScore;
};

/* -------------------- Weather -------------------- */

export const getWeatherPoints = (footwearSubtype, weather) => {
  if (!weather) return 0;

  return FOOTWEAR_WEATHER_RULES
    .filter((rule) => rule.when(weather))
    .reduce((sum, rule) => sum + (rule.points[footwearSubtype] || 0), 0);
};

/* -------------------- Tights -------------------- */

export const getTightsPoints = (footwearSubtype, withTights) =>
  withTights ? TIGHTS_POINTS[footwearSubtype] || 0 : 0;

const isOpenWithTights = (footwearSubtype, withTights) =>
  Boolean(withTights) && NOT_WITH_TIGHTS.includes(footwearSubtype);

/* -------------------- Colour + pattern -------------------- */

export { resolveColourLevel };

const fitsAPalette = (colors, palettes) =>
  palettes.some((palette) => colors.every((color) => palette.colours.includes(color)));

// Which points table applies: the outer one for an outfit with an outer
// and OUTER_COLOUR_FROM up to ADD_COLOUR_UP_TO colours, else add or match
// by the outfit's colour count.
const colourPointsFor = (outfitColors, outerColors, level) => {
  const count = outfitColors.length;

  if (count > ADD_COLOUR_UP_TO[level]) return COLOUR_POINTS.matchColours;

  return outerColors.length > 0 && count >= OUTER_COLOUR_FROM
    ? OUTER_COLOUR_POINTS
    : COLOUR_POINTS.addColour;
};

// { fits, points } for one shoe against the outfit's colours. `fits` is
// false when outfit + shoe break the level's palettes or colour cap.
export const getColourResult = (
  item,
  outfitColors = [],
  level,
  outerColors = []
) => {
  const palettes = palettesForLevel(level);
  const maxColors = colorPalettes.maxColors[level];

  const shoeColors = item.colors || [];
  const combined = [...new Set([...outfitColors, ...shoeColors])];
  const addsColour = combined.length > outfitColors.length;

  // An outfit that already fits no palette (e.g. one the user built) is
  // judged on the colour cap only.
  const paletteOk =
    !fitsAPalette(outfitColors, palettes) || fitsAPalette(combined, palettes);
  const capOk = maxColors === null || combined.length <= maxColors;

  const fits = paletteOk && capOk;

  const points = colourPointsFor(outfitColors, outerColors, level);

  if (!fits) return { fits, points: points.doesNotFit };

  if (
    points === OUTER_COLOUR_POINTS &&
    shoeColors.some((color) => outerColors.includes(color))
  ) {
    return { fits, points: points.outerColour };
  }

  return {
    fits,
    points: addsColour ? points.newColourFits : points.outfitColoursOnly,
  };
};

// Black, then white, then brown - for when no shoe fits the outfit.
export const getFallbackColourPoints = (item) =>
  Math.max(
    0,
    ...(item.colors || []).map((color) => FALLBACK_COLOUR_POINTS[color] || 0)
  );

export const getPatternPoints = (item, outfitPatterned, level) => {
  if (!isShoePatterned(item)) return 0;

  return outfitPatterned
    ? PATTERN_POINTS.patternedOutfit[level]
    : PATTERN_POINTS.plainOutfit;
};

/* -------------------- Season + tag -------------------- */

const fitsSeason = (item, season) => !season || Boolean(item[season]);

const hasTag = (item, todayTag) => {
  if (!todayTag) return true;

  const wanted = todayTag.trim().toLowerCase();

  return (item.tags || []).some((tag) => tag.trim().toLowerCase() === wanted);
};

const seasonTagGroup = (item, season, todayTag) => {
  const inSeason = fitsSeason(item, season);
  const tagged = hasTag(item, todayTag);

  if (inSeason && tagged) return 0;
  if (inSeason) return 1;
  if (tagged) return 2;
  return 3;
};

/* -------------------- Ranking -------------------- */

// context: { gender, bottomSubtype, pairings, weather, season, todayTag,
// withTights, outfitColors, outerColors, outfitPatterned, colourLevel }.
// Returns a new array; ties keep their original order (newest first).
export const rankFootwear = (items = [], context = {}) => {
  const level = resolveColourLevel(context.colourLevel);

  const scored = items.map((item, index) => {
    const weatherPoints = getWeatherPoints(item.subtype, context.weather);
    const unsuitable =
      weatherPoints < 0 || isOpenWithTights(item.subtype, context.withTights);

    const adjustment = context.bottomSubtype
      ? findPairing(context.pairings, context.bottomSubtype, item.subtype)
          ?.adjustment || 0
      : 0;

    return {
      item,
      index,
      group:
        (unsuitable ? 4 : 0) +
        seasonTagGroup(item, context.season, context.todayTag),
      colour: getColourResult(
        item,
        context.outfitColors,
        level,
        context.outerColors
      ),
      score:
        clamp(
          getBaselineScore(context.gender, context.bottomSubtype, item.subtype) +
            adjustment
        ) +
        weatherPoints +
        getTightsPoints(item.subtype, context.withTights) +
        getPatternPoints(item, context.outfitPatterned, level),
    };
  });

  // No shoe fits the outfit's colours - prefer black, white, then brown.
  const anyFits = scored.some((entry) => entry.colour.fits);

  return scored
    .map((entry) => ({
      ...entry,
      score:
        entry.score +
        (anyFits
          ? entry.colour.points
          : getFallbackColourPoints(entry.item)),
    }))
    .sort(
      (a, b) =>
        a.group - b.group ||
        b.score - a.score ||
        a.index - b.index
    )
    .map(({ item }) => item);
};

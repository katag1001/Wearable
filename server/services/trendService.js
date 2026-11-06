// server/services/trendService.js
//
// Current trends (constants/trends.js): checking one before it's saved,
// which are still running, which an outfit is on, and the Today points.
// Pure - no DB access.
//
// A trend is a list of pieces; each piece describes one clothing item by
// any of subtype, colour, pattern and fabric (each a list meaning "any of
// these"). An outfit is on the trend when every piece matches a different
// one of its items - so "Long-sleeve t-shirt" + "Flared jeans" is a
// combination, { subtype: Jeans, colour: White } is white jeans, and
// { colour: Burgundy } is anything burgundy. `genders` limits who it
// counts for (empty = everyone).
//
// A shoe trend is one piece with `footwear` types (and maybe a colour).
// It never matches clothing, so it never changes a score: Today only says
// so when the shoe shown with an outfit is on it (core/today/trendNote.js).

const subtypesByGender = require("../../shared/subtypesByGender.json");
const COLOURS = require("../../shared/colors.json").map(({ name }) => name);
const PATTERNS = require("../../shared/patterns.json");
const FABRICS = require("../../shared/fabrics.json").map(({ name }) => name);
const footwearByGender = require("../../shared/footwearByGender.json");
const {
  TREND_POINTS,
  DEFAULT_TRENDS_LEVEL,
  TREND_NOTE_MIN_LEVEL,
  TREND_DEFAULT_MONTHS,
  TREND_MAX_PIECES,
  TREND_LABEL_MAX_LENGTH,
} = require("../constants/trends.js");

const GENDERS = Object.keys(subtypesByGender);

const SUBTYPES = [
  ...new Set(Object.values(subtypesByGender).flatMap((roles) => Object.values(roles).flat())),
];

const FOOTWEAR = [...new Set(Object.values(footwearByGender).flat())];

// A piece's fields and the names each may use.
const PIECE_FIELDS = {
  subtype: SUBTYPES,
  colour: COLOURS,
  pattern: PATTERNS,
  fabric: FABRICS,
  footwear: FOOTWEAR,
};

// The clothing item's values for a piece field. Clothes are never
// footwear, so a shoe piece never matches one.
const itemValues = {
  subtype: (item) => [item.subtype],
  colour: (item) => item.colors || [],
  pattern: (item) => [item.pattern],
  fabric: (item) => [item.fabric],
  footwear: () => [],
};

const isShoeTrend = (trend) => Boolean(trend.pieces?.[0]?.footwear?.length);

/* -------------------- Checking a trend -------------------- */

const addMonths = (date, months) => {
  const result = new Date(date);
  result.setMonth(result.getMonth() + months);
  return result;
};

const DATE_ONLY = /^\d{4}-\d{2}-\d{2}$/;

const toNameList = (value) =>
  (Array.isArray(value) ? value : [])
    .filter((name) => typeof name === "string")
    .map((name) => name.trim())
    .filter(Boolean);

// { trend } ready to save, or { error }. `input` is { label, plural,
// genders, pieces, until? } from the /trends page; `now` sets `added` and the
// default end date (TREND_DEFAULT_MONTHS later).
function checkTrend(input, now = new Date()) {
  const label = typeof input?.label === "string" ? input.label.trim() : "";

  if (!label || label.length > TREND_LABEL_MAX_LENGTH) {
    return { error: `The name must be 1-${TREND_LABEL_MAX_LENGTH} characters.` };
  }

  const genders = [...new Set(toNameList(input.genders))];
  const unknownGender = genders.find((gender) => !GENDERS.includes(gender));

  if (unknownGender) {
    return { error: `"${unknownGender}" isn't a known gender.` };
  }

  const rawPieces = Array.isArray(input.pieces) ? input.pieces : [];

  if (!rawPieces.length || rawPieces.length > TREND_MAX_PIECES) {
    return { error: `A trend needs 1-${TREND_MAX_PIECES} pieces.` };
  }

  const pieces = [];

  for (const rawPiece of rawPieces) {
    const piece = {};

    for (const [field, allowed] of Object.entries(PIECE_FIELDS)) {
      const names = [...new Set(toNameList(rawPiece?.[field]))];
      const unknown = names.find((name) => !allowed.includes(name));

      if (unknown) {
        return { error: `"${unknown}" isn't a known ${field}.` };
      }

      piece[field] = names;
    }

    if (Object.values(piece).every((names) => !names.length)) {
      return { error: "Every piece needs at least one type, colour, pattern or fabric." };
    }

    pieces.push(piece);
  }

  const shoePieces = pieces.filter((piece) => piece.footwear.length);
  const [shoe] = shoePieces;

  if (
    shoe &&
    (pieces.length > 1 || shoe.subtype.length || shoe.pattern.length || shoe.fabric.length)
  ) {
    return { error: "A shoe trend is one shoe type (and maybe a colour) on its own." };
  }

  let until = addMonths(now, TREND_DEFAULT_MONTHS);

  if (input.until) {
    // A plain date (the page's date picker) runs to the end of that day.
    until = DATE_ONLY.test(input.until)
      ? new Date(`${input.until}T23:59:59.999Z`)
      : new Date(input.until);

    if (Number.isNaN(until.getTime()) || until < now) {
      return { error: "The end date must be a date in the future." };
    }
  }

  return {
    trend: { label, plural: input.plural === true, genders, pieces, added: input.added || now, until },
  };
}

/* -------------------- Matching -------------------- */

const isRunning = (trend, now) => !trend.until || new Date(trend.until) >= now;

const activeTrends = (trends, now = new Date()) => trends.filter((trend) => isRunning(trend, now));

// The trends that count for a user of this gender.
const trendsForGender = (trends, gender) =>
  trends.filter((trend) => !trend.genders?.length || trend.genders.includes(gender));

const pieceFits = (piece, item) =>
  Object.keys(PIECE_FIELDS).every((field) => {
    const wanted = piece[field] || [];
    return !wanted.length || itemValues[field](item).some((value) => wanted.includes(value));
  });

// Whether every piece can be given its own item.
function piecesFit(pieces, items, used = new Set()) {
  if (!pieces.length) return true;

  const [piece, ...rest] = pieces;

  return items.some((item, index) => {
    if (used.has(index) || !pieceFits(piece, item)) return false;

    used.add(index);
    const fits = piecesFit(rest, items, used);
    used.delete(index);

    return fits;
  });
}

// The trends (of those given) the outfit's items are on, in order.
const trendsOn = (items, trends) =>
  trends.filter((trend) => trend.pieces?.length && piecesFit(trend.pieces, items));

/* -------------------- Today -------------------- */

const levelOf = (level) => (TREND_POINTS.one[level] === undefined ? DEFAULT_TRENDS_LEVEL : level);

// Today's points for being on `count` trends, by the user's answer.
function trendPoints(count, level) {
  if (!count) return 0;

  const resolved = levelOf(level);

  return count === 1 ? TREND_POINTS.one[resolved] : TREND_POINTS.max[resolved];
}

// Whether Today should say which trend an outfit is on.
const showsTrendNote = (level) => levelOf(level) >= TREND_NOTE_MIN_LEVEL;

module.exports = {
  PIECE_FIELDS,
  GENDERS,
  isShoeTrend,
  checkTrend,
  activeTrends,
  trendsForGender,
  trendsOn,
  trendPoints,
  showsTrendNote,
};

// core/today/trendNote.js
//
// The note on a Today outfit that's on a current trend. The server decides
// which trend ({ label, plural } - server/services/todayScoreService.js
// trendNoteOf); the words are in shared/trendMessages.json, so they can be
// edited without touching code. A trendy shoe gets the same kind of note:
// the server sends the running shoe trends with the Today footwear (only to
// users who care a lot about trends), and the shoe shown is checked here.

import trendMessages from "../../shared/trendMessages.json";

const { messages } = trendMessages;

// The same message all day for an outfit, but not the same for every
// outfit: the day and the outfit's id pick one.
const pickIndex = (key, count) => {
  let hash = 0;

  for (const char of key) {
    hash = (hash * 31 + char.charCodeAt(0)) >>> 0;
  }

  return hash % count;
};

const capitalise = (text) => text.charAt(0).toUpperCase() + text.slice(1);

// The note's text, or null. `outfitId` is the Today entry's match id.
export const trendNoteText = (trendNote, outfitId, date = new Date()) => {
  if (!trendNote?.label || !messages?.length) return null;

  const day = date.toISOString().slice(0, 10);
  const template = messages[pickIndex(`${outfitId}-${day}`, messages.length)];
  const text = template
    .replaceAll("{trend}", trendNote.label)
    .replaceAll("{is}", trendNote.plural ? "are" : "is");

  return capitalise(text);
};

// The first shoe trend (of /footwear/today's shoeTrends) the shoe is on:
// one of its types, and one of its colours if it names any.
const shoeTrendFor = (shoe, shoeTrends = []) =>
  shoe
    ? shoeTrends.find(
        (trend) =>
          trend.footwear.includes(shoe.subtype) &&
          (!trend.colour?.length || (shoe.colors || []).some((colour) => trend.colour.includes(colour)))
      )
    : undefined;

// The note for a trendy shoe, or null.
export const shoeTrendNoteText = (shoe, shoeTrends, date = new Date()) =>
  trendNoteText(shoeTrendFor(shoe, shoeTrends), shoe?._id, date);

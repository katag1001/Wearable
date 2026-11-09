// core/today/trendNote.js
//
// The note on a Today outfit that's on a current trend. The server decides
// which trend ({ label } - server/services/todayScoreService.js
// trendNoteOf); the label is the whole message, typed on the /trends page.
// A trendy shoe gets the same kind of note: the server sends the running
// shoe trends with the Today footwear (only to users who care a lot about
// trends), and the shoe shown is checked here.

const capitalise = (text) => text.charAt(0).toUpperCase() + text.slice(1);

// The note's text, or null.
export const trendNoteText = (trendNote) =>
  trendNote?.label ? capitalise(trendNote.label) : null;

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
export const shoeTrendNoteText = (shoe, shoeTrends) =>
  trendNoteText(shoeTrendFor(shoe, shoeTrends));

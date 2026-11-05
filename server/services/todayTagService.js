// server/services/todayTagService.js
//
// Another tag for the day, picked on the Today tab (/today/tag) - today
// only, the weekly preferences stay as they are. Pure - no DB access.
//
//  - At least TAG_SWITCH_MIN_OUTFITS outfits in today's list have the tag:
//    the list keeps the same outfits, re-ordered as if it had been built
//    for that tag (reorderForTag).
//  - Fewer: the list is built again with that tag in place of the weekly
//    one (the controller's buildToday), so outfits with it get in first.

const { TAG_SWITCH_MIN_OUTFITS } = require("../constants/todayOutfits.js");
const { hasTag } = require("./todayRankingService.js");
const { rankForToday } = require("./todaySelectionService.js");
const { keepRejectedOutOfTop } = require("./matchRejectionService.js");

// Whether today's list (`matches`, the outfits on show) has enough
// outfits with `tag` to re-order it rather than build it again.
const hasEnoughForTag = (matches, tag) =>
  matches.filter((match) => hasTag(match, tag)).length >= TAG_SWITCH_MIN_OUTFITS;

// `matches` in today's order for `todayTag` - ranked, nudged and spread as
// a new list is (todaySelectionService.rankForToday), with recently
// rejected outfits kept out of the top places. `scoreOf` gives each
// outfit's Today score.
const reorderForTag = ({
  matches,
  todayTag,
  scoreOf,
  todayStart,
  now = new Date(),
  random = Math.random,
}) =>
  keepRejectedOutOfTop(
    rankForToday({ matches, todayTag, scoreOf, now, random }),
    todayStart
  );

module.exports = { hasEnoughForTag, reorderForTag };

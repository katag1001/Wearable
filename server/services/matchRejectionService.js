// server/services/matchRejectionService.js
//
// Rejecting an outfit on the Today page (scrolling past it with the right
// arrow). A rejection counts at most once per outfit per day: it adds 1 to
// `rejectedCount` and sets `lastRejectedDate`. It never changes the
// outfit's score or any pair score - its only effect is that an outfit
// rejected in the last REJECTION_COOLDOWN_DAYS days is kept out of the top
// REJECTED_OUTFIT_TOP_GAP places of the Today list (it can still appear
// further down). Marking a rejected
// outfit as worn undoes the rejection. Rated and favourite outfits are
// rejected like any other.
//
// "Today" is the user's local day: the client sends the ISO time of its
// local midnight (`todayStart`). Without one, the server's own midnight is
// used.

const {
  REJECTION_COOLDOWN_DAYS,
  REJECTED_OUTFIT_TOP_GAP,
} = require("../constants/scoring.js");

const DAY_MS = 24 * 60 * 60 * 1000;

// The start of the user's day, from the client's `todayStart`.
const resolveTodayStart = (todayStart, now = new Date()) => {
  const parsed = todayStart ? new Date(todayStart) : null;

  // Only accept a value within a day of now, so a bad clock or a stale
  // value can't hide outfits for longer than intended.
  if (
    parsed &&
    !Number.isNaN(parsed.getTime()) &&
    Math.abs(now.getTime() - parsed.getTime()) <= DAY_MS
  ) {
    return parsed;
  }

  const midnight = new Date(now);
  midnight.setHours(0, 0, 0, 0);
  return midnight;
};

const wasRejectedSince = (match, since) => {
  if (!match?.lastRejectedDate) return false;

  return new Date(match.lastRejectedDate).getTime() >= since.getTime();
};

// Rejected on or after this are kept out of the top of today's list - so an
// outfit rejected on the 2nd is held back up to and including the 5th.
const rejectionCutoff = (todayStart) =>
  new Date(todayStart.getTime() - REJECTION_COOLDOWN_DAYS * DAY_MS);

// Returns true if the match changed (false if already rejected today).
const applyRejection = (match, todayStart, now = new Date()) => {
  if (wasRejectedSince(match, todayStart)) return false;

  match.rejectedCount = (match.rejectedCount || 0) + 1;
  match.lastRejectedDate = now;

  return true;
};

// Reverses applyRejection. The previous rejection date isn't kept, so it
// goes back to null - having just been worn, the outfit ranks low on
// freshness anyway.
const undoRejection = (match) => {
  if (!match.lastRejectedDate) return false;

  match.rejectedCount = Math.max(0, (match.rejectedCount || 0) - 1);
  match.lastRejectedDate = null;

  return true;
};

// Today's ranked list with the recently rejected outfits moved out of the
// first `topCount` places: they drop to just below them, in the order they
// were ranked. Everything else keeps its order. If fewer than `topCount`
// outfits weren't rejected recently, the rejected ones follow straight
// after those.
const keepRejectedOutOfTop = (ranked, todayStart, topCount = REJECTED_OUTFIT_TOP_GAP) => {
  const cutoff = rejectionCutoff(todayStart);
  const top = [];
  const heldBack = [];
  const rest = [];

  ranked.forEach((match) => {
    if (top.length >= topCount) {
      rest.push(match);
    } else if (wasRejectedSince(match, cutoff)) {
      heldBack.push(match);
    } else {
      top.push(match);
    }
  });

  return [...top, ...heldBack, ...rest];
};

module.exports = {
  resolveTodayStart,
  wasRejectedSince,
  rejectionCutoff,
  applyRejection,
  undoRejection,
  keepRejectedOutOfTop,
};

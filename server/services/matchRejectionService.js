// server/services/matchRejectionService.js
//
// Rejecting an outfit on the Today page (scrolling past it with the right
// arrow). A rejection counts at most once per outfit per day: it adds 1 to
// `rejectedCount`, sets `lastRejectedDate` and takes
// REJECTION_SCORE_PENALTY off the match's stored score. An outfit rejected
// in the last REJECTION_COOLDOWN_DAYS days is left out of the Today list,
// unless that would leave nothing to show. Marking a rejected outfit as worn
// undoes the rejection.
//
// "Today" is the user's local day: the client sends the ISO time of its
// local midnight (`todayStart`). Without one, the server's own midnight is
// used.

const {
  MIN_SCORE,
  MAX_SCORE,
  REJECTION_SCORE_PENALTY,
  REJECTION_COOLDOWN_DAYS,
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

// Rejected on or after this are left out of today's list - so an outfit
// rejected on the 2nd is hidden up to and including the 7th.
const rejectionCutoff = (todayStart) =>
  new Date(todayStart.getTime() - REJECTION_COOLDOWN_DAYS * DAY_MS);

// Returns true if the match changed (false if already rejected today).
const applyRejection = (match, todayStart, now = new Date()) => {
  if (wasRejectedSince(match, todayStart)) return false;

  match.rejectedCount = (match.rejectedCount || 0) + 1;
  match.lastRejectedDate = now;
  match.score = Math.max(MIN_SCORE, (match.score || 0) - REJECTION_SCORE_PENALTY);

  return true;
};

// Reverses applyRejection. The previous rejection date isn't kept, so it
// goes back to null - anything rejected in the cooldown before today
// wouldn't have been in today's list to wear anyway.
const undoRejection = (match) => {
  if (!match.lastRejectedDate) return false;

  match.rejectedCount = Math.max(0, (match.rejectedCount || 0) - 1);
  match.lastRejectedDate = null;
  match.score = Math.min(MAX_SCORE, (match.score || 0) + REJECTION_SCORE_PENALTY);

  return true;
};

// Today's candidates without the recently rejected ones - or all of them if
// every candidate was rejected recently.
const excludeRecentlyRejected = (matches, todayStart) => {
  const cutoff = rejectionCutoff(todayStart);

  const kept = matches.filter((match) => !wasRejectedSince(match, cutoff));

  return kept.length ? kept : matches;
};

module.exports = {
  resolveTodayStart,
  wasRejectedSince,
  rejectionCutoff,
  applyRejection,
  undoRejection,
  excludeRecentlyRejected,
};

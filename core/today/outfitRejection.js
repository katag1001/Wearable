import { rejectMatch } from "../api/matches.js";
import { isDateToday } from "../utils/dates.js";

// Scrolling past an outfit on the Today page rejects it - hiding it from
// Today for a few days, without changing its score. The server counts
// a rejection at most once per outfit per day, and the client skips the
// call altogether once the outfit's lastRejectedDate is today.
// Rules and numbers: server/services/matchRejectionService.js.

export const wasRejectedToday = (match) =>
  isDateToday(match?.lastRejectedDate);


// Returns the match's new { rejectedCount, lastRejectedDate }.
export const rejectOutfit = (matchId) => rejectMatch(matchId);

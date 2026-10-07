import axios from "axios";
import { URL } from "../../config";
import { getTodayStartISO, isDateToday } from "./todayHelpers";

// Scrolling past an outfit on the Today page rejects it. The server counts
// a rejection at most once per outfit per day, and the client skips the
// call altogether once the outfit's lastRejectedDate is today.
// Rules and numbers: server/services/matchRejectionService.js.

export const wasRejectedToday = (match) =>
  isDateToday(match?.lastRejectedDate);


// Returns the match's new { score, rejectedCount, lastRejectedDate }.
export const rejectOutfit = async (matchId) => {
  const token = localStorage.getItem("token");

  const response = await axios.put(
    `${URL}/match/${matchId}/reject`,
    { todayStart: getTodayStartISO() },
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );

  return response.data;
};

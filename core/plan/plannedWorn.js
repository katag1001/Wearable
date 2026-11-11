// core/plan/plannedWorn.js
//
// Today's plan, worn by the server (/today/create, or planning today on
// the Plan tab - server/services/planService.js). The server sends the
// "before" values, kept here for the day, so the Today page can undo the
// wear like one of its own if something else is worn instead
// (useToday's applyServerWorn, useTodayFootwear's planned shoe):
// { matchId, matchSnapshot, clothesSnapshots,
//   shoe: { footwearId, snapshot, previousFootwear } | null }.

import { getStorage } from "../config.js";
import { STORAGE_KEYS } from "../storageKeys.js";
import { getTodayDate } from "../utils/dates.js";

const getCurrentUser = () => getStorage().getItem(STORAGE_KEYS.user);

export const savePlannedWorn = (plannedWorn) => {
  if (!plannedWorn?.matchId) return;

  try {
    getStorage().setItem(
      STORAGE_KEYS.plannedWorn,
      JSON.stringify({ savedOn: getTodayDate(), user: getCurrentUser(), plannedWorn })
    );
  } catch (err) {
    console.error("Failed to save today's planned outfit:", err);
  }
};

// The undo values if `matchId` is today's plan worn by the server, else
// null.
export const getPlannedWorn = (matchId) => {
  try {
    const saved = JSON.parse(getStorage().getItem(STORAGE_KEYS.plannedWorn));

    return saved?.savedOn === getTodayDate() &&
      saved.user === getCurrentUser() &&
      matchId &&
      String(saved.plannedWorn?.matchId) === String(matchId)
      ? saved.plannedWorn
      : null;
  } catch {
    return null;
  }
};

// core/api/matches.js
//
// Outfits ("matches" on the server). The paged list uses core/api/lists.js.

import { getTodayStartISO } from "../utils/dates.js";
import { api } from "./client.js";

// Every outfit, unpaged (the stats).
export const fetchAllMatches = async () => {
  const response = await api.get("/match/");

  return Array.isArray(response.data) ? response.data : [];
};

// A hand-built outfit from these clothing ids. The server works out
// everything else (temperature, seasons, colours, tags) from the items.
export const createMatch = async (clothesIds) => {
  const response = await api.post("/match/matches", { clothes: clothesIds });

  return response.data;
};

// Only the fields sent change. Also used for favourite and worn-today.
export const updateMatch = async (id, fields) => {
  const response = await api.put(`/match/${id}`, fields);

  return response.data;
};

// Puts an outfit (and its clothes) back to how they were before they were
// marked worn today - see core/today/wornSnapshot.js.
export const restoreMatchSnapshot = async (snapshot) => {
  const response = await api.put(`/match/${snapshot.matchId}`, {
    restoreSnapshot: true,
    ...snapshot.matchSnapshot,
    clothesSnapshots: snapshot.clothesSnapshots,
  });

  return response.data;
};

// One outfit uses the single route, several the delete-many route.
export const deleteMatches = async (ids) => {
  const response =
    ids.length === 1
      ? await api.delete(`/match/${ids[0]}`)
      : await api.delete("/match/", { data: { ids } });

  return response.data;
};

// "Too hot" / "too cold" on the Today page (`feel`: "too_hot" or
// "too_cold"): moves the outfit's range a degree and hides it from today's
// list. Returns the match's new { min_temp, max_temp }. Rules:
// server/services/temperatureFeedbackService.js.
export const sendTemperatureFeedback = async (matchId, feel) => {
  const response = await api.put(`/match/${matchId}/temperature-feedback`, { feel });

  return response.data;
};

// "Can't wear this with tights" on the Today page (`scope`: "outfit" for
// just this outfit, "item" for never with its skirt, dress or shorts).
// Returns { hiddenMatchIds } - every outfit taken off today's list. Rules:
// server/services/tightsFeedbackService.js.
export const sendTightsFeedback = async (matchId, scope) => {
  const response = await api.put(`/match/${matchId}/tights-feedback`, { scope });

  return response.data;
};

// "Not appropriate for [tag]" on the Today page: `tag` (today's) comes off
// the outfit, which is taken off today's list. Returns { removed } - false
// if it didn't have the tag. Rules: server/services/tagFeedbackService.js.
export const sendTagFeedback = async (matchId, tag) => {
  const response = await api.put(`/match/${matchId}/tag-feedback`, { tag });

  return response.data;
};

// "Mismatch" on the Today page: two clothing ids from the outfit that are
// never matched again. Returns { deletedMatchIds } - every outfit deleted
// for having both. Rules: server/services/mismatchService.js.
export const sendMismatch = async (matchId, clothesIds) => {
  const response = await api.post(`/match/${matchId}/mismatch`, { clothesIds });

  return response.data;
};

// Scrolling past an outfit on the Today page. Returns the match's new
// { rejectedCount, lastRejectedDate }. Rules and numbers:
// server/services/matchRejectionService.js.
export const rejectMatch = async (matchId) => {
  const response = await api.put(`/match/${matchId}/reject`, {
    todayStart: getTodayStartISO(),
  });

  return response.data;
};

// Rating an outfit 1-5 stars. `wearing`: rated as it's worn on the Today
// page (a low rating then keeps it). Returns { deleted: true } if the
// rating deleted it, else { deleted: false, rating, score,
// favouriteItemBonus }. Rules and numbers:
// server/services/matchRatingService.js.
export const rateMatch = async (matchId, rating, { wearing = false } = {}) => {
  const response = await api.put(`/match/${matchId}/rating`, { rating, wearing });

  return response.data;
};

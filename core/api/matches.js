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

// Scrolling past an outfit on the Today page. Returns the match's new
// { score, rejectedCount, lastRejectedDate }. Rules and numbers:
// server/services/matchRejectionService.js.
export const rejectMatch = async (matchId) => {
  const response = await api.put(`/match/${matchId}/reject`, {
    todayStart: getTodayStartISO(),
  });

  return response.data;
};

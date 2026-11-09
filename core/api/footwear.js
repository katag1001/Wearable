// core/api/footwear.js
//
// Footwear items, and the Today page's shoe box. Server side:
// server/controllers/footwearControllers.js. The paged list uses
// core/api/lists.js.

import { api } from "./client.js";

/* -------------------- Items -------------------- */

export const createFootwear = async (fields) => {
  const response = await api.post("/footwear", fields);

  return response.data;
};

// If the image was replaced, the server deletes the old one.
export const updateFootwear = async (id, fields) => {
  const response = await api.put(`/footwear/${id}`, fields);

  return response.data;
};

export const deleteFootwear = async (id) => {
  const response = await api.delete(`/footwear/${id}`);

  return response.data;
};

/* -------------------- Today page -------------------- */

// { items, gender, colourLevel, shoeTrends } - all footwear, the gender
// that picks the matrix, and the colour level that picks the palettes.
export const fetchTodayFootwear = async () => {
  const response = await api.get("/footwear/today");

  return response.data;
};

// Also puts the shoe first on the outfit it's worn with. Returns { item,
// previousFootwear } - the outfit's shoes from before, for the undo.
export const wearFootwear = async (footwearId, matchId) => {
  const response = await api.put(`/footwear/${footwearId}/wear`, {
    matchId,
    wornDate: new Date().toISOString(),
  });

  return response.data;
};

// Undoes wearFootwear, putting the outfit's shoes back as they were.
// Returns { item }.
export const unwearFootwear = async (footwearId, snapshot, matchId, previousFootwear) => {
  const response = await api.put(`/footwear/${footwearId}/unwear`, {
    snapshot,
    matchId,
    previousFootwear,
  });

  return response.data;
};

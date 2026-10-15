// core/api/footwear.js
//
// Footwear items, and the Today page's shoe box. Server side:
// server/controllers/footwearControllers.js. The paged list uses
// core/api/lists.js.

import { getTodayStartISO } from "../utils/dates.js";
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

// { items, pairings, gender } - all footwear, learned pairings, and the
// gender that picks the matrix.
export const fetchTodayFootwear = async () => {
  const response = await api.get("/footwear/today");

  return response.data;
};

// Scrolling past a shoe. Returns { pairing }.
export const rejectFootwearPairing = async (bottomSubtype, footwearSubtype) => {
  const response = await api.put("/footwear/pairings/reject", {
    bottomSubtype,
    footwearSubtype,
    todayStart: getTodayStartISO(),
  });

  return response.data;
};

// Returns { item, pairing }. bottomSubtype may be null (no pairing).
export const wearFootwear = async (footwearId, bottomSubtype) => {
  const response = await api.put(`/footwear/${footwearId}/wear`, {
    bottomSubtype,
    wornDate: new Date().toISOString(),
    todayStart: getTodayStartISO(),
  });

  return response.data;
};

// Undoes wearFootwear. Returns { item, pairing }.
export const unwearFootwear = async (footwearId, bottomSubtype, snapshot) => {
  const response = await api.put(`/footwear/${footwearId}/unwear`, {
    bottomSubtype,
    snapshot,
  });

  return response.data;
};

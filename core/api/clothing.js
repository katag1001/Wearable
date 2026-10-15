// core/api/clothing.js
//
// Clothing items. The paged lists use core/api/lists.js.

import { api } from "./client.js";

// Every clothing item, unpaged (the stats).
export const fetchAllClothing = async () => {
  const response = await api.get("/clothing/");

  return Array.isArray(response.data) ? response.data : [];
};

// Returns the saved item. Matching for it then runs in the background on
// the server (the item comes back with processing: true).
export const createClothing = async (fields) => {
  const response = await api.post("/clothing", fields);

  return response.data;
};

// Only the fields sent change. If the image was replaced, the server
// deletes the old one.
export const updateClothing = async (id, fields) => {
  const response = await api.put(`/clothing/${id}`, fields);

  return response.data;
};

export const deleteClothing = async (id) => {
  const response = await api.delete(`/clothing/${id}`);

  return response.data;
};

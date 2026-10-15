// core/api/preferences.js

import { api } from "./client.js";

// The logged-in user's preferences ({ ok, data }); 404 if they have none yet.
export const getPreferences = async () => {
  const response = await api.get("/preferences");

  return response.data;
};

// Saves only the fields in `changes` (creates the preferences if needed).
export const updatePreferences = async (changes) => {
  const response = await api.put("/preferences", changes);

  return response.data;
};

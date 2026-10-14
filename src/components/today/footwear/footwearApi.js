import axios from "axios";

import { URL } from "../../../config";
import { getTodayStartISO } from "../todayHelpers";

// Requests for the Today page's shoe box. Server side:
// server/controllers/footwearControllers.js (TODAY PAGE section).

const authHeaders = () => ({
  Authorization: `Bearer ${localStorage.getItem("token")}`,
});

// { items, pairings, gender } - all footwear, learned pairings, and the
// gender that picks the matrix.
export const fetchTodayFootwear = async () => {
  const response = await axios.get(`${URL}/footwear/today`, {
    headers: authHeaders(),
  });

  return response.data;
};

// Scrolling past a shoe. Returns { pairing }.
export const rejectFootwearPairing = async (bottomSubtype, footwearSubtype) => {
  const response = await axios.put(
    `${URL}/footwear/pairings/reject`,
    { bottomSubtype, footwearSubtype, todayStart: getTodayStartISO() },
    { headers: authHeaders() }
  );

  return response.data;
};

// Returns { item, pairing }. bottomSubtype may be null (no pairing).
export const wearFootwear = async (footwearId, bottomSubtype) => {
  const response = await axios.put(
    `${URL}/footwear/${footwearId}/wear`,
    {
      bottomSubtype,
      wornDate: new Date().toISOString(),
      todayStart: getTodayStartISO(),
    },
    { headers: authHeaders() }
  );

  return response.data;
};

// Undoes wearFootwear. Returns { item, pairing }.
export const unwearFootwear = async (footwearId, bottomSubtype, snapshot) => {
  const response = await axios.put(
    `${URL}/footwear/${footwearId}/unwear`,
    { bottomSubtype, snapshot },
    { headers: authHeaders() }
  );

  return response.data;
};

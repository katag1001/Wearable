import axios from "axios";
import { URL } from "../../config";

const days = [
  "sunday",
  "monday",
  "tuesday",
  "wednesday",
  "thursday",
  "friday",
  "saturday",
];


/* -------------------------
   GET TODAY'S DAY OF WEEK
------------------------- */

export const getTodayDayOfWeek = () => {
  return days[new Date().getDay()];
};


/* -------------------------
   LOCAL DAY HELPERS
------------------------- */

// Midnight at the start of the user's local day, as an ISO string. Sent to
// the server so "today" means the user's day, not the server's.
export const getTodayStartISO = () => {
  const midnight = new Date();
  midnight.setHours(0, 0, 0, 0);

  return midnight.toISOString();
};


export const isDateToday = (dateString) => {
  if (!dateString) {
    return false;
  }

  const today = new Date();
  const date = new Date(dateString);

  return (
    today.getFullYear() === date.getFullYear() &&
    today.getMonth() === date.getMonth() &&
    today.getDate() === date.getDate()
  );
};


/* -------------------------
   GET TODAY'S TAG
------------------------- */

export const fetchTodayTag = async () => {
  try {
    const token = localStorage.getItem("token");

    if (!token) {
      return null;
    }

    const response = await axios.get(`${URL}/preferences`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    const preferences = response.data?.data;

    const dayOfWeek = getTodayDayOfWeek();

    return preferences?.[dayOfWeek] || null;

  } catch (err) {
    console.error("Failed to fetch today's tag:", err);

    return null;
  }
};


/* -------------------------
   GET TODAY'S DAY + TAG
------------------------- */

export const fetchTodayInfo = async () => {
  try {
    const token = localStorage.getItem("token");

    if (!token) {
      return {
        dayOfWeek: getTodayDayOfWeek(),
        todayTag: null,
      };
    }

    const response = await axios.get(`${URL}/preferences`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    const preferences = response.data?.data;

    const dayOfWeek = getTodayDayOfWeek();
    const todayTag = preferences?.[dayOfWeek] || null;

    return {
      dayOfWeek,
      todayTag,
    };

  } catch (err) {
    console.error("Failed to fetch today's preferences:", err);

    return {
      dayOfWeek: getTodayDayOfWeek(),
      todayTag: null,
    };
  }
};
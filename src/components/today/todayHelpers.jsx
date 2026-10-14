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
   GET SEASON
------------------------- */

const TROPIC_LATITUDE = 23.5;

const northernSeasonsByMonth = [
  "winter", "winter",
  "spring", "spring", "spring",
  "summer", "summer", "summer",
  "autumn", "autumn", "autumn",
  "winter",
];

// Meteorological season for a date and latitude. The tropics have no real
// four seasons, so they count as summer all year. The southern hemisphere is
// shifted by six months. No latitude (location unknown) falls back to northern.
export const getSeason = (date = new Date(), latitude = null) => {
  const hasLatitude = typeof latitude === "number";

  if (hasLatitude && Math.abs(latitude) < TROPIC_LATITUDE) {
    return "summer";
  }

  const month = date.getMonth();
  const isSouthern = hasLatitude && latitude < 0;

  return northernSeasonsByMonth[isSouthern ? (month + 6) % 12 : month];
};


/* -------------------------
   WEATHER TEMPERATURE OFFSET
------------------------- */

// Nudges the temperature range used for outfit matching based on the day's
// WMO weather code. Sunny days are treated as slightly warmer, rain/snow and
// showers/storms as colder. Anything else (cloud, fog, drizzle) or a missing
// code leaves the range unchanged. The real temperature is still displayed.
export const getWeatherTempOffset = (weatherCode) => {
  if (typeof weatherCode !== "number") return 0;

  if (weatherCode === 0) return 0.5;
  if (weatherCode >= 61 && weatherCode <= 77) return -0.5;
  if (weatherCode >= 80 && weatherCode <= 99) return -1;

  return 0;
};


/* -------------------------
   WEATHER EMOJI
------------------------- */

// Emoji for the day's WMO weather code. Missing code (e.g. weather cached
// before codes were fetched) returns an empty string.
export const getWeatherEmoji = (weatherCode) => {
  if (typeof weatherCode !== "number") return "";

  if (weatherCode === 0) return "☀️";
  if (weatherCode <= 2) return "🌤️";
  if (weatherCode === 3) return "☁️";
  if (weatherCode <= 48) return "🌫️";
  if (weatherCode <= 67) return "🌧️";
  if (weatherCode <= 77) return "❄️";
  if (weatherCode <= 82) return "🌦️";
  if (weatherCode <= 86) return "🌨️";

  return "⛈️";
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
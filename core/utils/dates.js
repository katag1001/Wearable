// core/utils/dates.js
//
// The user's local day and season.

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
   PLAN DATES ("YYYY-MM-DD", the user's local day)
------------------------- */

const pad = (number) => String(number).padStart(2, "0");

// A Date as the user's local "YYYY-MM-DD" (the Plan tab's dates).
export const toPlanDate = (date) =>
  `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;

// Today as "YYYY-MM-DD".
export const getTodayDate = () => toPlanDate(new Date());

// A "YYYY-MM-DD" as a Date at local midnight.
export const fromPlanDate = (planDate) => {
  const [year, month, day] = planDate.split("-").map(Number);

  return new Date(year, month - 1, day);
};

// The "YYYY-MM-DD" `days` after this one.
export const addDaysToPlanDate = (planDate, days) => {
  const date = fromPlanDate(planDate);
  date.setDate(date.getDate() + days);

  return toPlanDate(date);
};

// Whole days from today to a "YYYY-MM-DD" (0 today, negative if past).
export const daysFromToday = (planDate) =>
  Math.round((fromPlanDate(planDate) - fromPlanDate(getTodayDate())) / (24 * 60 * 60 * 1000));

// The weekday ("monday") of a "YYYY-MM-DD".
export const dayOfWeekOf = (planDate) => days[fromPlanDate(planDate).getDay()];

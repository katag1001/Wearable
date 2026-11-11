// core/plan/calendar.js
//
// The Plan tab's month grid. Pure. Weeks start on Monday; dates are the
// user's local "YYYY-MM-DD" (core/utils/dates.js).

import { addDaysToPlanDate, fromPlanDate, toPlanDate } from "../utils/dates.js";

// How far ahead a day can be planned.
export const PLAN_MONTHS_AHEAD = 3;

export const WEEKDAY_LETTERS = ["M", "T", "W", "T", "F", "S", "S"];

const MONTH_NAMES = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
];

// "2026-11" for any date in that month.
export const monthOf = (planDate) => planDate.slice(0, 7);

// "November 2026".
export const monthTitle = (month) => {
  const [year, monthNumber] = month.split("-").map(Number);

  return `${MONTH_NAMES[monthNumber - 1]} ${year}`;
};

// The month before / after ("2026-11" -> "2026-12").
export const shiftMonth = (month, by) => {
  const [year, monthNumber] = month.split("-").map(Number);
  const date = new Date(year, monthNumber - 1 + by, 1);

  return toPlanDate(date).slice(0, 7);
};

// The last day that can be planned, from today: the same day
// PLAN_MONTHS_AHEAD months on, or that month's last day if it's shorter.
export const lastPlannableDate = (today) => {
  const start = fromPlanDate(today);
  const monthEnd = new Date(start.getFullYear(), start.getMonth() + PLAN_MONTHS_AHEAD + 1, 0);

  monthEnd.setDate(Math.min(start.getDate(), monthEnd.getDate()));

  return toPlanDate(monthEnd);
};

// The month's weeks: [[cell x 7]], each cell { date, day, inMonth,
// isToday, selectable, planned } - selectable from today to the last
// plannable day; `plannedDates` a Set of dates with a plan.
export const monthGrid = (month, { today, lastDate, plannedDates = new Set() }) => {
  const first = `${month}-01`;
  // Monday = 0.
  const leading = (fromPlanDate(first).getDay() + 6) % 7;
  let date = addDaysToPlanDate(first, -leading);

  const weeks = [];

  do {
    const week = [];

    for (let column = 0; column < 7; column += 1) {
      week.push({
        date,
        day: Number(date.slice(8)),
        inMonth: monthOf(date) === month,
        isToday: date === today,
        selectable: date >= today && date <= lastDate,
        planned: plannedDates.has(date),
      });

      date = addDaysToPlanDate(date, 1);
    }

    weeks.push(week);
  } while (monthOf(date) === month);

  return weeks;
};

// "Friday 14 November".
export const dayTitle = (planDate) =>
  fromPlanDate(planDate).toLocaleDateString("en-GB", {
    weekday: "long",
    day: "numeric",
    month: "long",
  });

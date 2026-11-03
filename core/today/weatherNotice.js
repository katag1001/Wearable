// core/today/weatherNotice.js
//
// The message Today shows when few outfits fit the weather. The server
// decides the notice ({ level: "few" | "shopping", band: "cold" | "mild" |
// "hot" } - server/services/todaySelectionService.js); the words are in
// shared/todayMessages.json, so they can be edited without touching code.

import messages from "../../shared/todayMessages.json";

// The same message all day (no reshuffle on every reload): the day picks
// one of the band's messages.
const dayNumber = (date) =>
  Math.floor(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()) / 86400000);

// The text for today's notice, or null.
export const weatherNoticeText = (notice, date = new Date()) => {
  const options = messages[notice?.level]?.[notice?.band];

  if (!options?.length) return null;

  return options[dayNumber(date) % options.length];
};

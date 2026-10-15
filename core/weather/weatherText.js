// core/weather/weatherText.js

import { getTodayDayOfWeek } from "../utils/dates.js";
import { getWeatherEmoji } from "./weatherCodes.js";

const capitalise = (text) => text.charAt(0).toUpperCase() + text.slice(1);

// "Thursday · Autumn · 🌧️ 6°C - 12°C"
export const formatWeatherLine = ({ weather, season }) => {
  const emoji = getWeatherEmoji(weather.code);

  return [
    capitalise(getTodayDayOfWeek()),
    capitalise(season),
    `${emoji ? `${emoji} ` : ""}${weather.min}°C - ${weather.max}°C`,
  ].join(" · ");
};

// "Today's Work Outfit" / "Today's Outfit"
export const formatTodayTitle = (todayTag) =>
  todayTag ? `Today's ${capitalise(todayTag)} Outfit` : "Today's Outfit";

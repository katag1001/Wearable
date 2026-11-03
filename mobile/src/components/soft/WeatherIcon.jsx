// A Feather icon for the day's WMO weather code, in place of the emoji
// core/weather/weatherCodes.js gives the web. Nothing for a missing code.

import Feather from "@expo/vector-icons/Feather";

import { ink } from "../../theme/soft";

const iconFor = (code) => {
  if (code <= 2) return "sun";
  if (code <= 48) return "cloud";
  if (code <= 67) return "cloud-rain";
  if (code <= 77) return "cloud-snow";
  if (code <= 82) return "cloud-drizzle";
  if (code <= 86) return "cloud-snow";
  return "cloud-lightning";
};

export const WeatherIcon = ({ code, size = 20, color = ink.soft }) => {
  if (typeof code !== "number") return null;

  return <Feather name={iconFor(code)} size={size} color={color} />;
};

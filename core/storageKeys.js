// core/storageKeys.js
//
// Every storage key core/ uses. Same names as the web app has always used,
// so existing web sessions and caches carry on working.

export const STORAGE_KEYS = {
  // The login token and the logged-in user's email.
  token: "token",
  user: "user",

  // Today's forecast + location (core/weather/weatherCache.js).
  weather: "weather_cache",
  // Today's sorted outfits (core/today/todayCache.js).
  todayOutfits: "today_outfits_cache",
  // Today's shoe order and worn shoe (core/footwear/footwearCache.js).
  todayFootwear: "today_footwear_cache",
};

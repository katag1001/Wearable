// core/constants/daytimeHours.js
//
// The times (local, 24h "HH:MM") whose temperatures make up "today's
// weather", both ends included. The overnight low isn't what anyone wears
// clothes in, and outfit ranges are for daytime outdoors - so it's left
// out. Open-Meteo's readings are every 15 minutes, so keep both ends on a
// quarter hour.
export const DAYTIME_START = "07:30";
export const DAYTIME_END = "22:30";

// core/constants/daytimeHours.js
//
// The times (local, 24h "HH:MM") whose temperatures make up "today's
// weather", both ends included. The overnight low isn't what anyone wears
// clothes in, and outfit ranges are for daytime outdoors - so it's left
// out. The server works the forecast out over the same window
// (server/services/weather/forecastDays.js), so the numbers live in
// shared/daytimeHours.json.

import daytimeHours from "../../shared/daytimeHours.json";

export const DAYTIME_START = daytimeHours.start;
export const DAYTIME_END = daytimeHours.end;

// server/constants/planning.js
//
// The numbers behind the Plan tab (services/planService.js,
// services/dayOutfitService.js; context/planning-feature.md). The plans
// shown on the tab and the tags behind them: shared/planOccasions.json.

// The most outfits recommended for a planned day.
const PLAN_OUTFIT_LIMIT = 30;

// Outfits planned for another day this many days either side of the day
// being planned are left out of its recommendations.
const PLANNED_NEARBY_DAYS = 3;

// The time of day a passed planned day is marked worn at (the user's local
// noon), so a daylight-saving hour can't push it into another day.
const PASSED_PLAN_WORN_HOUR = 12;

module.exports = { PLAN_OUTFIT_LIMIT, PLANNED_NEARBY_DAYS, PASSED_PLAN_WORN_HOUR };

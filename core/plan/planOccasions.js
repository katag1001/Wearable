// core/plan/planOccasions.js
//
// What a planned day's recommendations are for: a plan ("Workday") or a
// single tag. The plans and the tags behind them are in
// shared/planOccasions.json - the user only ever sees the plan's name.
// Recommendations are only outfits with one of the tags
// (server/controllers/planControllers.js suggestForDay).

import planOccasions from "../../shared/planOccasions.json";
import { tagGroups } from "../constants/optionsBank.js";
import { getPreferences } from "../api/preferences.js";
import { todayTagFor } from "../today/todayInfo.js";
import { dayOfWeekOf } from "../utils/dates.js";

export const PLAN_OCCASIONS = planOccasions;

// Every tag, in the tag pickers' order.
export const ALL_TAGS = tagGroups.flatMap(({ tags }) => tags);

// "plan" or "tag" - how the day's outfits are picked.
export const CHOOSE_BY = [
  { key: "plan", label: "By plan" },
  { key: "tag", label: "By tag" },
];

// The tags a choice stands for: a plan's tags, or the tag itself.
export const tagsFor = (chooseBy, choice) => {
  if (!choice) return [];
  if (chooseBy === "tag") return [choice];

  return PLAN_OCCASIONS.find((plan) => plan.name === choice)?.tags ?? [];
};

// The day's tag from the weekly preferences (the default tag if none) -
// what a planned day's recommendations start on.
export const fetchTagForDay = async (planDate) => {
  try {
    const { data: preferences } = await getPreferences();

    return todayTagFor(preferences?.[dayOfWeekOf(planDate)]);
  } catch (err) {
    console.error("Failed to fetch the weekly preferences:", err);

    return todayTagFor(null);
  }
};

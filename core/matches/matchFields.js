// core/matches/matchFields.js
//
// Reading and writing the editable parts of an outfit.

import { seasonOptions } from "../constants/optionsBank.js";

export const TEMPERATURE_RANGE = { min: -20, max: 50 };

const capitalise = (word) => word.charAt(0).toUpperCase() + word.slice(1);

// "Spring, Summer" or "N/A". An outfit's seasons are worked out from its
// items (server/services/seasonalityService.js) - shown, never edited.
export const formatMatchSeasons = (match) =>
  seasonOptions
    .filter((season) => match[season])
    .map(capitalise)
    .join(", ") || "N/A";

// "5° - 18°"
export const formatMatchTemperature = (match) =>
  `${match.min_temp}° - ${match.max_temp}°`;

// The editor's starting values.
export const getMatchDraft = (match) => ({
  min_temp: match.min_temp ?? "",
  max_temp: match.max_temp ?? "",
  tags: match.tags || [],
  // Only shown for an outfit whose items allow tights (match.tights).
  wearWithTights: !match.noTights,
  // 1-5 stars, or null if not rated. Saved separately (rateMatch), only
  // when changed.
  rating: match.rating ?? null,
});

// What Save sends.
export const buildMatchUpdate = (draft) => ({
  min_temp: Number(draft.min_temp),
  max_temp: Number(draft.max_temp),
  tags: draft.tags,
  noTights: !draft.wearWithTights,
});

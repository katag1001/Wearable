// core/matches/matchActions.js
//
// The one-tap actions on an outfit card.

import { updateMatch } from "../api/matches.js";
import { wasRejectedToday } from "../today/outfitRejection.js";

// Marks the outfit (and every item in it) worn today - the same request
// the Today page sends. Wearing an outfit rejected earlier today takes
// the rejection back.
export const markMatchWorn = (match) =>
  updateMatch(match._id, {
    lastWornDate: new Date().toISOString(),
    undoRejection: wasRejectedToday(match),
  });

export const setMatchFavourite = (matchId, favourite) =>
  updateMatch(matchId, { favourite });

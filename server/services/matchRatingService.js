// server/services/matchRatingService.js
//
// The user's own verdict on an outfit: its star rating (1-5, from the Today
// page or the outfit edit page) and its favourite heart. Both set the
// stored score outright - whichever was done last decides it - and drop
// the favourite-item bonus, so favouriting one of its clothes can't nudge
// it any more. Numbers: constants/scoring.js.
//
//  - 3 / 4 / 5 stars: RATING_SCORES.
//  - 1-2 stars (LOW_RATING_MAX): the outfit is deleted - unless it's being
//    worn on the Today page or is user-made (LOW_RATED_KEPT_SCORE), or is
//    a favourite (LOW_RATED_FAVOURITE_SCORE). Wearing wins over favourite.
//  - Favourite: FAVOURITE_OUTFIT_SCORE. Unfavourite:
//    UNFAVOURITED_OUTFIT_SCORE. Neither changes the stars.
//
// A rated or favourite outfit is never penalised for being swiped past
// (matchRejectionService.js) and counts as protected from the app's
// automatic rematching (matchProtection.js).

const {
  RATING_SCORES,
  LOW_RATING_MAX,
  LOW_RATED_FAVOURITE_SCORE,
  LOW_RATED_KEPT_SCORE,
  FAVOURITE_OUTFIT_SCORE,
  UNFAVOURITED_OUTFIT_SCORE,
} = require("../constants/scoring.js");

const MIN_RATING = 1;
const MAX_RATING = 5;

const isValidRating = (rating) =>
  Number.isInteger(rating) && rating >= MIN_RATING && rating <= MAX_RATING;

const isRated = (match) => match?.rating != null;

// The user set this score themselves (a rating or the favourite heart).
const hasUserScore = (match) => !!match?.favourite || isRated(match);

// The score a rating gives this outfit, or null if it's to be deleted.
// `wearing`: rated as it's worn on the Today page.
const scoreForRating = (match, rating, { wearing = false } = {}) => {
  if (rating > LOW_RATING_MAX) return RATING_SCORES[rating];

  if (wearing || (match.userMade && !match.favourite)) return LOW_RATED_KEPT_SCORE;

  if (match.favourite) return LOW_RATED_FAVOURITE_SCORE;

  return null;
};

// Rates the match in place. Returns false if it's to be deleted instead
// (left unchanged).
const applyRating = (match, rating, options) => {
  const score = scoreForRating(match, rating, options);

  if (score === null) return false;

  match.rating = rating;
  match.score = score;
  match.favouriteItemBonus = 0;

  return true;
};

// After the match's `favourite` changed (already set on it).
const applyFavouriteScore = (match) => {
  match.score = match.favourite ? FAVOURITE_OUTFIT_SCORE : UNFAVOURITED_OUTFIT_SCORE;
  match.favouriteItemBonus = 0;
};

module.exports = {
  isValidRating,
  isRated,
  hasUserScore,
  scoreForRating,
  applyRating,
  applyFavouriteScore,
};

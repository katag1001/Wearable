// core/matches/rating.js
//
// An outfit's star rating (match.rating: 1-5, or null if not rated). What
// each rating does to the outfit is decided on the server:
// server/services/matchRatingService.js.

export const RATING_STARS = [1, 2, 3, 4, 5];

// This many stars or fewer deletes the outfit, unless it's a favourite or
// user-made (the same as LOW_RATING_MAX in server/constants/scoring.js -
// change both together). Rated on the outfit screen, not while being worn
// on Today, which keeps it too.
export const LOW_RATING_MAX = 2;

// Whether saving `rating` would delete `match` - worth asking first.
export const ratingDeletesOutfit = (match, rating) =>
  rating != null &&
  rating <= LOW_RATING_MAX &&
  !match.favourite &&
  !match.userMade;

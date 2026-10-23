const test = require("node:test");
const assert = require("node:assert/strict");

const {
  isValidRating,
  hasUserScore,
  scoreForRating,
  applyRating,
  applyFavouriteScore,
} = require("../services/matchRatingService.js");

const outfit = (extra = {}) => ({
  score: 74,
  favouriteItemBonus: 7,
  rating: null,
  favourite: false,
  userMade: false,
  ...extra,
});

test("isValidRating accepts whole numbers 1 to 5 only", () => {
  [1, 2, 3, 4, 5].forEach((rating) => assert.equal(isValidRating(rating), true, rating));
  [0, 6, 2.5, "3", null, undefined].forEach((rating) =>
    assert.equal(isValidRating(rating), false, String(rating))
  );
});

test("3, 4 and 5 stars set the score to 70, 85 and 100 for any outfit", () => {
  for (const extra of [{}, { favourite: true }, { userMade: true }]) {
    assert.equal(scoreForRating(outfit(extra), 3), 70);
    assert.equal(scoreForRating(outfit(extra), 4), 85);
    assert.equal(scoreForRating(outfit(extra), 5), 100);
  }
});

test("1 or 2 stars deletes an ordinary outfit, worn before or not", () => {
  assert.equal(scoreForRating(outfit(), 1), null);
  assert.equal(scoreForRating(outfit({ timesWorn: 3, userEdited: true }), 2), null);
});

test("1 or 2 stars keeps a favourite at 70 and a user-made outfit at 60", () => {
  assert.equal(scoreForRating(outfit({ favourite: true }), 2), 70);
  assert.equal(scoreForRating(outfit({ userMade: true }), 1), 60);
  assert.equal(scoreForRating(outfit({ favourite: true, userMade: true }), 1), 70);
});

test("1 or 2 stars while wearing it on Today keeps any outfit at 60", () => {
  for (const extra of [{}, { favourite: true }, { userMade: true }]) {
    assert.equal(scoreForRating(outfit(extra), 2, { wearing: true }), 60);
  }
});

test("applyRating saves the rating and score and drops the favourite-item bonus", () => {
  const match = outfit();

  assert.equal(applyRating(match, 4), true);
  assert.deepEqual(
    { rating: match.rating, score: match.score, favouriteItemBonus: match.favouriteItemBonus },
    { rating: 4, score: 85, favouriteItemBonus: 0 }
  );
});

test("applyRating leaves an outfit that's to be deleted unchanged", () => {
  const match = outfit({ rating: 5, score: 100 });

  assert.equal(applyRating(match, 1), false);
  assert.deepEqual(match, outfit({ rating: 5, score: 100 }));
});

test("favouriting sets the score to 100 and unfavouriting to 85, without touching the stars", () => {
  const match = outfit({ rating: 3, score: 70, favourite: true });

  applyFavouriteScore(match);
  assert.deepEqual([match.score, match.rating, match.favouriteItemBonus], [100, 3, 0]);

  match.favourite = false;
  applyFavouriteScore(match);
  assert.deepEqual([match.score, match.rating], [85, 3]);
});

test("whichever of rating and favouriting came last decides the score", () => {
  const match = outfit({ favourite: true });

  applyFavouriteScore(match);
  applyRating(match, 4);
  assert.equal(match.score, 85);

  applyRating(match, 5);
  assert.equal(match.score, 100);
});

test("hasUserScore is true for rated or favourite outfits", () => {
  assert.equal(hasUserScore(outfit()), false);
  assert.equal(hasUserScore(outfit({ rating: 3 })), true);
  assert.equal(hasUserScore(outfit({ favourite: true })), true);
});

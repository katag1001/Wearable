const test = require("node:test");
const assert = require("node:assert/strict");

const {
  favouriteItemBonusFor,
  favouriteItemIds,
  applyFavouriteItemBonus,
} = require("../services/favouriteItemService.js");

test("favouriteItemBonusFor adds 7, but never above the automatic cap of 90", () => {
  assert.equal(favouriteItemBonusFor(70), 7);
  assert.equal(favouriteItemBonusFor(83), 7);
  assert.equal(favouriteItemBonusFor(88), 2);
  assert.equal(favouriteItemBonusFor(90), 0);
});

test("favouriteItemIds keeps only the favourite items, as strings", () => {
  const ids = favouriteItemIds([
    { _id: 1, favourite: true },
    { _id: 2, favourite: false },
    { _id: 3 },
  ]);

  assert.deepEqual([...ids], ["1"]);
});

test("applyFavouriteItemBonus adds the bonus once to outfits with a favourite item", () => {
  const favourites = new Set(["a", "b"]);

  const [plain, oneFavourite, twoFavourites, nearCap] = applyFavouriteItemBonus(
    [
      { clothes: ["x", "y"], score: 80 },
      { clothes: ["a", "y"], score: 80 },
      { clothes: ["a", "b"], score: 80 },
      { clothes: ["a", "y"], score: 86 },
    ],
    favourites
  );

  assert.equal(plain.score, 80);
  assert.equal(plain.favouriteItemBonus, undefined);
  assert.deepEqual([oneFavourite.score, oneFavourite.favouriteItemBonus], [87, 7]);
  assert.deepEqual([twoFavourites.score, twoFavourites.favouriteItemBonus], [87, 7]);
  assert.deepEqual([nearCap.score, nearCap.favouriteItemBonus], [90, 4]);
});

test("applyFavouriteItemBonus leaves user-made outfits alone", () => {
  const [match] = applyFavouriteItemBonus(
    [{ clothes: ["a"], score: 95, userMade: true }],
    new Set(["a"])
  );

  assert.equal(match.score, 95);
});

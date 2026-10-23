const test = require("node:test");
const assert = require("node:assert/strict");

const { areMismatched, hasMismatchedPair } = require("../services/mismatchRules.js");
const { parseMismatchPair, mismatchedOutfitsFilter } = require("../services/mismatchService.js");
const { UNPROTECTED_MATCH_FILTER } = require("../services/matchProtection.js");

const ID_A = "64b000000000000000000001";
const ID_B = "64b000000000000000000002";
const ID_C = "64b000000000000000000003";

const item = (_id, mismatchedWith) => ({ _id, mismatchedWith });

test("areMismatched is true when either item lists the other", () => {
  assert.equal(areMismatched(item(ID_A, [ID_B]), item(ID_B, [])), true);
  assert.equal(areMismatched(item(ID_A, []), item(ID_B, [ID_A])), true);
});

test("areMismatched is false for items with no or other mismatches", () => {
  assert.equal(areMismatched(item(ID_A, undefined), item(ID_B, undefined)), false);
  assert.equal(areMismatched(item(ID_A, [ID_C]), item(ID_B, [ID_C])), false);
});

test("hasMismatchedPair finds a mismatch anywhere in the outfit", () => {
  const outfit = [item(ID_A, []), item(ID_B, [ID_C]), item(ID_C, [ID_B])];

  assert.equal(hasMismatchedPair(outfit), true);
  assert.equal(hasMismatchedPair(outfit.slice(0, 2)), false);
});

test("parseMismatchPair takes two different items from the outfit", () => {
  assert.deepEqual(parseMismatchPair([ID_A, ID_B], [ID_A, ID_B, ID_C]), [ID_A, ID_B]);
});

test("parseMismatchPair rejects anything but two different items from the outfit", () => {
  const outfit = [ID_A, ID_B];

  assert.equal(parseMismatchPair([ID_A], outfit), null);
  assert.equal(parseMismatchPair([ID_A, ID_B, ID_C], outfit), null);
  assert.equal(parseMismatchPair([ID_A, ID_A], outfit), null);
  assert.equal(parseMismatchPair([ID_A, ID_C], outfit), null);
  assert.equal(parseMismatchPair("not a list", outfit), null);
});

test("mismatchedOutfitsFilter keeps protected outfits, apart from the one on screen", () => {
  const filter = mismatchedOutfitsFilter("user1", "match1", [ID_A, ID_B]);

  assert.deepEqual(filter, {
    userId: "user1",
    clothes: { $all: [ID_A, ID_B] },
    $or: [
      { _id: "match1" },
      UNPROTECTED_MATCH_FILTER,
    ],
  });
});

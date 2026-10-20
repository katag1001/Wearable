const test = require("node:test");
const assert = require("node:assert/strict");

const { pickFields } = require("../services/requestFields.js");
const {
  CLOTHING_FIELDS,
  FOOTWEAR_FIELDS,
  MATCH_FIELDS,
  WORN_SNAPSHOT_FIELDS,
} = require("../constants/editableFields.js");

test("pickFields keeps only the allowed fields the body sends", () => {
  assert.deepEqual(
    pickFields({ name: "Shirt", userId: "someone", favourite: false }, ["name", "favourite", "tags"]),
    { name: "Shirt", favourite: false }
  );
});

test("pickFields treats a missing or non-object body as empty", () => {
  assert.deepEqual(pickFields(undefined, ["name"]), {});
  assert.deepEqual(pickFields("name", ["name"]), {});
});

test("pickFields ignores inherited properties", () => {
  const body = Object.create({ userId: "someone" });

  assert.deepEqual(pickFields(body, ["userId"]), {});
});

test("no editable list lets a request set the owner, scores or outfit clothes", () => {
  const serverOnly = [
    "_id",
    "userId",
    "__v",
    "clothes",
    "clothesKey",
    "score",
    "favouriteItemBonus",
    "rejectedCount",
    "lastRejectedDate",
    "userMade",
  ];

  [CLOTHING_FIELDS, FOOTWEAR_FIELDS, MATCH_FIELDS, WORN_SNAPSHOT_FIELDS].forEach((list) => {
    serverOnly.forEach((field) => assert.equal(list.includes(field), false, field));
  });
});

const test = require("node:test");
const assert = require("node:assert/strict");

const {
  parseFootwearQuery,
  buildFootwearFilter,
  listOwnedSubtypes,
} = require("../services/footwearQueryService.js");

const USER = "user-1";

test("buildFootwearFilter with no filters returns all of the user's footwear", () => {
  assert.deepEqual(
    buildFootwearFilter(USER, parseFootwearQuery({ page: "1" })),
    { userId: USER }
  );
});

test("parseFootwearQuery ignores a clothing type", () => {
  assert.equal(parseFootwearQuery({ type: "top" }).type, undefined);
  assert.deepEqual(
    buildFootwearFilter(USER, parseFootwearQuery({ type: "top" })),
    { userId: USER }
  );
});

test("buildFootwearFilter combines any-of seasons, colours, tags and subtypes", () => {
  const filter = buildFootwearFilter(
    USER,
    parseFootwearQuery({
      seasons: "winter,autumn",
      colors: "Black",
      tags: "Work,Everyday",
      subtypes: "Ankle boots,Loafers",
    })
  );

  assert.deepEqual(filter.$and, [
    { $or: [{ winter: true }, { autumn: true }] },
    { colors: { $in: ["Black"] } },
    { tags: { $in: ["Work", "Everyday"] } },
    { subtype: { $in: ["Ankle boots", "Loafers"] } },
  ]);
});

test("buildFootwearFilter searches name, colours and styles, case-insensitively", () => {
  const filter = buildFootwearFilter(
    USER,
    parseFootwearQuery({ search: " CHELSEA " })
  );

  const [search] = filter.$and;
  const [name] = search.$or;

  assert.ok(name.name.test("Brown chelsea boots"));
  assert.ok(!name.name.test("Black trainers"));
});

test("listOwnedSubtypes drops blanks and duplicates and sorts A-Z", () => {
  assert.deepEqual(
    listOwnedSubtypes(["Casual trainers", "", "Ankle boots", "Casual trainers", null]),
    ["Ankle boots", "Casual trainers"]
  );
});

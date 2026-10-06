const test = require("node:test");
const assert = require("node:assert/strict");

const {
  parseClothingQuery,
  buildClothingFilter,
  groupSubtypesByType,
} = require("../services/clothingQueryService.js");

const USER = "user-1";

test("buildClothingFilter with no filters returns all of the user's clothes", () => {
  assert.deepEqual(
    buildClothingFilter(USER, parseClothingQuery({ page: "1" })),
    { userId: USER }
  );
});

test("parseClothingQuery ignores an unknown type", () => {
  assert.equal(parseClothingQuery({ type: "hat" }).type, null);
  assert.equal(parseClothingQuery({ type: "outer" }).type, "outer");
});

test("buildClothingFilter combines type, any-of seasons, colours and styles", () => {
  const filter = buildClothingFilter(
    USER,
    parseClothingQuery({
      type: "top",
      seasons: "summer,spring",
      colors: "blue,red",
      styles: "casual",
    })
  );

  assert.deepEqual(filter.$and, [
    { type: "top" },
    { $or: [{ summer: true }, { spring: true }] },
    { colors: { $in: ["blue", "red"] } },
    { styles: { $in: ["casual"] } },
  ]);
});

test("buildClothingFilter searches name, colours and styles, case-insensitively", () => {
  const filter = buildClothingFilter(
    USER,
    parseClothingQuery({ search: " LINEN " })
  );

  const [search] = filter.$and;
  const [name, colors, styles] = search.$or;

  assert.ok(name.name.test("White linen shirt"));
  assert.ok(colors.colors.test("linen"));
  assert.ok(styles.styles.test("Linen"));
  assert.ok(!name.name.test("Lined jacket"));
});

test("buildClothingFilter keeps items with any chosen tag and any chosen subtype", () => {
  const filter = buildClothingFilter(
    USER,
    parseClothingQuery({
      tags: "Work,Party",
      subtypes: "Jeans,Hoodie/sweatshirt",
    })
  );

  assert.deepEqual(filter.$and, [
    { tags: { $in: ["Work", "Party"] } },
    { subtype: { $in: ["Jeans", "Hoodie/sweatshirt"] } },
  ]);
});

test("groupSubtypesByType lists each owned subtype once, A-Z, under its type", () => {
  const grouped = groupSubtypesByType([
    { type: "top", subtype: "T-shirt" },
    { type: "top", subtype: "Shirt" },
    { type: "top", subtype: "T-shirt" },
    { type: "bottom", subtype: "Jeans" },
    { type: "hat", subtype: "Beanie" },
  ]);

  assert.deepEqual(grouped, {
    top: ["Shirt", "T-shirt"],
    outer: [],
    bottom: ["Jeans"],
    onepiece: [],
  });
});

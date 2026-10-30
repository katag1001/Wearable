const test = require("node:test");
const assert = require("node:assert/strict");

const { computeMatchTags, hasSharedTag } = require("../services/helpers.js");

const item = (type, subtype, tags) => ({ type, subtype, tags });

test("an outfit's tags are the overlap of its tops, bottoms and onepieces", () => {
  const shirt = item("top", "Buttondown shirt", ["Elevated everyday", "Smart casual", "Formal office"]);
  const jeans = item("bottom", "Wide leg jeans", ["Comfy casual", "Elevated everyday", "Smart casual"]);
  const trousers = item("bottom", "Tailored trousers", ["Elevated everyday", "Smart casual", "Formal office"]);

  assert.deepEqual(computeMatchTags([shirt, jeans]), ["Elevated everyday", "Smart casual"]);
  assert.deepEqual(computeMatchTags([shirt, trousers]), ["Elevated everyday", "Smart casual", "Formal office"]);
});

test("outers never narrow an outfit's tags", () => {
  const tee = item("top", "Short t-shirt", ["Comfy casual", "Beach / pool"]);
  const shorts = item("bottom", "Denim shorts", ["Comfy casual", "Beach / pool"]);
  const coat = item("outer", "Wool coat", ["Elevated everyday"]);

  assert.deepEqual(computeMatchTags([tee, shorts, coat]), ["Comfy casual", "Beach / pool"]);
  assert.equal(hasSharedTag([tee, shorts, coat]), true);
});

test("a set of outers only always shares a tag (a part-built outfit)", () => {
  assert.equal(hasSharedTag([item("outer", "Classic trench", [])]), true);
});

test("Formal office needs a blazer for men only", () => {
  const shirt = item("top", "Buttondown shirt", ["Smart casual", "Formal office"]);
  const trousers = item("bottom", "Tailored trousers", ["Smart casual", "Formal office"]);
  const blazer = item("outer", "Tailored blazer", ["Formal office"]);

  assert.deepEqual(computeMatchTags([shirt, trousers], "man"), ["Smart casual"]);
  assert.deepEqual(computeMatchTags([shirt, trousers, blazer], "man"), ["Smart casual", "Formal office"]);
  assert.deepEqual(computeMatchTags([shirt, trousers], "woman"), ["Smart casual", "Formal office"]);
});

test("Formal / black tie needs a formal dress, or formal bottoms with a blazer", () => {
  const gown = item("onepiece", "Evening dress", ["Formal / black tie"]);
  const shirt = item("top", "Buttondown shirt", ["Formal / black tie"]);
  const trousers = item("bottom", "Tailored trousers", ["Formal / black tie"]);
  const blazer = item("outer", "Tailored blazer", []);

  assert.deepEqual(computeMatchTags([gown], "woman"), ["Formal / black tie"]);
  assert.deepEqual(computeMatchTags([shirt, trousers], "woman"), []);
  assert.deepEqual(computeMatchTags([shirt, trousers, blazer], "woman"), ["Formal / black tie"]);
});

test("the search check ignores requirements, so a later blazer can still complete the outfit", () => {
  const shirt = item("top", "Buttondown shirt", ["Formal office"]);
  const trousers = item("bottom", "Tailored trousers", ["Formal office"]);

  assert.equal(hasSharedTag([shirt, trousers]), true);
  assert.deepEqual(computeMatchTags([shirt, trousers], "man"), []);
});

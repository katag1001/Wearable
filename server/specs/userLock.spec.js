const test = require("node:test");
const assert = require("node:assert/strict");

const { withUserLock } = require("../services/userLock.js");

const tick = () => new Promise((resolve) => setTimeout(resolve, 5));

test("work for the same user runs one at a time, in order", async () => {
  const log = [];
  const work = (name) => async () => {
    log.push(`${name} start`);
    await tick();
    log.push(`${name} end`);
    return name;
  };

  const results = await Promise.all([
    withUserLock("u1", work("a")),
    withUserLock("u1", work("b")),
  ]);

  assert.deepEqual(results, ["a", "b"]);
  assert.deepEqual(log, ["a start", "a end", "b start", "b end"]);
});

test("a failed run doesn't block the next one", async () => {
  await assert.rejects(withUserLock("u2", async () => { throw new Error("boom"); }));
  assert.equal(await withUserLock("u2", async () => "ok"), "ok");
});

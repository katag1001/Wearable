const test = require("node:test");
const assert = require("node:assert/strict");

const {
  backgroundChoice,
  removesBackground,
  cutoutFailureOf,
} = require("../services/phoneCutoutService.js");

test("the background is removed by Cloudflare unless the phone says otherwise", () => {
  assert.equal(backgroundChoice({ uploadKey: "x" }), "remove");
  assert.equal(backgroundChoice(undefined), "remove");
  assert.equal(removesBackground({ uploadKey: "x" }), true);
});

test("a phone cut-out or the photo as taken skips Cloudflare", () => {
  assert.equal(backgroundChoice({ background: "phone" }), "phone");
  assert.equal(backgroundChoice({ background: "none" }), "none");
  assert.equal(removesBackground({ background: "phone" }), false);
  assert.equal(removesBackground({ background: "none" }), false);
});

test("anything else sent as the background still means remove", () => {
  assert.equal(backgroundChoice({ background: "PHONE" }), "remove");
  assert.equal(backgroundChoice({ background: "keep" }), "remove");
  assert.equal(backgroundChoice({ background: { $ne: 1 } }), "remove");
  assert.equal(removesBackground({ background: 3 }), true);
});

test("a failure report is cleaned up for the log", () => {
  assert.equal(cutoutFailureOf({}), null);
  assert.equal(cutoutFailureOf({ cutoutFailure: "oops" }), null);

  assert.deepEqual(
    cutoutFailureOf({ cutoutFailure: { reason: "Took too long", platform: "android", osVersion: 34 } }),
    { reason: "Took too long", platform: "android", osVersion: "34" }
  );

  const odd = cutoutFailureOf({ cutoutFailure: { reason: "x".repeat(5000), platform: { a: 1 } } });
  assert.equal(odd.reason.length, 300);
  assert.equal(odd.platform, "unknown");
  assert.equal(odd.osVersion, "unknown");
});

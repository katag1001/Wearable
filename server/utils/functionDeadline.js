// server/utils/functionDeadline.js
//
// How long the current Vercel function invocation has left before Vercel
// stops it (its maxDuration, shared with waitUntil work). Outside Vercel -
// local server, scripts, tests - there's no deadline, so it's Infinity.

const { getDeadline } = require("@vercel/functions");

function msUntilDeadline(now = Date.now()) {
  const deadline = getDeadline();

  return deadline ? deadline.getTime() - now : Infinity;
}

module.exports = { msUntilDeadline };

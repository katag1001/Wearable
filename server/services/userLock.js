// server/services/userLock.js
//
// Runs async work for one user at a time. createToday uses it so two
// requests arriving together (the app starting up can send more than one)
// don't both see "no list yet" and each save a full list. In-process only,
// which is enough for a single server.

const running = new Map();

function withUserLock(userId, work) {
  const key = String(userId);
  const previous = running.get(key) || Promise.resolve();
  const next = previous.catch(() => {}).then(work);

  // Clear the slot once this is the last queued run.
  const settled = next.catch(() => {});
  running.set(key, settled);
  settled.then(() => {
    if (running.get(key) === settled) running.delete(key);
  });

  return next;
}

module.exports = { withUserLock };

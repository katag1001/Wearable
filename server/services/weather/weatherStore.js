// server/services/weather/weatherStore.js
//
// The shared weather cache in MongoDB (models: WeatherCache): areas'
// forecasts and typical-weather tables, a "someone is fetching this" lock
// per area, and the per-second count of calls to MET Norway. Shared by
// every copy of the server Vercel runs, which is why the count can't just
// be kept in memory.

const { WeatherCache } = require("../../models/AllModels.js");
const {
  FETCH_LOCK_MS,
  MET_CALLS_PER_SECOND,
  WAIT_FOR_SLOT_MS,
} = require("../../constants/weather.js");

const DUPLICATE_KEY = 11000;
const PAUSE_ID = "met-pause";

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

const getEntry = (id) => WeatherCache.findById(id).lean();

// Saves an area's entry (keeping it `keepMs` before MongoDB deletes it).
const saveEntry = (id, fields, keepMs) =>
  WeatherCache.updateOne(
    { _id: id },
    { $set: { ...fields, deleteAt: new Date(Date.now() + keepMs) } },
    { upsert: true }
  );

// true if this request may fetch the area (no one else is right now).
const claimFetchLock = async (id, keepMs) => {
  const now = new Date();

  try {
    const claimed = await WeatherCache.findOneAndUpdate(
      { _id: id, $or: [{ lockUntil: null }, { lockUntil: { $lt: now } }] },
      {
        $set: { lockUntil: new Date(now.getTime() + FETCH_LOCK_MS) },
        $setOnInsert: { deleteAt: new Date(now.getTime() + keepMs) },
      },
      { upsert: true, returnDocument: "after" }
    ).lean();

    return Boolean(claimed);
  } catch (error) {
    // Locked by someone else (the upsert collided with their document).
    if (error.code === DUPLICATE_KEY) return false;
    throw error;
  }
};

const releaseFetchLock = (id) => WeatherCache.updateOne({ _id: id }, { $unset: { lockUntil: 1 } });

// Waits up to `ms` for another request to finish fetching the area; the
// entry once it has `data`, else null.
const waitForData = async (id, ms) => {
  const giveUpAt = Date.now() + ms;

  while (Date.now() < giveUpAt) {
    await sleep(300);
    const entry = await getEntry(id);
    if (entry?.data) return entry;
  }

  return null;
};

// One more call to MET Norway this second, if that keeps us within
// MET_CALLS_PER_SECOND; otherwise waits for the next second, for up to
// WAIT_FOR_SLOT_MS. false if there was no room in time.
const claimMetSlot = async () => {
  const giveUpAt = Date.now() + WAIT_FOR_SLOT_MS;

  for (;;) {
    const now = Date.now();
    const second = Math.floor(now / 1000);

    try {
      const slot = await WeatherCache.findOneAndUpdate(
        { _id: `met-rate:${second}` },
        { $inc: { count: 1 }, $setOnInsert: { kind: "rate", deleteAt: new Date(now + 60 * 1000) } },
        { upsert: true, returnDocument: "after" }
      ).lean();

      if (slot.count <= MET_CALLS_PER_SECOND) return true;
    } catch (error) {
      // Two requests created this second's counter at once: try again.
      if (error.code !== DUPLICATE_KEY) throw error;
      continue;
    }

    const nextSecond = (second + 1) * 1000 + Math.floor(Math.random() * 50);
    if (nextSecond > giveUpAt) return false;
    await sleep(nextSecond - Date.now());
  }
};

// Whether MET Norway calls are paused (after a 429 / 403).
const isMetPaused = async () => {
  const pause = await getEntry(PAUSE_ID);

  return Boolean(pause?.freshUntil && pause.freshUntil > new Date());
};

const pauseMet = (ms) =>
  saveEntry(PAUSE_ID, { kind: "pause", freshUntil: new Date(Date.now() + ms) }, ms + 60 * 1000);

module.exports = {
  getEntry,
  saveEntry,
  claimFetchLock,
  releaseFetchLock,
  waitForData,
  claimMetSlot,
  isMetPaused,
  pauseMet,
};

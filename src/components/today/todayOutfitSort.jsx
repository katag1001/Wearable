const STORAGE_KEY = "weather_cache";

/* -------------------------
   SCORING CONFIG
------------------------- */

const SCORE_WEIGHTS = {
  temperature: 0.10,
  clothingFreshness: 0.30,
  outfitFreshness: 0.15,
  userMade: 0.45,
};


/* -------------------------
   WEATHER
------------------------- */

const getCachedWeather = () => {
  try {
    const cached = JSON.parse(localStorage.getItem(STORAGE_KEY));

    if (!cached?.weather) return null;

    return cached.weather;
  } catch {
    return null;
  }
};


/* -------------------------
   DATE HELPERS
------------------------- */

const getClothingDates = (outfit) => {
  return (outfit.matchId?.clothes || [])
    .map((item) =>
      item.lastWornDate
        ? new Date(item.lastWornDate).getTime()
        : null
    );
};


/*
 * Returns the number of days since a date.
 *
 * Never-worn items return null.
 */
const getDaysSince = (date) => {
  if (!date) return null;

  const dateTime = new Date(date).getTime();

  if (Number.isNaN(dateTime)) return null;

  const now = Date.now();

  return Math.max(
    0,
    (now - dateTime) / (1000 * 60 * 60 * 24)
  );
};


/* -------------------------
   TEMPERATURE SCORE
------------------------- */

/*
 * 10 = perfect temperature match
 * 0 = very poor temperature match
 *
 * The score is based on how far the outfit's
 * min/max temperatures are from today's
 * actual min/max temperatures.
 */
const getTemperatureScore = (match, weather) => {
  if (!weather || !match) return 0;

  const minDifference = Math.abs(
    match.min_temp - weather.min
  );

  const maxDifference = Math.abs(
    match.max_temp - weather.max
  );

  const totalDifference =
    minDifference + maxDifference;

  /*
   * 0°C total difference = 10 points
   * 10°C total difference = 5 points
   * 20°C total difference = 0 points
   *
   * You can make this more/less aggressive by
   * changing 20 below.
   */
  const score = Math.max(
    0,
    10 - (totalDifference / 20) * 10
  );

  return score;
};


/* -------------------------
   CLOTHING FRESHNESS SCORE
------------------------- */

/*
 * Scores the individual clothing items.
 *
 * Never worn = 10
 *
 * Otherwise:
 * 0 days ago   = 0
 * 30+ days ago = 10
 *
 * The outfit score is the average of all its
 * clothing items.
 */
const getClothingFreshnessScore = (outfit) => {
  const clothes = outfit.matchId?.clothes || [];

  if (!clothes.length) {
    return 0;
  }

  const scores = clothes.map((item) => {
    const daysSince = getDaysSince(item.lastWornDate);

    // Never worn
    if (daysSince === null) {
      return 10;
    }

    // Cap at 30 days
    return Math.min(10, (daysSince / 30) * 10);
  });

  const score =
    scores.reduce((sum, value) => sum + value, 0) /
    scores.length;

  return score;
};


/* -------------------------
   WHOLE OUTFIT FRESHNESS
------------------------- */

/*
 * Never worn = 10
 *
 * Otherwise:
 * 0 days ago   = 0
 * 30+ days ago = 10
 */
const getOutfitFreshnessScore = (match) => {
  if (!match) return 0;

  const daysSince = getDaysSince(match.lastWornDate);

  // Never worn
  if (daysSince === null) {
    return 10;
  }

  return Math.min(10, (daysSince / 30) * 10);
};


/* -------------------------
   USER-MADE SCORE
------------------------- */

const getUserMadeScore = (match) => {
  return match?.userMade ? 10 : 0;
};


/* -------------------------
   TAG MATCH
------------------------- */

/*
 * Tags do NOT contribute to the score.
 *
 * This only determines whether an outfit
 * belongs to today's preferred-tag pool.
 */
const hasTodayTag = (match, todayTag) => {
  if (!todayTag) return false;

  const normalizedTodayTag = todayTag
    .trim()
    .toLowerCase();

  const matchTags = (match?.tags || []).map((tag) =>
    tag.trim().toLowerCase()
  );

  return matchTags.includes(normalizedTodayTag);
};


/* -------------------------
   OVERALL SCORE
------------------------- */

const getOverallScore = (scores) => {
  const score =
    scores.temperature *
      SCORE_WEIGHTS.temperature +
    scores.clothingFreshness *
      SCORE_WEIGHTS.clothingFreshness +
    scores.outfitFreshness *
      SCORE_WEIGHTS.outfitFreshness +
    scores.userMade *
      SCORE_WEIGHTS.userMade;

  return score;
};


/* -------------------------
   SCORE OUTFIT
------------------------- */

const scoreOutfit = (outfit, weather) => {
  const match = outfit.matchId;

  const scores = {
    temperature: getTemperatureScore(match, weather),

    clothingFreshness:
      getClothingFreshnessScore(outfit),

    outfitFreshness:
      getOutfitFreshnessScore(match),

    userMade:
      getUserMadeScore(match),
  };

  const overall = getOverallScore(scores);

  return {
    ...scores,
    overall,
  };
};


/* -------------------------
   TODAY OUTFIT SORT
------------------------- */

const todayOutfitSort = (outfits, todayTag = null) => {
  if (!Array.isArray(outfits)) return [];

  const weather = getCachedWeather();

  /*
   * -----------------------------------------
   * 1. TAG FILTER
   * -----------------------------------------
   *
   * Tags don't affect the score.
   *
   * If at least one outfit matches today's tag,
   * ONLY those outfits are considered.
   *
   * If none match, all outfits are considered.
   */
  let candidates = [...outfits];

  if (todayTag) {
    const taggedOutfits = candidates.filter((outfit) =>
      hasTodayTag(outfit.matchId, todayTag)
    );

    if (taggedOutfits.length > 0) {
      candidates = taggedOutfits;
    }
  }


  /*
   * -----------------------------------------
   * 2. SCORE EVERY CANDIDATE
   * -----------------------------------------
   */

  const scoredOutfits = candidates.map((outfit) => {
    const scores = scoreOutfit(outfit, weather);

    return {
      outfit,
      scores,
    };
  });


  /*
   * -----------------------------------------
   * 3. CONSOLE LOG SCORES
   * -----------------------------------------
   */

  scoredOutfits.forEach(({ outfit, scores }) => {
    const match = outfit.matchId;

    console.log(
      "OUTFIT SCORE",
      match?._id || match?.id || "unknown"
    );

    console.log(
      "temp-score:",
      scores.temperature.toFixed(1)
    );

    console.log(
      "clothing-freshness-score:",
      scores.clothingFreshness.toFixed(1)
    );

    console.log(
      "outfit-freshness-score:",
      scores.outfitFreshness.toFixed(1)
    );

    console.log(
      "user-made-score:",
      scores.userMade.toFixed(1)
    );

    console.log(
      "overall-score:",
      scores.overall.toFixed(1)
    );

    console.log("-------------------------");
  });


  /*
   * -----------------------------------------
   * 4. SORT BY OVERALL SCORE
   * -----------------------------------------
   */

  scoredOutfits.sort(
    (a, b) => b.scores.overall - a.scores.overall
  );


  /*
   * -----------------------------------------
   * 5. RETURN ORIGINAL OUTFIT OBJECTS
   * -----------------------------------------
   */

  return scoredOutfits.map(({ outfit }) => outfit);
};


export default todayOutfitSort;

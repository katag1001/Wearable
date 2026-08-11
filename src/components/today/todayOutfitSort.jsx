const STORAGE_KEY = "weather_cache";

const getCachedWeather = () => {
  try {
    const cached = JSON.parse(localStorage.getItem(STORAGE_KEY));

    if (!cached?.weather) return null;

    return cached.weather;
  } catch {
    return null;
  }
};

const getClothingDates = (outfit) => {
  return (outfit.matchId?.clothes || [])
    .map((item) =>
      item.lastWornDate ? new Date(item.lastWornDate).getTime() : null
    )
    .sort((a, b) => {
      // Never worn items first
      if (a === null && b === null) return 0;
      if (a === null) return -1;
      if (b === null) return 1;

      // Older dates first
      return a - b;
    });
};

const compareClothingDates = (aDates, bDates) => {
  const max = Math.max(aDates.length, bDates.length);

  for (let i = 0; i < max; i++) {
    const a = aDates[i];
    const b = bDates[i];

    if (a === undefined && b === undefined) return 0;
    if (a === undefined) return 1;
    if (b === undefined) return -1;

    if (a === null && b !== null) return -1;
    if (a !== null && b === null) return 1;

    if (a !== b) return a - b;
  }

  return 0;
};


/* -------------------------
   TODAY'S TAG
------------------------- */

const getTagScore = (match, todayTag) => {
  // If there is no preference for today,
  // don't give any outfit a tag advantage.
  if (!todayTag) return 1;

  const normalizedTodayTag = todayTag.trim().toLowerCase();

  const matchTags = (match?.tags || []).map((tag) =>
    tag.trim().toLowerCase()
  );

  // 0 = matches today's tag
  // 1 = does not match today's tag
  return matchTags.includes(normalizedTodayTag) ? 0 : 1;
};


const getTemperatureScore = (match, weather) => {
  if (!weather) return Number.MAX_SAFE_INTEGER;

  return (
    Math.abs(match.min_temp - weather.min) +
    Math.abs(match.max_temp - weather.max)
  );
};


const todayOutfitSort = (outfits, todayTag = null) => {
  if (!Array.isArray(outfits)) return [];

  const weather = getCachedWeather();

  return [...outfits].sort((a, b) => {
    const matchA = a.matchId;
    const matchB = b.matchId;


    /* -------------------------
       1. TODAY'S TAG
    ------------------------- */

    const tagScoreA = getTagScore(matchA, todayTag);
    const tagScoreB = getTagScore(matchB, todayTag);

    if (tagScoreA !== tagScoreB) {
      return tagScoreA - tagScoreB;
    }


    /* -------------------------
       2. INDIVIDUAL CLOTHING FRESHNESS
    ------------------------- */

    const clothingComparison = compareClothingDates(
      getClothingDates(a),
      getClothingDates(b)
    );

    if (clothingComparison !== 0) {
      return clothingComparison;
    }


    /* -------------------------
       3. WHOLE OUTFIT FRESHNESS
    ------------------------- */

    const matchDateA = matchA?.lastWornDate
      ? new Date(matchA.lastWornDate).getTime()
      : null;

    const matchDateB = matchB?.lastWornDate
      ? new Date(matchB.lastWornDate).getTime()
      : null;

    // Never-worn outfit first
    if (matchDateA === null && matchDateB !== null) return -1;
    if (matchDateA !== null && matchDateB === null) return 1;

    // Older outfit first
    if (
      matchDateA !== null &&
      matchDateB !== null &&
      matchDateA !== matchDateB
    ) {
      return matchDateA - matchDateB;
    }


    /* -------------------------
       4. USER-CREATED OUTFITS
    ------------------------- */

    if (matchA.userMade !== matchB.userMade) {
      return matchA.userMade ? -1 : 1;
    }


    /* -------------------------
       5. TEMPERATURE ACCURACY
    ------------------------- */

    return (
      getTemperatureScore(matchA, weather) -
      getTemperatureScore(matchB, weather)
    );
  });
};


export default todayOutfitSort;
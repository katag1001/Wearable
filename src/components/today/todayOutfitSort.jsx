const STORAGE_KEY = "weather_cache";

const SCORE_WEIGHTS = {
  temperature: 0.10,
  clothingFreshness: 0.30,
  outfitFreshness: 0.15,
  userMade: 0.45,
};


const getCachedWeather = () => {
  try {
    const cached = JSON.parse(
      localStorage.getItem(STORAGE_KEY)
    );

    if (!cached?.weather) return null;

    return cached.weather;
  } catch {
    return null;
  }
};


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


const getTemperatureScore = (match, weather) => {
  if (!weather || !match) return 0;

  const overflowBelow = Math.max(
    0,
    match.min_temp - weather.min
  );

  const overflowAbove = Math.max(
    0,
    weather.max - match.max_temp
  );

  const totalOverflow =
    overflowBelow + overflowAbove;

  let score = Math.max(
    0,
    10 - (totalOverflow / 20) * 10
  );

  // Prefer the lighter outfit when an outer layer isn't needed to fit today's weather.
  if (match.hasOuter) {
    score = Math.max(0, score - 1);
  }

  return score;
};



const getClothingFreshnessScore = (outfit) => {
  const clothes = outfit.matchId?.clothes || [];

  if (!clothes.length) {
    return 0;
  }

  const scores = clothes.map((item) => {
    const daysSince = getDaysSince(
      item.lastWornDate
    );

    // Never worn
    if (daysSince === null) {
      return 10;
    }

    // Cap at 30 days
    return Math.min(
      10,
      (daysSince / 30) * 10
    );
  });

  const score =
    scores.reduce(
      (sum, value) => sum + value,
      0
    ) / scores.length;

  return score;
};


const getOutfitFreshnessScore = (match) => {
  if (!match) return 0;

  const daysSince = getDaysSince(
    match.lastWornDate
  );

  // Never worn
  if (daysSince === null) {
    return 10;
  }

  return Math.min(
    10,
    (daysSince / 30) * 10
  );
};

const getUserMadeScore = (match) => {
  return match?.userMade ? 10 : 0;
};


const hasTodayTag = (match, todayTag) => {
  if (!todayTag) return false;

  const normalizedTodayTag =
    todayTag.trim().toLowerCase();

  const matchTags =
    (match?.tags || []).map((tag) =>
      tag.trim().toLowerCase()
    );

  return matchTags.includes(
    normalizedTodayTag
  );
};


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


const scoreOutfit = (outfit, weather) => {
  const match = outfit.matchId;

  const scores = {
    temperature:
      getTemperatureScore(
        match,
        weather
      ),

    clothingFreshness:
      getClothingFreshnessScore(
        outfit
      ),

    outfitFreshness:
      getOutfitFreshnessScore(
        match
      ),

    userMade:
      getUserMadeScore(
        match
      ),
  };

  const overall =
    getOverallScore(scores);

  return {
    ...scores,
    overall,
  };
};


const todayOutfitSort = (
  outfits,
  todayTag = null
) => {
  if (!Array.isArray(outfits)) {
    return [];
  }

  const weather =
    getCachedWeather();

  let taggedOutfits = [
    ...outfits,
  ];

  let nonTaggedOutfits = [];


  if (todayTag) {

    taggedOutfits =
      outfits.filter(
        (outfit) =>
          hasTodayTag(
            outfit.matchId,
            todayTag
          )
      );

    nonTaggedOutfits =
      outfits.filter(
        (outfit) =>
          !hasTodayTag(
            outfit.matchId,
            todayTag
          )
      );
  }

  const scoreOutfits = (
    outfitsToScore
  ) => {

    return outfitsToScore.map(
      (outfit) => {

        const scores =
          scoreOutfit(
            outfit,
            weather
          );

        return {
          outfit,
          scores,
        };
      }
    );
  };


  const scoredTaggedOutfits =
    scoreOutfits(
      taggedOutfits
    );

  const scoredNonTaggedOutfits =
    scoreOutfits(
      nonTaggedOutfits
    );


  [
    ...scoredTaggedOutfits,
    ...scoredNonTaggedOutfits,
  ].forEach(
    ({
      outfit,
      scores,
    }) => {

      const match =
        outfit.matchId;

      console.log(
        "OUTFIT SCORE",
        match?._id ||
          match?.id ||
          "unknown"
      );

      console.log(
        "today-tag-match:",
        hasTodayTag(
          match,
          todayTag
        )
      );

      console.log(
        "temp-score:",
        scores.temperature.toFixed(
          1
        )
      );

      console.log(
        "clothing-freshness-score:",
        scores.clothingFreshness.toFixed(
          1
        )
      );

      console.log(
        "outfit-freshness-score:",
        scores.outfitFreshness.toFixed(
          1
        )
      );

      console.log(
        "user-made-score:",
        scores.userMade.toFixed(
          1
        )
      );

      console.log(
        "overall-score:",
        scores.overall.toFixed(
          1
        )
      );

      console.log(
        "-------------------------"
      );
    }
  );

  scoredTaggedOutfits.sort(
    (a, b) =>
      b.scores.overall -
      a.scores.overall
  );

  scoredNonTaggedOutfits.sort(
    (a, b) =>
      b.scores.overall -
      a.scores.overall
  );


  return [
    ...scoredTaggedOutfits.map(
      ({ outfit }) => outfit
    ),

    ...scoredNonTaggedOutfits.map(
      ({ outfit }) => outfit
    ),
  ];
};


export default todayOutfitSort;

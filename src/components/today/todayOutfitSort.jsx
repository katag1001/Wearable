import { getEffectiveMatchScore } from "../../utils/matchScore";

const STORAGE_KEY = "weather_cache";

const SCORE_WEIGHTS = {
  clothingFreshness: 0.30,
  outfitFreshness: 0.30,
  score: 0.40
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


// An outfit fits today's weather when its temperature range covers the whole
// forecast. With no cached weather, every outfit is treated as fitting.
const fitsWeather = (match, weather) => {
  if (!weather) return true;
  if (!match) return false;

  return (
    match.min_temp <= weather.min &&
    match.max_temp >= weather.max
  );
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

// The match's 0-100 score (100 for a favourite), on the same 0-10 scale as
// the other factors. User-made outfits already carry a flat high score.
const getMatchScore = (match) => {
  return getEffectiveMatchScore(match) / 10;
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
    scores.clothingFreshness *
      SCORE_WEIGHTS.clothingFreshness +
    scores.outfitFreshness *
      SCORE_WEIGHTS.outfitFreshness +
    scores.score *
      SCORE_WEIGHTS.score;

  return score;
};


const scoreOutfit = (outfit) => {
  const match = outfit.matchId;

  const scores = {
    clothingFreshness:
      getClothingFreshnessScore(
        outfit
      ),

    outfitFreshness:
      getOutfitFreshnessScore(
        match
      ),

    score:
      getMatchScore(
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

  const scoredOutfits =
    outfits.map(
      (outfit) => {

        const match =
          outfit.matchId;

        return {
          outfit,
          scores:
            scoreOutfit(
              outfit
            ),
          // With no today tag, every outfit counts as tagged.
          isTagged:
            !todayTag ||
            hasTodayTag(
              match,
              todayTag
            ),
          fitsWeather:
            fitsWeather(
              match,
              weather
            ),
        };
      }
    );


  // Order: weather fit first, then today tag within each weather group.
  const groups = [
    scoredOutfits.filter(
      (o) => o.fitsWeather && o.isTagged
    ),
    scoredOutfits.filter(
      (o) => o.fitsWeather && !o.isTagged
    ),
    scoredOutfits.filter(
      (o) => !o.fitsWeather && o.isTagged
    ),
    scoredOutfits.filter(
      (o) => !o.fitsWeather && !o.isTagged
    ),
  ];


  scoredOutfits.forEach(
    ({
      outfit,
      scores,
      isTagged,
      fitsWeather: fits,
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
        isTagged
      );

      console.log(
        "fits-weather:",
        fits
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
        "match-score:",
        scores.score.toFixed(
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

  return groups.flatMap(
    (group) =>
      group
        .sort(
          (a, b) =>
            b.scores.overall -
            a.scores.overall
        )
        .map(
          ({ outfit }) => outfit
        )
  );
};


export default todayOutfitSort;

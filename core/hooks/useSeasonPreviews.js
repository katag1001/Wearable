import { useState } from "react";

import { buildClothingFilterQuery } from "../utils/clothingQuery.js";
import { getSeason } from "../utils/dates.js";
import { buildMatchFilterQuery } from "../utils/matchQuery.js";
import { withPage } from "../utils/pageQuery.js";
import { usePagedList } from "./usePagedList.js";

// A preview of this season's newest clothes / outfits (the lists have the
// rest). Both are cached for the session, so coming back is instant.
const PREVIEW_CLOTHES = 14;
const PREVIEW_OUTFITS = 8;

/*
 * The "this season" rows under Today (web homepage, mobile Today tab).
 * No latitude, so the northern-hemisphere season.
 */
export const useSeasonPreviews = ({ enabled = true } = {}) => {
  const [season] = useState(() => getSeason());

  const clothesQuery = withPage(
    buildClothingFilterQuery({
      filters: { seasons: [season] },
      limit: PREVIEW_CLOTHES,
    }),
    1
  );

  const outfitsQuery = withPage(
    buildMatchFilterQuery({ season, limit: PREVIEW_OUTFITS }),
    1
  );

  const clothes = usePagedList("clothes", clothesQuery, {
    enabled,
    errorMessage: "Failed to fetch clothes",
  });

  const outfits = usePagedList("matches", outfitsQuery, {
    enabled,
    errorMessage: "Failed to fetch matches",
  });

  return {
    season,
    clothes: clothes.data?.items ?? [],
    outfits: outfits.data?.matches ?? [],
    reloadClothes: clothes.reload,
    reloadOutfits: outfits.reload,
  };
};

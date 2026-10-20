import { useCallback, useEffect, useState } from "react";

import { getErrorMessage } from "../api/errors.js";
import { usePagedCache } from "../cache/usePagedCache.js";
import { defaultWardrobeFilters } from "../filters/filterDefaults.js";
import { buildClothingFilterQuery } from "../utils/clothingQuery.js";
import { buildFootwearFilterQuery } from "../utils/footwearQuery.js";
import { formatListCount, withPage } from "../utils/pageQuery.js";
import { deleteWardrobeItem } from "../wardrobe/itemKinds.js";
import { FOOTWEAR } from "../wardrobe/wardrobeTypes.js";
import { useDebouncedValue } from "./useDebouncedValue.js";
import { usePagedList } from "./usePagedList.js";

/*
 * The wardrobe list: search, type buttons (+ their subtypes), the filter
 * panel's filters and the page - all remembered for the session, so
 * leaving and coming back puts you where you were.
 *
 * The Footwear type shows the footwear collection; anything else shows
 * clothes. Both lists are kept, but only the one on show fetches.
 */
export const useWardrobePage = () => {
  const {
    fetchFilterOptions,
    invalidateFilterOptions,
    getSavedView,
    saveView,
  } = usePagedCache("clothes");

  const footwearCache = usePagedCache("footwear");

  // Pick up the search / filters / page from last time.
  const [savedView] = useState(() => getSavedView());

  const [searchTerm, setSearchTerm] = useState(savedView?.searchTerm ?? "");
  const [selectedType, setSelectedType] = useState(
    savedView?.selectedType ?? null
  );
  const [filters, setFilters] = useState(
    savedView?.filters ?? defaultWardrobeFilters
  );

  const [clothingFilterOptions, setClothingFilterOptions] = useState(null);
  const [footwearFilterOptions, setFootwearFilterOptions] = useState(null);

  const [actionError, setActionError] = useState(null);

  const isFootwear = selectedType === FOOTWEAR;

  /* -------------------- Query -------------------- */

  const debouncedSearch = useDebouncedValue(searchTerm);

  const filterQuery = isFootwear
    ? buildFootwearFilterQuery({ search: debouncedSearch, filters })
    : buildClothingFilterQuery({
        search: debouncedSearch,
        type: selectedType,
        filters,
      });

  // The page number belongs to the filters it was chosen under, so any
  // change to search / type / filters goes back to page 1 without a
  // wasted request for the old page number.
  const [pageState, setPageState] = useState(
    savedView?.pageState ?? { filterQuery, page: 1 }
  );

  const page = pageState.filterQuery === filterQuery ? pageState.page : 1;

  const clothesList = usePagedList("clothes", withPage(filterQuery, page), {
    enabled: !isFootwear,
    errorMessage: "Failed to fetch clothing items",
  });

  const footwearList = usePagedList("footwear", withPage(filterQuery, page), {
    enabled: isFootwear,
    errorMessage: "Failed to fetch footwear",
  });

  const { data, dataQuery, loading, error: pageError } = isFootwear
    ? footwearList
    : clothesList;

  useEffect(() => {
    saveView({ searchTerm, selectedType, filters, pageState });
  }, [searchTerm, selectedType, filters, pageState, saveView]);

  const setPage = (newPage) => {
    setPageState({ filterQuery, page: newPage });
  };

  /* -------------------- Filter panel options -------------------- */

  const loadFilterOptions = useCallback(() => {
    fetchFilterOptions()
      .then(setClothingFilterOptions)
      .catch((err) => {
        // The panel falls back to showing every option.
        console.error("Failed to load filter options:", err);
      });

    footwearCache
      .fetchFilterOptions()
      .then(setFootwearFilterOptions)
      .catch((err) => {
        console.error("Failed to load footwear filter options:", err);
      });
  }, [fetchFilterOptions, footwearCache]);

  useEffect(() => {
    loadFilterOptions();
  }, [loadFilterOptions]);

  const filterOptions = isFootwear
    ? footwearFilterOptions
    : clothingFilterOptions;

  // The subtypes under each type button (only ones the user owns) -
  // footwear's own subtypes sit under the Footwear button.
  const subtypesByType = {
    ...clothingFilterOptions?.subtypesByType,
    [FOOTWEAR]: footwearFilterOptions?.subtypes,
  };

  /* -------------------- Actions -------------------- */

  // After an add, edit or delete: the page, the counts and the filter
  // options can all have changed.
  const refresh = () => {
    invalidateFilterOptions();
    footwearCache.invalidateFilterOptions();
    loadFilterOptions();
    clothesList.reload();
    footwearList.reload();
  };

  // Subtypes always belong to the selected type, so changing or
  // clearing the type clears them - no hidden subtype filters left on.
  const clearSubtypes = () => {
    setFilters((prev) =>
      prev.subtypes?.length > 0 ? { ...prev, subtypes: [] } : prev
    );
  };

  const toggleType = (type) => {
    setSelectedType((prev) => (prev === type ? null : type));
    clearSubtypes();
  };

  // Picking a subtype of another type switches to that type with just
  // this subtype.
  const toggleSubtype = (type, subtype) => {
    if (selectedType !== type) {
      setSelectedType(type);
      setFilters((prev) => ({ ...prev, subtypes: [subtype] }));
      return;
    }

    setFilters((prev) => {
      const current = prev.subtypes || [];

      return {
        ...prev,
        subtypes: current.includes(subtype)
          ? current.filter((entry) => entry !== subtype)
          : [...current, subtype],
      };
    });
  };

  // The items on show are all footwear or all clothes.
  const kindOnShow = isFootwear ? "footwear" : "clothing";

  // Resolves to true when deleted (and the list refreshed).
  const deleteItem = async (id) => {
    setActionError(null);

    try {
      await deleteWardrobeItem(kindOnShow, id);
      refresh();
      return true;
    } catch (err) {
      console.error("Delete item error:", err);
      setActionError(getErrorMessage(err, "Failed to delete item"));
      return false;
    }
  };

  // The heart on a clothing item (useItemFavourite) - keeps the cached
  // page in step without a re-fetch.
  const onItemFavouriteToggled = (id, favourite) => {
    clothesList.updateItem(id, { favourite });
  };

  return {
    searchTerm,
    setSearchTerm,
    selectedType,
    toggleType,
    subtypesByType,
    selectedSubtypes: filters.subtypes,
    toggleSubtype,
    filters,
    setFilters,
    filterOptions,

    isFootwear,
    kindOnShow,
    filterQuery,
    data,
    dataQuery,
    loading,
    error: actionError || pageError,
    count: formatListCount(data),
    page,
    setPage,

    refresh,
    deleteItem,
    onItemFavouriteToggled,
    setError: setActionError,
  };
};

import React, { useEffect, useState } from "react";

import Header from "../components/header";
import ViewClothes from "../components/clothes/viewClothes";
import ViewClothesTop from "../components/clothes/viewClothesTop";
import AddUpdateClothes from "../components/clothes/addUpdateClothes";
import Filter from "../components/general/filter";
import Pagination from "../components/general/pagination";

import { usePagedCache } from "../context/usePagedCache";
import { usePagedList } from "../hooks/usePagedList";
import { useDebouncedValue } from "../hooks/useDebouncedValue";
import { buildClothingFilterQuery } from "../utils/clothingQuery";
import { withPage, formatListCount } from "../utils/pageQuery";

import "../styles/pages.css";

const defaultFilters = {
  seasons: [],
  colors: [],
  styles: [],
  tags: [],
  subtypes: [],
};

const Clothes = ({ loggedIn }) => {
  const {
    fetchFilterOptions,
    invalidateFilterOptions,
    getSavedView,
    saveView,
  } = usePagedCache("clothes");

  // Pick up the search / filters / page from last time.
  const [savedView] = useState(() => getSavedView());

  const [error, setError] = useState(null);

  const [showClothingModal, setShowClothingModal] =
    useState(false);
  const [selectedItem, setSelectedItem] =
    useState(null);

  const [showFilters, setShowFilters] =
    useState(false);
  const [searchTerm, setSearchTerm] = useState(
    savedView?.searchTerm ?? ""
  );
  const [selectedType, setSelectedType] =
    useState(savedView?.selectedType ?? null);

  const [filters, setFilters] = useState(
    savedView?.filters ?? defaultFilters
  );

  const [filterOptions, setFilterOptions] =
    useState(null);

  const clothingTypes = [
    "top",
    "outer",
    "bottom",
    "onepiece",
  ];

  const typeTitles = {
    top: "Top Half",
    outer: "Outerwear",
    bottom: "Bottom Half",
    onepiece: "One-Pieces",
  };

  /* -------------------- Query -------------------- */

  const debouncedSearch = useDebouncedValue(searchTerm);

  const filterQuery = buildClothingFilterQuery({
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

  const page =
    pageState.filterQuery === filterQuery ? pageState.page : 1;

  const {
    data,
    loading,
    error: pageError,
    reload,
  } = usePagedList("clothes", withPage(filterQuery, page), {
    errorMessage: "Failed to fetch clothing items",
  });

  useEffect(() => {
    saveView({ searchTerm, selectedType, filters, pageState });
  }, [searchTerm, selectedType, filters, pageState, saveView]);

  /* -------------------- Filter panel options -------------------- */

  const loadFilterOptions = () => {
    fetchFilterOptions()
      .then(setFilterOptions)
      .catch((err) => {
        // The panel falls back to showing every option.
        console.error("Failed to load filter options:", err);
      });
  };

  useEffect(() => {
    loadFilterOptions();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  /* -------------------- Actions -------------------- */

  // After an add, edit or delete: the page, the counts and the filter
  // options can all have changed.
  const refresh = () => {
    invalidateFilterOptions();
    loadFilterOptions();
    reload();
  };

  const handlePageChange = (newPage) => {
    setPageState({ filterQuery, page: newPage });
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  // Subtypes always belong to the selected type, so changing or
  // clearing the type clears them - no hidden subtype filters left on.
  const clearSubtypes = () => {
    setFilters((prev) =>
      prev.subtypes?.length > 0 ? { ...prev, subtypes: [] } : prev
    );
  };

  const toggleTypeFilter = (type) => {
    setSelectedType((prev) =>
      prev === type ? null : type
    );
    clearSubtypes();
  };

  // From the subtype row under the type buttons. Picking a subtype of
  // another type switches to that type with just this subtype.
  const toggleSubtypeFilter = (type, subtype) => {
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

  const handleAddItem = () => {
    setSelectedItem(null);
    setShowClothingModal(true);
  };

  const handleEdit = (item) => {
    setSelectedItem(item);
    setShowClothingModal(true);
  };

  const closeModal = () => {
    setShowClothingModal(false);
    setSelectedItem(null);
  };

  const count = formatListCount(data);

  return (
    <div className="full-page-container">
      <Header
        loggedIn={loggedIn}
      />

      <div className="main-container">
      <h2 className="page-title">
        My Clothes
        {count && (
          <>
            {" "}
            <span className="page-title-count">
              ({count})
            </span>
          </>
        )}
      </h2>

      <button
        className="top-action-button"
        onClick={handleAddItem}
      >
        Add Item
      </button>

      {(error || pageError) && (
        <p className="error-text">
          Error: {error || pageError}
        </p>
      )}

      <ViewClothesTop
        searchTerm={searchTerm}
        setSearchTerm={setSearchTerm}
        handleAddItem={handleAddItem}
        clothingTypes={clothingTypes}
        typeTitles={typeTitles}
        selectedType={selectedType}
        toggleTypeFilter={toggleTypeFilter}
        subtypesByType={filterOptions?.subtypesByType}
        selectedSubtypes={filters.subtypes}
        toggleSubtypeFilter={toggleSubtypeFilter}
        setShowFilters={setShowFilters}
      />

      <div className="page-bottom-container">
        {!data ? (
          loading && (
            <p className="no-items-text">
              Loading clothes...
            </p>
          )
        ) : (
          <>
            <ViewClothes
              items={data.items}
              onEdit={handleEdit}
              refresh={refresh}
              setError={setError}
            />

            <Pagination
              page={data.page}
              totalPages={data.totalPages}
              onPageChange={handlePageChange}
            />
          </>
        )}
      </div>

      <Filter
        isOpen={showFilters}
        onClose={() =>
          setShowFilters(false)
        }
        filters={filters}
        setFilters={setFilters}
        availableColors={filterOptions?.colors}
        availableTags={filterOptions?.tags}
        // Styles aren't offered for clothes; subtypes are picked from
        // the type buttons instead.
        showStyles={false}
        // Clothing items have no temperature range - only matches do.
        showTemperature={false}
      />

      {showClothingModal && (
        <AddUpdateClothes
          item={selectedItem}
          onClose={closeModal}
          refresh={refresh}
        />
      )}
      </div>
    </div>
  );
};

export default Clothes;

import React, { useState } from "react";

import Header from "../components/header";
import ViewClothes from "../components/clothes/viewClothes";
import ViewClothesTop from "../components/clothes/viewClothesTop";
import AddWardrobeItem from "../components/clothes/addWardrobeItem";
import Filter from "../components/general/filter";
import Pagination from "../components/general/pagination";

import { useWardrobePage } from "@core/hooks/useWardrobePage.js";
import {
  WARDROBE_TYPES,
  WARDROBE_TYPE_TITLES,
} from "@core/wardrobe/wardrobeTypes.js";

import "../styles/pages.css";

// The list logic lives in useWardrobePage (shared with the mobile app);
// this page renders it and owns the add / edit modal.
const Clothes = ({ loggedIn }) => {
  const wardrobe = useWardrobePage();
  const { data, loading, isFootwear } = wardrobe;

  const [showClothingModal, setShowClothingModal] =
    useState(false);
  const [selectedItem, setSelectedItem] =
    useState(null);
  // "clothing" or "footwear" - which form an edited item opens in.
  const [selectedKind, setSelectedKind] =
    useState(null);

  const [showFilters, setShowFilters] =
    useState(false);

  const handlePageChange = (newPage) => {
    wardrobe.setPage(newPage);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleAddItem = () => {
    setSelectedItem(null);
    setSelectedKind(null);
    setShowClothingModal(true);
  };

  const handleEdit = (item) => {
    setSelectedItem(item);
    setSelectedKind(wardrobe.kindOnShow);
    setShowClothingModal(true);
  };

  const closeModal = () => {
    setShowClothingModal(false);
    setSelectedItem(null);
    setSelectedKind(null);
  };

  return (
    <div className="full-page-container">
      <Header
        loggedIn={loggedIn}
      />

      <div className="main-container">
      <h2 className="page-title">
        My Wardrobe
        {wardrobe.count && (
          <>
            {" "}
            <span className="page-title-count">
              ({wardrobe.count})
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

      {wardrobe.error && (
        <p className="error-text">
          Error: {wardrobe.error}
        </p>
      )}

      <ViewClothesTop
        searchTerm={wardrobe.searchTerm}
        setSearchTerm={wardrobe.setSearchTerm}
        handleAddItem={handleAddItem}
        clothingTypes={WARDROBE_TYPES}
        typeTitles={WARDROBE_TYPE_TITLES}
        selectedType={wardrobe.selectedType}
        toggleTypeFilter={wardrobe.toggleType}
        subtypesByType={wardrobe.subtypesByType}
        selectedSubtypes={wardrobe.selectedSubtypes}
        toggleSubtypeFilter={wardrobe.toggleSubtype}
        setShowFilters={setShowFilters}
      />

      <div className="page-bottom-container">
        {!data ? (
          loading && (
            <p className="no-items-text">
              {isFootwear ? "Loading footwear..." : "Loading clothes..."}
            </p>
          )
        ) : (
          <>
            <ViewClothes
              items={data.items}
              onEdit={handleEdit}
              onDelete={wardrobe.deleteItem}
              {...(isFootwear && {
                emptyText: "No footwear found.",
                deleteTitle: "Delete Footwear",
              })}
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
        filters={wardrobe.filters}
        setFilters={wardrobe.setFilters}
        availableColors={wardrobe.filterOptions?.colors}
        availableTags={wardrobe.filterOptions?.tags}
        // Styles aren't offered for clothes; subtypes are picked from
        // the type buttons instead.
        showStyles={false}
        // Clothing items have no temperature range - only matches do.
        showTemperature={false}
      />

      {showClothingModal && (
        <AddWardrobeItem
          item={selectedItem}
          kind={selectedKind}
          onClose={closeModal}
          refresh={wardrobe.refresh}
        />
      )}
      </div>
    </div>
  );
};

export default Clothes;

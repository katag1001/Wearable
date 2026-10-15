import React from "react";
import "./filter.css";
import TemperatureSlider from "./temperatureSlider";
import { getImageUrl } from "@core/utils/getImageUrl.js";
import {
  ITEM_CATEGORIES as itemCategories,
  ITEM_CATEGORY_LABELS as itemCategoryLabels,
  FILTER_TEMPERATURE_RANGE,
} from "@core/filters/filterDefaults.js";
import { useFilterPanel } from "@core/hooks/useFilterPanel.js";

// The panel logic lives in useFilterPanel (shared with the mobile app);
// this only renders it.
const Filter = ({
  isOpen,
  onClose,
  filters,
  setFilters,
  availableColors = [],
  availableStyles = [],
  availableTags = [],
  clothesByCategory = {
    top: [],
    bottom: [],
    outer: [],
    onepiece: [],
  },
  showItemFilter = false,
  showSeasons = true,
  showColors = true,
  showStyles = true,
  showTags = true,
  showTemperature = true,
  showFavourites = false,
}) => {
  const {
    draft: localFilters,
    view,
    setView,
    seasons,
    colors,
    styles,
    tags,
    toggleInList: toggleArrayFilter,
    toggleFavourite,
    setTemperature: handleTemperatureChange,
    itemSearchTerm,
    searchItems: handleItemSearchChange,
    getCurrentCategoryItem,
    stepCategory: changeCategoryIndex,
    toggleCategoryItem: selectCategoryItem,
    apply: applyFilters,
    reset: resetFilters,
  } = useFilterPanel({
    isOpen,
    filters,
    setFilters,
    onClose,
    availableColors,
    availableStyles,
    availableTags,
    clothesByCategory,
  });

  if (!isOpen) return null;

return (
  <div
    className="filter-overlay"
    onClick={onClose}
  >
    <div
      className="filter-panel"
      onClick={(e) => e.stopPropagation()}
    >
      <button
        className="close-filter-button"
        onClick={onClose}
      >
        ×
      </button>

        {view === "items" ? (
          <h2>Filter by Item</h2>
        ) : (
          <h2>Filter</h2>
        )}

        {showItemFilter && view === "main" && (
          <button
            type="button"
            className="filter-by-item-button"
            onClick={() => setView("items")}
          >
            Filter by Item
          </button>
        )}

        {showItemFilter && view === "items" && (
          <button
            type="button"
            className="filter-back-button"
            onClick={() => setView("main")}
          >
            ‹ Other Filters
          </button>
        )}

        {showItemFilter && view === "items" && (
          <div className="filter-items-view">
            <input
              type="text"
              className="filter-item-search-input"
              placeholder="Search clothing items..."
              value={itemSearchTerm}
              onChange={(e) =>
                handleItemSearchChange(e.target.value)
              }
            />

            {itemCategories.map((category) => {
              const currentItem =
                getCurrentCategoryItem(category);

              const selectedId =
                localFilters.items?.[category] ?? null;

              return (
                <div
                  key={category}
                  className="filter-item-category"
                >
                  <h3>{itemCategoryLabels[category]}</h3>

                  <div className="filter-item-carousel">
                    <button
                      type="button"
                      className="filter-item-arrow"
                      onClick={() =>
                        changeCategoryIndex(category, -1)
                      }
                      disabled={!currentItem}
                      aria-label={`Previous ${itemCategoryLabels[category]}`}
                    >
                      ‹
                    </button>

                    {currentItem ? (
                      <button
                        type="button"
                        className={`filter-item-card ${
                          selectedId === currentItem._id
                            ? "filter-item-card--selected"
                            : ""
                        }`}
                        onClick={() =>
                          selectCategoryItem(
                            category,
                            currentItem
                          )
                        }
                      >
                        {currentItem.imageUrl && (
                          <img
                            src={getImageUrl(currentItem.imageUrl, 150)}
                            alt={currentItem.name}
                            className="filter-item-image"
                          />
                        )}

                        <span className="filter-item-name">
                          {currentItem.name}
                        </span>
                      </button>
                    ) : (
                      <div className="filter-item-empty">
                        No items found.
                      </div>
                    )}

                    <button
                      type="button"
                      className="filter-item-arrow"
                      onClick={() =>
                        changeCategoryIndex(category, 1)
                      }
                      disabled={!currentItem}
                      aria-label={`Next ${itemCategoryLabels[category]}`}
                    >
                      ›
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {view === "main" && showFavourites && (
          <div className="filter-section">
            <h3>Favourites</h3>

            <label>
              <input
                type="checkbox"
                checked={!!localFilters.favourite}
                onChange={toggleFavourite}
              />

              Favourites only
            </label>
          </div>
        )}

        {view === "main" && showSeasons && (
          <div className="filter-section">
            <h3>Season</h3>

            {seasons.map((season) => (
              <label key={season}>
                <input
                  type="checkbox"
                  checked={localFilters.seasons.includes(season)}
                  onChange={() =>
                    toggleArrayFilter("seasons", season)
                  }
                />

                {season.charAt(0).toUpperCase() + season.slice(1)}
              </label>
            ))}
          </div>
        )}

        {view === "main" && showColors && (
          <div className="filter-section">
            <h3>Colors</h3>

            {colors.map((color) => (
              <label key={color.name}>
                <input
                  type="checkbox"
                  checked={localFilters.colors.includes(color.name)}
                  onChange={() =>
                    toggleArrayFilter("colors", color.name)
                  }
                />

                {color.name}
              </label>
            ))}
          </div>
        )}

        {view === "main" && showTemperature && (
          <div className="filter-section">
            <h3>Temperature</h3>

            <TemperatureSlider
              min={FILTER_TEMPERATURE_RANGE.min}
              max={FILTER_TEMPERATURE_RANGE.max}
              valueMin={localFilters.minTemp ?? FILTER_TEMPERATURE_RANGE.min}
              valueMax={localFilters.maxTemp ?? FILTER_TEMPERATURE_RANGE.max}
              step={1}
              onChange={handleTemperatureChange}
            />
          </div>
        )}

        {view === "main" && showStyles && (
          <div className="filter-section">
            <h3>Styles</h3>

            {styles.map((style) => (
              <label key={style}>
                <input
                  type="checkbox"
                  checked={localFilters.styles.includes(style)}
                  onChange={() =>
                    toggleArrayFilter("styles", style)
                  }
                />

                {style.charAt(0).toUpperCase() + style.slice(1)}
              </label>
            ))}
          </div>
        )}

        {view === "main" && showTags && (
          <div className="filter-section">
            <h3>Tags</h3>

            {tags.map((tag) => (
              <label key={tag.name}>
                <input
                  type="checkbox"
                  checked={localFilters.tags.includes(tag.name)}
                  onChange={() =>
                    toggleArrayFilter("tags", tag.name)
                  }
                />

                {tag.name}
              </label>
            ))}
          </div>
        )}

        <div className="filter-buttons">
          <button onClick={resetFilters}>
            Reset
          </button>

          <button onClick={applyFilters}>
            Apply
          </button>
        </div>
      </div>
    </div>
  );
};

export default Filter;
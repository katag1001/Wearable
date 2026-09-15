import React, { useState, useEffect } from "react";
import "./filter.css";
import TemperatureSlider from "./temperatureSlider";
import {
  seasonOptions,
  colorOptions,
  styleOptions,
  tagOptions,
} from "../../constants/optionsBank";

const itemCategories = [
  "top",
  "bottom",
  "outer",
  "onepiece",
];

const itemCategoryLabels = {
  top: "Tops",
  bottom: "Bottoms",
  outer: "Outerwear",
  onepiece: "One-Pieces",
};

const defaultFilters = {
  seasons: [],
  colors: [],
  styles: [],
  tags: [],
  minTemp: null,
  maxTemp: null,
  favourite: false,
  items: {
    top: null,
    bottom: null,
    outer: null,
    onepiece: null,
  },
};

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
  const [localFilters, setLocalFilters] = useState({
    ...defaultFilters,
    ...filters,
  });

  // "main" shows the standard filters, "items" shows the
  // filter-by-item carousel menu.
  const [view, setView] = useState("main");

  const [itemSearchTerm, setItemSearchTerm] = useState("");

  const [categoryIndex, setCategoryIndex] = useState({
    top: 0,
    bottom: 0,
    outer: 0,
    onepiece: 0,
  });

  useEffect(() => {
    setLocalFilters({
      ...defaultFilters,
      ...filters,
    });
  }, [filters]);

  useEffect(() => {
    if (isOpen) {
      setView("main");
    }
  }, [isOpen]);

  const seasons = seasonOptions;

  const colors =
    availableColors.length > 0
      ? colorOptions.filter((color) =>
          availableColors.includes(color.name)
        )
      : colorOptions;

  const styles =
    availableStyles.length > 0
      ? styleOptions.filter((style) =>
          availableStyles.includes(style)
        )
      : styleOptions;

  const tags =
    availableTags.length > 0
      ? tagOptions.filter((tag) =>
          availableTags.includes(tag.name)
        )
      : tagOptions;

  const toggleArrayFilter = (field, value) => {
    setLocalFilters((prev) => {
      const current = prev[field] || [];

      return {
        ...prev,
        [field]: current.includes(value)
          ? current.filter((item) => item !== value)
          : [...current, value],
      };
    });
  };

  const getFilteredCategoryItems = (category) => {
    const term = itemSearchTerm.trim().toLowerCase();
    const items = clothesByCategory[category] || [];

    if (!term) {
      return items;
    }

    return items.filter((item) =>
      item.name?.toLowerCase().includes(term)
    );
  };

  const getCurrentCategoryItem = (category) => {
    const items = getFilteredCategoryItems(category);

    if (items.length === 0) {
      return null;
    }

    const rawIndex = categoryIndex[category] || 0;
    const safeIndex =
      ((rawIndex % items.length) + items.length) % items.length;

    return items[safeIndex];
  };

  const changeCategoryIndex = (category, direction) => {
    setCategoryIndex((prev) => ({
      ...prev,
      [category]: (prev[category] || 0) + direction,
    }));
  };

  const handleItemSearchChange = (value) => {
    setItemSearchTerm(value);

    setCategoryIndex({
      top: 0,
      bottom: 0,
      outer: 0,
      onepiece: 0,
    });
  };

  const selectCategoryItem = (category, item) => {
    setLocalFilters((prev) => ({
      ...prev,
      items: {
        ...prev.items,
        [category]:
          prev.items[category] === item._id
            ? null
            : item._id,
      },
    }));
  };

  const handleTemperatureChange = (minTemp, maxTemp) => {
    setLocalFilters((prev) => ({
      ...prev,
      minTemp,
      maxTemp,
    }));
  };

  const applyFilters = () => {
    setFilters(localFilters);
    onClose();
  };

  const resetFilters = () => {
    setLocalFilters(defaultFilters);
    setFilters(defaultFilters);
  };

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
                            src={currentItem.imageUrl}
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
                onChange={() =>
                  setLocalFilters((prev) => ({
                    ...prev,
                    favourite: !prev.favourite,
                  }))
                }
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
              min={-10}
              max={50}
              valueMin={localFilters.minTemp ?? -10}
              valueMax={localFilters.maxTemp ?? 50}
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
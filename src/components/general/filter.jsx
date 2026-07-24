import React, { useState, useEffect } from "react";
import "./filter.css";
import TemperatureSlider from "./temperatureSlider";
import {
  seasonOptions,
  colorOptions,
  styleOptions,
  tagOptions,
} from "../../constants/optionsBank";

const defaultFilters = {
  seasons: [],
  colors: [],
  styles: [],
  tags: [],
  minTemp: null,
  maxTemp: null,
};

const Filter = ({
  isOpen,
  onClose,
  filters,
  setFilters,
  availableColors = [],
  availableStyles = [],
  availableTags = [],
  showSeasons = true,
  showColors = true,
  showStyles = true,
  showTags = true,
  showTemperature = true,
}) => {
  const [localFilters, setLocalFilters] = useState({
    ...defaultFilters,
    ...filters,
  });

  useEffect(() => {
    setLocalFilters({
      ...defaultFilters,
      ...filters,
    });
  }, [filters]);

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
    <div className="filter-overlay">
      <div className="filter-panel">
        <button
          className="close-filter-button"
          onClick={onClose}
        >
          ×
        </button>

        <h2>Filter</h2>

        {showSeasons && (
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

        {showColors && (
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

        {showTemperature && (
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

        {showStyles && (
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

        {showTags && (
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
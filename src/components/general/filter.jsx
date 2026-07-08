import React, { useState } from "react";
import "./filter.css";
import TemperatureSlider from "./temperatureSlider";


const Filter = ({
  isOpen,
  onClose,
  filters,
  setFilters,
  availableColors = [],
  availableStyles = [],
}) => {

  const [localFilters, setLocalFilters] = useState(filters);


  const seasons = [
    "spring",
    "summer",
    "autumn",
    "winter"
  ];

  const toggleArrayFilter = (field, value) => {

    setLocalFilters(prev => {

      const current = prev[field] || [];

      return {
        ...prev,
        [field]: current.includes(value)
          ? current.filter(item => item !== value)
          : [...current, value]
      };

    });

  };

  const handleTemperatureChange = (minTemp, maxTemp) => {

    setLocalFilters(prev => ({
      ...prev,
      minTemp,
      maxTemp
    }));

  };

  const applyFilters = () => {
    setFilters(localFilters);
    onClose();

  };

  const resetFilters = () => {

    const reset = {
      seasons: [],
      colors: [],
      styles: [],
      minTemp: null,
      maxTemp: null
    };

    setLocalFilters(reset);
    setFilters(reset);

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
        <h2>
          Filter Clothes
        </h2>

        <div className="filter-section">
          <h3>
            Season
          </h3>

          {seasons.map(season => (

            <label key={season}>

              <input
                type="checkbox"
                checked={
                  localFilters.seasons.includes(season)
                }
                onChange={() =>
                  toggleArrayFilter(
                    "seasons",
                    season
                  )
                }
              />

              {season.charAt(0).toUpperCase() + season.slice(1)}

            </label>

          ))}
        </div>

        <div className="filter-section">

          <h3>
            Color
          </h3>


          {availableColors.map(color => (

            <label key={color}>

              <input
                type="checkbox"
                checked={
                  localFilters.colors.includes(color)
                }
                onChange={() =>
                  toggleArrayFilter(
                    "colors",
                    color
                  )
                }
              />

              {color}

            </label>

          ))}


        </div>

        <div className="filter-section">

          <h3>
            Temperature
          </h3>

          <TemperatureSlider

            min={-10}
            max={50}

            valueMin={
              localFilters.minTemp ?? -10
            }

            valueMax={
              localFilters.maxTemp ?? 50
            }

            step={1}

            onChange={
              handleTemperatureChange
            }

          />
        </div>
        <div className="filter-section">

          <h3>
            Style
          </h3>
          {availableStyles.map(style => (

            <label key={style}>

              <input
                type="checkbox"
                checked={
                  localFilters.styles.includes(style)
                }
                onChange={() =>
                  toggleArrayFilter(
                    "styles",
                    style
                  )
                }
              />

              {style}

            </label>

          ))}


        </div>
        <div className="filter-buttons">
          <button
            onClick={resetFilters}
          >
            Reset
          </button>

          <button
            onClick={applyFilters}
          >
            Apply
          </button>
        </div>
      </div>
    </div>
  );

};

export default Filter;
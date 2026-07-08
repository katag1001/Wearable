import React from "react";
import "../AddUpdateClothes.css";

const TemperatureSlider = ({
  min,
  max,
  valueMin,
  valueMax,
  step = 1,
  onChange,
}) => {
  const left = ((valueMin - min) / (max - min)) * 100;
  const right = ((valueMax - min) / (max - min)) * 100;

  return (
    <div className="temp-slider">
      <div className="slider-values">
        <span>{valueMin}°</span>
        <span>{valueMax}°</span>
      </div>

      <div className="slider-wrapper">
        <div className="slider-track" />
        <div
          className="slider-range"
          style={{
            left: `${left}%`,
            width: `${right - left}%`,
          }}
        />

        <input
          type="range"
          min={min}
          max={max}
          step={step}
          value={valueMin}
          onChange={(e) =>
            onChange(
              Math.min(Number(e.target.value), valueMax),
              valueMax
            )
          }
          className="thumb thumb-left"
        />

        <input
          type="range"
          min={min}
          max={max}
          step={step}
          value={valueMax}
          onChange={(e) =>
            onChange(
              valueMin,
              Math.max(Number(e.target.value), valueMin)
            )
          }
          className="thumb thumb-right"
        />
      </div>
    </div>
  );
};

export default TemperatureSlider;
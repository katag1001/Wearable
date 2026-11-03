import React from "react";

import {
  seasonalityQuestion,
  seasonalityScale,
} from "@core/constants/styleQuizOptions.js";

import "./seasonalityScale.css";

// "How much does the season affect what you wear?" - a 1-5 slider, used by
// the style quiz and the Style Preferences page.
const SeasonalityScale = ({ value, onChange, disabled = false }) => (
  <div className="seasonality-scale">
    <p className="seasonality-scale-hint">{seasonalityQuestion.hint}</p>

    <input
      type="range"
      className="seasonality-scale-slider"
      min={seasonalityScale[0]}
      max={seasonalityScale[seasonalityScale.length - 1]}
      step={1}
      value={value}
      disabled={disabled}
      onChange={(e) => onChange(Number(e.target.value))}
      aria-label={seasonalityQuestion.title}
    />

    <div className="seasonality-scale-labels">
      <span>{seasonalityQuestion.lowLabel}</span>
      <span>{seasonalityQuestion.highLabel}</span>
    </div>
  </div>
);

export default SeasonalityScale;

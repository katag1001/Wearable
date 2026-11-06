import React from "react";

import { fivePointScale } from "@core/constants/styleQuizOptions.js";

import "./pointScale.css";

// A 1-5 slider question (seasonality, temperature), used by the style quiz
// and the Style Preferences page. `question` gives the title (for screen
// readers), the labels under the ends (and the middle, if it has one) and
// an optional hint above.
const PointScale = ({ question, value, onChange, disabled = false }) => (
  <div className="point-scale">
    {question.hint && <p className="point-scale-hint">{question.hint}</p>}

    <input
      type="range"
      className="point-scale-slider"
      min={fivePointScale[0]}
      max={fivePointScale[fivePointScale.length - 1]}
      step={1}
      value={value}
      disabled={disabled}
      onChange={(e) => onChange(Number(e.target.value))}
      aria-label={question.title}
    />

    <div className="point-scale-labels">
      <span>{question.lowLabel}</span>
      {question.midLabel && <span>{question.midLabel}</span>}
      <span>{question.highLabel}</span>
    </div>
  </div>
);

export default PointScale;

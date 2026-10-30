import React, { useState } from "react";
import { seasonOptions, colorOptions, patternOptions } from "@core/constants/optionsBank.js";
import { visibleTagGroups } from "@core/utils/tagOptions.js";

const ModalTwo = ({
  formData,
  toggleSeason,
  toggleColor,
  toggleTag,
  tights,
  pattern
}) => {

  // Only the item's own tags until "Show all tags" is pressed.
  const [showAllTags, setShowAllTags] = useState(false);
  const tagGroups = visibleTagGroups(formData.tags, showAllTags);

  return (

    <div className="modal-page">

    {/* Season */}

        <div>

          <fieldset className="season-group">
            <label className="form-label">Seasons</label>
            {seasonOptions.map(season => (
              <label
                key={season}
                className="season-label"
              >

                <input
                  type="checkbox"
                  checked={formData[season]}
                  onChange={() =>
                    toggleSeason(season)
                  }
                />

                {" "}
                {season}

              </label>

            ))}

          </fieldset>

          </div>


    {/* Tights - skirts, dresses and shorts only */}

    {tights?.asksTights && (
      <div>
        <fieldset className="season-group">
          <label className="form-label">Would you wear this with tights?</label>

          {[true, false].map((answer) => (
            <label key={String(answer)} className="season-label">
              <input
                type="radio"
                name="wearWithTights"
                checked={tights.wearWithTights === answer}
                onChange={() => tights.setWearWithTights(answer)}
              />

              {" "}
              {answer ? "Yes" : "No"}
            </label>
          ))}
        </fieldset>
      </div>
    )}


    {/* Colours */}

    <div className="color-section">

      <div className="form-label">
        Colours
      </div>

      <div className="color-grid">
        {colorOptions.map((color) => (
          <div className="color-item" key={color.name}>

            <span>{color.name}</span>

            <div
              className={
                formData.colors.includes(color.name)
                  ? "color-square selected"
                  : "color-square"
              }
              style={{
                backgroundColor: color.value,
              }}
              onClick={() => toggleColor(color.name)}
            />

          </div>
        ))}
      </div>

    </div>


    {/* Pattern - clothing only (footwear's is worked out from its colours) */}

    {pattern?.asksPattern && (
      <div>
        <fieldset className="season-group">
          <label className="form-label">Pattern</label>

          {patternOptions.map((option) => (
            <label key={option} className="season-label">
              <input
                type="radio"
                name="pattern"
                checked={(formData.pattern || "Plain") === option}
                onChange={() => pattern.setPattern(option)}
              />

              {" "}
              {option}
            </label>
          ))}
        </fieldset>
      </div>
    )}


    {/* Tags */}

    <div className="tags-section">

      <div className="form-label">
        Tags
      </div>

      {tagGroups.map(({ group, tags }) => (
        <div key={group}>
          {showAllTags && <div className="tag-group-label">{group}</div>}

          <div className="tags-selection-grid">
            {tags.map(tag => (
              <div className="tags-selection-item" key={tag}>
                <button
                  type="button"
                  className={
                    formData.tags.includes(tag)
                      ? "tags-selection-button selected"
                      : "tags-selection-button"
                  }
                  onClick={() => toggleTag(tag)}
                >
                  <span className="tags-selection-title">{tag}</span>
                </button>
              </div>
            ))}
          </div>
        </div>
      ))}

      <button
        type="button"
        className="show-more-tags"
        onClick={() => setShowAllTags(!showAllTags)}
      >
        {showAllTags ? "Show fewer tags" : "Show all tags"}
      </button>

    </div>

        </div>

      );
    };


export default ModalTwo;

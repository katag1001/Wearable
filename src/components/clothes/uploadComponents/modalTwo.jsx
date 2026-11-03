import React, { useState } from "react";
import { colorOptions, fabricOptions, patternOptions } from "@core/constants/optionsBank.js";
import { visibleTagGroups } from "@core/utils/tagOptions.js";

/*
 * Page two of the item form: fabric, tights, colours, pattern and tags.
 *
 * Each field is also exported on its own (taking the item form, `form`),
 * for the review after a photo is analysed (analysedItemReview.jsx), which
 * opens one at a time under its own row - `titled={false}` leaves out the
 * field's heading there.
 */


/* Fabric - clothing only */

export const FabricField = ({ form, titled = true }) => {

  const select = (
    <select
      className="form-select"
      value={form.formData.fabric || ""}
      onChange={(e) => form.setFabric(e.target.value)}
    >
      <option value="">Not sure</option>
      {fabricOptions.map((option) => (
        <option key={option} value={option}>
          {option}
        </option>
      ))}
    </select>
  );

  return titled ? (
    <div>
      <label className="form-label">
        Fabric
        {select}
      </label>
    </div>
  ) : select;
};


/* Tights - skirts, dresses and shorts only */

export const TightsField = ({ form, titled = true }) => (
  <div>
    <fieldset className="season-group">
      {titled && <label className="form-label">Would you wear this with tights?</label>}

      {[true, false].map((answer) => (
        <label key={String(answer)} className="season-label">
          <input
            type="radio"
            name="wearWithTights"
            checked={form.wearWithTights === answer}
            onChange={() => form.setWearWithTights(answer)}
          />

          {" "}
          {answer ? "Yes" : "No"}
        </label>
      ))}
    </fieldset>
  </div>
);


/* Colours */

export const ColoursField = ({ form, titled = true }) => (
  <div className="color-section">

    {titled && (
      <div className="form-label">
        Colours
      </div>
    )}

    <div className="color-grid">
      {colorOptions.map((color) => (
        <div className="color-item" key={color.name}>

          <span>{color.name}</span>

          <div
            className={
              form.formData.colors.includes(color.name)
                ? "color-square selected"
                : "color-square"
            }
            style={{
              backgroundColor: color.value,
            }}
            onClick={() => form.toggleColor(color.name)}
          />

        </div>
      ))}
    </div>

  </div>
);


/* Pattern - clothing only (footwear's is worked out from its colours) */

export const PatternField = ({ form, titled = true }) => (
  <div>
    <fieldset className="season-group">
      {titled && <label className="form-label">Pattern</label>}

      {patternOptions.map((option) => (
        <label key={option} className="season-label">
          <input
            type="radio"
            name="pattern"
            checked={(form.formData.pattern || "Plain") === option}
            onChange={() => form.setPattern(option)}
          />

          {" "}
          {option}
        </label>
      ))}
    </fieldset>
  </div>
);


/* Tags */

export const TagsField = ({ form, titled = true }) => {

  // Only the item's own tags until "Show all tags" is pressed.
  const [showAllTags, setShowAllTags] = useState(false);
  const tagGroups = visibleTagGroups(form.formData.tags, showAllTags);

  return (

    <div className="tags-section">

      {titled && (
        <div className="form-label">
          Tags
        </div>
      )}

      {tagGroups.map(({ group, tags }) => (
        <div key={group}>
          {showAllTags && <div className="tag-group-label">{group}</div>}

          <div className="tags-selection-grid">
            {tags.map(tag => (
              <div className="tags-selection-item" key={tag}>
                <button
                  type="button"
                  className={
                    form.formData.tags.includes(tag)
                      ? "tags-selection-button selected"
                      : "tags-selection-button"
                  }
                  onClick={() => form.toggleTag(tag)}
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

  );
};


const ModalTwo = ({ form }) => (

  <div className="modal-page">

    {form.asksFabric && <FabricField form={form} />}

    {form.asksTights && <TightsField form={form} />}

    <ColoursField form={form} />

    {form.asksPattern && <PatternField form={form} />}

    <TagsField form={form} />

  </div>

);


export default ModalTwo;

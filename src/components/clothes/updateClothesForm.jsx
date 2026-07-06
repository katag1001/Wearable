import React from "react";
import colorOptions from "../../constants/colorOptions";
import "./updateClothesForm.css";

const styleOptions = ["plain", "patterned"];

const UpdateClothesForm = ({
  type,
  formData,
  onChange,
  onSubmit,
  onCancel,
}) => {
  const handleMultiSelectChange = (e) => {
    const { name, options } = e.target;

    const selected = Array.from(options)
      .filter((o) => o.selected)
      .map((o) => o.value);

    onChange({
      target: {
        name,
        value: selected,
      },
    });
  };

  const handleCheckboxChange = (e) => {
    const { name, checked } = e.target;

    onChange({
      target: {
        name,
        value: checked,
      },
    });
  };

  // 🧠 SAFE NORMALIZATION (prevents crash)
  const safeStyles = Array.isArray(formData.styles)
    ? formData.styles
    : formData.styles
    ? [formData.styles]
    : [];

  const safeColors = Array.isArray(formData.colors)
    ? formData.colors
    : formData.colors
    ? [formData.colors]
    : [];

  return (
    <div className="modal-wrapper">
      <p className="modal-title">
        Update {type.charAt(0).toUpperCase() + type.slice(1)}
      </p>

      <form className="update-form" onSubmit={onSubmit}>
        {/* NAME */}
        <label className="form-label">
          Name:
          <input
            className="form-input"
            type="text"
            name="name"
            value={formData.name || ""}
            onChange={onChange}
            required
          />
        </label>

        {/* IMAGE */}
        <label className="form-label">
          Image URL:
          <input
            className="form-input"
            type="text"
            name="imageUrl"
            value={formData.imageUrl || ""}
            onChange={onChange}
          />
        </label>

        {/* COLORS */}
        <label className="form-label">
          Colors:
          <select
            className="form-select"
            name="colors"
            multiple
            value={safeColors}
            onChange={handleMultiSelectChange}
          >
            {colorOptions.map((color) => (
          <option key={color.name} value={color.name}>
            {color.name}
          </option>
        ))}
          </select>
        </label>

        {/* STYLES (FIXED CRASH HERE) */}
        <label className="form-label">
          Styles:
          <select
            className="form-select"
            name="styles"
            multiple
            value={safeStyles}
            onChange={handleMultiSelectChange}
          >
            {styleOptions.map((style) => (
              <option key={style} value={style}>
                {style}
              </option>
            ))}
          </select>
        </label>

        {/* MIN TEMP */}
        <label className="form-label">
          Min Temp:
          <input
            className="form-input"
            type="number"
            name="min_temp"
            value={formData.min_temp || ""}
            onChange={onChange}
          />
        </label>

        {/* MAX TEMP */}
        <label className="form-label">
          Max Temp:
          <input
            className="form-input"
            type="number"
            name="max_temp"
            value={formData.max_temp || ""}
            onChange={onChange}
          />
        </label>

        {/* SEASONS */}
        <fieldset className="season-group">
          <legend className="legend-title">Seasons</legend>

          {["spring", "summer", "autumn", "winter"].map((season) => (
            <label key={season} className="season-label">
              <input
                type="checkbox"
                name={season}
                checked={!!formData[season]}
                onChange={handleCheckboxChange}
              />
              <span className="custom-checkbox"></span>
              {season.charAt(0).toUpperCase() + season.slice(1)}
            </label>
          ))}
        </fieldset>

        {/* BUTTONS */}
        <div className="button-group">
          <button type="submit" className="save-button">
            Save
          </button>
          <button
            type="button"
            className="cancel-button"
            onClick={onCancel}
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
};

export default UpdateClothesForm;
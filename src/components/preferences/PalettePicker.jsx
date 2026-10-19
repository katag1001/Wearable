import { colourHex } from "@core/utils/colourPalettes.js";
import "./palettePicker.css";

// Favourite colour palettes, as swatch cards - used by the style quiz and
// Style Preferences. Outfits that fit a favourite palette score higher;
// the others are still suggested.
const PalettePicker = ({ palettes, selected, onToggle }) => (
  <div className="palette-picker">
    {palettes.map((palette) => {
      const isSelected = selected.includes(palette.id);

      return (
        <button
          key={palette.id}
          type="button"
          className={`palette-picker-card ${
            isSelected ? "palette-picker-card--selected" : ""
          }`}
          onClick={() => onToggle(palette.id)}
          aria-pressed={isSelected}
          aria-label={palette.colours.join(", ")}
          title={palette.colours.join(", ")}
        >
          <span className="palette-picker-swatches">
            {palette.colours.map((colour) => (
              <span
                key={colour}
                className="palette-picker-swatch"
                style={{ background: colourHex(colour) }}
              />
            ))}
          </span>

          {isSelected && (
            <span className="palette-picker-check" aria-hidden="true">
              ✓
            </span>
          )}
        </button>
      );
    })}
  </div>
);

export default PalettePicker;

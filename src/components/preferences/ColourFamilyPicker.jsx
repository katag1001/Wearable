import {
  MAX_FAVOURITE_COLOUR_FAMILIES,
  colourHex,
} from "@core/utils/colourPalettes.js";
import "./colourFamilyPicker.css";

// A family's colours as equal pie slices.
const pieBackground = (colours) => {
  const share = 100 / colours.length;
  const stops = colours.map(
    (colour, index) => `${colourHex(colour)} ${index * share}% ${(index + 1) * share}%`
  );

  return `conic-gradient(${stops.join(", ")})`;
};

// Favourite colour families (up to 3) as pie-chart cards - used by the
// style quiz and Style Preferences. Once 3 are picked the others are
// disabled until one is unpicked.
const ColourFamilyPicker = ({ families, selected, onToggle }) => {
  const full = selected.length >= MAX_FAVOURITE_COLOUR_FAMILIES;

  return (
    <div className="colour-family-picker">
      <div className="colour-family-picker-grid">
        {families.map((family) => {
          const isSelected = selected.includes(family.id);

          return (
            <button
              key={family.id}
              type="button"
              className={`colour-family-picker-card ${
                isSelected ? "colour-family-picker-card--selected" : ""
              }`}
              onClick={() => onToggle(family.id)}
              disabled={full && !isSelected}
              aria-pressed={isSelected}
              title={family.colours.join(", ")}
            >
              <span
                className="colour-family-picker-pie"
                style={{ background: pieBackground(family.colours) }}
              />
              <span className="colour-family-picker-name">{family.name}</span>

              {isSelected && (
                <span className="colour-family-picker-check" aria-hidden="true">
                  ✓
                </span>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
};

export default ColourFamilyPicker;

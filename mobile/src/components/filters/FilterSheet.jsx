// The filter panel as a bottom sheet. The logic is useFilterPanel (shared
// with the web's filter.jsx): edits are a draft until Apply. Each list
// turns on the sections it uses.

import { FILTER_TEMPERATURE_RANGE } from "@core/filters/filterDefaults.js";
import { useFilterPanel } from "@core/hooks/useFilterPanel.js";

import {
  Button,
  Chip,
  ChipRow,
  RangeSlider,
  SectionTitle,
  Sheet,
} from "../ui";
import { ItemFilterView } from "./ItemFilterView";

const capitalise = (text) => text.charAt(0).toUpperCase() + text.slice(1);

export const FilterSheet = ({
  visible,
  onClose,
  filters,
  setFilters,
  availableColors,
  availableStyles,
  availableTags,
  clothesByCategory,
  showSeasons = true,
  showColors = true,
  showStyles = true,
  showTags = true,
  showTemperature = false,
  showFavourites = false,
  showItemFilter = false,
}) => {
  const panel = useFilterPanel({
    isOpen: visible,
    filters,
    setFilters,
    onClose,
    availableColors,
    availableStyles,
    availableTags,
    clothesByCategory,
  });

  const { draft } = panel;
  const byItem = showItemFilter && panel.view === "items";

  return (
    <Sheet
      visible={visible}
      title={byItem ? "Filter by item" : "Filter"}
      onClose={onClose}
      footer={
        <>
          <Button
            label="Reset"
            variant="secondary"
            onPress={panel.reset}
            style={{ flex: 1 }}
          />
          <Button label="Apply" onPress={panel.apply} style={{ flex: 1 }} />
        </>
      }
    >
      {showItemFilter && (
        <Button
          label={byItem ? "‹ Other filters" : "Filter by item ›"}
          variant="secondary"
          onPress={() => panel.setView(byItem ? "main" : "items")}
        />
      )}

      {byItem ? (
        <ItemFilterView panel={panel} />
      ) : (
        <>
          {showFavourites && (
            <ChipRow>
              <Chip
                label="Favourites only"
                selected={!!draft.favourite}
                onPress={panel.toggleFavourite}
              />
            </ChipRow>
          )}

          {showSeasons && (
            <>
              <SectionTitle title="Season" />
              <ChipRow>
                {panel.seasons.map((season) => (
                  <Chip
                    key={season}
                    label={capitalise(season)}
                    selected={draft.seasons.includes(season)}
                    onPress={() => panel.toggleInList("seasons", season)}
                  />
                ))}
              </ChipRow>
            </>
          )}

          {showTemperature && (
            <>
              <SectionTitle title="Temperature" />
              <RangeSlider
                min={FILTER_TEMPERATURE_RANGE.min}
                max={FILTER_TEMPERATURE_RANGE.max}
                valueMin={draft.minTemp ?? FILTER_TEMPERATURE_RANGE.min}
                valueMax={draft.maxTemp ?? FILTER_TEMPERATURE_RANGE.max}
                onChange={panel.setTemperature}
              />
            </>
          )}

          {showColors && (
            <>
              <SectionTitle title="Colours" />
              <ChipRow>
                {panel.colors.map((color) => (
                  <Chip
                    key={color.name}
                    label={color.name}
                    swatch={color.value}
                    selected={draft.colors.includes(color.name)}
                    onPress={() => panel.toggleInList("colors", color.name)}
                  />
                ))}
              </ChipRow>
            </>
          )}

          {showStyles && (
            <>
              <SectionTitle title="Styles" />
              <ChipRow>
                {panel.styles.map((style) => (
                  <Chip
                    key={style}
                    label={capitalise(style)}
                    selected={draft.styles.includes(style)}
                    onPress={() => panel.toggleInList("styles", style)}
                  />
                ))}
              </ChipRow>
            </>
          )}

          {showTags && (
            <>
              <SectionTitle title="Tags" />
              <ChipRow>
                {panel.tags.map((tag) => (
                  <Chip
                    key={tag.name}
                    label={tag.name}
                    selected={draft.tags.includes(tag.name)}
                    onPress={() => panel.toggleInList("tags", tag.name)}
                  />
                ))}
              </ChipRow>
            </>
          )}
        </>
      )}
    </Sheet>
  );
};

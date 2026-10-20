// Editing one outfit in a bottom sheet: seasons, temperature range and
// tags, plus Mark as worn today and Delete. Logic: useMatchCard (shared
// with the web's expanded card).

import { useEffect } from "react";

import { seasonOptions, tagOptions } from "@core/constants/optionsBank.js";
import { useMatchCard } from "@core/hooks/useMatchCard.js";
import { TEMPERATURE_RANGE } from "@core/matches/matchFields.js";

import {
  Button,
  Chip,
  ChipRow,
  RangeSlider,
  SectionTitle,
  Sheet,
} from "../ui";

const capitalise = (text) => text.charAt(0).toUpperCase() + text.slice(1);

export const OutfitEditorSheet = ({
  match,
  onClose,
  onChanged,
  onFavouriteToggle,
  onError,
  onDelete,
}) => {
  const card = useMatchCard({ match, onChanged, onFavouriteToggle, onError });
  const { draft } = card;

  useEffect(() => {
    card.startEditing();
    // Once, for the outfit this sheet opened with.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleSave = async () => {
    if (await card.save()) {
      onClose();
    }
  };

  return (
    <Sheet
      visible
      title="Edit outfit"
      onClose={onClose}
      footer={
        <>
          <Button
            label={card.wornToday ? "Worn today" : "Mark as worn today"}
            variant="secondary"
            onPress={card.markWorn}
            loading={card.markingWorn}
            disabled={card.wornToday}
            style={{ flex: 1 }}
          />
          <Button
            label="Save"
            onPress={handleSave}
            loading={card.saving}
            disabled={!draft}
            style={{ flex: 1 }}
          />
        </>
      }
    >
      {draft && (
        <>
          <SectionTitle title="Seasons" />
          <ChipRow>
            {seasonOptions.map((season) => (
              <Chip
                key={season}
                label={capitalise(season)}
                selected={!!draft[season]}
                onPress={() => card.toggleSeason(season)}
              />
            ))}
          </ChipRow>

          <SectionTitle title="Temperature range" />
          <RangeSlider
            min={TEMPERATURE_RANGE.min}
            max={TEMPERATURE_RANGE.max}
            valueMin={Number(draft.min_temp)}
            valueMax={Number(draft.max_temp)}
            onChange={card.setTemperature}
          />

          <SectionTitle title="Tags" />
          <ChipRow>
            {tagOptions.map((tag) => (
              <Chip
                key={tag.name}
                label={tag.name}
                selected={draft.tags.includes(tag.name)}
                onPress={() => card.toggleTag(tag.name)}
              />
            ))}
          </ChipRow>

          <Button
            label="Delete outfit"
            variant="text"
            onPress={() => onDelete(match._id)}
          />
        </>
      )}
    </Sheet>
  );
};

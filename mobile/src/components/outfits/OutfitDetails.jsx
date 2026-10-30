// An outfit's editable details: star rating, seasons, temperature range,
// tights (when its items allow them) and tags.
// `card` is useMatchCard, already editing (its draft).

import { useState } from "react";
import { StyleSheet, View } from "react-native";

import { seasonOptions } from "@core/constants/optionsBank.js";
import { visibleTagGroups } from "@core/utils/tagOptions.js";
import { TEMPERATURE_RANGE } from "@core/matches/matchFields.js";

import { Chip, ChipRow, RangeSlider, SectionTitle, StarRating } from "../ui";

const capitalise = (text) => text.charAt(0).toUpperCase() + text.slice(1);

export const OutfitDetails = ({ card }) => {
  const { draft } = card;
  // Only the outfit's own tags until "Show all" is pressed.
  const [showAllTags, setShowAllTags] = useState(false);

  if (!draft) return null;

  return (
    <>
      <SectionTitle title="Rating" />
      <StarRating rating={draft.rating} onChange={card.setRating} style={styles.stars} />

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

      {card.offersTights ? (
        <>
          <SectionTitle title="Tights" />
          <ChipRow>
            <Chip
              label="Can wear with tights"
              selected={!!draft.wearWithTights}
              onPress={card.toggleWearWithTights}
            />
          </ChipRow>
        </>
      ) : null}

      <SectionTitle
        title="Tags"
        right={
          <Chip
            label={showAllTags ? "Show fewer" : "Show all"}
            onPress={() => setShowAllTags(!showAllTags)}
          />
        }
      />
      {visibleTagGroups(draft.tags, showAllTags).map(({ group, tags }) => (
        <View key={group}>
          {showAllTags ? <SectionTitle description={group} /> : null}
          <ChipRow>
            {tags.map((tag) => (
              <Chip
                key={tag}
                label={tag}
                selected={draft.tags.includes(tag)}
                onPress={() => card.toggleTag(tag)}
              />
            ))}
          </ChipRow>
        </View>
      ))}
    </>
  );
};

const styles = StyleSheet.create({
  stars: {
    justifyContent: "flex-start",
  },
});

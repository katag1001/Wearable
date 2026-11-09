// An outfit's editable details: star rating, temperature range, tights
// (when its items allow them) and tags. Its seasons come from its items.
// `card` is useMatchCard, already editing (its draft). `ratingAside`
// sits on the stars' line, on the right (the outfit screen's Wear today).

import { useState } from "react";
import { StyleSheet, View } from "react-native";

import { visibleTagGroups } from "@core/utils/tagOptions.js";
import { TEMPERATURE_RANGE } from "@core/matches/matchFields.js";

import { space } from "../../theme/soft";
import { Chip, ChipRow, RangeSlider, SectionTitle, StarRating, TextAction } from "../ui";

export const OutfitDetails = ({ card, ratingAside }) => {
  const { draft } = card;
  // Only the outfit's own tags until "Show all" is pressed.
  const [showAllTags, setShowAllTags] = useState(false);

  if (!draft) return null;

  return (
    <>
      <SectionTitle title="Rating" field />
      <View style={styles.ratingRow}>
        <StarRating rating={draft.rating} onChange={card.setRating} style={styles.stars} />
        {ratingAside}
      </View>

      <SectionTitle title="Temperature range" field />
      <RangeSlider
        min={TEMPERATURE_RANGE.min}
        max={TEMPERATURE_RANGE.max}
        valueMin={Number(draft.min_temp)}
        valueMax={Number(draft.max_temp)}
        onChange={card.setTemperature}
      />

      {card.offersTights ? (
        <>
          <SectionTitle title="Tights" field />
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
        field
        right={
          <TextAction
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
  ratingRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: space.sm,
  },
  stars: {
    justifyContent: "flex-start",
  },
});

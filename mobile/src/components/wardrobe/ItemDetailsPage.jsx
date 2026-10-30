// The lower half of the item form: seasons, tights (skirts, dresses and
// shorts only), colours, pattern (clothing only) and tags (pre-filled for a
// new item from its name and type).

import { useState } from "react";

import {
  colorOptions,
  patternOptions,
  seasonOptions,
} from "@core/constants/optionsBank.js";
import { visibleTagGroups } from "@core/utils/tagOptions.js";

import { View } from "react-native";

import { Chip, ChipRow, SectionTitle, SegmentedControl } from "../ui";

const TIGHTS_ANSWERS = [
  { key: "yes", label: "Yes" },
  { key: "no", label: "No" },
];

const capitalise = (text) => text.charAt(0).toUpperCase() + text.slice(1);

export const ItemDetailsPage = ({ form }) => {
  const { formData } = form;
  // Only the item's own tags until "Show all" is pressed.
  const [showAllTags, setShowAllTags] = useState(false);

  return (
    <>
      <SectionTitle title="Seasons" />
      <ChipRow>
        {seasonOptions.map((season) => (
          <Chip
            key={season}
            label={capitalise(season)}
            selected={!!formData[season]}
            onPress={() => form.toggleSeason(season)}
          />
        ))}
      </ChipRow>

      {form.asksTights ? (
        <>
          <SectionTitle title="Would you wear this with tights?" />
          <SegmentedControl
            options={TIGHTS_ANSWERS}
            value={form.wearWithTights ? "yes" : "no"}
            onChange={(key) => form.setWearWithTights(key === "yes")}
          />
        </>
      ) : null}

      <SectionTitle title="Colours" />
      <ChipRow>
        {colorOptions.map((color) => (
          <Chip
            key={color.name}
            label={color.name}
            swatch={color.value}
            selected={formData.colors.includes(color.name)}
            onPress={() => form.toggleColor(color.name)}
          />
        ))}
      </ChipRow>

      {form.asksPattern ? (
        <>
          <SectionTitle title="Pattern" />
          <ChipRow>
            {patternOptions.map((pattern) => (
              <Chip
                key={pattern}
                label={pattern}
                selected={(formData.pattern || "Plain") === pattern}
                onPress={() => form.setPattern(pattern)}
              />
            ))}
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
      {visibleTagGroups(formData.tags, showAllTags).map(({ group, tags }) => (
        <View key={group}>
          {showAllTags ? <SectionTitle description={group} /> : null}
          <ChipRow>
            {tags.map((tag) => (
              <Chip
                key={tag}
                label={tag}
                selected={formData.tags.includes(tag)}
                onPress={() => form.toggleTag(tag)}
              />
            ))}
          </ChipRow>
        </View>
      ))}
    </>
  );
};

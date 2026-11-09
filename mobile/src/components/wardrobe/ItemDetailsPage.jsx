// The lower half of the item form: fabric (clothing only), tights (skirts,
// dresses and shorts only), colours, pattern (clothing only) and tags
// (pre-filled for a new item from its name and type).
//
// Each field is also exported on its own, for the review after a photo
// is analysed (AnalysedItemReview), which opens one at a time under its
// own row - `titled={false}` leaves out the field's heading there.

import { useState } from "react";

import {
  colorOptions,
  fabricOptions,
  patternOptions,
} from "@core/constants/optionsBank.js";
import { visibleTagGroups } from "@core/utils/tagOptions.js";

import { View } from "react-native";

import { Chip, ChipRow, SectionTitle, SegmentedControl, TextAction } from "../ui";

const TIGHTS_ANSWERS = [
  { key: "yes", label: "Yes" },
  { key: "no", label: "No" },
];

// "" = not known.
const FABRIC_CHOICES = [{ value: "", label: "Not sure" }, ...fabricOptions.map((name) => ({ value: name, label: name }))];

export const FabricField = ({ form, titled = true }) => (
  <>
    {titled ? <SectionTitle title="Fabric" field /> : null}
    <ChipRow>
      {FABRIC_CHOICES.map(({ value, label }) => (
        <Chip
          key={label}
          label={label}
          selected={(form.formData.fabric || "") === value}
          onPress={() => form.setFabric(value)}
        />
      ))}
    </ChipRow>
  </>
);

export const TightsField = ({ form, titled = true }) => (
  <>
    {titled ? <SectionTitle title="Would you wear this with tights?" field /> : null}
    <SegmentedControl
      options={TIGHTS_ANSWERS}
      value={form.wearWithTights ? "yes" : "no"}
      onChange={(key) => form.setWearWithTights(key === "yes")}
    />
  </>
);

export const ColoursField = ({ form, titled = true }) => (
  <>
    {titled ? <SectionTitle title="Colours" field /> : null}
    <ChipRow>
      {colorOptions.map((color) => (
        <Chip
          key={color.name}
          label={color.name}
          swatch={color.value}
          selected={form.formData.colors.includes(color.name)}
          onPress={() => form.toggleColor(color.name)}
        />
      ))}
    </ChipRow>
  </>
);

export const PatternField = ({ form, titled = true }) => (
  <>
    {titled ? <SectionTitle title="Pattern" field /> : null}
    <ChipRow>
      {patternOptions.map((pattern) => (
        <Chip
          key={pattern}
          label={pattern}
          selected={(form.formData.pattern || "Plain") === pattern}
          onPress={() => form.setPattern(pattern)}
        />
      ))}
    </ChipRow>
  </>
);

export const TagsField = ({ form, titled = true }) => {
  const { formData } = form;
  // Only the item's own tags until "Show all" is pressed.
  const [showAllTags, setShowAllTags] = useState(false);

  const toggle = (
    <TextAction
      label={showAllTags ? "Show fewer" : "Show all"}
      onPress={() => setShowAllTags(!showAllTags)}
    />
  );

  return (
    <>
      {titled ? <SectionTitle title="Tags" field right={toggle} /> : <SectionTitle right={toggle} />}
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

export const ItemDetailsPage = ({ form }) => (
  <>
    {form.asksFabric ? <FabricField form={form} /> : null}
    {form.asksTights ? <TightsField form={form} /> : null}
    <ColoursField form={form} />
    {form.asksPattern ? <PatternField form={form} /> : null}
    <TagsField form={form} />
  </>
);

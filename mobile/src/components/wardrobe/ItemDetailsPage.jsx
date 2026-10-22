// The lower half of the item form: seasons, tights (skirts, dresses and
// shorts only), colours and tags (pre-filled for a new item from its name
// and type).

import {
  colorOptions,
  seasonOptions,
  tagOptions,
} from "@core/constants/optionsBank.js";

import { Chip, ChipRow, SectionTitle, SegmentedControl } from "../ui";

const TIGHTS_ANSWERS = [
  { key: "yes", label: "Yes" },
  { key: "no", label: "No" },
];

const capitalise = (text) => text.charAt(0).toUpperCase() + text.slice(1);

export const ItemDetailsPage = ({ form }) => {
  const { formData } = form;

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

      <SectionTitle title="Tags" />
      <ChipRow>
        {tagOptions.map((tag) => (
          <Chip
            key={tag.name}
            label={tag.name}
            selected={formData.tags.includes(tag.name)}
            onPress={() => form.toggleTag(tag.name)}
          />
        ))}
      </ChipRow>
    </>
  );
};

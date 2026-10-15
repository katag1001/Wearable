// Page two of the item form: seasons, colours and tags (pre-filled for a
// new item from its name and type).

import {
  colorOptions,
  seasonOptions,
  tagOptions,
} from "@core/constants/optionsBank.js";

import { Chip, ChipRow, Grid, SectionTitle, TagTile } from "../ui";

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
      <Grid columns={3}>
        {tagOptions.map((tag) => (
          <TagTile
            key={tag.name}
            tag={tag}
            selected={formData.tags.includes(tag.name)}
            onPress={() => form.toggleTag(tag.name)}
          />
        ))}
      </Grid>
    </>
  );
};

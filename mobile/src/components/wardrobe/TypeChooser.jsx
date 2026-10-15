// Picking the item's type on page one: suggestions from the name, then
// (clothing) a category and the types in it, or (footwear) every type.

import { useState } from "react";

import {
  getCategories,
  getCategoryOf,
  getOptionsInCategory,
} from "@core/wardrobe/typeChoices.js";

import { Button, Chip, ChipRow, SectionTitle } from "../ui";

export const TypeChooser = ({ form }) => {
  const { typeOptions, formData, chooseSubtype } = form;

  const [category, setCategory] = useState(() =>
    getCategoryOf(typeOptions, formData.subtype)
  );

  const typeChips = (options) => (
    <ChipRow>
      {options.map((option) => (
        <Chip
          key={option.name}
          label={option.name}
          selected={formData.subtype === option.name}
          onPress={() => {
            if (option.category) setCategory(option.category);
            chooseSubtype(option.name);
          }}
        />
      ))}
    </ChipRow>
  );

  return (
    <>
      <SectionTitle title="Type" />

      {form.subtypeSuggestions.length > 0 && (
        <>
          <SectionTitle description="Suggested from the name" />
          {typeChips(form.subtypeSuggestions)}
        </>
      )}

      {!form.hasCategories ? (
        <>
          <SectionTitle description="All footwear" />
          {typeChips(typeOptions)}
        </>
      ) : category ? (
        <>
          <SectionTitle
            description={category}
            right={
              <Button
                label="All categories"
                variant="text"
                onPress={() => setCategory(null)}
              />
            }
          />
          {typeChips(getOptionsInCategory(typeOptions, category))}
        </>
      ) : (
        <>
          <SectionTitle description="Category" />
          <ChipRow>
            {getCategories(typeOptions).map((name) => (
              <Chip key={name} label={name} onPress={() => setCategory(name)} />
            ))}
          </ChipRow>
        </>
      )}
    </>
  );
};

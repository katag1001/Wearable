// core/wardrobe/typeChoices.js
//
// Picking a clothing type on page one: category first, then the types in
// it. `typeOptions` is getTypeOptions(gender) / getFootwearOptions(gender).

export const getCategories = (typeOptions) => [
  ...new Set(typeOptions.map((option) => option.category)),
];

export const getOptionsInCategory = (typeOptions, category) =>
  typeOptions.filter((option) => option.category === category);

// The category of the chosen subtype, or null.
export const getCategoryOf = (typeOptions, subtype) =>
  typeOptions.find((option) => option.name === subtype)?.category || null;

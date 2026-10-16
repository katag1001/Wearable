// core/wardrobe/itemValidation.js
//
// What each page of the add/edit form needs before moving on.
// { valid, missing: ["a name", ...] } - see formatMissingFields.

const hasSeason = (formData) =>
  formData.spring || formData.summer || formData.autumn || formData.winter;

const PAGE_CHECKS = {
  // Name, type and an image (already saved, or newly chosen).
  1: (formData, hasNewImage) => [
    !formData.name.trim() && "a name",
    !formData.subtype.trim() && "a type",
    !formData.imageUrl && !hasNewImage && "an image",
  ],

  // At least one season and one colour.
  2: (formData) => [
    !hasSeason(formData) && "at least one season",
    formData.colors.length === 0 && "at least one colour",
  ],
};

export const validateItemPage = (page, formData, hasNewImage) => {
  const missing = PAGE_CHECKS[page](formData, hasNewImage).filter(Boolean);

  return { valid: missing.length === 0, missing };
};

// Every page at once, for a form shown on one page (the mobile app).
export const validateItem = (formData, hasNewImage) => {
  const missing = Object.keys(PAGE_CHECKS).flatMap(
    (page) => validateItemPage(page, formData, hasNewImage).missing
  );

  return { valid: missing.length === 0, missing };
};

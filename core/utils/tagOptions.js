// core/utils/tagOptions.js

import { tagOptions } from "../constants/optionsBank.js";

// The tagOptions entry ({ name }) with exactly this name, or null.
export const getTagOption = (tagName) =>
  tagOptions.find((tag) => tag.name === tagName) || null;

// Like getTagOption but ignoring case and spaces at the ends - for the
// weekly-preference tag, which may be spelt differently.
export const findTagOption = (tagName) => {
  if (!tagName) return null;

  const normalized = tagName.trim().toLowerCase();

  return tagOptions.find((tag) => tag.name.toLowerCase() === normalized) || null;
};

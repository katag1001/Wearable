// core/utils/tagOptions.js

import { tagGroups, tagOptions } from "../constants/optionsBank.js";

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

// The tag groups to show on an item or outfit's tag picker: only the tags it
// has, or every tag when the picker is expanded ("Show all tags"). Groups
// with nothing to show are left out.
export const visibleTagGroups = (selected = [], expanded = false) =>
  tagGroups
    .map(({ group, tags }) => ({
      group,
      tags: expanded ? tags : tags.filter((tag) => selected.includes(tag)),
    }))
    .filter(({ tags }) => tags.length > 0);

import { useState } from "react";

import { colorOptions } from "../constants/optionsBank.js";

/*
 * The "here's what we found" screen after a photo is analysed (shared by
 * the web and mobile apps): the item's main fields - name, type, colours -
 * as summary rows, and the rest behind "Show more fields". Each row's
 * "Change" opens that field's picker underneath it, one at a time.
 *
 * `form` is the item form (useWardrobeItemForm, filled in from the
 * analysis), which does all the editing and the saving - this only decides
 * what's shown.
 *
 * Each field is { key, label, value }: `key` is what the screen uses to
 * pick the field's picker, `value` the summary shown on the row. Colours
 * also have `swatches` (each chosen colour's hex), for showing the colours
 * themselves.
 */

const listOf = (values) => (values.length ? values.join(", ") : "None");

const swatchOf = (name) => colorOptions.find((color) => color.name === name)?.value;

export const useAnalysedItemReview = (form) => {
  const { formData } = form;

  // The field whose picker is open (a key below), or null.
  const [openField, setOpenField] = useState(null);
  const [showMore, setShowMore] = useState(false);

  const mainFields = [
    { key: "name", label: "Name", value: formData.name.trim() || "No name yet" },
    { key: "type", label: "Type", value: formData.subtype || "Not chosen" },
    {
      key: "colours",
      label: "Colours",
      value: listOf(formData.colors),
      swatches: formData.colors.map(swatchOf).filter(Boolean),
    },
  ];

  const moreFields = [
    form.asksPattern && { key: "pattern", label: "Pattern", value: formData.pattern || "Plain" },
    form.asksFabric && { key: "fabric", label: "Fabric", value: formData.fabric || "Not sure" },
    form.asksTights && {
      key: "tights",
      label: "Worn with tights",
      value: form.wearWithTights ? "Yes" : "No",
    },
    { key: "tags", label: "Tags", value: listOf(formData.tags) },
  ].filter(Boolean);

  const toggleField = (key) => setOpenField((current) => (current === key ? null : key));

  const toggleMore = () => {
    // Hiding the extra fields closes a picker open among them.
    if (showMore && moreFields.some((field) => field.key === openField)) {
      setOpenField(null);
    }

    setShowMore(!showMore);
  };

  return {
    mainFields,
    moreFields,
    openField,
    toggleField,
    showMore,
    toggleMore,
  };
};

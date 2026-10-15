import { useEffect, useMemo, useState } from "react";

import { getErrorMessage } from "../api/errors.js";
import { useClothingDetection } from "../clothes/useClothingDetection.js";
import { useClothingForm } from "../clothes/useClothingForm.js";
import {
  formatMissingFields,
  suggestSubtypesFromName,
} from "../clothes/uploadHelpers.js";
import { WARDROBE_KINDS } from "../wardrobe/itemKinds.js";
import { validateItemPage } from "../wardrobe/itemValidation.js";
import { saveWardrobeItem } from "../wardrobe/saveWardrobeItem.js";
import { useUserGender } from "./useUserGender.js";

const LAST_PAGE = 2;

/*
 * The two-page add / edit form for a clothing item or a pair of footwear
 * (`kind`: "clothing" | "footwear" - see core/wardrobe/itemKinds.js).
 *
 * Page one: name, image, type. Page two: seasons, colours, tags - filled
 * in from the name and type when a NEW item moves on from page one
 * (useClothingDetection). Editing changes only what the user changes.
 *
 * The chosen image is only uploaded on save. `onSaved` runs after a
 * successful save (e.g. to refresh the list).
 */
export const useWardrobeItemForm = ({ kind, item, onSaved }) => {
  const config = WARDROBE_KINDS[kind];
  const isUpdate = !!item;

  // "unisex" until the user's gender preference loads.
  const gender = useUserGender();

  const typeOptions = useMemo(() => config.getOptions(gender), [config, gender]);

  const form = useClothingForm(item, typeOptions);
  const { formData, setFormData, updateField } = form;

  const { applyDetection, resetDetection } = useClothingDetection(
    item,
    setFormData,
    typeOptions
  );

  const [page, setPage] = useState(1);
  // The newly chosen image (a File on the web, { uri, name, type } on a
  // phone) - not uploaded until save.
  const [selectedImage, setSelectedImage] = useState(null);
  const [showValidation, setShowValidation] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  // { id, name, type, message } once saved.
  const [savedItem, setSavedItem] = useState(null);

  // Style isn't asked: it's Patterned whenever there's more than one colour.
  useEffect(() => {
    const nextStyle = formData.colors.length > 1 ? "Patterned" : "Plain";

    if (formData.styles !== nextStyle) {
      updateField("styles", nextStyle);
    }
  }, [formData.colors, formData.styles, updateField]);

  const validation = validateItemPage(page, formData, !!selectedImage);

  // "Please enter a name and a type." while the user has tried to move on.
  const validationMessage =
    showValidation && !validation.valid
      ? `Please enter ${formatMissingFields(validation.missing)}.`
      : "";

  const subtypeSuggestions = suggestSubtypesFromName(
    formData.name,
    typeOptions,
    config.synonyms
  );

  /* -------------------- Pages -------------------- */

  const goNext = () => {
    if (!validation.valid) {
      setShowValidation(true);
      return;
    }

    setShowValidation(false);

    if (page === 1) {
      applyDetection(formData.name, formData.subtype);
    }

    setPage((current) => Math.min(current + 1, LAST_PAGE));
  };

  // false on page one - the caller decides what Back does there.
  const goBack = () => {
    setShowValidation(false);
    setError("");

    if (page === 1) return false;

    setPage((current) => current - 1);
    return true;
  };

  /* -------------------- Save -------------------- */

  const save = async () => {
    // Ignore repeat submits while a save is running.
    if (saving) return;

    if (!validation.valid) {
      setShowValidation(true);
      return;
    }

    setShowValidation(false);
    setSaving(true);
    setError("");

    try {
      const saved = await saveWardrobeItem({
        kind,
        item,
        formData,
        image: selectedImage,
      });

      setSavedItem({
        id: saved._id,
        name: saved.name,
        type: saved.type,
        message: isUpdate
          ? config.savedMessages.updated
          : config.savedMessages.added,
      });
      setSelectedImage(null);

      onSaved?.(saved);
    } catch (err) {
      console.error(`Save ${kind} error:`, err, err.response?.data);

      setError(getErrorMessage(err, err.message || `Error saving ${kind}`));
    } finally {
      setSaving(false);
    }
  };

  // After adding one item, start a blank form for the next.
  const addAnother = () => {
    form.resetForm();
    resetDetection();

    setSelectedImage(null);
    setSavedItem(null);
    setPage(1);
    setShowValidation(false);
    setError("");
  };

  return {
    kind,
    isUpdate,
    title: isUpdate ? config.titles.update : config.titles.add,
    hasCategories: config.hasCategories,
    hasMatches: config.hasMatches,
    typeOptions,
    subtypeSuggestions,

    formData,
    updateField,
    toggleColor: form.toggleColor,
    toggleTag: form.toggleTag,
    toggleSeason: form.toggleSeason,
    chooseSubtype: form.chooseSubtype,

    selectedImage,
    setSelectedImage,

    page,
    isLastPage: page === LAST_PAGE,
    goNext,
    goBack,
    validationMessage,

    save,
    saving,
    error,
    savedItem,
    addAnother,
  };
};

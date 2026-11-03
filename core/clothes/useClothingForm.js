import { useState } from "react";
import { getInitialState } from "./uploadHelpers.js";

// `initialFields` (a new item only) start the form filled in - e.g. from
// the photo analysis (core/hooks/usePhotoAnalysis.js).
export const useClothingForm = (item, typeOptions, initialFields = null) => {

  const [formData, setFormData] = useState(
    item || initialFields
      ? {
          ...getInitialState(),
          ...(item || initialFields)
        }
      : getInitialState()
  );

  const updateField = (name, value) => {

    setFormData(prev => ({
      ...prev,
      [name]: value
    }));

  };


  const toggleColor = (color) => {

    setFormData(prev => {

      const colors = prev.colors.includes(color)
        ? prev.colors.filter(c => c !== color)
        : [
            ...prev.colors,
            color
          ];


      return {
        ...prev,
        colors,
        styles:
          colors.length > 1
            ? "patterned"
            : prev.styles
      };

    });

  };


  const toggleTag = (tag) => {

    setFormData(prev => ({

      ...prev,

      tags: prev.tags.includes(tag)
        ? prev.tags.filter(t => t !== tag)
        : [
            ...prev.tags,
            tag
          ]

    }));

  };


  const chooseSubtype = (subtype) => {

    const option = typeOptions.find(
      item => item.name === subtype
    );


    // Only record the choice here. Page two is filled in from
    // the subtype when the user clicks Next (useClothingDetection).
    setFormData(prev => ({
      ...prev,
      subtype,
      type: option?.type || ""
    }));

  };


  // Reset the form to a completely new clothing item
  const resetForm = () => {

    setFormData(
      getInitialState()
    );

  };


  return {

    formData,
    setFormData,

    updateField,
    toggleColor,
    toggleTag,
    chooseSubtype,

    resetForm

  };

};
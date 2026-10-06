import { useState } from "react";
import { getInitialState } from "./uploadHelpers";

export const useClothingForm = (item, typeOptions) => {

  const [formData, setFormData] = useState(
    item
      ? {
          ...getInitialState(),
          ...item
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


  const toggleSeason = (season) => {

    setFormData(prev => ({
      ...prev,
      [season]: !prev[season]
    }));

  };


  const handleSubtypeChange = (e) => {

    const subtype = e.target.value;


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
    toggleSeason,
    handleSubtypeChange,

    resetForm

  };

};
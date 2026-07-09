import { useState } from "react";

import {getInitialState, calculateTemperatureRange} from "./uploadHelpers";

import typeOptions from "./typeOptions.js";


export const useClothingForm = (item) => {

  const [formData, setFormData] = useState(
    item
      ? {
          ...getInitialState(),
          ...item
        }
      : getInitialState()
  );


  const [manualTempOverride, setManualTempOverride] =
    useState(false);



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

    setManualTempOverride(false);


    setFormData(prev => {

      const updated = {
        ...prev,
        [season]: !prev[season]
      };


      const activeSeasons = [
        "spring",
        "summer",
        "autumn",
        "winter"
      ].filter(
        currentSeason =>
          updated[currentSeason]
      );


      const temperatureRange =
        calculateTemperatureRange(
          activeSeasons
        );


      return {
        ...updated,
        ...temperatureRange
      };

    });

  };



  const handleTempChange = (
    field,
    value
  ) => {

    setManualTempOverride(true);


    setFormData(prev => ({

      ...prev,

      [field]:
        field === "min_temp"

          ? Math.min(
              Number(value),
              prev.max_temp
            )

          : Math.max(
              Number(value),
              prev.min_temp
            )

    }));

  };



  const handleSubtypeChange = (e) => {

    const subtype = e.target.value;


    const option = typeOptions.find(
      item =>
        item.name === subtype
    );


    setFormData(prev => ({

      ...prev,

      subtype,

      type:
        option?.type || ""

    }));

  };



  return {

    formData,

    setFormData,

    updateField,

    toggleColor,

    toggleTag,

    toggleSeason,

    handleTempChange,

    handleSubtypeChange,

    manualTempOverride,

    setManualTempOverride

  };

};


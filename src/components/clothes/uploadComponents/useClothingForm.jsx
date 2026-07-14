import { useState } from "react";
import { getInitialState } from "./uploadHelpers";
import typeOptions from "../../../constants/typeOptions";

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

  setFormData(prev => ({
    ...prev,
    [season]: !prev[season]
  }));

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
    item => item.name === subtype
  );


  setFormData(prev => {

    const updated = {
      ...prev,
      subtype,
      type: option?.type || ""
    };


   if (option) {

  option.season.forEach(season => {

    updated[
      season.toLowerCase()
    ] = true;

  });


  if (option.tags) {

    updated.tags = [
      ...new Set([
        ...updated.tags,
        ...option.tags
      ])
    ];

  }


  if (!manualTempOverride) {

    updated.min_temp =
      option.minTemp;

    updated.max_temp =
      option.maxTemp;

  }

}


    return updated;

  });

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

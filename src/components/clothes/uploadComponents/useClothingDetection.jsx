import { useEffect } from "react";
import { detectFromName } from "./uploadHelpers";
import typeOptions from "./typeOptions.js";

export const useClothingDetection = (
name,
subtype,
setFormData,
manualTempOverride
) => {

useEffect(() => {
if (!name) return;


const {
  detectedColors,
  detectedSeasons,
  detectedTags,
  style
} = detectFromName(name);



setFormData(prev => {

  const updated = {
    ...prev
  };


  // Existing name detection
  if (detectedColors.length) {
    updated.colors = detectedColors;
  }


  if (detectedTags.length) {
    updated.tags = detectedTags;
  }


  Object.entries(detectedSeasons).forEach(([season, value]) => {

    if (value) {
      updated[season] = true;
    }

  });


  // New subtype detection
  const subtypeOption = typeOptions.find(
    item => item.name === subtype
  );


  if (subtypeOption) {


    subtypeOption.season.forEach(season => {

      updated[
        season.toLowerCase()
      ] = true;

    });


    if (!manualTempOverride) {

      updated.min_temp =
        subtypeOption.minTemp;


      updated.max_temp =
        subtypeOption.maxTemp;

    }

  }


  updated.styles = style;


  return updated;

});


}, [
name,
subtype,
setFormData,
manualTempOverride
]);

};

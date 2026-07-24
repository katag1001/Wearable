import { useEffect } from "react";
import { detectFromName } from "./uploadHelpers";
import typeOptions from "../../../constants/typeOptions";

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
  updated.tags = [
    ...new Set([
      ...updated.tags,
      ...detectedTags
    ])
  ];
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

      updated.tags = [
    ...new Set([
      ...updated.tags,
      ...subtypeOption.tags
    ])
  ];


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

  return updated;

});


}, [
name,
subtype,
setFormData,
manualTempOverride
]);

};

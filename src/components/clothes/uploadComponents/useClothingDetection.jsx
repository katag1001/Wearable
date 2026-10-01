import { useEffect, useRef } from "react";
import { detectFromName } from "./uploadHelpers";

export const useClothingDetection = (
name,
subtype,
setFormData,
manualTempOverride,
typeOptions
) => {

// Read these through refs so changing them (e.g. moving the
// temperature slider) doesn't re-run detection and undo the
// user's season/colour/tag choices. Detection should only run
// when the name or subtype changes.
const manualTempOverrideRef = useRef(manualTempOverride);
const typeOptionsRef = useRef(typeOptions);

manualTempOverrideRef.current = manualTempOverride;
typeOptionsRef.current = typeOptions;

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
  const subtypeOption = typeOptionsRef.current.find(
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


    if (!manualTempOverrideRef.current) {

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
setFormData
]);

};

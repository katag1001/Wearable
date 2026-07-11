import { useEffect } from "react";
import { detectFromName } from "./uploadHelpers";

export const useClothingDetection = (
name,
setFormData
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


  updated.styles = style;


  return updated;

});


}, [
name,
setFormData
]);

};

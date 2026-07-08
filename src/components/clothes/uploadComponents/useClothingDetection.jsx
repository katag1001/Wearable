import { useEffect } from "react";

import {
  detectFromName,
  calculateTemperatureRange,
  seasonOptions
} from "./uploadHelpers";


export const useClothingDetection = (
  name,
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


      if (detectedColors.length) {
        updated.colors = detectedColors;
      }


      seasonOptions.forEach(season => {
        updated[season] = detectedSeasons[season];
      });


      if (!manualTempOverride) {

        const activeSeasons = seasonOptions.filter(
          season => detectedSeasons[season]
        );


        const temperatureRange =
          calculateTemperatureRange(activeSeasons);


        updated.min_temp =
          temperatureRange.min_temp;

        updated.max_temp =
          temperatureRange.max_temp;
      }


      if (detectedTags.length) {
        updated.tags = detectedTags;
      }


      updated.styles = style;


      return updated;
    });


  }, [
    name,
    setFormData,
    manualTempOverride
  ]);

};

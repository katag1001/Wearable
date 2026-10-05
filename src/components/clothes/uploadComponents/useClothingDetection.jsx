import { useRef } from "react";
import {
  detectFromName,
  getInitialState,
  shiftTempForPreference
} from "./uploadHelpers";

// Fills in page two (seasons, tags, colours, temperature) from the
// name and subtype chosen on page one. This only runs when the user
// clicks Next, so changing their mind on page one doesn't leave
// suggestions from an earlier choice behind.
//
// Only ever runs for a NEW item. When editing an existing item nothing
// is auto-filled - only the fields the user actually changes are changed.
export const useClothingDetection = (
item,
setFormData,
manualTempOverride,
typeOptions,
temperaturePreference
) => {

// The name/subtype that page two was last filled from.
const lastAppliedRef = useRef(null);


const applyDetection = (name, subtype) => {

  if (item) return;

  const lastApplied = lastAppliedRef.current;

  const nameChanged = lastApplied?.name !== name;
  const subtypeChanged = lastApplied?.subtype !== subtype;

  // Nothing changed on page one (e.g. user went Back then Next),
  // so keep whatever they set on page two.
  if (!nameChanged && !subtypeChanged) return;

  lastAppliedRef.current = { name, subtype };


  const {
    detectedColors,
    detectedSeasons,
    detectedTags,
  } = detectFromName(name);

  const subtypeOption = typeOptions.find(
    option => option.name === subtype
  );

  const initial = getInitialState();


  setFormData(prev => {

    // Start seasons and tags from scratch so suggestions from a
    // previous name/subtype don't carry over.
    const updated = {
      ...prev,
      spring: false,
      summer: false,
      autumn: false,
      winter: false,
      tags: []
    };


    // Colours only come from the name, so leave any the user
    // picked alone if only the subtype changed.
    if (nameChanged) {
      updated.colors = detectedColors;
    }


    const tags = [...detectedTags];

    Object.entries(detectedSeasons).forEach(([season, value]) => {

      if (value) {
        updated[season] = true;
      }

    });


    if (subtypeOption) {

      tags.push(...(subtypeOption.tags || []));

      subtypeOption.season.forEach(season => {

        updated[
          season.toLowerCase()
        ] = true;

      });

    }

    updated.tags = [...new Set(tags)];


    // Defaults are shifted 1 degree for users who generally feel
    // too cold/too hot - see context/temperature-ranges.md.
    if (!manualTempOverride) {

      updated.min_temp = shiftTempForPreference(
        subtypeOption?.minTemp ?? initial.min_temp,
        temperaturePreference
      );

      updated.max_temp = shiftTempForPreference(
        subtypeOption?.maxTemp ?? initial.max_temp,
        temperaturePreference
      );

    }

    return updated;

  });

};


// Used when starting a brand new item so the next Next always
// fills page two, even if the name/subtype match the last item.
const resetDetection = () => {
  lastAppliedRef.current = null;
};


return {
  applyDetection,
  resetDetection
};

};

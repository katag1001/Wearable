import { useEffect, useState } from "react";

import { getStorage } from "../config.js";
import { STORAGE_KEYS } from "../storageKeys.js";
import { getPreferences } from "../api/preferences.js";

// The user's gender from /preferences, which decides the clothing and
// footwear type lists shown in the add forms. "unisex" until it loads,
// and stays "unisex" if the user has no preferences saved.
export const useUserGender = () => {

  const [gender, setGender] = useState("unisex");

  useEffect(() => {

    const fetchPreferences = async () => {

      if (!getStorage().getItem(STORAGE_KEYS.token)) return;

      try {

        const { data } = await getPreferences();

        if (data?.gender) {
          setGender(data.gender);
        }

      } catch {
        // No preferences saved yet - keep the unisex default.
      }

    };

    fetchPreferences();

  }, []);

  return gender;
};

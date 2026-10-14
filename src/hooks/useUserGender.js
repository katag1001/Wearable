import { useEffect, useState } from "react";
import axios from "axios";

import { URL } from "../config";

// The user's gender from /preferences, which decides the clothing and
// footwear type lists shown in the add forms. "unisex" until it loads,
// and stays "unisex" if the user has no preferences saved.
export const useUserGender = () => {

  const [gender, setGender] = useState("unisex");

  useEffect(() => {

    const fetchPreferences = async () => {

      const token = localStorage.getItem("token");

      if (!token) return;

      try {

        const response = await axios.get(
          `${URL}/preferences`,
          {
            headers: {
              Authorization: `Bearer ${token}`
            }
          }
        );

        const fetchedGender =
          response.data?.data?.gender;

        if (fetchedGender) {
          setGender(fetchedGender);
        }

      } catch {
        // No preferences saved yet - keep the unisex default.
      }

    };

    fetchPreferences();

  }, []);

  return gender;
};

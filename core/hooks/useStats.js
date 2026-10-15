import { useEffect, useState } from "react";

import { fetchAllClothing } from "../api/clothing.js";
import { fetchAllMatches } from "../api/matches.js";
import { getTopByCount, getWornCountField } from "../stats/topWorn.js";

const TOP_OUTFITS = 3;
const TOP_CLOTHES = 5;

// The stats screen: top outfits and clothes, all time or this year.
export const useStats = () => {
  const [matches, setMatches] = useState([]);
  const [clothes, setClothes] = useState([]);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [mode, setMode] = useState("allTime");

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const [allMatches, allClothes] = await Promise.all([
          fetchAllMatches(),
          fetchAllClothing(),
        ]);

        setMatches(allMatches);
        setClothes(allClothes);
      } catch (err) {
        console.error("Error fetching stats:", err);

        setError("Failed to load stats.");
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  const countField = getWornCountField(mode);

  return {
    loading,
    error,
    mode,
    setMode,
    countField,
    topOutfits: getTopByCount(matches, countField, TOP_OUTFITS),
    topClothes: getTopByCount(clothes, countField, TOP_CLOTHES),
  };
};

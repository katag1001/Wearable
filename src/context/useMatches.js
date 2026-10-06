import { useContext } from "react";

import { MatchesContext } from "./matchesContext";

export const useMatches = () => {
  const context = useContext(MatchesContext);

  if (!context) {
    throw new Error("useMatches must be used inside a MatchesProvider");
  }

  return context;
};

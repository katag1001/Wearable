import React, {
  useCallback,
  useEffect,
  useRef,
  useState,
} from "react";
import axios from "axios";

import { URL } from "../config";
import { MatchesContext } from "./matchesContext";

/*
 * Keeps the user's outfits in memory for the whole session, so pages
 * that show them (My Outfits, Homepage) can render the last known list
 * straight away instead of waiting on the server every visit.
 *
 * Pages still call fetchMatches() when they open - the cached list is
 * shown immediately and swapped for the fresh one when it arrives.
 * This keeps the list correct when outfits change elsewhere (Today,
 * clothing edits regenerating matches on the server, etc.) without
 * every one of those places having to update this store.
 */

export const MatchesProvider = ({ loggedIn, children }) => {
  const [matches, setMatches] = useState([]);

  // Shares one request between callers that ask at the same time
  // (e.g. React StrictMode running effects twice).
  const inFlightRef = useRef(null);

  // Bumped on logout so a request that started for the previous
  // user can't write their outfits into the store afterwards.
  const sessionRef = useRef(0);

  // Throws on failure so each page can show its own error message.
  const fetchMatches = useCallback(() => {
    if (inFlightRef.current) {
      return inFlightRef.current;
    }

    const token = localStorage.getItem("token");

    if (!token) {
      return Promise.reject(new Error("No user logged in"));
    }

    const session = sessionRef.current;

    const request = axios
      .get(`${URL}/match/`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })
      .then((response) => {
        if (session === sessionRef.current) {
          setMatches(response.data);
        }

        return response.data;
      })
      .finally(() => {
        inFlightRef.current = null;
      });

    inFlightRef.current = request;

    return request;
  }, []);

  // Clear everything on logout so the next user starts empty.
  useEffect(() => {
    if (!loggedIn) {
      sessionRef.current += 1;
      inFlightRef.current = null;
      setMatches([]);
    }
  }, [loggedIn]);

  return (
    <MatchesContext.Provider
      value={{ matches, setMatches, fetchMatches }}
    >
      {children}
    </MatchesContext.Provider>
  );
};


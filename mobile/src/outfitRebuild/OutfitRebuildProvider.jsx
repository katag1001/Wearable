// mobile/src/outfitRebuild/OutfitRebuildProvider.jsx
//
// Carries out the outfit rebuild a preference change starts (the style
// quiz, its retake on Style Preferences) in the background, for the whole
// signed-in app - core/outfitRebuild/runOutfitRebuild.js does the asking.
// One left unfinished (the app closed, the network dropped) is picked up
// again when the app opens or comes back to the front.
//
// useOutfitRebuild() gives:
// - `updating`: true while outfits are being rebuilt - Today, Wardrobe and
//   Outfits show OutfitRebuildNote.
// - `rebuiltCount`: goes up each time outfits or today's list were built
//   again, so Today and Outfits fetch theirs again.
// - `start(saveResult)`: after saving preferences, with the server's
//   answer ({ outfitRebuild, refreshToday }).

import { createContext, use, useCallback, useEffect, useRef, useState } from "react";
import { AppState } from "react-native";

import { getOutfitRebuild } from "@core/api/preferences.js";
import { runOutfitRebuild } from "@core/outfitRebuild/runOutfitRebuild.js";

import { markOutfitsChanged } from "../components/outfits/outfitsChanged";

const OutfitRebuildContext = createContext(null);

export const OutfitRebuildProvider = ({ children }) => {
  const [updating, setUpdating] = useState(false);
  const [rebuiltCount, setRebuiltCount] = useState(0);

  // One run at a time. A change made while one runs is covered by it: the
  // server refuses a second rebuild, and the run ends by building today's
  // list again.
  const running = useRef(false);

  // `rebuildingOutfits`: false when only today's list is built again (a
  // second at most - no note).
  const run = useCallback(async ({ refreshToday = false, rebuildingOutfits = true } = {}) => {
    if (running.current) return;

    running.current = true;
    setUpdating(rebuildingOutfits);

    try {
      const { finished } = await runOutfitRebuild({ refreshToday });

      if (finished) {
        if (rebuildingOutfits) markOutfitsChanged();
        setRebuiltCount((count) => count + 1);
      }
    } finally {
      running.current = false;
      setUpdating(false);
    }
  }, []);

  // Picks up a rebuild the server says is still running.
  const resume = useCallback(async () => {
    if (running.current) return;

    try {
      const { running: rebuildRunning } = await getOutfitRebuild();

      if (rebuildRunning) run();
    } catch (err) {
      console.error("Couldn't check for an outfit rebuild:", err);
    }
  }, [run]);

  useEffect(() => {
    resume();

    const subscription = AppState.addEventListener("change", (state) => {
      if (state === "active") resume();
    });

    return () => subscription.remove();
  }, [resume]);

  const start = useCallback(
    ({ outfitRebuild, refreshToday } = {}) => {
      if (outfitRebuild?.running) {
        run({ refreshToday });
      } else if (refreshToday) {
        run({ refreshToday, rebuildingOutfits: false });
      }
    },
    [run]
  );

  return (
    <OutfitRebuildContext value={{ updating, rebuiltCount, start }}>
      {children}
    </OutfitRebuildContext>
  );
};

export const useOutfitRebuild = () => {
  const rebuild = use(OutfitRebuildContext);

  if (!rebuild) {
    throw new Error("useOutfitRebuild must be used inside an OutfitRebuildProvider");
  }

  return rebuild;
};

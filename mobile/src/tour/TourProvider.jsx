// The app tour's state, for the signed-in tabs (app/(tabs)/_layout.jsx).
//
// Right after signing up (tourStorage), reaching Today offers the tour in
// a dialog: Take the tour or Skip. While it runs Today shows a sample
// outfit (SampleOutfit), and TourOverlay dims the app and points a speech
// bubble at each step's element (tourSteps) in turn. Skip ends it there;
// finishing the last step offers "Add your first piece", which opens the
// Add tab. Profile's "Take the tour" starts it again (start).
//
// Elements register themselves by name with useTourTarget (or the
// TourTarget wrapper), so the overlay can measure where they are.

import { createContext, use, useCallback, useEffect, useRef, useState } from "react";
import { router } from "expo-router";

import { useSession } from "../auth/SessionProvider";
import { showDialog } from "../components/soft/Dialog";
import { TOUR_STEPS } from "./tourSteps";
import { clearTourOffer, shouldOfferTour } from "./tourStorage";

const TourContext = createContext(null);

const ADD_TAB = "/(tabs)/(create)/create";

export const TourProvider = ({ children }) => {
  const { userEmail } = useSession();
  const [running, setRunning] = useState(false);
  const [stepIndex, setStepIndex] = useState(0);
  const targets = useRef(new Map());
  const offeredTo = useRef(null);

  const start = useCallback(() => {
    setStepIndex(0);
    setRunning(true);
  }, []);

  const skip = useCallback(() => setRunning(false), []);

  const finish = useCallback(() => {
    setRunning(false);
    showDialog("That's the tour", "Start by adding your first piece of clothing.", [
      { text: "Add your first piece", onPress: () => router.navigate(ADD_TAB) },
      { text: "Not now", style: "cancel" },
    ]);
  }, []);

  const next = useCallback(() => {
    if (stepIndex >= TOUR_STEPS.length - 1) finish();
    else setStepIndex(stepIndex + 1);
  }, [stepIndex, finish]);

  const back = useCallback(() => {
    setStepIndex((last) => Math.max(0, last - 1));
  }, []);

  // Once per account, the first time it reaches the tabs after signing up.
  useEffect(() => {
    if (!userEmail || offeredTo.current === userEmail) return;
    offeredTo.current = userEmail;

    if (!shouldOfferTour(userEmail)) return;

    showDialog("Welcome", "Would you like a quick tour of the app?", [
      {
        text: "Take the tour",
        onPress: () => {
          clearTourOffer();
          start();
        },
      },
      { text: "Skip", style: "cancel", onPress: clearTourOffer },
    ]);
  }, [userEmail, start]);

  const registerTarget = useCallback((name, node) => {
    targets.current.set(name, node);

    return () => {
      if (targets.current.get(name) === node) targets.current.delete(name);
    };
  }, []);

  const getTarget = useCallback((name) => targets.current.get(name) ?? null, []);

  return (
    <TourContext
      value={{
        running,
        stepIndex,
        step: running ? TOUR_STEPS[stepIndex] : null,
        stepCount: TOUR_STEPS.length,
        start,
        next,
        back,
        skip,
        registerTarget,
        getTarget,
      }}
    >
      {children}
    </TourContext>
  );
};

// { running, stepIndex, step, stepCount, start, next, back, skip, ... }, or null
// outside the tabs.
export const useTour = () => use(TourContext);

// A ref for the element the tour step named `name` points at. Does nothing
// without a name or outside the tabs.
export const useTourTarget = (name) => {
  const tour = use(TourContext);
  const registerTarget = tour?.registerTarget;

  return useCallback(
    (node) => {
      if (!name || !node || !registerTarget) return undefined;

      return registerTarget(name, node);
    },
    [name, registerTarget]
  );
};

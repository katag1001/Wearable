// mobile/src/components/plan/planChanged.js
//
// "A plan changed" for the screens behind the one that changed it: the
// Plan tab's calendar and day reload their plans, and Today - when today
// itself was planned (worn straight away on the server) - fetches its
// list again. In memory, like outfitsChanged.js; each screen checks its
// own flag when it comes back into view.

let plansChanged = { calendar: false, day: false, today: false };

// `today`: today itself was planned.
export const markPlanChanged = ({ today = false } = {}) => {
  plansChanged = { calendar: true, day: true, today: plansChanged.today || today };
};

// Whether `screen` ("calendar", "day" or "today") should reload - once.
export const takePlanChanged = (screen) => {
  const changed = plansChanged[screen];

  plansChanged = { ...plansChanged, [screen]: false };

  return changed;
};

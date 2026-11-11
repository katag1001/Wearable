import { useEffect, useState } from "react";

import { fetchPlans } from "../api/plan.js";
import {
  lastPlannableDate,
  monthGrid,
  monthOf,
  monthTitle,
  shiftMonth,
} from "../plan/calendar.js";
import { getTodayDate } from "../utils/dates.js";

// How many plans "Coming up" lists.
const COMING_UP_COUNT = 5;

/*
 * The Plan tab's calendar: one month at a time, from this month to the
 * last plannable one (core/plan/calendar.js), with a dot on planned days,
 * and the next few plans ("Coming up"). `reload` after a plan changes.
 */
export const usePlanCalendar = () => {
  const today = getTodayDate();
  const lastDate = lastPlannableDate(today);

  const [month, setMonth] = useState(monthOf(today));
  const [plans, setPlans] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const load = async () => {
    try {
      setPlans(await fetchPlans(today, lastDate));
      setError(null);
    } catch (err) {
      console.error("Failed to load plans:", err);
      setError("Couldn't load your plans.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
    // Once; reload() after changes.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const weeks = monthGrid(month, {
    today,
    lastDate,
    plannedDates: new Set(plans.map((plan) => plan.date)),
  });

  const canGoBack = month > monthOf(today);
  const canGoForward = month < monthOf(lastDate);

  return {
    today,
    month,
    title: monthTitle(month),
    weeks,
    canGoBack,
    canGoForward,
    goBack: () => canGoBack && setMonth((prev) => shiftMonth(prev, -1)),
    goForward: () => canGoForward && setMonth((prev) => shiftMonth(prev, 1)),

    comingUp: plans.slice(0, COMING_UP_COUNT),
    loading,
    error,
    reload: load,
  };
};

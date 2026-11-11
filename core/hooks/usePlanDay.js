import { useEffect, useMemo, useState } from "react";

import { getErrorMessage } from "../api/errors.js";
import { changePlanShoe, fetchPlans, removePlan } from "../api/plan.js";
import { usePlanFootwear } from "./usePlanFootwear.js";

/*
 * One day on the Plan tab: its plan ({ date, outfit: { matchId }, footwear })
 * or null, and changing its shoe or removing it. Changing the outfit is a
 * new plan (usePlanSuggestions / Build Outfit). `weather`: the day's
 * (useDayWeather), for ranking the shoes in Change shoes. `reload` after
 * coming back from planning.
 */
export const usePlanDay = ({ date, weather }) => {
  const [plan, setPlan] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [saving, setSaving] = useState(false);

  const load = async () => {
    try {
      const [found] = await fetchPlans(date, date);

      setPlan(found ?? null);
      setError(null);
    } catch (err) {
      console.error("Failed to load the day's plan:", err);
      setError("Couldn't load this day's plan.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    setLoading(true);
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [date]);

  const outfits = useMemo(() => (plan ? [plan.outfit] : []), [plan]);
  const footwear = usePlanFootwear({ outfits, weather, tags: [] });

  // Resolves true once saved.
  const run = async (action, failure) => {
    setSaving(true);

    try {
      await action();
      return true;
    } catch (err) {
      console.error(failure, err);
      setError(`${failure} ${getErrorMessage(err, err.message)}`);
      return false;
    } finally {
      setSaving(false);
    }
  };

  const changeShoe = (shoe) =>
    run(async () => {
      await changePlanShoe(date, shoe?._id ?? null);
      setPlan((prev) => prev && { ...prev, footwear: shoe ?? null });
    }, "Couldn't change the shoes.");

  const remove = () =>
    run(async () => {
      await removePlan(date);
      setPlan(null);
    }, "Couldn't remove the plan.");

  return {
    plan,
    loading,
    error,
    saving,
    footwear,
    changeShoe,
    remove,
    reload: load,
  };
};

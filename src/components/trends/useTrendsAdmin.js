import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import {
  clearTrends,
  createTrend,
  deleteTrend,
  listTrends,
  updateTrend,
} from "@core/api/trends.js";
import { getErrorMessage } from "@core/api/errors.js";

/*
 * The web /trends page: list, add, edit, delete and clear the current
 * trends. Admins only - the server decides: anyone else gets a 403 and is
 * sent home (logged-out users never get here - ProtectedRoute).
 */
export const useTrendsAdmin = () => {
  const navigate = useNavigate();

  const [trends, setTrends] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const load = async () => {
    try {
      const data = await listTrends();
      setTrends(data.trends || []);
      setError("");
    } catch (err) {
      if (err.response?.status === 403) {
        navigate("/", { replace: true });
        return;
      }
      setError(getErrorMessage(err, "Failed to load the trends."));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // Runs a change, then reloads. Returns true if it worked; the error
  // shows on the page otherwise.
  const run = async (change, fallback) => {
    try {
      setError("");
      await change();
      await load();
      return true;
    } catch (err) {
      setError(getErrorMessage(err, fallback));
      return false;
    }
  };

  return {
    trends,
    loading,
    error,
    save: (id, trend) =>
      run(() => (id ? updateTrend(id, trend) : createTrend(trend)), "Failed to save the trend."),
    remove: (id) => run(() => deleteTrend(id), "Failed to delete the trend."),
    clear: (scope) => run(() => clearTrends(scope), "Failed to clear the trends."),
  };
};

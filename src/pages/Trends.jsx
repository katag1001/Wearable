import { useState } from "react";

import TrendForm from "../components/trends/TrendForm";
import { describePiece, GENDER_OPTIONS, isShoeTrend } from "../components/trends/trendOptions";
import { useTrendsAdmin } from "../components/trends/useTrendsAdmin";
import "../components/trends/trends.css";

// Admin-only page (no link to it anywhere): the current trends that move
// Today's outfits for users who follow trends. Logic: useTrendsAdmin.

const DAY = 24 * 60 * 60 * 1000;

const endsText = (until) => {
  const days = Math.ceil((new Date(until) - Date.now()) / DAY);
  const date = new Date(until).toLocaleDateString();

  return days < 0 ? `Ended ${date}` : `Ends ${date} (${days} day${days === 1 ? "" : "s"} left)`;
};

const forText = (genders) =>
  genders?.length
    ? `For ${GENDER_OPTIONS.filter(({ value }) => genders.includes(value))
        .map(({ label }) => label.toLowerCase())
        .join(", ")}`
    : "For everyone";

const Trends = () => {
  const { trends, loading, error, save, remove, clear } = useTrendsAdmin();
  const [editingId, setEditingId] = useState(null);

  if (loading) {
    return <div className="loading">Loading...</div>;
  }

  const confirmThen = (question, action) => {
    if (window.confirm(question)) action();
  };

  return (
    <div className="page trends-page">
      <h1 className="page-title">Current trends</h1>


      {error && <p className="trends-error">{error}</p>}

      <h2 className="trends-heading">Add a trend</h2>
      <TrendForm onSave={(trend) => save(null, trend)} />

      <div className="trends-list-header">
        <h2 className="trends-heading">Trends ({trends.length})</h2>
        <div className="trends-actions">
          <button
            type="button"
            className="trends-link"
            onClick={() => confirmThen("Delete every ended trend?", () => clear("expired"))}
          >
            Clear ended
          </button>
          <button
            type="button"
            className="trends-link trends-link--danger"
            onClick={() => confirmThen("Delete ALL trends?", () => clear("all"))}
          >
            Clear all
          </button>
        </div>
      </div>

      {!trends.length && <p className="trends-empty">No trends yet.</p>}

      {trends.map((trend) =>
        editingId === trend._id ? (
          <TrendForm
            key={trend._id}
            trend={trend}
            onSave={async (changes) => {
              const saved = await save(trend._id, changes);
              if (saved) setEditingId(null);
              return saved;
            }}
            onCancel={() => setEditingId(null)}
          />
        ) : (
          <div
            key={trend._id}
            className={`trends-card ${new Date(trend.until) < Date.now() ? "trends-card--ended" : ""}`}
          >
            <div className="trends-card-main">
              <strong>
                {trend.label}
                {isShoeTrend(trend) && <span className="trends-card-meta"> · shoe (note only)</span>}
              </strong>
              <span>{trend.pieces.map(describePiece).join("  +  ")}</span>
              <span className="trends-card-meta">
                {forText(trend.genders)} · {endsText(trend.until)}
              </span>
            </div>
            <div className="trends-actions">
              <button type="button" className="trends-link" onClick={() => setEditingId(trend._id)}>
                Edit
              </button>
              <button
                type="button"
                className="trends-link trends-link--danger"
                onClick={() => confirmThen(`Delete "${trend.label}"?`, () => remove(trend._id))}
              >
                Delete
              </button>
            </div>
          </div>
        )
      )}
    </div>
  );
};

export default Trends;

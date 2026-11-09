import { useState } from "react";

import NamePicker from "./NamePicker";
import { emptyPiece, GENDER_OPTIONS, isShoeTrend, PIECE_FIELDS, SHOE_FIELDS } from "./trendOptions";

const MAX_PIECES = 4;

// Same as server/constants/trends.js TREND_LABEL_MAX_LENGTH.
const TREND_LABEL_MAX_LENGTH = 120;

// Shown under the Today note box, for ideas.
const EXAMPLE_NOTES = [
  "White jeans are really in right now.",
  "White jeans are everywhere this season.",
  "Bang on trend: white jeans.",
  "You're right on trend with white jeans.",
  "White jeans are having a moment.",
  "White jeans? Very now.",
  "Trend alert: white jeans are so in.",
  "White jeans are one of this season's big looks.",
];

// yyyy-mm-dd for a date input.
const dateInputValue = (date) => new Date(date).toISOString().slice(0, 10);

const threeMonthsFromNow = () => {
  const date = new Date();
  date.setMonth(date.getMonth() + 3);
  return dateInputValue(date);
};

const formFrom = (trend) => ({
  shoe: isShoeTrend(trend),
  label: trend?.label || "",
  genders: trend?.genders || [],
  pieces: trend?.pieces?.length ? trend.pieces : [emptyPiece()],
  until: trend?.until ? dateInputValue(trend.until) : threeMonthsFromNow(),
});

// Add or edit one trend. `onSave(trend)` resolves true when it saved.
const TrendForm = ({ trend, onSave, onCancel }) => {
  const [form, setForm] = useState(() => formFrom(trend));
  const [saving, setSaving] = useState(false);

  const set = (changes) => setForm((current) => ({ ...current, ...changes }));

  const setPiece = (index, changes) =>
    set({ pieces: form.pieces.map((piece, i) => (i === index ? { ...piece, ...changes } : piece)) });

  const toggleGender = (gender) =>
    set({
      genders: form.genders.includes(gender)
        ? form.genders.filter((chosen) => chosen !== gender)
        : [...form.genders, gender],
    });

  // Switching kind starts the items again: a shoe trend is one shoe piece.
  const setShoe = (shoe) => set({ shoe, pieces: [emptyPiece()] });

  const fields = form.shoe ? SHOE_FIELDS : PIECE_FIELDS;

  const submit = async (event) => {
    event.preventDefault();
    setSaving(true);
    const { shoe: _shoe, ...trendFields } = form;
    const saved = await onSave(trendFields);
    setSaving(false);

    if (saved && !trend) {
      setForm(formFrom(null));
    }
  };

  return (
    <form className="trends-form" onSubmit={submit}>
      <label className="trends-field">
        <span>Today note (the whole message)</span>
        <input
          value={form.label}
          onChange={(event) => set({ label: event.target.value })}
          placeholder="e.g. White jeans are really in right now."
          maxLength={TREND_LABEL_MAX_LENGTH}
          required
        />
      </label>

      <div className="trends-examples">
        <span>Some examples:</span>
        <ul>
          {EXAMPLE_NOTES.map((note) => (
            <li key={note}>{note}</li>
          ))}
        </ul>
      </div>

      <label className="trends-check">
        <input
          type="checkbox"
          checked={form.shoe}
          onChange={(event) => setShoe(event.target.checked)}
        />
        Shoe trend - just a note on Today when the shoe shown is on it, no points
      </label>

      <div className="trends-field">
        <span>For (none ticked = everyone)</span>
        <div className="trends-genders">
          {GENDER_OPTIONS.map(({ value, label }) => (
            <label key={value} className="trends-check">
              <input
                type="checkbox"
                checked={form.genders.includes(value)}
                onChange={() => toggleGender(value)}
              />
              {label}
            </label>
          ))}
        </div>
      </div>

      {form.pieces.map((piece, index) => (
        <fieldset key={index} className="trends-piece">
          <legend>
            {form.shoe ? "Shoe" : `Item ${index + 1}`}
            {form.pieces.length > 1 && (
              <button
                type="button"
                className="trends-link"
                onClick={() => set({ pieces: form.pieces.filter((_, i) => i !== index) })}
              >
                remove
              </button>
            )}
          </legend>

          {fields.map(({ key, label, options }) => (
            <NamePicker
              key={key}
              label={label}
              options={options}
              value={piece[key] || []}
              onChange={(names) => setPiece(index, { [key]: names })}
            />
          ))}
        </fieldset>
      ))}

      {!form.shoe && form.pieces.length < MAX_PIECES && (
        <button
          type="button"
          className="trends-link"
          onClick={() => set({ pieces: [...form.pieces, emptyPiece()] })}
        >
          + Combine with another item
        </button>
      )}

      <label className="trends-field">
        <span>Ends</span>
        <input
          type="date"
          value={form.until}
          onChange={(event) => set({ until: event.target.value })}
          required
        />
      </label>

      <div className="trends-actions">
        <button type="submit" className="trends-button" disabled={saving}>
          {saving ? "Saving..." : trend ? "Save changes" : "Add trend"}
        </button>
        {onCancel && (
          <button type="button" className="trends-link" onClick={onCancel}>
            Cancel
          </button>
        )}
      </div>
    </form>
  );
};

export default TrendForm;

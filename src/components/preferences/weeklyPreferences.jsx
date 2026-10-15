import { tagOptions } from "@core/constants/optionsBank.js";
import { weekDays as days } from "@core/constants/weekDays.js";
import { useWeeklyPreferences } from "@core/hooks/useWeeklyPreferences.js";
import { getTagOption } from "@core/utils/tagOptions.js";
import "./weeklyPreferences.css";
import "../../styles/pages.css";

// The logic lives in useWeeklyPreferences (shared with the mobile app);
// this only renders it.
const WeeklyPreferences = () => {
  const {
    weeklyTags: preferences,
    selectedDay,
    selectedDayLabel,
    selectDay,
    selectTag,
    clearDay,
    save,
    loading,
    saving,
    error,
    success,
  } = useWeeklyPreferences();

  const handleSubmit = (event) => {
    event.preventDefault();
    save();
  };

  const selectedTag = getTagOption(preferences[selectedDay]);

  if (loading) {
    return (
      <div className="weekly-preferences">
        <div className="weekly-preferences-loading">
          Loading your preferences...
        </div>
      </div>
    );
  }

  return (
    <form
      className="weekly-preferences"
      onSubmit={handleSubmit}
    >
      {/* HEADER */}

      <div className="weekly-preferences-header">
        <h2 className="page-title">
          Weekly Preferences
        </h2>

        <p className="page-subtitle">
          Choose what you'd like to
          wear each day.
        </p>
      </div>

      {/* WEEK */}

      <div className="weekly-preferences-week">
        {days.map((day) => {
          const tag = getTagOption(
            preferences[day.key]
          );

          const isActive =
            selectedDay === day.key;

          return (
            <button
              key={day.key}
              type="button"
              className={`day-card ${
                isActive
                  ? "day-card--active"
                  : ""
              }`}
              onClick={() =>
                selectDay(
                  day.key
                )
              }
              aria-pressed={isActive}
            >
              <span className="day-card-name">
                {day.label}
              </span>

              {tag ? (
                <>
                  <img
                    src={tag.image}
                    alt={tag.name}
                    className="day-card-image"
                  />

                  <span className="day-card-tag">
                    {tag.name}
                  </span>
                </>
              ) : (
                <div className="day-card-empty">
                  <span className="day-card-plus">
                    +
                  </span>

                  <span>
                    No preference
                  </span>
                </div>
              )}
            </button>
          );
        })}
      </div>

      {/* TAG SELECTOR */}

      <div className="tag-selector">
        <div className="tag-selector-header">
          <div className="tag-selector-header-name">
            <h3>
              {selectedDayLabel}
            </h3>

            <p>
              Select a preference for
              this day.
            </p>
          </div>

          {selectedTag && (
            <button
              type="button"
              className="clear-button"
              onClick={
                clearDay
              }
            >
              Clear
            </button>
          )}
        </div>

        <div className="tag-grid">

          {tagOptions.map((tag) => {
            const isSelected =
              preferences[
                selectedDay
              ] === tag.name;

            return (
              <button
                key={tag.name}
                type="button"
                className={`tag-card ${
                  isSelected
                    ? "tag-card--selected"
                    : ""
                }`}
                onClick={() =>
                  selectTag(
                    tag.name
                  )
                }
                aria-pressed={
                  isSelected
                }
              >
                <div className="tag-card-image-wrapper">
                  <img
                    src={tag.image}
                    alt={tag.name}
                    className="tag-card-image"
                  />
                </div>

                <div className="tag-card-content">
                  <span>
                    {tag.name}
                  </span>

                  {isSelected && (
                    <span
                      className="tag-card-check"
                      aria-label="Selected"
                    >
                      ✓
                    </span>
                  )}
                </div>
              </button>
            );
          })}
        </div>
        
      </div>

      {/* SAVE */}

      <button
        type="submit"
        className="save-button"
        disabled={saving}
      >
        {saving
          ? "Saving..."
          : "Save Preferences"}
      </button>

      {/* ERROR */}

      {error && (
        <div
          className="preferences-message preferences-message--error"
          role="alert"
        >
          {error}
        </div>
      )}

      {/* SUCCESS */}

      {success && (
        <div
          className="preferences-message preferences-message--success"
          role="status"
        >
          {success}
        </div>
      )}

      

    </form>
  );
};

export default WeeklyPreferences;
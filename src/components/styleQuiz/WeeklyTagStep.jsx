import { tagOptions } from "@core/constants/optionsBank.js";
import { weekDays } from "@core/constants/weekDays.js";
import { useWeekTagPicker } from "@core/hooks/useWeekTagPicker.js";
import { getTagOption } from "@core/utils/tagOptions.js";

// Style quiz step: pick a tag for each day of the week. Saved as the same
// weekly preferences the Weekly Preferences page edits, and used to pick
// today's outfits. Every day is optional.
const WeeklyTagStep = ({ weeklyTags, onTagChange, onBack, onNext }) => {
  const { activeDay, setActiveDay, activeDayLabel, selectTag } =
    useWeekTagPicker(weeklyTags, onTagChange);

  return (
    <div className="style-quiz-step">
      <div className="style-quiz-header">
        <h2 className="page-title">
          What do you generally wear throughout the week?
        </h2>
        <p className="page-subtitle">
          Pick a day, then what you usually wear that day.
        </p>
      </div>

      <div className="style-quiz-week">
        {weekDays.map((day) => {
          const tag = getTagOption(weeklyTags[day.key]);
          const isActive = activeDay === day.key;

          return (
            <button
              key={day.key}
              type="button"
              className={`style-quiz-day ${
                isActive ? "style-quiz-day--active" : ""
              }`}
              onClick={() => setActiveDay(day.key)}
              aria-pressed={isActive}
            >
              <span className="style-quiz-day-name">
                {day.label.slice(0, 3)}
              </span>

              {tag ? (
                <img
                  src={tag.image}
                  alt={tag.name}
                  className="style-quiz-day-image"
                />
              ) : (
                <span className="style-quiz-day-empty">+</span>
              )}

              <span className="style-quiz-day-tag">
                {tag ? tag.name : "None"}
              </span>
            </button>
          );
        })}
      </div>

      <p className="style-quiz-week-prompt">{activeDayLabel}</p>

      <div className="style-quiz-tag-grid">
        {tagOptions.map((tag) => {
          const isSelected = weeklyTags[activeDay] === tag.name;

          return (
            <button
              key={tag.name}
              type="button"
              className={`style-quiz-tag-card ${
                isSelected ? "style-quiz-tag-card--selected" : ""
              }`}
              onClick={() => selectTag(tag.name)}
              aria-pressed={isSelected}
            >
              <img
                src={tag.image}
                alt={tag.name}
                className="style-quiz-tag-card-image"
              />

              <span className="style-quiz-tag-card-name">{tag.name}</span>

              {isSelected && (
                <span className="style-quiz-image-card-check" aria-label="Selected">
                  ✓
                </span>
              )}
            </button>
          );
        })}
      </div>

      <div className="style-quiz-actions">
        <button
          type="button"
          className="style-quiz-back-button"
          onClick={onBack}
        >
          Back
        </button>

        <button
          type="button"
          className="style-quiz-finish-button"
          onClick={onNext}
        >
          Next
        </button>
      </div>
    </div>
  );
};

export default WeeklyTagStep;

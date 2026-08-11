import { useEffect, useState } from "react";
import { tagOptions } from "../../constants/optionsBank";
import "./weeklyPreferences.css";
import { URL } from "../../config"


const days = [
  { key: "monday", label: "Monday" },
  { key: "tuesday", label: "Tuesday" },
  { key: "wednesday", label: "Wednesday" },
  { key: "thursday", label: "Thursday" },
  { key: "friday", label: "Friday" },
  { key: "saturday", label: "Saturday" },
  { key: "sunday", label: "Sunday" },
];

const emptyPreferences = {
  monday: null,
  tuesday: null,
  wednesday: null,
  thursday: null,
  friday: null,
  saturday: null,
  sunday: null,
};

const WeeklyPreferences = () => {
  const [preferences, setPreferences] =
    useState(emptyPreferences);

  const [selectedDay, setSelectedDay] =
    useState("monday");

  const [loading, setLoading] =
    useState(true);

  const [saving, setSaving] =
    useState(false);

  const [error, setError] =
    useState("");

  const [success, setSuccess] =
    useState("");

  const getToken = () => {
    const token = localStorage.getItem("token");

    console.log(
      "Authentication token exists:",
      !!token
    );

    if (!token) {
      console.error(
        "No authentication token found in localStorage."
      );
    }

    return token;
  };

  const getResponseData = async (response) => {
    const text = await response.text();

    console.log(
      "Raw response:",
      text
    );

    if (!text) {
      return null;
    }

    try {
      return JSON.parse(text);
    } catch (err) {
      console.error(
        "Response was not valid JSON:",
        err
      );

      return null;
    }
  };

  useEffect(() => {
    const fetchPreferences = async () => {
      console.log("");
      console.log(
        "========================================"
      );
      console.log(
        "FETCHING WEEKLY PREFERENCES"
      );
      console.log(
        "========================================"
      );

      const token = getToken();

      if (!token) {
        setError(
          "You must be logged in to view your preferences."
        );

        setLoading(false);

        return;
      }

      const requestUrl =
        `${URL}/preferences`;

      console.log(
        "GET URL:",
        requestUrl
      );

      try {
        const response = await fetch(
          requestUrl,
          {
            method: "GET",

            headers: {
              Authorization:
                `Bearer ${token}`,
            },
          }
        );

        console.log(
          "GET status:",
          response.status
        );

        console.log(
          "GET response URL:",
          response.url
        );

        const result =
          await getResponseData(response);

        console.log(
          "GET result:",
          result
        );

        /*
          A 404 means the user does not have
          a preferences document yet.

          This is okay.
        */

        if (response.status === 404) {
          console.log(
            "No preferences found. Starting with empty preferences."
          );

          setPreferences(
            emptyPreferences
          );

          return;
        }

        if (response.status === 401) {
          console.error(
            "Authentication failed while fetching preferences."
          );

          throw new Error(
            result?.message ||
              "Your session has expired. Please log in again."
          );
        }

        if (!response.ok) {
          throw new Error(
            result?.message ||
              `Failed to load preferences (${response.status}).`
          );
        }

        if (result?.data) {
          const loadedPreferences = {
            monday:
              result.data.monday ?? null,

            tuesday:
              result.data.tuesday ?? null,

            wednesday:
              result.data.wednesday ?? null,

            thursday:
              result.data.thursday ?? null,

            friday:
              result.data.friday ?? null,

            saturday:
              result.data.saturday ?? null,

            sunday:
              result.data.sunday ?? null,
          };

          console.log(
            "Loaded preferences:",
            loadedPreferences
          );

          setPreferences(
            loadedPreferences
          );
        } else {
          setPreferences(
            emptyPreferences
          );
        }
      } catch (err) {
        console.error(
          "Error fetching preferences:",
          err
        );

        setError(
          err.message ||
            "Failed to load preferences."
        );
      } finally {
        setLoading(false);
      }
    };

    fetchPreferences();
  }, []);

  const handleDaySelect = (dayKey) => {
    console.log(
      "Selected day:",
      dayKey
    );

    setSelectedDay(dayKey);

    setError("");
    setSuccess("");
  };

  const handleTagSelect = (tagName) => {
    console.log(
      "Selected tag:",
      tagName,
      "for:",
      selectedDay
    );

    setPreferences((current) => ({
      ...current,
      [selectedDay]: tagName,
    }));

    setError("");
    setSuccess("");
  };

  const handleClearDay = () => {
    console.log(
      "Clearing preference for:",
      selectedDay
    );

    setPreferences((current) => ({
      ...current,
      [selectedDay]: null,
    }));

    setError("");
    setSuccess("");
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    console.log("");
    console.log(
      "========================================"
    );
    console.log(
      "SAVING WEEKLY PREFERENCES"
    );
    console.log(
      "========================================"
    );

    const token = getToken();

    if (!token) {
      setError(
        "You must be logged in to save your preferences."
      );

      return;
    }

    const requestUrl =
      `${URL}/preferences`;

    console.log(
      "PUT URL:",
      requestUrl
    );

    console.log(
      "Preferences:",
      preferences
    );

    console.log(
      "Token present:",
      !!token
    );

    try {
      setSaving(true);
      setError("");
      setSuccess("");

      const response = await fetch(
        requestUrl,
        {
          method: "PUT",

          headers: {
            "Content-Type":
              "application/json",

            Authorization:
              `Bearer ${token}`,
          },

          body: JSON.stringify(
            preferences
          ),
        }
      );

      console.log(
        "PUT status:",
        response.status
      );

      console.log(
        "PUT response URL:",
        response.url
      );

      const result =
        await getResponseData(response);

      console.log(
        "PUT result:",
        result
      );

      if (response.status === 401) {
        console.error(
          "Authentication failed while saving preferences."
        );

        throw new Error(
          result?.message ||
            "Your session has expired. Please log in again."
        );
      }

      if (!response.ok) {
        throw new Error(
          result?.message ||
            `Failed to save preferences (${response.status}).`
        );
      }

      console.log(
        "Preferences saved successfully."
      );

      if (result?.data) {
        const savedPreferences = {
          monday:
            result.data.monday ?? null,

          tuesday:
            result.data.tuesday ?? null,

          wednesday:
            result.data.wednesday ?? null,

          thursday:
            result.data.thursday ?? null,

          friday:
            result.data.friday ?? null,

          saturday:
            result.data.saturday ?? null,

          sunday:
            result.data.sunday ?? null,
        };

        setPreferences(
          savedPreferences
        );
      }

      setSuccess(
        "Preferences saved successfully."
      );
    } catch (err) {
      console.error(
        "Error saving preferences:",
        err
      );

      setError(
        err.message ||
          "Failed to save preferences."
      );
    } finally {
      setSaving(false);
    }
  };

  const getTag = (tagName) => {
    return tagOptions.find(
      (tag) => tag.name === tagName
    );
  };

  const selectedDayObject = days.find(
    (day) => day.key === selectedDay
  );

  const selectedTag = getTag(
    preferences[selectedDay]
  );

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
        <h2>
          Weekly Preferences
        </h2>

        <p>
          Choose what you'd like to
          wear each day.
        </p>
      </div>

            {/* TAG SELECTOR */}

      <div className="tag-selector">
        <div className="tag-selector-header">
          <div>
            <h3>
              {selectedDayObject?.label}
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
                handleClearDay
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
                  handleTagSelect(
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

      {/* WEEK */}

      <div className="weekly-preferences-week">
        {days.map((day) => {
          const tag = getTag(
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
                handleDaySelect(
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
    </form>
  );
};

export default WeeklyPreferences;
// The days a weekly tag preference can be set for, in the order they're
// shown. The keys are the field names on the Preferences model.
export const weekDays = [
  { key: "monday", label: "Monday" },
  { key: "tuesday", label: "Tuesday" },
  { key: "wednesday", label: "Wednesday" },
  { key: "thursday", label: "Thursday" },
  { key: "friday", label: "Friday" },
  { key: "saturday", label: "Saturday" },
  { key: "sunday", label: "Sunday" },
];

export const emptyWeeklyTags = Object.fromEntries(
  weekDays.map(({ key }) => [key, null])
);

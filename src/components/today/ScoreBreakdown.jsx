// Web only (for checking the scoring): how an outfit's Today score was
// made up when today's list was built - its saved score plus Today's
// points (server/services/todayScoreService.js). The app doesn't show it.

const PARTS = [
  ["season", "Season"],
  ["trend", "Trends"],
  ["favouriteItem", "Favourite item"],
  ["favouriteColours", "Favourite colours"],
];

const signed = (value) => (value > 0 ? `+${value}` : `${value}`);

const ScoreBreakdown = ({ breakdown }) => {
  if (!breakdown || typeof breakdown.total !== "number") {
    return null;
  }

  return (
    <p className="today-score-breakdown">
      Saved {Math.round(breakdown.saved)}
      {PARTS.map(([key, label]) => (
        <span key={key}>
          {" · "}
          {label} {signed(breakdown[key] ?? 0)}
        </span>
      ))}
      {" = "}
      <strong>Today {Math.round(breakdown.total)}</strong>
    </p>
  );
};

export default ScoreBreakdown;

// TEMPORARY - testing aid only. Shows a match's score subtly so matching
// can be checked by eye. To remove: delete this file and
// matchScoreBadge.css, then remove the <MatchScoreBadge /> usages in
// viewMatchesCard.jsx and viewToday.jsx.

import { getEffectiveMatchScore } from "../../utils/matchScore";
import "./matchScoreBadge.css";

const MatchScoreBadge = ({ match, overlay = false }) => {
  if (!match) return null;

  return (
    <span
      className={
        overlay
          ? "match-score-badge match-score-badge--overlay"
          : "match-score-badge"
      }
      title="Match score (testing only)"
    >
      Score {getEffectiveMatchScore(match)}
    </span>
  );
};

export default MatchScoreBadge;

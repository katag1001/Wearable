import React from "react";
import DeleteMatches from "./deleteMatches";
import "./viewMatchesCard.css";

const ViewMatchesCard = ({
  match,
  mode,
  renderItemImage,
  capitalize,
  handleReinstate,
  handleDeleteSuccess,
  setEditingMatch,
  onDeleteError,
}) => {
  return (
    <div className="match-card">
      <div className="match-images">
        {(match.clothes || []).map((item) => (
          <React.Fragment key={item._id}>
            {renderItemImage(item)}
          </React.Fragment>
        ))}
      </div>

      <div className="match-info">
        <div className="item-info">
          <div>
            {match.min_temp}° - {match.max_temp}°
          </div>

          <div>
            {["spring", "summer", "autumn", "winter"]
              .filter((season) => match[season])
              .map(capitalize)
              .join(", ") || "N/A"}
          </div>
        </div>

        <div className="match-items-button-row">
          {mode === "active" ? (
            <>
              <DeleteMatches
                matchId={match._id}
                onDeleteSuccess={handleDeleteSuccess}
                onError={onDeleteError}
                className="match-text-button"
              />

              <button
                className="match-text-button"
                onClick={() => setEditingMatch(match)}
              >
                Edit
              </button>
            </>
          ) : (
            <>
              {/*Delete and restore button class names passed from deleteMatches.jsx*/}
              <button
            
                onClick={() => handleReinstate(match._id)}
              >
                Restore Outfit
              </button>

              <button
                
                onClick={() => handleDeleteSuccess(match._id)}
              >
                Delete
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default ViewMatchesCard;
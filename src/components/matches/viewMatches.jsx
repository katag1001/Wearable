import React, { useEffect, useState } from "react";
import axios from "axios";
import DeleteMatches from "./deleteMatches";
import UpdateMatches from "./updateMatches";
import "./viewMatches.css";
import { URL } from "../../config";

const ViewMatches = () => {
  const [matches, setMatches] = useState([]);
  const [error, setError] = useState(null);
  const [editingMatch, setEditingMatch] = useState(null);
  const [selectedSeason, setSelectedSeason] = useState(null);

  const getToken = () => localStorage.getItem("token");

  useEffect(() => {
    const fetchMatches = async () => {
      try {
        setError(null);

        const token = getToken();

        if (!token) {
          setError("No user logged in");
          return;
        }

        const response = await axios.get(`${URL}/match/`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        console.log("Match response:", response.data);

        setMatches(response.data);
      } catch {
        setError("Failed to fetch matches");
      }
    };

    fetchMatches();
  }, []);

  const handleDeleteSuccess = (id) => {
    setMatches((prev) => prev.filter((match) => match._id !== id));
  };

  const handleUpdateSuccess = (updatedMatch) => {
    setMatches((prev) =>
      prev.map((m) => (m._id === updatedMatch._id ? updatedMatch : m))
    );
  };

  const handleError = (msg) => {
    setError(msg);
  };

  const renderItemImage = (item) => {
    if (!item?.imageUrl) return null;

    return (
      <div className="match-image-wrapper">
        <img src={item.imageUrl} alt={item.name} className="match-image" />
      </div>
    );
  };

  const filteredMatches = matches.filter((match) => {
    if (match.rejected) return false;
    if (!selectedSeason) return true;
    return match[selectedSeason];
  });

  const toggleSeasonFilter = (season) => {
    setSelectedSeason((prev) => (prev === season ? null : season));
  };

  const capitalize = (word) =>
    word.charAt(0).toUpperCase() + word.slice(1);

  return (
    <div className="view-matches-container">

      <div className="season-filters">
        {["spring", "summer", "autumn", "winter"].map((season) => (
          <button
            key={season}
            className={`text-button ${selectedSeason === season ? "active" : ""}`}
            onClick={() => toggleSeasonFilter(season)}
          >
            {capitalize(season)}
          </button>
        ))}
      </div>

      {error && <p className="error-text">{error}</p>}

      {filteredMatches.length === 0 && !error && (
        <p className="no-matches-text">No outfits found.</p>
      )}

      <div className="matches-grid">
        {filteredMatches.map((match) => (
          <div key={match._id} className="match-card">

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

              <div className="button-row">
                <DeleteMatches
                  matchId={match._id}
                  onDeleteSuccess={handleDeleteSuccess}
                  onError={handleError}
                />

                <button
                  className="text-button"
                  onClick={() => setEditingMatch(match)}
                >
                  Edit
                </button>
              </div>
            </div>

          </div>
        ))}
      </div>

      {editingMatch && (
        <UpdateMatches
          match={editingMatch}
          onClose={() => setEditingMatch(null)}
          onUpdateSuccess={handleUpdateSuccess}
          onError={handleError}
        />
      )}
    </div>
  );
};

export default ViewMatches;
import React, { useEffect, useState } from "react";
import axios from "axios";
import DeleteMatches from "./deleteMatches";
import UpdateMatches from "./updateMatches";
import Filter from "../general/filter.jsx";
import "./viewMatches.css";
import { URL } from "../../config";

const ViewMatches = ({ mode = "active" }) => {

  const [matches, setMatches] = useState([]);
  const [error, setError] = useState(null);
  const [editingMatch, setEditingMatch] = useState(null);
  const [selectedSeason, setSelectedSeason] = useState(null);

  const [showFilters, setShowFilters] = useState(false);

  const [filters, setFilters] = useState({
    seasons: [],
    colors: [],
    styles: [],
    tags: [],
    minTemp: null,
    maxTemp: null
  });

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

        setMatches(response.data);

      } catch (err) {
        setError("Failed to fetch matches");
      }
    };

    fetchMatches();

  }, []);

  const handleDeleteSuccess = (id) => {

    setMatches((prev) =>
      prev.filter((match) => match._id !== id)
    );
  };

  const handleUpdateSuccess = (updatedMatch) => {

    setMatches((prev) =>
      prev.map((m) =>
        m._id === updatedMatch._id
          ? updatedMatch
          : m
      )
    );

  };

  const handleError = (msg) => setError(msg);

  const handleReinstate = async (id) => {

    try {
      const token = getToken();
      const res = await axios.put(
        `${URL}/match/${id}`,
        { rejected: false },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const updated = res.data;

      setMatches((prev) =>
        prev.map((m) =>
          m._id === id
            ? updated
            : m
        )
      );

    } catch (err) {
      setError("Failed to reinstate match");
    }
  };

  const renderItemImage = (item) => {
    if (!item?.imageUrl) return null;
    return (
      <div className="match-image-wrapper">
        <img
          src={item.imageUrl}
          alt={item.name}
          className="match-image"
        />
      </div>
    );
  };

  const filteredMatches = matches.filter((match) => {
    
    const isRejected = !!match.rejected;

    if (mode === "active" && isRejected)
      return false;

    if (mode === "rejected" && !isRejected)
      return false;

    if (selectedSeason && !match[selectedSeason]) {
      return false;
    }

    if (filters.seasons.length > 0) {
      const seasonMatch = filters.seasons.some(
        season => match[season]
      );

      if (!seasonMatch)
        return false;

    }

    if (filters.colors.length > 0) {

      const colorMatch = match.colors.some(
        color => filters.colors.includes(color)
      );

      if (!colorMatch)
        return false;

    }

    if (filters.styles.length > 0) {

      const styleMatch = match.styles.some(
        style => filters.styles.includes(style)
      );

      if (!styleMatch)
        return false;

    }

    if (filters.tags.length > 0) {

      const tagMatch = (match.tags || []).some(
        tag => filters.tags.includes(tag)
      );

      if (!tagMatch)
        return false;

    }

    if (filters.minTemp !== null) {

      if (match.max_temp < filters.minTemp)
        return false;

    }

    if (filters.maxTemp !== null) {

      if (match.min_temp > filters.maxTemp)
        return false;

    }

    return true;

  });

  const toggleSeasonFilter = (season) => {

    setSelectedSeason((prev) =>
      prev === season
        ? null
        : season
    );

  };

  const capitalize = (word) =>
    word.charAt(0).toUpperCase() + word.slice(1);

  return (
    <div className="view-matches-container">
      
      <div className="season-filters">


        {["spring", "summer", "autumn", "winter"].map((season) => (

          <button
            key={season}
            className={`text-button ${
              selectedSeason === season
                ? "active"
                : ""
            }`}
            onClick={() =>
              toggleSeasonFilter(season)
            }
          >
            {capitalize(season)}
          </button>
        ))}

                <button
          className="text-button"
          onClick={() =>
            setShowFilters(true)
          }
        >
          More Filters
        </button>


      </div>

      {error && (
        <p className="error-text">
          {error}
        </p>
      )}

      {filteredMatches.length === 0 && !error && (
        <p className="no-matches-text">
          {mode === "rejected"
            ? "No rejected outfits found."
            : "No outfits found."}
        </p>
      )}

      <div className="matches-grid">

        {filteredMatches.map((match) => (
          <div
            key={match._id}
            className="match-card"
          >

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

                  {[
                    "spring",
                    "summer",
                    "autumn",
                    "winter"
                  ]

                    .filter(
                      (season) => match[season]
                    )

                    .map(capitalize)

                    .join(", ") || "N/A"}
                </div>
              </div>
              <div className="button-row">
                {mode === "active" ? (
                  <>
                    <DeleteMatches
                      matchId={match._id}
                      onDeleteSuccess={handleDeleteSuccess}
                      onError={handleError}
                    />

                    <button
                      className="text-button"
                      onClick={() =>
                        setEditingMatch(match)
                      }
                    >
                      Edit
                    </button>
                  </>
                ) : (
                  <>
                    <button
                      className="text-button"
                      onClick={() =>
                        handleReinstate(match._id)
                      }
                    >
                      Restore Outfit
                    </button>

                    <button
                      className="text-button"
                      onClick={() =>
                        handleDeleteSuccess(match._id)
                      }
                    >
                      Delete
                    </button>
                  </>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      <Filter
          isOpen={showFilters}
          onClose={() => setShowFilters(false)}
          filters={filters}
          setFilters={setFilters}

          availableColors={[
            ...new Set(
              matches.flatMap(
                match => match.colors || []
              )
            )
          ]}

          availableStyles={[
            ...new Set(
              matches.flatMap(
                match => match.styles || []
              )
            )
          ]}

          availableTags={[
            ...new Set(
              matches.flatMap(
                match => match.tags || []
              )
            )
          ]}
        />

      {editingMatch && mode === "active" && (

        <UpdateMatches
          match={editingMatch}
          onClose={() =>
            setEditingMatch(null)
          }
          onUpdateSuccess={handleUpdateSuccess}
          onError={handleError}
        />
      )}

    </div>
  );

};
export default ViewMatches;


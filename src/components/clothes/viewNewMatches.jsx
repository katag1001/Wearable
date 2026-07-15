import React, { useEffect, useState } from "react";
import axios from "axios";
import DeleteMatches from "../matches/deleteMatches";
import UpdateMatches from "../matches/updateMatches";
import { URL } from "../../config";

const ViewNewMatches = ({ newItemName, newItemType }) => {
  const [matches, setMatches] = useState([]);
  const [itemDetails, setItemDetails] = useState({});
  const [error, setError] = useState(null);
  const [editingMatch, setEditingMatch] = useState(null);
  const [loading, setLoading] = useState(true);

  const getToken = () => localStorage.getItem("token");

  useEffect(() => {
    let cancelled = false;

    const delay = (ms) => new Promise((res) => setTimeout(res, ms));

    const fetchMatchesOnce = async () => {
      const token = getToken();

      const response = await axios.get(`${URL}/match/`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const relevantMatches = response.data.filter((match) =>
        (match.clothes || []).some(
          (piece) => piece === `${newItemType}:${newItemName}`
        )
      );

      return relevantMatches;
    };

    const fetchItemDetails = async (relevantMatches) => {
      const itemsToFetch = [];

      relevantMatches.forEach((match) => {
        (match.clothes || []).forEach((piece) => {
          const [type, ...nameParts] = piece.split(":");
          const name = nameParts.join(":");

          if (type && name) {
            itemsToFetch.push({ type, name });
          }
        });
      });

      const uniqueItems = [
        ...new Set(itemsToFetch.map((i) => `${i.type}_${i.name}`)),
      ];

      const token = getToken();

      const fetchItem = async ({ type, name }) => {
        try {
          const res = await axios.get(
            `${URL}/clothing/${type}/${encodeURIComponent(name)}`,
            {
              headers: {
                Authorization: `Bearer ${token}`,
              },
            }
          );

          return { key: `${type}_${name}`, data: res.data };
        } catch {
          return null;
        }
      };

      const fetchedItems = await Promise.all(
        uniqueItems.map((key) => {
          const [type, ...nameParts] = key.split("_");
          const name = nameParts.join("_");
          return fetchItem({ type, name });
        })
      );

      const itemMap = {};
      fetchedItems.forEach((entry) => {
        if (entry && entry.data && !entry.data.error) {
          itemMap[entry.key] = entry.data;
        }
      });

      setItemDetails(itemMap);
    };

    const pollForMatches = async () => {
      setLoading(true);
      setError(null);

      let attempts = 0;
      const maxAttempts = 10;

      while (!cancelled && attempts < maxAttempts) {
        const relevantMatches = await fetchMatchesOnce();

        if (relevantMatches.length > 0) {
          setMatches(relevantMatches);
          await fetchItemDetails(relevantMatches);
          setLoading(false);
          return;
        }

        attempts++;
        await delay(1000);
      }

      if (!cancelled) {
        setMatches([]);
        setLoading(false);
      }
    };

    pollForMatches().catch(() => {
      if (!cancelled) {
        setError("Failed to fetch new matches");
        setLoading(false);
      }
    });

    return () => {
      cancelled = true;
    };
  }, [newItemName, newItemType]);

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

  const renderItemImage = (type, name) => {
    if (!name) return null;

    const lookupType = type === "outer" ? "outer" : type;
    const item = itemDetails[`${lookupType}_${name}`];

    if (item?.imageUrl) {
      return (
        <div className="match-image-wrapper">
          <img
            src={item.imageUrl}
            alt={`${type}-${name}`}
            className="match-image"
          />
        </div>
      );
    }

    return null;
  };

  const capitalize = (word) =>
    word.charAt(0).toUpperCase() + word.slice(1);

  return (
    <div className="view-matches-container">
      <h3>New Outfits for {newItemName}</h3>

      {loading && <p className="loading-text">Generating outfit matches...</p>}

      {error && <p className="error-text">{error}</p>}

      {!loading && matches.length === 0 && !error && (
        <p className="no-matches-text">No new matches found.</p>
      )}

      <div className="matches-grid">
        {matches
          .filter((match) => !match.rejected)
          .map((match) => (
            <div key={match._id} className="match-card">
              <div className="match-images">
                {(match.clothes || []).map((piece) => {
                  const [type, ...nameParts] = piece.split(":");
                  const name = nameParts.join(":");

                  return (
                    <React.Fragment key={piece}>
                      {renderItemImage(type, name)}
                    </React.Fragment>
                  );
                })}
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

export default ViewNewMatches;
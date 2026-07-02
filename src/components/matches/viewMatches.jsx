import React, { useEffect, useState } from 'react';
import axios from 'axios';
import DeleteMatches from './deleteMatches';
import UpdateMatches from './updateMatches';
import './viewMatches.css';
import {URL} from "../../config"; 

const ViewMatches = () => {
  const [matches, setMatches] = useState([]);
  const [itemDetails, setItemDetails] = useState({});
  const [error, setError] = useState(null);
  const [editingMatch, setEditingMatch] = useState(null);
  const [selectedSeason, setSelectedSeason] = useState(null); // Filter state

  useEffect(() => {
    const fetchMatches = async () => {
      try {
        setError(null);
        const response = await axios.post(`${URL}/match`, {
          username: localStorage.getItem('user'),
        });
        const fetchedMatches = response.data;
        setMatches(fetchedMatches);

        const itemsToFetch = [];

          fetchedMatches.forEach((match) => {
            (match.clothes || []).forEach((piece) => {
              const [type, ...nameParts] = piece.split(':');
              const name = nameParts.join(':');

              if (type && name) {
                itemsToFetch.push({ type, name });
              }
            });
          });

        const uniqueItems = [...new Set(itemsToFetch.map((i) => `${i.type}_${i.name}`))];

        const fetchItem = async ({ type, name }) => {
          try {
            const res = await axios.post(`${URL}/clothing/${type}/${name}`, {
              username: localStorage.getItem('user'),
            });
            return { key: `${type}_${name}`, data: res.data };
          } catch {
            return null;
          }
        };

        const fetchedItems = await Promise.all(
          uniqueItems.map((key) => {
            const [type, ...nameParts] = key.split('_');
            const name = nameParts.join('_');
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
      } catch {
        setError('Failed to fetch matches');
      }
    };

    fetchMatches();
  }, []);

  const handleDeleteSuccess = (id) => {
    setMatches((prev) => prev.filter((match) => match._id !== id));
  };

  const handleUpdateSuccess = (updatedMatch) => {
    setMatches((prev) => prev.map((m) => (m._id === updatedMatch._id ? updatedMatch : m)));
  };

  const handleError = (msg) => {
    setError(msg);
  };

  const renderItemImage = (type, name) => {
    if (!name) return null;

    const lookupType = type === 'outer' ? 'outer' : type;
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

  // Filter matches by selected season
  const filteredMatches = matches.filter((match) => {
    if (match.rejected) return false;
    if (!selectedSeason) return true;
    return match[selectedSeason];
  });

  // Toggle season selection
  const toggleSeasonFilter = (season) => {
    setSelectedSeason((prev) => (prev === season ? null : season));
  };

  const capitalize = (word) => word.charAt(0).toUpperCase() + word.slice(1);

  return (
    <div className="view-matches-container">

      {/* Season filter buttons */}
      <div className="season-filters">
        {['spring', 'summer', 'autumn', 'winter'].map((season) => (
          <button
            key={season}
            className={`text-button ${selectedSeason === season ? 'active' : ''}`}
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
              {(match.clothes || []).map((piece) => {
                const [type, ...nameParts] = piece.split(':');
                const name = nameParts.join(':');

                return (
                  <React.Fragment key={piece}>
                    {renderItemImage(type, name)}
                  </React.Fragment>
                );
              })}
            </div>

            <div className="match-info">
              <div className="item-info">
                <div>{match.min_temp}° - {match.max_temp}°</div>
                <div>
                  {
                    ['spring', 'summer', 'autumn', 'winter']
                      .filter((season) => match[season])
                      .map(capitalize)
                      .join(', ') || 'N/A'
                  }
                </div>
              </div>

              <div className="button-row">
                <DeleteMatches
                  matchId={match._id}
                  onDeleteSuccess={handleDeleteSuccess}
                  onError={handleError}
                />
                <button className="text-button" onClick={() => setEditingMatch(match)}>
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

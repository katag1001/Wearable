import React, { useEffect, useState } from 'react';
import axios from 'axios';
import './viewMatches.css';
import {URL} from "../../config"; 

const RejectedMatches = () => {
  const [matches, setMatches] = useState([]);
  const [itemDetails, setItemDetails] = useState({});
  const [error, setError] = useState(null);
  const [selectedSeason, setSelectedSeason] = useState(null); // Filter state

  // Fetch all matches on mount
  useEffect(() => {
    const fetchMatches = async () => {
      try {
        setError(null);
        const response = await axios.post(`${URL}/match`, { username: localStorage.getItem('user') });
        const fetchedMatches = response.data;
        setMatches(fetchedMatches);

        // Extract item names and types from rejected matches
        const itemsToFetch = [];

        fetchedMatches
          .filter(match => match.rejected)
          .forEach(match => {
            (match.clothes || []).forEach(piece => {
              const [type, ...nameParts] = piece.split(":");
              const name = nameParts.join(":");

              if (type && name) {
                itemsToFetch.push({ type, name });
              }
            });
          });

        // Remove duplicates
        const uniqueItems = [...new Set(itemsToFetch.map(i => `${i.type}_${i.name}`))];

        // Fetch each item from clothing API
        const fetchItem = async ({ type, name }) => {
          try {
            const res = await axios.post(`${URL}/clothing/${type}/${name}`, {
              username: localStorage.getItem('user')
            });
            return { key: `${type}_${name}`, data: res.data };
          } catch {
            return null;
          }
        };

        const fetchedItems = await Promise.all(
          uniqueItems.map(key => {
            const [type, ...nameParts] = key.split('_');
            const name = nameParts.join('_');
            return fetchItem({ type, name });
          })
        );

        // Store fetched item data by key
        const itemMap = {};
        fetchedItems.forEach(entry => {
          if (entry && entry.data && !entry.data.error) {
            itemMap[entry.key] = entry.data;
          }
        });

        setItemDetails(itemMap);
      } catch (err) {
        setError('Failed to fetch matches');
      }
    };

    fetchMatches();
  }, []);

  // Render item image
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

  // Delete match by ID
  const handleDelete = async (id) => {
    try {
      const response = await fetch(`${URL}/match/${id}`, {
        method: 'DELETE',
      });

      const data = await response.json();

      if (data.error) {
        setError(data.error);
      } else {
        setMatches((prevMatches) => prevMatches.filter((match) => match._id !== id));
      }
    } catch (err) {
      setError('Failed to delete match');
    }
  };

  // Reinstate match (set rejected to false)
  const handleReinstate = async (id) => {
    try {
      const response = await fetch(`${URL}/match/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ rejected: false }),
      });

      const data = await response.json();

      if (data.error) {
        setError(data.error);
      } else {
        setMatches((prevMatches) =>
          prevMatches.map((match) =>
            match._id === id ? { ...match, rejected: false } : match
          )
        );
      }
    } catch (err) {
      setError('Failed to reinstate match');
    }
  };

  // Filter rejected matches by selected season
  const filteredMatches = matches.filter((match) => {
    if (!match.rejected) return false;
    if (!selectedSeason) return true;
    return match[selectedSeason];
  });

  // Toggle season selection
  const toggleSeasonFilter = (season) => {
    setSelectedSeason((prev) => (prev === season ? null : season));
  };

  // Capitalize season names
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

      {error && <p className="error-text">Error: {error}</p>}

      {filteredMatches.length === 0 && !error && (
        <p className="no-matches-text">No rejected outfits found.</p>
      )}

      <div className="matches-grid">
        {filteredMatches.map((match) => (
          <div key={match._id} className="match-card">
            <div className="match-images">
              {(match.clothes || []).map(piece => {
                const [type, ...nameParts] = piece.split(":");
                const name = nameParts.join(":");
                return (
                  <React.Fragment key={piece}>
                    {renderItemImage(type, name)}
                  </React.Fragment>
                );
              })}
            </div>

            <div className="button-row">
              <button
                className="text-button"
                onClick={() => handleReinstate(match._id)}
              >
                Restore Outfit
              </button>
              <button
                className="text-button"
                onClick={() => handleDelete(match._id)}
              >
                Delete
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default RejectedMatches;

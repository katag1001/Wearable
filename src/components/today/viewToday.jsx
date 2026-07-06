import React, { useEffect, useState } from 'react';
import axios from 'axios';
import './viewToday.css';
import { URL } from "../../config";

const ViewToday = () => {
  const [outfits, setOutfits] = useState([]);
  const [filteredOutfits, setFilteredOutfits] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState(null);

  const fetchTodayOutfits = async () => {
    setLoading(true);

    try {
      const response = await axios.post(`${URL}/today/get`, {
        username: localStorage.getItem('user'),
      });

      const data = response.data;

      if (!Array.isArray(data)) {
        setMessage(data.message || 'Failed to fetch outfits.');
        setLoading(false);
        return;
      }

      setOutfits(data);

      const ranks = data.map((o) => o.rank).filter((r) => r != null);
      const maxRank = ranks.length ? Math.max(...ranks) : null;

      if (maxRank == null) {
        setFilteredOutfits([]);
        setMessage('No outfits with rank found.');
        setLoading(false);
        return;
      }

      const maxRankOutfits = data.filter((o) => o.rank === maxRank);

      setFilteredOutfits(maxRankOutfits);
      setCurrentIndex(0);

    } catch (err) {
      console.error('[ERROR] Failed to fetch outfits:', err);
      setMessage('Error fetching outfits: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTodayOutfits();
  }, []);

  const goNext = () => {
    if (filteredOutfits.length > 0) {
      setCurrentIndex((prev) => (prev + 1) % filteredOutfits.length);
    }
  };

  const goPrev = () => {
    if (filteredOutfits.length > 0) {
      setCurrentIndex((prev) => (prev - 1 + filteredOutfits.length) % filteredOutfits.length);
    }
  };

  const markAsWornToday = async () => {
    const outfit = filteredOutfits[currentIndex];
    if (!outfit?._id) return;

    try {
      const response = await fetch(`${URL}/match/${outfit._id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ lastWornDate: new Date().toISOString() }),
      });

      if (response.ok) {
        const updated = await response.json();

        setFilteredOutfits((prev) => {
          const arr = [...prev];
          arr[currentIndex] = {
            ...arr[currentIndex],
            lastWornDate: updated.lastWornDate,
          };
          return arr;
        });

        alert('Marked as worn today!');
      }
    } catch (err) {
      alert('Error updating lastWornDate: ' + err.message);
    }
  };

  const rejectOutfit = async () => {
    const outfit = filteredOutfits[currentIndex];
    if (!outfit?._id) return;

    try {
      const response = await fetch(`${URL}/match/${outfit._id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ rejected: true }),
      });

      if (response.ok) {
        const updated = await response.json();

        setFilteredOutfits((prev) => {
          const arr = [...prev];
          arr[currentIndex] = {
            ...arr[currentIndex],
            rejected: updated.rejected,
          };
          return arr;
        });

        alert('Outfit rejected.');
      }
    } catch (err) {
      alert('Error rejecting outfit: ' + err.message);
    }
  };

  const renderItemImage = (item) => {
    if (!item?.imageUrl) return null;

    return (
      <img
        key={item._id}
        src={item.imageUrl}
        alt={item.name}
        className="today-image"
      />
    );
  };

  if (loading) {
    return <p className="today-message">Loading outfits for today...</p>;
  }

  if (message) {
    return <p className="today-message">{message}</p>;
  }

  if (!filteredOutfits.length) {
    return (
      <p className="today-message">
        No outfits saved for today with highest rank.
      </p>
    );
  }

  const outfit = filteredOutfits[currentIndex];

  const images = (outfit.clothes || [])
    .map((item) => renderItemImage(item))
    .filter(Boolean);

  return (
    <div className="view-today-container">

      <div className="horizontal-scroll-wrapper">
        <button className="left-right" onClick={goPrev}>‹</button>

        <div className="clothing-card">
          <div className="today-image-group">
            {images}
          </div>

          <div className="today-buttons">
            <button className="regular-button" onClick={markAsWornToday}>
              Mark as Worn Today
            </button>

            <button className="regular-button" onClick={rejectOutfit}>
              Reject
            </button>
          </div>
        </div>

        <button className="left-right" onClick={goNext}>›</button>
      </div>

    </div>
  );
};

export default ViewToday;
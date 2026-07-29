import React, { useEffect, useState } from "react";
import axios from "axios";
import "./viewToday.css";
import { URL } from "../../config";

const ViewToday = () => {
  const [outfits, setOutfits] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState(null);

  const getToken = () => localStorage.getItem("token");

  const fetchTodayOutfits = async () => {
    setLoading(true);

    try {
      const token = getToken();

      if (!token) {
        setMessage("No user logged in");
        return;
      }

      const response = await axios.get(`${URL}/today/get`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = response.data;

      if (!Array.isArray(data)) {
        setMessage(data.message || "Failed to fetch outfits.");
        return;
      }

      setOutfits(data);
      setCurrentIndex(0);
    } catch (err) {
      console.error("[ERROR] Failed to fetch outfits:", err);
      setMessage("Error fetching outfits: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTodayOutfits();
  }, []);

  const goNext = () => {
    if (outfits.length > 0) {
      setCurrentIndex((prev) => (prev + 1) % outfits.length);
    }
  };

  const goPrev = () => {
    if (outfits.length > 0) {
      setCurrentIndex((prev) => (prev - 1 + outfits.length) % outfits.length);
    }
  };

  const markAsWornToday = async () => {
    const outfit = outfits[currentIndex];
    if (!outfit?._id) return;

    try {
      const token = getToken();

      const response = await fetch(`${URL}/match/${outfit._id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          lastWornDate: new Date().toISOString(),
        }),
      });

      if (response.ok) {
        const updated = await response.json();

        setOutfits((prev) => {
          const arr = [...prev];
          arr[currentIndex] = {
            ...arr[currentIndex],
            lastWornDate: updated.lastWornDate,
          };
          return arr;
        });

        alert("Marked as worn today!");
      }
    } catch (err) {
      alert("Error updating lastWornDate: " + err.message);
    }
  };

  const rejectOutfit = async () => {
    const outfit = outfits[currentIndex];
    if (!outfit?._id) return;

    try {
      const token = getToken();

      const response = await fetch(`${URL}/match/${outfit._id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          rejected: true,
        }),
      });

      if (response.ok) {
        // Remove the rejected outfit from the list
        setOutfits((prev) => {
          const updated = prev.filter((_, index) => index !== currentIndex);

          if (updated.length === 0) {
            setMessage("No outfits available for today.");
            return [];
          }

          if (currentIndex >= updated.length) {
            setCurrentIndex(updated.length - 1);
          }

          return updated;
        });

        alert("Outfit rejected.");
      }
    } catch (err) {
      alert("Error rejecting outfit: " + err.message);
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

  if (!outfits.length) {
    return <p className="today-message">No outfits saved for today.</p>;
  }

  const outfit = outfits[currentIndex];

  const images = (outfit.clothes || [])
    .map((item) => renderItemImage(item))
    .filter(Boolean);

  return (
    <div className="view-today-container">
      <div className="horizontal-scroll-wrapper">
        <button className="left-right" onClick={goPrev}>
          ‹
        </button>

        <div className="clothing-card">
          <div className="today-image-group">{images}</div>

          <div className="today-buttons">
            <button className="regular-button" onClick={markAsWornToday}>
              Mark as Worn Today
            </button>

            <button className="regular-button" onClick={rejectOutfit}>
              Reject
            </button>
          </div>
        </div>

        <button className="left-right" onClick={goNext}>
          ›
        </button>
      </div>
    </div>
  );
};

export default ViewToday;

import React, { useEffect, useState } from "react";
import axios from "axios";
import "./viewToday.css";
import { URL } from "../../config";
import todayOutfitSort from "./todayOutfitSort";


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

      console.log("TODAY RESPONSE:", response.data);
      const data = response.data;

      if (!Array.isArray(data)) {
        setMessage(data.message || "Failed to fetch outfits.");
        return;
      }

      setOutfits(todayOutfitSort(data));
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

      const matchId = outfit.matchId?._id;

      if (!matchId) return;


    try {
      const token = getToken();

      const response = await fetch(`${URL}/match/${matchId}`, {
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

  const images = (outfit.matchId?.clothes || [])
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

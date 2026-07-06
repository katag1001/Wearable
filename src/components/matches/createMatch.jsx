import React, { useEffect, useRef, useState } from "react";
import axios from "axios";
import "../clothes/viewClothes.css";
import "./createMatch.css";
import { URL } from "../../config";

const sectionTitles = {
  top: "Top Half",
  bottom: "Bottom Half",
  outer: "Outerwear",
  onepiece: "One-Pieces",
};

const CreateMatch = () => {
  const [formData, setFormData] = useState({
    top: [],
    bottom: [],
    outer: [],
    onepiece: [],
  });

  const [clothesData, setClothesData] = useState({
    top: [],
    bottom: [],
    outer: [],
    onepiece: [],
  });

  const [searchTerm, setSearchTerm] = useState("");
  const [response, setResponse] = useState(null);
  const [showPopup, setShowPopup] = useState(false);

  const scrollRefs = {
    top: useRef(null),
    bottom: useRef(null),
    outer: useRef(null),
    onepiece: useRef(null),
  };

  useEffect(() => {
    const fetchClothes = async () => {
      const user = localStorage.getItem("user");

      try {
        const res = await axios.post(`${URL}/clothing/all`, {
          username: user,
        });

        const grouped = {
          top: [],
          bottom: [],
          outer: [],
          onepiece: [],
        };

        res.data.forEach((item) => {
          if (grouped[item.type]) {
            grouped[item.type].push(item);
          }
        });

        setClothesData(grouped);
      } catch (err) {
        console.error("Error fetching clothing data:", err);
      }
    };

    fetchClothes();
  }, []);

  const handleSelect = (category, item) => {
    setFormData((prev) => {
      const exists = prev[category].some(
        (selected) => selected._id === item._id
      );

      return {
        ...prev,
        [category]: exists
          ? prev[category].filter(
              (selected) => selected._id !== item._id
            )
          : [...prev[category], item],
      };
    });
  };

  const isSelected = (category, item) =>
    formData[category].some((selected) => selected._id === item._id);

  const filteredItems = (category) => {
    return clothesData[category].filter((item) => {
      const term = searchTerm.toLowerCase();

      return (
        item.name?.toLowerCase().includes(term) ||
        item.brand?.toLowerCase().includes(term) ||
        item.colors?.some((c) => c.toLowerCase().includes(term)) ||
        item.tags?.some((t) => t.toLowerCase().includes(term))
      );
    });
  };

  const scroll = (category, direction) => {
    const container = scrollRefs[category].current;

    if (!container) return;

    container.scrollBy({
      left: direction * 300,
      behavior: "smooth",
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const selectedItems = Object.values(formData).flat();

    if (selectedItems.length === 0) {
      alert("Please select at least one clothing item.");
      return;
    }

    const allColors = [
      ...new Set(selectedItems.flatMap((item) => item.colors || [])),
    ];

    const minTempAvg = Math.round(
      selectedItems.reduce((sum, item) => sum + item.min_temp, 0) /
        selectedItems.length
    );

    const maxTempAvg = Math.round(
      selectedItems.reduce((sum, item) => sum + item.max_temp, 0) /
        selectedItems.length
    );

    const seasonKeys = ["spring", "summer", "autumn", "winter"];

    const seasons = {};

    seasonKeys.forEach((season) => {
      seasons[season] = selectedItems.every((item) => item[season]);
    });

    const clothes = [];

    Object.values(formData).forEach((items) => {
      items.forEach((item) => {
        clothes.push(item._id);
      });
    });

    const payload = {
      clothes,
      colors: allColors,
      min_temp: minTempAvg,
      max_temp: maxTempAvg,
      ...seasons,
      styles: [],
      type: "match",
      lastWornDate: new Date(),
      tags: [],
      rejected: false,
      userMade: true,
      username: localStorage.getItem("user"),
    };

    try {
      const res = await fetch(`${URL}/match/matches`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      const result = await res.json();

      setResponse(result);
      setShowPopup(true);

      setTimeout(() => {
        setShowPopup(false);
      }, 2500);

      setFormData({
        top: [],
        bottom: [],
        outer: [],
        onepiece: [],
      });
    } catch (err) {
      setResponse({
        error: err.message,
      });
    }
  };

  const renderItems = (category) => {
    const items = filteredItems(category);

    return (
      <div className="clothing-section">
        <div className="section-wrapper">
          <p className="section-title-viewclothes">
            {sectionTitles[category]}
          </p>

          <div className="horizontal-scroll-wrapper">
            <button
              type="button"
              className="scroll-arrow left-arrow"
              onClick={() => scroll(category, -1)}
            >
              ‹
            </button>

            <div className="scroll-container" ref={scrollRefs[category]}>
              {items.length === 0 ? (
                <p className="no-items">No items found.</p>
              ) : (
                items.map((item) => (
                  <div
                    key={item._id}
                    className={`clothing-card-buildmatch buildmatch-small ${
                      isSelected(category, item) ? "selected-item" : ""
                    }`}
                    onClick={() => handleSelect(category, item)}
                  >
                    {item.imageUrl && (
                      <img
                        src={item.imageUrl}
                        alt={item.name}
                        className="clothing-image-buildmatch"
                      />
                    )}
                  </div>
                ))
              )}
            </div>

            <button
              type="button"
              className="scroll-arrow right-arrow"
              onClick={() => scroll(category, 1)}
            >
              ›
            </button>
          </div>
        </div>
      </div>
    );
  };

  const order = ["top", "bottom", "outer", "onepiece"];

  const selectedItems = order.flatMap((category) =>
    (formData[category] || []).map((item) => ({
      category,
      item,
    }))
  );

  return (
    <div className="view-clothes-container">
      {showPopup && (
        <div className="match-popup-overlay">
          <div className="match-popup">
            <h3>✓ Outfit Submitted!</h3>
            <p>Your outfit has been successfully added to the matches database.</p>
          </div>
        </div>
      )}

      <div className="sticky-upload-container">
        <button type="button" onClick={handleSubmit} className="top-button">
          Submit Outfit
        </button>
      </div>

      <div className="buildmatch-layout">
        {/* LEFT SIDE */}
        <div className="buildmatch-left">
          <div className="buildmatch-search">
            <input
              type="text"
              className="buildmatch-search-input"
              placeholder="Search clothing..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          <form onSubmit={handleSubmit}>
            {renderItems("top")}
            {renderItems("bottom")}
            {renderItems("outer")}
            {renderItems("onepiece")}
          </form>
        </div>

        {/* RIGHT SIDE */}
        <div className="buildmatch-right">
          <div className="selected-outfit-box">
            <h2 className="selected-title">Selected Outfit</h2>

            {selectedItems.length === 0 ? (
              <div className="selected-empty">
                Select clothing items from the left to build an outfit.
              </div>
            ) : (
              <div className="selected-items">
                {selectedItems.map(({ category, item }) => (
                  <div className="selected-card" key={item._id}>
                    {item.imageUrl && (
                      <img
                        src={item.imageUrl}
                        alt={item.name}
                        className="selected-image"
                      />
                    )}

                    <button
                      type="button"
                      className="remove-selected-button"
                      onClick={() =>
                        setFormData((prev) => ({
                          ...prev,
                          [category]: prev[category].filter(
                            (selected) => selected._id !== item._id
                          ),
                        }))
                      }
                    >
                      ×
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {response?.error && <div className="error-text">{response.error}</div>}
    </div>
  );
};

export default CreateMatch;
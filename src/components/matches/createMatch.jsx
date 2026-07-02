import React, { useEffect, useState } from 'react';
import axios from 'axios';
import '../clothes/viewClothes.css';
import { URL } from "../../config";

const CreateMatch = () => {
  const [formData, setFormData] = useState({
    top: null,
    bottom: null,
    outer: null,
    onepiece: null,
  });

  const [clothesData, setClothesData] = useState({
    top: [],
    bottom: [],
    outer: [],
    onepiece: [],
  });

  const [response, setResponse] = useState(null);

  useEffect(() => {
    const fetchClothes = async () => {
      const user = localStorage.getItem('user');

      try {
        const res = await axios.post(`${URL}/clothing/all`, {
          username: user,
        });

        const allItems = res.data;

        const grouped = {
          top: [],
          bottom: [],
          outer: [],
          onepiece: [],
        };

        allItems.forEach(item => {
          if (grouped[item.type]) {
            grouped[item.type].push(item);
          }
        });

        setClothesData(grouped);
      } catch (err) {
        console.error('Error fetching clothing data:', err);
      }
    };

    fetchClothes();
  }, []);

  const handleSelect = (category, item) => {
    setFormData(prev => ({
      ...prev,
      [category]: prev[category]?._id === item._id ? null : item
    }));
  };

  const isSelected = (category, item) => {
    return formData[category]?._id === item._id;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const selectedItems = ['top', 'bottom', 'outer', 'onepiece']
      .map(key => formData[key])
      .filter(Boolean);

    const allColors = [...new Set(selectedItems.flatMap(item => item.colors))];

    const minTempAvg = Math.round(
      selectedItems.reduce((sum, item) => sum + item.min_temp, 0) / (selectedItems.length || 1)
    );

    const maxTempAvg = Math.round(
      selectedItems.reduce((sum, item) => sum + item.max_temp, 0) / (selectedItems.length || 1)
    );

    const seasonKeys = ['spring', 'summer', 'autumn', 'winter'];
    const seasons = {};
    seasonKeys.forEach(season => {
      seasons[season] = selectedItems.length
        ? selectedItems.every(item => item[season])
        : false;
    });

      const clothes = [];

      if (formData.top) clothes.push(`top:${formData.top.name}`);
      if (formData.bottom) clothes.push(`bottom:${formData.bottom.name}`);
      if (formData.outer) clothes.push(`outer:${formData.outer.name}`);
      if (formData.onepiece) clothes.push(`onepiece:${formData.onepiece.name}`);

      const payload = {
        clothes,
        colors: allColors,
        min_temp: minTempAvg,
        max_temp: maxTempAvg,
        ...seasons,
        styles: [],
        type: 'match',
        lastWornDate: new Date(),
        tags: [],
        rejected: false,
        userMade: true,
        username: localStorage.getItem('user') || null,
      };

    try {
      const res = await fetch(`${URL}/match/matches`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const result = await res.json();
      setResponse(result);
    } catch (err) {
      setResponse({ error: err.message });
    }
  };

  const renderItems = (items, category) => (
    <div className="clothing-section">
      <div className="section-wrapper">
        <p className="section-title-viewclothes">
          {sectionTitles[category]}
        </p>

        <div className="horizontal-scroll-wrapper">
          <button
            className="scroll-arrow left-arrow"
            type="button"
          >
            ‹
          </button>

          <div className="scroll-container">
            {items.length === 0 ? (
              <p className="no-items">No items found.</p>
            ) : (
              items.map(item => (
                <div
                  key={item._id}
                  className="clothing-card-buildmatch"
                  onClick={() => handleSelect(category, item)}
                  style={{
                    border: isSelected(category, item)
                      ? '3px solid pink'
                      : '2px solid black',
                    cursor: 'pointer',
                  }}
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
            className="scroll-arrow right-arrow"
            type="button"
          >
            ›
          </button>
        </div>
      </div>
    </div>
  );

  const sectionTitles = {
    top: "Top Half",
    outer: "Outerwear",
    bottom: "Bottom Half",
    onepiece: "One-Pieces"
  };

  return (
    <div className="view-clothes-container">

      <div className="sticky-upload-container">
        <button onClick={handleSubmit} className="top-button">
          Submit Outfit
        </button>
      </div>

      <form onSubmit={handleSubmit}>
        {renderItems(clothesData.top, 'top')}
        {renderItems(clothesData.bottom, 'bottom')}
        {renderItems(clothesData.outer, 'outer')}
        {renderItems(clothesData.onepiece, 'onepiece')}
      </form>

      {response && (
        <pre style={{ marginTop: '20px', whiteSpace: 'pre-wrap' }}>
          {JSON.stringify(response, null, 2)}
        </pre>
      )}
    </div>
  );
};

export default CreateMatch;
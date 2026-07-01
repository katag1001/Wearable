import React, { useEffect, useState } from 'react';
import axios from 'axios';
import UploadImages from './uploadPics';
import ViewNewMatches from './viewNewMatches';
import colorOptions from '../../constants/colorOptions';
import './createClothes.css';
import { URL } from "../../config";

const styleOptions = ["plain", "patterned"];

const seasonTempRanges = {
  spring: { min: 10, max: 20 },
  summer: { min: 15, max: 35 },
  autumn: { min: 8, max: 15 },
  winter: { min: 0, max: 13 }
};

const tagOptions = [
  "Work",
  "Gym",
  "Loungewear",
  "Party",
  "Date night",
  "Wedding",
  "Beach",
  "Outdoor",
  "Dinner",
  "Everyday"
];

const CreateClothes = () => {

  const initialState = {
    name: '',
    imageUrl: '',
    min_temp: 10,
    max_temp: 20,
    colors: [],
    styles: 'plain',
    type: 'top',
    spring: false,
    summer: false,
    autumn: false,
    winter: false,
    tags: [],
    lastWornDate: new Date(Date.now() - 100 * 365 * 24 * 60 * 60 * 1000),
    username: localStorage.getItem('user')
  };

  const [formData, setFormData] = useState(initialState);
  const [message, setMessage] = useState('');
  const [justCreatedItem, setJustCreatedItem] = useState(null);
  const [showForm, setShowForm] = useState(true);
  const [manualTempOverride, setManualTempOverride] = useState(false);

  const detectFromName = (name) => {
    const lower = name.toLowerCase();

    const detectedColors = colorOptions.filter(c =>
      lower.includes(c.toLowerCase())
    );

    const detectedSeasons = {
      spring: lower.includes("spring"),
      summer: lower.includes("summer"),
      autumn: lower.includes("autumn") || lower.includes("fall"),
      winter: lower.includes("winter")
    };

    const detectedTags = tagOptions.filter(tag =>
      lower.includes(tag.toLowerCase())
    );

    const style = detectedColors.length > 1 ? "patterned" : "plain";

    return { detectedColors, detectedSeasons, detectedTags, style };
  };

  const toggleColor = (color) => {
    setFormData(prev => {
      const exists = prev.colors.includes(color);
      const colors = exists
        ? prev.colors.filter(c => c !== color)
        : [...prev.colors, color];

      return {
        ...prev,
        colors,
        styles: colors.length > 1 ? "patterned" : prev.styles
      };
    });
  };

  const toggleTag = (tag) => {
    setFormData(prev => {
      const exists = prev.tags.includes(tag);
      const tags = exists
        ? prev.tags.filter(t => t !== tag)
        : [...prev.tags, tag];

      return { ...prev, tags };
    });
  };

  const toggleSeason = (season) => {
    setManualTempOverride(false);

    setFormData(prev => {
      const updated = {
        ...prev,
        [season]: !prev[season]
      };

      const active = Object.keys(updated).filter(
        s => ["spring", "summer", "autumn", "winter"].includes(s) && updated[s]
      );

      if (active.length > 0) {
        const ranges = active.map(s => seasonTempRanges[s]);
        updated.min_temp = Math.min(...ranges.map(r => r.min));
        updated.max_temp = Math.max(...ranges.map(r => r.max));
      }

      return updated;
    });
  };

  // ✅ DUAL SLIDER HANDLERS
  const handleMinTemp = (value) => {
    const v = Math.min(Number(value), formData.max_temp);
    setManualTempOverride(true);
    setFormData(prev => ({ ...prev, min_temp: v }));
  };

  const handleMaxTemp = (value) => {
    const v = Math.max(Number(value), formData.min_temp);
    setManualTempOverride(true);
    setFormData(prev => ({ ...prev, max_temp: v }));
  };

  useEffect(() => {
    if (!formData.name) return;

    const { detectedColors, detectedSeasons, detectedTags, style } =
      detectFromName(formData.name);

    setFormData(prev => {
      let updated = { ...prev };

      if (detectedColors.length > 0) {
        updated.colors = detectedColors;
      }

      Object.keys(detectedSeasons).forEach(s => {
        updated[s] = detectedSeasons[s];
      });

      if (!manualTempOverride) {
        const active = Object.keys(detectedSeasons).filter(s => detectedSeasons[s]);

        if (active.length > 0) {
          const ranges = active.map(s => seasonTempRanges[s]);
          updated.min_temp = Math.min(...ranges.map(r => r.min));
          updated.max_temp = Math.max(...ranges.map(r => r.max));
        }
      }

      if (detectedTags.length > 0) {
        updated.tags = detectedTags;
      }

      updated.styles = detectedColors.length > 1 ? "patterned" : style;

      return updated;
    });
  }, [formData.name]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const payload = {
        ...formData,
        min_temp: Number(formData.min_temp),
        max_temp: Number(formData.max_temp),
        styles: formData.styles.toLowerCase()
      };

      const res = await axios.post(`${URL}/clothing`, payload);

      if (res.data.error) {
        setMessage(`Error: ${res.data.error}`);
        return;
      }

      setMessage(`Item created: ${res.data.name}`);

      setJustCreatedItem({
        name: res.data.name,
        type: res.data.type
      });

      setShowForm(false);
      setFormData(initialState);

    } catch (err) {
      console.error(err);
      setMessage('Error submitting form');
    }
  };

  const handleAddNewItem = () => {
    setShowForm(true);
    setJustCreatedItem(null);
    setMessage('');
  };

  return (
    <div>
      {showForm ? (
        <div className="create-clothes-container">

          <form className="clothing-form" onSubmit={handleSubmit}>

            {/* NAME */}
            <label>
              Name:
              <input
                name="name"
                value={formData.name}
                onChange={(e) =>
                  setFormData({ ...formData, name: e.target.value })
                }
                required
              />
            </label>

            {/* IMAGE */}
            <div className="image-upload-section">
              <span>Image</span>
              <UploadImages setFormData={setFormData} formData={formData} />
            </div>

            {/* TYPE */}
            <label>
              Type:
              <select
                value={formData.type}
                onChange={(e) =>
                  setFormData({ ...formData, type: e.target.value })
                }
              >
                <option value="top">Top</option>
                <option value="bottom">Bottom</option>
                <option value="outer">Outer</option>
                <option value="onepiece">Onepiece</option>
              </select>
            </label>

            {/* SEASON */}
            <div>
              <h4>Season</h4>
              <div className="season-checkboxes">
                {["spring", "summer", "autumn", "winter"].map(season => (
                  <label key={season} className="season-label">
                    <input
                      type="checkbox"
                      checked={formData[season]}
                      onChange={() => toggleSeason(season)}
                    />
                    {season}
                  </label>
                ))}
              </div>
            </div>

            {/* TEMP DUAL SLIDER */}
            <div className="temp-section">
              <h4>
                Temperature: {formData.min_temp}°C - {formData.max_temp}°C
              </h4>

              <div className="range-wrapper">

                <input
                  type="range"
                  min={-30}
                  max={50}
                  value={formData.min_temp}
                  onChange={(e) => handleMinTemp(e.target.value)}
                  className="range range-min"
                />

                <input
                  type="range"
                  min={-30}
                  max={50}
                  value={formData.max_temp}
                  onChange={(e) => handleMaxTemp(e.target.value)}
                  className="range range-max"
                />

                <div className="range-track">
                  <div
                    className="range-fill"
                    style={{
                      left: `${((formData.min_temp + 30) / 80) * 100}%`,
                      width: `${((formData.max_temp - formData.min_temp) / 80) * 100}%`
                    }}
                  />
                </div>

              </div>
            </div>

            {/* COLORS */}
            <div>
              <h4>Colours</h4>
              <div className="color-grid">
                {colorOptions.map(color => (
  <div key={color.name} className="color-item">
    
    <span className="color-name">
      {color.name}
    </span>

    <div
      className={`color-square ${
        formData.colors.includes(color.name) ? "selected" : ""
      }`}
      style={{ backgroundColor: color.value }}
      onClick={() => toggleColor(color.name)}
    />
    
  </div>
))}
              </div>
            </div>

            {/* STYLE */}
            <label>
              Style:
              <select
                value={formData.styles}
                onChange={(e) =>
                  setFormData({ ...formData, styles: e.target.value })
                }
              >
                {styleOptions.map(s => (
                  <option key={s} value={s}>
                    {s.charAt(0).toUpperCase() + s.slice(1)}
                  </option>
                ))}
              </select>
            </label>

            {/* TAGS */}
            <div>
              <h4>Tags</h4>
              <div className="tags-grid">
                {tagOptions.map(tag => (
                  <label key={tag} className="tag-label">
                    <input
                      type="checkbox"
                      checked={formData.tags.includes(tag)}
                      onChange={() => toggleTag(tag)}
                    />
                    <span>{tag}</span>
                  </label>
                ))}
              </div>
            </div>

            <button className="submit-button" type="submit">
              Add Item
            </button>

          </form>

          {message && <p className="message-text">{message}</p>}
        </div>
      ) : (
        <div className="item-created-section">
          <button className="regular-button" onClick={handleAddNewItem}>
            Add New Item
          </button>

          {justCreatedItem && (
            <ViewNewMatches
              newItemName={justCreatedItem.name}
              newItemType={justCreatedItem.type}
            />
          )}
        </div>
      )}
    </div>
  );
};

export default CreateClothes;
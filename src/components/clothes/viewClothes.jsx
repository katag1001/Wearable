import React, { useEffect, useRef, useState } from 'react';
import axios from 'axios';
import deleteClothes from './deleteClothes';
import updateClothes from './updateClothes';
import UpdateClothesForm from './updateClothesForm';
import './viewClothes.css';
import { URL } from "../../config";

const ViewClothes = () => {
  const [itemsByType, setItemsByType] = useState({});
  const [error, setError] = useState(null);
  const [editingItem, setEditingItem] = useState(null);
  const [editingType, setEditingType] = useState(null);
  const [formData, setFormData] = useState({});

  const clothingTypes = ['top', 'bottom', 'outer', 'onepiece'];
  const scrollRefs = useRef({});

  // 🔐 Get token from storage
  const getToken = () => localStorage.getItem("token");

  const fetchAllItems = async () => {
    try {
      setError(null);

      const token = getToken();

      if (!token) {
        setError("No user logged in");
        return;
      }

      const res = await axios.get(`${URL}/clothing/`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const allItems = res.data;

      if (!Array.isArray(allItems)) {
        setError(allItems?.error || "Invalid response from server");
        return;
      }

      const grouped = {};

      for (const type of clothingTypes) {
        grouped[type] = [];
      }

      for (const item of allItems) {
        if (grouped[item.type]) {
          grouped[item.type].push(item);
        }
      }

      setItemsByType(grouped);
    } catch (err) {
      console.error(err);
      setError('Failed to fetch clothing items');
    }
  };

  useEffect(() => {
    fetchAllItems();
  }, []);

  const handleDelete = async (type, id) => {
    const confirmDelete = window.confirm('Are you sure you want to delete this item?');
    if (!confirmDelete) return;

    const result = await deleteClothes(type, id);

    if (result.error) {
      setError(result.error);
    } else {
      fetchAllItems();
    }
  };

  const handleEdit = (type, item) => {
    setEditingItem(item._id);
    setEditingType(type);

    setFormData({
      name: item.name || '',
      colors: item.colors || [],
      styles: item.styles || [],
      min_temp: item.min_temp || '',
      max_temp: item.max_temp || '',
      lastWornDate: item.lastWornDate?.split('T')[0] || '',
      spring: item.spring || false,
      summer: item.summer || false,
      autumn: item.autumn || false,
      winter: item.winter || false,
    });
  };

  const handleUpdateChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleUpdateSubmit = async (e) => {
    e.preventDefault();

    const updatedData = {
      name: formData.name,
      colors: formData.colors,
      styles: formData.styles,
      min_temp: Number(formData.min_temp),
      max_temp: Number(formData.max_temp),
      lastWornDate: formData.lastWornDate,
      spring: formData.spring || false,
      summer: formData.summer || false,
      autumn: formData.autumn || false,
      winter: formData.winter || false,
    };

    const result = await updateClothes(editingType, editingItem, updatedData);

    if (result.error) {
      setError(result.error);
    } else {
      setEditingItem(null);
      setEditingType(null);
      setFormData({});
      fetchAllItems();
    }
  };

  const getSeasons = (item) => {
    const seasons = [];
    if (item.spring) seasons.push('Spring');
    if (item.summer) seasons.push('Summer');
    if (item.autumn) seasons.push('Autumn');
    if (item.winter) seasons.push('Winter');
    return seasons.length > 0 ? seasons.join(', ') : 'None';
  };

  const scrollLeft = (type) => {
    if (scrollRefs.current[type]) {
      scrollRefs.current[type].scrollBy({ left: -320, behavior: 'smooth' });
    }
  };

  const scrollRight = (type) => {
    if (scrollRefs.current[type]) {
      scrollRefs.current[type].scrollBy({ left: 320, behavior: 'smooth' });
    }
  };

  const sectionTitles = {
    top: "Top Half",
    outer: "Outerwear",
    bottom: "Bottom Half",
    onepiece: "One-Pieces"
  };

  return (
    <div className="view-clothes-container">

      {error && <p className="error-text">Error: {error}</p>}

      {clothingTypes.map((type) => (
        <div key={type} className="clothing-section">
          <div className="section-wrapper">

            <p className="section-title-viewclothes">
              {sectionTitles[type]}
            </p>

            <div className="horizontal-scroll-wrapper">

              <button className="scroll-arrow left-arrow" onClick={() => scrollLeft(type)}>
                ‹
              </button>

              <div
                className="scroll-container"
                ref={(el) => (scrollRefs.current[type] = el)}
              >
                {(!itemsByType[type] || itemsByType[type].length === 0) ? (
                  <p className="no-items">No items found.</p>
                ) : (
                  itemsByType[type].map((item) => (
                    <div key={item._id} className="clothing-card-viewclothes">

                      {item.imageUrl && (
                        <img
                          src={item.imageUrl}
                          alt={item.name || 'Clothing item'}
                          className="clothing-image-viewclothes"
                        />
                      )}

                      <div className="clothing-details-viewclothes">
                        <div className="item-name">{item.name}</div>

                        <div className="item-info">
                          <div>{getSeasons(item)}</div>
                          <div>{item.min_temp}° - {item.max_temp}°</div>
                        </div>

                        <div className="button-row">
                          <button onClick={() => handleEdit(type, item)} className="text-button">
                            Edit
                          </button>
                          <button onClick={() => handleDelete(type, item._id)} className="text-button">
                            Delete
                          </button>
                        </div>
                      </div>

                    </div>
                  ))
                )}
              </div>

              <button className="scroll-arrow right-arrow" onClick={() => scrollRight(type)}>
                ›
              </button>

            </div>
          </div>
        </div>
      ))}

      {editingItem && (
        <UpdateClothesForm
          type={editingType}
          formData={formData}
          onChange={handleUpdateChange}
          onSubmit={handleUpdateSubmit}
          onCancel={() => setEditingItem(null)}
        />
      )}
    </div>
  );
};

export default ViewClothes;
import React, { useState } from 'react';
import axios from 'axios';
import UploadImages from './uploadPics';
import ViewNewMatches from './viewNewMatches';
import colorOptions from '../../constants/colorOptions';
import './createClothes.css';
import { URL } from "../../config";

const styleOptions = ["plain", "patterned"];

const CreateClothes = () => {
  const [formData, setFormData] = useState({
    name: '',
    imageUrl: '',
    min_temp: '',
    max_temp: '',
    colors: [],
    styles: '',
    type: 'top',
    spring: false,
    summer: false,
    autumn: false,
    winter: false,
    username: localStorage.getItem('user')
  });

  const [message, setMessage] = useState('');
  const [justCreatedItem, setJustCreatedItem] = useState(null);
  const [showForm, setShowForm] = useState(true);

  const handleChange = (e) => {
    const { name, value, type, checked, multiple, options } = e.target;

    if (multiple) {
      const selected = Array.from(options)
        .filter(o => o.selected)
        .map(o => o.value);

      setFormData(prev => ({
        ...prev,
        [name]: selected
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: type === 'checkbox' ? checked : value
      }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const payload = {
        ...formData,
        min_temp: Number(formData.min_temp),
        max_temp: Number(formData.max_temp),
        colors: formData.colors,
        styles: formData.styles ? [formData.styles] : []
      };

      console.log('Submitting payload:', payload);

      const res = await axios.post(`${URL}/clothing`, payload);

      if (res.data.error) {
        setMessage(`Error: ${res.data.error}`);
        setJustCreatedItem(null);
        return;
      }

      setMessage(`Item created: ${res.data.name}`);

      setJustCreatedItem({
        name: res.data.name,
        type: res.data.type
      });

      setShowForm(false);

      setFormData({
        name: '',
        imageUrl: '',
        min_temp: '',
        max_temp: '',
        colors: [],
        styles: '',
        type: 'top',
        spring: false,
        summer: false,
        autumn: false,
        winter: false,
        username: localStorage.getItem('user')
      });

    } catch (err) {
      console.error(err);
      setMessage('Error submitting form');
      setJustCreatedItem(null);
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
            <label>
              Name:
              <input
                name="name"
                value={formData.name}
                onChange={handleChange}
                required
              />
            </label>

            <div className="image-upload-section">
              <span>Image URL:</span>

              <UploadImages
                setFormData={setFormData}
                formData={formData}
              />

              {formData.imageUrl && (
                <img
                  src={formData.imageUrl}
                  alt="Clothing"
                  className="uploaded-image-preview"
                />
              )}
            </div>

            <label>
              Min Temp:
              <input
                name="min_temp"
                type="number"
                value={formData.min_temp}
                onChange={handleChange}
                required
              />
            </label>

            <label>
              Max Temp:
              <input
                name="max_temp"
                type="number"
                value={formData.max_temp}
                onChange={handleChange}
                required
              />
            </label>

            <label>
              Colors:
              <select
                name="colors"
                multiple
                value={formData.colors}
                onChange={handleChange}
              >
                {colorOptions.map(color => (
                  <option key={color} value={color}>
                    {color}
                  </option>
                ))}
              </select>
            </label>

            <label>
              Style:
              <select
                name="styles"
                value={formData.styles}
                onChange={handleChange}
                required
              >
                <option value="">Select a style</option>
                {styleOptions.map(style => (
                  <option key={style} value={style}>
                    {style}
                  </option>
                ))}
              </select>
            </label>

            <label>
              Type:
              <select
                name="type"
                value={formData.type}
                onChange={handleChange}
              >
                <option value="top">Top</option>
                <option value="bottom">Bottom</option>
                <option value="outer">Outer</option>
                <option value="onepiece">Onepiece</option>
              </select>
            </label>

            <div className="season-checkboxes">
              <label>
                <input
                  type="checkbox"
                  name="spring"
                  checked={formData.spring}
                  onChange={handleChange}
                />
                Spring
              </label>

              <label>
                <input
                  type="checkbox"
                  name="summer"
                  checked={formData.summer}
                  onChange={handleChange}
                />
                Summer
              </label>

              <label>
                <input
                  type="checkbox"
                  name="autumn"
                  checked={formData.autumn}
                  onChange={handleChange}
                />
                Autumn
              </label>

              <label>
                <input
                  type="checkbox"
                  name="winter"
                  checked={formData.winter}
                  onChange={handleChange}
                />
                Winter
              </label>
            </div>

            <button type="submit" className="submit-button">
              Add Item
            </button>
          </form>

          {message && (
            <p className="message-text">{message}</p>
          )}
        </div>
      ) : (
        <div className="item-created-section">

          <button
            className="regular-button"
            onClick={handleAddNewItem}
          >
            Add New Item
          </button>

          {justCreatedItem && (
            <div className="new-match-section">
              <ViewNewMatches
                newItemName={justCreatedItem.name}
                newItemType={justCreatedItem.type}
              />
            </div>
          )}

        </div>
      )}
    </div>
  );
};

export default CreateClothes;
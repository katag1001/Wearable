import React, { useState } from "react";
import { tagOptions } from "../../constants/optionsBank";

import DeletePopup from "../general/deletePopup.jsx";

import "./viewClothes.css";
import "../../styles/pagesBottom.css";
import "../../styles/pages.css";

import { URL } from "../../config";

const ViewClothes = ({
  items = [],
  onEdit,
  refresh,
  setError,
}) => {
  const [deleteItem, setDeleteItem] = useState(null);
  const [deleting, setDeleting] = useState(false);

  const getToken = () => localStorage.getItem("token");

  const getTagImages = (tags = []) => {
    return tagOptions.filter((tag) =>
      tags.includes(tag.name)
    );
  };

  const handleDelete = (id) => {
    setDeleteItem(id);
  };

  const confirmDelete = async () => {
    if (!deleteItem) return;

    setDeleting(true);

    try {
      const token = getToken();

      if (!token) {
        setError?.("No user logged in");
        return;
      }

      const response = await fetch(
        `${URL}/clothing/${deleteItem}`,
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const data = await response.json();

      if (data.error) {
        setError?.(data.error);
      } else {
        setDeleteItem(null);
        refresh();
      }
    } catch (error) {
      setError?.("Failed to delete item");
    } finally {
      setDeleting(false);
    }
  };

  return (
    <>
      {items.length === 0 && (
        <p className="no-clothing-items">
          No clothes found.
        </p>
      )}

      <div className="clothes-area-wrapper">
        <div className="clothes-grid">
          {items.map((item) => (
            <div
              key={item._id}
              className="clothing-card-viewclothes"
              onClick={() => onEdit(item)}
            >

              {/* Image + Hover Tags */}
            <div className="clothing-image-wrapper">

              {item.imageUrl && (
                <img
                  src={item.imageUrl}
                  alt={item.name || "Clothing item"}
                  className="clothing-image-viewclothes"
                />
              )}

              <div className="hover-tags-row">
                {getTagImages(item.tags).map((tag) => (
                  <img
                    key={tag.name}
                    src={tag.image}
                    alt={tag.name}
                    className="hover-tag-image"
                  />
                ))}
              </div>

            </div>


              {/* Name */}
              <div className="clothing-item-name">
                {item.name}
              </div>

              {/* Delete Button */}
              <div className="clothing-card-button-row">
                <button
                  className="clothing-text-button delete-button"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleDelete(item._id);
                  }}
                >
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      <DeletePopup
        isOpen={!!deleteItem}
        title="Delete Clothing Item"
        message="Are you sure you want to delete this item?"
        loading={deleting}
        onConfirm={confirmDelete}
        onClose={() => {
          if (!deleting) {
            setDeleteItem(null);
          }
        }}
      />
    </>
  );
};

export default ViewClothes;

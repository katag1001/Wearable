import React, { useState } from "react";

import DeletePopup from "../general/deletePopup.jsx";
import FavouriteHeartButton from "../general/favouriteHeartButton.jsx";

import "./viewClothes.css";
import "../../styles/pagesBottom.css";
import "../../styles/pages.css";

import { getImageUrl } from "@core/utils/getImageUrl.js";
import { useItemFavourite } from "@core/hooks/useItemFavourite.js";

// The heart on one clothing card (outfits with a favourite item score higher).
const ClothingFavouriteHeart = ({ item, onToggled, onError }) => {
  const { favourite, toggleFavourite } = useItemFavourite({
    item,
    onToggled,
    onError,
  });

  return (
    <FavouriteHeartButton favourite={favourite} onToggle={toggleFavourite} />
  );
};

// onDelete(id) deletes the item and resolves to true if it worked (the
// page refreshes and shows any error) - e.g. useWardrobePage.deleteItem.
const ViewClothes = ({
  items = [],
  onEdit,
  onDelete,
  // Footwear reuses these cards with its own wording.
  emptyText = "No clothes found.",
  deleteTitle = "Delete Clothing Item",
  // Given only for clothes (not footwear): shows the favourite heart.
  // onFavouriteToggled(id, favourite) after a save; onFavouriteError(message).
  onFavouriteToggled,
  onFavouriteError,
}) => {
  const [deleteItem, setDeleteItem] = useState(null);
  const [deleting, setDeleting] = useState(false);

  const handleDelete = (id) => {
    setDeleteItem(id);
  };

  const confirmDelete = async () => {
    if (!deleteItem) return;

    setDeleting(true);

    const deleted = await onDelete(deleteItem);

    setDeleting(false);

    if (deleted) {
      setDeleteItem(null);
    }
  };

  return (
    <>
      {items.length === 0 && (
        <p className="no-items-text">
          {emptyText}
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

              {/* Image */}
            <div className="clothing-image-wrapper">

              {onFavouriteToggled && (
                <ClothingFavouriteHeart
                  item={item}
                  onToggled={onFavouriteToggled}
                  onError={onFavouriteError}
                />
              )}

              {item.imageUrl && (
                <img
                  src={getImageUrl(item.imageUrl, 400)}
                  alt={item.name || "Clothing item"}
                  className="clothing-image-viewclothes"
                  width="150"
                  height="180"
                  loading="lazy"
                  decoding="async"
                />
              )}
            </div>

            <div className="clothing-text">
              
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

            </div>
          ))}
        </div>
      </div>

      <DeletePopup
        isOpen={!!deleteItem}
        title={deleteTitle}
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

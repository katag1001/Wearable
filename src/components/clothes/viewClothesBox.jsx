import React from "react";
import "./viewClothes.css";

const ViewClothesBox = ({
  item,
  type,
  getSeasons,
  onEdit,
  onDelete,
}) => {
  return (
    <div className="clothing-card-viewclothes">
      {item.imageUrl && (
        <img
          src={item.imageUrl}
          alt={item.name || "Clothing item"}
          className="clothing-image-viewclothes"
        />
      )}

      <div className="clothing-details-viewclothes">
        <div className="item-name">
          {item.name}
        </div>

        <div className="item-info">
          <div>
            {getSeasons(item)}
          </div>

          <div>
            {item.min_temp}° - {item.max_temp}°
          </div>
        </div>

        <div className="button-row">
          <button
            className="text-button"
            onClick={() => onEdit(item)}
          >
            Edit
          </button>

          <button
            className="text-button"
            onClick={() => onDelete(type, item._id)}
          >
            Delete
          </button>
        </div>
      </div>
    </div>
  );
};

export default ViewClothesBox;
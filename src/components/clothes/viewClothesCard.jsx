import React from "react";
import "./viewClothesCard.css";
import { tagOptions } from "../../constants/optionsBank";

const ViewClothesCard = ({
  item,
  type,
  getSeasons,
  onEdit,
  onDelete,
}) => {

  const tagImageMap = Object.fromEntries(
  tagOptions.map(tag => [tag.name, tag.image])
);

console.log({
  name: item.name,
  tags: item.tags,
  item
});

  return (
    <div className="clothing-card-viewclothes">

      {/* Image */}
      {item.imageUrl && (
        <img
          src={item.imageUrl}
          alt={item.name || "Clothing item"}
          className="clothing-image-viewclothes"
        />
      )}

      {/* Details*/}
      <div className="clothing-details-viewclothes">

        {/* Name */}
        <div className="clothing-item-name">
          {item.name}
        </div>

        {/* Item info */}
        <div className="clothing-item-info">
          <div>
            {getSeasons(item)}
          </div>

          <div>
            {item.min_temp}° - {item.max_temp}°
          </div>

          <div>
            {item.tags?.length > 0 && (
              <div className="clothing-tags">
                {item.tags.map(tag => (
                  tagImageMap[tag] && (
                    <img
                      key={tag}
                      src={tagImageMap[tag]}
                      alt={tag}
                      title={tag}
                      className="clothing-tag-icon"
                    />
                  )
                ))}
              </div>
            )}
          </div>

        </div>

        {/* Buttons*/}
        <div className="clothing-card-button-row">
          <button
            className="clothing-text-button"
            onClick={() => onEdit(item)}
          >
            Edit
          </button>

          <button
            className="clothing-text-button"
            onClick={() => onDelete(type, item._id)}
          >
            Delete
          </button>
        </div>


      </div>
    </div>
  );
};

export default ViewClothesCard;
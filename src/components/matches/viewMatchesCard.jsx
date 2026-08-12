import React from "react";
import "./viewMatchesCard.css";
import { tagOptions } from "../../constants/optionsBank";

const ViewMatchesCard = ({
match,
  renderItemImage,
  capitalize,
  handleDelete,
  setEditingMatch,
}) => {


  const renderMatchTags = () => {

    if (!match.tags?.length)
      return null;


    return (
      <div className="match-tags">

        {match.tags.map((tagName) => {

          const tag = tagOptions.find(
            (option) =>
              option.name === tagName
          );


          return (
            tag && (
              <img
                key={tagName}
                src={tag.image}
                alt={tagName}
                title={tagName}
                className="match-tag-icon"
              />
            )
          );

        })}

      </div>
    );

  };


  return (

    <div className="match-card">

      <div className="match-images">

        {(match.clothes || []).map((item) => (

          <React.Fragment key={item._id}>

            {renderItemImage(item)}

          </React.Fragment>

        ))}

      </div>

      <div className="match-info">

        <div className="item-info">

          <div>

            {["spring", "summer", "autumn", "winter"]
              .filter((season) => match[season])
              .map(capitalize)
              .join(", ") || "N/A"}

          </div>

          <div>
            {renderMatchTags()}
          </div>

        </div>

        <div className="match-items-button-row">

          <button
            className="match-text-button"
            onClick={() => handleDelete(match._id)}
          >
            Delete
          </button>

          <button
            className="match-text-button"
            onClick={() =>
              setEditingMatch(match)
            }
          >
            Edit
          </button>

        </div>

      </div>

    </div>

  );

};

export default ViewMatchesCard;

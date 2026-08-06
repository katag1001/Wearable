import React, { useState } from "react";
import axios from "axios";

import DeletePopup from "../general/deletePopup.jsx";

import { tagOptions } from "../../constants/optionsBank";
import { URL } from "../../config";

import "./viewMatchesCard.css";
import "../../styles/pagesBottom.css";
import "../../styles/pages.css";

const ViewMatches = ({
  matches = [],
  onEdit,
  refresh,
  setError,
}) => {
  const [deleteMatch, setDeleteMatch] = useState(null);
  const [deleting, setDeleting] = useState(false);

  const getToken = () =>
    localStorage.getItem("token");

  const handleDelete = (id) => {
    setDeleteMatch(id);
  };

  const confirmDelete = async () => {
    if (!deleteMatch) return;

    setDeleting(true);

    try {
      const token = getToken();

      if (!token) {
        setError?.("No user logged in");
        return;
      }

      await axios.delete(
        `${URL}/match/${deleteMatch}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      setDeleteMatch(null);
      refresh();
    } catch (err) {
      setError?.("Failed to delete match");
    } finally {
      setDeleting(false);
    }
  };

  const renderItemImage = (item) => {
    if (!item?.imageUrl) return null;

    return (
      <div>
        <img
          src={item.imageUrl}
          alt={item.name}
          className="match-image"
        />
      </div>
    );
  };

  const renderMatchTags = (match) => {
    if (!match.tags?.length) return null;

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

  const capitalize = (word) =>
    word.charAt(0).toUpperCase() +
    word.slice(1);

  return (
    <>
      {matches.length === 0 && (
        <p className="no-matches-text">
          No outfits found.
        </p>
      )}

      <div className="bottom-area-wrapper">
        <div className="items-grid">
          {matches.map((match) => (
            <div
              className="match-card"
              key={match._id}
            >
              <div className="match-images">
                {(match.clothes || []).map(
                  (item) => (
                    <React.Fragment
                      key={item._id}
                    >
                      {renderItemImage(item)}
                    </React.Fragment>
                  )
                )}
              </div>

              <div className="match-info">
                <div className="item-info">
                  <div>
                    {match.min_temp}° -{" "}
                    {match.max_temp}°
                  </div>

                  <div>
                    {[
                      "spring",
                      "summer",
                      "autumn",
                      "winter",
                    ]
                      .filter(
                        (season) =>
                          match[season]
                      )
                      .map(capitalize)
                      .join(", ") || "N/A"}
                  </div>

                  <div>
                    {renderMatchTags(match)}
                  </div>
                </div>

                <div className="match-items-button-row">
                  <button
                    className="match-text-button"
                    onClick={() =>
                      handleDelete(match._id)
                    }
                  >
                    Delete
                  </button>

                  <button
                    className="match-text-button"
                    onClick={() =>
                      onEdit(match)
                    }
                  >
                    Edit
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      <DeletePopup
        isOpen={!!deleteMatch}
        title="Delete Outfit"
        message="Are you sure you want to delete this outfit?"
        loading={deleting}
        onConfirm={confirmDelete}
        onClose={() => {
          if (!deleting) {
            setDeleteMatch(null);
          }
        }}
      />
    </>
  );
};

export default ViewMatches;

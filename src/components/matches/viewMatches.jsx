import React, { useState } from "react";
import axios from "axios";

import DeletePopup from "../general/deletePopup.jsx";
import ViewMatchesCard from "./viewMatchesCard.jsx";

import { URL } from "../../config";

import "./viewMatches.css";
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

  // Keeps track of the single card that is currently expanded.
  const [expandedMatchId, setExpandedMatchId] = useState(null);

  const getToken = () =>
    localStorage.getItem("token");

  /*
   * Open delete confirmation
   */
  const handleDelete = (id) => {
    setDeleteMatch(id);
  };

  /*
   * Confirm delete
   */
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

      // Close any expanded card after deletion.
      setExpandedMatchId(null);

      refresh();
    } catch (err) {
      console.error("Delete error:", err);
      setError?.("Failed to delete match");
    } finally {
      setDeleting(false);
    }
  };

  return (
    <>
      {matches.length === 0 && (
        <p className="no-matches-text">
          No outfits found.
        </p>
      )}

      <div className="matches-area-wrapper">
        <div className="matches-grid">
          {matches.map((match) => (
            <ViewMatchesCard
              key={match._id}
              match={match}

              /*
               * Only one card can be expanded at a time.
               * When another card calls onExpand, this ID changes
               * and the previously expanded card automatically
               * receives isExpanded={false}.
               */
              isExpanded={
                expandedMatchId === match._id
              }

              onExpand={() =>
                setExpandedMatchId(match._id)
              }

              onCollapse={() =>
                setExpandedMatchId(null)
              }

              onDelete={handleDelete}
              refresh={refresh}
              setError={setError}
            />
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

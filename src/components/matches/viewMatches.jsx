import React, { useState } from "react";
import axios from "axios";

import DeletePopup from "../general/deletePopup.jsx";
import ViewMatchesCard from "./viewMatchesCard.jsx";
import MatchSelectionBar from "./matchSelectionBar.jsx";
import { useMatchSelection } from "./useMatchSelection.js";

import { URL } from "../../config";

import "./viewMatches.css";
import "../../styles/pagesBottom.css";
import "../../styles/pages.css";

const ViewMatches = ({
  matches = [],
  onEdit,
  refresh,
  editable = true,
  setError,
  onFavouriteToggle,
}) => {
  // The outfit ids waiting on the delete confirmation - one from a
  // card's Delete button, or every ticked outfit from the bin.
  const [pendingDeleteIds, setPendingDeleteIds] = useState(null);
  const [deleting, setDeleting] = useState(false);

  // Keeps track of the single card that is currently expanded.
  const [expandedMatchId, setExpandedMatchId] = useState(null);

  const {
    selectedIds,
    toggleSelected,
    clearSelection,
  } = useMatchSelection(matches);

  const getToken = () =>
    localStorage.getItem("token");

  /*
   * Open delete confirmation for one outfit
   */
  const handleDelete = (id) => {
    setPendingDeleteIds([id]);
  };

  /*
   * Open delete confirmation for every ticked outfit
   */
  const handleDeleteSelected = () => {
    setPendingDeleteIds([...selectedIds]);
  };

  /*
   * Send the delete - the single route for one outfit,
   * the delete-many route for several.
   */
  const requestDelete = (ids, token) => {
    const headers = {
      Authorization: `Bearer ${token}`,
    };

    if (ids.length === 1) {
      return axios.delete(`${URL}/match/${ids[0]}`, { headers });
    }

    return axios.delete(`${URL}/match/`, {
      headers,
      data: { ids },
    });
  };

  /*
   * Confirm delete
   */
  const confirmDelete = async () => {
    if (!pendingDeleteIds?.length) return;

    const ids = pendingDeleteIds;

    // Close the modal straight away - the delete carries on in the background.
    setPendingDeleteIds(null);
    setDeleting(true);

    try {
      const token = getToken();

      if (!token) {
        setError?.("No user logged in");
        return;
      }

      await requestDelete(ids, token);

      // Close any expanded card and drop the ticks after deletion.
      setExpandedMatchId(null);
      clearSelection();

      refresh();
    } catch (err) {
      console.error("Delete error:", err);
      setError?.(
        ids.length === 1
          ? "Failed to delete match"
          : "Failed to delete matches"
      );
    } finally {
      setDeleting(false);
    }
  };

  const pendingCount = pendingDeleteIds?.length ?? 0;

  return (
    <>
      {matches.length === 0 && (
        <p className="no-items-text">
          No outfits found.
        </p>
      )}

      <div className="matches-area-wrapper">
        {editable && (
          <MatchSelectionBar
            count={selectedIds.size}
            onClear={clearSelection}
            onDelete={handleDeleteSelected}
            disabled={deleting}
          />
        )}

        <div className="matches-grid">
          {matches.map((match) => (
            <ViewMatchesCard
                key={match._id}
                match={match}
                isExpanded={
                  editable &&
                  expandedMatchId === match._id
                }
                onExpand={
                  editable
                    ? () => setExpandedMatchId(match._id)
                    : undefined
                }
                onCollapse={
                  editable
                    ? () => setExpandedMatchId(null)
                    : undefined
                }
                onDelete={handleDelete}
                refresh={refresh}
                setError={setError}
                editable={editable}
                onFavouriteToggle={onFavouriteToggle}
                isSelected={selectedIds.has(match._id)}
                onToggleSelect={toggleSelected}
              />

          ))}
        </div>
      </div>

      <DeletePopup
        isOpen={pendingCount > 0}
        title={
          pendingCount > 1
            ? "Delete Outfits"
            : "Delete Outfit"
        }
        message={
          pendingCount > 1
            ? `Are you sure you want to delete ${pendingCount} outfits?`
            : "Are you sure you want to delete this outfit?"
        }
        loading={deleting}
        onConfirm={confirmDelete}
        onClose={() => {
          if (!deleting) {
            setPendingDeleteIds(null);
          }
        }}
      />
    </>
  );
};

export default ViewMatches;

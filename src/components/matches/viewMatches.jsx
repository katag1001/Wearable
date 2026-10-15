import React, { useState } from "react";

import DeletePopup from "../general/deletePopup.jsx";
import ViewMatchesCard from "./viewMatchesCard.jsx";
import MatchSelectionBar from "./matchSelectionBar.jsx";
import { useMatchSelection } from "@core/hooks/useMatchSelection.js";

import "./viewMatches.css";
import "../../styles/pagesBottom.css";
import "../../styles/pages.css";

// onDeleteMatches(ids) deletes and resolves to true if it worked (the
// page refreshes and shows any error) - useMatchesPage.deleteMatches.
// Only needed when `editable`.
const ViewMatches = ({
  matches = [],
  refresh,
  editable = true,
  setError,
  onFavouriteToggle,
  onDeleteMatches,
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
   * Confirm delete
   */
  const confirmDelete = async () => {
    if (!pendingDeleteIds?.length) return;

    const ids = pendingDeleteIds;

    // Close the modal straight away - the delete carries on in the background.
    setPendingDeleteIds(null);
    setDeleting(true);

    const deleted = await onDeleteMatches(ids);

    if (deleted) {
      // Close any expanded card and drop the ticks after deletion.
      setExpandedMatchId(null);
      clearSelection();
    }

    setDeleting(false);
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

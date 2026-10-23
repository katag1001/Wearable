import { useState } from "react";

import { sendMismatch } from "../api/matches.js";
import { getErrorMessage } from "../api/errors.js";
import { useMismatchPicker } from "./useMismatchPicker.js";

/*
 * The broken heart on an outfit's expanded card (web) / outfit screen
 * (mobile): straight to picking the two items that don't go together.
 * Confirming does what Mismatch on Today does - the items are never
 * matched again, and every outfit with both is deleted apart from
 * favourites and user-built ones (server/services/mismatchService.js).
 *
 * `onMismatched(deletedMatchIds)` runs once saved; a failed save stays
 * open and calls `onError(message)`.
 */
export const useOutfitMismatch = ({ match, onMismatched, onError }) => {
  const [clothes] = useState(() => match?.clothes ?? []);
  const picker = useMismatchPicker(clothes);
  const [saving, setSaving] = useState(false);

  const confirm = async () => {
    if (saving || !picker.isComplete || !match?._id) return;

    setSaving(true);

    try {
      const { deletedMatchIds = [] } = await sendMismatch(match._id, picker.selectedIds);
      setSaving(false);
      onMismatched?.(deletedMatchIds);
    } catch (err) {
      setSaving(false);
      onError?.(`Couldn't save that: ${getErrorMessage(err, err.message)}`);
    }
  };

  return {
    clothes,
    saving,
    isSelected: picker.isSelected,
    toggleItem: picker.toggleItem,
    canConfirm: picker.isComplete,
    confirm,
  };
};

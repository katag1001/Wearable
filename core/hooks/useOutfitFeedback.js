import { useState } from "react";

import { tightsItemOf } from "../matches/tights.js";
import {
  MISMATCH_ITEM_COUNT,
  NO_TIGHTS_ITEM,
  NO_TIGHTS_OUTFIT,
  TOO_COLD,
  TOO_HOT,
} from "../today/outfitFeedback.js";

/*
 * The broken heart's screen on the Today page, for the outfit on screen
 * when it opened: "too hot", "too cold", "mismatch" - which goes on to
 * picking the two clothing items that don't go together (shoes aren't
 * part of an outfit, so they're never offered) - and, for an outfit on
 * today's list thanks to tights, "can't wear this with tights" - which
 * goes on to choosing this outfit or its skirt, dress or shorts. Shared by
 * the web popup and the mobile screen.
 *
 * Each action closes the screen (`onClose`) once saved, and today's list
 * moves on to the next outfit. A failed save stays open, with useToday's
 * error notice.
 *
 * `today`: useToday (or useTodayLook).
 */
export const useOutfitFeedback = ({ today, onClose }) => {
  // Fixed when the screen opens.
  const [outfit] = useState(today.selectedOutfit);
  const matchId = outfit?.matchId?._id;
  const clothes = outfit?.matchId?.clothes ?? [];

  // "Can't wear this with tights" - only offered when the card says "Wear
  // with tights".
  const offersTights = Boolean(outfit?.withTights);
  const tightsItem = tightsItemOf(clothes) ?? null;

  // "choose" (the options), "mismatch" (picking the two items) or
  // "tights" (this outfit, or its skirt / dress / shorts).
  const [step, setStep] = useState("choose");

  // Which action is saving (TOO_HOT, TOO_COLD, "mismatch",
  // NO_TIGHTS_OUTFIT or NO_TIGHTS_ITEM), or null.
  const [saving, setSaving] = useState(null);

  // A two-item outfit starts with both picked.
  const [selectedIds, setSelectedIds] = useState(() =>
    clothes.length === MISMATCH_ITEM_COUNT ? clothes.map((item) => item._id) : []
  );

  const run = async (action, save) => {
    if (saving || !matchId) return;

    setSaving(action);
    const saved = await save();
    setSaving(null);

    if (saved) onClose();
  };

  // A third pick replaces the oldest.
  const toggleItem = (itemId) =>
    setSelectedIds((prev) => {
      if (prev.includes(itemId)) {
        return prev.filter((id) => id !== itemId);
      }

      return [...prev, itemId].slice(-MISMATCH_ITEM_COUNT);
    });

  return {
    outfit,
    clothes,
    step,
    saving,

    tooHot: () => run(TOO_HOT, () => today.giveTemperatureFeedback(matchId, TOO_HOT)),
    tooCold: () => run(TOO_COLD, () => today.giveTemperatureFeedback(matchId, TOO_COLD)),

    offersTights,
    tightsItem,
    startTights: () => setStep("tights"),
    noTightsForOutfit: () =>
      run(NO_TIGHTS_OUTFIT, () => today.giveTightsFeedback(matchId, NO_TIGHTS_OUTFIT)),
    noTightsForItem: () =>
      run(NO_TIGHTS_ITEM, () => today.giveTightsFeedback(matchId, NO_TIGHTS_ITEM)),

    startMismatch: () => setStep("mismatch"),
    backToChoices: () => setStep("choose"),

    selectedIds,
    isSelected: (itemId) => selectedIds.includes(itemId),
    toggleItem,
    canConfirmMismatch: selectedIds.length === MISMATCH_ITEM_COUNT,
    confirmMismatch: () => {
      if (selectedIds.length !== MISMATCH_ITEM_COUNT) return;

      run("mismatch", () => today.markMismatch(matchId, selectedIds));
    },
  };
};

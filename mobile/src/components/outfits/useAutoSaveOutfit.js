// Saves an outfit's details as they're changed, instead of with a Save
// button: a moment after the last change (so dragging the temperature
// slider saves once, at the end), and straight away if the screen is left
// with a change still waiting. The draft the editor opens with isn't
// saved - only changes to it.
//
// `card` is useMatchCard, editing. onSaved(fields) after each save (the
// fields that changed, plus the new rating and score if it was rated);
// onDeleted({ leaving }) if the rating deleted the outfit - `leaving` when
// the screen has already gone.

import { useEffect, useRef } from "react";

import { buildMatchUpdate } from "@core/matches/matchFields.js";

const DELAY_MS = 600;

export const useAutoSaveOutfit = ({ card, onSaved, onDeleted }) => {
  const timer = useRef(null);
  const pending = useRef(false);
  const opened = useRef(false);

  // Saving reads the latest card and callbacks, whenever it runs.
  const latest = useRef({});
  latest.current = { card, onSaved, onDeleted };

  const saveNow = async ({ leaving = false } = {}) => {
    pending.current = false;

    const { card: current, onSaved: saved, onDeleted: deleted } = latest.current;
    if (!current.draft) return;

    const fields = buildMatchUpdate(current.draft);
    const result = await current.save({ keepEditing: true });

    if (!result) return;

    if (result.deleted) {
      deleted({ leaving });
    } else {
      saved(
        result.rating != null
          ? { ...fields, rating: result.rating, score: result.score }
          : fields
      );
    }
  };

  useEffect(() => {
    if (!card.draft) return;

    // The draft as the editor opened - nothing changed yet.
    if (!opened.current) {
      opened.current = true;
      return;
    }

    pending.current = true;
    clearTimeout(timer.current);
    timer.current = setTimeout(saveNow, DELAY_MS);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [card.draft]);

  // Leaving with a change still waiting saves it now.
  useEffect(
    () => () => {
      clearTimeout(timer.current);
      if (pending.current) saveNow({ leaving: true });
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    []
  );
};

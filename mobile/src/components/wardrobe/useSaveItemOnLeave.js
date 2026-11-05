// Saves an existing item's changes when the screen is left (back button,
// back gesture), instead of with a Save button. Leaving waits for the save,
// so the wardrobe list refreshes with it. Nothing changed - it just goes.
// If it can't be saved (a missing field, an error), it asks whether to
// keep editing or leave without the changes.
//
// `form` is useWardrobeItemForm for an existing item. `enabled={false}`
// lets the screen go without saving (e.g. after deleting the item).

import { useState } from "react";
import { usePreventRemove } from "expo-router";
import { Alert } from "react-native";

// The fields as they'd be saved. `styles` is left out: it's worked out
// from the colours, so it can change without the user changing anything.
const savedFields = ({ styles, ...fields }) => JSON.stringify(fields);

export const useSaveItemOnLeave = ({ form, enabled = true }) => {
  const [opened] = useState(() => savedFields(form.formData));
  // Set once the screen may go (saved, or the changes are let go).
  const [leaving, setLeaving] = useState(false);

  const changed =
    !!form.selectedImage || savedFields(form.formData) !== opened;

  usePreventRemove(enabled && changed && !leaving, async ({ repeat }) => {
    const leave = () => {
      setLeaving(true);
      repeat();
    };

    if (await form.save()) {
      leave();
      return;
    }

    Alert.alert(
      "Couldn't save",
      "Your changes to this item couldn't be saved.",
      [
        { text: "Keep editing", style: "cancel" },
        { text: "Leave without saving", style: "destructive", onPress: leave },
      ]
    );
  });
};
